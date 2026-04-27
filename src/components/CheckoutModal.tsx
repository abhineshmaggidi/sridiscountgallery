'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, CreditCard, CheckCircle, Truck, ArrowRight, ArrowLeft, ShoppingBag, Smartphone, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Address, CheckoutStep } from '@/types';

interface CheckoutModalProps { isOpen: boolean; onClose: () => void; }

const UPI_ID = '9259595943-2@ybl';

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, addOrder } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('address');
  const [address, setAddress] = useState<Address>({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('phonepe');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'upi' | 'cod'>('upi');
  const [codOption, setCodOption] = useState<'convenience' | 'standard'>('convenience');
  const [orderAddress, setOrderAddress] = useState<Address>({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'done'>('pending');

  useEffect(() => {
    if (isOpen) {
      setStep('address');
      setOrderId('');
      setPaymentStatus('pending');
      setAddress({ fullName: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', pincode: '' });
      setPaymentMethod('phonepe');
      setSelectedPaymentType('upi');
      setCodOption('convenience');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const grandTotal = subtotal;
  const steps: { key: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { key: 'address', label: 'Address', icon: <MapPin className="w-3.5 h-3.5" /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { key: 'confirmation', label: 'Done', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    { key: 'tracking', label: 'Track', icon: <Truck className="w-3.5 h-3.5" /> },
  ];
  const stepIndex = steps.findIndex(s => s.key === step);

  const generateUPILink = (app: string) => {
    const params = new URLSearchParams({ pa: UPI_ID, pn: 'Sri Discount Gallery', tn: 'Order Payment', am: grandTotal.toString(), cu: 'INR', tr: 'SDG' + Date.now() });
    if (app === 'phonepe') return `phonepe://pay?${params}`;
    if (app === 'gpay') return `tez://upi/pay?${params}`;
    return `upi://pay?${params}`;
  };

  const handlePayWithApp = (app: string) => {
    setPaymentMethod(app === 'phonepe' ? 'PhonePe (UPI)' : app === 'gpay' ? 'Google Pay (UPI)' : 'UPI');
    window.location.href = generateUPILink(app);
    setPaymentStatus('verifying');
  };

  const placeOrder = (method: string) => {
    const id = 'SDG-' + Date.now().toString(36).toUpperCase();
    setOrderId(id);
    setOrderAddress({ ...address });
    addOrder({ id, items: [...items], address: { ...address }, total: subtotal, confirmationCharge: 0, grandTotal, status: 'confirmed', date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), paymentId: 'pay_' + Date.now().toString(36), paymentMethod: method, customerEmail: user?.email || '', customerName: user?.name || '' });
    clearCart();
    setStep('confirmation');
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/40 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="w-full md:max-w-lg max-h-[92vh] bg-white md:rounded-2xl rounded-t-2xl shadow-2xl overflow-y-auto animate-modal-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base md:text-lg font-bold text-gray-900">Checkout</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        {/* Steps */}
        <div className="flex items-center px-4 py-3 gap-1">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className={`flex items-center gap-1 text-[10px] md:text-[12px] font-semibold ${i <= stepIndex ? 'text-[#1E3A8A]' : 'text-gray-300'}`}>
                <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center ${i < stepIndex ? 'bg-green-500 text-white' : i === stepIndex ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {i < stepIndex ? <CheckCircle className="w-3.5 h-3.5" /> : s.icon}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-[2px] mx-1.5 rounded ${i < stepIndex ? 'bg-green-500' : 'bg-gray-100'}`} />}
            </div>
          ))}
        </div>

        <div className="p-4">
          {/* ADDRESS */}
          {step === 'address' && (
            <div className="space-y-3">
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-3">Delivery Address</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Full Name</label>
                  <input value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} placeholder="Full name" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#1E3A8A] transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Phone</label>
                  <input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#1E3A8A] transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Street Address</label>
                <input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="House no, street, area" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#1E3A8A] transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-[10px] font-semibold text-gray-400 uppercase">City</label><input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#1E3A8A] transition-all" /></div>
                <div><label className="text-[10px] font-semibold text-gray-400 uppercase">State</label><input value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder="State" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#1E3A8A] transition-all" /></div>
                <div><label className="text-[10px] font-semibold text-gray-400 uppercase">Pincode</label><input value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} placeholder="500001" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#1E3A8A] transition-all" /></div>
              </div>
              <button type="button" onClick={() => setStep('payment')} disabled={!address.fullName || !address.phone || !address.street || !address.city || !address.pincode}
                className="w-full mt-3 py-3 rounded-xl bg-[#1E3A8A] text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-40">
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PAYMENT */}
          {step === 'payment' && paymentStatus === 'pending' && (
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-3">Payment Method</h3>
              <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between text-[12px] md:text-sm">
                    <span className="text-gray-600 truncate mr-2">{item.product.name} × {item.qty}</span>
                    <span className="font-mono font-semibold text-gray-800 shrink-0">₹{(item.product.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 space-y-1">
                  <div className="flex justify-between text-[12px]"><span className="text-gray-500">Subtotal</span><span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span></div>
                  <div className="border-t border-gray-200 pt-1.5 flex justify-between text-base font-bold"><span>Total</span><span className="font-mono text-[#1E3A8A]">₹{grandTotal.toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3 mb-4">
                <p className="text-sm font-bold text-gray-700">Choose Payment Method</p>

                {/* UPI Payment Option */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentType('upi')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedPaymentType === 'upi'
                        ? 'border-[#1E3A8A] bg-blue-50 shadow-md ring-2 ring-blue-200'
                        : 'border-gray-200 bg-white hover:border-[#1E3A8A] hover:bg-blue-25'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Large Selection Circle */}
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all duration-200 ${
                          selectedPaymentType === 'upi'
                            ? 'border-[#1E3A8A] bg-blue-100'
                            : 'border-gray-300 bg-gray-50 hover:border-[#1E3A8A]'
                        }`}>
                          {selectedPaymentType === 'upi' && (
                            <div className="w-5 h-5 rounded-full bg-[#1E3A8A] flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                        {/* Animated ring when selected */}
                        {selectedPaymentType === 'upi' && (
                          <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-[#1E3A8A] animate-ping opacity-20"></div>
                        )}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-bold text-gray-900 text-base">💳 Pay Online (UPI)</div>
                          {selectedPaymentType === 'upi' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Selected</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          PhonePe, Google Pay, Paytm, Credit/Debit Cards, Netbanking
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-green-600 font-semibold">✓ No extra charges</div>
                          <div className="text-xs text-gray-500">• Instant payment</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Pay now:</div>
                        <div className="font-mono font-bold text-[#1E3A8A] text-lg">₹{grandTotal.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-gray-500 mt-1">Full amount</div>
                      </div>
                    </div>
                  </button>

                  {/* Selection indicator */}
                  {selectedPaymentType === 'upi' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#1E3A8A] rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* COD Payment Option */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentType('cod')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedPaymentType === 'cod'
                        ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-25'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Large Selection Circle */}
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all duration-200 ${
                          selectedPaymentType === 'cod'
                            ? 'border-green-500 bg-green-100'
                            : 'border-gray-300 bg-gray-50 hover:border-green-400'
                        }`}>
                          {selectedPaymentType === 'cod' && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                        {/* Animated ring when selected */}
                        {selectedPaymentType === 'cod' && (
                          <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-green-400 animate-ping opacity-20"></div>
                        )}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-bold text-gray-900 text-base">💵 Cash on Delivery</div>
                          {selectedPaymentType === 'cod' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Selected</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Choose from convenience fee or standard COD options
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-orange-600 font-semibold">⚠️ ₹99 convenience fee available</div>
                          <div className="text-xs text-gray-500">• Multiple options</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Pay now:</div>
                        <div className="font-mono font-bold text-green-600 text-lg">₹99</div>
                        <div className="text-xs text-gray-500 mt-1">Total: ₹{grandTotal.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </button>

                  {/* Selection indicator */}
                  {selectedPaymentType === 'cod' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* UPI Payment Options */}
              {selectedPaymentType === 'upi' && (
                <>
                  <p className="text-sm font-bold text-gray-700 mb-2">Pay with UPI</p>
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <button type="button" onClick={() => handlePayWithApp('phonepe')}
                      className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border-2 border-purple-200 bg-purple-50 active:bg-purple-100">
                      <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center shadow"><Smartphone className="w-5 h-5 text-white" /></div>
                      <span className="text-[12px] md:text-sm font-bold text-purple-700">PhonePe</span>
                      <span className="text-[10px] text-purple-500 font-mono font-bold">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </button>
                    <button type="button" onClick={() => handlePayWithApp('gpay')}
                      className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border-2 border-blue-200 bg-blue-50 active:bg-blue-100">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow">
                        <span className="text-base font-black"><span className="text-blue-500">G</span><span className="text-red-500">P</span><span className="text-yellow-500">a</span><span className="text-green-500">y</span></span>
                      </div>
                      <span className="text-[12px] md:text-sm font-bold text-blue-700">Google Pay</span>
                      <span className="text-[10px] text-blue-500 font-mono font-bold">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </button>
                  </div>

                  <button type="button" onClick={() => handlePayWithApp('upi')} className="w-full p-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-600 mb-3 active:bg-gray-50">
                    Pay with any UPI app
                  </button>
                </>
              )}

              {/* COD Payment Options */}
              {selectedPaymentType === 'cod' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm font-bold text-gray-700 mb-3">Choose COD Payment Option</p>

                  {/* COD Convenience Fee Option */}
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => setCodOption('convenience')}
                      className="w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 text-left"
                      style={{
                        borderColor: codOption === 'convenience' ? '#10B981' : '#E5E7EB',
                        backgroundColor: codOption === 'convenience' ? '#ECFDF5' : 'white'
                      }}
                    >
                      {/* Radio Button Circle */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          codOption === 'convenience' ? 'border-green-500' : 'border-gray-300'
                        }`}>
                          {codOption === 'convenience' && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">💰 Convenience Fee Option</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Pay ₹99 online now + ₹{(grandTotal - 99).toLocaleString('en-IN')} in cash on delivery
                        </div>
                        <div className="text-xs text-orange-600 font-medium mt-1">⚠️ ₹99 convenience fee applies</div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-500">Pay now:</div>
                        <div className="font-mono font-bold text-green-600">₹99</div>
                      </div>
                    </button>
                  </div>

                  {/* COD Standard Option */}
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => setCodOption('standard')}
                      className="w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 text-left"
                      style={{
                        borderColor: codOption === 'standard' ? '#10B981' : '#E5E7EB',
                        backgroundColor: codOption === 'standard' ? '#ECFDF5' : 'white'
                      }}
                    >
                      {/* Radio Button Circle */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          codOption === 'standard' ? 'border-green-500' : 'border-gray-300'
                        }`}>
                          {codOption === 'standard' && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">💵 Standard COD</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Pay full amount ₹{grandTotal.toLocaleString('en-IN')} in cash on delivery
                        </div>
                        <div className="text-xs text-green-600 font-medium mt-1">✓ No online payment required</div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-500">Pay now:</div>
                        <div className="font-mono font-bold text-green-600">₹0</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* COD Payment Action */}
              {selectedPaymentType === 'cod' && (
                <button type="button" onClick={() => router.push(`/checkout?payment=cod&option=${codOption}`)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                  💵 Proceed with {codOption === 'convenience' ? 'Convenience Fee' : 'Standard'} COD
                </button>
              )}

              <button type="button" onClick={() => setStep('address')} className="w-full mt-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          )}

          {/* VERIFYING */}
          {step === 'payment' && paymentStatus === 'verifying' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 animate-pulse"><AlertCircle className="w-7 h-7 text-amber-500" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Complete Payment in App</h3>
              <p className="text-gray-400 text-sm mb-4">Pay <span className="font-mono font-bold text-[#1E3A8A]">₹{grandTotal.toLocaleString('en-IN')}</span> to <span className="font-mono text-gray-600">{UPI_ID}</span></p>
              <button type="button" onClick={() => placeOrder(paymentMethod)}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 mb-2 active:opacity-80">
                <CheckCircle className="w-4 h-4" /> I Have Paid — Confirm Order
              </button>
              <button type="button" onClick={() => handlePayWithApp(paymentMethod.includes('PhonePe') ? 'phonepe' : 'gpay')}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm mb-2">🔄 Retry Payment</button>
              <button type="button" onClick={() => setPaymentStatus('pending')} className="w-full py-2 text-gray-400 text-sm">← Different method</button>
            </div>
          )}

          {/* CONFIRMATION */}
          {step === 'confirmation' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Order Confirmed!</h3>
              <p className="font-mono text-base font-bold text-[#1E3A8A] mb-1">{orderId}</p>
              <p className="text-sm text-gray-400 mb-4">Paid via {paymentMethod}</p>
              <div className="bg-gray-50 rounded-xl p-3 text-left text-sm space-y-0.5 mb-5">
                <p className="text-gray-500 text-[11px]">Delivering to:</p>
                <p className="font-semibold text-gray-800">{orderAddress.fullName}</p>
                <p className="text-gray-600">{orderAddress.street}, {orderAddress.city}, {orderAddress.state} - {orderAddress.pincode}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('tracking')} className="flex-1 py-3 rounded-xl bg-[#1E3A8A] text-white font-bold text-[13px] flex items-center justify-center gap-1.5">Track <Truck className="w-4 h-4" /></button>
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#1E3A8A]/20 text-[#1E3A8A] font-bold text-[13px] flex items-center justify-center gap-1.5"><ShoppingBag className="w-4 h-4" /> Shop More</button>
              </div>
            </div>
          )}

          {/* TRACKING */}
          {step === 'tracking' && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Order Tracking</h3>
              <p className="font-mono text-sm text-[#1E3A8A] font-semibold mb-5">{orderId}</p>
              <div className="ml-2">
                {[
                  { label: 'Order Placed', desc: 'Order received', done: true },
                  { label: 'Payment Confirmed', desc: `Paid via ${paymentMethod}`, done: true },
                  { label: 'Processing', desc: 'Being prepared', done: true },
                  { label: 'Shipped', desc: 'On the way', done: false },
                  { label: 'Delivered', desc: 'Package delivered', done: false },
                ].map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 ${t.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`} />
                      {i < 4 && <div className={`w-0.5 h-8 ${t.done ? 'bg-green-500' : 'bg-gray-200'}`} />}
                    </div>
                    <div className="pb-4">
                      <p className={`text-[13px] font-semibold ${t.done ? 'text-gray-800' : 'text-gray-400'}`}>{t.label}</p>
                      <p className="text-[11px] text-gray-400">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={onClose} className="w-full py-3 rounded-xl bg-[#1E3A8A] text-white font-bold text-[14px] flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
