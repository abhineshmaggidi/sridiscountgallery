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
  badge: 'sale' | 'new' | 'hot' | null;
  specSheet: [string, string][];
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  count: number;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
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
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  date: string;
  paymentId?: string;
  paymentMethod: string;
  customerEmail: string;
  customerName: string;
}

export type CheckoutStep = 'address' | 'payment' | 'confirmation' | 'tracking';
