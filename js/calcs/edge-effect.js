// Edge-effect library (Shtaerman–Geckeler) + calculator. Units: mm, MPa, N/mm.
(function () {
  const L = (TW.shellLib = {});
  L.D = (E, h, mu) => E * h ** 3 / (12 * (1 - mu * mu));
  L.beta = (R2, h, mu) => Math.pow(3 * (1 - mu * mu), 0.25) / Math.sqrt(R2 * h);
  L.f = x => {
    const e = Math.exp(-x), c = Math.cos(x), s = Math.sin(x);
    return { f1: e * (c + s), f2: e * (c - s), f3: e * c, f4: e * s };
  };
  // Compliances of an edge (4.14).
  L.delta = (D, b, sn) => ({ d11: 1 / (D * b), d12: sn / (2 * D * b * b), d22: sn * sn / (2 * D * b ** 3) });

  // Edge effect from a START edge (part begins at the edge, s grows into the part), formulas (4.13).
  // Returns rho, theta (rotation), M1, N, Q at distance s.
  L.startEdge = function (s, m0, N0, D, b, sn) {
    const { f1, f2, f3, f4 } = L.f(b * s);
    return {
      rho: -m0 * sn / (2 * D * b * b) * f2 - N0 * sn * sn / (2 * D * b ** 3) * f3,
      th: -m0 / (D * b) * f3 - N0 * sn / (2 * D * b * b) * f1,
      M1: m0 * f1 + N0 * sn / b * f4,
      N: -2 * b * m0 * f4 / sn + N0 * f2,
    };
  };
  // END edge (part ends at the edge); s = distance from the edge back into the part.
  // Odd derivatives change sign: use loads (m, -N) and flip theta and N back.
  L.endEdge = function (s, m, N, D, b, sn) {
    const r = L.startEdge(s, m, -N, D, b, sn);
    return { rho: r.rho, th: -r.th, M1: r.M1, N: -r.N };
  };

  TW.addCalc({
    id: 'edge', topic: 'edge', title: 'Краевой эффект',
    short: 'Податливости, эпюры перемещений, моментов и напряжений у нагруженного края.',
    lead: 'Длинная оболочка вращения (или цилиндр при θ₀ = 90°), нагруженная по краю моментом m₀ и распорной силой N₀. Формулы (4.11)–(4.14). Единицы: мм, МПа, Н/мм.',
    inputs: [
      { section: 'Геометрия и материал' },
      { id: 'R2', label: '$R_2$ на краю (для цилиндра — R)', unit: 'мм', value: 1000 },
      { id: 'th0', label: '$\\theta_0$ — угол нормали с осью', unit: '°', value: 90 },
      { id: 'h', label: 'Толщина $h$', unit: 'мм', value: 10 },
      { id: 'E', label: '$E$', unit: 'МПа', value: 200000 },
      { id: 'mu', label: '$\\mu$', value: 0.3 },
      { id: 'len', label: 'Длина оболочки $l$', unit: 'мм', value: 1000 },
      { section: 'Краевые нагрузки (s = 0)' },
      { id: 'm0', label: 'Момент $m_0$', unit: 'Н·мм/мм', value: 0 },
      { id: 'N0', label: 'Распорная сила $N_0$', unit: 'Н/мм', value: 50 },
    ],
    run(v, out) {
      const el = TW.el;
      const sn = Math.sin(v.th0 * Math.PI / 180), cs = Math.cos(v.th0 * Math.PI / 180);
      const r = v.R2 * sn;
      const D = L.D(v.E, v.h, v.mu), b = L.beta(v.R2, v.h, v.mu);
      const d = L.delta(D, b, sn);
      const e0 = L.startEdge(0, v.m0, v.N0, D, b, sn);
      const lam = b * v.len, appl = Math.sqrt(r * sn / v.h);
      out.append(TW.resTable([
        ['$D$', D, 'Н·мм'], ['$\\beta$', b, '1/мм'], ['$1/\\beta$', 1 / b, 'мм'],
        ['Зона затухания $\\pi/\\beta$', Math.PI / b, 'мм'],
        ['$\\delta_{11}$', d.d11, '1/Н'], ['$\\delta_{12}$', d.d12, 'мм/Н'], ['$\\delta_{22}$', d.d22, 'мм²/Н'],
        ['$\\rho(0)$', e0.rho, 'мм'], ['$\\vartheta(0)$', e0.th, 'рад'],
        ['$\\lambda = \\beta l$', lam, ''], ['$\\sqrt{r\\sin\\theta_0/h}$', appl, ''],
      ]));
      if (lam < 3) out.append(el('div', { class: 'note warn' }, el('div', { class: 'n-title' }, 'Оболочка короткая'), el('div', { html: 'λ < 3: краевые эффекты торцов взаимодействуют, нужны функции Крылова или численный метод. Эпюры ниже — для длинной оболочки.' })));
      if (appl < 3) out.append(el('div', { class: 'note warn' }, el('div', { class: 'n-title' }, 'Теория краевого эффекта неточна'), el('div', { html: '$\\sqrt{r\\sin\\theta_0/h} < 3$ — оболочка пологая или край близко к полюсу.' })));

      const smax = Math.min(v.len, 2 * Math.PI / b);
      const s = TW.linspace(0, smax, 241);
      const res = s.map(x => L.startEdge(x, v.m0, v.N0, D, b, sn));
      const T2 = res.map(q => v.E * v.h * q.rho / r);
      const T1 = res.map(q => q.N * cs);
      const M1 = res.map(q => q.M1);
      const sig = (T, M, k) => T.map((t, i) => t / v.h + k * 6 * M[i] / v.h ** 2);
      out.append(TW.plot({ title: 'Радиальное перемещение ρ, мм', series: [{ x: s, y: res.map(q => q.rho), label: 'ρ' }], xlabel: 's, мм', xname: 's' }));
      out.append(TW.plot({ title: 'Изгибающий момент M₁, Н·мм/мм', series: [{ x: s, y: M1, label: 'M₁' }], xlabel: 's, мм', xname: 's', vlines: [{ x: Math.PI / 4 / b, label: 'βs=π/4' }] }));
      out.append(TW.plot({ title: 'Окружное усилие T₂, Н/мм', series: [{ x: s, y: T2, label: 'T₂' }], xlabel: 's, мм', xname: 's' }));
      out.append(TW.plot({
        title: 'Напряжения от краевого эффекта, МПа (+ наружная, − внутренняя поверхность)', xlabel: 's, мм', xname: 's',
        series: [
          { x: s, y: sig(T1, M1, 1), label: 'σ₁⁺' }, { x: s, y: sig(T1, M1, -1), label: 'σ₁⁻', dash: '5 4' },
          { x: s, y: sig(T2, M1.map(m => v.mu * m), 1), label: 'σ₂⁺' }, { x: s, y: sig(T2, M1.map(m => v.mu * m), -1), label: 'σ₂⁻', dash: '5 4' },
        ],
      }));
      out.append(el('p', { class: 'small muted', html: 'Показаны только напряжения краевого эффекта; безмоментные напряжения нужно добавить (калькулятор «Безмоментная теория»).' }));
    },
  });
})();
