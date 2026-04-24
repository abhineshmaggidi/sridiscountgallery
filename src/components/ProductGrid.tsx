'use client';

import { Product } from '@/types';
import { products } from '@/data/products';
import ProductCard from './ProductCard';

interface ProductGridProps {
  filter: string;
  searchQuery: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'all', label: 'All' },
  { id: 'projector', label: '📽️ Projectors' },
  { id: 'bed', label: '🛋️ Beds & Sofa' },
  { id: 'massager', label: '💆 Massagers' },
  { id: 'tools', label: '🛠️ Tools' },
  { id: 'kids', label: '👶 Kids' },
  { id: 'camera', label: '📷 Camera' },
  { id: 'earbuds', label: '🎧 Earbuds' },
];

export default function ProductGrid({ filter, searchQuery, onFilterChange }: ProductGridProps) {
  let filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) || p.specs.toLowerCase().includes(q)
    );
  }

  return (
    <section className="px-3 md:px-12 py-6 md:py-8 pb-12 md:pb-20" id="products">
      <h2 className="text-lg md:text-3xl font-bold tracking-tight text-gray-900 mb-4 md:mb-8">Our Products</h2>

      <div className="flex gap-2 mb-4 md:mb-7 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap">
        {filters.map((f) => (
          <button type="button" key={f.id} onClick={() => onFilterChange(f.id)}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-[11px] md:text-[13px] font-medium whitespace-nowrap shrink-0 ${
              filter === f.id ? 'border-[#1E3A8A] bg-[#1E3A8A]/10 text-[#1E3A8A]' : 'border-gray-200 bg-white text-gray-500'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-medium text-gray-600">No products found</p>
        </div>
      )}
    </section>
  );
}

