'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
}

export default function ProductCard({ product, onOpen }: ProductCardProps) {
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  const badgeStyles: Record<string, string> = {
    sale: 'bg-red-500 text-white',
    new: 'bg-[#1E3A8A] text-white',
    hot: 'bg-[#F97316] text-white',
  };
  const badgeLabels: Record<string, string> = {
    sale: '% SALE', new: '★ NEW', hot: '🔥 HOT',
  };
  const discount = product.original > product.price ? Math.round((1 - product.price / product.original) * 100) : 0;

  return (
    <div className="relative rounded-xl md:rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {product.badge && (
        <span className={`absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-[9px] md:text-[11px] font-bold uppercase ${badgeStyles[product.badge]}`}>
          {badgeLabels[product.badge]}
        </span>
      )}

      <button type="button" onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
        aria-label="Add to wishlist"
        className={`absolute top-2 right-2 z-10 w-9 h-9 md:w-7 md:h-7 rounded-full border flex items-center justify-center ${wishlisted ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
        <Heart className="w-4 h-4 md:w-3 md:h-3" fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Image */}
      <div className="h-36 md:h-52 flex items-center justify-center bg-white p-3 cursor-pointer" onClick={() => onOpen(product)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-2.5 md:p-4 border-t border-gray-100">
        <p className="text-[9px] md:text-[10px] font-mono font-medium text-gray-400 tracking-wider uppercase">{product.brand}</p>
        <h3 className="text-[12px] md:text-[15px] font-semibold text-gray-800 leading-tight mb-1 line-clamp-2 cursor-pointer" onClick={() => onOpen(product)}>
          {product.name}
        </h3>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="font-mono text-[14px] md:text-lg font-bold text-[#1E3A8A]">₹{product.price.toLocaleString('en-IN')}</span>
          {discount > 0 && (
            <>
              <span className="text-[10px] md:text-[12px] text-gray-400 line-through">₹{product.original.toLocaleString('en-IN')}</span>
              <span className="text-[9px] md:text-[11px] text-red-500 font-bold">-{discount}%</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] md:text-[12px] text-[#F97316] font-semibold mb-2">
          ★ {product.rating} <span className="text-gray-400 font-normal">({product.reviews})</span>
        </div>

        {/* Always visible Add to Cart */}
        <button type="button" onClick={(e) => { e.stopPropagation(); addItem(product); }}
          className="w-full py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#F97316] text-white text-[12px] md:text-[13px] font-semibold active:opacity-80">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
