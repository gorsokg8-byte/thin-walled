// Figures for shell derivations. Conventions (as in the text, lec5 p. 85-93, Biderman ch. 3):
// meridional section, axis z points DOWN (screen down), r to the right, s grows from the pole;
// tangent t1 = (cos θ, sin θ), outward normal n = (sin θ, -cos θ) in screen coordinates.
// On a face with outward normal +t1: T1 along +t1, Q along +n, positive M1 pulls the fibre on the +n side along +t1.
(function () {
const R = String.raw;
const deg = d => d * Math.PI / 180;
const T = th => [Math.cos(th), Math.sin(th)];
const Nn = th => [Math.sin(th), -Math.cos(th)];
const scrA = th => th - Math.PI / 2;            // screen angle of n
const S = p => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
const PI = Math.PI;

// positive M1 on a face (side +1: outward normal +t1, side -1: -t1); arc lies outside the element
function faceMoment(g, C, th, side, r) {
  const e = 0.22;
  if (side > 0) g.moment(C, r, scrA(th) - e, scrA(th) + PI + e);
  else g.moment(C, r, scrA(th) + e, scrA(th) - PI - e);
}
// rotation axis drawn dash-dot, arrow down (z), label
function axis(g, x, y0, y1, label) {
  g.line([x, y0], [x, y1 - 6], { k: 'g', sw: 1.1, dash: '14 4 3 4' });
  g.head([x, y1 + 6], [0, 1], { k: 'g', hs: 10, hw: 4 });
  if (label !== false) g.text([x + 10, y1 + 2], label || 'z', { a: 'start' });
}
function frameRZ(g, o, len = 46) {
  g.arrow(o, [o[0] + len, o[1]], { k: 'g', sw: 1.2, hs: 9, hw: 3.6 }); g.text([o[0] + len + 10, o[1]], 'r', { a: 'start' });
  g.arrow(o, [o[0], o[1] + len], { k: 'g', sw: 1.2, hs: 9, hw: 3.6 }); g.text([o[0], o[1] + len + 14], 'z');
}
// a gentle arc of the meridian through C with tangent angle th, from -back to +fwd (px along the arc)
function meridianThrough(g, C, th, back, fwd, o = {}) {
  const Rr = o.R || 380, O = [C[0] - Rr * Math.sin(th), C[1] + Rr * Math.cos(th)];
  g.arc(O, Rr, scrA(th) - back / Rr, scrA(th) + fwd / Rr, Object.assign({ k: 'a', sw: 3 }, o));
  return O;
}

// ---------------- 1. geometry ----------------
TW.addFig('sh-drdz', { w: 460, h: 300,
  caption: R`Малый элемент меридиана $ds$ — гипотенуза прямоугольного треугольника с катетами $dr$ (по радиусу) и $dz$ (по оси). Нормаль $n$ составляет угол $\theta$ с осью $z$, поэтому касательная составляет тот же угол $\theta$ с радиальным направлением.`,
  draw(g, V) {
    const th = deg(36), R1 = 1500, ds = 165, M = [190, 112];
    const O1 = V.add(M, Nn(th), -R1), a0 = scrA(th), da = ds / R1;
    g.arc(O1, R1, a0 - 80 / R1, a0 + da + 60 / R1, { k: 'a', sw: 3 });
    const M1 = V.add(O1, V.dir(a0 + da), R1), K = [M1[0], M[1]];
    frameRZ(g, [34, 36]);
    g.line(M, K, { k: 'g', sw: 1.3 }); g.line(K, M1, { k: 'g', sw: 1.3 });
    g.poly([[K[0] - 10, K[1]], [K[0] - 10, K[1] + 10], [K[0], K[1] + 10]], { k: 'g', sw: 1 });
    g.text([(M[0] + K[0]) / 2 + 10, M[1] - 13], 'dr');
    g.text([K[0] + 13, (K[1] + M1[1]) / 2], 'dz', { a: 'start' });
    g.text(V.add(V.mid(M, M1), [-Math.sin(th), Math.cos(th)], 18), 'ds', { k: 'a' });
    g.angle(M, 48, 0, V.ang(V.sub(M1, M)), 'θ', { lr: 62 });
    g.line(M, V.add(M, [0, -1], 92), { k: 'm', dash: true, sw: 1.1 });
    g.vec(M, Nn(th), 92, { k: 'g', sw: 1.4 }); g.text(V.add(M, Nn(th), 106), 'n');
    g.angle(M, 42, -PI / 2, scrA(th), 'θ', { lr: 56 });
    g.dot(M, { open: true }); g.dot(M1, { open: true });
    g.text(V.add(M, [-18, 14]), 'M'); g.text(V.add(M1, [-20, 14]), 'M_1');
  } });

TW.addFig('sh-R1', { w: 460, h: 360,
  caption: R`Нормали в соседних точках $M$ и $M_1$ пересекаются в центре кривизны меридиана $O_1$ под углом $d\theta$ (угол нормали с осью растёт на $d\theta$). Длина дуги $ds = R_1\,d\theta$, отсюда $1/R_1 = d\theta/ds$.`,
  draw(g, V) {
    const O1 = [92, 335], R1 = 255, th1 = deg(30), th2 = deg(47);
    const pt = th => V.add(O1, Nn(th), R1);
    g.arc(O1, R1, scrA(deg(8)), scrA(deg(66)), { k: 'a', sw: 3 });
    g.arc(O1, R1, scrA(th1), scrA(th2), { k: 'f', sw: 5 });
    const M = pt(th1), M1 = pt(th2);
    g.line(O1, [O1[0], 44], { k: 'm', dash: '14 4 3 4', sw: 1.1 });
    g.text([O1[0] + 8, 52], '∥ z', { a: 'start', k: 'm' });
    for (const th of [th1, th2]) { g.line(O1, pt(th), { k: 'm', sw: 1.1 }); g.vec(pt(th), Nn(th), 44, { k: 'g', sw: 1.3 }); }
    g.text(V.add(M, Nn(th1), 58), 'n'); g.text(V.add(M1, Nn(th2), 58), 'n_1');
    g.angle(O1, 64, -PI / 2, scrA(th1), 'θ', { lr: 78 });
    g.angle(O1, 118, scrA(th1), scrA(th2), 'dθ', { lr: 138 });
    g.text(V.add(O1, V.dir(scrA((th1 + th2) / 2)), R1 + 26), 'ds', { k: 'f' });
    g.dim(O1, M, 24, 'R_1', { side: -1, k: 'f' });
    g.dot(O1); g.text([O1[0] - 6, O1[1] + 14], 'O_1', { a: 'end' });
    g.dot(M, { open: true }); g.dot(M1, { open: true });
    g.text(V.add(M, [-20, 6]), 'M'); g.text(V.add(M1, [20, 16]), 'M_1', { a: 'start' });
  } });

TW.addFig('sh-R2', { w: 500, h: 390,
  caption: R`Второй главный радиус кривизны $R_2 = O_2M$ — отрезок нормали от точки до оси. Нормали вдоль всей параллели образуют конус с вершиной $O_2$ на оси. Из прямоугольного треугольника $r = R_2\sin\theta$.`,
  draw(g, V) {
    const X0 = 250, Yc = 200, a = 185, b = 135, Yb = 330;
    const P = (t, s = 1) => [X0 + s * a * Math.sin(t), Yc - b * Math.cos(t)];
    const pole = P(0), eR = P(PI / 2), eL = P(PI / 2, -1);
    g.path(`M${S(pole)}A${a} ${b} 0 0 1 ${S(eR)}L${S([eR[0], Yb])}`, { k: 'a', sw: 3 });
    g.path(`M${S(pole)}A${a} ${b} 0 0 0 ${S(eL)}L${S([eL[0], Yb])}`, { k: 'a', sw: 3, op: 0.4 });
    axis(g, X0, 28, 362);
    const t0 = deg(50), M = P(t0), Ml = P(t0, -1);
    const th = Math.atan2(Math.sin(t0) / a, Math.cos(t0) / b);
    const r = M[0] - X0, R2 = r / Math.sin(th), O2 = [X0, M[1] + R2 * Math.cos(th)];
    const ry = r * 0.17;
    g.path(`M${S(M)}A${r.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${S(Ml)}`, { k: 'a', sw: 1.5, dash: '5 4' });
    g.path(`M${S(M)}A${r.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${S(Ml)}`, { k: 'a', sw: 1.8 });
    g.line(O2, Ml, { k: 'm', dash: true, sw: 1.1 });
    g.line(O2, M, { k: 'f', sw: 2 });
    g.line([X0, M[1]], M, { k: 'g', sw: 1.3, dash: '6 4' });
    g.text([(X0 + M[0]) / 2, M[1] - 12], 'r');
    g.vec(M, Nn(th), 48, { k: 'g', sw: 1.3 }); g.text(V.add(M, Nn(th), 62), 'n');
    g.angle(O2, 46, -PI / 2, scrA(th), 'θ', { lr: 60 });
    g.dim(O2, M, 20, 'R_2', { k: 'f' });
    g.dot(O2, { k: 'f' }); g.text([X0 - 12, O2[1] + 4], 'O_2', { k: 'f', a: 'end' });
    g.dot(M, { open: true }); g.text(V.add(M, [2, -18]), 'M');
    g.text([X0 - r * 0.62, M[1] + ry + 18], 'параллель', { w: true, size: 14, k: 'a' });
  } });

// ---------------- 2. displacements and strains ----------------
TW.addFig('sh-uw', { w: 580, h: 300,
  caption: R`Одно и то же перемещение точки $M$ в $M'$ раскладывается: а) по касательной к меридиану и нормали — $u$, $w$; б) по осям $r$, $z$ — $\rho$, $\eta$. Ось $z$ направлена вниз, нормаль $n$ — наружу.`,
  draw(g, V) {
    const th = deg(50), t = T(th), nn = Nn(th), u = 122, w = 56;
    const D = V.add(V.mul(t, u), nn, w);
    const panel = (M, local) => {
      meridianThrough(g, M, th, 70, 150);
      const M2 = V.add(M, D);
      if (local) {
        g.line(M, V.add(M, t, 190), { k: 'm', dash: '5 4', sw: 1 }); g.text(V.add(M, t, 204), 't_1', { k: 'm' });
        g.line(M, V.add(M, nn, 110), { k: 'm', dash: '5 4', sw: 1 }); g.text(V.add(M, nn, 124), 'n', { k: 'm' });
        const U = V.add(M, t, u), W = V.add(M, nn, w);
        g.line(U, M2, { k: 'u', dash: '4 3', sw: 1 }); g.line(W, M2, { k: 'u', dash: '4 3', sw: 1 });
        g.arrow(M, U, { k: 'u' }); g.arrow(M, W, { k: 'u' });
        g.text(V.add(V.mid(M, U), nn, -15), 'u', { k: 'u' }); g.text(V.add(V.mid(M, W), t, -14), 'w', { k: 'u' });
        g.line(M, [M[0] + 66, M[1]], { k: 'm', sw: 1, dash: '3 3' }); g.angle(M, 32, 0, th, 'θ', { lr: 44 });
      } else {
        const Rr = [M[0] + D[0], M[1]], Zz = [M[0], M2[1]];
        g.line(Rr, M2, { k: 'u', dash: '4 3', sw: 1 }); g.line(Zz, M2, { k: 'u', dash: '4 3', sw: 1 });
        g.arrow(M, Rr, { k: 'u' }); g.arrow(M, Zz, { k: 'u' });
        g.text([M[0] + D[0] / 2, M[1] - 13], 'ρ', { k: 'u' }); g.text([M[0] - 14, M[1] + D[1] / 2], 'η', { k: 'u' });
        frameRZ(g, [M[0] + 166, 24], 34);
      }
      g.arrow(M, M2, { k: 'g', sw: 2.4 });
      g.dot(M, { open: true }); g.text(V.add(M, [-22, 2]), 'M'); g.text(V.add(M2, [10, 12]), 'M′', { a: 'start' });
    };
    panel([84, 104], true); panel([352, 104], false);
    g.text([14, 290], 'а)', { w: true, a: 'start', size: 15 }); g.text([300, 290], 'б)', { w: true, a: 'start', size: 15 });
  } });

TW.addFig('sh-deform', { w: 480, h: 330,
  caption: R`Элемент меридиана до деформации ($MM_1$: длина $ds$, угол $\theta$) и после ($M^+M_1^+$, пунктир: длина $ds(1+\varepsilon_1)$, угол $\theta+\vartheta$). Концы смещаются на $(\rho,\ \eta)$ и $(\rho + d\rho,\ \eta + d\eta)$. Новый элемент проектируется на оси так же, как старый: $dr + d\rho = ds(1+\varepsilon_1)\cos(\theta+\vartheta)$.`,
  draw(g, V) {
    const th = deg(26), vt = deg(17), ds = 150, e1 = 0.16;
    const M = [60, 58], M1 = V.add(M, T(th), ds);
    const Mp = V.add(M, [70, 112]), M1p = V.add(Mp, T(th + vt), ds * (1 + e1));
    frameRZ(g, [400, 40], 40);
    g.line(M, M1, { k: 'a', sw: 3 });
    g.line(Mp, M1p, { k: 'a', sw: 3, dash: '9 5' });
    // displacement components
    const legs = (A, B, lr, lz) => {
      const K = [B[0], A[1]];
      g.arrow(A, K, { k: 'u', sw: 1.5, hs: 9, hw: 3.6 }); g.arrow(K, B, { k: 'u', sw: 1.5, hs: 9, hw: 3.6 });
      g.text([(A[0] + K[0]) / 2, A[1] - 12], lr, { k: 'u' });
      g.text([K[0] + 10, (K[1] + B[1]) / 2], lz, { k: 'u', a: 'start' });
    };
    legs(M, Mp, 'ρ', 'η'); legs(M1, M1p, 'ρ + dρ', 'η + dη');
    // angles
    g.line(M, [M[0] + 56, M[1]], { k: 'm', sw: 1, dash: '3 3' }); g.angle(M, 34, 0, th, 'θ', { lr: 46 });
    g.line(Mp, V.add(Mp, T(th), 118), { k: 'm', sw: 1, dash: '3 3' });
    g.angle(Mp, 78, th, th + vt, 'ϑ', { lr: 92 });
    g.text(V.add(V.lerp(M, M1, 0.7), Nn(th), 17), 'ds', { k: 'a' });
    g.text(V.add(V.mid(Mp, M1p), Nn(th + vt), -20), 'ds(1 + ε_1)', { k: 'a', a: 'end' });
    for (const p of [M, M1, Mp, M1p]) g.dot(p, { open: true });
    g.text(V.add(M, [-14, 14]), 'M'); g.text(V.add(M1, [6, 18]), 'M_1', { a: 'start' });
    g.text(V.add(Mp, [-18, 10]), 'M^+'); g.text(V.add(M1p, [10, 6]), 'M_1^+', { a: 'start' });
  } });

TW.addFig('sh-parallel', { w: 300, h: 280,
  caption: R`Вид вдоль оси: параллель радиуса $r$ после деформации имеет радиус $r + \rho$. Окружная деформация $\varepsilon_2 = \dfrac{2\pi(r+\rho) - 2\pi r}{2\pi r} = \dfrac{\rho}{r}$; осевое перемещение $\eta$ длину окружности не меняет.`,
  draw(g, V) {
    const O = [150, 140], r = 92, rp = 122;
    g.circle(O, r, { k: 'a', sw: 2.6 }); g.circle(O, rp, { k: 'a', sw: 2, dash: true });
    g.dot(O); g.text([O[0], O[1] + 18], 'ось', { w: true, size: 14 });
    const d = V.dir(deg(-35));
    g.line(O, V.add(O, d, r), { k: 'g', sw: 1.3 }); g.text(V.add(V.add(O, d, r / 2), V.perp(d), -12), 'r');
    g.arrow(V.add(O, d, r), V.add(O, d, rp), { k: 'u', sw: 2, hs: 9, hw: 3.6 });
    g.text(V.add(V.add(O, d, (r + rp) / 2), V.perp(d), -13), 'ρ', { k: 'u' });
    g.text(V.add(O, V.dir(deg(130)), r - 22), '2πr', { k: 'a' });
    g.text(V.add(O, V.dir(deg(130)), rp + 20), '2π(r + ρ)', { k: 'a' });
  } });

TW.addFig('sh-layer', { w: 480, h: 410,
  caption: R`Элемент оболочки толщины $h$ в меридиональном сечении (толщина сильно преувеличена). Нормали сходятся в центре кривизны $O_1$, поэтому слой на расстоянии $\zeta$ от срединной поверхности длиннее: $ds(1 + \zeta/R_1)$. В сечении поперёк меридиана картина та же с радиусом $R_2$ — отсюда множители $(1 + \zeta/R_2)$ в определениях $T_1$, $M_1$, $Q$.`,
  draw(g, V) {
    const O1 = [230, 396], R1 = 250, h = 90, z = 30, half = deg(17);
    const ri = R1 - h / 2, ro = R1 + h / 2, a0 = -PI / 2 - half, a1 = -PI / 2 + half;
    const at = (a, r) => V.add(O1, V.dir(a), r);
    g.path(`M${S(at(a0, ro))}A${ro} ${ro} 0 0 1 ${S(at(a1, ro))}L${S(at(a1, ri))}A${ri} ${ri} 0 0 0 ${S(at(a0, ri))}Z`, { fill: 'fs-a', k: 'a', sw: 1.5 });
    g.arc(O1, R1, a0, a1, { k: 'a', sw: 2.6 });
    g.arc(O1, R1 + z, a0, a1, { k: 'f', sw: 2.2, dash: '7 4' });
    g.line(O1, at(a0, ri), { k: 'm', dash: '5 4', sw: 1 }); g.line(O1, at(a1, ri), { k: 'm', dash: '5 4', sw: 1 });
    g.angle(O1, 56, a0, a1, 'dθ', { lr: 72 });
    g.text(V.add(O1, V.dir(a0 + 0.02), 150), 'R_1', { a: 'end', t: {} });
    g.dot(O1); g.text([O1[0] + 14, O1[1] + 2], 'O_1', { a: 'start' });
    g.text(V.add(at(a1, R1), [12, 8]), 'ds', { a: 'start', k: 'a' });
    g.text(V.add(at(a1, R1 + z), [12, -2]), 'ds(1 + ζ/R_1)', { a: 'start', k: 'f' });
    g.dim(at(a0, R1), at(a0, R1 + z), 22, 'ζ', { side: -1, k: 'f' });
    g.dim(at(a0, ri), at(a0, ro), 50, 'h', { side: -1 });
    g.vec(at(-PI / 2, ro), [0, -1], 40, { k: 'g', sw: 1.4 }); g.text(V.add(at(-PI / 2, ro), [14, -34]), 'n, ζ', { a: 'start' });
  } });

// ---------------- 3. forces: 3D element ----------------
function shellElem3D(g, V, o) {
  const Rm = 230, h = 20, thA = deg(36), thB = deg(60), phA = deg(-11), phB = deg(11), thC = (thA + thB) / 2;
  const Sp = (th, ph, rr = Rm) => [rr * Math.sin(th) * Math.cos(ph), rr * Math.cos(th), rr * Math.sin(th) * Math.sin(ph)];
  const n3 = (th, ph) => [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
  const t3 = (th, ph) => [Math.cos(th) * Math.cos(ph), -Math.sin(th), Math.cos(th) * Math.sin(ph)];
  const e3 = ph => [-Math.sin(ph), 0, Math.cos(ph)];
  const neg = a => [-a[0], -a[1], -a[2]];
  const cam = V.camera(o.az || 34, o.el || 18, o.scale || 2, [0, 0]);
  const c0 = cam(Sp(thC, 0)), shift = V.sub(o.center, c0);
  const pr = p => V.add(cam(p), shift);
  const seq = (a, b, f, N = 16) => { const r = []; for (let i = 0; i <= N; i++) r.push(pr(f(a + (b - a) * i / N))); return r; };
  const ro = Rm + h / 2, ri = Rm - h / 2;
  const bottom = seq(phA, phB, p => Sp(thB, p, ro)).concat(seq(phB, phA, p => Sp(thB, p, ri)));
  const side = seq(thA, thB, t => Sp(t, phB, ro)).concat(seq(thB, thA, t => Sp(t, phB, ri)));
  const outer = seq(thA, thB, t => Sp(t, phA, ro)).concat(seq(phA, phB, p => Sp(thB, p, ro)),
    seq(thB, thA, t => Sp(t, phB, ro)), seq(phB, phA, p => Sp(thA, p, ro)));
  g.poly(bottom, { close: true, fill: 'fs-s', k: 'a', sw: 1.2 });
  g.poly(side, { close: true, fill: 'fs-s', k: 'a', sw: 1.2 });
  g.poly(outer, { close: true, fill: 'fs-a', k: 'a', sw: 1.5 });
  g.poly(seq(phA, phB, p => Sp(thB, p)), { k: 'a', sw: 1, dash: '4 3' });
  g.poly(seq(thA, thB, t => Sp(t, phB)), { k: 'a', sw: 1, dash: '4 3' });
  g.poly(seq(thA, thB, t => Sp(t, 0, ro)), { k: 'a', sw: 0.8, dash: '2 4' });
  g.poly(seq(phA, phB, p => Sp(thC, p, ro)), { k: 'a', sw: 0.8, dash: '2 4' });
  const lab = (p3, d3, L, text, k, extra = 16) => {
    const a = pr(p3), b = pr(V.add3(p3, V.unit3(d3), L));
    g.text(V.add(b, V.unit(V.sub(b, a)), extra), text, { k });
  };
  const force = (p3, d3, L, text, k = 'f') => { g.vec3(pr, p3, d3, L, { k }); lab(p3, d3, L, text, k); };
  const mom = (c3, u3, v3, text) => {
    const r = 17;
    g.arc3(pr, c3, u3, v3, r, -0.25, PI + 0.25, { k: 'M' });
    const m = pr(V.add3(c3, v3, r * 2.1));
    g.text(m, text, { k: 'M' });
  };
  const Ca = Sp(thA, 0), Cb = Sp(thB, 0), Cp = Sp(thC, phB), Cm = Sp(thC, phA);
  const L = o.L || 52;
  if (o.membrane) {
    force(Cb, t3(thB, 0), L, 'T_1'); force(Ca, neg(t3(thA, 0)), L, 'T_1');
    force(Cp, e3(phB), L, 'T_2'); force(Cm, neg(e3(phA)), L, 'T_2');
    for (const [th, ph] of [[deg(44), deg(-6)], [deg(52), deg(6)], [deg(44), deg(8)]]) {
      const p = Sp(th, ph, ro + 2); g.vec3(pr, p, n3(th, ph), 30, { k: 'q', sw: 1.5 });
    }
    lab(Sp(deg(44), deg(-6), ro + 2), n3(deg(44), deg(-6)), 30, 'q_n', 'q', 12);
  } else {
    force(Cb, t3(thB, 0), L, 'T_1'); force(Cb, n3(thB, 0), L * 0.7, 'Q');
    force(Ca, neg(t3(thA, 0)), L, 'T_1'); force(Ca, neg(n3(thA, 0)), L * 0.7, 'Q');
    force(Cp, e3(phB), L, 'T_2'); force(Cm, neg(e3(phA)), L, 'T_2');
    mom(Cb, n3(thB, 0), t3(thB, 0), 'M_1'); mom(Ca, n3(thA, 0), neg(t3(thA, 0)), 'M_1');
    mom(Cp, n3(thC, phB), e3(phB), 'M_2'); mom(Cm, n3(thC, phA), neg(e3(phA)), 'M_2');
  }
  // local axes legend
  const lg = o.legend;
  if (lg) {
    const c = Sp(thC, 0, 0.001);
    const base = lg;
    const dirs = [[t3(thC, 0), 't_1'], [e3(0), 't_2'], [n3(thC, 0), 'n']];
    for (const [d, s] of dirs) {
      const a = V.sub(pr(V.add3(c, d, 1)), pr(c)), u = V.unit(a);
      g.arrow(base, V.add(base, u, 34), { k: 'g', sw: 1.2, hs: 8, hw: 3.2 });
      g.text(V.add(base, u, 46), s, { size: 15 });
    }
  }
}
TW.addFig('sh-elem3d', { w: 520, h: 400,
  caption: R`Элемент оболочки, вырезанный двумя сечениями, нормальными к меридиану, и двумя меридиональными сечениями. Все усилия показаны в положительных направлениях: $T_1$, $Q$, $M_1$ — в сечениях, нормальных к меридиану; $T_2$, $M_2$ — в меридиональных сечениях (поперечной силы там нет — это плоскость симметрии). Положительные $M_1$, $M_2$ растягивают наружные волокна. Видимые грани заштрихованы, пунктир на них — срединная поверхность.`,
  draw(g, V) { shellElem3D(g, V, { center: [262, 205], legend: [70, 340], scale: 2.1 }); } });

TW.addFig('sh-laplace', { w: 520, h: 400,
  caption: R`Безмоментное состояние: на гранях элемента только $T_1$ и $T_2$. Искривлённые грани дают равнодействующие по нормали $-T_1/R_1$ и $-T_2/R_2$ (на единицу площади), их уравновешивает нагрузка $q_n$ — как натяжение мыльной плёнки уравновешивает давление.`,
  draw(g, V) { shellElem3D(g, V, { center: [262, 196], membrane: true, L: 46, scale: 2.1 }); } });

// ---------------- 4. equilibrium ----------------
TW.addFig('sh-eq-mer', { w: 540, h: 450,
  caption: R`Элемент в меридиональной плоскости. Силы и моменты на гранях отнесены к единице угла $d\varphi$ (на рисунке опущен множитель $d\varphi$): на верхней грани $rT_1$, $rQ$, $rM_1$, на нижней — они же с приращениями. Нагрузки $q_n$, $q_1$ действуют на площадь $r\,d\varphi\,ds$. Грани повёрнуты одна относительно другой на $d\theta = ds/R_1$, поэтому $T_1$ даёт проекцию на нормаль, а $Q$ — на касательную.`,
  draw(g, V) {
    const O1 = [96, 426], R1 = 285, h = 34, th1 = deg(30), th2 = deg(52), thc = (th1 + th2) / 2;
    const at = (th, r) => V.add(O1, Nn(th), r);
    const Ro = R1 + h / 2, Ri = R1 - h / 2;
    g.line(O1, [O1[0], 104], { k: 'm', dash: '14 4 3 4', sw: 1.1 }); g.text([O1[0] + 8, 112], '∥ z', { a: 'start', k: 'm' });
    g.line(O1, at(th1, Ri), { k: 'm', dash: '5 4', sw: 1 }); g.line(O1, at(th2, Ri), { k: 'm', dash: '5 4', sw: 1 });
    g.angle(O1, 52, -PI / 2, scrA(th1), 'θ', { lr: 66 });
    g.angle(O1, 92, scrA(th1), scrA(th2), 'dθ', { lr: 110 });
    g.dot(O1); g.text([O1[0] - 6, O1[1] + 12], 'O_1', { a: 'end' });
    g.path(`M${S(at(th1, Ro))}A${Ro} ${Ro} 0 0 1 ${S(at(th2, Ro))}L${S(at(th2, Ri))}A${Ri} ${Ri} 0 0 0 ${S(at(th1, Ri))}Z`, { fill: 'fs-a', k: 'a', sw: 1.5 });
    g.arc(O1, R1, scrA(th1), scrA(th2), { k: 'a', sw: 1.2, dash: '4 3' });
    const C1 = at(th1, R1), C2 = at(th2, R1);
    // upper face (outward normal -t1)
    g.vec(C1, V.neg(T(th1)), 82, { k: 'f' }); g.text(V.add(C1, V.neg(T(th1)), 100), 'rT_1', { k: 'f' });
    g.vec(C1, V.neg(Nn(th1)), 56, { k: 'f' }); g.text(V.add(C1, V.neg(Nn(th1)), 72), 'rQ', { k: 'f' });
    faceMoment(g, C1, th1, -1, 20); g.text(V.add(C1, [-4, -38]), 'rM_1', { k: 'M', a: 'end' });
    // lower face (outward normal +t1)
    g.vec(C2, T(th2), 82, { k: 'f' }); g.text(V.add(V.add(C2, T(th2), 92), [6, 6]), 'rT_1 + d(rT_1)', { k: 'f', a: 'start' });
    g.vec(C2, Nn(th2), 56, { k: 'f' }); g.text(V.add(V.add(C2, Nn(th2), 64), [8, 0]), 'rQ + d(rQ)', { k: 'f', a: 'start' });
    faceMoment(g, C2, th2, 1, 20); g.text(V.add(C2, [-16, 44]), 'rM_1 + d(rM_1)', { k: 'M', a: 'end' });
    // loads at the middle of the element
    const Pq = at(thc + deg(4), Ro + 2);
    g.vec(Pq, Nn(thc + deg(4)), 46, { k: 'q' }); g.text(V.add(Pq, Nn(thc + deg(4)), 60), 'q_n', { k: 'q' });
    const Pt = at(thc - deg(8), Ro + 26);
    g.vec(Pt, T(thc - deg(6)), 40, { k: 'q' }); g.text(V.add(Pt, Nn(thc - deg(8)), 16), 'q_1', { k: 'q' });
  } });

TW.addFig('sh-eq-plan', { w: 600, h: 300,
  caption: R`а) Вид вдоль оси: силы $T_2\,ds$ на меридиональных гранях повёрнуты одна относительно другой на угол $d\varphi$; их равнодействующая $T_2\,ds\,d\varphi$ направлена к оси. б) В меридиональной плоскости она раскладывается на составляющую по нормали $T_2\,ds\,d\varphi\sin\theta$ (входит в (2.15)) и по касательной $T_2\,ds\,d\varphi\cos\theta$ (входит в (2.16)).`,
  draw(g, V) {
    const O = [36, 150], ri = 186, ro = 240, hf = deg(13);
    const at = (a, r) => V.add(O, V.dir(a), r);
    g.path(`M${S(at(-hf, ro))}A${ro} ${ro} 0 0 1 ${S(at(hf, ro))}L${S(at(hf, ri))}A${ri} ${ri} 0 0 0 ${S(at(-hf, ri))}Z`, { fill: 'fs-a', k: 'a', sw: 1.5 });
    g.line(O, at(-hf, ri), { k: 'm', dash: '5 4', sw: 1 }); g.line(O, at(hf, ri), { k: 'm', dash: '5 4', sw: 1 });
    g.dot(O); g.text([O[0] + 2, O[1] + 20], 'ось', { w: true, size: 14 });
    g.angle(O, 64, -hf, hf, 'dφ', { lr: 82 });
    for (const s of [-1, 1]) {
      const a = s * hf, C = at(a, (ri + ro) / 2), d = V.mul(V.perp(V.dir(a)), s);
      g.vec(C, d, 60, { k: 'f' }); g.text(V.add(C, d, 76), 'T_2 ds', { k: 'f' });
    }
    g.arrow(at(0, ri - 4), at(0, ri - 76), { k: 'f', sw: 2.4 });
    g.text(V.add(at(0, ri - 40), [0, 18]), 'T_2 ds dφ', { k: 'f' });
    // б) meridional plane
    const th = deg(40), M = [492, 118], F = 110;
    meridianThrough(g, M, th, 60, 90, { R: 300 });
    g.vec(M, Nn(th), 42, { k: 'm', sw: 1.2 }); g.text(V.add(M, Nn(th), 54), 'n', { k: 'm' });
    g.text(V.add(M, T(th), 98), 't_1', { k: 'm' });
    const Fv = [-F, 0], Fn = V.mul(V.neg(Nn(th)), F * Math.sin(th)), Ft = V.mul(V.neg(T(th)), F * Math.cos(th));
    g.line(V.add(M, Fn), V.add(M, Fv), { k: 'f', dash: '4 3', sw: 1 }); g.line(V.add(M, Ft), V.add(M, Fv), { k: 'f', dash: '4 3', sw: 1 });
    g.arrow(M, V.add(M, Fv), { k: 'f', sw: 2.4 }); g.text(V.add(M, [-F - 8, 0]), 'T_2 ds dφ', { k: 'f', a: 'end' });
    g.arrow(M, V.add(M, Fn), { k: 'f', sw: 1.6 }); g.text(V.add(V.add(M, Fn), [-6, 16]), 'T_2 ds dφ sin θ', { k: 'f', a: 'end' });
    g.arrow(M, V.add(M, Ft), { k: 'f', sw: 1.6 }); g.text(V.add(V.add(M, Ft), [-6, -12]), 'T_2 ds dφ cos θ', { k: 'f', a: 'end' });
    g.angle(M, 30, PI, PI + th, 'θ', { lr: 42 });
    g.dot(M, { open: true });
    g.text([14, 288], 'а)', { w: true, a: 'start', size: 15 }); g.text([330, 288], 'б)', { w: true, a: 'start', size: 15 });
  } });

TW.addFig('sh-eq-m2', { w: 560, h: 300,
  caption: R`Вид вдоль оси на моменты $M_2\,ds$ меридиональных граней. Векторы моментов направлены по касательным к меридиану этих граней; в плане видны их проекции длиной $M_2\,ds\cos\theta$, повёрнутые на угол $d\varphi$ (вертикальные части $M_2\,ds\sin\theta$ взаимно уничтожаются). Сумма $M_2\,ds\cos\theta\,d\varphi$ направлена по касательной $t$ к параллели — отсюда слагаемое $-M_2\cos\theta$ в (2.17). У Бидермана то же записано через угол $d\psi = d\varphi\cos\theta$ между векторами.`,
  draw(g, V) {
    const O = [34, 150], ri = 180, ro = 250, hf = deg(13), rc = 215, L = 74;
    const at = (a, r) => V.add(O, V.dir(a), r);
    g.path(`M${S(at(-hf, ro))}A${ro} ${ro} 0 0 1 ${S(at(hf, ro))}L${S(at(hf, ri))}A${ri} ${ri} 0 0 0 ${S(at(-hf, ri))}Z`, { fill: 'fs-a', k: 'a', sw: 1.5 });
    g.line(O, at(-hf, ri), { k: 'm', dash: '5 4', sw: 1 }); g.line(O, at(hf, ri), { k: 'm', dash: '5 4', sw: 1 });
    g.dot(O); g.text([O[0] + 2, O[1] + 20], 'ось', { w: true, size: 14 });
    g.angle(O, 64, -hf, hf, 'dφ', { lr: 82 });
    g.arrow(at(hf, rc - L / 2), at(hf, rc + L / 2), { k: 'M', dbl: true });
    g.arrow(at(-hf, rc + L / 2), at(-hf, rc - L / 2), { k: 'M', dbl: true });
    g.text(V.add(at(hf, rc + L / 2), [6, 18]), 'M_2 ds cos θ', { k: 'M', a: 'start' });
    g.text(V.add(at(-hf, rc + L / 2), [0, -16]), 'M_2 ds cos θ', { k: 'M', a: 'start' });
    // vector sum, head to tail
    const B = [420, 104], v2 = V.mul(V.dir(-hf), -L), v1 = V.mul(V.dir(hf), L);
    const B1 = V.add(B, v2), B2 = V.add(B1, v1);
    g.arrow(B, B1, { k: 'M', sw: 1.4, hs: 9, hw: 3.4 }); g.arrow(B1, B2, { k: 'M', sw: 1.4, hs: 9, hw: 3.4 });
    g.arrow(B, B2, { k: 'M', sw: 2.4, dbl: true, hs: 9, hw: 3.6 });
    g.text(V.add(V.mid(B, B2), [14, 0]), 'M_2 ds cos θ dφ', { k: 'M', a: 'start', size: 15 });
    g.text(V.add(B2, [0, 22]), '∥ t (касательная к параллели)', { w: true, size: 13, k: 'm' });
  } });

TW.addFig('sh-cut', { w: 520, h: 350,
  caption: R`Часть оболочки, отсечённая параллелью $s$. По всей параллели (длина $2\pi r$) действуют $T_1$ и $Q$ — на рисунке в положительных направлениях; их проекция на ось $z$ равна $T_1\sin\theta - Q\cos\theta$. Внешние силы на отсечённой части (здесь внутреннее давление $q_n$) дают осевую равнодействующую $F(s)$; при $F > 0$ она направлена против оси $z$, и её уравновешивают растягивающие $T_1$.`,
  draw(g, V) {
    const X0 = 260, Yc = 222, a = 190, b = 150;
    const P = (t, s = 1) => [X0 + s * a * Math.sin(t), Yc - b * Math.cos(t)];
    const nE = (t, s = 1) => V.unit([s * Math.sin(t) / a, -Math.cos(t) / b]);
    const t0 = deg(52), Mr = P(t0), Ml = P(t0, -1);
    const th = Math.atan2(Math.sin(t0) / a, Math.cos(t0) / b);
    for (const s of [1, -1]) g.path(`M${S(P(t0, s))}A${a} ${b} 0 0 ${s > 0 ? 1 : 0} ${S(P(PI / 2, s))}L${S([X0 + s * a, 336])}`, { k: 'a', sw: 2, dash: '6 5', op: 0.45 });
    g.path(`M${S(Ml)}A${a} ${b} 0 0 1 ${S(Mr)}`, { k: 'a', sw: 3 });
    axis(g, X0, 30, 330);
    g.line(Ml, Mr, { k: 'm', dash: '3 4', sw: 1 });
    for (const [tt, s] of [[deg(14), 1], [deg(32), 1], [deg(46), 1], [deg(14), -1], [deg(32), -1], [deg(46), -1]]) {
      const p = P(tt, s), d = nE(tt, s);
      g.arrow(V.add(p, d, -30), V.add(p, d, -3), { k: 'q', sw: 1.4, hs: 8, hw: 3.2 });
    }
    g.text(V.add(P(deg(32), -1), nE(deg(32), -1), -44), 'q_n', { k: 'q' });
    g.arrow([X0, 176], [X0, 108], { k: 'q', sw: 3 }); g.text([X0 + 12, 150], 'F', { k: 'q', a: 'start', bold: true });
    for (const s of [1, -1]) {
      const C = s > 0 ? Mr : Ml, t = [s * Math.cos(th), Math.sin(th)], nn = [s * Math.sin(th), -Math.cos(th)];
      g.vec(C, t, 80, { k: 'f' }); g.text(V.add(C, t, 96), 'T_1', { k: 'f' });
      g.vec(C, nn, 50, { k: 'f' }); g.text(V.add(C, nn, 64), 'Q', { k: 'f' });
      g.dot(C, { open: true });
    }
    g.line(Mr, V.add(Mr, [0, -1], 66), { k: 'm', dash: '3 3', sw: 1 });
    g.angle(Mr, 34, -PI / 2, scrA(th), 'θ', { lr: 46 });
    g.text([(X0 + Mr[0]) / 2 + 20, Mr[1] + 16], 'r');
    g.text(V.add(P(deg(24)), nE(deg(24)), 16), 's', { k: 'a' });
  } });

TW.addFig('sh-NZ', { w: 440, h: 290,
  caption: R`Сила в сечении, нормальном к меридиану (грань с внешней нормалью $t_1$), в двух базисах: $T_1$, $Q$ — по касательной и нормали, $N$, $Z$ — по осям $r$, $z$. Это тот же поворот на угол $\theta$, что и для перемещений (2.1): $N = T_1\cos\theta + Q\sin\theta$, $Z = T_1\sin\theta - Q\cos\theta$.`,
  draw(g, V) {
    const th = deg(40), C = [150, 124], t = T(th), nn = Nn(th);
    meridianThrough(g, C, th, 130, 0, { R: 320 });
    g.line(V.add(C, nn, -20), V.add(C, nn, 20), { k: 'g', sw: 1.6 });
    const A = V.add(C, t, 140), B = V.add(C, nn, 58), Sx = V.add(A, nn, 58);
    const Nt = [Sx[0], C[1]], Zt = [C[0], Sx[1]];
    g.line(A, Sx, { k: 'f', dash: '4 3', sw: 1 }); g.line(B, Sx, { k: 'f', dash: '4 3', sw: 1 });
    g.line(Nt, Sx, { k: 'u', dash: '4 3', sw: 1 }); g.line(Zt, Sx, { k: 'u', dash: '4 3', sw: 1 });
    g.arrow(C, Sx, { k: 'g', sw: 1.3, dash: '7 4' });
    g.arrow(C, A, { k: 'f' }); g.arrow(C, B, { k: 'f' });
    g.arrow(C, Nt, { k: 'u' }); g.arrow(C, Zt, { k: 'u' });
    g.text(V.add(A, [-8, 18]), 'T_1', { k: 'f' }); g.text(V.add(B, [-12, -10]), 'Q', { k: 'f' });
    g.text(V.add(Nt, [12, 0]), 'N', { k: 'u', a: 'start' }); g.text(V.add(Zt, [-14, 6]), 'Z', { k: 'u' });
    g.angle(C, 54, 0, th, 'θ', { lr: 68 });
    g.dot(C, { open: true });
    frameRZ(g, [340, 210], 40);
  } });

TW.addFig('sh-state', { w: 580, h: 300,
  caption: R`Положительные направления величин вектора состояния. а) Перемещения точки меридиана: $\rho$ — по $r$, $\eta$ — по $z$ (вниз), $\vartheta$ — поворот нормали в сторону роста $s$. б) Силы в сечении $s$: на торце верхней части (внешняя нормаль $t_1$) $N$, $Z$, $M_1$ направлены, как показано; на торце нижней части — противоположно. В векторе состояния стоят $rN$, $rZ$, $rM_1$.`,
  draw(g, V) {
    const th = deg(40);
    // а)
    const C = [120, 118];
    meridianThrough(g, C, th, 110, 110, { R: 320 });
    g.line(C, V.add(C, Nn(th), 86), { k: 'm', dash: '5 4', sw: 1.1 }); g.text(V.add(C, Nn(th), 100), 'n', { k: 'm' });
    g.vec(C, Nn(th + deg(20)), 86, { k: 'g', sw: 1.4 }); g.text(V.add(C, Nn(th + deg(20)), 100), 'n^+');
    g.moment(C, 62, scrA(th), scrA(th + deg(20)), { k: 'u', hs: 9, hw: 3.4 }); g.text(V.add(C, V.dir(scrA(th + deg(10))), 76), 'ϑ', { k: 'u' });
    g.arrow(C, [C[0] + 66, C[1]], { k: 'u' }); g.text([C[0] + 76, C[1] + 2], 'ρ', { k: 'u', a: 'start' });
    g.arrow(C, [C[0], C[1] + 60], { k: 'u' }); g.text([C[0] - 12, C[1] + 54], 'η', { k: 'u', a: 'end' });
    g.dot(C, { open: true });
    // б)
    const Cu = [390, 100], Cl = V.add(Cu, T(th), 110);
    meridianThrough(g, Cu, th, 120, 0, { R: 320 });
    meridianThrough(g, Cl, th, 0, 110, { R: 320 });
    for (const P0 of [Cu, Cl]) g.line(V.add(P0, Nn(th), -16), V.add(P0, Nn(th), 16), { k: 'g', sw: 1.5 });
    g.arrow(Cu, [Cu[0] + 66, Cu[1]], { k: 'f' }); g.text([Cu[0] + 76, Cu[1]], 'N', { k: 'f', a: 'start' });
    g.arrow(Cu, [Cu[0], Cu[1] + 56], { k: 'f' }); g.text([Cu[0] - 12, Cu[1] + 52], 'Z', { k: 'f', a: 'end' });
    faceMoment(g, Cu, th, 1, 18); g.text(V.add(Cu, [-30, -24]), 'M_1', { k: 'M' });
    g.arrow(Cl, [Cl[0] - 66, Cl[1]], { k: 'f' }); g.text([Cl[0] - 76, Cl[1]], 'N', { k: 'f', a: 'end' });
    g.arrow(Cl, [Cl[0], Cl[1] - 56], { k: 'f' }); g.text([Cl[0] + 12, Cl[1] - 52], 'Z', { k: 'f', a: 'start' });
    faceMoment(g, Cl, th, -1, 18); g.text(V.add(Cl, [30, 28]), 'M_1', { k: 'M' });
    g.text([14, 288], 'а)', { w: true, a: 'start', size: 15 }); g.text([290, 288], 'б)', { w: true, a: 'start', size: 15 });
    frameRZ(g, [270, 30], 36);
  } });

TW.addFig('sh-cyl', { w: 580, h: 280,
  caption: R`а) Отсекаем днище с частью цилиндра: давление на днище даёт вдоль оси силу $p\pi R^2$ (давление × площадь проекции на плоскость, перпендикулярную оси); её уравновешивают усилия $T_1$ на окружности $2\pi R$: $T_1 = pR/2$. б) Отсекаем половину кольца длины $L$ плоскостью через ось: давление даёт $p\cdot 2R\cdot L$, его уравновешивают два усилия $T_2L$: $T_2 = pR$.`,
  draw(g, V) {
    const yA = 130, Rr = 70, xh = 108, xc = 228;
    g.line([16, yA], [300, yA], { k: 'm', dash: '14 4 3 4', sw: 1 });
    g.path(`M${xh} ${yA - Rr}A${Rr} ${Rr} 0 0 0 ${xh} ${yA + Rr}`, { k: 'a', sw: 3 });
    g.line([xh, yA - Rr], [xc, yA - Rr], { k: 'a', sw: 3 }); g.line([xh, yA + Rr], [xc, yA + Rr], { k: 'a', sw: 3 });
    g.line([xc, yA - Rr - 12], [xc, yA + Rr + 12], { k: 'm', dash: '3 4', sw: 1 });
    for (const a of [135, 160, 200, 225]) {
      const d = V.dir(deg(a)), p = V.add([xh, yA], d, Rr);
      g.arrow(V.add(p, d, -26), V.add(p, d, -3), { k: 'q', sw: 1.3, hs: 8, hw: 3 });
    }
    g.arrow([xh + 46, yA], [xh - 30, yA], { k: 'q', sw: 3 }); g.text([xh + 10, yA - 14], 'pπR^2', { k: 'q' });
    for (const y of [yA - Rr, yA + Rr]) { g.arrow([xc, y], [xc + 56, y], { k: 'f' }); g.text([xc + 66, y], 'T_1', { k: 'f', a: 'start' }); }
    g.dim([xc - 30, yA + Rr], [xc - 30, yA - Rr], 0, '', {});
    g.text([xc - 18, yA - 22], '2R', { a: 'start' });
    // б)
    const C = [450, 168], Rb = 84;
    g.path(`M${C[0] - Rb} ${C[1]}A${Rb} ${Rb} 0 0 1 ${C[0] + Rb} ${C[1]}`, { k: 'a', sw: 3 });
    for (const a of [-30, -60, -90, -120, -150]) {
      const d = V.dir(deg(a)), p = V.add(C, d, Rb);
      g.arrow(V.add(p, d, -30), V.add(p, d, -3), { k: 'q', sw: 1.3, hs: 8, hw: 3 });
    }
    g.text(V.add(C, V.dir(deg(-60)), Rb - 46), 'p', { k: 'q' });
    for (const s of [-1, 1]) { g.arrow([C[0] + s * Rb, C[1]], [C[0] + s * Rb, C[1] + 56], { k: 'f' }); g.text([C[0] + s * (Rb + 12), C[1] + 44], 'T_2', { k: 'f', a: s > 0 ? 'start' : 'end' }); }
    g.line([C[0] - Rb, C[1]], [C[0] + Rb, C[1]], { k: 'm', dash: '3 4', sw: 1 });
    g.text([C[0], C[1] + 16], '2R');
    g.text([14, 268], 'а)', { w: true, a: 'start', size: 15 }); g.text([340, 268], 'б)', { w: true, a: 'start', size: 15 });
  } });

// ---------------- 5. edge effect ----------------
TW.addFig('ee-strip', { w: 580, h: 320,
  caption: R`а) Элемент стенки цилиндра длины $ds$ (полоса единичной ширины по окружности): поперечные силы $Q$, моменты $M_1$, нагрузка $q_n$ и равнодействующая окружных усилий $T_2/R$ (на единицу площади, к оси). Так как $T_2 = \mu T_1 + Eh\,w/R$, эта сила пропорциональна прогибу — работает как упругое основание. б) Аналогия: балка жёсткостью $D$ на основании с коэффициентом постели $k = Eh/R^2$.`,
  draw(g, V) {
    axis(g, 40, 24, 290, 'z');
    const xa = 190, xb = 222, xm = 206, y0 = 100, y1 = 206;
    g.line([xm, 30], [xm, y0], { k: 'a', sw: 2, dash: '6 5', op: 0.5 }); g.line([xm, y1], [xm, 290], { k: 'a', sw: 2, dash: '6 5', op: 0.5 });
    g.poly([[xa, y0], [xb, y0], [xb, y1], [xa, y1]], { close: true, fill: 'fs-a', k: 'a', sw: 1.5 });
    const th = PI / 2;
    g.vec([xm, y0], [-1, 0], 56, { k: 'f' }); g.text([xm - 66, y0 - 2], 'Q', { k: 'f', a: 'end' });
    faceMoment(g, [xm, y0], th, -1, 17); g.text([xm + 30, y0 - 26], 'M_1', { k: 'M', a: 'start' });
    g.vec([xm, y1], [1, 0], 56, { k: 'f' }); g.text([xm + 66, y1 + 2], 'Q + dQ', { k: 'f', a: 'start' });
    faceMoment(g, [xm, y1], th, 1, 17); g.text([xm - 30, y1 + 30], 'M_1 + dM_1', { k: 'M', a: 'end' });
    for (const y of [124, 153, 182]) g.arrow([xa - 44, y], [xa - 2, y], { k: 'q', sw: 1.4, hs: 8, hw: 3.2 });
    g.text([xa - 54, 153], 'q_n', { k: 'q', a: 'end' });
    g.arrow([xb + 58, 153], [xb + 3, 153], { k: 'f', sw: 2.2 }); g.text([xb + 66, 153], 'T_2/R', { k: 'f', a: 'start' });
    // б)
    const bx0 = 360, bx1 = 556, by = 150, bh = 14;
    g.poly([[bx0, by], [bx1, by], [bx1, by + bh], [bx0, by + bh]], { close: true, fill: 'fs-a', k: 'a', sw: 1.5 });
    for (let x = bx0 + 14; x < bx1; x += 30) g.spring([x, by + bh], [x, 226], { m: 5, wd: 5 });
    g.hatch([bx0 - 6, 226], [bx1 + 6, 226], [0, 1]);
    for (let x = bx0 + 20; x < bx1; x += 34) g.arrow([x, by - 40], [x, by - 3], { k: 'q', sw: 1.3, hs: 8, hw: 3 });
    g.text([bx0 + 2, by - 52], 'q', { k: 'q', a: 'start' });
    g.text([bx1 - 2, by - 52], 'D', { a: 'end' });
    g.text([(bx0 + bx1) / 2, 254], 'k = Eh/R^2', {});
    g.text([14, 308], 'а)', { w: true, a: 'start', size: 15 }); g.text([340, 308], 'б)', { w: true, a: 'start', size: 15 });
  } });

TW.addFig('ee-edge', { w: 580, h: 370,
  caption: R`Длинный цилиндр, нагруженный по краю $s = 0$: а) моментом $m_0$, б) силой $N_0$ (положительные направления). Пунктир — прогиб в масштабе: а) $w = -\dfrac{m_0}{2D\beta^2}f_2(\beta s)$, б) $w = -\dfrac{N_0}{2D\beta^3}f_3(\beta s)$; при положительных нагрузках край уходит к оси. Возмущение затухает: при $\beta s = \pi$ амплитуда $e^{-\pi}\approx 4\%$ от краевой.`,
  draw(g, V) {
    const f2 = x => Math.exp(-x) * (Math.cos(x) - Math.sin(x)), f3 = x => Math.exp(-x) * Math.cos(x);
    const panel = (x0, f, load) => {
      const ax = x0 + 26, xw = x0 + 150, y0 = 64, y1 = 340, k = (y1 - y0) / (2 * PI), A = -46;
      axis(g, ax, 24, 346, 'z');
      g.line([xw, y0], [xw, y1], { k: 'a', sw: 3 });
      g.graph(f, 0, 2 * PI, (x, y) => [xw + A * y, y0 + k * x], { k: 'a', sw: 2, dash: '7 4' });
      for (const [x, l] of [[PI / 4, 'βs = π/4'], [PI, 'βs = π']]) {
        g.line([xw + 6, y0 + k * x], [xw + 22, y0 + k * x], { k: 'm', sw: 1 });
        g.text([xw + 28, y0 + k * x], l, { a: 'start', size: 14, k: 'm' });
      }
      g.arrow([xw + 34, y0 + 150], [xw + 34, y0 + 196], { k: 'g', sw: 1.2, hs: 8, hw: 3.2 }); g.text([xw + 44, y0 + 176], 's', { a: 'start' });
      g.text([xw + A - 6, y0 + 26], 'w(0)', { k: 'a', a: 'end', size: 15 });
      if (load === 'm') { faceMoment(g, [xw, y0], PI / 2, -1, 20); g.text([xw + 34, y0 - 28], 'm_0', { k: 'M', a: 'start' }); }
      else { g.vec([xw, y0], [-1, 0], 62, { k: 'f' }); g.text([xw - 72, y0 - 2], 'N_0', { k: 'f', a: 'end' }); }
      g.dot([xw, y0], { open: true });
    };
    panel(0, f2, 'm'); panel(290, f3, 'N');
    g.text([300, 26], 'б)', { w: true, a: 'start', size: 15 }); g.text([10, 26], 'а)', { w: true, a: 'start', size: 15 });
  } });

TW.addFig('ee-shell', { w: 460, h: 340,
  caption: R`Край оболочки вращения $s = 0$ с углом $\theta_0$ между нормалью и осью; краевые нагрузки в положительных направлениях: распорная (радиальная) сила $N_0$ и момент $m_0$. Для такого края $-\vartheta(0) = \delta_{11}m_0 + \delta_{12}N_0$, $-\rho(0) = \delta_{21}m_0 + \delta_{22}N_0$.`,
  draw(g, V) {
    const X0 = 56, Oc = [X0, 316], Rs = 236, th0 = deg(48);
    const at = th => V.add(Oc, Nn(th), Rs);
    axis(g, X0, 24, 326);
    g.arc(Oc, Rs, scrA(deg(10)), scrA(th0), { k: 'a', sw: 2, dash: '6 5', op: 0.45 });
    g.arc(Oc, Rs, scrA(th0), scrA(deg(96)), { k: 'a', sw: 3 });
    const E = at(th0);
    g.line(Oc, E, { k: 'm', dash: '5 4', sw: 1 });
    g.angle(Oc, 50, -PI / 2, scrA(th0), 'θ_0', { lr: 68 });
    g.vec(E, Nn(th0), 44, { k: 'g', sw: 1.3 }); g.text(V.add(E, Nn(th0), 58), 'n');
    g.vec(E, [-1, 0], 70, { k: 'f' }); g.text([E[0] - 80, E[1] - 2], 'N_0', { k: 'f', a: 'end' });
    faceMoment(g, E, th0, -1, 20); g.text(V.add(E, [-30, -30]), 'm_0', { k: 'M', a: 'end' });
    g.dot(E, { open: true }); g.text(V.add(E, [18, 10]), 's = 0', { a: 'start' });
    const s1 = at(deg(66)); g.vec(V.add(s1, Nn(deg(66)), 16), T(deg(66)), 40, { k: 'g', sw: 1.2, hs: 8, hw: 3.2 });
    g.text(V.add(V.add(s1, Nn(deg(66)), 30), T(deg(66)), 24), 's');
    g.dot(Oc);
  } });

// ---------------- 6. junctions ----------------
TW.addFig('jn-node', { w: 520, h: 430,
  caption: R`Стык двух частей со шпангоутом, узел «разнесён». Для части A стык — конечный край (внешняя нормаль торца $t_1$), для части B — начальный. Общий момент $m$ и распорные силы $N_A$, $N_B$ показаны в положительных направлениях; на шпангоут действуют $-N_A$ (от A), $+N_B$ (от B) и внешняя радиальная нагрузка $P_r$. Осевые силы $Z$ проходят через узел и не показаны. Условия совместности: у A и B одинаковы $\rho$ и $\vartheta$.`,
  draw(g, V) {
    const X0 = 60, Rr = 150, yA = 168, yRing = 222, yB = 280;
    axis(g, X0, 16, 410);
    g.arc([X0, yA], Rr, -PI / 2, 0, { k: 'a', sw: 3 });
    g.line([X0 + Rr, yB], [X0 + Rr, 400], { k: 'a', sw: 3 });
    g.text([X0 + Rr * 0.55, yA - Rr * 0.55], 'A', { w: true, bold: true });
    g.text([X0 + Rr - 22, 360], 'B', { w: true, bold: true });
    const EA = [X0 + Rr, yA], EB = [X0 + Rr, yB];
    for (const P0 of [EA, EB]) g.line([P0[0] - 14, P0[1]], [P0[0] + 14, P0[1]], { k: 'g', sw: 1.6 });
    g.vec(EA, [1, 0], 60, { k: 'f' }); g.text([EA[0] + 70, EA[1]], 'N_A', { k: 'f', a: 'start' });
    faceMoment(g, EA, PI / 2, 1, 18); g.text([EA[0] - 30, EA[1] + 28], 'm', { k: 'M', a: 'end' });
    g.vec(EB, [-1, 0], 60, { k: 'f' }); g.text([EB[0] - 70, EB[1]], 'N_B', { k: 'f', a: 'end' });
    faceMoment(g, EB, PI / 2, -1, 18); g.text([EB[0] + 30, EB[1] - 28], 'm', { k: 'M', a: 'start' });
    // ring
    const rx = X0 + Rr - 12, rw = 24, rh = 18;
    g.poly([[rx, yRing - rh / 2], [rx + rw, yRing - rh / 2], [rx + rw, yRing + rh / 2], [rx, yRing + rh / 2]], { close: true, fill: 'fs-w', k: 'g', sw: 1.4 });
    g.arrow([rx, yRing], [rx - 56, yRing], { k: 'f' }); g.text([rx - 64, yRing], 'N_A', { k: 'f', a: 'end' });
    g.arrow([rx + rw, yRing - 5], [rx + rw + 56, yRing - 5], { k: 'f' }); g.text([rx + rw + 64, yRing - 9], 'N_B', { k: 'f', a: 'start' });
    g.arrow([rx + rw, yRing + 6], [rx + rw + 56, yRing + 6], { k: 'q', sw: 2 }); g.text([rx + rw + 64, yRing + 14], 'P_r', { k: 'q', a: 'start' });
    g.text([rx - 10, yRing + 26], 'шпангоут', { w: true, size: 14, a: 'end' });
    g.text([X0 + Rr + 30, 110], 'стык — конец A', { w: true, size: 13, k: 'm', a: 'start' });
    g.text([X0 + Rr + 30, 330], 'стык — начало B', { w: true, size: 13, k: 'm', a: 'start' });
  } });

// ---------------- 7. cone ----------------
TW.addFig('cn-geom', { w: 440, h: 360,
  caption: R`Коническая оболочка: координата $s$ отсчитывается от вершины по образующей, угол $\theta$ между нормалью и осью постоянен, $R_1 = \infty$. Из треугольников: $r = s\cos\theta$, $R_2 = r/\sin\theta = s\operatorname{ctg}\theta$.`,
  draw(g, V) {
    const X0 = 70, A = [X0, 60], th = deg(50), t = T(th), nn = Nn(th);
    axis(g, X0, 26, 340);
    g.line(A, V.add(A, t, 300), { k: 'a', sw: 3 });
    const s = 200, M = V.add(A, t, s), r = s * Math.cos(th), R2 = r / Math.sin(th), O2 = V.add(M, nn, -R2);
    g.line([X0, M[1]], M, { k: 'g', sw: 1.3, dash: '6 4' }); g.text([(X0 + M[0]) / 2, M[1] - 12], 'r');
    g.line(M, O2, { k: 'f', sw: 2 });
    g.dim(O2, M, 18, 'R_2', { k: 'f' });
    g.dim(A, M, 20, 's', { side: -1 });
    g.angle(O2, 40, -PI / 2, scrA(th), 'θ', { lr: 54 });
    g.line(A, [X0 + 70, A[1]], { k: 'm', dash: '3 3', sw: 1 }); g.angle(A, 44, 0, th, 'θ', { lr: 58 });
    g.vec(M, nn, 46, { k: 'g', sw: 1.3 }); g.text(V.add(M, nn, 60), 'n');
    g.dot(A); g.text([X0 - 10, A[1] - 6], 'вершина', { w: true, size: 14, a: 'end' });
    g.dot(M, { open: true }); g.text(V.add(M, [-6, 22]), 'M');
    g.dot(O2, { k: 'f' }); g.text([X0 - 10, O2[1]], 'O_2', { k: 'f', a: 'end' });
  } });

// ---------------- 8. shell FE ----------------
TW.addFig('fe-cone', { w: 480, h: 560,
  caption: R`Конический конечный элемент (меридиан — отрезок длины $L$ под углом $\theta$; $\theta = 0$ — кольцевая пластина, $\theta = \pi/2$ — цилиндр), $\xi = s/L$. а) Степени свободы в местных осях: $u$ — по образующей, $w$ — по нормали, $w' = dw/ds$ (поворот касательной к нормали). б) В глобальных осях: $\rho$, $\eta$, $\vartheta$; $\vartheta = -w'$ — поворот нормали в сторону роста $s$.`,
  draw(g, V) {
    const th = deg(34), t = T(th), nn = Nn(th), L = 230;
    const panel = (y, local) => {
      const X0 = 40, N1 = [150, y], N2 = V.add(N1, t, L);
      axis(g, X0, y - 46, y + 188, 'z');
      g.line(N1, N2, { k: 'a', sw: 4 });
      g.line([X0, N1[1]], N1, { k: 'm', dash: '5 4', sw: 1 }); g.line([X0, N2[1]], N2, { k: 'm', dash: '5 4', sw: 1 });
      g.text([(X0 + N1[0]) / 2, N1[1] + 16], 'R_a', { k: 'm' }); g.text([(X0 + N2[0]) / 2, N2[1] + 16], 'R_b', { k: 'm' });
      [[N1, '1'], [N2, '2']].forEach(([N, i]) => {
        if (local) {
          g.vec(N, t, 52, { k: 'u' }); g.text(V.add(V.add(N, t, 62), nn, -10), 'u_' + i, { k: 'u' });
          g.vec(N, nn, 46, { k: 'u' }); g.text(V.add(N, nn, 58), 'w_' + i, { k: 'u' });
          if (i === '1') { g.moment(N, 24, deg(-100), deg(-215), { k: 'M', hs: 9, hw: 3.4 }); g.text(V.add(N, V.dir(deg(-150)), 42), 'w′_1', { k: 'M' }); }
          else { g.moment(N, 24, deg(175), deg(70), { k: 'M', hs: 9, hw: 3.4 }); g.text(V.add(N, V.dir(deg(125)), 44), 'w′_2', { k: 'M' }); }
        } else {
          g.vec(N, [1, 0], 52, { k: 'u' }); g.text(V.add(N, [60, 12]), 'ρ_' + i, { k: 'u', a: 'start' });
          g.vec(N, [0, 1], 48, { k: 'u' }); g.text(V.add(N, [-12, 50]), 'η_' + i, { k: 'u', a: 'end' });
          if (i === '1') { g.moment(N, 24, deg(-200), deg(-75), { k: 'M', hs: 9, hw: 3.4 }); g.text(V.add(N, V.dir(deg(-140)), 42), 'ϑ_1', { k: 'M' }); }
          else { g.moment(N, 24, deg(100), deg(178), { k: 'M', hs: 9, hw: 3.4 }); g.text(V.add(N, V.dir(deg(140)), 44), 'ϑ_2', { k: 'M' }); }
        }
        g.dot(N, { r: 5 });
      });
      g.text(V.add(V.mid(N1, N2), nn, -22), local ? 'ξ = s/L' : 'L', { a: 'end' });
      g.line(N1, [N1[0] + 60, N1[1]], { k: 'm', sw: 1, dash: '3 3' });
      if (local) g.angle(N1, 40, 0, th, 'θ', { lr: 52 });
    };
    panel(84, true); panel(352, false);
    g.text([12, 262], 'а)', { w: true, a: 'start', size: 15 }); g.text([12, 545], 'б)', { w: true, a: 'start', size: 15 });
  } });

TW.addFig('fe-hermite', { w: 480, h: 280,
  caption: R`Функции формы прогиба (кубические полиномы Эрмита) на элементе $0\le\xi\le1$: $N_1$, $N_3$ дают единичный прогиб в своём узле, $N_2/L$, $N_4/L$ — единичный наклон. Наклоны всех функций в узлах — 0 или 1/L, поэтому $w$ и $w'$ непрерывны между элементами.`,
  draw(g, V) {
    const x0 = 60, x1 = 440, yv = v => 210 - v * 170;
    const map = (x, y) => [x0 + (x1 - x0) * x, yv(y)];
    g.line([x0, yv(0)], [x1 + 14, yv(0)], { k: 'g', sw: 1.1 }); g.line([x0, yv(-0.2)], [x0, yv(1.12)], { k: 'g', sw: 1.1 });
    for (const v of [0.5, 1]) g.line(map(0, v), map(1, v), { k: 'm', sw: 0.6, dash: '2 4' });
    g.text([x1 + 18, yv(0) + 14], 'ξ', { a: 'start' });
    g.text([x0 - 8, yv(1)], '1', { a: 'end', size: 15 }); g.text([x0 - 8, yv(0)], '0', { a: 'end', size: 15 });
    g.text([x1, yv(0) + 18], '1', { size: 15 }); g.text([(x0 + x1) / 2, yv(0) + 18], '0,5', { size: 15 });
    const fs = [
      [x => 1 - 3 * x * x + 2 * x ** 3, 'a', 'N_1', 0.2],
      [x => x * (1 - x) ** 2, 'f', 'N_2/L', 0.18],
      [x => 3 * x * x - 2 * x ** 3, 'q', 'N_3', 0.8],
      [x => x * x * (x - 1), 'M', 'N_4/L', 0.72],
    ];
    for (const [f, k, l, xl] of fs) {
      g.graph(f, 0, 1, map, { k, sw: 2.4 });
      const p = map(xl, f(xl)), sgn = f(xl) > 0.5 ? -1 : 1;
      g.text(V.add(p, [0, f(xl) < 0 ? 18 : -14]), l, { k });
    }
  } });
})();
