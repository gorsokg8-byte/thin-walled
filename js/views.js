// Page renderers. Each returns a DOM node; app.js puts it into #view.
(function () {
  const el = TW.el;
  const V = (TW.views = {});

  // ---------- sources ----------
  // "bid:153 (6.12)" -> chip linking to the scanned page
  function sourceChip(ref) {
    const m = /^(\w+):(\d+)(?:[-–](\d+))?\s*(.*)$/.exec(ref);
    if (!m) return el('span', { class: 'chip' }, ref);
    const src = TW.sources[m[1]];
    if (!src) return el('span', { class: 'chip' }, ref);
    const pages = m[3] ? m[2] + '–' + m[3] : m[2];
    const text = src.short + ', с. ' + pages + (m[4] ? ' ' + m[4] : '');
    // scans live in _work/ on the PC only; the published (phone) version shows plain chips
    const local = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
    if (!src.dir || !local) return el('span', { class: 'chip', title: src.name }, text);
    const pdfPage = +m[2] + (src.offset || 0);
    const href = src.dir + '/p' + String(pdfPage).padStart(3, '0') + '.png';
    return el('a', { class: 'chip', href, target: '_blank', title: src.name + ' — открыть скан страницы' }, text);
  }
  V.sourceChips = refs => el('div', { class: 'chips' }, (refs || []).map(sourceChip));

  // ---------- blocks ----------
  function formulaBlock(b, topic) {
    const box = el('div', { class: 'formula' + (b.diff ? ' has-diff' : ''), id: b.id });
    box.append(el('div', { class: 'f-head' },
      b.name ? el('span', { class: 'f-name' }, b.name) : null,
      b.no ? el('span', { class: 'f-no' }, '(' + b.no + ')') : null));
    box.append(el('div', { class: 'f-body', html: TW.tex(b.tex, true) }));
    if (b.where) box.append(el('div', { class: 'small muted', html: b.where }));

    const tools = el('div', { class: 'f-tools' });
    let deriv = null;
    if (b.deriv) {
      deriv = el('div', { class: 'deriv hidden' });
      const steps = Array.isArray(b.deriv) ? b.deriv : [b.deriv];
      const ol = el('ol');
      for (const s of steps) {
        const li = el('li');
        if (typeof s === 'string') li.innerHTML = s;
        else {
          if (s.html) li.append(el('div', { html: s.html }));
          if (s.tex) li.append(el('div', { html: TW.tex(s.tex, true) }));
          if (s.why) li.append(el('div', { class: 'why', html: s.why }));
        }
        ol.append(li);
      }
      deriv.append(ol);
      const btn = el('button', { class: 'btn small' }, 'Вывод ▸');
      btn.onclick = () => {
        const open = deriv.classList.toggle('hidden');
        btn.textContent = open ? 'Вывод ▸' : 'Скрыть вывод ▾';
        if (!open && !deriv.dataset.rendered) { TW.math(deriv); deriv.dataset.rendered = 1; }
      };
      tools.append(btn);
    }
    for (const r of b.src || []) tools.append(sourceChip(r));
    if (b.verified) tools.append(el('span', { class: 'chip', title: 'Сверено с книгой' }, '✓ ' + b.verified));
    box.append(tools);
    if (b.diff) box.append(el('div', { class: 'note diff' },
      el('div', { class: 'n-title' }, 'Лекция и литература расходятся'), el('div', { html: b.diff })));
    if (deriv) box.append(deriv);
    return box;
  }

  const NOTE_TITLES = { remark: 'Замечание', warn: 'Внимание', diff: 'Лекция и литература расходятся', extra: 'Для понимания (сверх лекций)' };

  V.block = function (b, topic) {
    switch (b.t) {
      case 'h': return el('h2', { id: b.id || null, html: b.html || b.text });
      case 'h3': return el('h3', { id: b.id || null, html: b.html || b.text });
      case 'p': return el('p', { html: b.html });
      case 'ul': return el('ul', {}, b.items.map(i => el('li', { html: i })));
      case 'ol': return el('ol', {}, b.items.map(i => el('li', { html: i })));
      case 'f': return formulaBlock(b, topic);
      case 'note': return el('div', { class: 'note ' + (b.kind || 'remark') },
        el('div', { class: 'n-title' }, b.title || NOTE_TITLES[b.kind || 'remark']),
        el('div', { html: b.html }),
        b.src ? V.sourceChips(b.src) : null);
      case 'table': {
        const t = el('table');
        if (b.head) t.append(el('tr', {}, b.head.map(h => el('th', { html: h }))));
        for (const r of b.rows) t.append(el('tr', {}, r.map(c => el('td', { html: c }))));
        return el('div', { class: 'tbl-wrap' }, b.caption ? el('div', { class: 'small muted', html: b.caption }) : null, t);
      }
      case 'fig': return el('figure', {},
        el('div', { html: typeof b.svg === 'function' ? b.svg() : b.svg }),
        b.caption ? el('figcaption', { html: b.caption }) : null);
      case 'plot': return b.make();
      case 'calc': {
        const c = TW.calcs[b.id];
        return el('div', { class: 'note extra' }, el('div', { class: 'n-title' }, 'Калькулятор'),
          el('a', { href: '#/calc/' + b.id }, c ? c.title : b.id), b.html ? el('div', { html: b.html }) : null);
      }
      default: return el('div', {}, '[?]');
    }
  };

  // ---------- home ----------
  V.home = function () {
    const page = el('div', { class: 'page' });
    page.append(el('h1', {}, 'Механика тонкостенных конструкций'));
    page.append(el('p', { class: 'lead', html: 'Строительная механика машин, 7-й семестр: оболочки вращения, краевой эффект, численные методы, пластины. Обозначения — как в конспекте лекций, правильность сверена с книгой В.Л. Бидермана и С.В. Бояршинова.' }));

    const topics = TW.course.parts.flatMap(p => p.topics).map(id => TW.topics[id]).filter(Boolean);
    const ready = topics.filter(t => !t.draft);
    const done = ready.filter(t => TW.progress.score(t) >= 0.999).length;
    const cards = TW.allCards();
    const due = cards.filter(c => TW.sr.isDue(c.id) && !TW.sr.isNew(c.id)).length;
    const fresh = cards.filter(c => TW.sr.isNew(c.id)).length;
    const days = TW.daysToExam();

    page.append(el('div', { class: 'grid' },
      el('div', { class: 'card' }, el('div', { class: 'muted small' }, 'До экзамена'), el('div', { class: 'stat' }, days == null ? '—' : days + ' дн.'), el('a', { href: '#/settings', class: 'small' }, 'изменить дату')),
      el('div', { class: 'card' }, el('div', { class: 'muted small' }, 'Темы освоены'), el('div', { class: 'stat' }, done + ' / ' + ready.length),
        el('div', { class: 'bar' }, (() => { const i = el('i'); i.style.width = (ready.length ? 100 * done / ready.length : 0) + '%'; return i; })())),
      el('div', { class: 'card' }, el('div', { class: 'muted small' }, 'Карточки к повторению'), el('div', { class: 'stat' }, String(due)),
        el('a', { href: '#/cards', class: 'small' }, fresh ? 'повторить + ' + fresh + ' новых' : 'повторить'))));

    for (const part of TW.course.parts) {
      page.append(el('h2', { class: 'part-title' }, part.title));
      if (part.note) page.append(el('p', { class: 'muted small', html: part.note }));
      const box = el('div', { class: 'card', style: 'padding:0' });
      for (const tid of part.topics) {
        const t = TW.topics[tid];
        const meta = TW.course.index[tid];
        const title = t ? t.title : meta.title;
        const sc = t && !t.draft ? TW.progress.score(t) : 0;
        box.append(el('div', { class: 'topic-row' },
          el('span', { class: 'muted', style: 'min-width:28px' }, meta.no),
          el('div', { class: 't' }, el('a', { href: '#/topic/' + tid }, title),
            t && !t.draft ? el('div', { class: 'bar', style: 'max-width:220px' }, (() => { const i = el('i'); i.style.width = 100 * sc + '%'; return i; })()) : null),
          t && !t.draft ? el('span', { class: 'badge' + (sc >= 0.999 ? ' ok' : '') }, sc >= 0.999 ? 'освоено' : Math.round(100 * sc) + '%')
            : el('span', { class: 'badge todo' }, 'в разработке')));
      }
      page.append(box);
    }

    page.append(el('h2', {}, 'Инструменты'));
    page.append(el('div', { class: 'grid' },
      Object.values(TW.calcs).map(c => el('a', { class: 'card', href: '#/calc/' + c.id, style: 'text-decoration:none;color:inherit' },
        el('h3', {}, c.title), el('div', { class: 'small muted', html: c.short || '' })))));
    return page;
  };

  // ---------- topic ----------
  V.topic = function (id) {
    const t = TW.topics[id];
    const meta = TW.course.index[id];
    const page = el('div', { class: 'page' });
    if (!meta) return el('div', { class: 'page' }, el('h1', {}, 'Тема не найдена'));
    page.append(el('div', { class: 'muted small' }, meta.partTitle));
    page.append(el('h1', {}, meta.no + '. ' + (t ? t.title : meta.title)));

    if (!t || t.draft) {
      page.append(el('div', { class: 'note warn' }, el('div', { class: 'n-title' }, 'Раздел в разработке'),
        el('div', { html: 'Планируемое содержание: ' + (meta.plan || '') })));
      if (meta.src) page.append(V.sourceChips(meta.src));
      return page;
    }

    if (t.lead) page.append(el('p', { class: 'lead', html: t.lead }));
    page.append(V.sourceChips(t.src));

    const links = el('div', { class: 'btn-row' });
    for (const cid of t.calcs || []) if (TW.calcs[cid]) links.append(el('a', { class: 'btn', href: '#/calc/' + cid }, 'Калькулятор: ' + TW.calcs[cid].title));
    if (t.quiz && t.quiz.length) links.append(el('a', { class: 'btn', href: '#/quiz/' + id }, 'Тест (' + t.quiz.length + ')'));
    for (const pid of t.problems || []) if (TW.problems[pid]) links.append(el('a', { class: 'btn', href: '#/problem/' + pid }, 'Задача: ' + TW.problems[pid].title));
    links.append(el('a', { class: 'btn', href: '#/cards/' + id }, 'Карточки'));
    page.append(links);

    const heads = (t.blocks || []).filter(b => b.t === 'h');
    if (heads.length > 2) {
      page.append(el('ol', { class: 'toc' }, heads.map((h, i) => {
        h.id = h.id || 'sec' + (i + 1);
        return el('li', {}, el('a', { href: '#/topic/' + id + '/' + h.id, html: h.html || h.text }));
      })));
    }
    for (const b of t.blocks || []) page.append(V.block(b, t));

    const prog = TW.progress.topic(id);
    const readBtn = el('button', { class: 'btn' + (prog.read ? '' : ' primary') }, prog.read ? '✓ Прочитано (снять отметку)' : 'Отметить как прочитанное');
    readBtn.onclick = () => { TW.progress.update(id, { read: !TW.progress.topic(id).read }); TW.app.render(); };
    page.append(el('h2', {}, 'Дальше'));
    page.append(el('div', { class: 'btn-row' }, readBtn, links.cloneNode(true).childNodes));
    const nav = TW.course.neighbours(id);
    page.append(el('div', { class: 'btn-row' },
      nav.prev ? el('a', { class: 'btn', href: '#/topic/' + nav.prev }, '← ' + TW.course.index[nav.prev].title) : null,
      nav.next ? el('a', { class: 'btn', href: '#/topic/' + nav.next }, TW.course.index[nav.next].title + ' →') : null));
    return page;
  };

  // ---------- formula index ----------
  V.formulas = function () {
    const page = el('div', { class: 'page' });
    page.append(el('h1', {}, 'Все формулы'));
    page.append(el('p', { class: 'lead' }, 'Поиск по названию и обозначениям. Нажмите на формулу, чтобы открыть её в теории вместе с выводом.'));
    const input = el('input', { class: 'search', placeholder: 'например: податливость, Лапласа, β, Мейсснер' });
    const list = el('div');
    const all = [];
    for (const part of TW.course.parts) for (const tid of part.topics) {
      const t = TW.topics[tid];
      if (!t || t.draft) continue;
      for (const b of t.blocks || []) if (b.t === 'f') all.push({ b, t });
    }
    function draw() {
      const q = input.value.trim().toLowerCase();
      list.innerHTML = '';
      for (const { b, t } of all) {
        const hay = ((b.name || '') + ' ' + b.tex + ' ' + t.title).toLowerCase();
        if (q && !hay.includes(q)) continue;
        list.append(el('a', { class: 'formula', href: '#/topic/' + t.id + '/' + b.id, style: 'display:block;color:inherit;text-decoration:none' },
          el('div', { class: 'f-head' }, el('span', { class: 'f-name' }, b.name || ''), el('span', { class: 'f-no' }, t.title + (b.no ? ', (' + b.no + ')' : ''))),
          el('div', { class: 'f-body', html: TW.tex(b.tex, true) })));
      }
    }
    input.oninput = draw;
    draw();
    page.append(input, list);
    return page;
  };

  // ---------- discrepancies ----------
  V.diffs = function () {
    const page = el('div', { class: 'page' });
    page.append(el('h1', {}, 'Сверка лекций с литературой'));
    page.append(el('p', { class: 'lead' }, 'Все места, где конспект расходится с книгами Бидермана или Бояршинова: опечатки, другие знаки, другие обозначения. Эталон правильности — Бидерман.'));
    let n = 0;
    for (const part of TW.course.parts) for (const tid of part.topics) {
      const t = TW.topics[tid];
      if (!t || t.draft) continue;
      const items = [];
      for (const b of t.blocks || []) {
        if (b.t === 'f' && b.diff) items.push(el('div', { class: 'note diff' },
          el('div', { class: 'n-title' }, el('a', { href: '#/topic/' + tid + '/' + b.id }, b.name || 'Формула ' + (b.no || ''))),
          el('div', { html: b.diff })));
        if (b.t === 'note' && b.kind === 'diff') items.push(V.block(b, t));
      }
      if (items.length) { page.append(el('h2', {}, t.title), items); n += items.length; }
    }
    if (!n) page.append(el('p', {}, 'Пока расхождений не отмечено.'));
    return page;
  };

  // ---------- quiz ----------
  V.quiz = function (id) {
    const t = TW.topics[id];
    const page = el('div', { class: 'page' });
    page.append(el('h1', {}, 'Тест: ' + t.title));
    let answered = 0, right = 0;
    const total = t.quiz.length;
    const score = el('div', { class: 'card' }, 'Ответьте на все вопросы.');
    t.quiz.forEach((q, qi) => {
      const box = el('div', { class: 'q card' });
      box.append(el('div', { html: '<b>' + (qi + 1) + '.</b> ' + q.q }));
      const opts = el('div', { class: 'opts' });
      const ex = el('div', { class: 'explain hidden', html: q.ex || '' });
      q.opts.forEach((o, oi) => {
        const b = el('button', { class: 'btn opt', html: o });
        b.onclick = () => {
          if (box.dataset.done) return;
          box.dataset.done = 1; answered++;
          if (oi === q.a) right++;
          b.classList.add(oi === q.a ? 'right' : 'wrong');
          opts.children[q.a].classList.add('right');
          ex.classList.remove('hidden');
          if (answered === total) {
            const frac = right / total;
            const best = Math.max(frac, TW.progress.topic(id).quizBest || 0);
            TW.progress.update(id, { quizBest: best });
            score.innerHTML = 'Результат: <b>' + right + ' / ' + total + '</b>. Лучший результат: ' + Math.round(best * 100) + '%.';
          }
        };
        opts.append(b);
      });
      box.append(opts, ex);
      page.append(box);
    });
    page.append(score, el('div', { class: 'btn-row' },
      el('a', { class: 'btn', href: '#/topic/' + id }, '← К теории'),
      el('button', { class: 'btn', onclick: () => TW.app.render() }, 'Пройти заново')));
    return page;
  };

  // ---------- problems ----------
  function parseNum(s) {
    s = String(s).trim().replace(',', '.').replace(/\s/g, '').replace('·10^', 'e').replace('*10^', 'e');
    return s === '' ? NaN : Number(s);
  }

  V.problem = function (id, seedStr) {
    const pr = TW.problems[id];
    const page = el('div', { class: 'page' });
    const seed = seedStr ? +seedStr : 1;
    const v = pr.gen(TW.rng(seed * 7919 + 13), seed);
    page.append(el('div', { class: 'muted small' }, 'Задача · вариант ' + seed));
    page.append(el('h1', {}, pr.title));
    page.append(el('div', { class: 'card', html: v.statement }));
    if (v.figure) page.append(el('figure', { html: v.figure }));
    let ok = 0;
    v.steps.forEach((s, i) => {
      const box = el('div', { class: 'step' });
      box.append(el('div', { html: '<b>Шаг ' + (i + 1) + '.</b> ' + s.q }));
      const inp = el('input', { class: 'answer-input', placeholder: 'ответ' + (s.unit ? ', ' + s.unit : '') });
      const msg = el('span', { class: 'small' });
      const hint = el('div', { class: 'explain hidden', html: s.hint ? '<b>Подсказка.</b> ' + s.hint : '' });
      const sol = el('div', { class: 'explain hidden', html: '<b>Решение.</b> ' + (s.sol || '') + ' Ответ: <b>' + TW.fmt(s.ans, 4) + (s.unit ? ' ' + s.unit : '') + '</b>.' });
      const check = el('button', { class: 'btn small primary' }, 'Проверить');
      check.onclick = () => {
        const x = parseNum(inp.value);
        const tol = s.tol || 0.02;
        const good = isFinite(x) && Math.abs(x - s.ans) <= tol * Math.max(Math.abs(s.ans), s.abs || 1e-12);
        box.classList.toggle('ok', good); box.classList.toggle('bad', !good);
        msg.textContent = good ? 'Верно' : 'Неверно (допуск ' + Math.round(tol * 100) + '%)';
        if (good && !box.dataset.ok) {
          box.dataset.ok = 1; ok++;
          if (ok === v.steps.length) {
            const solved = Object.assign({}, TW.progress.topic(pr.topic).solved, { [id]: true });
            TW.progress.update(pr.topic, { solved });
            done.classList.remove('hidden');
          }
        }
      };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') check.onclick(); });
      box.append(el('div', { class: 'ans' }, inp, check,
        s.hint ? el('button', { class: 'btn small', onclick: () => { hint.classList.remove('hidden'); TW.math(hint); } }, 'Подсказка') : null,
        el('button', { class: 'btn small', onclick: () => { sol.classList.remove('hidden'); TW.math(sol); } }, 'Решение'), msg), hint, sol);
      page.append(box);
    });
    const done = el('div', { class: 'note extra hidden' }, el('div', { class: 'n-title' }, 'Задача решена'), el('div', { html: v.summary || 'Все шаги верны.' }));
    page.append(done);
    page.append(el('div', { class: 'btn-row' },
      el('a', { class: 'btn', href: '#/problem/' + id + '/' + (seed + 1) }, 'Новый вариант'),
      el('a', { class: 'btn', href: '#/topic/' + pr.topic }, '← К теории')));
    return page;
  };

  // ---------- flashcards ----------
  V.cards = function (topicId) {
    const page = el('div', { class: 'page' });
    page.append(el('h1', {}, 'Карточки' + (topicId ? ': ' + TW.topics[topicId].title : '')));
    page.append(el('p', { class: 'lead' }, 'Интервальное повторение. Попробуйте вспомнить ответ (лучше — записать на бумаге), потом откройте и честно оцените.'));
    const cards = TW.allCards().filter(c => !topicId || c.topic === topicId);
    const due = cards.filter(c => TW.sr.isDue(c.id) && !TW.sr.isNew(c.id));
    const fresh = cards.filter(c => TW.sr.isNew(c.id)).slice(0, 15);
    const queue = due.concat(fresh);
    const stage = el('div');
    page.append(el('div', { class: 'muted small' }, 'К повторению: ' + due.length + ', новых в этой сессии: ' + fresh.length + ', всего карточек: ' + cards.length), stage);

    function show() {
      stage.innerHTML = '';
      if (!queue.length) {
        stage.append(el('div', { class: 'flash' }, 'На сегодня всё. Возвращайтесь завтра.'));
        return;
      }
      const c = queue[0];
      const back = el('div', { class: 'back hidden' });
      if (c.backTex) back.innerHTML = TW.tex(c.backTex, true);
      if (c.back) back.append(el('div', { html: c.back }));
      if (c.ref) back.append(el('div', { class: 'small' }, el('a', { href: '#/topic/' + c.topic + '/' + c.ref }, 'к выводу')));
      const card = el('div', { class: 'flash' }, el('div', { class: 'muted small' }, TW.topics[c.topic].title), el('div', { html: c.front }), back);
      const grades = el('div', { class: 'btn-row hidden', style: 'justify-content:center' },
        [['Не помню', 0], ['Трудно', 1], ['Помню', 2], ['Легко', 3]].map(([l, g]) =>
          el('button', { class: 'btn' + (g === 2 ? ' primary' : ''), onclick: () => {
            TW.sr.review(c.id, g);
            queue.shift();
            if (g === 0) queue.push(c);
            show();
          } }, l)));
      const reveal = el('div', { class: 'btn-row', style: 'justify-content:center' },
        el('button', { class: 'btn primary', onclick: () => { back.classList.remove('hidden'); TW.math(back); reveal.classList.add('hidden'); grades.classList.remove('hidden'); } }, 'Показать ответ'));
      stage.append(card, reveal, grades, el('div', { class: 'muted small', style: 'text-align:center' }, 'Осталось: ' + queue.length));
      TW.math(card);
    }
    show();
    return page;
  };

  // ---------- calculator ----------
  V.calc = function (id) {
    const c = TW.calcs[id];
    const page = el('div', { class: 'page', style: 'max-width:1100px' });
    page.append(el('h1', {}, c.title));
    if (c.lead) page.append(el('p', { class: 'lead', html: c.lead }));
    const inputs = el('div', { class: 'inputs' });
    const out = el('div', { class: 'outputs' });
    const vals = {};
    const saved = TW.store.get('calc.' + id, {});
    for (const inp of c.inputs) {
      if (inp.section) { inputs.append(el('div', { class: 'small muted', style: 'margin-top:10px', html: inp.section })); continue; }
      vals[inp.id] = saved[inp.id] != null ? saved[inp.id] : inp.value;
      let field;
      if (inp.options) {
        field = el('select', {}, inp.options.map(([v, l]) => el('option', { value: v, selected: String(vals[inp.id]) === String(v) }, l)));
      } else {
        field = el('input', { type: 'text', inputmode: 'decimal', value: String(vals[inp.id]).replace('.', ',') });
      }
      field.addEventListener('input', () => {
        vals[inp.id] = inp.options ? field.value : parseNum(field.value);
        TW.store.set('calc.' + id, vals);
        run();
      });
      inputs.append(el('label', {}, el('span', { html: inp.label + (inp.unit ? ' <span class="unit">' + inp.unit + '</span>' : '') }), field));
    }
    inputs.append(el('button', { class: 'btn small', style: 'margin-top:8px', onclick: () => { TW.store.set('calc.' + id, {}); TW.app.render(); } }, 'Сбросить значения'));
    function run() {
      out.innerHTML = '';
      try {
        c.run(Object.assign({}, vals), out);
      } catch (e) {
        out.append(el('div', { class: 'note warn' }, 'Ошибка расчёта: ' + e.message));
      }
      TW.math(out);
    }
    page.append(el('div', { class: 'calc' }, inputs, out));
    if (c.topic) page.append(el('div', { class: 'btn-row' }, el('a', { class: 'btn', href: '#/topic/' + c.topic }, '← К теории')));
    setTimeout(run, 0);
    return page;
  };

  // Helpers for calculators.
  TW.resTable = function (rows) {
    const t = el('table', { class: 'res-table' });
    for (const [k, v, u] of rows) t.append(el('tr', {}, el('td', { html: k }), el('td', {}, typeof v === 'number' ? TW.fmt(v) : v), el('td', { class: 'muted' }, u || '')));
    return el('div', { class: 'tbl-wrap' }, t);
  };

  // ---------- settings ----------
  V.settings = function () {
    const page = el('div', { class: 'page' });
    page.append(el('h1', {}, 'Настройки и прогресс'));
    const date = el('input', { type: 'date', class: 'answer-input', style: 'max-width:200px', value: TW.store.get('examDate', TW.course.examDate) });
    date.onchange = () => { TW.store.set('examDate', date.value); TW.app.render(); };
    page.append(el('h2', {}, 'Дата экзамена'), date);

    // Transfer as text: downloads and alert() do not work inside a claude.ai artifact.
    page.append(el('h2', {}, 'Перенос прогресса'));
    page.append(el('p', { class: 'small muted' }, 'Прогресс (отметки, тесты, карточки) хранится в браузере этого устройства. Чтобы перенести его на телефон или компьютер: скопируйте текст здесь и вставьте его в то же поле на другом устройстве.'));
    const box = el('textarea', { id: 'progressText', class: 'answer-input', rows: 5, style: 'width:100%;font-family:Consolas,monospace;font-size:12px' });
    const msg = el('span', { class: 'small' });
    const copy = el('button', { class: 'btn', onclick: async () => {
      box.value = JSON.stringify(TW.store.exportAll());
      try { await navigator.clipboard.writeText(box.value); msg.textContent = 'Скопировано в буфер обмена.'; }
      catch (e) { box.select(); msg.textContent = 'Текст выделен — скопируйте его вручную.'; }
    } }, 'Скопировать прогресс');
    const load = el('button', { class: 'btn', onclick: () => {
      try { TW.store.importAll(JSON.parse(box.value)); msg.textContent = 'Прогресс загружен — он виден на главной странице.'; }
      catch (e) { msg.textContent = 'Не получилось прочитать текст: вставьте его целиком, без изменений.'; }
    } }, 'Загрузить из вставленного текста');
    page.append(box, el('div', { class: 'btn-row' }, copy, load, msg));
    return page;
  };
})();
