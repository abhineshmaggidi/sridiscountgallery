'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Package, ShoppingBag, TrendingUp, Users, Edit3, Trash2, Eye, Search, Filter, ChevronRight, MapPin, CreditCard, Truck, Loader2, RefreshCw } from 'lucide-react';
import { products, categories } from '@/data/products';
import { supabase } from '@/lib/supabase';

type Tab = 'overview' | 'products' | 'orders' | 'customers';

interface DBOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  items: { productId: number; name: string; brand: string; price: number; image: string; qty: number }[];
  address: { fullName: string; phone: string; street: string; city: string; state: string; pincode: string };
  subtotal: number;
  delivery_charge: number;
  grand_total: number;
  payment_method: string;
  payment_id: string;
  status: string;
  created_at: string;
}

interface DBUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-600 border-blue-200',
  shipped: 'bg-purple-50 text-purple-600 border-purple-200',
  delivered: 'bg-green-50 text-green-600 border-green-200',
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [searchQ, setSearchQ] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
  const [dbOrders, setDbOrders] = useState<DBOrder[]>([]);
  const [dbUsers, setDbUsers] = useState<DBUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch orders and users from Supabase
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [ordersRes, usersRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false }),
      ]);
      if (ordersRes.data) setDbOrders(ordersRes.data as DBOrder[]);
      if (usersRes.data) setDbUsers(usersRes.data as DBUser[]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoadingData(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    setDbOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const totalRevenue = dbOrders.reduce((s, o) => s + o.grand_total, 0);
  const filteredProducts = searchQ
    ? products.filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.brand.toLowerCase().includes(searchQ.toLowerCase()))
    : products;

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <a href="/" className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#1E3A8A] hover:border-[#1E3A8A]/30 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><span className="text-[#1E3A8A]">SRI</span> Admin Dashboard</h1>
            <p className="text-[12px] text-gray-400">Manage your store</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#1E3A8A] hover:border-[#1E3A8A]/30 transition-all" title="Refresh data">
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-sm font-bold">A</div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-65px)] p-3 hidden md:block">
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setTab(item.key); setSelectedOrder(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${tab === item.key ? 'bg-[#1E3A8A]/10 text-[#1E3A8A]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
              {item.icon} {item.label}
              {item.key === 'orders' && dbOrders.length > 0 && (
                <span className="ml-auto text-[11px] bg-[#F97316] text-white px-1.5 py-0.5 rounded-full font-bold">{dbOrders.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile tab bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-40">
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setTab(item.key); setSelectedOrder(null); }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-all ${tab === item.key ? 'text-[#1E3A8A]' : 'text-gray-400'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">

          {/* Loading */}
          {loadingData && !selectedOrder && (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading data from database...
            </div>
          )}

          {/* ═══ ORDER DETAIL ═══ */}
          {selectedOrder && (
            <div>
              <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1E3A8A] mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  {/* Order items */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="font-mono text-lg font-bold text-[#1E3A8A]">{selectedOrder.id}</p>
                        <p className="text-sm text-gray-400">{new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[12px] font-bold uppercase tracking-wide border ${statusColors[selectedOrder.status] || statusColors.pending}`}>
                        {selectedOrder.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Items Ordered</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-1.5 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                            <p className="text-[12px] text-gray-400">{item.brand} • Qty: {item.qty}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-gray-800">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                            <p className="text-[11px] text-gray-400">+ ₹{(item.qty * 99)} delivery</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span><span className="font-mono">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Delivery</span><span className="font-mono">₹{selectedOrder.delivery_charge.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Grand Total</span><span className="font-mono text-[#1E3A8A]">₹{selectedOrder.grand_total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Update Status */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Update Status</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['pending', 'confirmed', 'shipped', 'delivered'] as const).map(s => (
                        <button key={s} onClick={() => updateOrderStatus(selectedOrder.id, s)}
                          className={`py-2.5 rounded-xl text-sm font-semibold capitalize border transition-all ${selectedOrder.status === s ? statusColors[s] + ' ring-2 ring-offset-1 ring-current' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar cards */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Customer</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center text-base font-bold">{selectedOrder.customer_name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-gray-800">{selectedOrder.customer_name}</p>
                        <p className="text-[13px] text-gray-400">{selectedOrder.customer_email}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{selectedOrder.address.phone}</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Delivery Address</h3>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold text-gray-800">{selectedOrder.address.fullName}</p>
                      <p className="text-gray-600">{selectedOrder.address.street}</p>
                      <p className="text-gray-600">{selectedOrder.address.city}, {selectedOrder.address.state}</p>
                      <p className="font-mono text-gray-700">{selectedOrder.address.pincode}</p>
                      <p className="text-gray-500 mt-2">{selectedOrder.address.phone}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between"><span className="text-gray-400">Method</span><span className="font-medium text-gray-700">{selectedOrder.payment_method}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Payment ID</span><span className="font-mono text-[13px] text-gray-700">{selectedOrder.payment_id}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="font-mono font-bold text-[#1E3A8A]">₹{selectedOrder.grand_total.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Status</span><span className="text-green-600 font-semibold">Paid ✓</span></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Truck className="w-4 h-4" /> Delivery</h3>
                    <div className="ml-1">
                      {[
                        { label: 'Order Placed', done: true },
                        { label: 'Confirmed', done: ['confirmed', 'shipped', 'delivered'].includes(selectedOrder.status) },
                        { label: 'Shipped', done: ['shipped', 'delivered'].includes(selectedOrder.status) },
                        { label: 'Delivered', done: selectedOrder.status === 'delivered' },
                      ].map((t, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${t.done ? 'bg-green-500' : 'bg-gray-200'}`} />
                            {i < 3 && <div className={`w-0.5 h-6 ${t.done ? 'bg-green-500' : 'bg-gray-200'}`} />}
                          </div>
                          <p className={`text-[13px] pb-3 ${t.done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{t.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ OVERVIEW ═══ */}
          {!selectedOrder && !loadingData && tab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Products', value: products.length, icon: <Package className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
                  { label: 'Orders', value: dbOrders.length, icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
                  { label: 'Customers', value: dbUsers.filter(u => !u.is_admin).length, icon: <Users className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>{stat.icon}</div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[13px] text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
              {dbOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No orders yet</p>
                  <p className="text-sm mt-1">Orders will appear here when customers place them</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-[12px] uppercase tracking-wide">Order</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-[12px] uppercase tracking-wide">Customer</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-[12px] uppercase tracking-wide">Total</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-[12px] uppercase tracking-wide">Status</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-[12px] uppercase tracking-wide">Date</th>
                        <th className="px-5 py-3"></th>
                      </tr></thead>
                      <tbody>
                        {dbOrders.slice(0, 10).map(o => (
                          <tr key={o.id} onClick={() => setSelectedOrder(o)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors">
                            <td className="px-5 py-3.5 font-mono font-semibold text-[#1E3A8A] text-[13px]">{o.id}</td>
                            <td className="px-5 py-3.5 text-gray-700">{o.customer_name}</td>
                            <td className="px-5 py-3.5 font-mono font-semibold text-gray-800">₹{o.grand_total.toLocaleString('en-IN')}</td>
                            <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${statusColors[o.status] || statusColors.pending}`}>{o.status}</span></td>
                            <td className="px-5 py-3.5 text-gray-400">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                            <td className="px-5 py-3.5 text-gray-300"><ChevronRight className="w-4 h-4" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900 mb-4 mt-8">Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                    <span className="text-2xl">{cat.emoji}</span>
                    <div><p className="font-semibold text-gray-800 text-sm">{cat.name}</p><p className="text-[12px] text-gray-400 font-mono">{cat.count} items</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ PRODUCTS ═══ */}
          {!selectedOrder && !loadingData && tab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Products ({filteredProducts.length})</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#1E3A8A] transition-all w-44" />
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-sm font-semibold hover:bg-[#2548a8] transition-all">+ Add</button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-[12px] uppercase tracking-wide">Product</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-[12px] uppercase tracking-wide">Category</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-[12px] uppercase tracking-wide">Price</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-[12px] uppercase tracking-wide">Original</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-[12px] uppercase tracking-wide">Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain" /></div>
                            <div><p className="font-semibold text-gray-800 text-[13px]">{p.name}</p><p className="text-[11px] text-gray-400">{p.brand}</p></div></div></td>
                          <td className="px-5 py-3 text-gray-500 text-[13px] capitalize">{p.category}</td>
                          <td className="px-5 py-3 font-mono font-semibold text-[#1E3A8A]">₹{p.price.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 font-mono text-gray-400 line-through text-[13px]">₹{p.original.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3"><div className="flex gap-1">
                            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1E3A8A] hover:border-[#1E3A8A]/30 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#F97316] hover:border-[#F97316]/30 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ ORDERS ═══ */}
          {!selectedOrder && !loadingData && tab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Orders ({dbOrders.length})</h2>
                <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-[#1E3A8A]/30 transition-all">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>
              {dbOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dbOrders.map(o => (
                    <div key={o.id} onClick={() => setSelectedOrder(o)} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 cursor-pointer transition-all group">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-mono font-bold text-[#1E3A8A]">{o.id}</p>
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${statusColors[o.status] || statusColors.pending}`}>{o.status}</span>
                          </div>
                          <p className="text-sm text-gray-700 font-medium">{o.customer_name}</p>
                          <p className="text-[13px] text-gray-400">{o.items.reduce((s: number, i: { qty: number }) => s + i.qty, 0)} items • {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {o.payment_method}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-mono text-xl font-bold text-gray-900">₹{o.grand_total.toLocaleString('en-IN')}</p>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1E3A8A] transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ CUSTOMERS ═══ */}
          {!selectedOrder && !loadingData && tab === 'customers' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customers ({dbUsers.filter(u => !u.is_admin).length})</h2>
              {dbUsers.filter(u => !u.is_admin).length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No customers yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dbUsers.filter(u => !u.is_admin).map(u => {
                    const customerOrders = dbOrders.filter(o => o.customer_email === u.email);
                    const totalSpent = customerOrders.reduce((s, o) => s + o.grand_total, 0);
                    return (
                      <div key={u.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center text-lg font-bold">{u.name.charAt(0)}</div>
                            <div>
                              <p className="font-bold text-gray-800">{u.name}</p>
                              <p className="text-[13px] text-gray-400">{u.email} • {u.phone || 'No phone'}</p>
                              <p className="text-[12px] text-gray-400">Joined {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-[#1E3A8A]">₹{totalSpent.toLocaleString('en-IN')}</p>
                            <p className="text-[12px] text-gray-400">{customerOrders.length} order{customerOrders.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        {customerOrders.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {customerOrders.map(co => (
                              <div key={co.id} onClick={() => setSelectedOrder(co)} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-all group">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-[13px] font-semibold text-[#1E3A8A]">{co.id}</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusColors[co.status] || statusColors.pending}`}>{co.status}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-semibold text-gray-700">₹{co.grand_total.toLocaleString('en-IN')}</span>
                                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1E3A8A] transition-colors" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
