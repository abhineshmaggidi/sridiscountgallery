'use client';

import { useEffect, useState } from 'react';
import { Package, MapPin, CreditCard, Truck, Clock, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Order {
  id: string;
  items: Array<{
    product: {
      id: number;
      name: string;
      image: string;
      price: number;
    };
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
  total: number;
  confirmationCharge: number;
  grandTotal: number;
  status: 'placed' | 'pending' | 'confirmed' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  paymentMethod: string;
  paymentId: string;
}

const statusConfig = {
  placed: { label: 'Order Placed', icon: Clock, color: 'orange' },
  pending: { label: 'Payment Pending', icon: Clock, color: 'yellow' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'blue' },
  paid: { label: 'Paid', icon: CreditCard, color: 'green' },
  processing: { label: 'Processing', icon: Package, color: 'blue' },
  shipped: { label: 'Shipped', icon: Truck, color: 'purple' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'green' },
  cancelled: { label: 'Cancelled', icon: X, color: 'red' },
} as const;

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border hover:shadow-2xl transition-all group">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-mono text-2xl font-bold text-gray-900">{order.id}</h3>
              <p className="text-sm text-gray-500">{order.date}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            order.status === 'paid' ? 'bg-green-100 text-green-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {statusConfig[order.status]?.label || order.status.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-3">Items ({order.items.length})</h4>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                  <img src={item.product.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900 truncate">{item.product.name}</h5>
                    <p className="text-sm text-gray-600">₹{item.product.price} × {item.qty}</p>
                  </div>
                  <span className="font-bold text-lg text-[#1E3A8A]">₹{(item.product.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-4">Payment & Delivery</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
                  <p className="text-gray-500 font-mono">{order.paymentId}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{order.address.fullName}</p>
                  <p className="text-gray-600">{order.address.street}</p>
                  <p className="text-gray-600">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full bg-${statusConfig[order.status]?.color}-500`} />
                  <span className="font-bold text-blue-900">Current Status: {statusConfig[order.status]?.label}</span>
                </div>
                <div className="flex gap-2 text-xs text-blue-800">
                  <span>Order Placed → Processing → {order.status === 'delivered' ? 'Delivered' : order.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 mt-6">
          <div className="flex-1 font-mono text-2xl font-bold text-[#1E3A8A]">
            Total: ₹{order.grandTotal.toLocaleString('en-IN')}
          </div>
          <div className="flex gap-3">
            <Link href={`/order/${order.id}`} className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white font-bold text-center shadow-lg hover:shadow-xl transition-all">
              View Details
            </Link>
            <Link href="/" className="py-3 px-6 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-md">
              Buy Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user, orders, fetchOrders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [guestOrder, setGuestOrder] = useState<Order | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (user) {
        await fetchOrders();
      } else {
        // Try to load guest order from localStorage
        try {
          const raw = localStorage.getItem('sdg_last_order');
          if (raw) {
            const parsed = JSON.parse(raw) as Order;
            if (!cancelled) setGuestOrder(parsed);
          }
        } catch { /* ignore */ }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, fetchOrders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  // Guest with a recent order
  if (!user && guestOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border p-8 mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-2xl flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Recent Order</h1>
                <p className="text-lg text-gray-600">Placed as guest — login to see full history</p>
              </div>
            </div>
          </div>

          <OrderCard order={guestOrder} />

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F97316] to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all text-center">
              Continue Shopping →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guest with no order
  if (!user) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Orders</h1>
          <p className="text-lg text-gray-600 mb-8">Login to see your full order history</p>
          <Link href="/" className="bg-[#1E3A8A] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#1E3A8A]/90 transition-all shadow-xl">
            Go Shopping →
          </Link>
        </div>
      </div>
    );
  }

  // Logged in user
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border p-8 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-2xl flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
              <p className="text-lg text-gray-600">Track all your recent purchases</p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border p-12 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-lg text-gray-600 mb-8">Your orders will appear here once you make a purchase</p>
            <Link href="/" className="bg-gradient-to-r from-[#F97316] to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order as Order} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F97316] to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
            Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  );
}

