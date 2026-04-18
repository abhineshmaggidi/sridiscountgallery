'use client';

const badges = [
  { icon: '🚚', label: 'Free Delivery' },
  { icon: '🛡️', label: '6 Months Warranty' },
  { icon: '✅', label: 'Genuine Products' },
];

export default function TrustBadges() {
  return (
    <div className="flex justify-center gap-4 md:gap-12 px-4 py-6 md:py-8 border-y border-gray-100 bg-gray-50 flex-wrap">
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-2 text-gray-600 text-[12px] md:text-[13px] font-medium">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm md:text-base shadow-sm">
            {b.icon}
          </div>
          {b.label}
        </div>
      ))}
    </div>
  );
}
