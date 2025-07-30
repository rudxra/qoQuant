// src/components/orderbook/DepthChart.tsx
"use client";

import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { OrderbookLevel } from '@/store/orderbookStore';

interface ChartDataPoint {
  price: number;
  bids: number;
  asks: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const bids = payload.find((p: any) => p.dataKey === 'bids')?.value;
    const asks = payload.find((p: any) => p.dataKey === 'asks')?.value;
    return (
      <div className="bg-gray-800/80 p-2 rounded-md border border-gray-700 text-sm">
        <p className="font-bold">{`Price: ${label.toFixed(2)}`}</p>
        {bids > 0 && <p className="text-green-400">{`Cumulative Bids: ${bids.toFixed(4)}`}</p>}
        {asks > 0 && <p className="text-red-400">{`Cumulative Asks: ${asks.toFixed(4)}`}</p>}
      </div>
    );
  }
  return null;
};


export const DepthChart = ({ bids, asks }: { bids: OrderbookLevel[], asks: OrderbookLevel[] }) => {
  const chartData = useMemo(() => {
    let cumulativeBids = 0;
    const bidData = bids
      .map(level => {
        cumulativeBids += parseFloat(level[1]);
        return { price: parseFloat(level[0]), bids: cumulativeBids, asks: 0 };
      })
      .reverse();

    let cumulativeAsks = 0;
    const askData = asks.map(level => {
      cumulativeAsks += parseFloat(level[1]);
      return { price: parseFloat(level[0]), bids: 0, asks: cumulativeAsks };
    });

    return [...bidData, ...askData];
  }, [bids, asks]);

  if (!bids.length && !asks.length) {
    return (
        <div className="h-64 flex items-center justify-center text-gray-500">
            Awaiting data for depth chart...
        </div>
    )
  }

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAsks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F87171" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="price" 
            type="number" 
            domain={['dataMin', 'dataMax']} 
            tickFormatter={(price) => price.toFixed(2)}
            stroke="#9CA3AF"
          />
          <YAxis 
            orientation="right" 
            stroke="#9CA3AF"
            tickFormatter={(value) => (value > 1000 ? `${(value/1000).toFixed(1)}k` : value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="step" dataKey="bids" stroke="#10B981" fillOpacity={1} fill="url(#colorBids)" />
          <Area type="step" dataKey="asks" stroke="#F87171" fillOpacity={1} fill="url(#colorAsks)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
