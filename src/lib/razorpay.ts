import Razorpay from 'razorpay';

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id?: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

interface RazorpayError {
  code?: string;
  description?: string;
  source?: string;
  step?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

declare global {
  var razorpay: Razorpay | undefined;
}

let razorpayInstance: Razorpay | null = null;

export function getRazorpay() {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env.local');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

export async function createRazorpayOrder(
  amount: number,
  currency: 'INR' = 'INR',
  receipt: string
): Promise<RazorpayOrder> {
  const razorpay = getRazorpay();
  return new Promise((resolve, reject) => {
    const options = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt,
    };

    razorpay.orders.create(options, (err: RazorpayError | null, order: RazorpayOrder | null) => {
      if (err) {
        // Normalize Razorpay error object to a proper Error with message
        let msg: string;
        if (typeof err === 'string') {
          msg = err;
        } else if (err && typeof err === 'object') {
          msg = err.description || err.message || err.error?.description || err.error?.message || JSON.stringify(err);
        } else {
          msg = JSON.stringify(err);
        }
        console.error('[Razorpay SDK] orders.create error:', err);
        reject(new Error(msg || 'Razorpay API error'));
      } else if (!order) {
        reject(new Error('Razorpay returned empty order'));
      } else {
        resolve(order);
      }
    });
  });
}

import { createHmac } from 'crypto';

export function verifySignature(
  payload: string,
  signature: string
): boolean {
  const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(payload)
    .digest('hex');
  return signature === expectedSignature;
}

