import { cues } from "./cues";

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t, s = 1.1) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
const rand = (a, b) => a + Math.random() * (b - a);

// All times in ms from intro start — use these to sync music later.
export const TIMELINE = {
  meteorStart: 450,
  meteorDuration: 520,
  formDelay: 260,
  starStagger: 48,
  starDuration: 2700,
  shakeDuration: 480,
  flashDuration: 700,
  shockDuration: 1400,
  morphDuration: 1600,
};
export const impactTime = () => TIMELINE.meteorStart + TIMELINE.meteorDuration * 0.5;
export const settleTime = (n = 28) =>
  impactTime() + TIMELINE.formDelay + (n - 1) * TIMELINE.starStagger + TIMELINE.starDuration;

function makeStarSprite() {
  const S = 160;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const cx = S / 2;
  const R = 44;
  const halo = g.createRadialGradient(cx, cx, 0, cx, cx, S / 2);
  halo.addColorStop(0, "rgba(255,220,140,0.5)");
  halo.addColorStop(0.35, "rgba(245,170,40,0.16)");
  halo.addColorStop(1, "rgba(245,158,11,0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, S, S);
  g.beginPath();
  for (let k = 0; k < 10; k++) {
    const rad = k % 2 ? R * 0.42 : R;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    g.lineTo(cx + Math.cos(a) * rad, cx + Math.sin(a) * rad);
  }
  g.closePath();
  g.shadowColor = "rgba(255,200,80,0.95)";
  g.shadowBlur = 18;
  const fill = g.createRadialGradient(cx, cx - 6, 2, cx, cx, R);
  fill.addColorStop(0, "#fffdf2");
  fill.addColorStop(0.35, "#ffe7a3");
  fill.addColorStop(0.75, "#e2b04a");
  fill.addColorStop(1, "#b8862b");
  g.fillStyle = fill;
  g.fill();
  g.shadowBlur = 0;
  g.lineWidth = 1.6;
  g.strokeStyle = "rgba(255,246,214,0.9)";
  g.stroke();
  g.globalAlpha = 0.4;
  g.strokeStyle = "#fff6d6";
  g.lineWidth = 1;
  g.beginPath();
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI / 2 + (k * TAU) / 5;
    g.moveTo(cx, cx);
    g.lineTo(cx + Math.cos(a) * R * 0.9, cx + Math.sin(a) * R * 0.9);
  }
  g.stroke();
  return { canvas: c, size: S, R };
}

function makeGlowSprite() {
  const S = 128;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, "rgba(255,255,248,1)");
  grad.addColorStop(0.18, "rgba(255,232,170,0.85)");
  grad.addColorStop(0.45, "rgba(245,180,60,0.28)");
  grad.addColorStop(1, "rgba(245,158,11,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  return c;
}

export class StarEngine {
  constructor(canvas, { onShake, formation = "oval" }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onShake = onShake;
    this.formation = formation;
    this.star = makeStarSprite();
    this.glow = makeGlowSprite();
    this.stars = [];
    this.sparks = [];
    this.fired = new Set();
    this.anchor = { x: 0, y: 0, w: 300, h: 120 };
    this.radii = null;
    this.morph = null;
    this.running = false;
    this.loop = this.loop.bind(this);
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.w = parent.clientWidth;
    this.h = parent.clientHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.mobile = this.w < 768;
  }

  setAnchor(a) {
    this.anchor = a;
    if (this.morph) this.morph.to = this.targetRadii(this.formation);
    else this.radii = this.targetRadii(this.formation);
  }

  targetRadii(form) {
    const { w: cw, h: ch } = this.anchor;
    const m = this.mobile;
    if (form === "halo") {
      const want = m ? cw / 2 + 26 : Math.max(cw / 2 + 40, Math.hypot(cw / 2, ch / 2) * 0.82 + 24);
      const r = Math.min(want, m ? this.w * 0.47 : Math.min(this.w * 0.47, this.h * 0.39));
      return { rx: r, ry: r };
    }
    const rx = Math.min(cw / 2 + (m ? 40 : 170), this.w * 0.47);
    const ry = Math.min(Math.max(ch / 2 + (m ? 55 : 60), rx * 0.38), this.h * 0.44, rx * 0.62);
    return { rx, ry };
  }

  currentRadii(now) {
    const m = this.morph;
    if (!m) return { ...this.radii, swirl: 0 };
    const p = clamp((now - m.start) / m.dur);
    const e = easeInOutCubic(p);
    if (p >= 1) {
      this.morph = null;
      this.radii = m.to;
    }
    return { rx: lerp(m.from.rx, m.to.rx, e), ry: lerp(m.from.ry, m.to.ry, e), swirl: Math.sin(Math.PI * p) * 0.55 };
  }

  setFormation(form) {
    if (form === this.formation) return;
    const now = performance.now();
    const from = this.radii ? this.currentRadii(now) : this.targetRadii(form);
    this.formation = form;
    this.morph = { from, to: this.targetRadii(form), start: now, dur: TIMELINE.morphDuration };
    cues.emit("formation:change", { formation: form });
  }

