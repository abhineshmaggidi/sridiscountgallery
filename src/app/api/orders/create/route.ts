import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { COD_CONVENIENCE_FEE } from '@/lib/constants';

interface CreateOrderBody {
  id: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    product: { id: number; name: string; brand: string; price: number; image: string };
    qty: number;
  }>;
  address: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  paymentMethod: 'razorpay' | 'cod';
  userId?: string | null;
}

// Rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

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

function validateInput(body: CreateOrderBody): { isValid: boolean; error?: string } {
  if (!body.id || typeof body.id !== 'string' || body.id.length > 100) {
    return { isValid: false, error: 'Invalid order ID' };
  }
  if (!body.customerName || body.customerName.trim().length < 2) {
    return { isValid: false, error: 'Invalid customer name' };
  }
  if (!body.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)) {
    return { isValid: false, error: 'Invalid email' };
  }
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return { isValid: false, error: 'No items in order' };
  }
  if (!body.address || !body.address.fullName || !body.address.street || !body.address.city || !body.address.state || !body.address.pincode) {
    return { isValid: false, error: 'Invalid address' };
  }
  if (typeof body.subtotal !== 'number' || body.subtotal <= 0) {
    return { isValid: false, error: 'Invalid subtotal' };
  }
  if (body.paymentMethod !== 'razorpay' && body.paymentMethod !== 'cod') {
    return { isValid: false, error: 'Invalid payment method' };
  }
  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body: CreateOrderBody = await request.json();
    const validation = validateInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dztspskgctvtnargrsxj.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHNwc2tnY3R2dG5hcmdyc3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTc3NjQsImV4cCI6MjA5MTkzMzc2NH0.f-sgEJ24DUGQEhpPfAUi-pp6USSNRPdVLK8wmhqLUyA';

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey
    );

    const isCOD = body.paymentMethod === 'cod';
    const convenienceFee = isCOD ? COD_CONVENIENCE_FEE : 0;
    const grandTotal = isCOD ? body.subtotal + COD_CONVENIENCE_FEE : body.subtotal;
    const payNowAmount = isCOD ? COD_CONVENIENCE_FEE : body.subtotal;
    const amountDueOnDelivery = isCOD ? body.subtotal : 0;

    const { error } = await supabase.from('orders').insert({
      id: body.id,
      user_id: body.userId || null,
      customer_name: body.customerName.trim(),
      customer_email: body.customerEmail.toLowerCase().trim(),
      items: body.items.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        brand: i.product.brand,
        price: i.product.price,
        image: i.product.image,
        qty: i.qty,
      })),
      address: body.address,
      subtotal: body.subtotal,
      convenience_fee: convenienceFee,
      grand_total: grandTotal,
      amount_due_on_delivery: amountDueOnDelivery,
      payment_method: isCOD ? 'cod' : 'razorpay',
      payment_id: '',
      status: 'pending_payment',
      payment_status: 'pending',
      cod_advance_paid: 0,
      cod_advance_payment_id: null,
    });

    if (error) {
      console.error('[Orders Create] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create order: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: body.id,
      payNowAmount,
      isCOD,
      grandTotal,
    });

  } catch (error: unknown) {
    console.error('[Orders Create] Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create order: ' + msg }, { status: 500 });
  }
}

