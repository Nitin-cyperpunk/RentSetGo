/**
 * Razorpay Standard Checkout display config.
 * Keep minimal — invalid `sequence` entries (emi/paylater) can block checkout from opening.
 *
 * UPI + QR require Dashboard: Account & Settings → Payment Methods → UPI enabled.
 */
export const RAZORPAY_CHECKOUT_CONFIG = {
  display: {
    preferences: {
      show_default_blocks: true,
    },
  },
} as const;

export type RazorpayCheckoutPrefill = {
  email?: string;
  contact?: string;
  name?: string;
};
