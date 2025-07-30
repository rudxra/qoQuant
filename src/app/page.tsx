// src/app/page.tsx
"use client"; 

import React from 'react';
import { useOrderbook } from '@/hooks/useOrderbook'; 

import { OrderbookDisplay } from '@/components/orderbook/OrderbookDisplay';
import { OrderSimulationForm } from '@/components/orderbook/OrderSimulationForm';
import { MetricsDisplay } from '@/components/orderbook/MetricsDisplay';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export default function Home() {
  useOrderbook();

  return (
    <main className="bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-screen-2xl">
        
        <header className="mb-6 relative py-4">
          <div className="text-center">
            <div className="inline-block transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Real-Time Orderbook Viewer
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Simulate trades and visualize market impact across multiple exchanges.
              </p>
            </div>
          </div>
          <div className="absolute top-4 right-0">
            <ThemeSwitcher />
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1 flex flex-col gap-6">
            <OrderSimulationForm />
            <MetricsDisplay />
          </div>
          
          <div className="lg:col-span-2">
            <OrderbookDisplay />
          </div>
          
        </div>

      </div>
    </main>
  );
}
