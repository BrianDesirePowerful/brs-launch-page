import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { StarStage } from "../components/launch/StarStage";
import { ParticleField } from "../components/launch/ParticleField";
import { Countdown } from "../components/launch/Countdown";
import { Controls, SkipButton } from "../components/launch/Controls";
import { Header } from "../components/launch/Header";
import { MaskLine, Eyebrow } from "../components/launch/HeroCopy";
import { BelowFold } from "../components/launch/BelowFold";
import { useLenis } from "../hooks/useLenis";
import { cues } from "../lib/cues";
import { attachSoundtrack } from "../lib/soundtrack";
import { BRAND, DEFAULT_FORMATION, LAUNCH_DATE, LAUNCH_TIME_ZONE } from "../config/launch";

const useTilt = (enabled) => {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const onMove = (e) => {
    if (!enabled) return;
    rx.set(((e.clientY / window.innerHeight) - 0.5) * -6);
    ry.set(((e.clientX / window.innerWidth) - 0.5) * 8);
  };
  return { onMove, rotateX: useSpring(rx, { stiffness: 60, damping: 18 }), rotateY: useSpring(ry, { stiffness: 60, damping: 18 }) };
};

export default function LaunchPage() {
  const reduced = useReducedMotion();
  const [formation, setFormation] = useState(DEFAULT_FORMATION);
  const [revealed, setRevealed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [dust, setDust] = useState(false);
  const [run, setRun] = useState(0);
  const instantRef = useRef(!!reduced);
  const shakeRef = useRef(null);
  const coreRef = useRef(null);
  const clockRef = useRef(null);
  const lenis = useLenis(!reduced);
  const tilt = useTilt(!reduced);

  useEffect(() => {
    const offs = [
      cues.on("meteor:impact", () => setDust(true)),
      cues.on("countdown:reveal", () => { setRevealed(true); setDust(true); }),
      cues.on("stars:settled", () => setSettled(true)),
      attachSoundtrack(),
    ];
    return () => offs.forEach((off) => off());
  }, []);

  const getAnchorEl = useCallback(() => (window.innerWidth < 768 ? clockRef.current : coreRef.current), []);

  const replay = () => {
    lenis.current ? lenis.current.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
    instantRef.current = !!reduced;
    setRevealed(!!reduced);
    setSettled(false);
    setDust(!!reduced);
    setRun((r) => r + 1);
  };
  const skip = () => {
    instantRef.current = true;
    setRun((r) => r + 1);
  };

  return (
    <main data-testid="launch-page-container" id="top" className="bg-[#050505] text-zinc-100">
      <section onMouseMove={tilt.onMove} className="grain relative h-[100svh] min-h-[640px] overflow-hidden bg-black">
        <div ref={shakeRef} className="absolute inset-0 will-change-transform">
          <ParticleField visible={dust} reduced={!!reduced} />
          <div className={`stage-glow pointer-events-none absolute inset-0 transition-opacity duration-[2500ms] ${revealed ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
          <StarStage run={run} instantRef={instantRef} formation={formation} getAnchorEl={getAnchorEl} shakeRef={shakeRef} />
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 pb-16 pt-14 md:pb-20">
            <motion.div ref={coreRef} style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformPerspective: 1200 }} className="flex flex-col items-center text-center">
              <Eyebrow show={revealed}>{BRAND.legal}</Eyebrow>
              <h1 data-testid="hero-headline" className="font-display text-4xl leading-[1.02] text-amber-50 sm:text-5xl lg:text-[3.4rem]">
                <MaskLine show={revealed} delay={0.1}>Something golden</MaskLine>
                <MaskLine show={revealed} delay={0.22}><em className="gold-text pr-1">is on the horizon.</em></MaskLine>
              </h1>
              <motion.div
                ref={clockRef}
                initial={false}
                animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0.94, filter: revealed ? "blur(0px)" : "blur(10px)" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: revealed ? 0.35 : 0 }}
                className="my-[150px] md:mb-6 md:mt-9"
              >
                <Countdown target={LAUNCH_DATE.getTime()} reduced={!!reduced} />
              </motion.div>
              <MaskLine show={revealed} delay={0.6}>
                <span data-testid="hero-date-line" className="font-body text-[11px] uppercase tracking-[0.4em] text-amber-100/75 sm:text-xs">
                  Launching {LAUNCH_DATE.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: LAUNCH_TIME_ZONE })}
                </span>
              </MaskLine>
            </motion.div>
          </div>
          <div className="vignette pointer-events-none absolute inset-0 z-30" aria-hidden="true" />
        </div>
        <Header visible={revealed} />
        <Controls visible={revealed} formation={formation} onFormation={setFormation} onReplay={replay} />
        <SkipButton visible={!revealed && !reduced} onSkip={skip} />
      </section>
      <BelowFold onReplay={replay} />
    </main>
  );
}
