'use client';

import { Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ProfileButton } from '@/components/LoginModal';
import SideMenu from './SideMenu';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const { totalItems, toggleCart } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Main bar */}
      <div className="flex items-center justify-between px-3 md:px-10 h-14 md:h-16">
        <div
          className="flex items-center gap-1 cursor-pointer select-none shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-[15px] md:text-xl font-black tracking-wide text-[#1E3A8A]">Sri</span>
          <span className="text-[15px] md:text-xl font-bold tracking-wide text-[#F97316]">Discount</span>
          <span className="text-[15px] md:text-xl font-bold tracking-wide text-gray-600">Gallery</span>
        </div>

        {/* Desktop search */}
        <div className="flex-1 max-w-md mx-4 relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full py-2.5 pl-10 pr-4 rounded-full border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium placeholder:text-gray-400 outline-none focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <SideMenu />
          <ProfileButton />
          <button
            type="button"
            onClick={toggleCart}
            className="relative w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-500 flex items-center justify-center"
          >
            <ShoppingBag className="w-[18px] h-[18px]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-[#F97316] text-white text-[11px] font-bold flex items-center justify-center px-1 border-2 border-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-3 pb-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full py-2.5 pl-9 pr-4 rounded-full border border-gray-200 bg-gray-50 text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:border-[#1E3A8A] transition-all"
          />
        </div>
      </div>
    </header>
  );
}

