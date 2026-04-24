import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

