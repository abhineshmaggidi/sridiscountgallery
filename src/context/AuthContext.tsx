'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';

interface DBUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: DBUser | null;
  orders: Order[];
  isLoginOpen: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<string | null>;
  logout: () => void;
  toggleLogin: () => void;
  addOrder: (order: Order) => Promise<void>;
  fetchOrders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DBUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem('sdg_user') : null;
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
      }
    } catch { /* ignore — Safari private mode or storage disabled */ }
  }, []);

  // Fetch orders when user changes
  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const login = async (email: string, password: string): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password', password)
        .single();

      if (error || !data) {
        setLoading(false);
        return 'Invalid email or password';
      }

      const dbUser: DBUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        is_admin: data.is_admin || false,
      };
      setUser(dbUser);
      try { sessionStorage.setItem('sdg_user', JSON.stringify(dbUser)); } catch { /* ignore */ }
      setIsLoginOpen(false);
      setLoading(false);
      return null;
    } catch {
      setLoading(false);
      return 'Something went wrong. Please try again.';
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<string | null> => {
    setLoading(true);
    try {
      // Check if user exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existing) {
        setLoading(false);
        return 'An account with this email already exists';
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password,
          is_admin: false,
        })
        .select()
        .single();

      if (error || !data) {
        setLoading(false);
        return error?.message || 'Failed to create account';
      }

      const dbUser: DBUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        is_admin: false,
      };
      setUser(dbUser);
      try { sessionStorage.setItem('sdg_user', JSON.stringify(dbUser)); } catch { /* ignore */ }
      setIsLoginOpen(false);
      setLoading(false);
      return null;
    } catch {
      setLoading(false);
      return 'Something went wrong. Please try again.';
    }
  };

  const logout = () => {
    setUser(null);
    setOrders([]);
    try { sessionStorage.removeItem('sdg_user'); } catch { /* ignore */ }
  };

  const toggleLogin = () => setIsLoginOpen(prev => !prev);

  const addOrder = async (order: Order) => {
    try {
      await supabase.from('orders').insert({
        id: order.id,
        user_id: user?.id || null,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        items: order.items.map(i => ({
          productId: i.product.id,
          name: i.product.name,
          brand: i.product.brand,
          price: i.product.price,
          image: i.product.image,
          qty: i.qty,
        })),
        address: order.address,
        subtotal: order.total,
        delivery_charge: order.deliveryCharge,
        grand_total: order.grandTotal,
        payment_method: order.paymentMethod,
        payment_id: order.paymentId || '',
        status: order.status,
      });

      // Add to local state too
      setOrders(prev => [order, ...prev]);
    } catch (err) {
      console.error('Failed to save order:', err);
      // Still add locally even if DB fails
      setOrders(prev => [order, ...prev]);
    }
  };

  const fetchOrders = async () => {
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

      // If not admin, only fetch own orders
      if (user && !user.is_admin) {
        query = query.eq('customer_email', user.email);
      }

      const { data } = await query;

      if (data) {
        const mapped: Order[] = data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          items: (d.items as Array<{ productId: number; name: string; brand: string; price: number; image: string; qty: number }>).map((item) => ({
            product: {
              id: item.productId,
              name: item.name,
              brand: item.brand,
              price: item.price,
              image: item.image,
              original: item.price,
              category: '', emoji: '', images: [], specs: '', rating: 0, reviews: 0, badge: null, specSheet: [],
            },
            qty: item.qty,
          })),
          address: d.address as Order['address'],
          total: d.subtotal as number,
          deliveryCharge: d.delivery_charge as number,
          grandTotal: d.grand_total as number,
          status: d.status as Order['status'],
          date: new Date(d.created_at as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          paymentId: d.payment_id as string,
          paymentMethod: d.payment_method as string,
          customerEmail: d.customer_email as string,
          customerName: d.customer_name as string,
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, orders, isLoginOpen, loading, login, signup, logout, toggleLogin, addOrder, fetchOrders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
