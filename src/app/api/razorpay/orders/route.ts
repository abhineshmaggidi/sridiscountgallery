import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

