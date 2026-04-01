import { MapPin, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

const items = [
  {
    icon: MapPin,
    title: "Neighbourhood-first",
    description:
      "Search by area and budget so you spend time on places that actually fit.",
  },
  {
    icon: MessageCircle,
    title: "Talk to owners directly",
    description: "No middlemen in the way—reach out when a listing catches your eye.",
  },
  {
    icon: ShieldCheck,
    title: "Fresh, active listings",
    description: "We focus on listings that are still live, so you are not chasing ghosts.",
  },
  {
    icon: Sparkles,
    title: "Built for clarity",
    description: "Clean cards, sharp photos, and filters that stay out of your way.",
  },
] as const;

export function FeaturesGrid() {
  return (
    <section className="border-y border-zinc-200/80 bg-white/40 px-4 py-12 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/40 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Why renters use RentSetGo
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            A calmer way to scan the market—whether you are moving across town or just browsing.
          </p>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {items.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/70 p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-md dark:border-zinc-700/90 dark:bg-zinc-900/60 dark:hover:border-emerald-500/30"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                <Icon className="size-5" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
