// src/lib/calculations.ts
import { OrderbookLevel, SimulatedOrder } from "@/app/store/orderbookStore";

export interface MarketImpactMetrics {
  estimatedFillPrice: number;
  slippage: number;
  fillPercentage: number;
  marketImpact: number;
}

/**
 * Calculates the impact of a simulated market order by "walking the book".
 * @param order The simulated order details.
 *param book The side of the order book to walk (bids for selling, asks for buying).
 * @returns An object containing the calculated metrics.
 */
export const calculateMarketImpact = (
  order: SimulatedOrder,
  book: OrderbookLevel[]
): MarketImpactMetrics => {
  if (!order || order.quantity <= 0 || book.length === 0) {
    return { estimatedFillPrice: 0, slippage: 0, fillPercentage: 100, marketImpact: 0 };
  }

  let quantityToFill = order.quantity;
  let totalCost = 0;
  let filledQuantity = 0;

  // The ideal price is the best price available in the book (first level)
  const idealPrice = parseFloat(book[0][0]);

  for (const level of book) {
    const price = parseFloat(level[0]);
    const availableQuantity = parseFloat(level[1]);

    if (quantityToFill <= 0) break;

    const quantityFromLevel = Math.min(quantityToFill, availableQuantity);
    
    totalCost += quantityFromLevel * price;
    filledQuantity += quantityFromLevel;
    quantityToFill -= quantityFromLevel;
  }

  if (filledQuantity === 0) {
    return { estimatedFillPrice: 0, slippage: 0, fillPercentage: 100, marketImpact: 0 };
  }

  const estimatedFillPrice = totalCost / filledQuantity;
  
  // Slippage is the percentage difference between the ideal price and the actual fill price
  const slippage = ((Math.abs(estimatedFillPrice - idealPrice)) / idealPrice) * 100;
  
  const fillPercentage = (filledQuantity / order.quantity) * 100;

  // Market impact is the total value of the trade
  const marketImpact = totalCost;

  return {
    estimatedFillPrice,
    slippage,
    fillPercentage,
    marketImpact,
  };
};
