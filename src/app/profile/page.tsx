'use client';

import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <div className="max-w-md mx-auto p-8 text-center text-gray-500">Please login to view profile.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 md:p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#1E3A8A] mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
        <p className="text-gray-500">{user.email}</p>
        <p className="text-gray-500">{user.phone}</p>
      </div>
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2">
            <a href="/profile/orders" className="p-3 rounded-lg border border-gray-200 hover:border-[#1E3A8A] flex flex-col items-center text-center hover:bg-gray-50 transition-all">
              Orders
            </a>
            <a href="/profile/address" className="p-3 rounded-lg border border-gray-200 hover:border-[#1E3A8A] flex flex-col items-center text-center hover:bg-gray-50 transition-all">
              Address
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

