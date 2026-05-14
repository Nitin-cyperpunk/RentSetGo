import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Coffee,
  Heart,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { founderWhatsappHref, getSupportConfig } from "@/lib/support";
import { SupportQrImage } from "@/components/SupportQrImage";

type Props = {
  variant?: "page" | "compact";
};

function ConnectButton({
  href,
  label,
  sublabel,
  icon,
  variant,
}: {
  href: string;
  label: string;
  sublabel?: string;
  icon: ReactNode;
  variant: "whatsapp" | "email";
}) {
  const styles =
    variant === "whatsapp"
      ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-950 hover:border-emerald-300 hover:bg-emerald-100/90 dark:border-emerald-800/50 dark:bg-emerald-950/35 dark:text-emerald-100"
      : "border-zinc-200/90 bg-white/90 text-zinc-900 hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100";

  const iconBg =
    variant === "whatsapp"
      ? "bg-[#25D366] text-white"
      : "bg-zinc-800 text-white dark:bg-zinc-600";

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition ${styles}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconBg}`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {sublabel ? (
          <span className="mt-0.5 block truncate text-xs opacity-75">
            {sublabel}
          </span>
        ) : null}
      </span>
    </a>
  );
}

function SupportPageLayout({
  upiId,
  qrImage,
  whatsappHref,
  email,
}: {
  upiId: string;
  qrImage: string;
  whatsappHref: string | null;
  email: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Hero */}
      <header className="relative mb-10 text-center sm:mb-12">
        <div
          className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-rose-400/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-8 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl"
          aria-hidden
        />
        <p className="relative inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-rose-800 shadow-sm backdrop-blur-md dark:border-rose-500/25 dark:bg-rose-950/40 dark:text-rose-200">
          <Sparkles className="size-3.5" aria-hidden />
          Community powered
        </p>
        <h1 className="relative mt-5 bg-gradient-to-br from-zinc-900 via-zinc-800 to-rose-900 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl md:text-5xl dark:from-zinc-50 dark:via-zinc-200 dark:to-rose-200">
          Support RentSetGo
        </h1>
        <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
          If this app helped you find or list a place in Nashik, you can chip in
          to keep it running. Every contribution goes toward hosting and
          improvements—completely optional.
        </p>
        <ul className="relative mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <li className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/60 px-3 py-1 dark:border-zinc-700 dark:bg-zinc-900/50">
            <ShieldCheck
              className="size-3.5 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
            100% optional
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/60 px-3 py-1 dark:border-zinc-700 dark:bg-zinc-900/50">
            <Coffee
              className="size-3.5 text-amber-600 dark:text-amber-400"
              aria-hidden
            />
            UPI friendly
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/60 px-3 py-1 dark:border-zinc-700 dark:bg-zinc-900/50">
            <Heart className="size-3.5 text-rose-500" aria-hidden />
            Built for Nashik
          </li>
        </ul>
      </header>

      {/* Main support card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/80 shadow-xl shadow-zinc-900/5 backdrop-blur-xl dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:shadow-black/30">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-rose-300/20 blur-3xl dark:bg-rose-500/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-emerald-300/15 blur-3xl dark:bg-emerald-500/10"
          aria-hidden
        />

        <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center md:gap-10 lg:p-10">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Scan &amp; pay via UPI
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Open PhonePe, Google Pay, or your bank app, scan the code, and
              send any amount you are comfortable with. No account or login
              required on RentSetGo.
            </p>

            <ol className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              {[
                "Open your UPI app and tap Scan QR",
                "Point at the code on the right",
                "Confirm the amount and pay",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            {upiId ? (
              <div className="mt-6 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50/80 px-4 py-3 dark:border-emerald-800/50 dark:from-emerald-950/50 dark:to-teal-950/30">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-800/80 dark:text-emerald-400/90">
                  UPI ID
                </p>
                <p className="mt-1 font-mono text-base font-semibold text-emerald-900 dark:text-emerald-200">
                  {upiId}
                </p>
              </div>
            ) : (
              <p className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-600 dark:bg-zinc-950/40 dark:text-zinc-400">
                Add your UPI ID in{" "}
                <code className="rounded bg-zinc-200/80 px-1 dark:bg-zinc-800">
                  .env.local
                </code>{" "}
                and replace the placeholder QR with your real code from your UPI
                app.
              </p>
            )}
          </div>

          <div className="flex flex-col items-center md:items-end">
            <SupportQrImage src={qrImage} />
            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <Coffee
                className="size-3.5 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              Scan to support · tap QR to enlarge
            </p>
          </div>
        </div>
      </div>

      {/* Connect */}
      {whatsappHref || email ? (
        <div className="mt-8 rounded-3xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/50 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <MessageCircle
                className="size-5"
                strokeWidth={2.25}
                aria-hidden
              />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Happy to connect
              </h2>
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                Questions, feedback, or ideas—I would love to hear from you.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {whatsappHref ? (
                  <ConnectButton
                    href={whatsappHref}
                    label="Message on WhatsApp"
                    sublabel="Quick chat"
                    variant="whatsapp"
                    icon={
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    }
                  />
                ) : null}
                {email ? (
                  <ConnectButton
                    href={`mailto:${email}`}
                    label="Send an email"
                    sublabel={email}
                    variant="email"
                    icon={<Mail className="size-5" strokeWidth={2.25} />}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <p className="mt-10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/80 px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur-sm transition hover:border-emerald-200 hover:bg-emerald-50/80 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:border-emerald-800/50"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to listings
        </Link>
      </p>
    </div>
  );
}

function SupportCompactLayout({
  upiId,
  qrImage,
}: {
  upiId: string;
  qrImage: string;
}) {
  return (
    <>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-900/15">
          <Heart className="size-5" strokeWidth={2.25} aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Support RentSetGo
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Optional tip to help keep the project running.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <SupportQrImage src={qrImage} size="sm" />
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Scan to support
          </p>
          {upiId ? (
            <p className="mt-2 font-mono text-sm text-emerald-800 dark:text-emerald-300">
              {upiId}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function SupportSection({ variant = "page" }: Props) {
  const { upiId, email, qrImage } = getSupportConfig();
  const whatsappHref = founderWhatsappHref();
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="rounded-2xl border border-rose-200/60 bg-rose-50/40 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
        <SupportCompactLayout upiId={upiId} qrImage={qrImage} />
      </div>
    );
  }

  return (
    <SupportPageLayout
      upiId={upiId}
      qrImage={qrImage}
      whatsappHref={whatsappHref}
      email={email}
    />
  );
}
