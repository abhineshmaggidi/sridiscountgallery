'use client';

import { useState, useEffect } from 'react';
import { X, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => { setCurrentImg(0); }, [product]);
  if (!product) return null;

  const discount = product.original ? Math.round((1 - product.price / product.original) * 100) : 0;
  const imgs = product.images;
  const hasMultiple = imgs.length > 1;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="w-full md:max-w-3xl max-h-[90vh] bg-white md:rounded-2xl rounded-t-2xl overflow-y-auto shadow-2xl animate-modal-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="bg-white flex flex-col relative">
            <div className="flex-1 flex items-center justify-center p-4 md:p-6 min-h-[200px] md:min-h-[350px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgs[currentImg]} alt={product.name} className="max-w-full max-h-[200px] md:max-h-[300px] object-contain" />
              {hasMultiple && (
                <>
                  <button type="button" onClick={() => setCurrentImg(i => (i - 1 + imgs.length) % imgs.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button type="button" onClick={() => setCurrentImg(i => (i + 1) % imgs.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium">
                    {currentImg + 1}/{imgs.length}
                  </div>
                </>
              )}
            </div>
            {hasMultiple && (
              <div className="flex gap-2 px-3 pb-3">
                {imgs.map((img, i) => (
                  <button type="button" key={i} onClick={() => setCurrentImg(i)}
                    className={`w-11 h-11 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 ${i === currentImg ? 'border-[#1E3A8A]' : 'border-gray-200 opacity-50'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-4 md:p-8 border-t md:border-t-0 md:border-l border-gray-100">
            <button type="button" onClick={onClose} className="float-right w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
            <p className="text-[10px] md:text-[11px] font-mono text-gray-400 tracking-[2px] uppercase mb-1">{product.brand}</p>
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 pr-10">{product.name}</h2>
            <div className="flex items-center gap-2 text-sm text-[#F97316] mb-4">★ {product.rating} <span className="text-gray-400">({product.reviews} reviews)</span></div>

            <div className="flex items-baseline gap-2 mb-4 md:mb-5">
              <span className="font-mono text-2xl md:text-3xl font-bold text-[#1E3A8A]">₹{product.price.toLocaleString('en-IN')}</span>
              {product.original > product.price && <span className="text-sm text-gray-400 line-through">₹{product.original.toLocaleString('en-IN')}</span>}
              {discount > 0 && <span className="px-2 py-0.5 rounded bg-red-50 text-red-500 text-[11px] font-bold">-{discount}%</span>}
            </div>

            <div className="mb-4">
              {product.specSheet.map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 text-[12px] md:text-[13px]">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-700">{value}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-gray-400 mb-4">🚚 Delivery: ₹99 per item</p>

            <div className="flex gap-2">
              <button type="button" onClick={() => { addItem(product); onClose(); }}
                className="flex-1 py-3 rounded-xl bg-[#F97316] text-white font-semibold text-[14px] active:opacity-80">
                Add to Cart
              </button>
              <button type="button" className="w-11 h-11 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
