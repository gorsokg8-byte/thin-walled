// Figure library: SVG drawings for derivations. Every coordinate is computed from geometry
// (points lie on their curves, arrows follow the sign conventions of the text), nothing is placed by eye.
// Usage: TW.addFig(id, { w, h, draw(g, V) }); TW.figSvg(id) -> svg string.
(function () {
  const V = {
    add: (a, b, k = 1) => [a[0] + k * b[0], a[1] + k * b[1]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
    mul: (a, k) => [a[0] * k, a[1] * k],
    neg: a => [-a[0], -a[1]],
    len: a => Math.hypot(a[0], a[1]),
    unit: a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; },
    perp: a => [-a[1], a[0]],            // +90° on screen (clockwise, since y points down)
    dir: t => [Math.cos(t), Math.sin(t)],
    ang: a => Math.atan2(a[1], a[0]),
    lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
    mid: (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
    rot: (a, t) => [a[0] * Math.cos(t) - a[1] * Math.sin(t), a[0] * Math.sin(t) + a[1] * Math.cos(t)],
    deg: d => d * Math.PI / 180,
    // 3D helpers
    add3: (a, b, k = 1) => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]],
    mul3: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
    dot3: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross3: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    unit3: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  };
  const n = v => String(Math.round(v * 10) / 10);
  const P = p => n(p[0]) + ' ' + n(p[1]);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Colour keys: g text, m muted, a body (accent), f force, M moment, q load, u displacement, r red
  const KEYS = 'gmafMqur';
  const sc = k => 's-' + (KEYS.includes(k) ? k : 'g');
  const fc = k => 'f-' + (KEYS.includes(k) ? k : 'g');

  // Label markup: "T_1", "M_{xy}", "R^+", "ds(1+ζ/R_1)". Latin/Greek letters italic, digits and signs upright.
  function markup(s, size) {
    const segs = [];
    let i = 0, buf = '', pos = 0;
    const flush = () => { if (buf) segs.push({ t: buf, pos }); buf = ''; };
    while (i < s.length) {
      const c = s[i];
      if ((c === '_' || c === '^') && i + 1 < s.length) {
        flush();
        let t;
        if (s[i + 1] === '{') { const e = s.indexOf('}', i + 2); t = s.slice(i + 2, e); i = e + 1; }
        else { t = s[i + 1]; i += 2; }
        segs.push({ t, pos: c === '_' ? 1 : -1 });
        continue;
      }
      buf += c; i++;
    }
    flush();
    let out = '', cur = 0;
    for (const sg of segs) {
      const target = sg.pos * size * (sg.pos > 0 ? 0.3 : 0.42);
      const dy = target - cur; cur = target;
      const fs = sg.pos ? ' font-size="' + n(size * 0.72) + '"' : '';
      // split into italic (letters) and upright (digits, signs, Cyrillic) runs
      const runs = sg.t.match(/[A-Za-zΑ-ωϑϕϵ′]+|[^A-Za-zΑ-ωϑϕϵ′]+/g) || [];
      runs.forEach((r, k) => {
        const it = /[A-Za-zΑ-ωϑϕϵ]/.test(r);
        const d = k === 0 && dy ? ' dy="' + n(dy) + '"' : '';
        out += '<tspan' + d + fs + (it ? ' class="it"' : '') + '>' + esc(r) + '</tspan>';
      });
    }
    if (cur) out += '<tspan dy="' + n(-cur) + '"> </tspan>';
    return out;
  }

  function Fig(w, h) { this.w = w; this.h = h; this.out = []; this.top = []; }
  const G = Fig.prototype;
  G.raw = function (s, top) { (top ? this.top : this.out).push(s); return this; };
  const strokeAttr = (o, def, sw) => `class="${sc(o.k || def)} nf" stroke-width="${o.sw || sw}"` +
    (o.dash ? ` stroke-dasharray="${o.dash === true ? '6 4' : o.dash}"` : '') + (o.op ? ` opacity="${o.op}"` : '');

  G.line = function (a, b, o = {}) {
    return this.raw(`<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" ${strokeAttr(o, 'g', 1.4)} stroke-linecap="round"/>`);
  };
  G.path = function (d, o = {}) {
    const fill = o.fill ? ` class="${o.fill} ${o.k === null ? '' : sc(o.k || 'g')}"` : '';
    if (o.fill) return this.raw(`<path d="${d}"${fill} stroke-width="${o.sw || 1.4}"${o.k === null ? ' stroke="none"' : ''}${o.op ? ` opacity="${o.op}"` : ''}/>`);
    return this.raw(`<path d="${d}" ${strokeAttr(o, 'g', 1.4)} stroke-linejoin="round" stroke-linecap="round"/>`);
  };
  G.poly = function (pts, o = {}) {
    const d = 'M' + pts.map(P).join('L') + (o.close ? 'Z' : '');
    return this.path(d, o);
  };
  G.circle = function (c, r, o = {}) {
    const cls = o.fill ? o.fill : 'nf';
    return this.raw(`<circle cx="${n(c[0])}" cy="${n(c[1])}" r="${n(r)}" class="${cls} ${o.k === null ? '' : sc(o.k || 'g')}" stroke-width="${o.sw || 1.4}"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`);
  };
  G.dot = function (c, o = {}) {
    if (o.open) return this.raw(`<circle cx="${n(c[0])}" cy="${n(c[1])}" r="${o.r || 4.5}" class="f-bg ${sc(o.k || 'g')}" stroke-width="2"/>`, true);
    return this.raw(`<circle cx="${n(c[0])}" cy="${n(c[1])}" r="${o.r || 3.5}" class="${fc(o.k || 'g')}"/>`, o.top !== false);
  };
  G.head = function (tip, d, o = {}) {
    const u = V.unit(d), s = o.hs || 11, hw = o.hw || 4.2;
    const b = V.add(tip, u, -s), p = V.perp(u);
    return this.raw(`<path d="M${P(tip)}L${P(V.add(b, p, hw))}L${P(V.add(b, p, -hw))}Z" class="${fc(o.k || 'g')}"/>`);
  };
  // straight arrow a -> b; o.both: heads at both ends; o.dbl: double head (moment vector)
  G.arrow = function (a, b, o = {}) {
    const u = V.unit(V.sub(b, a)), s = o.hs || 11;
    const back = o.dbl ? s * 1.6 : s * 0.8;
    const a2 = o.both ? V.add(a, u, s * 0.8) : a;
    this.line(a2, V.add(b, u, -back), Object.assign({ sw: 1.8 }, o));
    this.head(b, u, o);
    if (o.dbl) this.head(V.add(b, u, -s * 0.85), u, o);
    if (o.both) this.head(a, V.neg(u), o);
    return this;
  };
  // arrow of length L along d starting at p (o.to: ending at p)
  G.vec = function (p, d, L, o = {}) {
    const u = V.unit(d);
    return o.to ? this.arrow(V.add(p, u, -L), p, o) : this.arrow(p, V.add(p, u, L), o);
  };
  const arcD = (c, r, a0, a1) => {
    const s = V.add(c, V.dir(a0), r), e = V.add(c, V.dir(a1), r);
    return `M${P(s)}A${n(r)} ${n(r)} 0 ${Math.abs(a1 - a0) > Math.PI ? 1 : 0} ${a1 > a0 ? 1 : 0} ${P(e)}`;
  };
  G.arc = function (c, r, a0, a1, o = {}) { return this.path(arcD(c, r, a0, a1), o); };
  // curved arrow (moment): arc around c from a0 to a1 (screen angles, clockwise positive), head at a1
  G.moment = function (c, r, a0, a1, o = {}) {
    const sgn = Math.sign(a1 - a0), s = o.hs || 11;
    const a1s = a1 - sgn * (s * 0.8) / r;
    this.arc(c, r, a0, a1s, Object.assign({ k: 'M', sw: 1.8 }, o));
    const tip = V.add(c, V.dir(a1), r);
    const tan = V.mul(V.perp(V.dir(a1)), sgn);
    // aim the head along the chord of the last piece so it sits on the arc
    const from = V.add(c, V.dir(a1 - sgn * s / r), r);
    this.head(tip, V.add(V.unit(V.sub(tip, from)), tan, 0.15), Object.assign({ k: 'M' }, o));
    return this;
  };
  // angle mark between directions a0 -> a1 at c, label at the bisector
  G.angle = function (c, r, a0, a1, label, o = {}) {
    this.arc(c, r, a0, a1, Object.assign({ k: 'g', sw: 1.2 }, o));
    if (label) this.text(V.add(c, V.dir((a0 + a1) / 2), o.lr || r + 13), label, Object.assign({ k: 'g' }, o.t || {}));
    return this;
  };
  // dimension line between a and b shifted by off along the left normal of a->b
  G.dim = function (a, b, off, label, o = {}) {
    const u = V.unit(V.sub(b, a)), p = V.perp(u);
    const s = o.side === -1 ? -1 : 1;
    const q1 = V.add(a, p, off * s), q2 = V.add(b, p, off * s);
    const k = o.k || 'g';
    this.line(V.add(a, p, 3 * s), V.add(a, p, (off + 5) * s), { k, sw: 0.8, op: 0.8 });
    this.line(V.add(b, p, 3 * s), V.add(b, p, (off + 5) * s), { k, sw: 0.8, op: 0.8 });
    this.arrow(q1, q2, { k, both: true, sw: 1.1, hs: 9, hw: 3.4 });
    if (label) this.text(V.add(V.mid(q1, q2), p, (o.lo || 13) * s), label, Object.assign({ k }, o.t || {}));
    return this;
  };
  // label: o.k colour, o.a anchor (start|middle|end), o.size, o.w (plain word, sans), o.bold
  G.text = function (p, s, o = {}) {
    const size = o.size || 17;
    const anchor = o.a || 'middle';
    const y = p[1] + size * 0.34;
    const body = o.w ? esc(s) : markup(String(s), size);
    const cls = `${fc(o.k || 'g')} lb${o.w ? ' w' : ''}${o.bold ? ' b' : ''}`;
    return this.raw(`<text x="${n(p[0])}" y="${n(y)}" text-anchor="${anchor}" font-size="${size}" class="${cls}">${body}</text>`, true);
  };
  // hatched support along a->b, hatch on the side of unit vector 'side'
  G.hatch = function (a, b, side, o = {}) {
    this.line(a, b, { k: 'g', sw: 2 });
    const L = V.len(V.sub(b, a)), u = V.unit(V.sub(b, a)), step = o.step || 11, h = o.h || 10;
    const sv = V.unit(side), d = V.add(V.mul(sv, h), u, -h * 0.8);
    for (let t = step / 2; t < L; t += step) {
      const q = V.add(a, u, t);
      this.line(q, V.add(q, d), { k: 'g', sw: 1 });
    }
    return this;
  };
  // zigzag break mark across a line at p, oriented along unit u
  G.brk = function (p, u, o = {}) {
    const s = o.s || 9, pp = V.perp(u);
    return this.poly([V.add(p, pp, -s * 1.4), V.add(V.add(p, pp, -s * 0.5), u, -s * 0.6), V.add(V.add(p, pp, s * 0.5), u, s * 0.6), V.add(p, pp, s * 1.4)], { k: 'g', sw: 1.4 });
  };
  // function graph: f on [x0, x1], map(x, y) -> screen point
  G.graph = function (f, x0, x1, map, o = {}) {
    const N = o.N || 120, pts = [];
    for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N; pts.push(map(x, f(x))); }
    return this.poly(pts, o);
  };
  // spring between a and b (zigzag)
  G.spring = function (a, b, o = {}) {
    const u = V.unit(V.sub(b, a)), p = V.perp(u), L = V.len(V.sub(b, a)), m = o.m || 6, w = o.wd || 6;
    const pts = [a, V.add(a, u, L * 0.2)];
    for (let i = 0; i < m; i++) pts.push(V.add(V.add(a, u, L * (0.2 + 0.6 * (i + 0.5) / m)), p, (i % 2 ? -1 : 1) * w));
    pts.push(V.add(a, u, L * 0.8), b);
    return this.poly(pts, Object.assign({ k: 'm', sw: 1.2 }, o));
  };

  // ---- 3D: orthographic projection; camera given by azimuth and elevation (degrees) ----
  // world: X right, Y up, Z toward the viewer at az = 0.
  V.camera = function (az, el, scale, origin) {
    const A = V.deg(az), E = V.deg(el);
    const c = [Math.sin(A) * Math.cos(E), Math.sin(E), Math.cos(A) * Math.cos(E)];   // toward viewer
    const e1 = V.unit3([Math.cos(A), 0, -Math.sin(A)]);                                 // screen right
    const e2 = V.cross3(c, e1);                                                           // screen up
    const pr = p => [origin[0] + scale * V.dot3(p, e1), origin[1] - scale * V.dot3(p, e2)];
    pr.view = c; pr.depth = p => V.dot3(p, c);
    return pr;
  };
  // 3D arrow from p along d (length L)
  G.vec3 = function (pr, p, d, L, o = {}) {
    const q = V.add3(p, V.unit3(d), L);
    return o.to ? this.arrow(pr(V.add3(p, V.unit3(d), -L)), pr(p), o) : this.arrow(pr(p), pr(q), o);
  };
  // 3D curved arrow: points c + r(cos a u + sin a v), a from a0 to a1 (radians), head at a1
  G.arc3 = function (pr, c, u, v, r, a0, a1, o = {}) {
    const N = 40, pts = [];
    for (let i = 0; i <= N; i++) {
      const a = a0 + (a1 - a0) * i / N;
      pts.push(pr(V.add3(V.add3(c, u, r * Math.cos(a)), v, r * Math.sin(a))));
    }
    const k = o.k || 'M';
    const tip = pts[N];
    // shorten the line under the head
    let j = N; while (j > 0 && V.len(V.sub(tip, pts[j])) < 9) j--;
    this.poly(pts.slice(0, j + 1), { k, sw: o.sw || 1.8 });
    this.head(tip, V.sub(tip, pts[Math.max(0, j - 1)]), { k, hs: 10, hw: 4 });
    return this;
  };

  G.svg = function () {
    return `<svg class="twf" width="${this.w}" viewBox="0 0 ${this.w} ${this.h}" xmlns="http://www.w3.org/2000/svg" role="img">` +
      this.out.join('') + this.top.join('') + '</svg>';
  };

  TW.figs = {};
  TW.V = V;
  TW.addFig = (id, spec) => { TW.figs[id] = spec; };
  TW.figSvg = function (id) {
    const s = TW.figs[id];
    if (!s) return '<p class="muted">[нет рисунка ' + esc(id) + ']</p>';
    if (!s.cache) { const g = new Fig(s.w, s.h); s.draw(g, V); s.cache = g.svg(); }
    return s.cache;
  };
  TW.figNode = function (id) {
    const s = TW.figs[id] || {};
    return TW.el('figure', { class: 'twfig' }, TW.el('div', { html: TW.figSvg(id) }),
      s.caption ? TW.el('figcaption', { html: s.caption }) : null);
  };
})();
