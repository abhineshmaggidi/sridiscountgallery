'use client';

import { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Share2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { useRouter, useParams } from 'next/navigation';
import { products } from '@/data/products';
import Toast from '@/components/Toast';

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const { addItem, clearCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const prod = products.find(p => p.id.toString() === id);
    setProduct(prod || null);
    setCurrentImg(0);
  }, [id]);

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Product not found</div>;
  }

  const discount = product.original ? Math.round((1 - product.price / product.original) * 100) : 0;
  const imgs = product.images;
  const hasMultiple = imgs.length > 1;

  const shareProduct = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} at Sri Discount Gallery - ${discount > 0 ? `-${discount}% off` : ''}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product URL copied to clipboard!');
    }
  };

  const handleBuyNow = () => {
    // Clear cart and add current product
    clearCart();
    addItem(product);
    
    if (user) {
      // Logged in: Go directly to checkout
      router.push('/checkout');
    } else {
      // Guest: Show guest info form first
      router.push('/checkout?product=' + product.id);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navbar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-3 flex items-center">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="ml-2 font-bold text-gray-900 text-lg flex-1">Product</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images */}
          <div>
            <div className="relative bg-white rounded-2xl shadow-lg p-4">
              <img src={imgs[currentImg]} alt={product.name} className="w-full h-64 md:h-96 object-contain rounded-xl" />
              {hasMultiple && (
                <div className="flex gap-2 mt-4">
                  {imgs.map((img, i) => (
                    <button key={i} onClick={() => setCurrentImg(i)} className={`flex-1 h-20 rounded-xl overflow-hidden border-2 ${i === currentImg ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20' : 'border-gray-200'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover cursor-pointer" />
                    </button>
                  ))}
                </div>
              )}
              <div className="absolute top-4 right-12 z-10">
                <button className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="absolute top-4 right-4 z-10">
                <button onClick={shareProduct} className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            {hasMultiple && (
              <div className="flex gap-2 mt-3 p-1">
                <button onClick={() => setCurrentImg(prev => (prev - 1 + imgs.length) % imgs.length)} className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="flex-1 text-center text-sm font-medium text-gray-600">{currentImg + 1} / {imgs.length}</span>
                <button onClick={() => setCurrentImg(prev => (prev + 1) % imgs.length)} className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">{product.brand}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2 text-lg text-orange-500">
                <span>★ {product.rating}</span>
                <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#1E3A8A]">₹{product.price.toLocaleString('en-IN')}</span>
                {product.original && product.original > product.price && (
                  <span className="text-xl text-gray-400 line-through">₹{product.original.toLocaleString('en-IN')}</span>
                )}
                {discount > 0 && (
                  <span className="ml-2 px-3 py-1 rounded-full bg-red-100 text-red-600 font-bold text-sm">-{discount}%</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">Delivery ₹99</p>
            </div>

            <div className="space-y-3">
              {product.specSheet.map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-600">{key}</span>
                  <span className="text-sm font-bold text-gray-900">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => addItem(product)} 
                className="flex-1 bg-[#F97316] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                className="w-[120px] bg-[#1E3A8A] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Buy Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}

