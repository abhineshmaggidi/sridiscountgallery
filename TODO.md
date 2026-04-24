# Checkout Overhaul TODO

## Plan Overview
Replace the broken checkout with proper Razorpay integration, UPI redirection (PhonePe/Google Pay), Cash on Delivery, and allow guest checkout without login.

## Steps
- [x] 1. Fix `src/app/api/razorpay/orders/route.ts` — remove double `*100` multiplication
- [x] 2. Rewrite `src/app/checkout/page.tsx` — proper Razorpay script injection, UPI fallbacks, COD, validation, guest flow
- [x] 3. Update `src/app/profile/orders/page.tsx` — allow guest order viewing from localStorage
- [x] 4. Update `src/types.ts` — sync Order type with all statuses
- [x] 5. Test build (`npm run build`) — PASSED ✅

