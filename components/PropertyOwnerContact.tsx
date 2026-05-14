import type { ReactNode } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";

type Props = {
  phone?: string | null;
  email?: string | null;
  listingTitle?: string;
};

function digitsOnly(raw: string) {
  return raw.replace(/\D/g, "");
}

function whatsappHref(phone: string, listingTitle?: string) {
  let digits = digitsOnly(phone);
  if (digits.length === 10) digits = `91${digits}`;
  const intro = listingTitle
    ? `Hi, I'm interested in "${listingTitle}" on RentSetGo.`
    : "Hi, I'm interested in your listing on RentSetGo.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(intro)}`;
}

function telHref(phone: string) {
  const digits = digitsOnly(phone);
  return digits ? `tel:+${digits.length === 10 ? `91${digits}` : digits}` : `tel:${phone.replace(/\s/g, "")}`;
}

function ContactRow({
  href,
  label,
  sublabel,
  icon,
  accent,
}: {
  href: string;
  label: string;
  sublabel?: string;
  icon: ReactNode;
  accent: "whatsapp" | "phone" | "email";
}) {
  const accentClass =
    accent === "whatsapp"
      ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100/90 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:border-emerald-700"
      : accent === "phone"
        ? "border-zinc-200/90 bg-white/80 text-zinc-900 hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/30"
        : "border-zinc-200/90 bg-white/80 text-zinc-900 hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/30";

  const iconWrapClass =
    accent === "whatsapp"
      ? "bg-[#25D366] text-white shadow-sm shadow-emerald-900/20"
      : accent === "phone"
        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/15"
        : "bg-zinc-700 text-white dark:bg-zinc-600";

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition ${accentClass}`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconWrapClass}`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-tight">{label}</span>
        {sublabel ? (
          <span className="mt-0.5 block truncate text-xs opacity-80">{sublabel}</span>
        ) : null}
      </span>
    </a>
  );
}

export function PropertyOwnerContact({ phone, email, listingTitle }: Props) {
  const hasPhone = Boolean(phone?.trim());
  const hasEmail = Boolean(email?.trim());

  return (
    <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-700">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <MessageCircle className="size-4" strokeWidth={2.25} aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contact owner</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Reach out directly — no middlemen</p>
        </div>
      </div>

      {hasPhone || hasEmail ? (
        <div className="flex flex-col gap-2.5">
          {hasPhone ? (
            <>
              <ContactRow
                href={whatsappHref(phone!, listingTitle)}
                label="Chat on WhatsApp"
                sublabel="Usually the fastest way to get a reply"
                accent="whatsapp"
                icon={
                  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                }
              />
              <ContactRow
                href={telHref(phone!)}
                label="Call"
                sublabel={phone!}
                accent="phone"
                icon={<Phone className="size-[1.15rem]" strokeWidth={2.25} />}
              />
            </>
          ) : null}
          {hasEmail ? (
            <ContactRow
              href={`mailto:${email}`}
              label="Email"
              sublabel={email!}
              accent="email"
              icon={<Mail className="size-[1.15rem]" strokeWidth={2.25} />}
            />
          ) : null}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-400">
          The owner has not added contact details yet.
        </p>
      )}
    </div>
  );
}
