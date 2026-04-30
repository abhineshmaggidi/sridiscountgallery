import { createHmac } from 'crypto';
import Razorpay from 'razorpay';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

declare global {
  var razorpay: Razorpay | undefined;
}

let razorpayInstance: Razorpay | null = null;

export function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_SgAwPk5xCJ5iCE';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'Iy4F0gZ0s9rXs2TcSk6He2Fe';

  if (!razorpayInstance) {
    if (!keyId || !keySecret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env.local');
    }
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    razorpay.orders.create(options, (err: any, order: any) => {
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

export function verifySignature(
  payload: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'Iy4F0gZ0s9rXs2TcSk6He2Fe';
  const expectedSignature = createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');
  return signature === expectedSignature;
}
