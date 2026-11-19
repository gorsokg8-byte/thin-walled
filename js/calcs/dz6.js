// ДЗ №6, variant 4: spherical tank with liquid hanging on an annular plate. Branched FEM (js/fem-tree.js).
// Dimensionless: h = E = γ = 1 (results in the report's units γR², γR²h, γR²/h, γR³/(Eh), γR²/(Eh)).
(function () {
  const REPORT = { rho: 0.02396, th: 160.57, Mv: -5.561, Mn: 5.363, M: 10.925, N: 0.0720, s1v: 33.54, s1n: 33.01, spR: -16.42, sp2R: -15.82 };

  TW.addCalc({
    id: 'dz6', topic: 'dz6', title: 'ДЗ №6: сфера с жидкостью + пластина (МКЭ)',
    short: 'Независимый расчёт варианта 4 коническими элементами с ветвлением; сравнение с отчётом.',
    lead: 'Верхняя и нижняя полусферы толщины h и кольцевая пластина толщины kh (от R до R_нар, заделка) соединены жёстким узлом. Нагрузка — гидростатическое давление, уровень у верхнего полюса. Безразмерно: h = E = γ = 1. Знаки приведены к правилу знаков отчёта.',
    inputs: [
      { id: 'Rh', label: '$R/h$', value: 50 },
      { id: 'k', label: 'Толщина пластины, в долях $h$', value: 2 },
      { id: 'out', label: 'Наружный радиус пластины, в долях $R$', value: 2 },
      { id: 'mu', label: '$\\mu$', value: 0.3 },
      { id: 'n', label: 'Элементов на полусферу', value: 400 },
    ],
    run(v, out) {
      const R = v.Rh, h = 1, mu = v.mu, n = Math.max(50, Math.min(1200, v.n | 0));
      const sph = (a, b) => t => { const th = a + t * (b - a); return { r: R * Math.sin(th), z: R * (1 - Math.cos(th)) }; };
      const res = TW.femTree({ E: 1, mu, pFn: (r, z) => z, branches: [
        { name: 'upper', from: 'top', to: 'J', n, pt: sph(0, Math.PI / 2), h1: h, h2: h, grade: 'end' },
        { name: 'plate', from: 'J', to: 'wall', n: Math.max(40, Math.round(n / 4)), pt: t => ({ r: R + t * (v.out - 1) * R, z: R }), h1: v.k * h, h2: v.k * h, grade: 'both', pFn: null },
        { name: 'lower', from: 'J', to: 'bot', n, pt: sph(Math.PI / 2, Math.PI), h1: h, h2: h, grade: 'start' },
      ], fix: { top: [0, 2], bot: [0, 2], wall: [0, 1, 2] } });
      const J = res.disp(res.keyIdx.J);
      const u = res.at('J', 'upper'), l = res.at('J', 'lower'), p = res.at('J', 'plate'), pw = res.at('wall', 'plate');
      const kp = v.k * h;
      const sc = { rho: R ** 3, th: R * R, M: R * R, T: R * R, s: R * R };
      const val = {
        rho: J.rho / sc.rho, th: -J.th / sc.th, W: -J.eta / sc.rho,
        Mv: u.M1 / sc.M, Mn: l.M1 / sc.M, M: -p.M1 / sc.M, N: -p.T1 / sc.T,
        s1v: (u.T1 - 6 * u.M1) / sc.s, s1n: (l.T1 + 6 * l.M1) / sc.s,
        spR: (p.T1 / kp + 6 * p.M1 / kp ** 2) / sc.s, sp2R: (pw.T1 / kp - 6 * pw.M1 / kp ** 2) / sc.s,
      };
      const std = v.Rh === 50 && v.k === 2 && v.out === 2 && v.mu === 0.3;
      const rows = [
        ['ρ узла, $\\gamma R^3/(Eh)$', 'rho'], ['ϑ узла, $\\gamma R^2/(Eh)$', 'th'], ['$M_в$, $\\gamma R^2h$', 'Mv'], ['$M_н$, $\\gamma R^2h$', 'Mn'],
        ['$M$ (на пластину), $\\gamma R^2h$', 'M'], ['$N$ (на пластину), $\\gamma R^2$', 'N'],
        ['$\\sigma_1$ верх, внутр., $\\gamma R^2/h$', 's1v'], ['$\\sigma_1$ низ, нар., $\\gamma R^2/h$', 's1n'],
        ['$\\sigma_{1пл}$ при $r = R$, верх', 'spR'], ['$\\sigma_{1пл}$ у заделки, низ', 'sp2R'],
      ];
      const t = TW.el('table', { class: 'res-table' }, TW.el('tr', {}, TW.el('th', {}, 'Величина'), TW.el('th', {}, 'МКЭ приложения'), std ? TW.el('th', {}, 'Отчёт (Годунов)') : null, std ? TW.el('th', {}, 'Разница') : null));
      for (const [lab, key] of rows) {
        t.append(TW.el('tr', {}, TW.el('td', { html: lab }), TW.el('td', {}, TW.fmt(val[key], 5)),
          std ? TW.el('td', {}, TW.fmt(REPORT[key], 5)) : null,
          std ? TW.el('td', {}, (100 * (val[key] - REPORT[key]) / REPORT[key]).toFixed(2).replace('.', ',') + ' %') : null));
      }
      out.append(TW.el('div', { class: 'tbl-wrap' }, t));
      out.append(TW.resTable([
        ['Проверка равновесия моментов в узле: $M_в - M_\\text{пл} - M_н$ (в осях МКЭ)', (u.M1 - p.M1 - l.M1) / sc.M, '$\\gamma R^2h$'],
        ['Осадка узла $W$', val.W, '$\\gamma R^3/(Eh)$'],
      ]));

      const lim = 40;
      const up = res.along('upper', 0.5).map(q => Object.assign(q, { s: R * (1 - q.t) * Math.PI / 2 })).filter(q => q.s <= lim).reverse();
      const lo = res.along('lower', 0.5).map(q => Object.assign(q, { s: R * q.t * Math.PI / 2 })).filter(q => q.s <= lim);
      out.append(TW.plot({ title: 'M₁ в полусферах, γR²h (s* — от стыка к полюсу, в долях h)', xlabel: 's*/h', xname: 's*',
        series: [{ x: up.map(q => q.s), y: up.map(q => q.M1 / sc.M), label: 'верхняя' }, { x: lo.map(q => q.s), y: lo.map(q => q.M1 / sc.M), label: 'нижняя' }] }));
      out.append(TW.plot({ title: 'σ₁ на поверхностях, γR²/h', xlabel: 's*/h', xname: 's*', height: 280,
        series: [
          { x: up.map(q => q.s), y: up.map(q => (q.T1 - 6 * q.M1) / sc.s), label: 'верх, вн.' }, { x: up.map(q => q.s), y: up.map(q => (q.T1 + 6 * q.M1) / sc.s), label: 'верх, нар.', dash: '5 4' },
          { x: lo.map(q => q.s), y: lo.map(q => (q.T1 + 6 * q.M1) / sc.s), label: 'низ, нар.' }, { x: lo.map(q => q.s), y: lo.map(q => (q.T1 - 6 * q.M1) / sc.s), label: 'низ, вн.', dash: '5 4' },
        ] }));
      const pl = res.along('plate', 0.5).map(q => Object.assign(q, { r: 1 + q.t * (v.out - 1) }));
      out.append(TW.plot({ title: 'Пластина: M₁ (знак отчёта), γR²h', xlabel: 'r/R', xname: 'r/R',
        series: [{ x: pl.map(q => q.r), y: pl.map(q => -q.M1 / sc.M), label: 'M₁пл' }] }));
    },
  });
})();
