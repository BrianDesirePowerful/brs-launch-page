import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { BRAND } from "../../config/launch";

export const Header = ({ visible }) => (
  <motion.header
    initial={false}
    animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -16 }}
    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 sm:px-10"
  >
    <a href="#top" data-testid="brand-logo-header" className="flex items-center gap-3">
      <Logo />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl tracking-[0.28em] text-amber-100">{BRAND.short}</span>
        <span className="mt-1 whitespace-nowrap font-body text-[10px] uppercase tracking-[0.18em] text-amber-200/70 sm:tracking-[0.3em]">Management Solutions</span>
      </span>
    </a>
    <span data-testid="header-status" className="flex items-center gap-2 whitespace-nowrap font-body text-[11px] uppercase tracking-[0.32em] text-amber-100/80">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
      </span>
      <span className="hidden sm:inline">{"Coming "}</span>Soon
    </span>
  </motion.header>
);
