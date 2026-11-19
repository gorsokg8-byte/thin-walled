// Calculators built on js/solver.js: general shell solver (Godunov + FEM) and the MNP accuracy demo.
(function () {
  const S = TW.solver, el = TW.el;

  // Presets: meridian parts, boundary conditions and a known reference value where one exists.
  const PRESETS = {
    edge: {
      name: 'Длинный цилиндр, краевая сила N₀ (проверка по краевому эффекту)',
      build: v => ({ r0: v.R, parts: [{ type: 'cyl', L: v.L, h1: v.h, h2: v.h * v.hr }], p: 0,
        L: { type: 'free', N: v.N0, M: v.m0 }, R: { type: 'clamped' } }),
      ref: v => {
        const D = TW.shellLib.D(v.E, v.h, v.mu), b = TW.shellLib.beta(v.R, v.h, v.mu);
        return { label: 'Краевой эффект: ρ(0) = −N₀/(2Dβ³) − m₀/(2Dβ²)', val: -v.N0 / (2 * D * b ** 3) - v.m0 / (2 * D * b * b) };
      },
    },
    vessel: {
      name: 'Сосуд: половина цилиндра + полусферическое днище, давление p',
      build: v => ({ r0: v.R, parts: [{ type: 'cyl', L: v.L, h1: v.h }, { type: 'sph', th1: 90, th2: 178, h1: v.h * v.hr }], p: v.p,
        L: { type: 'sym' }, R: { type: 'pole' } }),
      ref: v => {
        const b = TW.shellLib.beta(v.R, v.h, v.mu);
        return v.hr === 1 ? { label: 'Теория: |N| на стыке = p/(8β)', val: v.p / (8 * b), key: 'Njoint' } : null;
      },
    },
    cone: {
      name: 'Цилиндр + коническое днище (угол образующей с осью α), давление p',
      build: v => ({ r0: v.R, parts: [{ type: 'cyl', L: v.L, h1: v.h }, { type: 'cone', theta: 90 + v.alpha, L: (v.R * 0.97) / Math.sin(v.alpha * Math.PI / 180), h1: v.h * v.hr }], p: v.p,
        L: { type: 'sym' }, R: { type: 'pole' } }),
    },
    plate: {
      name: 'Круглая пластина, заделка по контуру, давление p',
      build: v => ({ r0: v.R * 1e-3, parts: [{ type: 'plate', L: v.R * 0.999, h1: v.h }], p: v.p,
        L: { type: 'pole' }, R: { type: 'clamped' } }),
      ref: v => ({ label: 'Теория: прогиб в центре pR⁴/(64D)', val: v.p * v.R ** 4 / (64 * TW.shellLib.D(v.E, v.h, v.mu)), key: 'w0' }),
    },
    dome: {
      name: 'Сферический купол (0…φ₀), заделка по краю, давление p',
      build: v => ({ r0: v.R * Math.sin(1 * Math.PI / 180), parts: [{ type: 'sph', th1: 1, th2: v.phi, h1: v.h }], p: v.p,
        L: { type: 'pole' }, R: { type: 'clamped' } }),
    },
  };

  function runModel(v, P) {
    const cfg = P.build(v);
    const m = S.model(cfg.r0, cfg.parts, v.E, v.mu, cfg.p);
    const r0 = m.at(0).r, rL = m.at(m.L, -1).r;
    const bcL = S.bc(cfg.L.type, r0, cfg.L), bcR = S.bc(cfg.R.type, rL, cfg.R);
    return { cfg, m, bcL, bcR };
  }

  // FEM dof lists for the same boundary types
  const FIX = { clamped: [0, 1, 2], hinged: [0, 1], sym: [1, 2], pole: [0, 2], free: [] };

  TW.addCalc({
    id: 'shell', topic: 'godunov', title: 'Численный расчёт оболочки вращения',
    short: 'Метод Годунова и МКЭ на одной модели: цилиндр, конус, сфера, пластина и их сочленения.',
    lead: 'Каноническая система (8.3) интегрируется методом Рунге–Кутта с ортонормированием по Годунову; та же конструкция считается коническими конечными элементами. Единицы: мм, МПа, Н/мм. Ось z направлена вниз, меридиан идёт от левого торца к правому.',
    inputs: [
      { id: 'preset', label: 'Задача', value: 'vessel', options: Object.entries(PRESETS).map(([k, p]) => [k, p.name]) },
      { section: 'Параметры' },
      { id: 'R', label: 'Радиус $R$', unit: 'мм', value: 1000 },
      { id: 'h', label: 'Толщина $h$', unit: 'мм', value: 10 },
      { id: 'hr', label: 'Отношение толщин (2-я часть / 1-я или конец / начало)', value: 1 },
      { id: 'L', label: 'Длина цилиндрической части', unit: 'мм', value: 1000 },
      { id: 'alpha', label: 'Конус: угол $\\alpha$', unit: '°', value: 45 },
      { id: 'phi', label: 'Купол: угол $\\varphi_0$', unit: '°', value: 60 },
      { id: 'p', label: 'Давление $p$', unit: 'МПа', value: 1 },
      { id: 'N0', label: 'Краевая сила $N_0$ (если край свободен)', unit: 'Н/мм', value: 50 },
      { id: 'm0', label: 'Краевой момент $m_0$', unit: 'Н·мм/мм', value: 0 },
      { id: 'E', label: '$E$', unit: 'МПа', value: 200000 },
      { id: 'mu', label: '$\\mu$', value: 0.3 },
      { id: 'nel', label: 'Число конечных элементов', value: 200 },
    ],
    run(v, out) {
      const P = PRESETS[v.preset];
      const { cfg, m, bcL, bcR } = runModel(v, P);
      const t0 = performance.now();
      const G = S.shoot(m, bcL, bcR, { godunov: true });
      const t1 = performance.now();
      const res = G.pts.map(q => S.post(m, q.s, q.y));
      const edgeVals = t => (t.type === 'free' ? [t.N || 0, t.Z || 0, t.M || 0] : null);
      let F = null, ferr = '';
      try { F = S.fem(m, Math.max(10, Math.min(1000, v.nel | 0)), FIX[cfg.L.type], FIX[cfg.R.type], edgeVals(cfg.L), edgeVals(cfg.R)); }
      catch (e) { ferr = e.message; }

      // key numbers
      const rows = [
        ['$\\lambda = \\int\\beta\\,ds$', G.lam, ''],
        ['Участков ортонормирования', String(G.segments), ''],
        ['Время расчёта (Годунов)', (t1 - t0).toFixed(0) + ' мс', ''],
        ['$\\rho$ на левом торце: Годунов', res[0].rho, 'мм'],
      ];
      if (F) rows.push(['$\\rho$ на левом торце: МКЭ (' + F.nEl + ' эл.)', F.nodes[0].rho, 'мм']);
      const ref = P.ref && P.ref(v);
      if (ref) {
        let got = res[0].rho;
        if (ref.key === 'w0') got = -res[0].eta + res[res.length - 1].eta; // plate: deflection of centre relative to the edge
        if (ref.key === 'Njoint') { const j = m.joints[0]; const k = G.pts.findIndex(q => q.s >= j - 1e-9); got = Math.abs(S.post(m, G.pts[k].s, G.pts[k].y, -1).N); }
        rows.push([ref.label, ref.val, ''], ['То же по Годунову', got, ''], ['Расхождение', (100 * (got - ref.val) / ref.val).toFixed(2).replace('.', ',') + ' %', '']);
      }
      const sAll = res.flatMap(q => [q.s1o, q.s1i, q.s2o, q.s2i]).map(Math.abs);
      rows.push(['Наибольшее |σ|', Math.max(...sAll), 'МПа']);
      out.append(TW.resTable(rows));
      if (ferr) out.append(el('div', { class: 'note warn' }, 'МКЭ: ' + ferr));

      const s = res.map(q => q.s), joints = m.joints.map(x => ({ x, label: 'стык' }));
      const ser = (key, label) => ({ x: s, y: res.map(q => q[key]), label });
      const fem = (arr, key, label) => ({ x: arr.map(q => q.s), y: arr.map(q => q[key]), label, dash: '4 4' });
      out.append(TW.plot({ title: 'Радиальное перемещение ρ, мм', xlabel: 's, мм', xname: 's', vlines: joints,
        series: [ser('rho', 'Годунов')].concat(F ? [fem(F.nodes, 'rho', 'МКЭ')] : []) }));
      out.append(TW.plot({ title: 'Изгибающий момент M₁, Н·мм/мм', xlabel: 's, мм', xname: 's', vlines: joints,
        series: [ser('M1', 'Годунов')].concat(F ? [fem(F.res, 'M1', 'МКЭ')] : []) }));
      out.append(TW.plot({ title: 'Усилия T₁, T₂, Н/мм', xlabel: 's, мм', xname: 's', vlines: joints,
        series: [ser('T1', 'T₁'), ser('T2', 'T₂')].concat(F ? [fem(F.res, 'T2', 'T₂ МКЭ')] : []) }));
      out.append(TW.plot({ title: 'Напряжения, МПа (о — наружная, в — внутренняя поверхность)', xlabel: 's, мм', xname: 's', vlines: joints, height: 300,
        series: [ser('s1o', 'σ₁ о'), ser('s1i', 'σ₁ в'), ser('s2o', 'σ₂ о'), ser('s2i', 'σ₂ в')] }));
      out.append(el('p', { class: 'small muted', html: 'Граничные условия: свободный край — заданы $N$, $Z$, $M_1$; заделка — $\\rho = \\eta = \\vartheta = 0$; плоскость симметрии — $\\eta = 0$, $\\vartheta = 0$, $N = 0$; полюс — $\\rho = 0$, $\\vartheta = 0$, $rZ = 0$ (расчёт начинается на малом радиусе, чтобы избежать особенности $1/r$).' }));
    },
  });

  TW.addCalc({
    id: 'mnp', topic: 'canonical', title: 'МНП: потеря точности',
    short: 'Как растёт погрешность метода начальных параметров с ростом λ = βl и почему нужен Годунов.',
    lead: 'Цилиндр под внутренним давлением, оба торца заделаны. По симметрии момент на правом торце равен моменту на левом: M₁(l) = M₁(0). Интегрируем слева направо методом начальных параметров (без ортонормирования) и методом Годунова и смотрим, насколько нарушается это равенство.',
    inputs: [
      { id: 'R', label: '$R$', unit: 'мм', value: 1000 },
      { id: 'h', label: '$h$', unit: 'мм', value: 10 },
      { id: 'lmax', label: 'Наибольшее $\\lambda$', value: 45 },
      { id: 'lshow', label: '$\\lambda$ для эпюры', value: 36 },
      { id: 'E', label: '$E$', unit: 'МПа', value: 200000 },
      { id: 'mu', label: '$\\mu$', value: 0.3 },
    ],
    run(v, out) {
      const b = TW.shellLib.beta(v.R, v.h, v.mu);
      const make = lam => S.model(v.R, [{ type: 'cyl', L: lam / b, h1: v.h }], v.E, v.mu, 1);
      const bcs = [S.bc('clamped', v.R), S.bc('clamped', v.R)];
      const lams = [], eM = [], eG = [];
      const step = Math.max(1, Math.round(v.lmax / 30));
      const err = r => { const a = r.pts[0].y[5], z = r.pts[r.pts.length - 1].y[5]; return Math.log10(Math.max(1e-16, Math.abs((z - a) / a))); };
      for (let lam = 2; lam <= v.lmax + 1e-9; lam += step) {
        const m = make(lam);
        lams.push(lam);
        try { eM.push(Math.min(3, err(S.shoot(m, bcs[0], bcs[1], { godunov: false })))); } catch (e) { eM.push(3); }
        try { eG.push(err(S.shoot(m, bcs[0], bcs[1], { godunov: true }))); } catch (e) { eG.push(3); }
      }
      out.append(TW.plot({ title: 'lg |M₁(l) − M₁(0)| / |M₁(0)| — нарушение симметрии', xlabel: 'λ = βl', xname: 'λ', yZero: false,
        series: [{ x: lams, y: eM, label: 'МНП' }, { x: lams, y: eG, label: 'Годунов' }] }));
      const m = make(v.lshow);
      const ser = (r, label, dash) => {
        const pts = r.pts.map(q => S.post(m, q.s, q.y));
        return { x: pts.map(q => q.s * b), y: pts.map(q => q.M1), label, dash };
      };
      let sM = null;
      try { sM = ser(S.shoot(m, bcs[0], bcs[1], { godunov: false }), 'МНП', '5 4'); } catch (e) { /* singular */ }
      const sG = ser(S.shoot(m, bcs[0], bcs[1], { godunov: true }), 'Годунов');
      const lim = 3 * Math.max(...sG.y.map(Math.abs));
      if (sM) sM.y = sM.y.map(x => Math.max(-lim, Math.min(lim, x)));
      out.append(TW.plot({ title: 'M₁ при λ = ' + v.lshow + ', Н·мм/мм (МНП обрезан по ±3·max)', xlabel: 'βs', xname: 'βs',
        series: [sG].concat(sM ? [sM] : []) }));
      out.append(el('p', { class: 'small', html: 'Решения однородной системы содержат $e^{\\beta s}$. При интегрировании слева направо решение у правого торца получается вычитанием почти равных огромных чисел порядка $e^{\\lambda}$, и затухающий краевой эффект правого торца теряется: относительная ошибка порядка $10^{-16}e^{\\lambda}$, то есть 100% уже при $\\lambda\\approx 37$. Метод Годунова каждые $\\Delta\\lambda\\approx1$ ортонормирует столбцы и не даёт им вырасти — погрешность остаётся на уровне ошибки интегрирования.' }));
    },
  });
})();
