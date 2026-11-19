(function () {
const R = String.raw;

TW.addTopic({
  id: 'edge',
  title: 'Краевой эффект',
  lead: 'Местный изгиб оболочки у края, стыка или шпангоута. Он затухает на длине порядка $\\sqrt{Rh}$ и описывается тем же уравнением, что и балка на упругом основании. Это главный инструмент ручного расчёта оболочек и основа ДЗ №6.',
  src: ['lec7:13-20', 'lec7:25-28', 'bid:141-150', 'bid:156-168'],
  calcs: ['edge', 'functions'],
  problems: ['p-cyl-edge'],
  blocks: [
    { t: 'h', text: 'Цилиндрическая оболочка: уравнение изгиба' },
    { t: 'p', html: R`Для цилиндра радиуса $R$ постоянной толщины: $\theta = \pi/2$, $r = R_2 = R$, $R_1 = \infty$, $\cos\theta = 0$; координата $s$ (или $x$) — вдоль оси, радиальное перемещение совпадает с нормальным: $\rho = w$.` },
    { t: 'f', id: 'k-cyl-eq', fig: ['ee-strip'], name: 'Уравнение осесимметричного изгиба цилиндра', no: '4.1',
      tex: R`D\frac{d^4w}{ds^4} + \frac{Eh}{R^2}w = q_n - \mu\frac{T_1}{R},\qquad T_1 = \frac{F(s)}{2\pi R}`,
      src: ['bid:143 (3.42)'], verified: 'Бидерман (3.42)',
      deriv: [
        { html: R`Геометрия (2.3)–(2.5) при $\theta = \pi/2$: $\varepsilon_2 = w/R$, $\vartheta = -dw/ds$, $\varkappa_1 = d\vartheta/ds = -w''$, $\varkappa_2 = 0$.` },
        { html: R`Равновесие (2.16): $d(RT_1)/ds + Rq_1 = 0$ — $T_1$ известно из осевого равновесия, $T_1 = F/(2\pi R)$. Уравнение моментов (2.17): $Q = dM_1/ds$. Проекция на нормаль (2.15): $\dfrac{dQ}{ds} = \dfrac{T_2}{R} - q_n$.` },
        { html: R`Исключаем $Q$: $\dfrac{d^2M_1}{ds^2} - \dfrac{T_2}{R} + q_n = 0$ (Бидерман (3.41)).` },
        { html: R`Физика: $M_1 = D\varkappa_1 = -Dw''$, $M_2 = \mu M_1$. Окружное усилие выражаем через $T_1$ и $\varepsilon_2$, исключая $\varepsilon_1$ из двух первых соотношений упругости:`, tex: R`T_2 = \mu T_1 + Eh\,\varepsilon_2 = \mu T_1 + Eh\frac{w}{R}.` },
        { html: R`Подставляем:`, tex: R`-Dw'''' - \frac{\mu T_1}{R} - \frac{Eh}{R^2}w + q_n = 0\ \Rightarrow\ Dw'''' + \frac{Eh}{R^2}w = q_n - \mu\frac{T_1}{R}.` },
      ] },
    { t: 'note', kind: 'warn', title: 'Проверьте знак при μT₁', html: R`Перед $\mu T_1/R$ стоит <b>минус</b>. Проверка через частное решение: при постоянной нагрузке $w_\text{ч} = \dfrac{q_nR^2}{Eh} - \mu\dfrac{T_1R}{Eh}$, а это и есть безмоментное $\rho = R(T_2 - \mu T_1)/(Eh)$ с $T_2 = q_nR$. Физически: осевое растяжение $T_1$ через эффект Пуассона <b>уменьшает</b> радиус. Для цилиндра с днищами получаем $\rho = \frac{pR^2}{Eh}\left(1 - \frac{\mu}{2}\right)$ — совпадает с безмоментной теорией.`, src: ['bid:143 (3.42)'] },
    { t: 'f', id: 'k-beta-cyl', name: 'Коэффициент затухания β', no: '4.2',
      tex: R`4\beta^4 = \frac{Eh}{DR^2} = \frac{12(1-\mu^2)}{R^2h^2},\qquad \beta = \frac{\sqrt[4]{3(1-\mu^2)}}{\sqrt{Rh}}\approx\frac{1{,}285}{\sqrt{Rh}}\ (\mu = 0{,}3)`,
      src: ['lec7:16 (7.2)', 'bid:143'], verified: 'Бидерман, с. 143',
      deriv: [
        { html: R`Делим (4.1) на $D$ и обозначаем коэффициент при $w$ через $4\beta^4$ — так корни характеристического уравнения получаются простыми: $k^4 = -4\beta^4$, $k = \pm\beta(1\pm i)$.` },
        { html: R`Подставляем $D = Eh^3/(12(1-\mu^2))$: $\dfrac{Eh}{DR^2} = \dfrac{12(1-\mu^2)}{h^2R^2}$.` },
        { html: R`Размерность $\beta$ — 1/м. Величина $1/\beta \approx 0{,}78\sqrt{Rh}$ — характерная длина краевого эффекта.` },
      ] },
    { t: 'note', kind: 'extra', title: 'Связь с балкой на упругом основании (5-й семестр)', html: R`Уравнение (4.1) совпадает с уравнением балки на винклеровом основании $EJy'''' + ky = q$, у которой $EJ \to D$, а коэффициент постели $k = Eh/R^2$. «Пружины» основания — это окружные волокна: прогиб $w$ растягивает их на $\varepsilon_2 = w/R$, и они дают отпор $T_2/R = Ehw/R^2$ на единицу площади. Поэтому для цилиндра можно сразу пользоваться решениями и функциями Крылова из темы «Балка на упругом основании».`, src: ['lec5:4-15'] },
    { t: 'f', id: 'k-gen', name: 'Общее решение', no: '4.3',
      tex: R`w = e^{-\beta s}(C_1\cos\beta s + C_2\sin\beta s) + e^{\beta s}(C_3\cos\beta s + C_4\sin\beta s) + w_\text{ч}`,
      src: ['lec7:16 (7.3)', 'bid:144'], verified: 'Бидерман, с. 144',
      deriv: [
        { html: R`Характеристическое уравнение однородного уравнения $k^4 + 4\beta^4 = 0$: $k^4 = 4\beta^4 e^{i\pi}$, корни $k = \sqrt2\beta\, e^{i(\pi/4 + n\pi/2)} = \beta(\pm1\pm i)$.` },
        { html: R`Пары комплексно сопряжённых корней дают $e^{\mp\beta s}\cos\beta s$, $e^{\mp\beta s}\sin\beta s$.` },
        { html: R`<b>Длинная оболочка</b>: при $\beta l > 3$ затухающие решения от левого торца на правом уменьшаются до $e^{-3}\approx 5\%$. Тогда у каждого торца оставляют только своё затухающее решение ($C_3 = C_4 = 0$ для левого края), и торцы рассчитывают независимо.` },
      ] },

    { t: 'h', text: 'Нагружение края моментом и силой' },
    { t: 'p', html: R`Удобно ввести функции краевого эффекта ($x = \beta s$):` },
    { t: 'f', id: 'k-f', name: 'Функции краевого эффекта', no: '4.4',
      tex: R`f_1 = e^{-x}(\cos x + \sin x),\quad f_2 = e^{-x}(\cos x - \sin x),\quad f_3 = e^{-x}\cos x,\quad f_4 = e^{-x}\sin x`,
      where: R`Производные по $x$: $f_1' = -2f_4$, $f_2' = -2f_3$, $f_3' = -f_1$, $f_4' = f_2$. При $x = 0$: $f_1 = f_2 = f_3 = 1$, $f_4 = 0$.`,
      src: ['lec7:16-18'],
      deriv: [
        { html: R`Например, $f_3' = -e^{-x}\cos x - e^{-x}\sin x = -f_1$; $f_4' = -e^{-x}\sin x + e^{-x}\cos x = f_2$.` },
        { html: R`При $x = \pi$ амплитуда $e^{-\pi} = 0{,}043$ — 4,3% от краевого значения. Отсюда длина зоны краевого эффекта $s^* \approx \pi/\beta \approx 2{,}4\sqrt{Rh}$ (при $\mu = 0{,}3$).` },
      ] },
    { t: 'f', id: 'k-m0', fig: ['ee-edge'], name: 'Цилиндр, краевой момент m₀', no: '4.5',
      tex: R`w = -\frac{m_0}{2D\beta^2}f_2(\beta s),\quad \vartheta = -\frac{m_0}{D\beta}f_3,\quad M_1 = m_0 f_1,\quad Q = -2\beta m_0 f_4`,
      where: R`Граничные условия при $s = 0$: $M_1 = m_0$, $Q = 0$. Иначе: $w = -\dfrac{m_0\sqrt2}{2D\beta^2}e^{-\beta s}\cos\left(\beta s + \dfrac\pi4\right)$.`,
      src: ['lec7:17-18', 'bid:146 (3.48)-(3.49)'], verified: 'Бидерман (3.48), (3.49)',
      deriv: [
        { html: R`Длинная оболочка: $w = Ae^{-\beta s}\cos(\beta s + \psi)$. Выражаем через функции: $w = a f_3 + b f_4$.` },
        { html: R`$M_1 = -Dw''$, $Q = -Dw'''$. С правилами дифференцирования: $f_3'' = 2f_4$, $f_4'' = -2f_3$ (по $x$), поэтому $M_1 = -2D\beta^2(af_4 - bf_3)$.` },
        { html: R`$M_1(0) = 2D\beta^2 b = m_0 \Rightarrow b = \dfrac{m_0}{2D\beta^2}$. $Q = M_1' $; $Q(0) = 0$ даёт $a = -b$.` },
        { html: R`Итак, $w = -\dfrac{m_0}{2D\beta^2}(f_3 - f_4) = -\dfrac{m_0}{2D\beta^2}f_2$. Дальше: $\vartheta = -w' = \dfrac{m_0}{2D\beta}f_2' = -\dfrac{m_0}{D\beta}f_3$; $M_1 = -Dw'' = m_0 f_1$; $Q = M_1' = -2\beta m_0 f_4$.` },
      ] },
    { t: 'f', id: 'k-N0', fig: ['ee-edge'], name: 'Цилиндр, краевая сила N₀', no: '4.6',
      tex: R`w = -\frac{N_0}{2D\beta^3}f_3(\beta s),\quad \vartheta = -\frac{N_0}{2D\beta^2}f_1,\quad M_1 = \frac{N_0}{\beta}f_4,\quad Q = N_0 f_2`,
      where: R`Граничные условия при $s = 0$: $M_1 = 0$, $Q = N_0$ (для цилиндра $N = Q$). Наибольший момент — при $\beta s = \pi/4$: $M_{1\max} = 0{,}3224\,N_0/\beta$.`,
      src: ['lec7:17-18', 'bid:147 (3.50)'], verified: 'Бидерман (3.50)',
      deriv: [
        { html: R`Снова $w = af_3 + bf_4$; $M_1(0) = 0$ даёт $b = 0$.` },
        { html: R`$Q = -Dw''' = -Da\beta^3 f_3'''$; $f_3''' = (2f_4)' = 2f_2$, $f_2(0) = 1$: $Q(0) = -2D\beta^3 a = N_0\Rightarrow a = -\dfrac{N_0}{2D\beta^3}$.` },
        { html: R`$\vartheta = -w' = a\beta f_1 = -\dfrac{N_0}{2D\beta^2}f_1$; $M_1 = -Dw'' = -2D\beta^2 a f_4 = \dfrac{N_0}{\beta}f_4$; $Q = N_0f_2$.` },
        { html: R`Максимум $f_4 = e^{-x}\sin x$: $f_4' = f_2 = 0$ при $x = \pi/4$, $f_4(\pi/4) = e^{-\pi/4}/\sqrt2 = 0{,}3224$.` },
      ] },
    { t: 'note', kind: 'remark', html: R`В книге Бидермана в формуле перемещения от силы $Q_0$ (с. 147) пропущен множитель $e^{-\beta s}$: напечатано $\xi = -\frac{Q_0}{2D\beta^3}\cos\beta s$. Значения на краю (3.50) верны. Правильная запись — (4.6).`, src: ['bid:147'] },
    { t: 'f', id: 'k-delta-cyl', name: 'Податливости края цилиндра', no: '4.7',
      tex: R`\begin{Bmatrix}-\vartheta(0)\\ -w(0)\end{Bmatrix} = \begin{bmatrix}\delta_{11} & \delta_{12}\\ \delta_{21} & \delta_{22}\end{bmatrix}\begin{Bmatrix}m_0\\ N_0\end{Bmatrix},\qquad \delta_{11} = \frac{1}{D\beta},\quad \delta_{12} = \delta_{21} = \frac{1}{2D\beta^2},\quad \delta_{22} = \frac{1}{2D\beta^3}`,
      where: R`Индекс 1 — момент и угол поворота, индекс 2 — сила и радиальное перемещение.`,
      src: ['lec7:18-19', 'bid:147 (3.51)'], verified: 'Бидерман (3.51)',
      deriv: [
        { html: R`Из (4.5) при $s = 0$: $\vartheta(0) = -\dfrac{m_0}{D\beta}$, $w(0) = -\dfrac{m_0}{2D\beta^2}$.` },
        { html: R`Из (4.6) при $s = 0$: $\vartheta(0) = -\dfrac{N_0}{2D\beta^2}$, $w(0) = -\dfrac{N_0}{2D\beta^3}$.` },
        { html: R`Складываем (принцип суперпозиции) и меняем знак, чтобы коэффициенты были положительными. $\delta_{12} = \delta_{21}$ — по теореме о взаимности перемещений.` },
      ] },

    { t: 'h', text: 'Короткая цилиндрическая оболочка' },
    { t: 'f', id: 'k-krylov', name: 'Функции Крылова', no: '4.8',
      tex: R`K_1 = \operatorname{ch}x\cos x,\quad K_2 = \tfrac12(\operatorname{ch}x\sin x + \operatorname{sh}x\cos x),\quad K_3 = \tfrac12\operatorname{sh}x\sin x,\quad K_4 = \tfrac14(\operatorname{ch}x\sin x - \operatorname{sh}x\cos x)`,
      where: R`$K_1' = -4K_4$, $K_2' = K_1$, $K_3' = K_2$, $K_4' = K_3$; при $x=0$: $K_1 = 1$, $K_2 = K_3 = K_4 = 0$.`,
      src: ['lec5:8-11', 'bid:147 (3.52)'], verified: 'Бидерман (3.52)',
      deriv: [
        { html: R`При $\beta l < 3$ нужно сохранить и затухающие, и возрастающие решения. Их линейные комбинации, которые при $x = 0$ образуют единичную матрицу (функция и три производные), — функции Крылова.` },
        { html: R`Проверка $K_2' = K_1$: $\tfrac12(\operatorname{sh}x\sin x + \operatorname{ch}x\cos x + \operatorname{ch}x\cos x - \operatorname{sh}x\sin x) = \operatorname{ch}x\cos x$.` },
      ] },
    { t: 'f', id: 'k-init', name: 'Решение в форме начальных параметров', no: '4.9',
      tex: R`w = w_0K_1(x) + \frac{w_0'}{\beta}K_2(x) + \frac{w_0''}{\beta^2}K_3(x) + \frac{w_0'''}{\beta^3}K_4(x) + w_\text{ч},\quad x = \beta s`,
      where: R`Начальные параметры: $w_0' = -\vartheta_0$, $w_0'' = -M_{10}/D$, $w_0''' = -Q_0/D$. Два из них известны из условий на левом торце, два находятся из условий на правом.`,
      src: ['lec5:8-11', 'bid:148'],
      deriv: [
        { html: R`Каждое слагаемое удовлетворяет однородному уравнению. При $s = 0$ первое слагаемое даёт $w_0$, второе — $w_0'$ (так как $K_2'(0) = K_1(0) = 1$), и т. д.` },
      ] },

    { t: 'h', text: 'Краевой эффект в оболочке вращения (Штаерман–Геккелер)' },
    { t: 'p', html: R`Непологая оболочка вращения нагружена по краю силой $N_0$ и моментом $m_0$ ($F = 0$, $q_n = q_1 = 0$). Основное предположение — <b>быстрая изменяемость</b> всех величин вдоль меридиана:` },
    { t: 'f', id: 'k-fast', name: 'Гипотеза быстрой изменяемости', no: '4.10', noCard: true,
      tex: R`\left|\frac{df}{ds}\right| \gg \left|\frac{f}{R}\right|`, src: ['lec7:13 (6.1)'] },
    { t: 'ul', items: [
      R`из $F = 0$: $T_1\sin\theta = Q\cos\theta$, т. е. $T_1 = Q\operatorname{ctg}\theta$, $N = Q/\sin\theta$;`,
      R`$|\varkappa_1|\gg|\varkappa_2|$: $M_1 \approx D\,d\vartheta/ds$, $M_2\approx\mu M_1$;`,
      R`из (2.17): $Q\approx dM_1/ds$; из (2.15): $T_2 \approx R_2\,dQ/ds$, причём $|T_2|\gg|T_1|$;`,
      R`состояние в срединной поверхности близко к одноосному: $T_2 \approx Eh\rho/r$, $\varepsilon_1\approx-\mu\varepsilon_2$;`,
      R`из (2.3), отбросив $\varepsilon_1\cos\theta$: $\vartheta\approx-\dfrac{1}{\sin\theta}\dfrac{d\rho}{ds}$;`,
      'в узкой зоне краевого эффекта геометрию и жёсткости считают постоянными.',
    ] },
    { t: 'f', id: 'k-eq', name: 'Уравнение краевого эффекта', no: '4.11',
      tex: R`\frac{d^4\rho}{ds^4} + 4\beta^4\rho = 0,\qquad 4\beta^4 = \frac{Eh}{DR_2^2},\qquad \beta = \frac{\sqrt[4]{3(1-\mu^2)}}{\sqrt{hR_2}}`,
      src: ['lec7:15 (6.11)', 'lec7:16 (7.2)', 'bid:165'], verified: 'Бидерман, с. 165',
      deriv: [
        { html: R`Собираем цепочку: $T_2 = R_2\dfrac{d^2M_1}{ds^2}$, $M_1 = D\dfrac{d\vartheta}{ds} = -\dfrac{D}{\sin\theta}\dfrac{d^2\rho}{ds^2}$, $T_2 = Eh\dfrac{\rho}{r}$.` },
        { html: R`Подставляем, считая $D$, $R_2$, $\sin\theta$ постоянными в зоне:`, tex: R`-\frac{DR_2}{\sin\theta}\frac{d^4\rho}{ds^4} = \frac{Eh}{r}\rho.` },
        { html: R`Так как $r = R_2\sin\theta$, делим на $-DR_2/\sin\theta$:`, tex: R`\frac{d^4\rho}{ds^4} + \frac{Eh}{DR_2^2}\rho = 0.` },
        { html: R`Цилиндр — частный случай ($R_2 = R$). Роль радиуса цилиндра играет $R_2$: в зоне краевого эффекта оболочка ведёт себя как «эквивалентный цилиндр» радиуса $R_2$ (рисунок на с. 13 конспекта).` },
      ] },
    { t: 'f', id: 'k-chain', name: 'Цепочка расчётных формул', no: '4.12',
      tex: R`\vartheta = -\frac{1}{\sin\theta}\frac{d\rho}{ds},\quad M_1 = -\frac{D}{\sin\theta}\frac{d^2\rho}{ds^2},\quad M_2 = \mu M_1,\quad Q = -\frac{D}{\sin\theta}\frac{d^3\rho}{ds^3},\quad N = \frac{Q}{\sin\theta},\quad T_1 = N\cos\theta,\quad T_2 = \frac{Eh}{r}\rho`,
      src: ['lec7:16 (7.5)-(7.9)'],
      deriv: [
        { html: R`Каждая формула — одно из упрощённых соотношений списка выше. Основные силовые факторы краевого эффекта — $M_1$ и $T_2$: напряжения от них одного порядка, а $T_1$, $Q$ существенно меньше (Бидерман, с. 162).` },
      ] },
    { t: 'f', id: 'k-gen-m0N0', fig: ['ee-shell'], name: 'Решения для оболочки вращения', no: '4.13',
      tex: R`m_0:\ \rho = -\frac{m_0\sin\theta_0}{2D\beta^2}f_2,\quad \vartheta = -\frac{m_0}{D\beta}f_3;\qquad N_0:\ \rho = -\frac{N_0\sin^2\theta_0}{2D\beta^3}f_3,\quad \vartheta = -\frac{N_0\sin\theta_0}{2D\beta^2}f_1`,
      where: R`Условия при $s=0$: для момента $M_1 = m_0$, $N = 0$; для распорной силы $M_1 = 0$, $N = N_0$. $\theta_0$ — угол на краю.`,
      src: ['lec7:17-19', 'bid:164-165 (3.95)'], verified: 'Бидерман, с. 165',
      deriv: [
        { html: R`Та же схема, что в (4.5), (4.6), но $M_1 = -\frac{D}{\sin\theta}\rho''$, $N = -\frac{D}{\sin^2\theta}\rho'''$, $\vartheta = -\frac{1}{\sin\theta}\rho'$.` },
        { html: R`Для момента: $\rho = af_3 + bf_4$, $M_1(0) = \frac{2D\beta^2}{\sin\theta_0}b = m_0$, $N(0) = 0\Rightarrow a = -b$.` },
        { html: R`Для силы: $b = 0$, $N(0) = -\frac{D}{\sin^2\theta_0}a\beta^3\cdot2 = N_0$, $a = -\frac{N_0\sin^2\theta_0}{2D\beta^3}$.` },
      ] },
    { t: 'f', id: 'k-delta', fig: ['ee-shell'], name: 'Податливости края оболочки вращения', no: '4.14',
      tex: R`\delta_{11} = \frac{1}{D\beta},\qquad \delta_{12} = \delta_{21} = \frac{\sin\theta_0}{2D\beta^2},\qquad \delta_{22} = \frac{\sin^2\theta_0}{2D\beta^3}`,
      where: R`$-\vartheta(0) = \delta_{11}m_0 + \delta_{12}N_0$, $-\rho(0) = \delta_{21}m_0 + \delta_{22}N_0$. При $\theta_0 = \pi/2$ — формулы цилиндра (4.7).`,
      src: ['lec7:19', 'lec7:27', 'bid:165 (3.96)'], verified: 'Бидерман (3.96)',
      diff: R`На с. 19 конспекта 7-го семестра записано $\delta_{22} = \dfrac{\sin^2\theta_0}{2D\beta^2}$ — опечатка в степени. Верно $\beta^3$ (Бидерман (3.96); так же на с. 27 конспекта). Проверка размерностью: $\delta_{22}$ связывает перемещение [м] с погонной силой [Н/м], значит $[\delta_{22}] = \text{м}^2/\text{Н}$; $D\beta^3$ имеет размерность $\text{Н}\cdot\text{м}\cdot\text{м}^{-3} = \text{Н/м}^2$ — сходится только с $\beta^3$.`,
      deriv: [
        { html: R`Подставляем $s = 0$ в (4.13): $f_1(0) = f_2(0) = f_3(0) = 1$.` },
        { html: R`Например, от силы: $\rho(0) = -\frac{N_0\sin^2\theta_0}{2D\beta^3}$, $\vartheta(0) = -\frac{N_0\sin\theta_0}{2D\beta^2}$.` },
      ] },
    { t: 'note', kind: 'extra', title: 'Для понимания: уточнённые податливости (Бидерман (3.97))', html: R`Если не отбрасывать слагаемые порядка $\operatorname{ctg}\theta/(\beta R)$, то
$$\delta_{11} = \frac{1}{D\beta_0}\cdot\frac{1}{1 + \frac{\operatorname{ctg}\theta_0}{4\beta_0}\left(\frac1{R_1} + \frac{1-4\mu}{R_2}\right)},\quad \delta_{12} = \frac{\sin\theta_0}{2D\beta_0^2}\cdot\frac{1}{1 + \frac{\operatorname{ctg}\theta_0}{4\beta_0}\left(\frac1{R_1} + \frac{1-4\mu}{R_2}\right)}.$$
Поправка мала, если мала величина $\frac{\operatorname{ctg}\theta_0}{\beta_0 R}$ — то есть для непологих оболочек. Для пологих оболочек (малый $\theta_0$) простые формулы дают заметную ошибку — это и есть ограничение теории краевого эффекта.`, src: ['bid:165-166'] },

    { t: 'h', text: 'Условия применимости' },
    { t: 'f', id: 'k-applic', name: 'Применимость теории краевого эффекта', no: '4.15',
      tex: R`\sqrt{\frac{r\sin\theta}{h}} \gg 1\quad(\text{практически} > 3\ldots4),\qquad \lambda = \int_0^l\beta\,ds > 3\ \text{— оболочка длинная}`,
      src: ['lec7:15-17', 'bid:161'], verified: 'Бидерман, с. 161',
      deriv: [
        { html: R`Условие (4.10) для $f = Ae^{-\beta s}\cos(\beta s + \psi)$: $|df/ds| \sim \sqrt2\beta|f|$, значит нужно $\beta \gg 1/R$.` },
        { html: R`$\beta R_2 = \sqrt[4]{3(1-\mu^2)}\sqrt{R_2/h}$, а $R_2 = r/\sin\theta$. Условие $\beta \gg 1/r$ (характерный радиус — радиус параллели) даёт $\sqrt{r\sin\theta/h}\gg1$.` },
        { html: R`Отсюда: теория применима для <b>непологих</b> оболочек ($\theta$ не мал) вдали от полюса ($r/h$ велико).` },
        { html: R`При переменном $\beta$ в решении $\beta s$ заменяют на $x = \int_0^s\beta\,ds$. Если $\lambda \le 3$, нужны все четыре слагаемых решения (функции Крылова).` },
      ] },
    { t: 'note', kind: 'remark', html: R`Наибольшие напряжения — на кромке, на внутренней или наружной поверхности:
$$\sigma_1 = \frac{T_1}{h}\pm\frac{6M_1}{h^2},\qquad \sigma_2 = \frac{T_2}{h}\pm\frac{6\mu M_1}{h^2}.$$
К ним добавляются безмоментные напряжения. Затухание: на расстоянии $3/\beta \approx 2{,}3\sqrt{Rh}$ от края величины уменьшаются в 20 раз (у Бидермана на с. 146 округлённо $2{,}2\sqrt{Rh}$).`, src: ['bid:146'] },
  ],
  quiz: [
    { q: R`Чему равен $\beta$ для стального цилиндра ($\mu = 0{,}3$) с $R = 1$ м, $h = 1$ см?`, opts: ['1,285 1/м', '12,85 1/м', '128,5 1/м', '0,1285 1/м'], a: 1, ex: R`$\sqrt{Rh} = 0{,}1$ м, $\beta = 1{,}285/0{,}1 = 12{,}85$ 1/м; зона краевого эффекта $\pi/\beta \approx 0{,}24$ м.` },
    { q: 'На какой длине краевой эффект уменьшается до ~4% краевого значения?', opts: [R`$1/\beta$`, R`$\pi/\beta$`, R`$R$`, R`$h$`], a: 1, ex: R`$e^{-\pi}\approx 0{,}043$.` },
    { q: R`Где максимален момент $M_1$ при нагружении края цилиндра силой $N_0$?`, opts: ['На краю', R`При $\beta s = \pi/4$`, R`При $\beta s = \pi/2$`, R`При $\beta s = \pi$`], a: 1, ex: R`$M_1 = (N_0/\beta)e^{-x}\sin x$, максимум при $x = \pi/4$: $0{,}3224N_0/\beta$.` },
    { q: R`Какое из выражений для $\delta_{22}$ верно?`, opts: [R`$\dfrac{\sin^2\theta_0}{2D\beta^2}$`, R`$\dfrac{\sin^2\theta_0}{2D\beta^3}$`, R`$\dfrac{\sin\theta_0}{2D\beta^2}$`, R`$\dfrac{1}{D\beta}$`], a: 1, ex: 'Проверка размерностью: перемещение / погонная сила = м²/Н, а это D·β³ в знаменателе.' },
    { q: 'Основные силовые факторы краевого эффекта:', opts: [R`$T_1$ и $Q$`, R`$M_1$ и $T_2$`, R`$M_2$ и $T_1$`, R`$Q$ и $M_2$`], a: 1, ex: R`$T_2\approx Eh\rho/r$ и $M_1$ дают напряжения одного порядка, остальные меньше.` },
    { q: 'Для какой оболочки теория краевого эффекта даёт большую погрешность?', opts: ['Длинный цилиндр', 'Сфера у экватора', 'Пологий сферический купол у вершины', 'Конус с углом 45° вдали от вершины'], a: 2, ex: R`У пологой оболочки мал $\theta$ и $\sqrt{r\sin\theta/h}$ не велико.` },
    { q: R`Чему аналогично уравнение изгиба цилиндра?`, opts: ['Уравнению колебаний струны', 'Уравнению балки на упругом основании', 'Уравнению Бесселя', 'Уравнению Лапласа'], a: 1, ex: R`$EJ\to D$, коэффициент постели $k = Eh/R^2$ — отпор окружных волокон.` },
    { q: R`Какой знак перед $\mu T_1/R$ в правой части уравнения изгиба цилиндра $Dw'''' + \frac{Eh}{R^2}w = q_n\ \square\ \mu\frac{T_1}{R}$?`, opts: ['плюс', 'минус'], a: 1, ex: 'Осевое растяжение за счёт эффекта Пуассона уменьшает радиус: частное решение должно совпадать с безмоментным ρ = R(T₂ − μT₁)/(Eh).' },
  ],
  cards: [
    { id: 'c-k-1', front: 'Почему краевой эффект «местный»?', back: R`Решения содержат $e^{-\beta s}$ с $\beta\sim 1{,}3/\sqrt{Rh}$: на длине $\pi/\beta\approx2{,}4\sqrt{Rh}$ — малой по сравнению с $R$ — возмущение затухает до 4%.` },
    { id: 'c-k-2', front: 'Перечислите упрощения теории краевого эффекта', back: R`$T_1 = Q\operatorname{ctg}\theta$; $M_1\approx D\vartheta'$, $M_2 = \mu M_1$; $Q\approx M_1'$; $T_2\approx R_2Q'$, $T_2\approx Eh\rho/r$; $\vartheta\approx-\rho'/\sin\theta$; геометрия в зоне постоянна.` },
    { id: 'c-k-3', front: 'Значения функций краевого эффекта и их производные', back: R`$f_1' = -2f_4$, $f_2' = -2f_3$, $f_3' = -f_1$, $f_4' = f_2$; $f_{1,2,3}(0) = 1$, $f_4(0) = 0$; $\max f_4 = 0{,}3224$ при $x = \pi/4$.` },
  ],
});

TW.addProblem({
  id: 'p-cyl-edge', topic: 'edge', title: 'Цилиндр, нагруженный по краю',
  gen(rnd) {
    const Rm = TW.pick(rnd, [500, 600, 800, 1000, 1200]);  // mm
    const h = TW.pick(rnd, [4, 5, 6, 8, 10]);             // mm
    const N0 = TW.pick(rnd, [20, 30, 50, 80, 100]);       // N/mm
    const E = 2e5, mu = 0.3;
    const D = E * h ** 3 / (12 * (1 - mu * mu));
    const beta = Math.pow(3 * (1 - mu * mu), 0.25) / Math.sqrt(Rm * h);
    const d22 = 1 / (2 * D * beta ** 3);
    const Mmax = 0.32239 * N0 / beta;
    return {
      statement: R`Длинная стальная цилиндрическая оболочка ($R = ${Rm}$ мм, $h = ${h}$ мм, $E = 2\cdot10^5$ МПа, $\mu = 0{,}3$) нагружена по свободному краю равномерно распределённой радиальной силой $N_0 = ${N0}$ Н/мм (момент на краю равен нулю). Найдите характеристики краевого эффекта.`,
      steps: [
        { q: R`Цилиндрическая жёсткость $D$`, unit: 'Н·мм', ans: D, sol: R`$D = \frac{Eh^3}{12(1-\mu^2)}$.` },
        { q: R`Коэффициент затухания $\beta$`, unit: '1/мм', ans: beta, sol: R`$\beta = \sqrt[4]{3(1-\mu^2)}/\sqrt{Rh}$.` },
        { q: R`Податливость $\delta_{22}$`, unit: 'мм²/Н', ans: d22, sol: R`$\delta_{22} = 1/(2D\beta^3)$.` },
        { q: R`Модуль радиального перемещения края $|w(0)|$`, unit: 'мм', ans: d22 * N0, sol: R`$|w(0)| = \delta_{22}N_0$.` },
        { q: R`Наибольший изгибающий момент $M_{1\max}$`, unit: 'Н·мм/мм', ans: Mmax, hint: R`$M_1 = (N_0/\beta)f_4(\beta s)$, максимум $f_4$ при $\beta s = \pi/4$.`, sol: R`$M_{1\max} = 0{,}3224N_0/\beta$.` },
        { q: R`Наибольшее напряжение изгиба $6M_{1\max}/h^2$`, unit: 'МПа', ans: 6 * Mmax / h ** 2, sol: 'Изгибная составляющая на поверхности.' },
        { q: R`Окружное мембранное напряжение на краю $\sigma_2 = T_2/h = Ew(0)/R$ (по модулю)`, unit: 'МПа', ans: E * d22 * N0 / Rm, sol: R`$T_2 = Ehw/R$.` },
      ],
      summary: 'Сравните два последних числа: окружное мембранное напряжение на краю больше изгибного — типичная картина при нагружении силой.',
    };
  },
});
})();
