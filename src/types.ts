export interface Product {
  id: number;
  category: string;
  emoji: string;
  image: string;
  images: string[];
  brand: string;
  name: string;
  specs: string;
  price: number;
  original: number;
  rating: number;
  reviews: number;
  badge: string | null;
  specSheet: string[][];
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  count: number;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  address: Address;
  total: number;
  confirmationCharge: number;
  convenienceFee?: number;
  grandTotal: number;
  status: 'placed' | 'pending' | 'pending_payment' | 'confirmed' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'cancelled_no_payment';
  date: string;
  paymentId: string;
  paymentMethod: string;
  customerEmail: string;
  customerName: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  // New COD fields
  payment_status?: 'pending' | 'paid' | 'cod_advance_paid' | 'cod_pending' | 'cancelled_no_payment';
  cod_advance_paid?: number;
  cod_advance_payment_id?: string;
  amount_due_on_delivery?: number;
}

export type CheckoutStep = 'address' | 'payment' | 'confirmation' | 'tracking';
