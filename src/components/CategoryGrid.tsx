'use client';

import { categories } from '@/data/products';

interface CategoryGridProps {
  onCategoryClick: (category: string) => void;
}

export default function CategoryGrid({ onCategoryClick }: CategoryGridProps) {
  return (
    <section id="categories" className="px-3 md:px-12 py-8 md:py-16">
      <h2 className="text-lg md:text-3xl font-bold tracking-tight text-gray-900 mb-5 md:mb-8">Shop by Category</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 md:gap-3">
        {categories.map((cat) => (
          <button type="button" key={cat.id} onClick={() => onCategoryClick(cat.id)}
            className="flex flex-col items-center gap-1.5 md:gap-3 py-4 md:py-7 px-2 md:px-4 rounded-xl border border-gray-200 bg-white active:bg-blue-50 active:border-[#1E3A8A]/30 transition-colors">
            <span className="text-2xl md:text-3xl">{cat.emoji}</span>
            <span className="text-[10px] md:text-[13px] font-semibold text-gray-700 text-center leading-tight">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
