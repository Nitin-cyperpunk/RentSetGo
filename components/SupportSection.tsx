import Image from "next/image";
import Link from "next/link";
import { Coffee, Heart, Mail, MessageCircle } from "lucide-react";

import { founderWhatsappHref, getSupportConfig } from "@/lib/support";

type Props = {
  variant?: "page" | "compact";
};

export function SupportSection({ variant = "page" }: Props) {
  const { upiId, email, qrImage } = getSupportConfig();
  const whatsappHref = founderWhatsappHref();
  const isCompact = variant === "compact";

  const cardClass =
    "rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/50 sm:p-8";

  return (
    <div
      className={
        isCompact
          ? "rounded-2xl border border-rose-200/60 bg-rose-50/40 p-5 dark:border-rose-900/40 dark:bg-rose-950/20"
          : "mx-auto max-w-2xl space-y-8"
      }
    >
      <div className={isCompact ? "" : cardClass}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-900/15">
            <Heart className="size-5" strokeWidth={2.25} aria-hidden />
          </span>
          <div>
            <h2
              className={
                isCompact
                  ? "text-lg font-bold text-zinc-900 dark:text-zinc-50"
                  : "text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
              }
            >
              Support RentSetGo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              If RentSetGo helped you find or list a place, you can support the project. Every bit
              helps keep it running—hosting, domains, and improvements. Totally optional; nothing
              is locked behind tips.
            </p>
          </div>
        </div>

        <div
          className={`mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start ${isCompact ? "sm:justify-center" : ""}`}
        >
          <div className="shrink-0 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-600 dark:bg-zinc-950">
            <Image
              src={qrImage}
              alt="UPI QR code to support RentSetGo"
              width={176}
              height={176}
              className="size-44 rounded-lg object-contain"
              priority={!isCompact}
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <Coffee className="size-4 text-amber-600 dark:text-amber-400" aria-hidden />
              Scan to support
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Pay via UPI using your PhonePe, GPay, or bank app.
            </p>
            {upiId ? (
              <p className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 font-mono text-sm text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                {upiId}
              </p>
            ) : (
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                Set <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NEXT_PUBLIC_SUPPORT_UPI_ID</code> in{" "}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.env.local</code>. Replace{" "}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">public/support-qr.svg</code> with your
                real UPI QR as <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">support-qr.png</code>.
              </p>
            )}
          </div>
        </div>
      </div>

      {!isCompact && (whatsappHref || email) ? (
        <div className={cardClass}>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <MessageCircle className="size-5" strokeWidth={2.25} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Happy to connect</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Built RentSetGo for Nashik—feedback, ideas, or bugs are always welcome.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                ) : null}
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-emerald-800"
                  >
                    <Mail className="size-4" aria-hidden />
                    Email
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!isCompact ? (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            ← Back to listings
          </Link>
        </p>
      ) : null}
    </div>
  );
}
