import { useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const initEngine = async (engine) => {
  await loadSlim(engine);
};

const buildOptions = (reduced, mobile) => ({
  fullScreen: { enable: false },
  fpsLimit: 60,
  detectRetina: true,
  background: { color: "transparent" },
  particles: {
    number: { value: mobile ? 45 : 95, density: { enable: true } },
    color: { value: ["#d4af37", "#f3d27a", "#fff4dc", "#ffe9b0"] },
    links: { enable: true, distance: mobile ? 100 : 140, color: "#d4af37", opacity: 0.13, width: 0.6 },
    move: { enable: !reduced, speed: 0.35, direction: "none", random: true, outModes: { default: "out" } },
    opacity: { value: { min: 0.12, max: 0.75 }, animation: { enable: !reduced, speed: 0.6, sync: false } },
    size: { value: { min: 0.5, max: 2.1 } },
    shape: { type: "circle" },
  },
  interactivity: {
    detectsOn: "window",
    events: { onHover: { enable: !reduced, mode: ["grab", "bubble"] } },
    modes: {
      grab: { distance: 170, links: { opacity: 0.42, color: "#f3d27a" } },
      bubble: { distance: 120, size: 3, duration: 2, opacity: 0.95 },
    },
  },
});

export const ParticleField = ({ visible, reduced }) => {
  const options = useMemo(() => buildOptions(reduced, window.innerWidth < 768), [reduced]);
  return (
    <div
      data-testid="particles-background"
      aria-hidden="true"
      className={`absolute inset-0 z-0 transition-opacity duration-[2200ms] ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <ParticlesProvider init={initEngine}>
        <Particles id="brs-dust" className="absolute inset-0" options={options} />
      </ParticlesProvider>
    </div>
  );
};
