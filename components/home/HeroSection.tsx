import { HeroAnimated } from "@/components/home/HeroAnimated";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
      <div
        className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-32 h-56 w-56 rounded-full bg-teal-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-96 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl"
        aria-hidden
      />

      <HeroAnimated />
    </section>
  );
}
