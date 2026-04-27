import { COD_CONVENIENCE_FEE } from './constants';

export interface PricingBreakdown {
  subtotal: number;
  deliveryCharge: number;
  convenienceFee: number;
  grandTotal: number;
  payNowAmount: number;       // what customer pays online now
  payOnDeliveryAmount: number; // cash to collect at delivery
}

export function calculatePricing(subtotal: number, paymentMethod: string): PricingBreakdown {
  const isCOD = paymentMethod === 'cod' || paymentMethod === 'Cash on Delivery';

  return {
    subtotal,
    deliveryCharge: 0,                          // removed for everyone
    convenienceFee: isCOD ? COD_CONVENIENCE_FEE : 0,  // ₹99 for COD only
    grandTotal: isCOD ? subtotal + COD_CONVENIENCE_FEE : subtotal, // total includes fee for COD
    payNowAmount: isCOD ? COD_CONVENIENCE_FEE : subtotal,         // ₹99 online for COD, full for online
    payOnDeliveryAmount: isCOD ? subtotal : 0,  // subtotal in cash for COD
  };
}
