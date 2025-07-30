// src/components/orderbook/OrderbookDisplay.tsx
"use client";

import React from 'react';
import { useOrderbookStore, OrderbookLevel, SimulatedOrder } from '@/store/orderbookStore';
import { DepthChart } from './DepthChart';

const calculateCumulativeTotal = (levels: OrderbookLevel[], index: number): number => {
  return levels.slice(0, index + 1).reduce((acc, level) => acc + parseFloat(level[1]), 0);
};

const OrderbookRow = ({ price, quantity, total, type, isSimulated }: { price: string, quantity: string, total: string, type: 'bid' | 'ask', isSimulated: boolean }) => {
  const priceColor = type === 'bid' ? 'text-green-400' : 'text-red-400';
  const rowStyle = isSimulated
    ? 'bg-blue-500/20 ring-1 ring-blue-400'
    : 'border-t border-gray-800/50';

  return (
    <div className={`grid grid-cols-3 gap-2 text-sm py-1 font-mono transition-colors duration-200 ${rowStyle}`}>
      <span className={`pl-2 ${priceColor}`}>{parseFloat(price).toFixed(2)}</span>
      <span className="text-right">{quantity}</span>
      <span className="text-right pr-2 text-gray-400">{total}</span>
    </div>
  );
};

const OrderbookTable = ({
  levels,
  type,
  simulatedOrder,
}: {
  levels: OrderbookLevel[];
  type: 'bid' | 'ask';
  simulatedOrder: SimulatedOrder | null;
}) => {
  let simulatedIndex = -1;
  if (simulatedOrder && simulatedOrder.price > 0 && simulatedOrder.side.toLowerCase() === type) {
    if (type === 'bid') {
      simulatedIndex = levels.findIndex(level => parseFloat(level[0]) <= simulatedOrder.price);
    } else {
      simulatedIndex = levels.findIndex(level => parseFloat(level[0]) >= simulatedOrder.price);
    }
  }

  return (
    <div>
      <h3 className={`text-lg font-semibold mb-2 ${type === 'bid' ? 'text-green-400' : 'text-red-400'}`}>
        {type === 'bid' ? 'Bids' : 'Asks'}
      </h3>
      <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-gray-400 mb-2 px-2">
        <span>Price (USD)</span>
        <span className="text-right">Quantity (BTC)</span>
        <span className="text-right">Total (BTC)</span>
      </div>
      <div className="h-96 overflow-y-auto pr-2">
        {levels.map((level, index) => (
          <OrderbookRow
            key={level[0]}
            price={level[0]}
            quantity={level[1]}
            total={calculateCumulativeTotal(levels, index).toFixed(4)}
            type={type}
            isSimulated={index === simulatedIndex}
          />
        ))}
      </div>
    </div>
  );
};


const VenueButton = ({ venue, selectedVenue, onClick }: { venue: 'OKX' | 'Bybit' | 'Deribit', selectedVenue: string, onClick: (venue: 'OKX' | 'Bybit' | 'Deribit') => void }) => {
  const isSelected = venue === selectedVenue;
  return (
    <button
      onClick={() => onClick(venue)}
      className={`px-4 py-2 font-semibold transition-colors duration-200 ${isSelected ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
    >
      {venue}
    </button>
  );
};

export const OrderbookDisplay = () => {
  const { bids, asks, isConnected, selectedVenue, setSelectedVenue, simulatedOrder } = useOrderbookStore();

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
        <div className="flex">
          <VenueButton venue="OKX" selectedVenue={selectedVenue} onClick={setSelectedVenue} />
          <VenueButton venue="Bybit" selectedVenue={selectedVenue} onClick={setSelectedVenue} />
          <VenueButton venue="Deribit" selectedVenue={selectedVenue} onClick={setSelectedVenue} />
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-400">{isConnected ? `Connected to ${selectedVenue}` : 'Disconnected'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrderbookTable type="bid" levels={bids} simulatedOrder={simulatedOrder} />
        <OrderbookTable type="ask" levels={asks} simulatedOrder={simulatedOrder} />
      </div>
      
      <div className="mt-auto pt-4">
        <h3 className="text-lg font-semibold text-white mb-2">Market Depth</h3>
        <DepthChart bids={bids} asks={asks} />
      </div>
    </div>
  );
};
