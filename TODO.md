# COD Simplification — TODO

## Goal
Change COD from "Pay ₹99 convenience fee online" to simple "COD (Cash on Delivery)" with no upfront payment.

## Steps
- [x] 1. `src/lib/pricing.ts` — Set convenienceFee=0, grandTotal=subtotal, payNowAmount=0, payOnDeliveryAmount=subtotal for COD
- [x] 2. `src/app/checkout/page.tsx` — Remove COD fee UI, add direct COD order placement (`placeCodOrder()`), skip Razorpay for COD
- [x] 3. `src/components/CheckoutModal.tsx` — Remove COD fee UI, direct `placeOrder('Cash on Delivery')` with no confirmation step
- [x] 4. `src/app/api/orders/create/route.ts` — Set convenienceFee=0, grandTotal=subtotal for COD
- [x] 5. `src/types.ts` — Added `cod_pending` to `payment_status` union
- [x] 6. `src/app/profile/orders/page.tsx` — Conditionally show COD breakdown; hide "convenience fee paid" when 0
- [x] 7. Build verified — compiles cleanly with 0 errors

## Summary of Changes

### What changed
- **No more ₹99 convenience fee** for COD orders
- **No Razorpay payment** required for COD — orders are placed directly
- **Full amount** (`subtotal`) is due on delivery in cash
- **Online payments** (Razorpay/UPI) remain unchanged

### Files modified
| File | Changes |
|------|---------|
| `src/lib/pricing.ts` | `convenienceFee=0`, `grandTotal=subtotal`, `payNowAmount=0` for COD |
| `src/app/checkout/page.tsx` | Added `placeCodOrder()`, simplified COD card, removed confirmation dialog |
| `src/components/CheckoutModal.tsx` | Direct COD placement, no fee, no confirmation step |
| `src/app/api/orders/create/route.ts` | `convenienceFee=0`, `grandTotal=subtotal` for COD |
| `src/types.ts` | Added `'cod_pending'` to `payment_status` |
| `src/app/profile/orders/page.tsx` | Conditional COD breakdown display |
