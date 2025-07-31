// src/store/orderbookStore.ts
import { create } from 'zustand';

export type OrderbookLevel = [string, string, string, string]; // [price, quantity, cumulative quantity, number of orders]

export interface SimulatedOrder {
  price: number;
  quantity: number;
  side: 'Buy' | 'Sell';
}

/**
 * A helper function to apply updates to an order book.
 * @param currentBook The current array of bids or asks.
 * @param updates The new levels to be applied from a delta message.
 * @returns A new, updated array for the order book side.
 */
const applyUpdates = (currentBook: OrderbookLevel[], updates: OrderbookLevel[]): OrderbookLevel[] => {
  const bookMap = new Map(currentBook.map(level => [level[0], level]));

  updates.forEach(update => {
    const price = update[0];
    const quantity = parseFloat(update[1]);

    if (quantity === 0) {
      bookMap.delete(price); // Remove the level if quantity is zero
    } else {
      bookMap.set(price, update); // Add or update the level
    }
  });

  // Convert map back to array and sort it
  const newBook = Array.from(bookMap.values());
  // Bids should be sorted descending, asks ascending
  newBook.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
  
  return newBook;
};


interface OrderbookState {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  isConnected: boolean;
  selectedVenue: 'OKX' | 'Bybit' | 'Deribit';
  selectedSymbol: string;
  simulatedOrder: SimulatedOrder | null;

  // Actions
  setConnectionStatus: (status: boolean) => void;
  setSelectedVenue: (venue: 'OKX' | 'Bybit' | 'Deribit') => void;
  setSelectedSymbol: (symbol: string) => void;
  processSnapshot: (data: { bids: OrderbookLevel[], asks: OrderbookLevel[] }) => void; // For initial data
  processUpdate: (data: { bids: OrderbookLevel[], asks: OrderbookLevel[] }) => void; // For subsequent updates
  clearOrderbook: () => void;
  setSimulatedOrder: (order: SimulatedOrder | null) => void;
}

export const useOrderbookStore = create<OrderbookState>((set) => ({
  bids: [],
  asks: [],
  isConnected: false,
  selectedVenue: 'OKX',
  selectedSymbol: 'BTC-USD',
  simulatedOrder: null,

  setConnectionStatus: (status) => set({ isConnected: status }),
  setSelectedVenue: (venue) => set({ selectedVenue: venue, simulatedOrder: null }),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol, simulatedOrder: null, bids: [], asks: [] }),
  
  // Action to handle the initial full snapshot of the order book
  processSnapshot: (data) => set({ bids: data.bids, asks: data.asks }),

  // Action to apply delta updates to the existing order book
  processUpdate: (data) => set((state) => ({
    bids: applyUpdates(state.bids, data.bids),
    asks: applyUpdates(state.asks, data.asks).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])), // Asks need ascending sort
  })),

  clearOrderbook: () => set({ bids: [], asks: [] }),
  setSimulatedOrder: (order) => set({ simulatedOrder: order }),
}));
