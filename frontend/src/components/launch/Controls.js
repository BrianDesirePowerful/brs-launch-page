import { motion } from "framer-motion";
import { RotateCcw, FastForward } from "lucide-react";

const FORMS = [
  { id: "oval", testid: "formation-toggle-oval", label: "Cinematic Oval", short: "Oval" },
  { id: "halo", testid: "formation-toggle-circular", label: "Circular Halo", short: "Halo" },
];

export const Controls = ({ visible, formation, onFormation, onReplay }) => (
  <motion.div
    initial={false}
    animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    className={`absolute inset-x-0 bottom-5 z-40 flex justify-center px-4 sm:bottom-8 ${visible ? "" : "pointer-events-none"}`}
  >
    <div className="glass-pill flex items-center gap-1 rounded-full p-1.5">
      <button data-testid="replay-intro-button" onClick={onReplay} className="ctrl-btn group flex items-center gap-2 rounded-full px-4 py-2.5 text-amber-100">
        <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-[200deg]" />
        <span className="hidden sm:inline">Replay Intro</span>
        <span className="sm:hidden">Replay</span>
      </button>
      <span className="mx-1 h-6 w-px bg-amber-200/20" aria-hidden="true" />
      <div role="radiogroup" aria-label="Star formation" className="flex">
        {FORMS.map((f) => (
          <button
            key={f.id}
            role="radio"
            aria-checked={formation === f.id}
            data-testid={f.testid}
            onClick={() => onFormation(f.id)}
            className={`relative rounded-full px-4 py-2.5 transition-colors duration-300 ${formation === f.id ? "text-black" : "text-amber-100/80 hover:text-amber-100"}`}
          >
            {formation === f.id && (
              <motion.span layoutId="form-pill" className="gold-fill absolute inset-0 rounded-full" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
            )}
            <span className="relative hidden sm:inline">{f.label}</span>
            <span className="relative sm:hidden">{f.short}</span>
          </button>
        ))}
      </div>
    </div>
  </motion.div>
);

export const SkipButton = ({ visible, onSkip }) =>
  visible ? (
    <button
      data-testid="skip-intro-button"
      onClick={onSkip}
      className="absolute bottom-6 right-6 z-40 flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-amber-100/70 transition-colors hover:text-amber-100"
    >
      Skip <FastForward className="h-3.5 w-3.5" />
    </button>
  ) : null;
