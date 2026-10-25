import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

export const MaskLine = ({ children, show, delay = 0, className = "" }) => (
  <span className={`block overflow-hidden pb-[0.08em] ${className}`}>
    <motion.span
      className="block"
      initial={false}
      animate={{ y: show ? "0%" : "110%", opacity: show ? 1 : 0 }}
      transition={{ duration: 1.1, ease, delay: show ? delay : 0 }}
    >
      {children}
    </motion.span>
  </span>
);

export const Eyebrow = ({ show, children }) => (
  <MaskLine show={show} className="mb-4">
    <span data-testid="hero-eyebrow" className="font-body text-[11px] uppercase tracking-[0.45em] text-amber-200/85 sm:text-xs">
      {children}
    </span>
  </MaskLine>
);
