import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cues } from "../../lib/cues";

const split = (target, now) => {
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 864e5),
    hours: Math.floor(diff / 36e5) % 24,
    minutes: Math.floor(diff / 6e4) % 60,
    seconds: Math.floor(diff / 1e3) % 60,
  };
};

const Digit = ({ value, reduced }) => (
  <span className="relative inline-block h-[1.08em] w-[0.64em] overflow-hidden text-center">
    <span className="invisible">0</span>
    <AnimatePresence initial={false}>
      <motion.span
        key={value}
        className="gold-text absolute inset-0"
        initial={{ y: reduced ? 0 : "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: reduced ? 0 : "-100%", opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </span>
);

const Unit = ({ id, value, label, reduced }) => (
  <div data-testid={`countdown-${id}`} className="flex flex-col items-center">
    <div className="countdown-num flex text-[2.1rem] leading-none sm:text-6xl lg:text-7xl" aria-label={`${value} ${label}`}>
      {String(value).padStart(2, "0").split("").map((d, i) => (
        <Digit key={i} value={d} reduced={reduced} />
      ))}
    </div>
    <span className="mt-2 font-body text-[10px] font-medium uppercase tracking-[0.22em] sm:tracking-[0.32em] text-amber-200/80 sm:text-xs">{label}</span>
  </div>
);

const Sep = () => <span className="mb-6 h-1.5 w-1.5 rotate-45 bg-amber-300/60 sm:mb-8" aria-hidden="true" />;

export const Countdown = ({ target, reduced }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const t = split(target, now);
  useEffect(() => {
    cues.emit("countdown:tick", t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.seconds]);
  const units = [["days", "Days"], ["hours", "Hours"], ["minutes", "Minutes"], ["seconds", "Seconds"]];
  return (
    <div data-testid="countdown-clock-container" role="timer" className="flex items-center gap-2 sm:gap-5 lg:gap-6">
      {units.map(([id, label], i) => (
        <div key={id} className="flex items-center gap-2 sm:gap-5 lg:gap-6">
          {i > 0 && <Sep />}
          <Unit id={id} value={t[id]} label={label} reduced={reduced} />
        </div>
      ))}
    </div>
  );
};
