import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { COD_CONVENIENCE_FEE } from '@/lib/constants';
import { products } from '@/data/products';
import { sanitizeAddress, sanitizeEmail, sanitizePhone, sanitizeString, sanitizePincode } from '@/lib/security';

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
  if (!body.customerName || typeof body.customerName !== 'string' || body.customerName.trim().length < 2) {
    return { isValid: false, error: 'Invalid customer name' };
  }
  if (!body.customerEmail || typeof body.customerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)) {
    return { isValid: false, error: 'Invalid email' };
  }
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    return { isValid: false, error: 'Invalid order items' };
  }
  for (const item of body.items) {
    if (!item || typeof item !== 'object' || typeof item.qty !== 'number' || item.qty < 1 || item.qty > 20) {
      return { isValid: false, error: 'Invalid item quantity' };
    }
    if (!item.product || typeof item.product.id !== 'number' || item.product.id <= 0) {
      return { isValid: false, error: 'Invalid product in order' };
    }
  }
  if (!body.address || typeof body.address !== 'object') {
    return { isValid: false, error: 'Invalid address' };
  }
  if (typeof body.address.fullName !== 'string' || body.address.fullName.trim().length < 2) {
    return { isValid: false, error: 'Invalid address name' };
  }
  if (typeof body.address.phone !== 'string' || !/^[+]?\d{10,15}$/.test(body.address.phone)) {
    return { isValid: false, error: 'Invalid phone number' };
  }
  if (typeof body.address.street !== 'string' || body.address.street.trim().length < 3) {
    return { isValid: false, error: 'Invalid street address' };
  }
  if (typeof body.address.city !== 'string' || body.address.city.trim().length < 2) {
    return { isValid: false, error: 'Invalid city' };
  }
  if (typeof body.address.state !== 'string' || body.address.state.trim().length < 2) {
    return { isValid: false, error: 'Invalid state' };
  }
  if (typeof body.address.pincode !== 'string' || !/^\d{6}$/.test(body.address.pincode)) {
    return { isValid: false, error: 'Invalid pincode' };
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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Server configuration error: Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    let computedSubtotal = 0;
    const validatedItems = [] as Array<{
      productId: number;
      name: string;
      brand: string;
      price: number;
      image: string;
      qty: number;
    }>;

    for (const item of body.items) {
      const product = products.find((p) => p.id === item.product.id);
      if (!product) {
        return NextResponse.json({ error: 'Invalid product in order' }, { status: 400 });
      }

      const qty = Math.min(Math.max(Math.trunc(item.qty), 1), 20);
      const lineTotal = product.price * qty;
      computedSubtotal += lineTotal;
      validatedItems.push({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        qty,
      });
    }

    if (computedSubtotal !== body.subtotal) {
      return NextResponse.json({ error: 'Order subtotal does not match server-side pricing' }, { status: 400 });
    }

    const address = {
      fullName: sanitizeString(body.address.fullName, 100),
      phone: sanitizePhone(body.address.phone),
      street: sanitizeAddress(body.address.street),
      city: sanitizeString(body.address.city, 100),
      state: sanitizeString(body.address.state, 100),
      pincode: sanitizePincode(body.address.pincode),
    };

    const isCOD = body.paymentMethod === 'cod';
    const convenienceFee = isCOD ? COD_CONVENIENCE_FEE : 0;
    const grandTotal = computedSubtotal + convenienceFee;
    const payNowAmount = isCOD ? convenienceFee : computedSubtotal;
    const amountDueOnDelivery = isCOD ? computedSubtotal : 0;

    const { error } = await supabase.from('orders').insert({
      id: sanitizeString(body.id, 100),
      user_id: body.userId || null,
      customer_name: sanitizeString(body.customerName, 100),
      customer_email: sanitizeEmail(body.customerEmail),
      items: validatedItems,
      address,
      subtotal: computedSubtotal,
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

