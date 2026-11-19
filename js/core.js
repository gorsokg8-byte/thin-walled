// Shared namespace: content files register topics, calculators and problems here.
window.TW = {
  course: { parts: [] },   // filled by content/course.js
  topics: {},              // id -> topic
  calcs: {},               // id -> calculator
  problems: {},            // id -> problem
  sources: {},             // short source keys -> full names (course.js)

  addTopic(t) { this.topics[t.id] = t; },
  addCalc(c) { this.calcs[c.id] = c; },
  addProblem(p) { this.problems[p.id] = p; },
};

// ---------- DOM helpers ----------
TW.el = function (tag, attrs, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    e.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return e;
};

// Render $...$ and $$...$$ inside an element.
TW.math = function (node) {
  if (!window.renderMathInElement) return;
  renderMathInElement(node, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
    ],
    throwOnError: false,
    strict: false,
    macros: TW.texMacros,
  });
};

TW.tex = function (tex, display) {
  try {
    return katex.renderToString(tex, { displayMode: !!display, throwOnError: false, strict: false, macros: TW.texMacros });
  } catch (e) {
    return '<code>' + tex + '</code>';
  }
};

// \BM, \KE — superscripts "бм" (membrane) and "кэ" (edge effect) used throughout the notes.
TW.texMacros = {
  '\\BM': '^{\\text{бм}}',
  '\\KE': '^{\\text{кэ}}',
};

// Number formatting: engineering-friendly, Russian decimal comma.
TW.fmt = function (x, digits = 4) {
  if (x == null || !isFinite(x)) return '—';
  if (x === 0) return '0';
  const a = Math.abs(x);
  let s;
  if (a >= 1e-3 && a < 1e6) s = Number(x.toPrecision(digits)).toString();
  else s = x.toExponential(digits - 1).replace('e', '·10^').replace('^+', '^');
  return s.replace('.', ',');
};

// ---------- storage (localStorage, failure-tolerant) ----------
TW.store = {
  get(key, def) {
    try {
      const v = localStorage.getItem('tw.' + key);
      return v == null ? def : JSON.parse(v);
    } catch (e) { return def; }
  },
  set(key, val) {
    try { localStorage.setItem('tw.' + key, JSON.stringify(val)); } catch (e) { /* private mode */ }
  },
  exportAll() {
    const out = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith('tw.')) out[k] = localStorage.getItem(k);
      }
    } catch (e) { /* ignore */ }
    return out;
  },
  importAll(obj) {
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('tw.')) try { localStorage.setItem(k, v); } catch (e) { /* ignore */ }
    }
  },
};

// ---------- progress ----------
TW.progress = {
  all() { return TW.store.get('progress', {}); },
  topic(id) { return this.all()[id] || {}; },
  update(id, patch) {
    const all = this.all();
    all[id] = Object.assign(all[id] || {}, patch);
    TW.store.set('progress', all);
  },
  // 0..1: read + quiz + problems, equally weighted where present
  score(topic) {
    const p = this.topic(topic.id);
    const parts = [p.read ? 1 : 0];
    if (topic.quiz && topic.quiz.length) parts.push(Math.min(1, (p.quizBest || 0)));
    const probs = topic.problems || [];
    if (probs.length) parts.push(probs.filter(id => (p.solved || {})[id]).length / probs.length);
    return parts.reduce((a, b) => a + b, 0) / parts.length;
  },
};

// ---------- spaced repetition (simplified SM-2) ----------
TW.sr = {
  state() { return TW.store.get('sr', {}); },
  today() { return Math.floor(Date.now() / 86400000); },
  isDue(id) {
    const s = this.state()[id];
    return !s || s.due <= this.today();
  },
  isNew(id) { return !this.state()[id]; },
  // grade: 0 = again, 1 = hard, 2 = good, 3 = easy
  review(id, grade) {
    const all = this.state();
    const s = all[id] || { ease: 2.5, interval: 0, reps: 0 };
    if (grade === 0) { s.reps = 0; s.interval = 0; s.ease = Math.max(1.3, s.ease - 0.2); }
    else {
      s.reps += 1;
      if (s.reps === 1) s.interval = grade === 3 ? 3 : 1;
      else if (s.reps === 2) s.interval = grade === 1 ? 3 : 6;
      else s.interval = Math.round(s.interval * (grade === 1 ? 1.2 : grade === 3 ? s.ease * 1.3 : s.ease));
      s.ease = Math.max(1.3, s.ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0));
    }
    s.due = this.today() + s.interval;
    all[id] = s;
    TW.store.set('sr', all);
  },
};

// All flashcards: explicit topic cards + one card per named formula.
TW.allCards = function () {
  const cards = [];
  for (const part of TW.course.parts) {
    for (const tid of part.topics) {
      const t = TW.topics[tid];
      if (!t) continue;
      for (const b of t.blocks || []) {
        if (b.t === 'f' && b.name && !b.noCard) {
          cards.push({ id: 'f:' + b.id, topic: tid, front: 'Запишите: ' + b.name, backTex: b.tex, ref: b.id });
        }
      }
      for (const c of t.cards || []) cards.push(Object.assign({ topic: tid }, c));
    }
  }
  return cards;
};

// Seeded random generator for problem variants.
TW.rng = function (seed) {
  let s = seed >>> 0 || 1;
  return function () {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 1e9) / 1e9;
  };
};
TW.pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
TW.round = (x, step) => Math.round(x / step) * step;
