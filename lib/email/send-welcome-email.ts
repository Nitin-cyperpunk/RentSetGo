function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Default “from” if RESEND_FROM_EMAIL is unset (override in .env.local). */
const DEFAULT_FROM = "RentSetGo <singhnitin9975@gmail.com>";

/**
 * Sends welcome mail via Resend (https://resend.com).
 *
 * Get an API key:
 * 1. Sign up at https://resend.com
 * 2. Dashboard → API Keys → Create API Key
 * 3. Copy the key (starts with `re_`) into `.env.local` as RESEND_API_KEY=re_...
 *
 * Resend normally requires a verified domain for the “from” address. If sending
 * from a Gmail address fails, add a domain under Domains in Resend and set
 * RESEND_FROM_EMAIL to e.g. RentSetGo <noreply@yourdomain.com>, or keep testing
 * with onboarding@resend.dev (limited to your Resend account email).
 */
export async function sendWelcomeEmail(args: { to: string; name: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() ?? DEFAULT_FROM;

  if (!key) {
    console.warn(
      "[sendWelcomeEmail] RESEND_API_KEY is not set — welcome emails are skipped. Add it to .env.local (local) or your host env (e.g. Vercel).",
    );
    return;
  }

  const safeName = escapeHtml(args.name || "there");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: "Welcome to RentSetGo",
      html: `<p>Hi ${safeName},</p>
<p>Thanks for creating an account. We’re glad you’re here.</p>
<p>Browse listings, save favourites, and reach out to owners directly from the site.</p>
<p>— The RentSetGo team</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[sendWelcomeEmail] Resend error", res.status, text);
  }
}