  play({ instant = false } = {}) {
    this.n = this.mobile ? 18 : 28;
    this.stars = Array.from({ length: this.n }, (_, i) => ({
      i,
      theta: -Math.PI / 2 + (i * TAU) / this.n,
      size: (i % 2 ? 0.74 : 1) * (this.mobile ? 9 : 12.5),
      dir: i % 2 ? 1 : -1,
      sweep: i % 2 ? 1.25 : 1.6,
      tw: rand(0.6, 1.6),
      ph: rand(0, TAU),
      gl: rand(0.2, 0.55),
      gph: rand(0, TAU),
      trail: [],
    }));
    this.radii = this.targetRadii(this.formation);
    this.morph = null;
    this.sparks = [];
    this.instant = instant;
    this.fired = new Set(instant ? ["meteor:launch", "meteor:impact", "stars:emerge"] : []);
    this.t0 = performance.now() - (instant ? settleTime(this.n) + 50 : 0);
    this.onShake(0, 0, 0);
    cues.emit("intro:start", { instant, starCount: this.n, timeline: TIMELINE });
    if (!this.running) {
      this.running = true;
      this.raf = requestAnimationFrame(this.loop);
    }
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  cue(name, at, t) {
    if (t < at || this.fired.has(name)) return;
    this.fired.add(name);
    if (name === "meteor:impact") this.burst();
    cues.emit(name, { t });
  }

  loop(now) {
    if (!this.running) return;
    const t = now - this.t0;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const imp = impactTime();
    const settle = settleTime(this.n);
    this.cue("meteor:launch", TIMELINE.meteorStart, t);
    this.cue("meteor:impact", imp, t);
    this.cue("stars:emerge", imp + TIMELINE.formDelay, t);
    this.cue("countdown:reveal", settle - 800, t);
    this.cue("stars:settled", settle, t);
    if (!this.instant) {
      this.drawMeteor(t);
      this.drawImpact(t - imp);
      this.shake(t - imp);
    }
    this.drawSparks();
    this.drawStars(t, now);
    this.raf = requestAnimationFrame(this.loop);
  }

  geom() {
    const ang = Math.atan2(0.6, 1);
    return { P: this.anchor, dx: Math.cos(ang), dy: Math.sin(ang), L: Math.hypot(this.w, this.h) * 0.8 };
  }

  drawMeteor(t) {
    const p = (t - TIMELINE.meteorStart) / TIMELINE.meteorDuration;
    if (p < 0 || p > 1.7) return;
    const ctx = this.ctx;
    const { P, dx, dy, L } = this.geom();
    const d = (Math.min(p, 1) - 0.5) * 2 * L;
    const hx = P.x + dx * d;
    const hy = P.y + dy * d;
    const fade = p > 1 ? 1 - (p - 1) / 0.7 : 1;
    const len = L * 0.95 * Math.min(1, p * 2.4);
    const tx = hx - dx * len;
    const ty = hy - dy * len;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    [[46, 0.07], [24, 0.18], [10, 0.4], [3.5, 1]].forEach(([lw, a]) => {
      const g = ctx.createLinearGradient(hx, hy, tx, ty);
      g.addColorStop(0, `rgba(255,250,225,${a * fade})`);
      g.addColorStop(0.1, `rgba(255,210,120,${a * 0.8 * fade})`);
      g.addColorStop(1, "rgba(245,158,11,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    });
    if (p <= 1) {
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(Math.atan2(dy, dx));
      ctx.scale(4, 1);
      ctx.drawImage(this.glow, -60, -60, 120, 120);
      ctx.restore();
      ctx.drawImage(this.glow, hx - 34, hy - 34, 68, 68);
      for (let k = 0; k < 5; k++) {
        const sp = rand(2, 7);
        this.sparks.push({
          x: hx, y: hy,
          vx: -dx * sp + rand(-1.4, 1.4), vy: -dy * sp + rand(-1.4, 1.4),
          life: 1, decay: rand(0.025, 0.06), size: rand(0.8, 2.2),
        });
      }
    }
    ctx.restore();
  }

  burst() {
    const { P } = this.geom();
    for (let k = 0; k < 90; k++) {
      const a = rand(0, TAU);
      const sp = rand(2, 13);
      this.sparks.push({ x: P.x, y: P.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: rand(0.012, 0.03), size: rand(0.8, 2.6) });
    }
  }

  drawImpact(dt) {
    if (dt < 0 || dt > TIMELINE.shockDuration + 400) return;
    const ctx = this.ctx;
    const { P } = this.geom();
    const big = Math.max(this.w, this.h);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (dt < TIMELINE.flashDuration) {
      const f = 1 - dt / TIMELINE.flashDuration;
      const a = Math.pow(f, 2.2);
      ctx.fillStyle = `rgba(255,236,190,${0.6 * Math.pow(f, 7)})`;
      ctx.fillRect(0, 0, this.w, this.h);
      const R = big * (0.2 + 0.55 * (1 - f));
      const g = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, R);
      g.addColorStop(0, `rgba(255,255,245,${a})`);
      g.addColorStop(0.15, `rgba(255,214,120,${a * 0.7})`);
      g.addColorStop(1, "rgba(245,158,11,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.globalAlpha = a;
      ctx.drawImage(this.glow, P.x - this.w * 0.7, P.y - 14, this.w * 1.4, 28);
      ctx.globalAlpha = 1;
    }
    [[0, 12, 0.95, 0.9], [150, 5, 0.6, 0.72], [290, 2, 0.45, 0.56]].forEach(([delay, lw, a, max]) => {
      const p = (dt - delay) / TIMELINE.shockDuration;
      if (p < 0 || p > 1) return;
      const r = easeOutCubic(p) * big * max;
      ctx.strokeStyle = `rgba(255,215,130,${a * (1 - p)})`;
      ctx.lineWidth = lw * (1 - p) + 0.5;
      ctx.beginPath();
      ctx.arc(P.x, P.y, r, 0, TAU);
      ctx.stroke();
      if (delay === 0) {
        ctx.strokeStyle = `rgba(245,158,11,${0.12 * (1 - p)})`;
        ctx.lineWidth = 40 * (1 - p) + 4;
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  shake(dt) {
    if (dt < 0 || dt > TIMELINE.shakeDuration) {
      if (this.shaking) {
        this.shaking = false;
        this.onShake(0, 0, 0);
      }
      return;
    }
    this.shaking = true;
    const k = Math.pow(1 - dt / TIMELINE.shakeDuration, 2);
    const amp = (this.mobile ? 11 : 20) * k;
    this.onShake(rand(-amp, amp), rand(-amp, amp), rand(-0.7, 0.7) * k);
  }

  drawSparks() {
    if (!this.sparks.length) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    this.sparks = this.sparks.filter((s) => {
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.95;
      s.vy *= 0.95;
      s.vy += 0.03;
      s.life -= s.decay;
      if (s.life <= 0) return false;
      ctx.fillStyle = `rgba(255,${Math.round(190 + 60 * s.life)},${Math.round(110 + 100 * s.life)},${s.life})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (0.4 + s.life * 0.6), 0, TAU);
      ctx.fill();
      return true;
    });
    ctx.restore();
  }

  drawStars(t, now) {
    if (!this.stars.length || !this.radii) return;
    const ctx = this.ctx;
    const { rx, ry, swirl } = this.currentRadii(now);
    const P = this.anchor;
    const start0 = impactTime() + TIMELINE.formDelay;
    const secs = now / 1000;
    const S = this.star;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    this.stars.forEach((s) => {
      const lt = (t - (start0 + s.i * TIMELINE.starStagger)) / TIMELINE.starDuration;
      if (lt < 0) return;
      const p = clamp(lt);
      const sweep = (1 - easeOutCubic(p)) * s.sweep * TAU * s.dir;
      const rs = easeOutBack(clamp(p * 1.05), 0.9);
      const a = s.theta + sweep + swirl;
      const x = P.x + rx * rs * Math.cos(a);
      const y = P.y + ry * rs * Math.sin(a);
      const settled = clamp((lt - 1) * 1.5);
      const tw = Math.sin(secs * s.tw + s.ph);
      const alpha = clamp(p * 5) * (1 - settled * 0.28 * (0.5 + 0.5 * tw));
      const scale = (0.35 + 0.65 * easeOutCubic(clamp(p * 2))) * (1 + settled * 0.08 * tw);
      const rot = (1 - easeOutCubic(p)) * TAU * 2 * s.dir;
      const moving = p < 1 || swirl > 0.02;
      if (moving) {
        s.trail.push(x, y);
        if (s.trail.length > 24) s.trail.splice(0, 2);
      } else if (s.trail.length) s.trail.splice(0, 2);
      this.drawTrail(s.trail, s.size, alpha);
      const d = S.size * ((s.size * scale) / S.R);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.drawImage(S.canvas, -d / 2, -d / 2, d, d);
      ctx.restore();
      const gl = Math.sin(secs * s.gl * 2 + s.gph);
      if (settled > 0 && gl > 0.93) this.drawGlint(x, y, s.size, ((gl - 0.93) / 0.07) * settled);
    });
    ctx.restore();
  }

  drawTrail(tr, size, alpha) {
    if (tr.length < 4) return;
    const ctx = this.ctx;
    const n = tr.length / 2;
    for (let k = 1; k < n; k++) {
      const f = k / n;
      ctx.strokeStyle = `rgba(255,214,130,${f * 0.55 * alpha})`;
      ctx.lineWidth = size * 0.35 * f;
      ctx.beginPath();
      ctx.moveTo(tr[(k - 1) * 2], tr[(k - 1) * 2 + 1]);
      ctx.lineTo(tr[k * 2], tr[k * 2 + 1]);
      ctx.stroke();
    }
  }

  drawGlint(x, y, size, k) {
    const ctx = this.ctx;
    const L = size * 7;
    ctx.globalAlpha = k * 0.9;
    ctx.drawImage(this.glow, x - L, y - 2.5, L * 2, 5);
    ctx.drawImage(this.glow, x - 2.5, y - L * 0.7, 5, L * 1.4);
    ctx.globalAlpha = 1;
  }
}
