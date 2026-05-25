# Razorpay Integration Audit — RentSetGo

**Date:** 2026-05-20  
**Stack:** Next.js 16 App Router · Server Actions · Supabase · Vercel · `razorpay@2.9.6`

---

## Executive summary

| Area | Status |
|------|--------|
| SDK installed | ✅ |
| Test keys in env | ✅ (with fixes applied) |
| Order creation | ✅ Server Action (not `/api/create-order`) |
| Signature verification | ✅ Fixed (timing-safe + order/payment validation) |
| Frontend checkout | ✅ |
| Webhook | ✅ Added (`/api/razorpay/webhook`) — needs Vercel env + Dashboard setup |
| Subscription → Supabase | ✅ |
| Production readiness | ⚠️ **Test mode OK** — not live-ready until `rzp_live_*` keys + webhook secret |

---

## 1. What is configured correctly

### SDK & architecture
- `razorpay` npm package in `package.json`.
- Server-only client in `lib/subscription/razorpay-server.ts`.
- No secret key in client components; checkout uses **public** `key_id` only.

### Order creation (`createRazorpayOrder` server action)
- Amount in **paise** (`priceInr * 100`).
- Currency `INR`.
- Receipt + **notes** (`user_id`, `plan_id`) for audit and webhook.
- Requires authenticated user.

### Payment verification (after fixes)
- HMAC SHA256 `order_id|payment_id` with **timing-safe** compare.
- Fetches payment from Razorpay API (status + order match).
- Fetches order from Razorpay API (amount + notes vs plan + user).
- Only then updates `profiles` in Supabase.

### Frontend (`components/pricing/checkout-modal.tsx`)
- Loads `checkout.razorpay.com/v1/checkout.js` on demand.
- Uses `order_id` from server (correct flow).
- `handler` calls server `verifyAndActivateSubscription` (does not trust client alone).
- Loading / success / error UI.
- `payment.failed` handler added.

### Subscription unlock
- `activatePlanForUser` sets `subscription_status`, `subscription_plan`, `subscription_expiry` (+1 month).
- `lib/ai/subscription.ts` enforces poster limits from plan.
- `generatePropertyPoster` checks `canGeneratePoster()`.

### Dev experience
- Demo activation when keys missing (non-production).
- Demo button hidden in production when Razorpay is configured.

---

## 2. What was broken (fixed in this audit)

| Issue | Risk | Fix |
|-------|------|-----|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` empty | Checkout could fail if server fallback removed | Set to same value as `RAZORPAY_KEY_ID` in `.env.local` |
| Client `planId` trusted after pay | **Critical** — pay ₹299, activate Business | Server validates order amount + `notes.plan_id` + `user_id` |
| No payment API check | Forged success callback | `validateRazorpayPayment()` |
| `===` signature compare | Timing side-channel | `crypto.timingSafeEqual` |
| No webhook | Paid but tab closed → no activation | `/api/razorpay/webhook` |
| No test-mode logging | Accidental live keys | `isRazorpayTestMode()` + logs |

---

## 3. What is still missing (your action items)

### Vercel environment variables
Set for **Production** and **Preview**:

```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...   # same as KEY_ID
RAZORPAY_WEBHOOK_SECRET=whsec_...          # from Razorpay Dashboard
SUPABASE_SERVICE_ROLE_KEY=...              # required for webhook
```

### Razorpay Dashboard
1. **Test mode** → API Keys (confirm `rzp_test_` prefix).
2. **Webhooks** → URL: `https://YOUR_DOMAIN/api/razorpay/webhook`
3. Events: `payment.captured` (and optionally `order.paid`).
4. Copy webhook secret → `RAZORPAY_WEBHOOK_SECRET`.

### Supabase
- Ensure RLS allows users to **update own** `profiles` subscription fields (or webhook uses service role — recommended).

### Optional improvements
- `payments` table (order_id, payment_id, user_id, plan_id, status) for support/refunds.
- Idempotency: skip activation if already active for same payment_id.
- Email receipt via Resend after activation.

---

## 4. Security audit

