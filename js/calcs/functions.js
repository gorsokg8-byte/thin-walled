// Edge-effect functions f1..f4 and Krylov functions K1..K4.
(function () {
  const K = x => {
    const ch = Math.cosh(x), sh = Math.sinh(x), c = Math.cos(x), s = Math.sin(x);
    return { K1: ch * c, K2: (ch * s + sh * c) / 2, K3: sh * s / 2, K4: (ch * s - sh * c) / 4 };
  };
  TW.addCalc({
    id: 'functions', topic: 'edge', title: 'Функции краевого эффекта и Крылова',
    short: 'Графики и значения f₁…f₄ и K₁…K₄ в любой точке.',
    lead: 'f₁…f₄ — для длинных оболочек (4.4), K₁…K₄ — для коротких (4.8). Введите x = βs, чтобы получить значения.',
    inputs: [
      { id: 'x', label: '$x = \\beta s$', value: 0.7854 },
      { id: 'xmax', label: 'Диапазон графика f до', value: 6.2832 },
      { id: 'kmax', label: 'Диапазон графика K до', value: 3 },
    ],
    run(v, out) {
      const f = TW.shellLib.f(v.x), k = K(v.x);
      out.append(TW.resTable([
        ['$f_1 = e^{-x}(\\cos x + \\sin x)$', f.f1], ['$f_2 = e^{-x}(\\cos x - \\sin x)$', f.f2],
        ['$f_3 = e^{-x}\\cos x$', f.f3], ['$f_4 = e^{-x}\\sin x$', f.f4],
        ['$K_1$', k.K1], ['$K_2$', k.K2], ['$K_3$', k.K3], ['$K_4$', k.K4],
      ]));
      const x = TW.linspace(0, v.xmax, 241);
      const F = x.map(TW.shellLib.f);
      out.append(TW.plot({ title: 'Функции краевого эффекта', xlabel: 'x = βs', series: ['f1', 'f2', 'f3', 'f4'].map(n => ({ x, y: F.map(q => q[n]), label: n.replace('f', 'f') })), vlines: [{ x: v.x }] }));
      const xk = TW.linspace(0, v.kmax, 241);
      const KK = xk.map(K);
      out.append(TW.plot({ title: 'Функции Крылова', xlabel: 'x = βs', series: ['K1', 'K2', 'K3', 'K4'].map(n => ({ x: xk, y: KK.map(q => q[n]), label: n })), vlines: [{ x: v.x }] }));
    },
  });
})();
