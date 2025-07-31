// src/components/orderbook/DepthChart.tsx
"use client";

import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { OrderbookLevel } from '@/store/orderbookStore';
import { useTheme } from '@/app/providers/theme-provider';

interface TooltipPayload {
  dataKey: string;
  value: number;
  payload: {
    price: number;
    bids: number;
    asks: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const bids = payload.find((p) => p.dataKey === 'bids')?.value;
    const asks = payload.find((p) => p.dataKey === 'asks')?.value;
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm shadow-md">
        <p className="font-bold text-gray-900 dark:text-gray-100">{`Price: ${typeof label === 'number' ? label.toFixed(2) : label}`}</p>
        {bids && bids > 0 && <p className="text-green-600 dark:text-green-400">{`Cumulative Bids: ${bids.toFixed(4)}`}</p>}
        {asks && asks > 0 && <p className="text-red-600 dark:text-red-400">{`Cumulative Asks: ${asks.toFixed(4)}`}</p>}
      </div>
    );
  }
  return null;
};


export const DepthChart = ({ bids, asks }: { bids: OrderbookLevel[], asks: OrderbookLevel[] }) => {
  const { theme } = useTheme();

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
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
            Awaiting data for depth chart...
        </div>
    )
  }

  const tickColor = theme === 'dark' ? '#6B7280' : '#4B5563';

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAsks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="price" 
            type="number" 
            domain={['dataMin', 'dataMax']} 
            tickFormatter={(price) => price.toFixed(0)}
            stroke={tickColor}
            fontSize={12}
          />
          <YAxis 
            orientation="right" 
            stroke={tickColor}
            fontSize={12}
            tickFormatter={(value) => (value > 1000 ? `${(value/1000).toFixed(0)}k` : value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="step" dataKey="bids" strokeWidth={2} stroke="#16A34A" fill="url(#colorBids)" />
          <Area type="step" dataKey="asks" strokeWidth={2} stroke="#DC2626" fill="url(#colorAsks)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
