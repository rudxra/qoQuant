// src/components/orderbook/OrderSimulationForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useOrderbookStore } from '@/store/orderbookStore';

const FormRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="grid grid-cols-3 items-center gap-4 mb-4">
    <label className="text-sm font-medium text-gray-400 col-span-1">{label}</label>
    <div className="col-span-2">
      {children}
    </div>
  </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
  />
);

const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        {...props}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
);


export const OrderSimulationForm = () => {
  const { selectedVenue, selectedSymbol, setSelectedSymbol, setSimulatedOrder } = useOrderbookStore();

  // Local state for all form inputs
  const [symbolInput, setSymbolInput] = useState(selectedSymbol);
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Limit');
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [timing, setTiming] = useState('Immediate');
  const [error, setError] = useState('');

  // Keep local symbol input in sync with global state if it changes elsewhere
  useEffect(() => {
    setSymbolInput(selectedSymbol);
  }, [selectedSymbol]);

  const handleSymbolUpdate = () => {
    if (symbolInput.trim() === '') {
        setError('Symbol cannot be empty.');
        return;
    }
    setError('');
    // Convert to uppercase and set the global state, which will trigger the data hook
    setSelectedSymbol(symbolInput.toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const priceNum = parseFloat(price);
    const quantityNum = parseFloat(quantity);

    if (!quantityNum || quantityNum <= 0) {
        setError('Please enter a valid quantity.');
        return;
    }
    if (orderType === 'Limit' && (!priceNum || priceNum <= 0)) {
        setError('Please enter a valid price for a limit order.');
        return;
    }

    setSimulatedOrder({
      side,
      price: orderType === 'Limit' ? priceNum : -1,
      quantity: quantityNum,
    });
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-6 text-white">Simulate Order</h2>
      <form onSubmit={handleSubmit}>
        <FormRow label="Venue">
            <StyledInput type="text" value={selectedVenue} readOnly className="bg-gray-700/60 cursor-not-allowed" />
        </FormRow>
        
        <FormRow label="Symbol">
            <div className="flex gap-2">
                <StyledInput 
                    type="text" 
                    placeholder="e.g., ETH-USD"
                    value={symbolInput}
                    onChange={(e) => setSymbolInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSymbolUpdate(); } }}
                />
                <button type="button" onClick={handleSymbolUpdate} className="px-3 py-2 text-sm font-semibold text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors">
                    Update
                </button>
            </div>
        </FormRow>

        <FormRow label="Side">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setSide('Buy')} className={`py-2 rounded-md transition ${side === 'Buy' ? 'bg-green-600/80 text-white font-semibold' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}>Buy</button>
            <button type="button" onClick={() => setSide('Sell')} className={`py-2 rounded-md transition ${side === 'Sell' ? 'bg-red-600/80 text-white font-semibold' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}>Sell</button>
          </div>
        </FormRow>

        <FormRow label="Order Type">
          <StyledSelect value={orderType} onChange={(e) => setOrderType(e.target.value as 'Market' | 'Limit')}>
            <option>Limit</option>
            <option>Market</option>
          </StyledSelect>
        </FormRow>

        {orderType === 'Limit' && (
          <FormRow label="Price (USD)">
            <StyledInput type="number" placeholder="e.g., 3500.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </FormRow>
        )}

        <FormRow label="Quantity">
          <StyledInput type="number" placeholder="e.g., 10.5" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </FormRow>
        
        <FormRow label="Timing">
            <StyledSelect value={timing} onChange={(e) => setTiming(e.target.value)}>
                <option value="Immediate">Immediate</option>
                <option value="5s">5s Delay</option>
                <option value="10s">10s Delay</option>
                <option value="30s">30s Delay</option>
            </StyledSelect>
        </FormRow>

        {error && <p className="text-red-400 text-sm text-center my-4">{error}</p>}

        <div className="mt-6">
          <button type="submit" className="w-full py-2.5 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
            Simulate Order
          </button>
        </div>
      </form>
    </div>
  );
};
