import { cues } from "./cues";
import { TIMELINE, settleTime } from "./starEngine";

// Drop licensed audio into /public/audio/ and set the paths here (e.g. "audio/theme.mp3").
// Music starts on "intro:start"; each sfx plays when its cue fires.
export const SOUNDTRACK = {
  music: null,
  musicVolume: 0.8,
  sfx: {
    "meteor:launch": null,
    "meteor:impact": null,
    "stars:emerge": null,
    "stars:settled": null,
    "formation:change": null,
  },
};

const asset = (p) => `${process.env.PUBLIC_URL || "."}/${p}`;

export function attachSoundtrack(config = SOUNDTRACK) {
  const offs = [];
  if (config.music) {
    const music = new Audio(asset(config.music));
    music.volume = config.musicVolume;
    offs.push(
      cues.on("intro:start", ({ instant, starCount } = {}) => {
        music.currentTime = instant ? settleTime(starCount) / 1000 : 0;
        music.play().catch(() => {});
      }),
    );
  }
  Object.entries(config.sfx).forEach(([event, src]) => {
    if (!src) return;
    offs.push(cues.on(event, () => new Audio(asset(src)).play().catch(() => {})));
  });
  return () => offs.forEach((off) => off());
}

export { TIMELINE };