| Check | Result |
|-------|--------|
| Secret only on server | ✅ `RAZORPAY_KEY_SECRET` never in client bundle |
| Public key in browser | ✅ Expected (`NEXT_PUBLIC_*` or returned `keyId`) |
| Signature verified server-side | ✅ |
| Plan/amount verified server-side | ✅ (after fix) |
| Webhook signature | ✅ when `RAZORPAY_WEBHOOK_SECRET` set |
| Demo bypass in production | ✅ Blocked when Razorpay configured |

**Warning:** `.env.local` must never be committed. Rotate keys if exposed in git history.

---

## 5. Test mode validation

Your keys use prefix **`rzp_test_`** → test mode ✅

**Test card (Razorpay docs):**
- Number: `4111 1111 1111 1111`
- Expiry: any future date
- CVV: any 3 digits

**Manual test flow:**
1. Sign in → `/pricing` → Upgrade to Pro.
2. Pay in Razorpay modal.
3. Confirm success UI + profile shows `subscription_plan: pro`.
4. Generate AI poster — limit should reflect Pro (100/mo).

**Server logs to watch:**
- `[createRazorpayOrder] ok`
- `[verifyAndActivateSubscription] activated`
- `[razorpay] Mode: TEST`

---

## 6. Vercel deployment

- Server Actions run as serverless functions — compatible ✅
- Webhook route `app/api/razorpay/webhook/route.ts` — `runtime = nodejs` ✅
- Build must have all env vars; missing `RAZORPAY_KEY_SECRET` → "Payments are not configured"

**Note:** Fix `NEXT_PUBLIC_SITE_URL` typo if still `https://https://...` in `.env.local`.

---

## 7. File map

| File | Role |
|------|------|
| `lib/subscription/razorpay-server.ts` | Client, signature, validation |
| `lib/subscription/activate-plan.ts` | Supabase profile update |
| `lib/subscription/plans.ts` | Prices (₹299 / ₹999) |
| `app/actions/subscription.ts` | Order + verify server actions |
| `app/api/razorpay/webhook/route.ts` | Webhook backup activation |
| `components/pricing/checkout-modal.tsx` | Checkout UI |
| `lib/ai/subscription.ts` | Feature gating |

There is **no** `/api/create-order` route — orders are created via **Server Actions** (valid for Next.js App Router).

---

## 8. Production readiness

| Requirement | Status |
|-------------|--------|
| Test payments | ✅ Ready |
| Live payments | ❌ Need `rzp_live_*` keys |
| Webhook on Vercel | ⚠️ Configure secret + service role |
| PCI | ✅ Razorpay hosted checkout |
| Subscription logic | ✅ |

**Verdict:** Safe for **test/staging**. For **live money**, switch keys, enable webhook, disable test banner, and run one real ₹1 test payment.

---

## UPI & QR not showing?

Payment methods are **not controlled only by code** — Razorpay shows what your **merchant account** has enabled.

### Fix in Razorpay Dashboard (most common)

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com) (Test mode toggle ON for test keys).
2. **Account & Settings → Payment Methods**.
3. Enable **UPI** (and Cards, Netbanking, Wallets as needed).
4. Complete **KYC submission** — the Payment Methods section often appears only after KYC is submitted (verification can still be pending).
5. Wait a few minutes and retry checkout.

### Device differences

- **Desktop:** UPI often shows as **QR code** + UPI ID field.
- **Mobile:** UPI often shows as **GPay / PhonePe / Paytm** apps (intent flow), not QR.

### Test mode UPI

- Use UPI ID `success@razorpay` for a successful test payment.
- If the UPI tab is missing entirely, Dashboard UPI is not activated for your test MID — contact Razorpay support.

### Code (RentSetGo)

Checkout passes `config.display` with `sequence: ["upi", "card", ...]` and `show_default_blocks: true` in `lib/subscription/razorpay-checkout-config.ts`.

---

## 9. Optimized production architecture

```
User → CheckoutModal → createRazorpayOrder (Server Action)
                    → Razorpay Checkout (order_id)
                    → payment success
                    → verifyAndActivateSubscription (signature + API validate)
                    → profiles UPDATE

Parallel path:
Razorpay → POST /api/razorpay/webhook → verify signature
        → validate order/payment → activatePlanForUser (service role)
```

Always treat **webhook + server verify** as source of truth; never activate from client callback alone (you already verify on server — good).
