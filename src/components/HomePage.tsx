'use client';

import { useState, useRef } from 'react';
import { Product } from '@/types';
import Navbar from '@/components/Navbar';
import FlashTicker from '@/components/FlashTicker';
import Hero from '@/components/Hero';
import TrustBadges from '@/components/TrustBadges';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import LoginModal from '@/components/LoginModal';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';

export default function HomePage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (category: string) => {
    setFilter(category);
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <FlashTicker />
      <Hero />
      <TrustBadges />
      <CategoryGrid onCategoryClick={handleCategoryClick} />

      <div ref={productsRef}>
        <ProductGrid
          filter={filter}
          searchQuery={searchQuery}
          onFilterChange={setFilter}
          onProductOpen={setSelectedProduct}
        />
      </div>

      <Features />
      <Footer />

      {/* Overlays */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <LoginModal />
      <Toast />
    </>
  );
}
