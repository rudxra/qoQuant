// src/components/orderbook/MetricsDisplay.tsx
"use client";

import React, { useMemo } from 'react';
import { useOrderbookStore } from '@/store/orderbookStore';
import { calculateMarketImpact, MarketImpactMetrics } from '@/lib/calculations';

const MetricRow = ({ label, value, unit = '' }: { label: string, value: string | number, unit?: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-base font-semibold text-white">{value} <span className="text-xs text-gray-400">{unit}</span></span>
  </div>
);

export const MetricsDisplay = () => {
  const { simulatedOrder, bids, asks } = useOrderbookStore();

  const metrics: MarketImpactMetrics | null = useMemo(() => {
    if (!simulatedOrder) return null;

    if (simulatedOrder.price > 0) {
      return {
        estimatedFillPrice: simulatedOrder.price,
        slippage: 0,
        fillPercentage: 100,
        marketImpact: simulatedOrder.price * simulatedOrder.quantity,
      };
    }

    const bookToWalk = simulatedOrder.side === 'Buy' ? asks : bids;
    return calculateMarketImpact(simulatedOrder, bookToWalk);

  }, [simulatedOrder, bids, asks]);

  if (!metrics) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4 text-white">Impact Metrics</h2>
        <p className="text-gray-400 text-center py-8">Fill out the form to simulate an order and see its market impact.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4 text-white">Impact Metrics</h2>
      <div>
        <MetricRow 
          label="Est. Fill Price"
          value={metrics.estimatedFillPrice.toFixed(2)}
          unit="USD"
        />
        <MetricRow 
          label="Slippage"
          value={metrics.slippage.toFixed(4)}
          unit="%"
        />
        <MetricRow 
          label="Est. Fill Amount"
          value={`${metrics.fillPercentage.toFixed(2)}%`}
        />
         <MetricRow 
          label="Market Impact (Value)"
          value={metrics.marketImpact.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        />
      </div>
    </div>
  );
};
