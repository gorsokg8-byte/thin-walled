// Minimal SVG line plot with axes, grid, legend and hover readout.
// TW.plot({ title, xlabel, ylabel, series: [{ x: [], y: [], label, color, dash }], height, vlines: [{x, label}] })
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = ['var(--plot1)', 'var(--plot2)', 'var(--plot3)', 'var(--plot4)'];

  function svg(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
    return e;
  }

  function niceTicks(min, max, count) {
    if (min === max) { min -= 1; max += 1; }
    const span = max - min;
    const step0 = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const norm = step0 / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step * 1e-9; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
    return { lo, hi, ticks };
  }

  function label(v) {
    const a = Math.abs(v);
    if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(1).replace('.', ',');
    return Number(v.toPrecision(4)).toString().replace('.', ',');
  }

  TW.plot = function (o) {
    // narrower drawing on phones keeps 11px labels readable
    const W = Math.round(Math.min(640, Math.max(360, (window.innerWidth || 640) - 40))), H = Math.round((o.height || 260) * (W < 640 ? 0.85 : 1)), L = 62, R = 14, T = 12, B = 38;
    const wrap = TW.el('div', { class: 'plot' });
    if (o.title) wrap.append(TW.el('div', { class: 'p-title', html: o.title }));

    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    for (const s of o.series) {
      s.x.forEach(v => { xmin = Math.min(xmin, v); xmax = Math.max(xmax, v); });
      s.y.forEach(v => { if (isFinite(v)) { ymin = Math.min(ymin, v); ymax = Math.max(ymax, v); } });
    }
    if (o.yZero !== false) { ymin = Math.min(ymin, 0); ymax = Math.max(ymax, 0); }
    const xt = niceTicks(xmin, xmax, 8);
    const yt = niceTicks(ymin, ymax, 6);
    const X = v => L + (v - xt.lo) / (xt.hi - xt.lo) * (W - L - R);
    const Y = v => T + (yt.hi - v) / (yt.hi - yt.lo) * (H - T - B);

    const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
    for (const v of yt.ticks) {
      root.append(svg('line', { class: 'grid', x1: L, x2: W - R, y1: Y(v), y2: Y(v) }));
      const t = svg('text', { class: 'tick', x: L - 6, y: Y(v) + 4, 'text-anchor': 'end' });
      t.textContent = label(v); root.append(t);
    }
    for (const v of xt.ticks) {
      root.append(svg('line', { class: 'grid', x1: X(v), x2: X(v), y1: T, y2: H - B }));
      const t = svg('text', { class: 'tick', x: X(v), y: H - B + 15, 'text-anchor': 'middle' });
      t.textContent = label(v); root.append(t);
    }
    if (yt.lo < 0 && yt.hi > 0) root.append(svg('line', { class: 'zero', x1: L, x2: W - R, y1: Y(0), y2: Y(0) }));
    root.append(svg('line', { class: 'axis', x1: L, x2: L, y1: T, y2: H - B }));
    root.append(svg('line', { class: 'axis', x1: L, x2: W - R, y1: H - B, y2: H - B }));
    if (o.xlabel) {
      const t = svg('text', { class: 'tick', x: (L + W - R) / 2, y: H - 4, 'text-anchor': 'middle' });
      t.textContent = o.xlabel; root.append(t);
    }
    if (o.ylabel) {
      const t = svg('text', { class: 'tick', x: 12, y: (T + H - B) / 2, 'text-anchor': 'middle', transform: `rotate(-90 12 ${(T + H - B) / 2})` });
      t.textContent = o.ylabel; root.append(t);
    }
    for (const vl of o.vlines || []) {
      root.append(svg('line', { class: 'zero', x1: X(vl.x), x2: X(vl.x), y1: T, y2: H - B }));
      if (vl.label) {
        const t = svg('text', { class: 'tick', x: X(vl.x) + 4, y: T + 12 });
        t.textContent = vl.label; root.append(t);
      }
    }
    o.series.forEach((s, i) => {
      const col = s.color || COLORS[i % COLORS.length];
      let d = '';
      s.x.forEach((xv, j) => {
        if (!isFinite(s.y[j])) return;
        d += (d ? 'L' : 'M') + X(xv).toFixed(1) + ',' + Y(s.y[j]).toFixed(1);
      });
      root.append(svg('path', { d, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': s.dash || '' }));
    });

    // hover readout
    const cross = svg('line', { class: 'cross', y1: T, y2: H - B, x1: -10, x2: -10 });
    root.append(cross);
    const readout = TW.el('div', { class: 'readout hidden' });
    root.addEventListener('pointermove', ev => {
      const box = root.getBoundingClientRect();
      const px = (ev.clientX - box.left) / box.width * W;
      if (px < L || px > W - R) { readout.classList.add('hidden'); cross.setAttribute('x1', -10); cross.setAttribute('x2', -10); return; }
      const xv = xt.lo + (px - L) / (W - L - R) * (xt.hi - xt.lo);
      const s0 = o.series[0];
      let j = 0, best = Infinity;
      s0.x.forEach((v, k) => { const dd = Math.abs(v - xv); if (dd < best) { best = dd; j = k; } });
      cross.setAttribute('x1', X(s0.x[j])); cross.setAttribute('x2', X(s0.x[j]));
      readout.classList.remove('hidden');
      readout.textContent = (o.xname || 'x') + ' = ' + TW.fmt(s0.x[j], 3) + '   ' +
        o.series.map(s => (s.label || '') + ' = ' + TW.fmt(s.y[j], 4)).join('   ');
    });
    root.addEventListener('pointerleave', () => { readout.classList.add('hidden'); cross.setAttribute('x1', -10); cross.setAttribute('x2', -10); });

    wrap.append(root, readout);
    if (o.series.length > 1 || o.series[0].label) {
      const lg = TW.el('div', { class: 'legend' });
      o.series.forEach((s, i) => {
        const sw = TW.el('i'); sw.style.background = s.color || COLORS[i % COLORS.length];
        lg.append(TW.el('span', {}, sw, TW.el('span', { html: s.labelHtml || s.label || '' })));
      });
      wrap.append(lg);
    }
    return wrap;
  };

  TW.linspace = function (a, b, n) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(a + (b - a) * i / (n - 1));
    return out;
  };
})();
