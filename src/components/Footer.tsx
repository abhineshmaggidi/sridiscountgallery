'use client';

const footerLinks = [
  { label: 'About', target: 'about' },
  { label: 'Products', target: 'products' },
  { label: 'Support', target: 'contact' },
  { label: 'Returns', target: 'contact' },
  { label: 'Contact', target: 'contact' },
];

export default function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="px-4 md:px-12 py-10 md:py-12 border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Full logo */}
        <div className="flex items-center justify-center gap-1.5 mb-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="text-lg md:text-xl font-black tracking-wide text-[#1E3A8A]">Sri</span>
          <span className="text-lg md:text-xl font-bold tracking-wide text-[#F97316]">Discount</span>
          <span className="text-lg md:text-xl font-bold tracking-wide text-gray-600">Gallery</span>
        </div>

        <p className="text-[12px] md:text-[13px] text-gray-400 mb-5 max-w-md mx-auto">
          Your one-stop shop for the best deals on gadgets, home essentials, kids products, and more.
        </p>

        {/* Links that scroll to sections */}
        <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
          {footerLinks.map(link => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.target)}
              className="text-[12px] md:text-[13px] text-gray-500 font-medium active:text-[#1E3A8A] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Contact info */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-[12px] text-gray-400">
            📧 support@sridiscountgallery.com &nbsp;•&nbsp; 📞 +91 92595 95943
          </p>
        </div>
      </div>
    </footer>
  );
}
