// Tiny event bus so music and sound effects can be synced to the intro later.
// Events: intro:start, meteor:launch, meteor:impact, stars:emerge, countdown:reveal,
// stars:settled, formation:change, countdown:tick
const listeners = {};

export const cues = {
  on(event, fn) {
    (listeners[event] = listeners[event] || new Set()).add(fn);
    return () => listeners[event].delete(fn);
  },
  emit(event, payload) {
    listeners[event]?.forEach((fn) => fn(payload));
  },
};

if (typeof window !== "undefined") window.BRSCues = cues;
