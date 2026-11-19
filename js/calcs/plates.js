// Plate calculators: axisymmetric circular plate (closed form) and Navier series for a rectangular plate.
(function () {
  TW.addCalc({
    id: 'circplate', topic: 'circular-plates', title: 'Круглая пластина',
    short: 'Сплошная круглая пластина под равномерной нагрузкой: заделка или шарнир.',
    lead: 'Формулы (11.6), (11.7). Единицы: мм, МПа, Н/мм.',
    inputs: [
      { id: 'sup', label: 'Опирание', value: 'clamped', options: [['clamped', 'Заделка'], ['ss', 'Шарнир']] },
      { id: 'R', label: 'Радиус $R$', unit: 'мм', value: 200 },
      { id: 'h', label: 'Толщина $h$', unit: 'мм', value: 6 },
      { id: 'q', label: 'Давление $q$', unit: 'МПа', value: 0.2 },
      { id: 'E', label: '$E$', unit: 'МПа', value: 200000 },
      { id: 'mu', label: '$\\mu$', value: 0.3 },
    ],
    run(v, out) {
      const D = TW.shellLib.D(v.E, v.h, v.mu), k = v.q / (16 * D), mu = v.mu, R = v.R;
      const C1 = v.sup === 'clamped' ? k * R * R : (3 + mu) * k * R * R / (1 + mu);
      const r = TW.linspace(0, R, 201);
      const w = r.map(x => C1 * (R * R - x * x) / 2 - k * (R ** 4 - x ** 4) / 4);
      const M1 = r.map(x => D * (C1 * (1 + mu) - k * x * x * (3 + mu)));
      const M2 = r.map(x => D * (C1 * (1 + mu) - k * x * x * (1 + 3 * mu)));
      const Mmax = Math.max(...M1.concat(M2).map(Math.abs));
      out.append(TW.resTable([
        ['$D$', D, 'Н·мм'],
        ['Прогиб в центре $w_0$', w[0], 'мм'],
        ['$w_0/h$', w[0] / v.h, ''],
        ['$M_1 = M_2$ в центре', M1[0], 'Н·мм/мм'],
        ['$M_1$ на контуре', M1[200], 'Н·мм/мм'],
        ['Наибольшее напряжение $6M_{\\max}/h^2$', 6 * Mmax / v.h ** 2, 'МПа'],
      ]));
      if (w[0] > v.h / 4) out.append(TW.el('div', { class: 'note warn' }, TW.el('div', { class: 'n-title' }, 'Большой прогиб'), TW.el('div', { html: 'Прогиб больше четверти толщины — линейная теория неточна (нужна теория гибких пластин).' })));
      out.append(TW.plot({ title: 'Прогиб w, мм', xlabel: 'r, мм', xname: 'r', series: [{ x: r, y: w, label: 'w' }] }));
      out.append(TW.plot({ title: 'Моменты, Н·мм/мм', xlabel: 'r, мм', xname: 'r', series: [{ x: r, y: M1, label: 'M₁ (радиальный)' }, { x: r, y: M2, label: 'M₂ (окружной)' }] }));
    },
  });

  TW.addCalc({
    id: 'navier', topic: 'plate-theory', title: 'Прямоугольная пластина (Навье)',
    short: 'Шарнирно опёртая прямоугольная пластина под равномерной нагрузкой — двойной ряд Фурье.',
    lead: 'Формула (12.8). Для квадратной пластины проверка: w_max·D/(qa⁴) = 0,00406, M·/(qa²) = 0,0479 (μ = 0,3).',
    inputs: [
      { id: 'a', label: 'Сторона $a$', unit: 'мм', value: 400 },
      { id: 'b', label: 'Сторона $b$', unit: 'мм', value: 400 },
      { id: 'h', label: 'Толщина $h$', unit: 'мм', value: 6 },
      { id: 'q', label: 'Давление $q$', unit: 'МПа', value: 0.05 },
      { id: 'E', label: '$E$', unit: 'МПа', value: 200000 },
      { id: 'mu', label: '$\\mu$', value: 0.3 },
      { id: 'nmax', label: 'Членов ряда (нечётные до)', value: 79 },
    ],
    run(v, out) {
      const D = TW.shellLib.D(v.E, v.h, v.mu), a = v.a, b = v.b, mu = v.mu, P = Math.PI;
      const at = (x, y) => {
        let w = 0, wxx = 0, wyy = 0;
        for (let m = 1; m <= v.nmax; m += 2) for (let n = 1; n <= v.nmax; n += 2) {
          const am = m * P / a, bn = n * P / b;
          const c = 16 * v.q / (P ** 6 * D) / (m * n * Math.pow(m * m / (a * a) + n * n / (b * b), 2));
          const s = Math.sin(am * x) * Math.sin(bn * y);
          w += c * s; wxx -= c * am * am * s; wyy -= c * bn * bn * s;
        }
        return { w, Mx: -D * (wxx + mu * wyy), My: -D * (wyy + mu * wxx) };
      };
      const c0 = at(a / 2, b / 2);
      out.append(TW.resTable([
        ['$D$', D, 'Н·мм'],
        ['Прогиб в центре $w_{\\max}$', c0.w, 'мм'],
        ['$w_{\\max}D/(qa^4)$', c0.w * D / (v.q * a ** 4), ''],
        ['$M_x$ в центре', c0.Mx, 'Н·мм/мм'], ['$M_x/(qa^2)$', c0.Mx / (v.q * a * a), ''],
        ['$M_y$ в центре', c0.My, 'Н·мм/мм'], ['$M_y/(qa^2)$', c0.My / (v.q * a * a), ''],
        ['Наибольшее напряжение в центре', 6 * Math.max(Math.abs(c0.Mx), Math.abs(c0.My)) / v.h ** 2, 'МПа'],
      ]));
      const xs = TW.linspace(0, a, 61);
      const line = xs.map(x => at(x, b / 2));
      out.append(TW.plot({ title: 'Прогиб по линии y = b/2, мм', xlabel: 'x, мм', xname: 'x', series: [{ x: xs, y: line.map(q => q.w), label: 'w' }] }));
      out.append(TW.plot({ title: 'Моменты по линии y = b/2, Н·мм/мм', xlabel: 'x, мм', xname: 'x', series: [{ x: xs, y: line.map(q => q.Mx), label: 'Mx' }, { x: xs, y: line.map(q => q.My), label: 'My' }] }));
    },
  });
})();
