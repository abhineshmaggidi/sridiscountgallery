import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';
import { COD_CONVENIENCE_FEE } from '@/lib/constants';

interface VerificationRequestBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(ip);
  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (userLimit.count >= RATE_LIMIT_MAX) return false;
  userLimit.count++;
  return true;
}

function validateInput(body: VerificationRequestBody): { isValid: boolean; error?: string } {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;
  if (!razorpay_order_id || typeof razorpay_order_id !== 'string' || razorpay_order_id.length !== 21) {
    return { isValid: false, error: 'Invalid Razorpay order ID' };
  }
  if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string' || razorpay_payment_id.length < 10) {
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
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const validation = validateInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error: Missing Supabase service role credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Verify signature
    const payload = razorpay_order_id + '|' + razorpay_payment_id;
    const isValid = verifySignature(payload, razorpay_signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Fetch order to check if COD or online
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select('payment_method')
      .eq('id', orderId)
      .single();

    if (fetchError || !orderData) {
      console.error('[Verify] Order not found:', fetchError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isCOD = orderData.payment_method === 'cod';

    // Update order based on payment type
    const updateData = isCOD
      ? {
          status: 'confirmed',
          payment_status: 'cod_advance_paid',
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          cod_advance_paid: COD_CONVENIENCE_FEE,
          cod_advance_payment_id: razorpay_payment_id,
        }
      : {
          status: 'confirmed',
          payment_status: 'paid',
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        };

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('[Verify] Supabase update error:', updateError);
      return NextResponse.json({ error: 'Database update failed: ' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isCOD,
      status: isCOD ? 'cod_advance_paid' : 'paid',
    });

  } catch (error: unknown) {
    console.error('Verification error:', error);
    const msg = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ error: 'Payment verification failed: ' + msg }, { status: 500 });
  }
}
