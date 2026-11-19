// Pressure vessel junction: cylinder (part A, ends at the joint) + head (part B, starts at the joint),
// optional ring. Conditions (5.1). Units: mm, MPa, N/mm.
(function () {
  const L = TW.shellLib;

  // Membrane state of the head at the joint, joint radius R. theta0 measured with z pointing down,
  // meridian running from the cylinder into the head (all sin(theta) > 0).
  function head(v) {
    const E = v.E, mu = v.mu, h = v.h2, p = v.p, R = v.R;
    if (v.head === 'ell') {
      const a = R, b = v.ratio * R;            // equator of an ellipsoid: smooth joint
      const R1 = b * b / a, R2 = a;
      const T1 = p * a / 2, T2 = p * a * (1 - a * a / (2 * b * b));
      return { name: 'эллиптическое днище', th0: Math.PI / 2, R2, T1, T2, rho: R * (T2 - mu * T1) / (E * h), th: 0, R1 };
    }
    if (v.head === 'sph') {
      const Rs = R / Math.sin(Math.min(v.segDeg, 90) * Math.PI / 180); // segment: sin(theta0) = R/Rs
      const sn = R / Rs, th0 = Math.PI - Math.asin(sn);
      const T = p * Rs / 2;
      return { name: 'сферический сегмент', th0, R2: Rs, T1: T, T2: T, rho: R * T * (1 - mu) / (E * h), th: 0 };
    }
    // cone with generator angle alpha to the axis, converging downwards
    const al = v.alpha * Math.PI / 180, th0 = Math.PI / 2 + al, sn = Math.cos(al);
    const T1 = p * R / (2 * sn), T2 = p * R / sn;
    return { name: 'коническое днище', th0, R2: R / sn, T1, T2, rho: R * (T2 - mu * T1) / (E * h),
      th: -3 * p * R * Math.cos(th0) / (2 * E * h * sn * sn) };
  }

  function solve3(A, b) {
    // Gaussian elimination with partial pivoting.
    const n = 3, M = A.map((row, i) => row.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      [M[c], M[piv]] = [M[piv], M[c]];
      for (let r = c + 1; r < n; r++) {
        const f = M[r][c] / M[c][c];
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    const x = [0, 0, 0];
    for (let r = n - 1; r >= 0; r--) {
      let s = M[r][n];
      for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
      x[r] = s / M[r][r];
    }
    return x;
  }

  TW.addCalc({
    id: 'junction', topic: 'junctions', title: 'Сопряжение оболочек',
    short: 'Цилиндрический сосуд под давлением + днище (эллиптическое, сферическое, коническое), шпангоут на стыке.',
    lead: 'Метод сил, условия совместности (5.1): неизвестные — момент на стыке m и краевые распорные силы частей. Цилиндр — часть A, днище — часть B. Единицы: мм, МПа, Н/мм.',
    inputs: [
      { id: 'head', label: 'Днище', value: 'ell', options: [['ell', 'Эллиптическое (b/a = 1 — полусфера)'], ['sph', 'Сферический сегмент'], ['cone', 'Коническое']] },
      { section: 'Цилиндр' },
      { id: 'R', label: 'Радиус $R$', unit: 'мм', value: 1000 },
      { id: 'h1', label: 'Толщина цилиндра $h_1$', unit: 'мм', value: 10 },
      { section: 'Днище' },
      { id: 'h2', label: 'Толщина днища $h_2$', unit: 'мм', value: 10 },
      { id: 'ratio', label: 'Эллипс: $b/a$', value: 1 },
      { id: 'segDeg', label: 'Сегмент: угол $\\varphi_0 = \\arcsin(R/R_s)$', unit: '°', value: 60 },
      { id: 'alpha', label: 'Конус: угол образующей с осью $\\alpha$', unit: '°', value: 45 },
      { section: 'Нагрузка, материал, шпангоут' },
      { id: 'p', label: 'Давление $p$', unit: 'МПа', value: 1 },
      { id: 'E', label: '$E$', unit: 'МПа', value: 200000 },
      { id: 'mu', label: '$\\mu$', value: 0.3 },
      { id: 'Ar', label: 'Площадь шпангоута $A_r$ (0 — нет)', unit: 'мм²', value: 0 },
    ],
    run(v, out) {
      const el = TW.el;
      const mu = v.mu, R = v.R;
      // Part A: cylinder, theta = 90°
      const DA = L.D(v.E, v.h1, mu), bA = L.beta(R, v.h1, mu), dA = L.delta(DA, bA, 1);
      const A = { T1: v.p * R / 2, T2: v.p * R, rho: v.p * R * R * (2 - mu) / (2 * v.E * v.h1), th: 0, N: 0 };
      // Part B: head
      const H = head(v);
      const snB = Math.sin(H.th0), csB = Math.cos(H.th0);
      const DB = L.D(v.E, v.h2, mu), bB = L.beta(H.R2, v.h2, mu), dB = L.delta(DB, bB, snB);
      const NbmB = H.T1 * csB;
      const kr = v.Ar > 0 ? v.E * v.Ar / (R * R) : 0;

      // Unknowns x = [m, NA_ke, NB_ke]; total N_A = 0 + NA_ke, N_B = NbmB + NB_ke.
      const M = [
        [dA.d11 + dB.d11, -dA.d12, dB.d12],
        [-dA.d12 + dB.d12, dA.d22, dB.d22],
        // N_B - N_A = kr * rho_A  ->  NbmB + NB - NA - kr*(rho_bm_A - d21A m + d22A NA) = 0
        [kr * dA.d12, -1 - kr * dA.d22, 1],
      ];
      const rhs = [H.th - A.th, H.rho - A.rho, kr * A.rho - NbmB];
      const [m, NA, NB] = solve3(M, rhs);

      out.append(TW.resTable([
        ['Днище', H.name, ''],
        ['$\\theta_0$ днища на стыке', TW.fmt(H.th0 / Math.PI * 180, 4) + '°', ''],
        ['$\\rho\\BM$ цилиндра / днища', TW.fmt(A.rho) + ' / ' + TW.fmt(H.rho), 'мм'],
        ['$\\vartheta\\BM$ цилиндра / днища', TW.fmt(A.th) + ' / ' + TW.fmt(H.th), 'рад'],
        ['$N\\BM$ днища $= T_1\\cos\\theta_0$', NbmB, 'Н/мм'],
        ['$\\beta$ цилиндра / днища', TW.fmt(bA) + ' / ' + TW.fmt(bB), '1/мм'],
        ['Момент на стыке $m$', m, 'Н·мм/мм'],
        ['$N_A\\KE$ (цилиндр)', NA, 'Н/мм'],
        ['$N_B\\KE$ (днище)', NB, 'Н/мм'],
        ['Для сравнения: $p/(8\\beta)$', v.p / (8 * bA), 'Н/мм'],
      ]));
      if (Math.sqrt(R * snB / v.h2) < 3) out.append(el('div', { class: 'note warn' }, el('div', { class: 'n-title' }, 'Днище пологое у стыка'), el('div', { html: 'Теория краевого эффекта для днища неточна.' })));

      // Distributions: A at x < 0 (distance up the cylinder), B at x > 0 (along the head meridian).
      const xa = TW.linspace(4 / bA, 0, 121), xb = TW.linspace(0, 4 / bB, 121);
      const x = [], M1 = [], T1 = [], T2 = [], s1o = [], s1i = [], s2o = [], s2i = [];
      const push = (xx, mm, t1, t2, h) => {
        x.push(xx); M1.push(mm); T1.push(t1); T2.push(t2);
        s1o.push(t1 / h + 6 * mm / h ** 2); s1i.push(t1 / h - 6 * mm / h ** 2);
        s2o.push(t2 / h + 6 * mu * mm / h ** 2); s2i.push(t2 / h - 6 * mu * mm / h ** 2);
      };
      for (const s of xa) {
        const e = L.endEdge(s, m, NA, DA, bA, 1);
        push(-s, e.M1, A.T1, A.T2 + v.E * v.h1 * e.rho / R, v.h1);
      }
      for (const s of xb) {
        const e = L.startEdge(s, m, NB, DB, bB, snB);
        push(s, e.M1, H.T1 + e.N * csB, H.T2 + v.E * v.h2 * e.rho / R, v.h2);
      }
      const all = s1o.concat(s1i, s2o, s2i).map(Math.abs);
      const smax = Math.max(...all);
      out.append(TW.resTable([
        ['Наибольшее |σ| в зоне стыка', smax, 'МПа'],
        ['Мембранное $\\sigma_2 = pR/h_1$ в цилиндре', v.p * R / v.h1, 'МПа'],
        ['Коэффициент концентрации', smax / (v.p * R / v.h1), ''],
      ]));
      const xl = 'расстояние от стыка, мм (− цилиндр, + днище)';
      out.append(TW.plot({ title: 'Изгибающий момент M₁, Н·мм/мм', xlabel: xl, xname: 's', series: [{ x, y: M1, label: 'M₁' }], vlines: [{ x: 0, label: 'стык' }] }));
      out.append(TW.plot({ title: 'Усилия T₁, T₂, Н/мм', xlabel: xl, xname: 's', series: [{ x, y: T1, label: 'T₁' }, { x, y: T2, label: 'T₂' }], vlines: [{ x: 0 }] }));
      out.append(TW.plot({
        title: 'Напряжения, МПа (о — наружная, в — внутренняя поверхность)', xlabel: xl, xname: 's', height: 300, vlines: [{ x: 0 }],
        series: [{ x, y: s1o, label: 'σ₁ о' }, { x, y: s1i, label: 'σ₁ в', dash: '5 4' }, { x, y: s2o, label: 'σ₂ о' }, { x, y: s2i, label: 'σ₂ в', dash: '5 4' }],
      }));
      out.append(el('p', { class: 'small muted', html: 'Безмоментные усилия днища в зоне стыка приняты постоянными (по значениям на стыке) — зона краевого эффекта узкая. Шпангоут — кольцо без изгибной жёсткости.' }));
    },
  });
})();
