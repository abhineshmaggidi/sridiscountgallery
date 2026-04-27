'use client';

import { useState, useRef, Suspense, useEffect, useMemo } from 'react';
import {
  MapPin, CheckCircle, ArrowRight, Home, ShoppingBag,
  Loader2, AlertCircle, Banknote, Wallet, CreditCard
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { calculatePricing } from '@/lib/pricing';
import {
  sanitizeEmail, sanitizePhone, sanitizeName,
  sanitizeAddress, sanitizePincode, generateSecureId
} from '@/lib/security';

/* ─── Razorpay types ─── */
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayOrderResponse {
  orderId: string; amount: number; currency: string; key: string;
  name: string; description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
}
interface RazorpayOptions {
  key: string; amount: number; currency: string;
  name: string; description: string; order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}
interface RazorpayInstance { open(): void }
declare global {
  interface Window { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance; }
}

/* ─── helpers ─── */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 12;
}
function isValidPincode(pincode: string) {
  return /^\d{6}$/.test(pincode);
}

/* ─── component ─── */
function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, addOrder } = useAuth();

  const [step, setStep] = useState<'guest-info' | 'address' | 'payment' | 'confirmation'>('guest-info');
  const [guestInfo, setGuestInfo] = useState({
    name: user?.name || '', phone: user?.phone || '',
    email: '', street: '', city: '', state: '', pincode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [paymentError, setPaymentError] = useState('');
  const razorpayRef = useRef<RazorpayInstance | null>(null);
  const searchParams = useSearchParams();

  // Pre-select COD if redirected from CheckoutModal
  useEffect(() => {
    const paymentParam = searchParams.get('payment');
    if (paymentParam === 'cod' || paymentParam === 'razorpay') {
      setPaymentMethod(paymentParam);
    }
  }, [searchParams]);

  const pricing = useMemo(() => calculatePricing(subtotal, paymentMethod), [subtotal, paymentMethod]);
  const isCOD = paymentMethod === 'cod';

  const steps = [
    { key: 'guest-info' as const, label: 'Details', icon: '👤' },
    { key: 'address' as const, label: 'Address', icon: '📍' },
    { key: 'payment' as const, label: 'Payment', icon: '💳' },
    { key: 'confirmation' as const, label: 'Done ✓', icon: '✅' },
  ];
  const stepIndex = steps.findIndex(s => s.key === step);

  /* validation */
  const guestInfoValid =
    guestInfo.name.trim().length >= 2 &&
    isValidPhone(guestInfo.phone) &&
    isValidEmail(guestInfo.email);
  const addressValid =
    guestInfo.street.trim().length >= 3 &&
    guestInfo.city.trim().length >= 2 &&
    guestInfo.state.trim().length >= 2 &&
    isValidPincode(guestInfo.pincode);

  /* ─── navigation handlers ─── */
  const handleContinueToAddress = () => {
    if (guestInfoValid) setStep('address');
  };

  const handleContinueToPayment = () => {
    if (addressValid) setStep('payment');
  };

  /* ─── order helpers ─── */
  const buildOrder = (overrides?: Partial<Order>): Order => {
    const id = orderId || 'SDG-' + Date.now().toString(36).toUpperCase();
    return {
      id,
      items: [...items],
      address: {
        fullName: guestInfo.name.trim(),
        phone: guestInfo.phone.trim(),
        street: guestInfo.street.trim(),
        city: guestInfo.city.trim(),
        state: guestInfo.state.trim(),
        pincode: guestInfo.pincode.trim(),
      },
      total: subtotal,
      confirmationCharge: 0,
      convenienceFee: pricing.convenienceFee,
      grandTotal: pricing.grandTotal,
      status: 'confirmed',
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
      paymentId: 'pay_' + Date.now().toString(36),
      paymentMethod: isCOD ? 'Cash on Delivery' : 'Razorpay',
      customerEmail: guestInfo.email.trim(),
      customerName: guestInfo.name.trim(),
      payment_status: isCOD ? 'cod_pending' : 'paid',
      cod_advance_paid: 0,
      amount_due_on_delivery: pricing.payOnDeliveryAmount,
      ...overrides,
    };
  };

  const finalizeOrder = async (order: Order) => {
    await addOrder(order);
    clearCart();
    setStep('confirmation');
  };

  /* ─── DB order creation ─── */
  const createOrderInDB = async (id: string, method: 'razorpay' | 'cod') => {
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        customerName: guestInfo.name,
        customerEmail: guestInfo.email,
        items: items.map(i => ({ product: i.product, qty: i.qty })),
        address: {
          fullName: guestInfo.name.trim(),
          phone: guestInfo.phone.trim(),
          street: guestInfo.street.trim(),
          city: guestInfo.city.trim(),
          state: guestInfo.state.trim(),
          pincode: guestInfo.pincode.trim(),
        },
        subtotal,
        paymentMethod: method,
        userId: user?.id || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create order');
    }
    return res.json();
  };

  /* ─── Razorpay flow ─── */
  const createRazorpayOrder = async () => {
    setIsLoading(true);
    setPaymentError('');
    try {
      const receipt = generateSecureId('SDG-');
      setOrderId(receipt);

      // Create order in DB first (pending_payment status)
      await createOrderInDB(receipt, paymentMethod);

      // Determine amount to charge (full subtotal for online, ₹99 convenience fee for COD)
      const amountToCharge = pricing.payNowAmount;

      const response = await fetch('/api/razorpay/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountToCharge,
          receipt,
          customerEmail: guestInfo.email,
          customerName: guestInfo.name
        })
      });

      let data: RazorpayOrderResponse | { error?: string } = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from Razorpay API:', text.slice(0, 500));
        throw new Error('Server returned an unexpected response. Check server logs.');
      }

      if (!response.ok) {
        const err = 'error' in data ? data.error : undefined;
        throw new Error(err || 'Failed to create payment order');
      }

      const orderData = data as RazorpayOrderResponse;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options: RazorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sri Discount Gallery',
        description: `Order #${receipt}`,
        order_id: orderData.orderId,
        handler: (response: RazorpayResponse) => handleRazorpaySuccess(response, receipt),
        prefill: {
          name: guestInfo.name,
          email: guestInfo.email,
          contact: guestInfo.phone.replace(/\D/g, '').slice(-10) || '9999999999'
        },
        theme: { color: '#1E3A8A' },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay!(options);
      razorpayRef.current = rzp;
      rzp.open();
    } catch (error: unknown) {
      console.error('Order error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment order';
      setPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRazorpaySuccess = async (response: RazorpayResponse, receipt: string) => {
    setIsLoading(true);
    try {
      const verifyResponse = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: receipt
        })
      });

      if (verifyResponse.ok) {
        const order = buildOrder({
          id: receipt,
          paymentId: response.razorpay_payment_id,
          paymentMethod: isCOD ? 'Cash on Delivery' : 'Razorpay',
          status: 'confirmed',
          razorpay_payment_id: response.razorpay_payment_id,
          payment_status: isCOD ? 'cod_advance_paid' : 'paid',
          cod_advance_paid: isCOD ? pricing.convenienceFee : 0,
        });
        await finalizeOrder(order);
      } else {
        const err = await verifyResponse.json().catch(() => ({}));
        setPaymentError(err.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Success handler error:', error);
      setPaymentError('Payment completed but order processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback for Razorpay failures (test mode)
  const handleSimulatePayment = async () => {
    const receipt = orderId || 'TEST-' + Date.now().toString(36).toUpperCase();
    setOrderId(receipt);

    try {
      await createOrderInDB(receipt, paymentMethod);
    } catch {
      // Continue even if DB fails
    }

    const order = buildOrder({
      id: receipt,
      paymentId: 'pay_test_' + Date.now(),
      paymentMethod: isCOD ? 'Cash on Delivery' : 'Razorpay (Test Mode)',
      status: 'confirmed',
    });
    await finalizeOrder(order);
  };

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Items</h2>
          <p className="text-gray-600 mb-6">Cart is empty</p>
          <button onClick={() => router.push('/')} className="px-6 py-3 rounded-2xl bg-[#1E3A8A] text-white font-bold shadow-lg">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Steps */}
        <div className="bg-white rounded-3xl shadow-lg border p-1 mb-8 overflow-hidden">
          <div className="flex">
            {steps.map((s, i) => (
              <div
                key={s.key}
                className={`flex-1 py-3 px-2 text-center font-bold text-sm transition-all ${
                  i <= stepIndex
                    ? 'bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white shadow-lg'
                    : 'bg-white/50 text-gray-500 hover:bg-white/70'
                }`}
              >
                <span className="block mb-1">{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GUEST INFO */}
        {step === 'guest-info' && (
          <div className="bg-white rounded-3xl shadow-lg border p-8 mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent mb-4">
              Quick Checkout
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md">Enter details for delivery. No login required.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                <input
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({...guestInfo, name: sanitizeName(e.target.value)})}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 outline-none text-lg"
                  placeholder="John Doe"
                />
                {guestInfo.name && guestInfo.name.trim().length < 2 && (
                  <p className="text-red-500 text-xs mt-1">Name must be at least 2 characters</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                <input
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({...guestInfo, phone: sanitizePhone(e.target.value)})}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 outline-none text-lg"
                  placeholder="+91 98765 43210"
                />
                {guestInfo.phone && !isValidPhone(guestInfo.phone) && (
                  <p className="text-red-500 text-xs mt-1">Enter a valid 10-digit phone number</p>
                )}
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({...guestInfo, email: sanitizeEmail(e.target.value)})}
                  type="email"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 outline-none text-lg"
                  placeholder="john@example.com"
                />
                {guestInfo.email && !isValidEmail(guestInfo.email) && (
                  <p className="text-red-500 text-xs mt-1">Enter a valid email address</p>
                )}
              </div>
            </div>

            <button
              onClick={handleContinueToAddress}
              disabled={!guestInfoValid}
              className="w-full mt-8 py-5 rounded-3xl bg-gradient-to-r from-[#F97316] to-orange-500 text-white text-xl font-bold shadow-2xl hover:shadow-3xl disabled:opacity-50 transition-all"
            >
              Continue to Address <ArrowRight className="w-6 h-6 inline ml-2" />
            </button>
          </div>
        )}

        {/* ADDRESS */}
        {step === 'address' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{guestInfo.name}</h2>
              <p className="text-xl font-semibold">{guestInfo.phone}</p>
              <p className="text-lg text-gray-600">{guestInfo.email}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-8 h-8 text-orange-500" />
                Delivery Address
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <label className="block text-lg font-bold text-gray-700 mb-3">Street Address *</label>
                  <input
                    value={guestInfo.street}
                    onChange={(e) => setGuestInfo({...guestInfo, street: sanitizeAddress(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 outline-none text-lg"
                    placeholder="House, street, area, landmark"
                  />
                  {guestInfo.street && guestInfo.street.trim().length < 3 && (
                    <p className="text-red-500 text-xs mt-1">Enter a complete street address</p>
                  )}
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">City *</label>
                  <input
                    value={guestInfo.city}
                    onChange={(e) => setGuestInfo({...guestInfo, city: sanitizeAddress(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 outline-none text-lg"
                    placeholder="Hyderabad"
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">State *</label>
                  <input
                    value={guestInfo.state}
                    onChange={(e) => setGuestInfo({...guestInfo, state: sanitizeAddress(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 outline-none text-lg"
                    placeholder="Telangana"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">Pincode *</label>
                  <input
                    value={guestInfo.pincode}
                    onChange={(e) => setGuestInfo({...guestInfo, pincode: sanitizePincode(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 outline-none text-lg"
                    placeholder="500001"
                    maxLength={6}
                  />
                  {guestInfo.pincode && !isValidPincode(guestInfo.pincode) && (
                    <p className="text-red-500 text-xs mt-1">Enter a valid 6-digit pincode</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleContinueToPayment}
                disabled={!addressValid}
                className="w-full py-5 rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white text-xl font-bold shadow-2xl hover:shadow-3xl disabled:opacity-50 transition-all"
              >
                Continue to Payment <CreditCard className="w-6 h-6 inline ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* PAYMENT */}
        {step === 'payment' && (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-3xl shadow-lg border p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <img src={item.product.image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-lg truncate">{item.product.name}</h4>
                      <p className="text-gray-600 text-sm">{item.product.brand}</p>
                      <p className="text-gray-700 font-semibold text-lg mt-1">₹{item.product.price.toLocaleString('en-IN')} × {item.qty}</p>
                    </div>
                    <span className="font-bold text-lg text-[#1E3A8A]">₹{(item.product.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-6 space-y-2">
                <div className="flex justify-between text-xl">
                  <span className="text-gray-700 font-semibold">Subtotal</span>
                  <span className="font-mono text-xl font-bold">₹{pricing.subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t pt-4 flex justify-between text-2xl font-bold text-[#1E3A8A]">
                  <span>Total Amount Due</span>
                  <span className="font-mono">₹{pricing.grandTotal.toLocaleString('en-IN')}</span>
                </div>
                {isCOD && (
                  <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl text-sm">
                    <div className="font-semibold text-orange-800 mb-3">💰 COD Payment Breakdown:</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">1️⃣ Pay Online Now:</span>
                        <span className="font-bold text-lg text-orange-700">₹{pricing.payNowAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">2️⃣ Pay on Delivery (Cash):</span>
                        <span className="font-bold text-lg text-orange-700">₹{pricing.payOnDeliveryAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-orange-300 pt-2 flex justify-between font-bold">
                        <span>Total to be paid:</span>
                        <span className="text-lg">₹{pricing.grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )}
                {!isCOD && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-sm">
                    <div className="font-semibold text-blue-800 mb-2">💳 Direct Online Payment:</div>
                    <div className="flex justify-between">
                      <span className="font-medium">Pay Full Amount Now:</span>
                      <span className="font-bold text-lg text-blue-700">₹{pricing.payNowAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs text-green-600 mt-2 font-medium">✓ No extra charges</div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 font-medium">{paymentError}</p>
                  {paymentError.includes('Authentication failed') && (
                    <button
                      onClick={handleSimulatePayment}
                      className="mt-3 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      🧪 Simulate Successful Payment & Place Order
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Online Payment Card */}
            <div
              onClick={() => setPaymentMethod('razorpay')}
              className={`bg-white rounded-3xl shadow-lg border p-8 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/10' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {/* Radio Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  paymentMethod === 'razorpay' ? 'border-[#1E3A8A] bg-blue-100' : 'border-gray-300 bg-gray-50'
                }`}>
                  {paymentMethod === 'razorpay' && <div className="w-3 h-3 rounded-full bg-[#1E3A8A]" />}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-7 h-7 text-[#1E3A8A]" />
                  Pay Online (Full Amount)
                </h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">UPI, PhonePe, Google Pay, Paytm, Credit/Debit Cards, Netbanking</p>
              <div className="text-xs text-green-600 mb-6 font-medium">✓ No extra charges • Full payment now</div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-sm text-blue-900">
                  <div className="font-semibold">Complete payment required:</div>
                  <div className="mt-2 flex justify-between">
                    <span>Pay now:</span>
                    <span className="font-bold text-lg">₹{pricing.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); createRazorpayOrder(); }}
                disabled={isLoading}
                className="w-full py-5 rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white text-xl font-bold shadow-2xl hover:shadow-3xl disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 inline mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{pricing.payNowAmount.toLocaleString('en-IN')} with Razorpay</>
                )}
              </button>
            </div>

            {/* COD Card */}
            <div
              onClick={() => setPaymentMethod('cod')}
              className={`bg-white rounded-3xl shadow-lg border p-8 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-green-400 ring-2 ring-green-100' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {/* Radio Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  paymentMethod === 'cod' ? 'border-green-500 bg-green-100' : 'border-gray-300 bg-gray-50'
                }`}>
                  {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-green-500" />}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Banknote className="w-7 h-7 text-green-600" />
                  Cash on Delivery
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4 font-medium">
                Split payment: Pay ₹{pricing.convenienceFee} now + ₹{pricing.payOnDeliveryAmount.toLocaleString('en-IN')} in cash on delivery
              </p>
              <div className="text-xs text-orange-600 mb-4 font-medium">
                ⚠️ ₹{pricing.convenienceFee} convenience fee applies
              </div>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-sm text-green-900">
                  <div className="font-semibold mb-2">Payment breakdown:</div>
                  <div className="flex justify-between mb-2">
                    <span>Step 1 - Pay online now:</span>
                    <span className="font-bold">₹{pricing.payNowAmount}</span>
                  </div>
                  <div className="flex justify-between border-t border-green-300 pt-2">
                    <span>Step 2 - Pay in cash on delivery:</span>
                    <span className="font-bold">₹{pricing.payOnDeliveryAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t border-green-300 pt-2 font-semibold text-green-800">
                    <span>Total amount:</span>
                    <span>₹{pricing.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); createRazorpayOrder(); }}
                disabled={isLoading}
                className="w-full py-5 rounded-3xl border-2 border-green-300 bg-green-50 text-green-700 text-xl font-bold shadow-lg hover:shadow-xl hover:bg-green-100 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 inline mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Confirm with ₹{pricing.payNowAmount} Online</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* CONFIRMATION */}
        {step === 'confirmation' && (
          <div className="text-center py-16">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent mb-4">
              Order Confirmed!
            </h1>
            <p className="font-mono text-2xl font-bold text-[#1E3A8A] mb-8">{orderId}</p>

            {isCOD && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                <h3 className="font-bold text-orange-800 mb-4 text-lg">💰 Cash on Delivery</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">✅ Paid online:</span>
                    <span className="font-bold text-lg text-orange-700">₹{pricing.payNowAmount}</span>
                  </div>
                  <div className="border-t border-orange-300 pt-3 flex justify-between text-sm">
                    <span className="font-medium">💵 Pay on delivery (cash):</span>
                    <span className="font-bold text-lg text-orange-700">₹{pricing.payOnDeliveryAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-orange-300 pt-3 flex justify-between font-bold text-orange-900">
                    <span>Total to collect:</span>
                    <span>₹{pricing.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}

            {!isCOD && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                <span className="text-green-700 font-semibold text-lg">
                  ✓ Paid ₹{pricing.grandTotal.toLocaleString('en-IN')} online
                </span>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-lg border p-8 mb-12 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delivered to:</h3>
              <div className="space-y-1 text-lg">
                <p className="font-bold">{guestInfo.name}</p>
                <p>{guestInfo.phone}</p>
                <p className="font-mono">{guestInfo.street}</p>
                <p>{guestInfo.city}, {guestInfo.state} - {guestInfo.pincode}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <button
                onClick={() => router.push('/')}
                className="flex-1 py-5 rounded-3xl bg-[#1E3A8A] text-white text-lg font-bold shadow-2xl hover:shadow-3xl transition-all"
              >
                <Home className="w-6 h-6 inline mr-2" /> Continue Shopping
              </button>
              <button
                onClick={() => router.push('/profile/orders')}
                className="flex-1 py-5 rounded-3xl border-2 border-gray-300 text-gray-800 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingBag className="w-5 h-5 inline mr-2" /> Track Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1E3A8A]"></div>
      </div>
    }>
      <CheckoutPage />
    </Suspense>
  );
}

export default CheckoutPageWrapper;

