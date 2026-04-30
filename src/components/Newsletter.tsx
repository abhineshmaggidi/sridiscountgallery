'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
      setEmail('');
      
      // Reset after 3 seconds
      setTimeout(() => setSubscribed(false), 3000);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-orange-500 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Stay Updated with Best Deals! 📧
        </h2>
        <p className="text-blue-50 mb-6">
          Subscribe to our newsletter and get exclusive discounts, new product alerts, and special offers.
        </p>

        {subscribed ? (
          <div className="bg-white text-green-600 px-6 py-3 rounded-lg inline-block font-semibold">
            ✅ Successfully subscribed! Check your email.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-gray-800"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        <p className="text-blue-100 text-sm mt-4">
          🔒 We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
