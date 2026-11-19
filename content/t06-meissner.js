(function () {
const R = String.raw;

TW.addTopic({
  id: 'meissner',
  title: 'Уравнения Мейсснера',
  lead: 'Э. Мейсснер (1913) свёл систему шестого порядка осесимметричной оболочки вращения к двум уравнениям второго порядка — для угла поворота ϑ и силовой функции V = QR₂. Отсюда следуют и решение для конуса через функции Бесселя, и теория краевого эффекта.',
  src: ['lec7:3-9', 'bid:151-156'],
  blocks: [
    { t: 'h', text: 'Основные неизвестные' },
    { t: 'p', html: R`Мейсснер выбирает две функции: <b>кинематическую</b> — угол поворота нормали $\vartheta$, и <b>силовую</b> $V = QR_2$. Через $\vartheta$ выражаются моменты $M_1$, $M_2$; через $V$ — усилия $T_1$, $T_2$. Толщина постоянная: $D = \text{const}$, $Eh = \text{const}$.` },
    { t: 'f', id: 'ms-L', name: 'Оператор Мейсснера', no: '6.1',
      tex: R`L(f) = \frac{d^2f}{ds^2} + \frac{\cos\theta}{r}\frac{df}{ds} - \frac{\cos^2\theta}{r^2}f`,
      src: ['lec7:4 (2.2)', 'bid:152'], verified: 'Бидерман, с. 152',
      deriv: [ { html: R`Оператор появляется сам при подстановке моментов в уравнение равновесия моментов (вывод ниже). Для цилиндра ($\cos\theta = 0$) $L(f) = f''$.` } ] },
    { t: 'f', id: 'ms-eq1', name: 'Первое уравнение Мейсснера (равновесие моментов)', no: '6.2',
      tex: R`L(\vartheta) - \frac{\mu}{R_1R_2}\vartheta = \frac{V}{DR_2}`,
      src: ['lec7:4 (2.3)', 'bid:152 (3.63)', 'bid:153 (3.68)'], verified: 'Бидерман (3.63), (3.68)',
      deriv: [
        { html: R`Уравнение моментов (2.17): $\dfrac{d(rM_1)}{ds} - M_2\cos\theta - rQ = 0$, где $M_1 = D\left(\vartheta' + \mu\dfrac{\cos\theta}{r}\vartheta\right)$, $M_2 = D\left(\dfrac{\cos\theta}{r}\vartheta + \mu\vartheta'\right)$, $rQ = \dfrac{rV}{R_2} = V\sin\theta$.` },
        { html: R`Раскрываем, используя $r' = \cos\theta$ и $(\cos\theta)' = -\sin\theta/R_1$:`, tex: R`r\vartheta'' + \cos\theta\,\vartheta' - \mu\frac{\sin\theta}{R_1}\vartheta + \mu\cos\theta\,\vartheta' - \frac{\cos^2\theta}{r}\vartheta - \mu\cos\theta\,\vartheta' = \frac{V\sin\theta}{D}.` },
        { html: R`Слагаемые $\pm\mu\cos\theta\,\vartheta'$ сокращаются. Делим на $r = R_2\sin\theta$:`, tex: R`\vartheta'' + \frac{\cos\theta}{r}\vartheta' - \frac{\cos^2\theta}{r^2}\vartheta - \frac{\mu}{R_1R_2}\vartheta = \frac{V}{DR_2}.` },
      ] },
    { t: 'f', id: 'ms-forces', name: 'Усилия через силовую функцию V', no: '6.3',
      tex: R`Q = \frac{V}{R_2},\qquad T_1 = T_1\BM + \frac{\cos\theta}{r}V,\qquad T_2 = T_2\BM + \frac{dV}{ds}`,
      src: ['lec7:4-5 (2.4)-(2.5)', 'bid:155 (3.74)'], verified: 'Бидерман (3.74)',
      deriv: [
        { html: R`Из интегрального уравнения (2.18): $T_1 = \dfrac{F}{2\pi r\sin\theta} + Q\operatorname{ctg}\theta = T_1\BM + \dfrac{V\cos\theta}{R_2\sin\theta} = T_1\BM + \dfrac{V\cos\theta}{r}$.` },
        { html: R`Из уравнения (2.15): $T_2 = R_2\left[q_n - \dfrac{T_1}{R_1} + \dfrac1r\dfrac{d(rQ)}{ds}\right]$, и $\dfrac{d(rQ)}{ds} = \dfrac{d(V\sin\theta)}{ds} = V'\sin\theta + \dfrac{V\cos\theta}{R_1}$.` },
        { html: R`Подставляем $T_1$: слагаемые с $\dfrac{R_2V\cos\theta}{rR_1}$ взаимно уничтожаются, $\dfrac{R_2\sin\theta}{r} = 1$, остаётся $T_2 = R_2\left(q_n - \dfrac{T_1\BM}{R_1}\right) + V' = T_2\BM + V'$.` },
      ] },
    { t: 'f', id: 'ms-eq2', name: 'Второе уравнение Мейсснера (совместность деформаций)', no: '6.4',
      tex: R`L(V) + \frac{\mu}{R_1R_2}V = -\frac{Eh}{R_2}\left(\vartheta - \vartheta\BM\right)`,
      src: ['lec7:5 (2.9)', 'bid:153 (3.68)'], verified: 'Бидерман (3.68)',
      deriv: [
        { html: R`Деформации по (6.3): $\varepsilon_1 = \varepsilon_1\BM + \dfrac{1}{Eh}\left(\dfrac{\cos\theta}{r}V - \mu V'\right)$, $\varepsilon_2 = \varepsilon_2\BM + \dfrac{1}{Eh}\left(V' - \mu\dfrac{\cos\theta}{r}V\right)$.` },
        { html: R`Уравнение совместности (2.7): $\dfrac{d(r\varepsilon_2)}{ds} = \varepsilon_1\cos\theta - \vartheta\sin\theta$, где $r\varepsilon_2 = \rho\BM + \dfrac1{Eh}(rV' - \mu\cos\theta\,V)$.` },
        { html: R`Дифференцируем; слагаемые $-\mu\cos\theta\,V'/(Eh)$ появляются в обеих частях и сокращаются:`, tex: R`\frac{1}{Eh}\left(rV'' + \cos\theta\,V' + \mu\frac{\sin\theta}{R_1}V - \frac{\cos^2\theta}{r}V\right) = \varepsilon_1\BM\cos\theta - \frac{d\rho\BM}{ds} - \vartheta\sin\theta.` },
        { html: R`Правая часть равна $\sin\theta(\vartheta\BM - \vartheta)$ по (3.4). Умножаем на $Eh/r$ и учитываем $\sin\theta/r = 1/R_2$ — получаем (6.4).` },
      ] },
    { t: 'note', kind: 'remark', html: R`Система (6.2), (6.4) — четвёртого порядка: к ней добавляются $F(s)$ (известна) и осевое перемещение, которое находится квадратурой. Граничные условия ставятся на $\vartheta$ или $M_1$ и на $\rho$ или $N$ — по два на торце (Бидерман, с. 153).`, src: ['bid:153'] },
    { t: 'f', id: 'ms-rho', name: 'Радиальное перемещение через V', no: '6.5',
      tex: R`\rho = \rho\BM + \frac{r}{Eh}\left(\frac{dV}{ds} - \mu\frac{\cos\theta}{r}V\right)`,
      src: ['lec7:5 (2.8)', 'bid:155 (3.74)'], verified: 'Бидерман (3.74)',
      deriv: [ { html: R`$\rho = r\varepsilon_2$ с $\varepsilon_2$ из вывода (6.4).` } ] },

    { t: 'h', text: 'Структура решения' },
    { t: 'p', html: R`Решение = частное решение неоднородной системы + общее решение однородной. При плавном меридиане и медленно меняющейся нагрузке частным решением служит <b>безмоментное</b>:` },
    { t: 'f', id: 'ms-part', name: 'Частное решение', no: '6.6',
      tex: R`\vartheta_\text{ч} = \vartheta\BM,\qquad V_\text{ч} = 0`,
      src: ['lec7:6', 'bid:154 (3.69)'], verified: 'Бидерман (3.69)',
      deriv: [
        { html: R`При $V = 0$, $\vartheta = \vartheta\BM$ второе уравнение (6.4) выполняется тождественно.` },
        { html: R`В первом (6.2) остаётся $L(\vartheta\BM) - \frac{\mu}{R_1R_2}\vartheta\BM = 0$ — невязка от моментов, которые даёт безмоментный поворот. При плавной нагрузке она мала (см. критерий Бидермана в теме «Безмоментная теория»), и ею пренебрегают.` },
      ] },
    { t: 'p', html: R`Однородная система ($F = 0$, $q_n = q_1 = 0$) описывает состояние от краевых нагрузок — это и есть краевые эффекты.` },

    { t: 'h', text: 'Комплексное уравнение' },
    { t: 'f', id: 'ms-complex', name: 'Сведение к одному комплексному уравнению', no: '6.7',
      tex: R`\sigma = \vartheta + i\frac{\sqrt{12(1-\mu^2)}}{Eh^2}V,\qquad L(\sigma) + i\frac{\sqrt{12(1-\mu^2)}}{hR_2}\sigma = 0`,
      where: R`После решения: $\vartheta = \operatorname{Re}\sigma$, $V = \dfrac{Eh^2}{\sqrt{12(1-\mu^2)}}\operatorname{Im}\sigma$.`,
      src: ['lec7:6-9', 'bid:154-155 (3.70)-(3.73)'], verified: 'Бидерман (3.71)–(3.73)',
      deriv: [
        { html: R`Умножим однородное уравнение (6.4) на постоянную $a$ и сложим с (6.2):`, tex: R`L(\vartheta + aV) = \left(\frac{\mu}{R_1R_2} - a\frac{Eh}{R_2}\right)\vartheta + \left(\frac{1}{R_2D} - a\frac{\mu}{R_1R_2}\right)V.` },
        { html: R`Подберём $a$ так, чтобы правая часть была пропорциональна $\vartheta + aV$: отношение коэффициентов при $V$ и $\vartheta$ должно быть равно $a$. Это даёт квадратное уравнение`, tex: R`Eh\,a^2 - \frac{2\mu}{R_1}a + \frac1D = 0,\qquad a = \frac{\mu}{R_1Eh}\pm\sqrt{\frac{\mu^2}{R_1^2E^2h^2} - \frac{1}{DEh}}.` },
        { html: R`Отношение слагаемых под корнем $\dfrac{\mu^2}{12(1-\mu^2)}\left(\dfrac{h}{R_1}\right)^2$ — величина порядка $(h/R)^2$; слагаемое $\dfrac{\mu}{R_1Eh}$ имеет порядок $h/R$ относительно корня. С точностью теории оболочек (погрешность гипотез $\sim h/R$):`, tex: R`a = i\sqrt{\frac{1}{DEh}} = i\frac{\sqrt{12(1-\mu^2)}}{Eh^2}.` },
        { html: R`Множитель правой части $\dfrac{\mu}{R_1R_2} - a\dfrac{Eh}{R_2} \approx -i\dfrac{\sqrt{12(1-\mu^2)}}{hR_2}$ — получаем (6.7).` },
        { html: R`Для цилиндра и конуса ($1/R_1 = 0$) квадратное уравнение даёт ровно $a = \pm i/\sqrt{DEh}$, и переход точный.` },
      ] },
    { t: 'note', kind: 'extra', title: 'Для понимания: откуда краевой эффект', html: R`Бидерман (§14) делает в (6.7) замену переменных, после которой уравнение принимает вид $\sigma_1'' + (2i - f(x))\sigma_1 = 0$, где $x = \int\beta\,ds$, а $f(x)$ — слагаемое, зависящее от изменения геометрии. Для непологой тонкой оболочки $|f| \ll 2$, и его отбрасывают. Остаётся уравнение с постоянными коэффициентами, решения которого — $e^{\pm x}\cos x$, $e^{\pm x}\sin x$. Это и есть решение теории краевого эффекта. Так теория краевого эффекта оказывается асимптотикой уравнений Мейсснера при $\beta R\to\infty$.`, src: ['bid:157-160'] },
  ],
  quiz: [
    { q: 'Какие функции — основные неизвестные Мейсснера?', opts: [R`$\rho$ и $\eta$`, R`$\vartheta$ и $V = QR_2$`, R`$T_1$ и $T_2$`, R`$M_1$ и $M_2$`], a: 1, ex: 'Кинематическая и силовая функции.' },
    { q: R`Чему равен $T_2$ через силовую функцию?`, opts: [R`$T_2\BM + V'$`, R`$T_2\BM + V\cos\theta/r$`, R`$V/R_2$`, R`$Eh\vartheta$`], a: 0, ex: R`Из уравнения проекций на нормаль: $T_2 = T_2\BM + dV/ds$.` },
    { q: 'Почему безмоментное решение можно взять за частное решение уравнений Мейсснера?', opts: ['Оно точно удовлетворяет обоим уравнениям', R`Второе уравнение выполняется тождественно, а невязка первого мала при плавной нагрузке`, 'Так проще', 'Потому что V = 0 всегда'], a: 1, ex: 'Остаётся малая невязка от моментов безмоментного поворота.' },
    { q: 'Для каких оболочек переход к комплексному уравнению точен?', opts: ['Для сферы', 'Для тора', 'Для цилиндра и конуса', 'Для любых'], a: 2, ex: R`При $1/R_1 = 0$ квадратное уравнение для $a$ даёт ровно $a = \pm i/\sqrt{DEh}$.` },
    { q: 'Какого порядка система Мейсснера?', opts: ['Второго', 'Четвёртого', 'Шестого', 'Восьмого'], a: 1, ex: 'Два уравнения второго порядка; осевое перемещение — квадратурой, F(s) известна.' },
  ],
  cards: [
    { id: 'c-ms-1', front: 'Запишите оба уравнения Мейсснера', back: R`$L(\vartheta) - \frac{\mu}{R_1R_2}\vartheta = \frac{V}{DR_2}$; $L(V) + \frac{\mu}{R_1R_2}V = -\frac{Eh}{R_2}(\vartheta - \vartheta\BM)$.` },
  ],
});
})();
