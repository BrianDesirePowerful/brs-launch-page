import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Logo } from "./Logo";
import { BRAND, LAUNCH_DATE, LAUNCH_TIME_ZONE } from "../../config/launch";

const WORDS = [BRAND.name, "Launching Soon", "The Countdown Has Begun", "Mark The Date"];

const Marquee = () => (
  <div data-testid="editorial-marquee" className="relative overflow-hidden border-y border-amber-200/10 py-7">
    <div className="marquee-track flex w-max">
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
          {WORDS.map((w) => (
            <span key={w} className="flex items-center font-display text-3xl italic text-amber-100/85 sm:text-5xl">
              <span className="px-8 sm:px-12">{w}</span>
              <span className="text-amber-300/70">✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const fmt = (opts) => new Intl.DateTimeFormat("en-US", { ...opts, timeZone: LAUNCH_TIME_ZONE }).format(LAUNCH_DATE);
const reveal = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 } };

const DateFeature = () => (
  <section data-testid="date-section" className="mx-auto grid max-w-6xl gap-10 px-6 py-24 sm:py-36 md:grid-cols-[1.2fr_1fr] md:items-end">
    <motion.div {...reveal} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
      <p className="mb-6 font-body text-xs uppercase tracking-[0.45em] text-amber-200/80">Save the date</p>
      <p data-testid="launch-date-display" className="gold-text font-display text-6xl leading-[0.95] sm:text-8xl lg:text-9xl">
        {fmt({ month: "short" })} {fmt({ day: "2-digit" })}
        <span className="block italic">{fmt({ year: "numeric" })}</span>
      </p>
    </motion.div>
    <motion.div {...reveal} transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="border-l border-amber-200/20 pl-6">
      <p className="font-body text-base leading-relaxed text-zinc-300 sm:text-lg">
        A new chapter for {BRAND.legal} is almost here. The stars are aligned and the clock is running — we can't wait to show you what's next.
      </p>
    </motion.div>
  </section>
);

export const BelowFold = ({ onReplay }) => (
  <div className="relative z-10 bg-[#050505]">
    <Marquee />
    <DateFeature />
    <footer className="flex flex-col items-center justify-between gap-6 border-t border-amber-200/10 px-6 py-10 sm:flex-row sm:px-10">
      <div className="flex items-center gap-3">
        <Logo className="h-7 w-7" />
        <span data-testid="footer-copyright" className="font-body text-xs tracking-[0.2em] text-zinc-400">© {new Date().getFullYear()} {BRAND.legal}</span>
      </div>
      <button data-testid="footer-replay-button" onClick={onReplay} className="flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-amber-100/80 transition-colors hover:text-amber-100">
        Back to the intro <ArrowUp className="h-3.5 w-3.5" />
      </button>
    </footer>
  </div>
);
