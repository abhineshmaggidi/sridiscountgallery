# COD Convenience Fee Implementation — TODO

## Goal
Add ₹99 convenience fee when user chooses COD. On clicking COD, redirect to Razorpay payment of ₹99 only to confirm order.

## Steps
- [ ] 1. Update `src/lib/pricing.ts` — apply ₹99 convenienceFee for COD, update grandTotal/payNowAmount/payOnDeliveryAmount
- [ ] 2. Update `src/app/api/orders/create/route.ts` — apply COD fee in DB creation, set `pending_payment` for both methods
- [ ] 3. Update `src/app/checkout/page.tsx` — use `pricing.payNowAmount` in Razorpay, COD card triggers Razorpay ₹99 payment, remove direct `placeCodOrder`, update confirmation UI
- [ ] 4. Update `src/components/CheckoutModal.tsx` — COD button redirects to `/checkout?payment=cod`
- [ ] 5. Build and verify compilation

