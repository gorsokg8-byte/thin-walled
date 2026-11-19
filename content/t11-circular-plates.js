(function () {
const R = String.raw;

TW.addTopic({
  id: 'circular-plates',
  title: 'Осесимметричный изгиб круглых пластин',
  lead: 'Круглая пластина — предельный случай оболочки вращения ($\\theta = 0$). Задача распадается на изгиб и растяжение в плоскости; изгиб сводится к одному уравнению второго порядка для угла поворота ϑ, которое интегрируется в квадратурах.',
  src: ['lec5:96-97', 'lec5:144-147', 'bid:9-21'],
  calcs: ['circplate', 'shell'],
  problems: ['p-plate'],
  blocks: [
    { t: 'h', text: 'Пластина как предельный случай оболочки' },
    { t: 'p', html: R`Для пластины $ds = dr$, $\theta = 0$, $\cos\theta = 1$, $\sin\theta = 0$, $1/R_1 = 1/R_2 = 0$. Прогиб $w = -\eta$, радиальное перемещение $u = \rho$. Тонкая пластина: $h/R < 0{,}2$ (Бидерман, с. 9). Задача распадается на две независимые: <b>растяжение</b> в плоскости ($u$, $T_1$, $T_2$ — задача Ламе, как для диска) и <b>изгиб</b> ($w$, $\vartheta$, $M_1$, $M_2$, $Q$).` },
    { t: 'f', id: 'cp-kin', fig: ['pl-kirch-r'], name: 'Кинематика и деформации изгиба', no: '11.1',
      tex: R`\frac{dw}{dr} = -\vartheta,\qquad \varepsilon_1 = \zeta\frac{d\vartheta}{dr},\qquad \varepsilon_2 = \zeta\frac{\vartheta}{r}`,
      src: ['lec5:96-97 (22.1)', 'bid:10-11 (1.3)-(1.4)'], verified: 'Бидерман (1.1), (1.3), (1.4)',
      deriv: [
        { html: R`Нормаль поворачивается на угол $\vartheta$ (наклон изогнутой срединной плоскости): $dw = -\vartheta\,dr$.` },
        { html: R`Точка на расстоянии $\zeta$ от срединной плоскости смещается радиально на $u_\zeta = \zeta\vartheta$ (гипотеза прямой нормали).` },
        { html: R`Радиальное волокно: $\varepsilon_1 = du_\zeta/dr = \zeta\vartheta'$. Кольцевое: длина $2\pi r\to2\pi(r + u_\zeta)$, $\varepsilon_2 = u_\zeta/r = \zeta\vartheta/r$. Деформации линейны по толщине, срединная плоскость — нейтральный слой.` },
      ] },
    { t: 'f', id: 'cp-M', name: 'Изгибающие моменты', no: '11.2',
      tex: R`M_1 = D\left(\frac{d\vartheta}{dr} + \mu\frac{\vartheta}{r}\right),\qquad M_2 = D\left(\frac{\vartheta}{r} + \mu\frac{d\vartheta}{dr}\right),\qquad \sigma_{1,2}^{\max} = \pm\frac{6M_{1,2}}{h^2}`,
      src: ['lec5:96 (22.2)-(22.3)', 'bid:12-13 (1.6)'], verified: 'Бидерман (1.6)',
      deriv: [
        { html: R`Это (2.11) оболочки при $\cos\theta = 1$: $\varkappa_1 = \vartheta'$, $\varkappa_2 = \vartheta\cos\theta/r = \vartheta/r$.` },
        { html: R`Или напрямую: $\sigma_1 = \frac{E}{1-\mu^2}(\varepsilon_1 + \mu\varepsilon_2)$, $M_1 = \int\sigma_1\zeta\,d\zeta = \frac{E}{1-\mu^2}\frac{h^3}{12}(\vartheta' + \mu\vartheta/r)$.` },
      ] },
    { t: 'f', id: 'cp-Q', fig: ['pl-circ-core'], name: 'Поперечная сила из равновесия центральной части', no: '11.3',
      tex: R`Q = -\frac{F(r)}{2\pi r},\qquad F(r) = 2\pi\int_{r_0}^{r}q\,r\,dr + P_0`,
      where: R`$F(r)$ — равнодействующая нагрузки на часть пластины внутри радиуса $r$; $P_0 = 2\pi r_0 Q_0$ — сила на внутреннем контуре.`,
      src: ['lec5:96-97 (22.4)', 'bid:13-14 (1.12)-(1.13)'], verified: 'Бидерман (1.13)',
      deriv: [
        { html: R`Вырезаем центральную часть цилиндрическим сечением радиуса $r$ и проектируем силы на ось: поперечная сила на контуре $Q\cdot2\pi r$ уравновешивает нагрузку $F(r)$.` },
        { html: R`То же следует из уравнения $\dfrac{d(rQ)}{dr} + rq = 0$ (проекция на нормаль, (2.15) при $1/R_1 = 1/R_2 = 0$).` },
      ] },
    { t: 'f', id: 'cp-eq', fig: ['pl-circ-elem'], name: 'Уравнение изгиба круглой пластины', no: '11.4',
      tex: R`\frac{d}{dr}\left[\frac1r\frac{d(r\vartheta)}{dr}\right] = \frac{Q}{D} = -\frac{F(r)}{2\pi rD}`,
      src: ['lec5:96', 'bid:17 (1.18)'], verified: 'Бидерман (1.14), (1.18)',
      deriv: [
        { html: R`Уравнение моментов (2.17) при $\cos\theta = 1$: $\dfrac{d(rM_1)}{dr} - M_2 = rQ$.` },
        { html: R`Подставляем моменты (11.2) при $D = \text{const}$:`, tex: R`D\left[\frac{d}{dr}(r\vartheta' + \mu\vartheta) - \frac\vartheta r - \mu\vartheta'\right] = D\left[r\vartheta'' + \vartheta' - \frac{\vartheta}{r}\right] = rQ.` },
        { html: R`Делим на $rD$: $\vartheta'' + \dfrac1r\vartheta' - \dfrac{1}{r^2}\vartheta = \dfrac QD$, а левая часть тождественно равна $\dfrac{d}{dr}\left[\dfrac1r\dfrac{d(r\vartheta)}{dr}\right]$.` },
        { html: R`При переменной толщине появляется слагаемое $\frac{1}{D}\frac{dD}{dr}\left(\vartheta' + \mu\frac\vartheta r\right)$ (Бидерман (1.14)).` },
      ] },
    { t: 'f', id: 'cp-gen', name: 'Общее решение', no: '11.5',
      tex: R`\vartheta = C_1r + \frac{C_2}{r} + \vartheta_\text{ч},\qquad \vartheta_\text{ч} = -\frac{1}{2\pi D}\frac1r\int\left[r\int F(r)\frac{dr}{r}\right]dr,\qquad w = -\int\vartheta\,dr + C_3`,
      src: ['lec5:144-147', 'bid:17 (1.19)-(1.20)'], verified: 'Бидерман (1.19), (1.20)',
      deriv: [
        { html: R`Однородное уравнение: $\frac1r(r\vartheta)' = 2C_1$ → $(r\vartheta)' = 2C_1r$ → $r\vartheta = C_1r^2 + C_2$.` },
        { html: R`Частное решение — двукратным интегрированием правой части. Нижние пределы интегралов произвольны: их изменение меняет только $C_1$, $C_2$.` },
      ] },
    { t: 'table', caption: 'Граничные условия для изгиба', head: ['Край', 'Условия'], rows: [
      ['Заделка', R`$\vartheta = 0$, $w = 0$`],
      ['Шарнирное опирание', R`$M_1 = 0$, $w = 0$`],
      ['Свободный край', R`$M_1 = 0$ (и $Q$ задана через $F$)`],
      ['Центр сплошной пластины', R`$\vartheta(0) = 0$ — $C_2 = 0$`],
      ['Упругое закрепление', R`$\vartheta\pm\delta M_1 = 0$ (плюс — наружный контур)`],
    ] },
    { t: 'h', text: 'Типовые решения: сплошная пластина, равномерная нагрузка q' },
    { t: 'f', id: 'cp-clamped', name: 'Заделка по контуру', no: '11.6',
      tex: R`\vartheta = \frac{qr(R^2 - r^2)}{16D},\quad w = \frac{q(R^2 - r^2)^2}{64D},\quad w_0 = \frac{qR^4}{64D},\quad M_1(R) = -\frac{qR^2}{8},\quad M_1(0) = M_2(0) = \frac{(1+\mu)qR^2}{16}`,
      src: ['bid:18-21'],
      deriv: [
        { html: R`$F = \pi r^2 q$. Частное решение: $\int F\frac{dr}{r} = \frac{\pi qr^2}{2}$, $\int r\cdot\frac{\pi qr^2}{2}dr = \frac{\pi qr^4}{8}$, $\vartheta_\text{ч} = -\frac{1}{2\pi D}\cdot\frac1r\cdot\frac{\pi qr^4}{8} = -\frac{qr^3}{16D}$.` },
        { html: R`Центр: $C_2 = 0$. Заделка $\vartheta(R) = 0$: $C_1 = \frac{qR^2}{16D}$.` },
        { html: R`$w = -\int\vartheta\,dr$ с $w(R) = 0$: $w = \frac{q}{64D}(R^2 - r^2)^2$.` },
        { html: R`Моменты: $\vartheta' = \frac{q}{16D}(R^2 - 3r^2)$, $\frac\vartheta r = \frac{q}{16D}(R^2 - r^2)$; $M_1 = \frac{q}{16}[(1+\mu)R^2 - (3+\mu)r^2]$. На контуре $M_1 = -qR^2/8$ — наибольший по модулю.` },
      ] },
    { t: 'f', id: 'cp-ss', name: 'Шарнирное опирание по контуру', no: '11.7',
      tex: R`w_0 = \frac{(5+\mu)qR^4}{64(1+\mu)D},\qquad M_1(0) = M_2(0) = \frac{(3+\mu)qR^2}{16},\qquad M_1(R) = 0`,
      src: ['bid:19-21'],
      deriv: [
        { html: R`$\vartheta = C_1r - \frac{qr^3}{16D}$; $M_1(R) = D\left[C_1(1+\mu) - \frac{q(3+\mu)R^2}{16D}\right] = 0$ → $C_1 = \frac{(3+\mu)qR^2}{16(1+\mu)D}$.` },
        { html: R`$w_0 = \int_0^R\vartheta\,dr = \frac{C_1R^2}{2} - \frac{qR^4}{64D} = \frac{qR^4}{64D}\left[\frac{2(3+\mu)}{1+\mu} - 1\right] = \frac{(5+\mu)qR^4}{64(1+\mu)D}$.` },
        { html: R`При $\mu = 0{,}3$ прогиб в 4,08 раза больше, чем при заделке; наибольший момент — в центре, $0{,}206\,qR^2$ против $0{,}125\,qR^2$ на контуре заделанной пластины.` },
      ] },
    { t: 'note', kind: 'extra', title: 'Пластина в составной конструкции', html: R`На стыке с оболочкой пластина работает и на изгиб (момент $m$, угол $\vartheta$), и на растяжение в своей плоскости (распорная сила $N$, перемещение $\rho$). Растяжение — задача Ламе: $T_1 = C_5 + C_6/r^2$, $T_2 = C_5 - C_6/r^2$, $\rho = r(T_2 - \mu T_1)/(Eh)$. Так считается ДЗ №6 вариант 4 (сферический резервуар с удерживающей кольцевой пластиной).`, src: ['dz6:3'] },
  ],
  quiz: [
    { q: 'Чему равен прогиб в центре защемлённой круглой пластины под равномерной нагрузкой?', opts: [R`$qR^4/(64D)$`, R`$qR^4/(8D)$`, R`$5qR^4/(384D)$`, R`$qR^2/(16D)$`], a: 0, ex: R`$w = q(R^2 - r^2)^2/(64D)$.` },
    { q: 'Где наибольший момент в защемлённой пластине?', opts: ['В центре', 'На контуре', 'На r = R/2', 'Везде одинаков'], a: 1, ex: R`$|M_1(R)| = qR^2/8 > M(0) = 1{,}3qR^2/16$.` },
    { q: R`Что даёт условие в центре сплошной пластины?`, opts: [R`$C_1 = 0$`, R`$C_2 = 0$`, R`$w = 0$`, R`$M = 0$`], a: 1, ex: R`$\vartheta(0)$ конечен (и равен нулю), а $C_2/r\to\infty$.` },
    { q: 'Во сколько раз прогиб шарнирно опёртой пластины больше, чем защемлённой (μ = 0,3)?', opts: ['1,3', '2', '4,08', '8'], a: 2, ex: R`$(5+\mu)/(1+\mu) = 4{,}08$.` },
    { q: 'Какое уравнение описывает изгиб круглой пластины?', opts: [R`$\frac{d}{dr}\left[\frac1r\frac{d(r\vartheta)}{dr}\right] = \frac QD$`, R`$D w'''' + kw = q$`, 'Уравнение Бесселя', 'Уравнение Лапласа'], a: 0, ex: 'Второй порядок относительно ϑ.' },
  ],
  cards: [
    { id: 'c-cp-1', front: 'Защемлённая круглая пластина под q: прогиб и моменты', back: R`$w_0 = qR^4/(64D)$; $M_1(R) = -qR^2/8$; $M(0) = (1+\mu)qR^2/16$.` },
    { id: 'c-cp-2', front: 'Шарнирно опёртая круглая пластина под q', back: R`$w_0 = \frac{(5+\mu)qR^4}{64(1+\mu)D}$; $M(0) = \frac{(3+\mu)qR^2}{16}$.` },
  ],
});

TW.addProblem({
  id: 'p-plate', topic: 'circular-plates', title: 'Круглая пластина под давлением',
  gen(rnd) {
    const Rm = TW.pick(rnd, [100, 150, 200, 250, 300]);
    const h = TW.pick(rnd, [4, 5, 6, 8, 10]);
    const q = TW.pick(rnd, [0.1, 0.2, 0.3, 0.5]);
    const clamped = rnd() < 0.5;
    const E = 2e5, mu = 0.3, D = E * h ** 3 / (12 * (1 - mu * mu));
    const w0 = clamped ? q * Rm ** 4 / (64 * D) : (5 + mu) * q * Rm ** 4 / (64 * (1 + mu) * D);
    const Mmax = clamped ? q * Rm * Rm / 8 : (3 + mu) * q * Rm * Rm / 16;
    return {
      statement: R`Стальная круглая пластина радиуса $R = ${Rm}$ мм, толщины $h = ${h}$ мм (${clamped ? 'защемлена' : 'шарнирно оперта'} по контуру) нагружена давлением $q = ${String(q).replace('.', '{,}')}$ МПа. $E = 2\cdot10^5$ МПа, $\mu = 0{,}3$.`,
      steps: [
        { q: R`Цилиндрическая жёсткость $D$`, unit: 'Н·мм', ans: D, sol: R`$D = Eh^3/(12(1-\mu^2))$.` },
        { q: R`Прогиб в центре $w_0$`, unit: 'мм', ans: w0, sol: clamped ? R`$w_0 = qR^4/(64D)$.` : R`$w_0 = \frac{(5+\mu)qR^4}{64(1+\mu)D}$.` },
        { q: R`Наибольший по модулю изгибающий момент`, unit: 'Н·мм/мм', ans: Mmax, hint: clamped ? 'На контуре.' : 'В центре.', sol: clamped ? R`$qR^2/8$ на контуре.` : R`$(3+\mu)qR^2/16$ в центре.` },
        { q: R`Наибольшее напряжение $6M_{\max}/h^2$`, unit: 'МПа', ans: 6 * Mmax / h ** 2, sol: 'На поверхности пластины.' },
      ],
      summary: R`Сравните $w_0$ с толщиной: если прогиб больше $\sim h/4$, линейная теория даёт заметную ошибку — нужна теория гибких пластин (Бидерман, §9).`,
    };
  },
});
})();
