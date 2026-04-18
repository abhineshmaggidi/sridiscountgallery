'use client';

export default function Hero() {
  return (
    <section id="about" className="relative flex items-center justify-center px-4 md:px-12 py-12 md:py-16 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 text-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-[#1E3A8A]/5 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#F97316]/5 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-gray-900 mb-4 animate-fade-up">
          Best Deals at <span className="text-[#1E3A8A]">Lowest Prices</span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed animate-fade-up-delay-1">
          Discover the latest gadgets, home essentials, kids products, and more. Unbeatable discounts, fast delivery, and genuine warranty.
        </p>
      </div>
    </section>
  );
}
