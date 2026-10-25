import { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export function useLenis(enabled) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return undefined;
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    ref.current = lenis;
    let id = requestAnimationFrame(function raf(t) {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      ref.current = null;
    };
  }, [enabled]);
  return ref;
}
