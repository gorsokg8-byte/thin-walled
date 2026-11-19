// Figures for plate derivations. Conventions as in Biderman ch. 1-2: axis z (and w, q, Q on a positive face)
// points UP; positive bending moment stretches the fibres z > 0; theta (circular plate) > 0 when points z > 0
// move away from the axis.
(function () {
const R = String.raw;
const deg = d => d * Math.PI / 180;
const PI = Math.PI;
const S = p => p[0].toFixed(1) + ' ' + p[1].toFixed(1);

// ---------------- Kirchhoff kinematics ----------------
function kirch(g, V, mode) {
  const y0 = 238, hh = 24, x0 = 70, x1 = 470, xm = 250, zz = 44;
  const isR = mode === 'r';
  if (isR) { g.line([40, 40], [40, 300], { k: 'g', sw: 1.1, dash: '14 4 3 4' }); g.text([46, 34], 'ось', { w: true, size: 14, a: 'start' }); }
  // undeformed plate
  g.line([x0, y0 - hh], [x1, y0 - hh], { k: 'm', sw: 1 }); g.line([x0, y0 + hh], [x1, y0 + hh], { k: 'm', sw: 1 });
  g.line([x0, y0], [x1, y0], { k: 'a', sw: 1.4, dash: '6 4' });
  const M = [xm, y0], N = [xm, y0 - zz];
  g.line([xm, y0 + hh], [xm, y0 - hh], { k: 'g', sw: 1.6 });
  // deformed mid-surface: w(x) = w0 + sl (x - xm) + c (x - xm)^2, screen y = y0 - w
  const w0 = 100, sl = isR ? -0.36 : 0.36, c = isR ? -0.0005 : 0.0005;
  const Y = x => y0 - (w0 + sl * (x - xm) + c * (x - xm) ** 2);
  const slope = x => -(sl + 2 * c * (x - xm));        // dy/dx on screen
  const up = x => V.unit([slope(x), -1]);             // normal of the deformed surface pointing to +z
  const off = (x, d) => V.add([x, Y(x)], up(x), d);
  const pts = (d) => { const r = []; for (let x = x0 + 20; x <= x1 - 20; x += 8) r.push(off(x, d)); return r; };
  g.poly(pts(-hh), { k: 'm', sw: 1 }); g.poly(pts(hh), { k: 'm', sw: 1 });
  g.poly(pts(0), { k: 'a', sw: 3 });
  const M1 = [xm, Y(xm)], n1 = up(xm), N1 = V.add(M1, n1, zz);
  g.line(V.add(M1, n1, -hh), V.add(M1, n1, hh), { k: 'g', sw: 2 });
  // reference vertical through M1 and the rotation angle
  g.line(M1, [xm, M1[1] - 92], { k: 'm', dash: '5 4', sw: 1 });
  const aN = V.ang(n1);
  g.angle(M1, 70, Math.min(-PI / 2, aN), Math.max(-PI / 2, aN), isR ? 'ϑ' : 'ϑ_x', { lr: 86 });
  // tangent and horizontal: the same angle
  const tng = V.unit([1, slope(xm)]);
  g.line(V.add(M1, tng, -10), V.add(M1, tng, 120), { k: 'm', dash: '3 3', sw: 1 });
  g.line(M1, [xm + 120, M1[1]], { k: 'm', dash: '3 3', sw: 1 });
  const aT = V.ang(tng);
  g.angle(M1, 96, Math.min(0, aT), Math.max(0, aT), isR ? '−dw/dr' : '∂w/∂x', { lr: 116, t: { size: 15, a: 'start' } });
  // w and u
  g.arrow(M, M1, { k: 'u' }); g.text([xm + 14, (M[1] + M1[1]) / 2 + 6], 'w', { k: 'u', a: 'start' });
  g.arrow([xm, N1[1]], N1, { k: 'u', sw: 1.6, hs: 8, hw: 3.2 });
  g.text([N1[0] + (isR ? 12 : -12), N1[1] + 2], isR ? 'u = ϑz' : 'u = −zϑ_x', { k: 'u', a: isR ? 'start' : 'end', size: 15 });
  g.line(N1, [xm, N1[1]], { k: 'u', sw: 0.8, dash: '2 2' });
  // labels
  g.dot(M, { open: true }); g.dot(N); g.dot(M1, { open: true }); g.dot(N1);
  g.text([xm - 14, y0 + 14], 'M', { a: 'end' }); g.text([xm - 10, N[1] - 2], 'N', { a: 'end' });
  g.text([xm - 12, (y0 + N[1]) / 2 + 2], 'z', { a: 'end', k: 'm' });
  g.text(V.add(M1, [isR ? 14 : -14, 16]), 'M_1', { a: isR ? 'start' : 'end' }); g.text([xm + (isR ? -10 : 10), N1[1] - 6], 'N_1', { a: isR ? 'end' : 'start' });
  // axes
  g.arrow([x1 - 40, 300], [x1 + 4, 300], { k: 'g', sw: 1.2, hs: 9, hw: 3.4 }); g.text([x1 + 12, 300], isR ? 'r' : 'x', { a: 'start' });
  g.arrow([x0 - 30, 300], [x0 - 30, 256], { k: 'g', sw: 1.2, hs: 9, hw: 3.4 }); g.text([x0 - 30, 244], 'z');
}
TW.addFig('pl-kirch-x', { w: 500, h: 320,
  caption: R`Сечение $y = \text{const}$ до и после изгиба. Нормаль остаётся прямой, не меняет длины и остаётся нормальной к изогнутой поверхности: она поворачивается на угол $\vartheta_x = \partial w/\partial x$ (тот же, что у касательной). Точка $N$ на расстоянии $z$ смещается вдоль $x$ на $u = -z\vartheta_x$: при подъёме поверхности вправо верхние точки уходят назад.`,
  draw(g, V) { kirch(g, V, 'x'); } });
TW.addFig('pl-kirch-r', { w: 500, h: 320,
  caption: R`Радиальное сечение круглой пластины до и после изгиба. Угол поворота нормали $\vartheta$ положителен, когда точки $z > 0$ удаляются от оси; тогда $\vartheta = -dw/dr$, а точка на расстоянии $z$ смещается по радиусу на $u = \vartheta z$.`,
  draw(g, V) { kirch(g, V, 'r'); } });

// ---------------- 3D helpers ----------------
function box3(g, V, pr, faces) {
  for (const f of faces) g.poly(f.pts.map(pr), { close: true, fill: f.fill || 'fs-a', k: 'a', sw: 1.3 });
}
function lab3(g, V, pr, p3, d3, L, text, k, extra = 15, size) {
  const a = pr(p3), b = pr(V.add3(p3, V.unit3(d3), L));
  g.text(V.add(b, V.unit(V.sub(b, a)), extra), text, { k, size });
}
function force3(g, V, pr, p3, d3, L, text, o = {}) {
  const k = o.k || 'f';
  if (o.to) { g.vec3(pr, p3, d3, L, { k, to: true }); lab3(g, V, pr, p3, V.mul3(d3, -1), L, text, k, 14, o.size); }
  else { g.vec3(pr, p3, d3, L, { k }); lab3(g, V, pr, p3, d3, L, text, k, 14, o.size); }
}
function mom3(g, V, pr, c, u, v, r, text, o = {}) {
  g.arc3(pr, c, u, v, r, -0.25, PI + 0.25, { k: 'M' });
  const apex = pr(V.add3(c, v, r));
  const d = o.ctr ? V.unit(V.sub(apex, o.ctr)) : V.unit(V.sub(pr(V.add3(c, v, 1)), pr(c)));
  const m = V.add(V.add(apex, d, o.d || 24), [o.dx || 0, o.dy || 0]);
  g.text(m, text, { k: 'M', size: o.size || 15, a: d[0] > 0.35 ? 'start' : d[0] < -0.35 ? 'end' : 'middle' });
}

// ---------------- circular plate ----------------
TW.addFig('pl-circ-elem', { w: 540, h: 620,
  caption: R`Элемент круглой пластины между радиусами $r$ и $r + dr$ и меридиональными сечениями под углом $d\varphi$ (как у Бидермана, рис. 1.4). а) Поперечные силы на цилиндрических гранях — на единицу угла (множитель $d\varphi$ опущен): $rQ$ и $rQ + d(rQ)$; нагрузка $q$. б) Моменты: $rM_1$ и $rM_1 + d(rM_1)$ на цилиндрических гранях, $M_2\,dr$ на радиальных. Ось $z$ и положительная нагрузка $q$ направлены вверх; положительные моменты растягивают волокна $z > 0$.`,
  draw(g, V) {
    const r1 = 100, r2 = 175, hf = deg(14), t = 20, rm = (r1 + r2) / 2;
    const P = (r, ph, z) => [r * Math.cos(ph), z, r * Math.sin(ph)];
    const mk = center => { const cam = V.camera(24, 30, 1.9, [0, 0]); const c0 = cam(P(rm, 0, 0)), sh = V.sub(center, c0); return p => V.add(cam(p), sh); };
    const arcPts = (r, a, b, z, N = 14) => { const o = []; for (let i = 0; i <= N; i++) o.push(P(r, a + (b - a) * i / N, z)); return o; };
    const ex = ph => [Math.cos(ph), 0, Math.sin(ph)], ez = [0, 1, 0], ef = ph => [-Math.sin(ph), 0, Math.cos(ph)];
    const body = pr => {
      g.line(pr(P(0, 0, -60)), pr(P(0, 0, 80)), { k: 'g', sw: 1.1, dash: '14 4 3 4' }); g.text(V.add(pr(P(0, 0, 80)), [10, 0]), 'z', { a: 'start' });
      g.line(pr(P(0, 0, 0)), pr(P(r1, -hf, 0)), { k: 'm', sw: 0.9, dash: '4 4' }); g.line(pr(P(0, 0, 0)), pr(P(r1, hf, 0)), { k: 'm', sw: 0.9, dash: '4 4' });
      g.text(V.add(pr(P(36, 0, 0)), [8, 2]), 'dφ', { k: 'm', size: 15, a: 'start' });
      box3(g, V, pr, [{ pts: arcPts(r2, -hf, hf, t / 2).concat(arcPts(r2, hf, -hf, -t / 2)), fill: 'fs-s' },
        { pts: [P(r1, hf, t / 2), P(r2, hf, t / 2), P(r2, hf, -t / 2), P(r1, hf, -t / 2)], fill: 'fs-s' },
        { pts: arcPts(r1, -hf, hf, t / 2).concat(arcPts(r2, hf, -hf, t / 2)) }]);
      g.text(V.add(pr(P(rm, hf, -t / 2)), [-8, 18]), 'dr', { k: 'm', size: 15 });
    };
    const Ci = P(r1, 0, 0), Co = P(r2, 0, 0), Cp = P(rm, hf, 0), Cm = P(rm, -hf, 0);
    // а) forces
    let pr = mk([300, 200]);
    force3(g, V, pr, P(r1, 0, t / 2), [0, -1, 0], 56, 'rQ', { to: true });
    body(pr);
    force3(g, V, pr, P(r2, 0, -t / 2), ez, 56, 'rQ + d(rQ)', { to: true });
    g.vec3(pr, P(rm, 0, t / 2), ez, 44, { k: 'q' }); lab3(g, V, pr, P(rm, 0, t / 2), ez, 44, 'q', 'q', 12);
    // б) moments
    pr = mk([300, 470]);
    body(pr);
    const ctr = pr(P(rm, 0, 0)), r = 15;
    mom3(g, V, pr, Ci, ez, V.mul3(ex(0), -1), r, 'rM_1', { ctr });
    mom3(g, V, pr, Co, ez, ex(0), r, 'rM_1 + d(rM_1)', { ctr });
    mom3(g, V, pr, Cp, ez, ef(hf), r, 'M_2 dr', { ctr });
    mom3(g, V, pr, Cm, ez, V.mul3(ef(-hf), -1), r, 'M_2 dr', { ctr });
    g.text([14, 320], 'а)', { w: true, a: 'start', size: 15 }); g.text([14, 606], 'б)', { w: true, a: 'start', size: 15 });
  } });

TW.addFig('pl-circ-core', { w: 520, h: 330,
  caption: R`Центральная часть пластины, вырезанная цилиндрическим сечением радиуса $r$. На контуре длиной $2\pi r$ действует поперечная сила $Q$ (показана в положительном направлении — вверх), нагрузка внутри даёт равнодействующую $F(r)$. Равновесие по оси: $2\pi rQ + F = 0$, то есть $Q = -F/(2\pi r)$.`,
  draw(g, V) {
    const C = [250, 140], rx = 170, ry = 46, t = 18;
    g.line([C[0], 22], [C[0], 312], { k: 'g', sw: 1.1, dash: '14 4 3 4' }); g.text([C[0] + 10, 26], 'z', { a: 'start' });
    // side band (front half) and top ellipse
    g.path(`M${C[0] - rx} ${C[1]}A${rx} ${ry} 0 0 0 ${C[0] + rx} ${C[1]}L${C[0] + rx} ${C[1] + t}A${rx} ${ry} 0 0 1 ${C[0] - rx} ${C[1] + t}Z`, { fill: 'fs-s', k: 'a', sw: 1.3 });
    g.path(`M${C[0] - rx} ${C[1]}A${rx} ${ry} 0 1 0 ${C[0] + rx} ${C[1]}A${rx} ${ry} 0 1 0 ${C[0] - rx} ${C[1]}Z`, { fill: 'fs-a', k: 'a', sw: 1.5 });
    g.line(C, [C[0] + rx, C[1]], { k: 'g', sw: 1.2, dash: '5 4' }); g.text([C[0] + rx / 2, C[1] - 12], 'r');
    for (const a of [200, 240, 300, 340]) {
      const p = [C[0] + rx * Math.cos(deg(a) + PI), C[1] + t / 2 - ry * Math.sin(deg(a) + PI)];
      g.arrow(p, [p[0], p[1] - 52], { k: 'f' });
    }
    g.text([C[0] + rx * Math.cos(deg(340) + PI) + 12, C[1] - 46], 'Q', { k: 'f', a: 'start' });
    for (const dx of [-90, -30, 30, 90]) {
      const yb = C[1] + t + ry * Math.sqrt(1 - (dx / rx) ** 2);
      g.arrow([C[0] + dx, yb + 54], [C[0] + dx, yb + 4], { k: 'q', sw: 1.4, hs: 8, hw: 3.2 });
    }
    g.text([C[0] - 112, C[1] + 118], 'q', { k: 'q' });
    g.arrow([C[0] + 2, 300], [C[0] + 2, 236], { k: 'q', sw: 3 }); g.text([C[0] + 16, 280], 'F', { k: 'q', a: 'start', bold: true });
    g.text([C[0] + rx + 8, C[1] + t + 22], '2πr', { a: 'start', k: 'a' });
  } });

// ---------------- rectangular plate element ----------------
// plate (x, y, z) -> world (y, z, x): y to the right, z up, x toward the viewer (left-down on screen)
function plateCam(V, center, scale) {
  const cam = V.camera(40, 26, scale, [0, 0]);
  const W = p => [p[1], p[2], p[0]];
  const c0 = cam(W([0, 0, 0])), sh = V.sub(center, c0);
  const pr = p => V.add(cam(W(p)), sh);
  return pr;
}
function plateBox(g, V, pr, a, t) {
  const h = t / 2, A = a / 2;
  const top = [[-A, -A, h], [A, -A, h], [A, A, h], [-A, A, h]];
  const fx = [[A, -A, h], [A, A, h], [A, A, -h], [A, -A, -h]];
  const fy = [[-A, A, h], [A, A, h], [A, A, -h], [-A, A, -h]];
  box3(g, V, pr, [{ pts: fx, fill: 'fs-s' }, { pts: fy, fill: 'fs-s' }, { pts: top }]);
}
TW.addFig('pl-elem3d', { w: 540, h: 840,
  caption: R`Элемент пластины $dx\times dy$ (как у Бидермана, рис. 2.5). а) Поперечные силы на гранях (на ближних гранях — с приращениями $dQ_x = \frac{\partial Q_x}{\partial x}dx$, $dQ_y = \frac{\partial Q_y}{\partial y}dy$) и нагрузка $q\,dx\,dy$. б) Изгибающие моменты $M_x$, $M_y$. в) Крутящие моменты $M_{xy} = M_{yx}$. Все силы и моменты на гранях умножаются на длину грани ($dy$ или $dx$). Положительные направления: $Q$ на положительной грани — по $z$; положительный момент растягивает волокна $z > 0$.`,
  draw(g, V) {
    const a = 130, t = 22, A = a / 2;
    const ex = [1, 0, 0], ey = [0, 1, 0], ez = [0, 0, 1], m = v => [-v[0], -v[1], -v[2]];
    const axes = (pr, o) => {
      for (const [d, s] of [[ex, 'x'], [ey, 'y'], [ez, 'z']]) {
        const p0 = pr([0, 0, 0]), p1 = pr(d), u = V.unit(V.sub(p1, p0));
        g.arrow(o, V.add(o, u, 30), { k: 'g', sw: 1.2, hs: 8, hw: 3.2 }); g.text(V.add(o, u, 42), s, { size: 15 });
      }
    };
    // а) forces
    let pr = plateCam(V, [270, 145], 1.5);
    force3(g, V, pr, [-A, 0, t / 2], m(ez), 58, 'Q_x', { to: true });
    force3(g, V, pr, [0, -A, t / 2], m(ez), 58, 'Q_y', { to: true });
    plateBox(g, V, pr, a, t);
    force3(g, V, pr, [A, 0, -t / 2], ez, 58, 'Q_x + dQ_x', { to: true });
    force3(g, V, pr, [0, A, -t / 2], ez, 58, 'Q_y + dQ_y', { to: true });
    force3(g, V, pr, [0, 0, t / 2], ez, 46, 'q dx dy', { k: 'q' });
    g.text(V.add(pr([A + 4, -A / 2, -t / 2]), [-10, 16]), 'dy', { k: 'm', size: 15 });
    g.text(V.add(pr([-A / 2, A + 4, -t / 2]), [10, 16]), 'dx', { k: 'm', size: 15 });
    axes(pr, [470, 230]);
    const r = 17;
    // б) bending
    pr = plateCam(V, [270, 420], 1.5);
    plateBox(g, V, pr, a, t);
    let ctr = pr([0, 0, 0]);
    mom3(g, V, pr, [A, 0, 0], ez, ex, r, 'M_x + dM_x', { ctr });
    mom3(g, V, pr, [-A, 0, 0], ez, m(ex), r, 'M_x', { ctr });
    mom3(g, V, pr, [0, A, 0], ez, ey, r, 'M_y + dM_y', { ctr });
    mom3(g, V, pr, [0, -A, 0], ez, m(ey), r, 'M_y', { ctr });
    // в) twisting
    pr = plateCam(V, [270, 690], 1.5);
    plateBox(g, V, pr, a, t);
    ctr = pr([0, 0, 0]);
    mom3(g, V, pr, [A, 0, 0], ez, ey, r, 'M_{xy} + dM_{xy}', { ctr, d: 30 });
    mom3(g, V, pr, [-A, 0, 0], ez, m(ey), r, 'M_{xy}', { ctr, d: 30 });
    mom3(g, V, pr, [0, A, 0], ez, ex, r, 'M_{yx} + dM_{yx}', { ctr, d: 30 });
    mom3(g, V, pr, [0, -A, 0], ez, m(ex), r, 'M_{yx}', { ctr, d: 30 });
    g.text([14, 270], 'а)', { w: true, a: 'start', size: 15 }); g.text([14, 545], 'б)', { w: true, a: 'start', size: 15 }); g.text([14, 822], 'в)', { w: true, a: 'start', size: 15 });
  } });

// ---------------- Kirchhoff force ----------------
TW.addFig('pl-kirchhoff', { w: 560, h: 330,
  caption: R`Край $x = \text{const}$, вид снаружи (ось $y$ вправо, $z$ вверх). а) Крутящий момент $M_{xy}\,dy$ на каждом отрезке $dy$ заменяем парой вертикальных сил $M_{xy}$ на плече $dy$ (принцип Сен-Венана). б) На общих точках соседних отрезков силы почти гасятся: остаётся $\frac{\partial M_{xy}}{\partial y}dy$ — распределённая сила $\partial M_{xy}/\partial y$, которая добавляется к $Q_x$. На концах края остаются сосредоточенные силы — в угле прямоугольной пластины вместе с соседним краем $2M_{xy}$.`,
  draw(g, V) {
    const xs = [70, 170, 270, 370, 470], mxy = [28, 36, 44, 52];
    // а) twisting moments and the equivalent couples
    const ya = 92;
    g.line([40, ya], [500, ya], { k: 'a', sw: 3 });
    for (const x of xs) g.line([x, ya - 8], [x, ya + 8], { k: 'g', sw: 1.2 });
    for (let i = 0; i < 4; i++) {
      const c = [(xs[i] + xs[i + 1]) / 2, ya];
      g.moment(c, 16 + i * 2, deg(200), deg(500), { k: 'M', hs: 9, hw: 3.4 });
      g.arrow([xs[i] + 6, ya + mxy[i]], [xs[i] + 6, ya + 2], { k: 'f', sw: 1.5, hs: 8, hw: 3 });
      g.arrow([xs[i + 1] - 6, ya - mxy[i]], [xs[i + 1] - 6, ya - 2], { k: 'f', sw: 1.5, hs: 8, hw: 3 });
    }
    g.text([(xs[0] + xs[1]) / 2, ya - 42], 'M_{xy} dy', { k: 'M', size: 15 });
    g.text([xs[0] - 6, ya + 44], 'M_{xy}', { k: 'f', size: 15, a: 'start' });
    g.dim([xs[1], ya + 56], [xs[2], ya + 56], 0, '', {}); g.text([(xs[1] + xs[2]) / 2, ya + 72], 'dy', { size: 15 });
    // б) resultant
    const yb = 250;
    g.line([40, yb], [500, yb], { k: 'a', sw: 3 });
    g.arrow([xs[0], yb + mxy[0] + 8], [xs[0], yb + 2], { k: 'f' });
    for (let i = 1; i < 4; i++) g.arrow([xs[i], yb + 22], [xs[i], yb + 2], { k: 'f', sw: 1.6, hs: 8, hw: 3 });
    g.arrow([xs[4], yb - mxy[3] - 8], [xs[4], yb - 2], { k: 'f' });
    g.text([(xs[1] + xs[3]) / 2, yb + 40], '∂M_{xy}/∂y · dy (к Q_x)', { k: 'f', size: 15 });
    g.text([xs[0] + 10, yb + 50], 'M_{xy}', { k: 'f', size: 15, a: 'start' });
    g.text([xs[4] - 10, yb - 56], 'M_{xy}', { k: 'f', size: 15, a: 'end' });
    g.arrow([500, 300], [540, 300], { k: 'g', sw: 1.2, hs: 8, hw: 3.2 }); g.text([546, 300], 'y', { a: 'start', size: 15 });
    g.arrow([520, 40], [520, 6], { k: 'g', sw: 1.2, hs: 8, hw: 3.2 }); g.text([532, 22], 'z', { a: 'start', size: 15 });
    g.text([14, 160], 'а)', { w: true, a: 'start', size: 15 }); g.text([14, 318], 'б)', { w: true, a: 'start', size: 15 });
  } });

// ---------------- oblique section ----------------
TW.addFig('pl-oblique', { w: 580, h: 560,
  caption: R`Треугольный элемент у косой площадки с нормалью $\nu$ под углом $\varphi$ к оси $x$ (как у Бидермана, рис. 2.9). а) Геометрия: $dy = ds\cos\varphi$, $dx = ds\sin\varphi$; касательная $t$ — поворот $\nu$ на $90°$. б) Поперечные силы. в) «Изгибающие» моменты $M_x$, $M_y$, $M_\nu$. г) Крутящие $M_{xy}$, $M_{yx}$, $M_{\nu t}$. На гранях $x = \text{const}$ и $y = \text{const}$ внешние нормали направлены против осей, поэтому положительные величины на них показаны «обратными».`,
  draw(g, V) {
    const ph = deg(35), ds = 170, Ly = ds * Math.cos(ph), Lx = ds * Math.sin(ph);
    // а) plan, y up
    const O = [64, 230], A = [O[0], O[1] - Ly], B = [O[0] + Lx, O[1]];
    g.arrow([O[0] - 26, O[1] + 26], [O[0] - 26, O[1] - Ly - 16], { k: 'g', sw: 1.1, hs: 8, hw: 3 }); g.text([O[0] - 26, O[1] - Ly - 28], 'y', { size: 15 });
    g.arrow([O[0] - 26, O[1] + 26], [B[0] + 30, O[1] + 26], { k: 'g', sw: 1.1, hs: 8, hw: 3 }); g.text([B[0] + 40, O[1] + 26], 'x', { a: 'start', size: 15 });
    g.poly([O, A, B], { close: true, fill: 'fs-a', k: 'a', sw: 2 });
    const Mh = V.mid(A, B), nu = [Math.cos(ph), -Math.sin(ph)], tt = [-Math.sin(ph), -Math.cos(ph)];
    g.vec(Mh, nu, 70, { k: 'g', sw: 1.6 }); g.text(V.add(Mh, nu, 84), 'ν');
    g.vec(Mh, tt, 62, { k: 'g', sw: 1.6 }); g.text(V.add(Mh, tt, 76), 't');
    g.line(Mh, [Mh[0] + 62, Mh[1]], { k: 'm', dash: '3 3', sw: 1 });
    g.angle(Mh, 40, -ph, 0, 'φ', { lr: 54 });
    g.text([O[0] + 8, (O[1] + A[1]) / 2 + 30], 'ds cos φ', { a: 'start', size: 14 });
    g.text([(O[0] + B[0]) / 2, O[1] + 14], 'ds sin φ', { size: 14 });
    // 3D: plate (x, y, z) -> world (x, z, -y)
    const W = p => [p[0], p[2], -p[1]];
    const mk = center => { const cam = V.camera(52, 34, 1.35, [0, 0]); const c0 = cam(W([Lx / 3, Ly / 3, 0])), sh = V.sub(center, c0); return p => V.add(cam(W(p)), sh); };
    const t = 16, h = t / 2, ex = [1, 0, 0], ey = [0, 1, 0], ez = [0, 0, 1], m = v => [-v[0], -v[1], -v[2]];
    const nu3 = [Math.cos(ph), Math.sin(ph), 0], t3 = [-Math.sin(ph), Math.cos(ph), 0];
    const prism = pr => {
      for (const [a, b] of [[[0, 0], [Lx, 0]], [[Lx, 0], [0, Ly]]]) g.poly([[a[0], a[1], h], [b[0], b[1], h], [b[0], b[1], -h], [a[0], a[1], -h]].map(pr), { close: true, fill: 'fs-s', k: 'a', sw: 1.2 });
      g.poly([[0, 0, h], [0, Ly, h], [Lx, 0, h]].map(pr), { close: true, fill: 'fs-a', k: 'a', sw: 1.4 });
    };
    const Cx = [0, Ly / 2, 0], Cy = [Lx / 2, 0, 0], Cn = [Lx / 2, Ly / 2, 0];
    // б) shear forces
    let pr = mk([430, 130]);
    force3(g, V, pr, [0, Ly / 2, h], m(ez), 50, 'Q_x', { to: true });
    prism(pr);
    force3(g, V, pr, Cy, m(ez), 50, 'Q_y');
    force3(g, V, pr, Cn, ez, 50, 'Q_ν');
    const r = 14;
    // в) bending-type moments
    pr = mk([140, 410]); prism(pr);
    let ctr = pr([Lx / 3, Ly / 3, 0]);
    mom3(g, V, pr, Cx, ez, m(ex), r, 'M_x', { ctr });
    mom3(g, V, pr, Cy, ez, m(ey), r, 'M_y', { ctr });
    mom3(g, V, pr, Cn, ez, nu3, r, 'M_ν', { ctr });
    // г) twisting moments
    pr = mk([440, 410]); prism(pr);
    ctr = pr([Lx / 3, Ly / 3, 0]);
    mom3(g, V, pr, Cx, ez, m(ey), r, 'M_{xy}', { ctr, d: 28 });
    mom3(g, V, pr, Cy, ez, m(ex), r, 'M_{yx}', { ctr, d: 28 });
    mom3(g, V, pr, Cn, ez, t3, r, 'M_{νt}', { ctr, d: 28 });
    g.text([14, 284], 'а)', { w: true, a: 'start', size: 15 }); g.text([300, 284], 'б)', { w: true, a: 'start', size: 15 });
    g.text([14, 548], 'в)', { w: true, a: 'start', size: 15 }); g.text([300, 548], 'г)', { w: true, a: 'start', size: 15 });
  } });

// ---------------- rectangular plates: coordinates and supports ----------------
// edge style: 'ss' hinged (line + small support marks), 'cl' clamped (hatch), 'any' arbitrary (dashed)
function rectPlate(g, V, o) {
  const x0 = 90, y0 = 50, Wd = o.W || 300, Hh = o.H || 210;
  const C = { x: x0, y: y0, w: Wd, h: Hh };
  g.poly([[x0, y0], [x0 + Wd, y0], [x0 + Wd, y0 + Hh], [x0, y0 + Hh]], { close: true, fill: 'fs-a', k: null });
  const edge = (a, b, out, style) => {
    if (style === 'cl') g.hatch(a, b, out, { h: 10, step: 10 });
    else if (style === 'ss') {
      g.line(a, b, { k: 'g', sw: 2 });
      const L = V.len(V.sub(b, a)), u = V.unit(V.sub(b, a));
      for (let s = 18; s < L - 8; s += 34) {
        const p = V.add(a, u, s), q = V.add(p, out, 12);
        g.poly([p, V.add(q, u, -6), V.add(q, u, 6)], { close: true, k: 'g', sw: 1.1 });
      }
    } else g.line(a, b, { k: 'g', sw: 1.6, dash: '8 5' });
  };
  const tl = [x0, y0], tr = [x0 + Wd, y0], bl = [x0, y0 + Hh], br = [x0 + Wd, y0 + Hh];
  edge(bl, tl, [-1, 0], o.left); edge(br, tr, [1, 0], o.right); edge(tl, tr, [0, -1], o.top); edge(bl, br, [0, 1], o.bottom);
  // axes: origin given in plate units relative to the rectangle
  const org = [x0 + Wd * o.ox, y0 + Hh * (1 - o.oy)];
  g.arrow(org, [x0 + Wd + 50, org[1]], { k: 'g', sw: 1.3, hs: 9, hw: 3.4 }); g.text([x0 + Wd + 58, org[1]], 'x', { a: 'start' });
  g.arrow(org, [org[0], y0 - 34], { k: 'g', sw: 1.3, hs: 9, hw: 3.4 }); g.text([org[0] + 12, y0 - 34], 'y', { a: 'start' });
  g.dot(org);
  for (const [frac, l] of o.xl || []) g.text([x0 + Wd * frac, y0 + Hh + 30], l, { size: 15 });
  for (const [frac, l] of o.yl || []) g.text([x0 - 26, y0 + Hh * (1 - frac)], l, { size: 15, a: 'end' });
  if (o.note) g.text([x0 + Wd / 2, y0 + Hh / 2], o.note, { w: true, size: 14, k: 'm' });
}
const legend = (g, y) => {
  g.text([20, y], 'шарнир:', { w: true, size: 13, a: 'start', k: 'm' });
  g.line([86, y], [126, y], { k: 'g', sw: 2 }); g.poly([[106, y], [100, y + 12], [112, y + 12]], { close: true, k: 'g', sw: 1.1 });
  g.text([150, y], 'заделка:', { w: true, size: 13, a: 'start', k: 'm' });
  g.hatch([218, y], [262, y], [0, 1], { h: 9, step: 9 });
  g.text([290, y], 'любые условия:', { w: true, size: 13, a: 'start', k: 'm' });
  g.line([398, y], [440, y], { k: 'g', sw: 1.6, dash: '8 5' });
};
TW.addFig('pl-navier', { w: 480, h: 340,
  caption: R`Пластина $a\times b$, все края шарнирно оперты; начало координат в углу. Каждый член $\sin\frac{m\pi x}{a}\sin\frac{n\pi y}{b}$ обращает в ноль прогиб и изгибающий момент на всех четырёх краях.`,
  draw(g, V) { rectPlate(g, V, { left: 'ss', right: 'ss', top: 'ss', bottom: 'ss', ox: 0, oy: 0, xl: [[1, 'a']], yl: [[1, 'b']] }); legend(g, 326); } });
TW.addFig('pl-levy', { w: 480, h: 340,
  caption: R`Схема решения Леви: края $y = 0$ и $y = b$ шарнирные (их условия выполняет $\sin\alpha_iy$), края $x = \pm a/2$ — любые. Начало координат — в середине края $y = 0$, поэтому при симметричной нагрузке функции $f_i(x)$ чётные.`,
  draw(g, V) { rectPlate(g, V, { left: 'any', right: 'any', top: 'ss', bottom: 'ss', ox: 0.5, oy: 0, xl: [[0, '−a/2'], [1, 'a/2']], yl: [[1, 'b']] }); legend(g, 326); } });
TW.addFig('pl-ritz', { w: 480, h: 340,
  caption: R`Заделанная по контуру пластина $a\times b$ (пример Бидермана к методу Ритца); начало координат в углу. Функция $\left(1-\cos\frac{2\pi x}{a}\right)\left(1-\cos\frac{2\pi y}{b}\right)$ обращает в ноль прогиб и наклон на всех краях.`,
  draw(g, V) { rectPlate(g, V, { left: 'cl', right: 'cl', top: 'cl', bottom: 'cl', ox: 0, oy: 0, xl: [[1, 'a']], yl: [[1, 'b']] }); legend(g, 326); } });
TW.addFig('pl-kant', { w: 480, h: 340,
  caption: R`Заделанная пластина $2a\times2b$ с началом координат в центре (пример к методу Канторовича). По $y$ задана функция $(y^2 - b^2)^2$ (заделка краёв $y = \pm b$), по $x$ функция $f(x)$ находится из ОДУ с условиями $f(\pm a) = f'(\pm a) = 0$.`,
  draw(g, V) { rectPlate(g, V, { left: 'cl', right: 'cl', top: 'cl', bottom: 'cl', ox: 0.5, oy: 0.5, xl: [[0, '−a'], [1, 'a']], yl: [[0, '−b'], [1, 'b']] }); legend(g, 326); } });

// ---------------- plate FEM ----------------
TW.addFig('pf-L', { w: 480, h: 330,
  caption: R`L-координаты точки $P$ в треугольнике: $L_i = A_i/A$, где $A_i$ — площадь треугольника, опирающегося на сторону против вершины $i$. В вершине $i$ $L_i = 1$, на противоположной стороне $L_i = 0$; линии $L_1 = \text{const}$ параллельны стороне 2–3.`,
  draw(g, V) {
    const P1 = [90, 270], P2 = [420, 230], P3 = [230, 40];
    const P = V.add(V.add(V.mul(P1, 0.3), P2, 0.33), P3, 0.37);
    g.poly([P, P2, P3], { close: true, fill: 'fs-a', k: null });
    g.poly([P, P3, P1], { close: true, fill: 'fs-q', k: null });
    g.poly([P, P1, P2], { close: true, fill: 'fs-M', k: null });
    for (const L of [1 / 3, 2 / 3]) {
      const a = V.lerp(P2, P1, L), b = V.lerp(P3, P1, L);
      g.line(a, b, { k: 'a', sw: 1, dash: '5 4' });
      g.text(V.add(a, [8, 16]), 'L_1 = ' + (L < 0.5 ? '1/3' : '2/3'), { k: 'a', size: 14 });
    }
    g.text(V.add(V.mid(P2, P3), [20, -4]), 'L_1 = 0', { k: 'a', size: 14, a: 'start' });
    for (const Q of [P1, P2, P3]) g.line(P, Q, { k: 'm', sw: 1 });
    g.poly([P1, P2, P3], { close: true, k: 'g', sw: 2 });
    const cen = (a, b, c) => [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3];
    g.text(cen(P, P2, P3), 'A_1', { k: 'a' }); g.text(cen(P, P3, P1), 'A_2', { k: 'q' }); g.text(cen(P, P1, P2), 'A_3', { k: 'M' });
    g.dot(P, { r: 4 }); g.text(V.add(P, [10, -12]), 'P', { a: 'start' });
    for (const [Q, l, d] of [[P1, '1', [-14, 8]], [P2, '2', [14, 8]], [P3, '3', [0, -16]]]) { g.dot(Q, { r: 4 }); g.text(V.add(Q, d), l); }
    g.text(V.add(P1, [6, 34]), 'L_1 = 1', { k: 'a', size: 14, a: 'start' });
  } });

TW.addFig('pf-elems', { w: 580, h: 270,
  caption: R`Степени свободы треугольных элементов пластины. Морли: прогибы $w$ в вершинах и наклоны $\partial w/\partial n$ по нормали в серединах сторон (6). BCIZ: в каждой вершине $w$, $\theta_x$, $\theta_y$ (9). DKT: те же 9 степеней свободы в вершинах; повороты $\beta_x$, $\beta_y$ квадратичны по 6 точкам, условия Кирхгофа (нулевой сдвиг) ставятся в вершинах и в серединах сторон (квадраты).`,
  draw(g, V) {
    const tri = (o, s) => [V.add(o, [0, 0]), V.add(o, [s, 0]), V.add(o, [s * 0.42, -s * 0.86])];
    const s = 150;
    const rot = (p) => { g.circle(p, 9, { k: 'f', sw: 1.6 }); };
    // Morley
    let T = tri([30, 200], s);
    g.poly(T, { close: true, fill: 'fs-a', k: 'a', sw: 2 });
    for (const p of T) g.dot(p, { r: 5 });
    for (let i = 0; i < 3; i++) {
      const a = T[i], b = T[(i + 1) % 3], mpt = V.mid(a, b), out = V.perp(V.unit(V.sub(b, a)));
      g.arrow(mpt, V.add(mpt, out, 26), { k: 'f', sw: 1.6, hs: 8, hw: 3.2 });
    }
    g.text([30 + s / 2, 236], 'Морли: w, ∂w/∂n', { w: true, size: 14 });
    // BCIZ
    T = tri([215, 200], s);
    g.poly(T, { close: true, fill: 'fs-a', k: 'a', sw: 2 });
    for (const p of T) { rot(p); g.dot(p, { r: 5 }); }
    g.text([215 + s / 2, 236], 'BCIZ: w, θx, θy', { w: true, size: 14 });
    // DKT
    T = tri([400, 200], s);
    g.poly(T, { close: true, fill: 'fs-a', k: 'a', sw: 2 });
    for (const p of T) { rot(p); g.dot(p, { r: 5 }); }
    for (let i = 0; i < 3; i++) { const mpt = V.mid(T[i], T[(i + 1) % 3]); g.poly([[mpt[0] - 5, mpt[1] - 5], [mpt[0] + 5, mpt[1] - 5], [mpt[0] + 5, mpt[1] + 5], [mpt[0] - 5, mpt[1] + 5]], { close: true, fill: 'f-bg', k: 'M', sw: 1.6 }); }
    g.text([400 + s / 2, 236], 'DKT: w, θx, θy', { w: true, size: 14 });
    // legend
    g.dot([40, 260], { r: 5 }); g.text([52, 260], 'w', { a: 'start', size: 14 });
    g.circle([110, 260], 8, { k: 'f', sw: 1.6 }); g.text([124, 260], 'θx, θy', { a: 'start', size: 14 });
    g.arrow([210, 260], [236, 260], { k: 'f', sw: 1.6, hs: 8, hw: 3.2 }); g.text([244, 260], '∂w/∂n', { a: 'start', size: 14 });
    g.poly([[330, 255], [340, 255], [340, 265], [330, 265]], { close: true, fill: 'f-bg', k: 'M', sw: 1.6 }); g.text([348, 260], 'точка условия Кирхгофа', { w: true, a: 'start', size: 13 });
  } });

TW.addFig('md-kin', { w: 540, h: 330,
  caption: R`Кинематика Миндлина в сечении $y = \text{const}$. Наклон изогнутой срединной поверхности $\partial w/\partial x$; нормаль по Кирхгофу (пунктир) повернулась бы на этот же угол. По Миндлину нормаль остаётся прямой, но поворачивается на самостоятельный угол $\theta_x$; разница — угол сдвига $\gamma_{xz} = \partial w/\partial x - \theta_x$. Точка на расстоянии $z$ смещается на $u = -z\theta_x$.`,
  draw(g, V) {
    const y0 = 262, xm = 240, sl = 0.55, w0 = 64, frac = 0.4;
    const Y = x => y0 - w0 - sl * (x - xm) - 0.0004 * (x - xm) ** 2;
    const slope = x => -(sl + 0.0008 * (x - xm));
    g.line([50, y0], [500, y0], { k: 'a', sw: 1.4, dash: '6 4' });
    g.graph(x => Y(x), 70, 440, (x, y) => [x, y], { k: 'a', sw: 3 });
    const M1 = [xm, Y(xm)], tng = V.unit([1, slope(xm)]);
    const kn = V.unit([slope(xm), -1]);
    const th = Math.atan(sl) * frac, mn = [-Math.sin(th), -Math.cos(th)];
    g.line(V.add(M1, kn, -40), V.add(M1, kn, 140), { k: 'g', sw: 1.5, dash: '6 4' });
    g.line(V.add(M1, mn, -40), V.add(M1, mn, 140), { k: 'f', sw: 2.8 });
    g.line(M1, [xm, M1[1] - 150], { k: 'm', sw: 1, dash: '3 3' });
    const aK = V.ang(kn), aM = V.ang(mn);
    g.angle(M1, 122, aM, -PI / 2, 'θ_x', { lr: 140, k: 'f' });
    g.angle(M1, 84, aK, aM, 'γ_{xz}', { lr: 104, t: { size: 15 } });
    g.line(M1, [xm + 120, M1[1]], { k: 'm', sw: 1, dash: '3 3' });
    g.line(M1, V.add(M1, tng, 120), { k: 'm', sw: 1, dash: '3 3' });
    g.angle(M1, 92, V.ang(tng), 0, '∂w/∂x', { lr: 112, t: { size: 15, a: 'start' } });
    g.text(V.add(V.add(M1, kn, -40), [8, 6]), 'по Кирхгофу', { w: true, size: 13, k: 'g', a: 'start' });
    g.text(V.add(V.add(M1, mn, -40), [-8, 6]), 'по Миндлину', { w: true, size: 13, k: 'f', a: 'end' });
    g.dot(M1, { open: true });
    g.arrow([450, 306], [494, 306], { k: 'g', sw: 1.2, hs: 9, hw: 3.4 }); g.text([502, 306], 'x', { a: 'start' });
    g.arrow([34, 316], [34, 272], { k: 'g', sw: 1.2, hs: 9, hw: 3.4 }); g.text([34, 260], 'z');
  } });
})();
