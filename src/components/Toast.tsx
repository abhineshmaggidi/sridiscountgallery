'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function Toast() {
  const { totalItems } = useCart();
  const [show, setShow] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    if (totalItems > prevCount) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(t);
    }
    setPrevCount(totalItems);
  }, [totalItems, prevCount]);

  useEffect(() => { setPrevCount(totalItems); }, [totalItems]);

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-[#1E3A8A] text-white text-sm font-semibold z-[400] flex items-center gap-2 pointer-events-none shadow-lg transition-all duration-300 ${show ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
      ✓ Added to cart!
    </div>
  );
}
