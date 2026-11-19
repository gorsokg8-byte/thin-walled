// Plate calculators for exam questions 16-31: Levy series, Ritz/Kantorovich, shear locking demo.
(function () {
  const el = TW.el;
  const ch = Math.cosh, sh = Math.sinh;

  // ---------- Levy: edges y = 0, b simply supported; edges x = ±a/2 of a chosen type ----------
  // w = Σ f_i(x) sin(α_i y), α_i = iπ/b, f_i = 4qb⁴/(π⁵D i⁵) + A ch α_i x + B α_i x sh α_i x (even in x).
  function levy(v, D) {
    const P = Math.PI, a = v.a, b = v.b, mu = v.mu;
    const terms = [];
    for (let i = 1; i <= 41; i += 2) {
      const al = i * P / b, fp = 4 * v.q * b ** 4 / (P ** 5 * D * i ** 5);
      const x0 = a / 2, t = al * x0;
      // f = fp + A ch + B t sh ; derivatives wrt x at x0
      const f = [ch(t), t * sh(t)];
      const f1 = [al * sh(t), al * (sh(t) + t * ch(t))];
      const f2 = [al * al * ch(t), al * al * (2 * ch(t) + t * sh(t))];
      const f3 = [al ** 3 * sh(t), al ** 3 * (3 * sh(t) + t * ch(t))];
      let M, r;
      if (v.edge === 'ss') { M = [f, f2]; r = [-fp, 0]; }                      // w = 0, w'' = 0
      else if (v.edge === 'cl') { M = [f, f1]; r = [-fp, 0]; }                 // w = 0, w' = 0
      else {                                                                     // free: M = 0, Kirchhoff force = 0
        M = [[f2[0] - mu * al * al * f[0], f2[1] - mu * al * al * f[1]], [f3[0] - (2 - mu) * al * al * f1[0], f3[1] - (2 - mu) * al * al * f1[1]]];
        r = [mu * al * al * fp, 0];
      }
      const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
      const A = (r[0] * M[1][1] - M[0][1] * r[1]) / det, B = (M[0][0] * r[1] - r[0] * M[1][0]) / det;
      terms.push({ al, fp, A, B });
    }
    const at = (x, y) => {
      let w = 0, wxx = 0, wyy = 0;
      for (const { al, fp, A, B } of terms) {
        const t = al * x, s = Math.sin(al * y);
        const f = fp + A * ch(t) + B * t * sh(t);
        const fxx = al * al * (A * ch(t) + B * (2 * ch(t) + t * sh(t)));
        w += f * s; wxx += fxx * s; wyy -= al * al * f * s;
      }
      return { w, Mx: -D * (wxx + mu * wyy), My: -D * (wyy + mu * wxx) };
    };
    return at;
  }
  TW.levy = levy;

  TW.addCalc({
    id: 'levy', topic: 'plate-levy', title: 'Пластина: решение Леви',
    short: 'Края y = 0, b шарнирные; края x = ±a/2 — шарнир, заделка или свободны.',
    lead: 'Одинарный ряд по sin(iπy/b) — Бидерман (2.34). Проверки: шарнир по контуру = Навье (0,00406 qa⁴/D для квадрата); свободные края при μ = 0 дают изгиб полосы-балки 5qa⁴/(384D) = 0,01302 qa⁴/D.',
    inputs: [
      { id: 'edge', label: 'Края x = ±a/2', value: 'ss', options: [['ss', 'шарнир'], ['cl', 'заделка'], ['free', 'свободны']] },
      { id: 'a', label: 'Ширина $a$ (по x)', unit: 'мм', value: 400 },
      { id: 'b', label: 'Пролёт $b$ (по y, шарнирные края)', unit: 'мм', value: 400 },
      { id: 'h', label: 'Толщина $h$', unit: 'мм', value: 6 },
      { id: 'q', label: 'Давление $q$', unit: 'МПа', value: 0.05 },
      { id: 'E', label: '$E$', unit: 'МПа', value: 200000 },
      { id: 'mu', label: '$\\mu$', value: 0.3 },
    ],
    run(v, out) {
      const D = TW.shellLib.D(v.E, v.h, v.mu);
      const at = levy(v, D);
      const c = at(0, v.b / 2), e = at(v.a / 2, v.b / 2);
      const L4 = v.q * v.b ** 4 / D;
      out.append(TW.resTable([
        ['$D$', D, 'Н·мм'],
        ['Прогиб в центре $w(0, b/2)$', c.w, 'мм'], ['$wD/(qb^4)$', c.w / L4, ''],
        ['Прогиб в середине края $x = a/2$', e.w, 'мм'], ['То же, $wD/(qb^4)$', e.w / L4, ''],
        ['$M_x$, $M_y$ в центре', TW.fmt(c.Mx) + ' / ' + TW.fmt(c.My), 'Н·мм/мм'],
        ['$M_y/(qb^2)$ в центре', c.My / (v.q * v.b * v.b), ''],
      ]));
      const xs = TW.linspace(-v.a / 2, v.a / 2, 61), ys = TW.linspace(0, v.b, 61);
      out.append(TW.plot({ title: 'Прогиб по линии y = b/2, мм', xlabel: 'x, мм', xname: 'x', series: [{ x: xs, y: xs.map(x => at(x, v.b / 2).w), label: 'w' }] }));
      out.append(TW.plot({ title: 'Прогиб по линии x = 0, мм', xlabel: 'y, мм', xname: 'y', series: [{ x: ys, y: ys.map(y => at(0, y).w), label: 'w' }] }));
    },
  });

  // ---------- Ritz and Kantorovich for a clamped rectangular plate ----------
  // Gauss–Legendre 8-point on [-1, 1]
  const G8 = [[-0.9602898564975363, 0.1012285362903763], [-0.7966664774136267, 0.2223810344533745], [-0.5255324099163290, 0.3137066458778873], [-0.1834346424956498, 0.3626837833783620],
    [0.1834346424956498, 0.3626837833783620], [0.5255324099163290, 0.3137066458778873], [0.7966664774136267, 0.2223810344533745], [0.9602898564975363, 0.1012285362903763]];
  function quad2(f, a, b, n) { // composite Gauss over [0,a]x[0,b], n x n cells
    let s = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (const [xi, wi] of G8) for (const [yj, wj] of G8) {
      const x = (i + (xi + 1) / 2) * a / n, y = (j + (yj + 1) / 2) * b / n;
      s += wi * wj * f(x, y);
    }
    return s * (a / n) * (b / n) / 4;
  }
  function ritzClamped(a, b, q, D, N) {
    const P = Math.PI, idx = [];
    for (let m = 1; m <= N; m++) for (let n = 1; n <= N; n++) idx.push([m, n]);
    const phi = ([m, n], x, y) => (1 - Math.cos(2 * P * m * x / a)) * (1 - Math.cos(2 * P * n * y / b));
    const lap = ([m, n], x, y) => {
      const ax = 2 * P * m / a, by = 2 * P * n / b;
      return ax * ax * Math.cos(ax * x) * (1 - Math.cos(by * y)) + by * by * (1 - Math.cos(ax * x)) * Math.cos(by * y);
    };
    const nn = idx.length, K = Array.from({ length: nn }, () => new Array(nn).fill(0)), F = new Array(nn).fill(0);
    const cells = Math.max(2, N);
    for (let i = 0; i < nn; i++) {
      F[i] = q * quad2((x, y) => phi(idx[i], x, y), a, b, cells);
      for (let j = i; j < nn; j++) {
        K[i][j] = K[j][i] = D * quad2((x, y) => lap(idx[i], x, y) * lap(idx[j], x, y), a, b, cells);
      }
    }
    const c = TW.solver.linsolve(K, F);
    return (x, y) => idx.reduce((s, t, k) => s + c[k] * phi(t, x, y), 0);
  }
  // Kantorovich: w = f(x) (y² − β²)², |x| ≤ α, |y| ≤ β (half sides). ODE: f'''' − (6/β²) f'' + (31.5/β⁴) f = 1.3125 q/(Dβ⁴).
  function kantorovich(a, b, q, D) {
    const A = a / 2, B = b / 2;
    const fp = q / (24 * D);
    // roots r = (p ± i s)/B from r² = (3 ± i√22.5)/B²
    const mod = Math.sqrt(Math.sqrt(9 + 22.5)), ang = Math.atan2(Math.sqrt(22.5), 3) / 2;
    const p = mod * Math.cos(ang) / B, s = mod * Math.sin(ang) / B;
    // even solution: f = fp + C1 ch(px) cos(sx) + C2 sh(px) sin(sx); BC f(A) = 0, f'(A) = 0
    const u1 = x => ch(p * x) * Math.cos(s * x), u2 = x => sh(p * x) * Math.sin(s * x);
    const d1 = x => p * sh(p * x) * Math.cos(s * x) - s * ch(p * x) * Math.sin(s * x);
    const d2 = x => p * ch(p * x) * Math.sin(s * x) + s * sh(p * x) * Math.cos(s * x);
    const M = [[u1(A), u2(A)], [d1(A), d2(A)]], r = [-fp, 0];
    const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
    const C1 = (r[0] * M[1][1] - M[0][1] * r[1]) / det, C2 = (M[0][0] * r[1] - r[0] * M[1][0]) / det;
    return (x, y) => (fp + C1 * u1(x) + C2 * u2(x)) * (y * y - B * B) ** 2;   // x, y from the centre
  }
  TW.kantorovich = kantorovich;

  TW.addCalc({
    id: 'variational', topic: 'plate-variational', title: 'Ритц и Канторович',
    short: 'Заделанная прямоугольная пластина под q: метод Ритца с N×N членами и метод Канторовича.',
    lead: 'Точное значение для квадратной заделанной пластины (Тимошенко–Войновский-Кригер): w_max = 0,00126 qa⁴/D. Один член Ритца (Бидерман (2.90)): 0,001283.',
    inputs: [
      { id: 'a', label: 'Сторона $a$', unit: 'мм', value: 400 },
      { id: 'b', label: 'Сторона $b$', unit: 'мм', value: 400 },
      { id: 'h', label: 'Толщина $h$', unit: 'мм', value: 6 },
      { id: 'q', label: 'Давление $q$', unit: 'МПа', value: 0.05 },
      { id: 'E', label: '$E$', unit: 'МПа', value: 200000 },
      { id: 'mu', label: '$\\mu$', value: 0.3 },
    ],
    run(v, out) {
      const D = TW.shellLib.D(v.E, v.h, v.mu), sc = v.q * v.a ** 4 / D;
      const rows = [['$D$', D, 'Н·мм']];
      const conv = [];
      for (const N of [1, 2, 3, 4]) {
        const w = ritzClamped(v.a, v.b, v.q, D, N)(v.a / 2, v.b / 2);
        rows.push(['Ритц, ' + N + '×' + N + ' членов: $w_{\\max}D/(qa^4)$', w / sc, '']);
        conv.push(w / sc);
      }
      const wk = kantorovich(v.a, v.b, v.q, D)(0, 0);
      rows.push(['Канторович (1 член по y): $w_{\\max}D/(qa^4)$', wk / sc, '']);
      if (v.a === v.b) rows.push(['Точное (квадрат)', 0.00126, '']);
      rows.push(['$w_{\\max}$ (Ритц 4×4)', conv[3] * sc, 'мм']);
      out.append(TW.resTable(rows));
      out.append(el('p', { class: 'small muted', html: 'Метод Ритца делает систему жёстче (дополнительные связи), поэтому работа нагрузки на приближённых перемещениях не больше точной и с ростом числа членов растёт к ней (Бидерман (2.86)). Это оценка «в среднем»: прогиб в отдельной точке может приближаться к точному с колебаниями — как здесь в центре. Моменты сходятся медленнее прогибов: у Бидермана один член даёт момент в центре, отличающийся от точного в 1,42 раза. Канторович с одним членом по y точнее одночленного Ритца с той же функцией по y и полиномом по x.' }));
    },
  });

  // ---------- shear locking: Timoshenko cantilever with 2-node elements ----------
  function timoBeam(L, h, E, nu, n, scheme) {
    const I = h ** 3 / 12, A = h, G = E / (2 * (1 + nu)), k = 5 / 6, Le = L / n, P = 1;
    const nd = 2 * (n + 1), K = Array.from({ length: nd }, () => new Array(nd).fill(0));
    const pts = scheme === 'full' ? [[0.5 - 0.5 / Math.sqrt(3), 0.5], [0.5 + 0.5 / Math.sqrt(3), 0.5]] : [[0.5, 1]];
    for (let e = 0; e < n; e++) {
      const d = [2 * e, 2 * e + 1, 2 * e + 2, 2 * e + 3]; // w1, θ1, w2, θ2
      const kb = E * I / Le, Kb = [[0, 0, 0, 0], [0, kb, 0, -kb], [0, 0, 0, 0], [0, -kb, 0, kb]];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) K[d[i]][d[j]] += Kb[i][j];
      for (const [xi, wt] of pts) { // γ = w' − θ
        const Bg = [-1 / Le, -(1 - xi), 1 / Le, -xi];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) K[d[i]][d[j]] += k * G * A * Le * wt * Bg[i] * Bg[j];
      }
    }
    const F = new Array(nd).fill(0); F[nd - 2] = P;
    // clamp node 0
    const Kr = K.slice(2).map(row => row.slice(2)), Fr = F.slice(2);
    const x = TW.solver.linsolve(Kr, Fr);
    const exact = P * L ** 3 / (3 * E * I) + P * L / (k * G * A);
    return x[x.length - 2] / exact;
  }
  TW.timoBeam = timoBeam;

  TW.addCalc({
    id: 'locking', topic: 'plate-mindlin', title: 'Сдвиговое заклинивание',
    short: 'Балка Тимошенко из линейных элементов: полное и сокращённое интегрирование сдвига.',
    lead: 'Консоль с силой на конце, элементы с линейной аппроксимацией прогиба и угла поворота — одномерный аналог пластины Миндлина. Отношение прогиба МКЭ к точному (с учётом сдвига) в зависимости от гибкости L/h. Сокращённое интегрирование сдвигового слагаемого (одна точка) равносильно постоянной сдвиговой деформации в элементе — это и есть «двойная» (независимая) аппроксимация деформаций сдвига.',
    inputs: [
      { id: 'n', label: 'Число элементов', value: 8 },
      { id: 'nu', label: '$\\mu$', value: 0.3 },
    ],
    run(v, out) {
      const n = Math.max(1, Math.min(200, v.n | 0));
      const ratios = [2, 3, 5, 10, 20, 50, 100, 200, 500, 1000];
      const full = ratios.map(r => timoBeam(r, 1, 1, v.nu, n, 'full'));
      const red = ratios.map(r => timoBeam(r, 1, 1, v.nu, n, 'reduced'));
      const lg = ratios.map(r => Math.log10(r));
      out.append(TW.plot({ title: 'Прогиб конца: МКЭ / точный', xlabel: 'lg(L/h)', xname: 'lg(L/h)', series: [
        { x: lg, y: full, label: 'полное интегрирование (2 точки)' }, { x: lg, y: red, label: 'сокращённое (1 точка) / постоянный сдвиг' }] }));
      out.append(TW.resTable(ratios.map((r, i) => ['L/h = ' + r, TW.fmt(full[i], 4) + '  /  ' + TW.fmt(red[i], 4), 'полн. / сокр.'])));
      out.append(el('p', { class: 'small', html: 'Почему так: при полном интегрировании элемент обязан сделать $\\gamma = w\' - \\theta \\approx 0$ во всех точках интегрирования, а линейные $w$ и $\\theta$ этого не позволяют без запрета изгиба. Сдвиговая жёсткость $\\sim kGh$ растёт относительно изгибной $\\sim Eh^3$ как $(L/h)^2$, и решение «замерзает». При одной точке требование $\\gamma = 0$ ставится только в середине элемента — изгиб остаётся свободным.' }));
    },
  });
})();
