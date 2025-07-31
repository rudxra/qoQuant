// src/hooks/useOrderbook.ts
import { useEffect, useRef } from 'react';
import { useOrderbookStore, OrderbookLevel } from '@/store/orderbookStore';

type Venue = 'OKX' | 'Bybit' | 'Deribit';

// Define a general type for incoming WebSocket messages to avoid 'any'
type WebSocketMessage = Record<string, any>;

const formatSymbolForVenue = (userInput: string, venue: Venue): string => {
    const parts = userInput.toUpperCase().split(/[-/]/);
    const base = parts[0];
    let quote = parts[1];
    if (!base || !quote) return 'BTC-PERPETUAL'; // Default fallback
    if (venue === 'Bybit' && quote === 'USD') quote = 'USDT';
    switch (venue) {
        case 'OKX': return `${base}-${quote}-SWAP`;
        case 'Bybit': return `${base}${quote}`;
        case 'Deribit': return `${base}-PERPETUAL`;
        default: return userInput;
    }
};

const venueConfig = {
  OKX: {
    wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
    getSubscriptionMsg: (symbol: string) => ({ op: 'subscribe', args: [{ channel: 'books', instId: symbol }] }), // Using full 'books' channel for better snapshots
    getUnsubscriptionMsg: (symbol: string) => ({ op: 'unsubscribe', args: [{ channel: 'books', instId: symbol }] }),
    getPingMsg: () => 'ping',
    parseMessage: (msg: WebSocketMessage): { type: 'snapshot' | 'update', bids: OrderbookLevel[], asks: OrderbookLevel[] } | null => {
      if (msg.data && msg.action) {
        return { type: msg.action, bids: msg.data[0].bids, asks: msg.data[0].asks };
      }
      return null;
    },
  },
  Bybit: {
    wsUrl: 'wss://stream.bybit.com/v5/public/linear',
    getSubscriptionMsg: (symbol: string) => ({ op: 'subscribe', args: [`orderbook.50.${symbol}`] }), // Using deeper orderbook
    getUnsubscriptionMsg: (symbol:string) => ({ op: 'unsubscribe', args: [`orderbook.50.${symbol}`] }),
    getPingMsg: () => ({ op: 'ping' }),
    parseMessage: (msg: WebSocketMessage): { type: 'snapshot' | 'update', bids: OrderbookLevel[], asks: OrderbookLevel[] } | null => {
      if (msg.data && msg.type) {
        const bids = msg.data.b.map((l: [string, string]) => [l[0], l[1], '0', '0']);
        const asks = msg.data.a.map((l: [string, string]) => [l[0], l[1], '0', '0']);
        return { type: msg.type === 'delta' ? 'update' : 'snapshot', bids, asks };
      }
      return null;
    },
  },
  Deribit: {
    wsUrl: 'wss://www.deribit.com/ws/api/v2',
    getSubscriptionMsg: (symbol: string) => ({ jsonrpc: '2.0', method: 'public/subscribe', params: { channels: [`book.${symbol}.100ms`] } }),
    getUnsubscriptionMsg: (symbol: string) => ({ jsonrpc: '2.0', method: 'public/unsubscribe', params: { channels: [`book.${symbol}.100ms`] } }),
    getPingMsg: () => ({ jsonrpc: '2.0', method: 'public/test', params: {} }),
    parseMessage: (msg: WebSocketMessage): { type: 'snapshot' | 'update', bids: OrderbookLevel[], asks: OrderbookLevel[] } | null => {
        if (msg.params && msg.params.data) {
            const { bids, asks, type } = msg.params.data;
            const formattedBids = bids.map((b: [string, number, number]) => [b[1].toString(), b[2].toString(), '0', '0']);
            const formattedAsks = asks.map((a: [string, number, number]) => [a[1].toString(), a[2].toString(), '0', '0']);
            return { type, bids: formattedBids, asks: formattedAsks };
        }
        return null;
    }
  },
};

export const useOrderbook = () => {
  const { selectedVenue, selectedSymbol, setConnectionStatus, processSnapshot, processUpdate, clearOrderbook } = useOrderbookStore();
  const ws = useRef<WebSocket | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const config = venueConfig[selectedVenue];
    const apiSymbol = formatSymbolForVenue(selectedSymbol, selectedVenue);

    clearOrderbook();
    setConnectionStatus(false);
    if (ws.current) ws.current.close();
    if (pingInterval.current) clearInterval(pingInterval.current);

    ws.current = new WebSocket(config.wsUrl);
    
    ws.current.onopen = () => {
      console.log(`[${selectedVenue}] WebSocket connected. Subscribing to ${apiSymbol}`);
      setConnectionStatus(true);
      ws.current?.send(JSON.stringify(config.getSubscriptionMsg(apiSymbol)));

      pingInterval.current = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(typeof config.getPingMsg() === 'string' ? config.getPingMsg() as string : JSON.stringify(config.getPingMsg()));
        }
      }, 20000);
    };

    ws.current.onmessage = (event) => {
      if (event.data === 'pong') return;
      const message = JSON.parse(event.data);

      if (message.event === 'error' || message.success === false) {
          console.error(`[${selectedVenue}] API Error:`, message.msg || message.ret_msg);
          return;
      }
      if (message.event === 'subscribe' || (message.success === true && message.op === 'subscribe')) return;
      if (message.op === 'pong' || message.method === 'heartbeat') return;

      const parsedData = config.parseMessage(message);
      if (parsedData) {
        // Use the correct store action based on the message type
        if (parsedData.type === 'snapshot') {
          processSnapshot(parsedData);
        } else {
          processUpdate(parsedData);
        }
      }
    };

    ws.current.onerror = (error) => console.error(`[${selectedVenue}] WebSocket Error:`, error);
    ws.current.onclose = () => {
      console.log(`[${selectedVenue}] WebSocket disconnected.`);
      setConnectionStatus(false);
      if (pingInterval.current) clearInterval(pingInterval.current);
    };

    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current);
      if (ws.current) {
        if (ws.current.readyState === WebSocket.OPEN) {
          try {
            ws.current.send(JSON.stringify(config.getUnsubscriptionMsg(apiSymbol)));
          } catch (e) { console.error(`[${selectedVenue}] Error unsubscribing:`, e) }
        }
        ws.current.close();
      }
    };
  }, [selectedVenue, selectedSymbol, setConnectionStatus, processSnapshot, processUpdate, clearOrderbook]);
};
