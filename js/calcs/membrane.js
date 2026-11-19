// Membrane (momentless) solutions for typical shells. Units: mm, MPa, N/mm.
(function () {
  const deg = Math.PI / 180;

  // Each case returns arrays over a meridian parameter: x (for plotting), r, T1, T2.
  const CASES = {
    cyl: {
      name: 'Цилиндр с днищами, давление p', xlabel: 'x, мм',
      make(v) {
        const x = TW.linspace(0, v.L, 50);
        return { x, r: x.map(() => v.R), T1: x.map(() => v.p * v.R / 2), T2: x.map(() => v.p * v.R) };
      },
    },
    sph: {
      name: 'Сфера, давление p', xlabel: 'θ, °',
      make(v) {
        const x = TW.linspace(1, 179, 120);
        return { x, r: x.map(t => v.R * Math.sin(t * deg)), T1: x.map(() => v.p * v.R / 2), T2: x.map(() => v.p * v.R / 2) };
      },
    },
    cone: {
      name: 'Конус, давление p (замкнутая вершина)', xlabel: 's от вершины, мм',
      make(v) {
        const sn = Math.cos(v.alpha * deg); // theta = 90° - alpha: sin(theta) = cos(alpha)
        const x = TW.linspace(v.L / 100, v.L, 100);
        const r = x.map(s => s * Math.sin(v.alpha * deg));
        return { x, r, T1: r.map(q => v.p * q / (2 * sn)), T2: r.map(q => v.p * q / sn) };
      },
    },
    torus: {
      name: 'Тор, давление p', xlabel: 'ψ — угол по окружности трубы от наружного экватора, °',
      make(v) {
        const x = TW.linspace(0, 360, 181);
        const r = x.map(t => v.b + v.a * Math.cos(t * deg));
        return { x, r, T1: r.map(q => v.p * v.a * (q + v.b) / (2 * q)), T2: r.map(() => v.p * v.a / 2) };
      },
    },
    ell: {
      name: 'Эллиптическое днище, давление p', xlabel: 'θ от полюса, °',
      make(v) {
        const a = v.R, b = v.b;
        const x = TW.linspace(0.5, 90, 120);
        const T1 = [], T2 = [], r = [];
        for (const t of x) {
          const s = Math.sin(t * deg), c = Math.cos(t * deg), q = a * a * s * s + b * b * c * c;
          const R1 = a * a * b * b / Math.pow(q, 1.5), R2 = a * a / Math.sqrt(q);
          r.push(R2 * s); T1.push(v.p * R2 / 2); T2.push(v.p * R2 * (1 - R2 / (2 * R1)));
        }
        return { x, r, T1, T2 };
      },
    },
    liq: {
      name: 'Полусфера с жидкостью (θ от нижнего полюса)', xlabel: 'θ, °',
      make(v) {
        const gam = v.dens * 9.81e-9; // N/mm^3
        const x = TW.linspace(0.5, 90, 120);
        const T1 = [], T2 = [], r = [];
        for (const t of x) {
          const c = Math.cos(t * deg), s = Math.sin(t * deg);
          const t1 = gam * v.R * v.R * (1 - c ** 3) / (3 * s * s);
          r.push(v.R * s); T1.push(t1); T2.push(gam * v.R * v.R * c - t1);
        }
        return { x, r, T1, T2 };
      },
    },
    tank: {
      name: 'Вертикальный цилиндр с жидкостью (опирание днищем)', xlabel: 'глубина x, мм',
      make(v) {
        const gam = v.dens * 9.81e-9;
        const x = TW.linspace(0, v.L, 60);
        return { x, r: x.map(() => v.R), T1: x.map(() => 0), T2: x.map(d => gam * v.R * d) };
      },
    },
  };

  TW.addCalc({
    id: 'membrane', topic: 'membrane', title: 'Безмоментная теория',
    short: 'Усилия T₁, T₂, напряжения и радиальное перемещение для типовых оболочек.',
    lead: 'Усилия по (3.1)–(3.2), перемещение ρ = r(T₂ − μT₁)/(Eh). Единицы: мм, МПа, Н/мм. Неиспользуемые для выбранного случая параметры игнорируются.',
    inputs: [
      { id: 'kind', label: 'Оболочка', value: 'cyl', options: Object.entries(CASES).map(([k, c]) => [k, c.name]) },
      { section: 'Параметры' },
      { id: 'R', label: 'Радиус $R$ (у эллипса — полуось $a$)', unit: 'мм', value: 1000 },
      { id: 'h', label: 'Толщина $h$', unit: 'мм', value: 10 },
      { id: 'p', label: 'Давление $p$', unit: 'МПа', value: 1 },
      { id: 'L', label: 'Длина / глубина / образующая', unit: 'мм', value: 2000 },
      { id: 'alpha', label: 'Конус: угол образующей с осью $\\alpha$', unit: '°', value: 30 },
      { id: 'a', label: 'Тор: радиус трубы $a$', unit: 'мм', value: 300 },
      { id: 'b', label: 'Тор: $b$; эллипс: полуось $b$', unit: 'мм', value: 600 },
      { id: 'dens', label: 'Плотность жидкости', unit: 'кг/м³', value: 1000 },
      { id: 'E', label: '$E$', unit: 'МПа', value: 200000 },
      { id: 'mu', label: '$\\mu$', value: 0.3 },
    ],
    run(v, out) {
      const c = CASES[v.kind];
      const d = c.make(v);
      const rho = d.r.map((r, i) => r * (d.T2[i] - v.mu * d.T1[i]) / (v.E * v.h));
      const k = d.T1.length - 1;
      const min = a => Math.min(...a), max = a => Math.max(...a);
      out.append(TW.resTable([
        ['$T_1$ min / max', TW.fmt(min(d.T1)) + ' / ' + TW.fmt(max(d.T1)), 'Н/мм'],
        ['$T_2$ min / max', TW.fmt(min(d.T2)) + ' / ' + TW.fmt(max(d.T2)), 'Н/мм'],
        ['$\\sigma_1$ max = $T_1/h$', max(d.T1.map(Math.abs)) / v.h, 'МПа'],
        ['$\\sigma_2$ max = $T_2/h$', max(d.T2.map(Math.abs)) / v.h, 'МПа'],
        ['$\\rho$ в конце диапазона', rho[k], 'мм'],
      ]));
      if (min(d.T2) < 0 && v.kind !== 'tank') out.append(TW.el('div', { class: 'note warn' }, TW.el('div', { class: 'n-title' }, 'Сжимающее окружное усилие'), TW.el('div', { html: 'Где $T_2 < 0$, оболочка может потерять устойчивость.' })));
      out.append(TW.plot({ title: 'Усилия, Н/мм', xlabel: c.xlabel, series: [{ x: d.x, y: d.T1, label: 'T₁' }, { x: d.x, y: d.T2, label: 'T₂' }] }));
      out.append(TW.plot({ title: 'Радиальное перемещение ρ, мм', xlabel: c.xlabel, series: [{ x: d.x, y: rho, label: 'ρ' }] }));
    },
  });
})();
