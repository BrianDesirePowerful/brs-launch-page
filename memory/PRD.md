# PRD — BRS Management Solutions LLC Cinematic Launch & Countdown

## Original problem statement
**Project: BRS Management Solutions LLC — Cinematic Launch & Countdown Experience**
Enhance my existing cinematic launch-page animation without rebuilding the entire design. Preserve the luxurious black-and-gold appearance.
1. High-Speed Golden Shooting Star — pitch-black start, golden shooting star streaks diagonally at extreme speed: motion blur, long luminous trail, bright flash, dramatic shockwave, brief powerful screen shake.
2. Five-Pointed Star Formation — luminous five-pointed golden stars emerge after the meteor, travel sweeping curved paths, circulate around the center (classic studio intro). Only two formations: Circular Halo and Cinematic Oval (around the countdown). No BRS/letter formation. Stars stay and gently twinkle.
3. Interactive Particle Background — particles.js/tsParticles: small gold & warm-white particles, thin constellation links, subtle cursor interaction, twinkling; separate from the big stars.
4. Countdown Reveal — elegant gold days/hours/minutes/seconds clock after stars settle; temporary launch date; real-time.
5. Controls & Optimization — Replay Intro button, Circular/Oval toggle, desktop + mobile, reduced motion, GitHub Pages compatible.
6. Music & Sound — none yet; prepare sync for music/SFX later.
Modify existing project; preserve liked effects; commercially permitted assets/libraries; working preview of both formations.

## User choices
- Existing project: "Already in this workspace" — none was found (blank template), so the page was built fresh in black & gold.
- Temporary launch date: 30 days from today → 2026-11-24 00:00 local (src/config/launch.js)
- Default formation: Cinematic Oval

## Architecture
- Frontend-only React (CRA). No backend calls → static build; `"homepage": "."` gives relative asset paths for GitHub Pages.
- src/lib/starEngine.js — Canvas 2D engine: meteor, flash, shockwave rings, sparks, screen shake, five-point star sprites, spiral choreography, halo/oval morph, twinkle + glints. TIMELINE constants exported.
- src/lib/cues.js — event bus (window.BRSCues): intro:start, meteor:launch, meteor:impact, stars:emerge, countdown:reveal, stars:settled, formation:change, countdown:tick.
- src/lib/soundtrack.js — SOUNDTRACK config (music + per-cue sfx paths, currently null) auto-attached to cues.
- tsParticles v4 slim (MIT) background, Lenis smooth scroll, framer-motion reveals. Fonts: Bodoni Moda + Jost (Google Fonts, OFL).

## Implemented (2026-10-25)
- Meteor intro, five-point star formation (Oval default / Halo), particle field, countdown, Replay, Skip intro, formation toggle, reduced-motion (instant settled state), mobile layout, header, marquee, save-the-date section, footer, SVG logo + favicon.

- Official launch date set (2026-10-31): 2026-12-04T00:00:00-05:00 (midnight ET), dates displayed in America/New_York. Continuous orbital star motion added.

## Backlog
- P0: Add licensed soundtrack + SFX files to /public/audio and SOUNDTRACK config.
- P1: Email "notify me" signup; GitHub Pages deploy workflow.
- P2: Launch-day "we're live" state when countdown hits zero; social share image.
