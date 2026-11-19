// Router, sidebar, theme, exam countdown.
(function () {
  const el = TW.el;

  // Build course index: id -> {no, title, partTitle, plan, src}
  TW.course.index = {};
  const order = [];
  TW.course.parts.forEach((part, pi) => {
    part.topics = part.items.map((it, ti) => {
      TW.course.index[it.id] = Object.assign({ no: (pi + 1) + '.' + (ti + 1), partTitle: part.title }, it);
      order.push(it.id);
      return it.id;
    });
  });
  TW.course.neighbours = id => {
    const i = order.indexOf(id);
    return { prev: order[i - 1], next: order[i + 1] };
  };

  TW.daysToExam = function () {
    const d = TW.store.get('examDate', TW.course.examDate);
    if (!d) return null;
    return Math.max(0, Math.ceil((new Date(d + 'T09:00:00') - Date.now()) / 86400000));
  };

  function sidebar(active) {
    const nav = document.getElementById('sidebar');
    nav.innerHTML = '';
    const link = (href, text, cls) => el('a', { href, class: (cls || '') + (active === href ? ' active' : '') }, text);
    nav.append(el('h4', {}, 'Обзор'),
      link('#/', 'Главная'),
      link('#/cards', 'Карточки (повторение)'),
      link('#/formulas', 'Все формулы'),
      link('#/diffs', 'Сверка лекций с книгами'),
      link('#/settings', 'Настройки и прогресс'));
    for (const part of TW.course.parts) {
      nav.append(el('h4', {}, part.title));
      for (const tid of part.topics) {
        const t = TW.topics[tid];
        const meta = TW.course.index[tid];
        const href = '#/topic/' + tid;
        const ready = t && !t.draft;
        const a = el('a', { href, class: (ready ? '' : 'todo') + (active === href ? ' active' : '') },
          el('span', { class: 'num' }, meta.no), el('span', {}, t ? t.title : meta.title),
          ready ? el('span', { class: 'dot' + (TW.progress.score(t) >= 0.999 ? ' done' : '') }) : null);
        nav.append(a);
      }
    }
    nav.append(el('h4', {}, 'Калькуляторы'));
    for (const c of Object.values(TW.calcs)) nav.append(link('#/calc/' + c.id, c.title));
  }

  // Links are written as "#/topic/id/anchor" in the code, but the address uses "#topic--id--anchor":
  // claude.ai artifacts pass only plain "#name" hashes (letters, digits, hyphens) and reserve "#settings".
  TW.hashFor = function (href) {
    const parts = href.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!parts.length) return '#home';
    if (parts[0] === 'settings') parts[0] = 'prefs';
    return '#' + parts.join('--');
  };
  function convertLinks(root) {
    root.querySelectorAll('a[href^="#/"]').forEach(a => { a.setAttribute('href', TW.hashFor(a.getAttribute('href'))); });
  }
  // links created later (cards, hints) are converted on click
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (!a) return;
    e.preventDefault();
    location.hash = TW.hashFor(a.getAttribute('href'));
  });

  function render() {
    const raw = location.hash.replace(/^#\/?/, '');
    let [route, a, b] = raw.includes('/') ? raw.split('/') : raw.split('--');
    if (route === 'home') route = '';
    if (route === 'prefs') route = 'settings';
    const view = document.getElementById('view');
    let node, active = '#/' + (route ? route + (a ? '/' + a : '') : '');
    try {
      switch (route) {
        case '': case undefined: node = TW.views.home(); active = '#/'; break;
        case 'topic': node = TW.views.topic(a); active = '#/topic/' + a; break;
        case 'formulas': node = TW.views.formulas(); break;
        case 'diffs': node = TW.views.diffs(); break;
        case 'quiz': node = TW.views.quiz(a); active = '#/topic/' + a; break;
        case 'problem': node = TW.views.problem(a, b); active = '#/topic/' + (TW.problems[a] || {}).topic; break;
        case 'cards': node = TW.views.cards(a); active = '#/cards'; break;
        case 'calc': node = TW.views.calc(a); break;
        case 'settings': node = TW.views.settings(); break;
        default: node = el('div', { class: 'page' }, el('h1', {}, 'Страница не найдена'));
      }
    } catch (e) {
      console.error(e);
      node = el('div', { class: 'page' }, el('h1', {}, 'Ошибка'), el('pre', {}, e.stack || String(e)));
    }
    view.innerHTML = '';
    view.append(node);
    TW.math(node);
    sidebar(active);
    convertLinks(document.getElementById('sidebar'));
    convertLinks(view);
    document.querySelector('.brand').setAttribute('href', '#home');
    document.getElementById('sidebar').classList.remove('open');
    const days = TW.daysToExam();
    document.getElementById('examCountdown').textContent = days == null ? '' : 'до экзамена ' + days + ' дн.';
    // scroll to anchor (#/topic/id/anchor) or to top
    const anchor = route === 'topic' && b ? document.getElementById(b) : null;
    if (anchor) anchor.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }

  TW.app = { render };

  // theme
  const saved = TW.store.get('theme', null);
  if (saved) document.documentElement.dataset.theme = saved;
  document.getElementById('themeBtn').onclick = () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = dark ? 'light' : 'dark';
    TW.store.set('theme', document.documentElement.dataset.theme);
  };
  document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('open');

  // offline mode on the public site (GitHub Pages); not in local files or the claude.ai version
  if ('serviceWorker' in navigator && location.hostname.endsWith('.github.io')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* works online anyway */ });
  }

  window.addEventListener('hashchange', render);
  render();
})();
