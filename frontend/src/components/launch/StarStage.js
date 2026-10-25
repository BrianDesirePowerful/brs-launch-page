import { useEffect, useRef } from "react";
import { StarEngine } from "../../lib/starEngine";

export const StarStage = ({ run, instantRef, formation, getAnchorEl, shakeRef }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const measure = () => {
    const engine = engineRef.current;
    const el = getAnchorEl();
    const stage = canvasRef.current?.parentElement;
    if (!engine || !el || !stage) return;
    const r = el.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    engine.setAnchor({ x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, w: el.offsetWidth, h: el.offsetHeight });
  };

  useEffect(() => {
    const onShake = (x, y, r) => {
      if (shakeRef.current) shakeRef.current.style.transform = x || y ? `translate3d(${x}px,${y}px,0) rotate(${r}deg)` : "";
    };
    const engine = new StarEngine(canvasRef.current, { onShake, formation });
    engineRef.current = engine;
    const ro = new ResizeObserver(() => {
      engine.resize();
      measure();
    });
    ro.observe(canvasRef.current.parentElement);
    const anchor = getAnchorEl();
    if (anchor) ro.observe(anchor);
    document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      engine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    measure();
    engineRef.current?.play({ instant: instantRef.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  useEffect(() => {
    engineRef.current?.setFormation(formation);
  }, [formation]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="intro-canvas"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
    />
  );
};
