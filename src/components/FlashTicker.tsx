'use client';

import { products } from '@/data/products';

export default function FlashTicker() {
  const tickerItems = products.map(p => {
    const discount = Math.round((1 - p.price / p.original) * 100);
    return { emoji: p.emoji, text: `${p.name} — ₹${p.price.toLocaleString('en-IN')} (${discount}% OFF)` };
  });
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="bg-[#1E3A8A] py-2 overflow-hidden">
      <div className="flex gap-12 animate-ticker whitespace-nowrap w-max">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[12px] md:text-[13px] font-medium text-white">
            <span className="text-amber-300">⚡</span>
            <span>{item.emoji} {item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
