'use client';

import { useState, useEffect } from 'react';
import { X, User, Package, MapPin, LogOut, Menu, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, toggleLogin } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg border border-gray-200 bg-white text-gray-600">
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 md:hidden" onClick={() => setIsOpen(false)}>
          <div className="w-64 h-full bg-white border-r border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-xl font-bold text-[#1E3A8A]">Menu</span>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              {user ? (
                <>
                  <Link href="/profile/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>
                    <Package className="w-5 h-5" />
                    <span>My Orders</span>
                  </Link>
                  <Link href="/profile/address" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>
                    <MapPin className="w-5 h-5" />
                    <span>My Address</span>
                  </Link>
                  <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-red-500 font-medium">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link href="#" onClick={(e) => { e.preventDefault(); toggleLogin(); setIsOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-[#1E3A8A] font-medium">
                  Login
                </Link>
              )}
              <Link href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>
                <ShoppingBag className="w-5 h-5" />
                <span>Cart ({totalItems})</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

