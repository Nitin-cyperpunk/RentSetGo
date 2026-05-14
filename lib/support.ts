/** Public support / founder contact config (safe to expose in the browser). */

/** Served from public/qr/ — sync source file from QR/kotakqr.jpeg via `pnpm sync:qr`. */
export const SUPPORT_QR_PATH = "/qr/kotakqr.jpeg";

export function getSupportConfig() {
  const upiId = process.env.NEXT_PUBLIC_SUPPORT_UPI_ID?.trim() || "";
  const whatsapp = process.env.NEXT_PUBLIC_FOUNDER_WHATSAPP?.trim() || "";
  const email = process.env.NEXT_PUBLIC_FOUNDER_EMAIL?.trim() || "";
  const fromEnv = process.env.NEXT_PUBLIC_SUPPORT_QR_IMAGE?.trim();
  const qrImage = fromEnv && fromEnv.startsWith("/") ? fromEnv : SUPPORT_QR_PATH;

  return { upiId, whatsapp, email, qrImage };
}

export function founderWhatsappHref(message?: string) {
  const { whatsapp } = getSupportConfig();
  if (!whatsapp) return null;
  let digits = whatsapp.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  const text =
    message ?? "Hi! RentSetGo helped me — I had a question or some feedback.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
