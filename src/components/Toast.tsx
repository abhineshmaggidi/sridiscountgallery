'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { CheckCircle } from 'lucide-react';

export default function Toast() {
  const { totalItems } = useCart();
  const [show, setShow] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    if (totalItems > prevCount) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(t);
    }
    setPrevCount(totalItems);
  }, [totalItems, prevCount]);

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-green-500 text-white font-semibold z-[400] flex items-center gap-2 pointer-events-none shadow-lg transition-all duration-300 ${show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
      <CheckCircle className="w-5 h-5" />
      Item added to cart!
    </div>
  );
}
