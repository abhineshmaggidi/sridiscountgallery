'use client';

import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface CartDrawerProps {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { items, isOpen, toggleCart, updateQty, subtotal } = useCart();
  const { user, toggleLogin } = useAuth();

  const handleCheckout = () => {
    if (!user) { toggleCart(); toggleLogin(); return; }
    toggleCart();
    onCheckout();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-[300]" onClick={toggleCart} />}
      <div className={`fixed top-0 right-0 w-full md:w-[400px] h-full bg-white border-l border-gray-200 z-[301] flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
          <button type="button" onClick={toggleCart} className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-30" />
              <p className="font-medium text-gray-500">Your cart is empty</p>
            </div>
          ) : items.map((item) => (
            <div key={item.product.id} className="flex gap-3 py-3 border-b border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.product.image} alt={item.product.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.product.name}</p>
                <p className="text-[11px] text-gray-400">{item.product.brand}</p>
                <p className="font-mono text-sm font-semibold text-[#1E3A8A] mt-1">₹{(item.product.price * item.qty).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2 self-center">
                <button type="button" onClick={() => updateQty(item.product.id, -1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 flex items-center justify-center text-lg font-bold">−</button>
                <span className="font-mono text-sm font-semibold min-w-[20px] text-center">{item.qty}</span>
                <button type="button" onClick={() => updateQty(item.product.id, 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 flex items-center justify-center text-lg font-bold">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 md:px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between mb-1 text-sm text-gray-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between mb-1 text-sm"><span className="text-gray-500">Delivery</span><span className="text-green-600 font-medium">₹99/item</span></div>
          <div className="flex justify-between mb-4 text-lg font-bold text-gray-900"><span>Total</span><span className="font-mono text-[#1E3A8A]">₹{subtotal.toLocaleString('en-IN')}</span></div>
          <button type="button" onClick={handleCheckout} disabled={items.length === 0}
            className="w-full py-3.5 rounded-xl bg-[#F97316] text-white font-bold text-[15px] disabled:opacity-40 active:opacity-80">
            {user ? 'Proceed to Checkout →' : 'Login to Checkout →'}
          </button>
        </div>
      </div>
    </>
  );
}
