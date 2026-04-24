import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

// Rate limiting (simple in-memory store - for production use Redis/external service)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

function validateOrderInput(body: any): { isValid: boolean; error?: string } {
  const { amount, receipt, customerEmail, customerName } = body;

  if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 1000000) {
    return { isValid: false, error: 'Invalid amount' };
  }

  if (!receipt || typeof receipt !== 'string' || receipt.length > 100) {
    return { isValid: false, error: 'Invalid receipt' };
  }

  if (!customerEmail || typeof customerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return { isValid: false, error: 'Invalid email' };
  }

  if (!customerName || typeof customerName !== 'string' || customerName.length < 2 || customerName.length > 100) {
    return { isValid: false, error: 'Invalid customer name' };
  }

  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Input validation
    const validation = validateOrderInput(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { amount, receipt, customerEmail, customerName } = body;

    // Diagnostics: log env var presence (never log actual values)
    console.log('[Razorpay Orders] Env check:', {
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      hasNextPublicKeyId: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay credentials missing on server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local and restart the dev server.' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      return NextResponse.json(
        { error: 'Razorpay public key missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local and restart the dev server.' },
        { status: 500 }
      );
    }

    // Create Razorpay order (amount is already in rupees; lib converts to paise)
    const razorpayOrder = await createRazorpayOrder(amount, 'INR', receipt);

    if (!razorpayOrder || !razorpayOrder.id) {
      console.error('[Razorpay Orders] Invalid order response:', razorpayOrder);
      return NextResponse.json(
        { error: 'Razorpay returned an invalid order response. Check server logs.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: 'Sri Discount Gallery',
      description: `Order #${receipt}`,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: '9999999999'
      },
      theme: {
        color: '#1E3A8A'
      }
    });

  } catch (error: any) {
    const msg = error?.message || error?.description || error?.error || JSON.stringify(error);
    console.error('Order creation error:', msg, error);
    return NextResponse.json({ 
      error: 'Failed to create payment order: ' + msg 
    }, { status: 500 });
  }
}

