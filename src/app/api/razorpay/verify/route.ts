import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';

// Rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute

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

function validateVerificationInput(body: any): { isValid: boolean; error?: string } {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

  if (!razorpay_order_id || typeof razorpay_order_id !== 'string' || razorpay_order_id.length !== 21) {
    return { isValid: false, error: 'Invalid order ID' };
  }

  if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string' || razorpay_payment_id.length !== 17) {
    return { isValid: false, error: 'Invalid payment ID' };
  }

  if (!razorpay_signature || typeof razorpay_signature !== 'string' || razorpay_signature.length !== 64) {
    return { isValid: false, error: 'Invalid signature' };
  }

  if (!orderId || typeof orderId !== 'string' || orderId.length > 100) {
    return { isValid: false, error: 'Invalid order ID' };
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
    const validation = validateVerificationInput(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    // Verify Supabase credentials are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[Razorpay Verify] Supabase credentials missing');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Verify signature
    const payload = razorpay_order_id + '|' + razorpay_payment_id;
    const isValid = verifySignature(payload, razorpay_signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update order status in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        razorpay_payment_id,
        razorpay_signature 
      })
      .eq('id', orderId);

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error('Database update failed: ' + error.message);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed: ' + error.message }, { status: 500 });
  }
}

