'use client';

const features = [
  { icon: '🔍', title: 'Smart Search', desc: 'Filter by brand, price, specs and find exactly what you need instantly.', color: 'bg-blue-50 text-[#1E3A8A]' },
  { icon: '🚀', title: 'Express Delivery', desc: 'Fast delivery with real-time order tracking to your doorstep.', color: 'bg-orange-50 text-[#F97316]' },
  { icon: '🔐', title: 'Secure Payments', desc: 'Pay safely with PhonePe, Google Pay, UPI or Cash on Delivery.', color: 'bg-green-50 text-green-700' },
];

export default function Features() {
  return (
    <section id="about" className="px-4 md:px-12 py-12 md:py-20 border-t border-gray-100 bg-gray-50">
      <h2 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 mb-6 md:mb-10">
        Why Shop at Sri Discount Gallery?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {features.map((f) => (
          <div key={f.title} className="p-5 md:p-7 rounded-2xl border border-gray-200 bg-white transition-shadow">
            <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl ${f.color} flex items-center justify-center text-lg md:text-xl mb-3 md:mb-4`}>
              {f.icon}
            </div>
            <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1">{f.title}</h3>
            <p className="text-[12px] md:text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
