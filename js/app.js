import * as D from './data.js';
import { haptic, screenLock } from './haptics.js';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const SESSION_SIZE = 20;
const SESSION_CAP = 400;
const DAY_MS = 86400000;
const DETAIL_DAYS = 90;
const SR_STEPS = [7, 30, 90, 180];

const K = {
  settings: 'mentalgym:v1:settings',
  sessions: 'mentalgym:v1:sessions',
  daily: 'mentalgym:v1:daily',
  sr: 'mentalgym:v1:seen',
  schema: 'mentalgym:v1:schema',
};

const SCHEMA_VERSION = 1;

const MODES = {
  fluency: {
    key: 'fluency',
    name: 'Fluidez dual',
    rule: 'Genera una palabra que cumpla las dos condiciones a la vez.',
    paces: [3000, 2500, 2000],
  },
  remote: {
    key: 'remote',
    name: 'Asociaciones',
    rule: 'Encuentra la palabra que conecta las tres.',
    paces: [5000, 4000, 3000],
  },
  inhibit: {
    key: 'inhibit',
    name: 'Anti-cliché',
    rule: 'Asocia libremente, pero sin usar ninguna palabra prohibida.',
    paces: [4000, 3000, 2500],
  },
  switch: {
    key: 'switch',
    name: 'Alternancia',
    rule: 'La regla cambia en cada turno. Léela antes de responder.',
    paces: [3500, 2500, 2000],
  },
};

const MODE_KEYS = ['fluency', 'remote', 'inhibit', 'switch'];

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const $ = (selector) => document.querySelector(selector);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

const sum = (values) => values.reduce((total, value) => total + value, 0);

function dayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

const DEFAULT_SETTINGS = { level: 2, haptics: true, announce: false };

let settings = { ...DEFAULT_SETTINGS, ...read(K.settings, {}) };
let sessions = read(K.sessions, []);
let daily = read(K.daily, {});
let seen = read(K.sr, {});

if (!Array.isArray(sessions)) sessions = [];
if (!daily || typeof daily !== 'object') daily = {};
if (!seen || typeof seen !== 'object') seen = {};

/**
 * Migration hook. Version 1 only normalizes shapes, which is what protects the
 * boot from a partially written or hand-edited storage. Future versions branch
 * on `stored` before reaching the write below.
 */
function migrate() {
  const stored = read(K.schema, 0);
  if (stored === SCHEMA_VERSION) return;

  sessions = sessions.filter((entry) => entry && Array.isArray(entry.items));
  write(K.sessions, sessions);
  write(K.daily, daily);
  write(K.sr, seen);
  write(K.settings, settings);
  write(K.schema, SCHEMA_VERSION);
}

/* ------------------------------------------------------------------ */
/* Session state                                                       */
/* ------------------------------------------------------------------ */

const S = {
  ex: null,
  level: 2,
  items: [],
  index: 0,
  onset: 0,
  playing: false,
  locked: true,
  resolved: false,
  results: [],
  chain: { rule: null },
  used: new Set(),
  timer: 0,
  timeoutId: 0,
  committed: true,
  record: null,
};

/* ------------------------------------------------------------------ */
/* DOM references                                                      */
/* ------------------------------------------------------------------ */

const ui = {
  app: $('.app'),
  railLabel: $('#rail-label'),
  railValue: $('#rail-value'),
  exit: $('#btn-exit'),
  stage: $('#stage'),
  stageRule: $('#stage-rule'),
  stageMode: $('#stage-mode'),
  stageContent: $('#stage-content'),
  stageChips: $('#stage-chips'),
  pressure: $('#pressure'),
  pressureFill: $('#pressure-fill'),
  countdown: $('#countdown'),
  countdownRule: $('#countdown-rule'),
  countdownNumber: $('#countdown-number'),
  deckNote: $('#deck-note'),
  tap: $('#btn-tap'),
  toast: $('#toast'),
};

/* ------------------------------------------------------------------ */
/* Item builders                                                       */
/* ------------------------------------------------------------------ */

const ANCHORS = D.SWITCH_WORDS.filter((word) => 'aeolnr'.includes(word.slice(-1)));

function levelsUpTo(pool, level) {
  const out = [];
  for (let index = 1; index <= level; index += 1) {
    if (pool[index]) out.push(...pool[index]);
  }
  return out;
}

function baseItem(ex, level, extra) {
  return {
    ex,
    pace: MODES[ex].paces[level - 1],
    rule: null,
    main: null,
    sub: null,
    chips: [],
    banned: [],
    words: null,
    answers: [],
    srId: null,
    meta: {},
    ...extra,
  };
}

function buildFluency(level) {
  const categories = levelsUpTo(D.CATEGORIES, level);
  const attributes = levelsUpTo(D.ATTRIBUTES, level);
  const letter = pick(D.LETTERS);

  // Harder levels lean on attributes: a semantic constraint is slower to
  // verify than a category membership.
  const attributeWeight = level === 1 ? 0.4 : level === 2 ? 0.5 : 0.65;

  if (Math.random() < attributeWeight) {
    return baseItem('fluency', level, { main: letter, chips: [pick(attributes)] });
  }
  return baseItem('fluency', level, { main: letter, chips: [pick(categories)] });
}

function pickSpaced(list, idOf, used) {
  const now = Date.now();
  const available = list.filter((entry) => !used.has(idOf(entry)));
  const source = available.length ? available : list;

  const due = [];
  const fresh = [];

  source.forEach((entry) => {
    const id = idOf(entry);
    const record = seen[id];
    if (!record) fresh.push({ entry, id });
    else if (record.due <= now) due.push({ entry, id, due: record.due });
  });

  if (due.length) {
    due.sort((a, b) => a.due - b.due);
    return pick(due.slice(0, 5));
  }
  if (fresh.length) return pick(fresh);

  const fallback = source.map((entry) => {
    const id = idOf(entry);
    return { entry, id, last: seen[id] ? seen[id].last : 0 };
  });
  fallback.sort((a, b) => a.last - b.last);
  return fallback[0];
}

function buildRemote(level) {
  const pool = D.RAT.filter((entry) => entry.level <= level);
  const chosen = pickSpaced(pool, (entry) => `rat:${entry.cue.join('|')}`, S.used);
  S.used.add(chosen.id);

  return baseItem('remote', level, {
    words: chosen.entry.cue,
    answers: chosen.entry.answers,
    srId: chosen.id,
  });
}

function buildInhibit(level) {
  const pool = D.INHIBIT.filter((entry) => entry.level <= level);
  const chosen = pickSpaced(pool, (entry) => `inh:${entry.word}`, S.used);
  S.used.add(chosen.id);

  return baseItem('inhibit', level, {
    main: chosen.entry.word,
    banned: chosen.entry.banned,
    srId: chosen.id,
  });
}

function nextRule(previous) {
  if (!previous) return pick(D.SWITCH_RULES);
  const others = D.SWITCH_RULES.filter((rule) => rule !== previous);
  return Math.random() < 0.7 ? pick(others) : previous;
}

function buildSwitch(level) {
  const previous = S.chain.rule;
  const rule = nextRule(previous);
  const switched = previous !== null && rule !== previous;
  S.chain.rule = rule;

  const meta = { rule, switched };

  if (rule === 'phonetic') {
    return baseItem('switch', level, {
      main: pick(ANCHORS),
      rule: 'Empieza por su última letra',
      meta,
    });
  }
  if (rule === 'antonym') {
    const pair = pick(D.ANTONYMS);
    return baseItem('switch', level, {
      main: pair.word,
      rule: 'Di el contrario',
      answers: pair.answers,
      meta,
    });
  }
  return baseItem('switch', level, {
    main: pick(D.SWITCH_OBJECTS),
    rule: 'Di para qué sirve',
    meta,
  });
}

function makeItem(ex, level) {
  if (ex === 'fluency') return buildFluency(level);
  if (ex === 'remote') return buildRemote(level);
  if (ex === 'inhibit') return buildInhibit(level);
  return buildSwitch(level);
}

function buildSession(ex, level, size) {
  S.used = new Set();
  const items = [];

  if (ex !== 'mix') {
    for (let index = 0; index < size; index += 1) items.push(makeItem(ex, level));
    return items;
  }

  const order = [];
  while (order.length < size) order.push(...shuffle(MODE_KEYS.slice()));
  for (let index = 0; index < size; index += 1) items.push(makeItem(order[index], level));
  return items;
}

/* ------------------------------------------------------------------ */
/* Rendering the stimulus                                              */
/* ------------------------------------------------------------------ */

function itemLabel(item) {
  if (item.words) {
    const answer = item.answers.length ? ` → ${item.answers[0]}` : '';
    return `${item.words.join(', ')}${answer}`;
  }
  const base = item.main || '';
  if (item.banned.length) return `${base} (sin ${item.banned.join(', ')})`;
  if (item.chips.length) return `${base} — ${item.chips.join(', ')}`;
  return base;
}

function paintItem(item) {
  ui.stageMode.hidden = S.ex !== 'mix';
  ui.stageMode.textContent = ui.stageMode.hidden ? '' : MODES[item.ex].name;

  ui.stageRule.hidden = !item.rule;
  ui.stageRule.textContent = item.rule || '';

  const nodes = [];
  if (item.words) {
    const list = el('div', 'stage__words');
    item.words.forEach((word) => list.append(el('span', 'stage__word', word)));
    nodes.push(list);
  } else if (item.main) {
    const main = el('p', 'stage__main', item.main);
    if (item.main.length === 1) main.classList.add('stage__main--letter');
    nodes.push(main);
  }
  ui.stageContent.replaceChildren(...nodes);
  ui.stageContent.classList.toggle('stage__content--cue', Boolean(item.words));

  const chips = [];
  item.chips.forEach((chip) => chips.push(el('span', 'chip', chip)));
  if (item.banned.length) {
    item.banned.forEach((word) => chips.push(el('span', 'chip chip--banned', word)));
  }
  ui.stageChips.replaceChildren(...chips);
  ui.stageChips.hidden = chips.length === 0;
}

function armPressure(pace) {
  ui.pressure.className = 'pressure';
  void ui.pressure.offsetWidth;
  ui.pressure.classList.add(`pressure--pace-${pace}`, 'pressure--running');
}

/* ------------------------------------------------------------------ */
/* Session engine                                                      */
/* ------------------------------------------------------------------ */

function startSession(ex) {
  S.ex = ex;
  S.level = settings.level;
  S.chain = { rule: null };
  S.items = buildSession(ex, S.level, SESSION_SIZE);
  S.index = 0;
  S.results = [];
  S.committed = false;
  S.playing = true;
  S.locked = true;
  S.resolved = false;

  S.record = {
    id: String(Date.now()),
    ex,
    level: S.level,
    pace: median(S.items.map((item) => item.pace)),
    startedAt: Date.now(),
    endedAt: null,
    items: [],
    summary: null,
  };

  ui.exit.hidden = false;
  ui.railLabel.textContent = ex === 'mix' ? 'Sesión mixta' : MODES[ex].name;
  ui.railValue.textContent = `0 / ${S.items.length}`;
  ui.app.classList.add('is-playing');

  showView('play');
  screenLock.hold();
  runCountdown();
}

function runCountdown() {
  ui.countdown.hidden = false;
  ui.countdownRule.textContent =
    S.ex === 'mix'
      ? 'Cuatro ejercicios alternados. La etiqueta sobre el estímulo te dice cuál toca.'
      : MODES[S.ex].rule;

  let value = 3;
  ui.countdownNumber.textContent = String(value);
  ui.countdownNumber.classList.remove('countdown__number--beat');
  void ui.countdownNumber.offsetWidth;
  ui.countdownNumber.classList.add('countdown__number--beat');

  window.clearInterval(S.timer);
  S.timer = window.setInterval(() => {
    value -= 1;
    if (value === 0) {
      window.clearInterval(S.timer);
      S.timer = 0;
      ui.countdown.hidden = true;
      S.playing = true;
      S.resolved = false;
      renderItem();
      return;
    }
    ui.countdownNumber.textContent = String(value);
    ui.countdownNumber.classList.remove('countdown__number--beat');
    void ui.countdownNumber.offsetWidth;
    ui.countdownNumber.classList.add('countdown__number--beat');
  }, 650);
}

function renderItem() {
  const item = S.items[S.index];
  S.locked = true;
  S.resolved = false;
  ui.deckNote.textContent = '';
  ui.railValue.textContent = `${S.index + 1} / ${S.items.length}`;
  ui.stage.classList.remove('stage--confirm', 'stage--expired');
  paintItem(item);

  requestAnimationFrame(() => {
    if (!S.playing) return;
    S.onset = performance.now();
    S.locked = false;
    armPressure(item.pace);
    window.clearTimeout(S.timeoutId);
    S.timeoutId = window.setTimeout(onExpire, item.pace + 120);
  });
}

function onTap() {
  if (!S.playing || S.locked || S.resolved) return;
  const rt = Math.round(performance.now() - S.onset);
  settle({ rt, omission: false });
}

function onExpire() {
  if (!S.playing || S.locked || S.resolved) return;
  settle({ rt: null, omission: true });
}

function settle(entry) {
  S.resolved = true;
  S.locked = true;
  window.clearTimeout(S.timeoutId);
  S.timeoutId = 0;

  const item = S.items[S.index];

  S.record.items.push({
    rt: entry.rt,
    omission: entry.omission,
    ok: !entry.omission,
    ex: item.ex,
    rule: item.meta.rule || null,
    switched: Boolean(item.meta.switched),
    srId: item.srId,
    label: itemLabel(item),
  });

  if (item.srId) markSeen(item.srId);

  if (entry.omission) {
    haptic.timeout(settings.haptics);
    ui.stage.classList.add('stage--expired');
    ui.deckNote.textContent = 'Tiempo agotado';
    ui.pressure.classList.add('pressure--frozen');
  } else {
    haptic.confirm(settings.haptics);
    ui.stage.classList.add('stage--confirm');
    ui.deckNote.textContent = `${entry.rt} ms`;
    ui.pressure.classList.add('pressure--frozen');
  }

  S.index += 1;
  const isLast = S.index >= S.items.length;

  window.setTimeout(() => {
    if (!S.playing) return;
    if (isLast) finishSession();
    else renderItem();
  }, 240);
}

function markSeen(id) {
  const entry = seen[id] || { seen: 0, due: 0, last: 0 };
  entry.seen += 1;
  const step = SR_STEPS[Math.min(entry.seen - 1, SR_STEPS.length - 1)];
  entry.due = Date.now() + step * DAY_MS;
  entry.last = Date.now();
  seen[id] = entry;
}

function finishSession() {
  S.playing = false;
  S.locked = true;
  window.clearTimeout(S.timeoutId);
  window.clearInterval(S.timer);
  ui.app.classList.remove('is-playing');
  ui.exit.hidden = true;
  ui.railLabel.textContent = 'Mentalgym';
  ui.railValue.textContent = '';
  screenLock.release();

  S.record.endedAt = Date.now();
  commitSession(S.record);
  renderSummary(S.record);
  showView('summary');
}

/* ------------------------------------------------------------------ */
/* Persistence of a finished session                                   */
/* ------------------------------------------------------------------ */

function summarize(record) {
  const items = record.items;
  const answered = items.filter((item) => !item.omission && typeof item.rt === 'number');
  const rts = answered.map((item) => item.rt);
  const hits = items.filter((item) => item.ok).length;

  const switched = answered.filter((item) => item.switched).map((item) => item.rt);
  const repeated = answered.filter((item) => item.switched === false && item.rule).map((item) => item.rt);

  return {
    n: items.length,
    answered: answered.length,
    omissions: items.length - answered.length,
    hits,
    p50: median(rts),
    mean: rts.length ? Math.round(sum(rts) / rts.length) : 0,
    fast: rts.length ? Math.min(...rts) : 0,
    switchCost: switched.length && repeated.length ? median(switched) - median(repeated) : null,
  };
}

function commitSession(record) {
  if (S.committed) return;
  S.committed = true;

  record.summary = summarize(record);
  sessions.push(record);
  if (sessions.length > SESSION_CAP) sessions.splice(0, sessions.length - SESSION_CAP);

  const key = dayKey(new Date(record.startedAt));
  const day = daily[key] || { n: 0, items: 0, ms: 0 };
  day.n += 1;
  day.items += record.items.length;
  day.ms += record.summary.answered ? record.summary.mean * record.summary.answered : 0;
  daily[key] = day;

  const cutoff = Date.now() - DETAIL_DAYS * DAY_MS;
  sessions = sessions.filter((entry) => entry.startedAt >= cutoff);

  write(K.sessions, sessions);
  write(K.daily, daily);
  write(K.sr, seen);
  write(K.settings, settings);
}

/* ------------------------------------------------------------------ */
/* Summary view                                                        */
/* ------------------------------------------------------------------ */

function statBlock(label, value, hint, key) {
  const block = el('div', 'stat');
  if (key) block.dataset.stat = key;
  block.append(el('p', 'stat__value', value));
  block.append(el('p', 'stat__label', label));
  if (hint) block.append(el('p', 'stat__hint', hint));
  return block;
}

function renderSummary(record) {
  const summary = record.summary;
  const view = $('#view-summary');
  const body = view.querySelector('.view__body');
  const name = record.ex === 'mix' ? 'Sesión mixta' : MODES[record.ex].name;

  body.replaceChildren();

  const head = el('div', 'summary__head');
  head.append(el('p', 'summary__kicker', name));
  if (summary.answered) {
    head.append(el('p', 'summary__big', String(summary.p50)));
    head.append(el('p', 'summary__unit', 'ms de mediana'));
  } else {
    head.append(el('p', 'summary__big summary__big--empty', 'Sin respuestas'));
    head.append(el('p', 'summary__unit', 'esta sesión no registró tiempos'));
  }
  body.append(head);

  const grid = el('div', 'stats');
  grid.append(statBlock('Respondidos', `${summary.answered}/${summary.n}`));
  grid.append(statBlock('Tiempo agotado', String(summary.omissions)));
  grid.append(statBlock('Aciertos', `${summary.hits}/${summary.n}`, null, 'hits'));
  if (summary.switchCost !== null) {
    const sign = summary.switchCost > 0 ? '+' : '';
    grid.append(statBlock('Coste de cambio', `${sign}${summary.switchCost} ms`, 'alternar regla frente a repetirla'));
  }
  body.append(grid);

  const hint = levelHint(record);
  if (hint) {
    const notice = el('div', 'notice');
    notice.append(el('p', 'notice__text', hint.text));
    const button = el('button', 'btn btn--ghost', hint.label);
    button.type = 'button';
    button.addEventListener('click', () => {
      setLevel(hint.next);
      notice.remove();
    });
    notice.append(button);
    body.append(notice);
  }

  body.append(buildReview(record));

  const deck = view.querySelector('.deck');
  const primary = deck.querySelector('[data-action="summary-home"]');
  primary.textContent = 'Volver al inicio';
}

function levelHint(record) {
  const summary = record.summary;
  const rate = summary.omissions / summary.n;
  const pace = record.pace || 3000;

  if (rate > 0.4 && record.level > 1) {
    return {
      text: `Se agotó el tiempo en ${summary.omissions} de ${summary.n}. Baja un nivel y consolida.`,
      label: 'Bajar de nivel',
      next: record.level - 1,
    };
  }
  if (rate < 0.1 && summary.p50 > 0 && summary.p50 < pace * 0.55 && record.level < 3) {
    return {
      text: `Mediana de ${summary.p50} ms con ventana de ${pace} ms. Puedes subir sin perder control.`,
      label: 'Subir de nivel',
      next: record.level + 1,
    };
  }
  return null;
}

function buildReview(record) {
  const details = document.createElement('details');
  details.className = 'review';

  const head = document.createElement('summary');
  head.className = 'review__summary';
  head.textContent = 'Revisar respuestas';
  details.append(head);

  const list = el('ul', 'review__list');

  record.items.forEach((item) => {
    const row = el('li', 'review__item');
    row.append(el('span', 'review__label', item.label || 'Ítem'));

    const toggle = el('button', `review__toggle${item.ok ? '' : ' review__toggle--failed'}`, item.ok ? 'Válida' : 'Fallada');
    toggle.type = 'button';
    toggle.setAttribute('aria-pressed', String(!item.ok));

    toggle.addEventListener('click', () => {
      item.ok = !item.ok;
      toggle.textContent = item.ok ? 'Válida' : 'Fallada';
      toggle.classList.toggle('review__toggle--failed', !item.ok);
      toggle.setAttribute('aria-pressed', String(!item.ok));
      record.summary = summarize(record);
      const hits = document.querySelector('[data-stat="hits"] .stat__value');
      if (hits) hits.textContent = `${record.summary.hits}/${record.summary.n}`;
      persistEdits();
    });

    row.append(toggle);
    list.append(row);
  });

  details.append(list);
  return details;
}

function persistEdits() {
  write(K.sessions, sessions);
  renderStats();
}

/* ------------------------------------------------------------------ */
/* Stats view                                                          */
/* ------------------------------------------------------------------ */

function renderStats() {
  const view = $('#view-stats');
  const body = view.querySelector('.view__body');
  body.replaceChildren();

  const totalSessions = Object.values(daily).reduce((total, day) => total + day.n, 0);
  const totalItems = Object.values(daily).reduce((total, day) => total + day.items, 0);

  const head = el('div', 'stats-head');
  head.append(el('p', 'stats-head__big', String(totalSessions)));
  head.append(el('p', 'stats-head__label', 'sesiones registradas'));
  head.append(el('p', 'stats-head__hint', `${totalItems} estímulos completados`));
  body.append(head);

  body.append(buildStrip());

  const buckets = {};
  MODE_KEYS.forEach((key) => {
    buckets[key] = { rts: [], hits: 0, total: 0, omissions: 0 };
  });

  sessions.forEach((record) => {
    record.items.forEach((item) => {
      const key = item.ex || (record.ex !== 'mix' ? record.ex : null);
      const bucket = key ? buckets[key] : null;
      if (!bucket) return;

      bucket.total += 1;
      if (item.ok) bucket.hits += 1;
      if (item.omission) bucket.omissions += 1;
      else if (typeof item.rt === 'number') bucket.rts.push(item.rt);
    });
  });

  MODE_KEYS.forEach((key) => {
    const bucket = buckets[key];
    if (!bucket.total) return;

    const card = el('article', 'card');
    card.append(el('h2', 'card__title', MODES[key].name));

    const row = el('div', 'card__row');
    row.append(statBlock('Mediana', `${median(bucket.rts) || 0} ms`));
    row.append(statBlock('Acierto', `${Math.round((bucket.hits / bucket.total) * 100)}%`));
    card.append(row);

    const meta = el('p', 'card__meta', `${bucket.total} estímulos, ${bucket.omissions} sin respuesta`);
    card.append(meta);
    body.append(card);
  });

  if (!sessions.length) {
    body.append(el('p', 'empty', 'Todavía no hay sesiones. El progreso aparece después de la primera.'));
  }
}

function buildStrip() {
  const wrap = el('div', 'strip');
  const days = [];
  const today = new Date();

  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = new Date(today.getTime() - offset * DAY_MS);
    days.push({ key: dayKey(date), label: date.getDate() });
  }

  const peak = Math.max(1, ...days.map((day) => (daily[day.key] ? daily[day.key].items : 0)));

  days.forEach((day) => {
    const entry = daily[day.key];
    const bar = el('div', 'strip__day');
    const fill = el('div', 'strip__fill');
    if (entry) {
      const bucket = Math.max(1, Math.min(10, Math.ceil((entry.items / peak) * 10)));
      fill.classList.add(`strip__fill--h${bucket}`);
    } else {
      fill.classList.add('strip__fill--empty');
    }
    bar.append(fill);
    bar.append(el('span', 'strip__label', String(day.label)));
    wrap.append(bar);
  });

  return wrap;
}

function currentStreak() {
  const today = new Date();
  let cursor = new Date(today);
  if (!daily[dayKey(cursor)]) cursor = new Date(today.getTime() - DAY_MS);

  let total = 0;
  while (daily[dayKey(cursor)]) {
    total += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return total;
}

/* ------------------------------------------------------------------ */
/* Home view                                                           */
/* ------------------------------------------------------------------ */

function renderHome() {
  const streak = currentStreak();
  $('#streak-days').textContent = String(streak);
  $('#streak-unit').textContent = streak === 1 ? 'día' : 'días';

  const note = $('#home-note');
  const totalItems = Object.values(daily).reduce((total, day) => total + day.items, 0);
  note.textContent = totalItems
    ? `${totalItems} estímulos en total. Sin audio, sin permisos, sin conexión.`
    : 'Sin audio, sin permisos, sin conexión. Un toque por estímulo.';
}

/* ------------------------------------------------------------------ */
/* Settings view                                                       */
/* ------------------------------------------------------------------ */

function renderSettings() {
  const levelButtons = document.querySelectorAll('[data-level]');
  levelButtons.forEach((button) => {
    const value = Number(button.dataset.level);
    const active = value === settings.level;
    button.classList.toggle('segment__btn--active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  $('#opt-haptics').checked = Boolean(settings.haptics);
  $('#opt-announce').checked = Boolean(settings.announce);
  const support = document.querySelector('[data-capability]');
  support.textContent = `Vibración ${haptic.supported ? 'disponible' : 'no disponible'}. Pantalla activa ${screenLock.supported ? 'disponible' : 'no disponible'}.`;
}

function setLevel(value) {
  settings.level = Math.min(3, Math.max(1, value));
  write(K.settings, settings);
  renderSettings();
}

/* ------------------------------------------------------------------ */
/* Views                                                               */
/* ------------------------------------------------------------------ */

function showView(name) {
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('view--active', view.id === `view-${name}`);
  });

  document.querySelectorAll('.nav__btn').forEach((button) => {
    button.classList.toggle('nav__btn--active', button.dataset.view === name);
  });

  if (name === 'home') renderHome();
  if (name === 'stats') renderStats();
  if (name === 'settings') renderSettings();

  const active = document.querySelector('.view--active .view__body');
  if (active) active.scrollTop = 0;
}

/* ------------------------------------------------------------------ */
/* Export and import                                                   */
/* ------------------------------------------------------------------ */

function exportData() {
  const payload = {
    app: 'mentalgym',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    sessions,
    daily,
    seen,
  };

  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mentalgym-${dayKey(new Date())}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Respaldo descargado');
  } catch (error) {
    toast('No se pudo exportar');
  }
}

function importData(file) {
  const reader = new FileReader();

  reader.addEventListener('load', () => {
    try {
      const payload = JSON.parse(String(reader.result));
      if (!payload || payload.app !== 'mentalgym') {
        toast('Archivo no reconocido');
        return;
      }
      if (Array.isArray(payload.sessions)) sessions = payload.sessions;
      if (payload.daily && typeof payload.daily === 'object') daily = payload.daily;
      if (payload.seen && typeof payload.seen === 'object') seen = payload.seen;
      if (payload.settings) settings = { ...DEFAULT_SETTINGS, ...payload.settings };

      write(K.sessions, sessions);
      write(K.daily, daily);
      write(K.sr, seen);
      write(K.settings, settings);

      renderStats();
      renderSettings();
      renderHome();
      toast('Datos importados');
    } catch (error) {
      toast('Archivo dañado');
    }
  });

  reader.readAsText(file);
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

let toastTimer = 0;

function toast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add('toast--visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => ui.toast.classList.remove('toast--visible'), 2400);
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

ui.tap.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  onTap();
});

ui.tap.addEventListener('click', (event) => {
  if (event.detail === 0) {
    event.preventDefault();
    onTap();
  }
});

ui.pressureFill.addEventListener('animationend', (event) => {
  if (event.animationName !== 'drain') return;
  if (!S.playing || S.locked || S.resolved) return;
  onExpire();
});

ui.exit.addEventListener('click', () => {
  if (!S.playing && !S.record) return;
  S.playing = false;
  if (S.record && S.record.items.length) {
    S.record.endedAt = Date.now();
    finishSession();
  } else {
    S.committed = true;
    ui.app.classList.remove('is-playing');
    ui.exit.hidden = true;
    ui.railLabel.textContent = 'Mentalgym';
    ui.railValue.textContent = '';
    screenLock.release();
    showView('home');
  }
});

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    showView(viewButton.dataset.view);
    return;
  }

  const start = event.target.closest('[data-start]');
  if (start) {
    startSession(start.dataset.start);
    return;
  }

  const action = event.target.closest('[data-action]');
  if (!action) return;

  if (action.dataset.action === 'summary-home') {
    ui.exit.hidden = true;
    showView('home');
  }

  if (action.dataset.action === 'export') exportData();

  if (action.dataset.action === 'update') checkUpdate();

  if (action.dataset.action === 'reset') {
    const sure = window.confirm('Se borrarán sesiones, progreso y marcas de repetición. ¿Continuar?');
    if (!sure) return;
    sessions = [];
    daily = {};
    seen = {};
    write(K.sessions, sessions);
    write(K.daily, daily);
    write(K.sr, seen);
    renderStats();
    renderHome();
    toast('Progreso borrado');
  }
});

document.querySelectorAll('[data-level]').forEach((button) => {
  button.addEventListener('click', () => setLevel(Number(button.dataset.level)));
});

$('#opt-haptics').addEventListener('change', (event) => {
  settings.haptics = event.target.checked;
  write(K.settings, settings);
  if (settings.haptics) haptic.confirm(true);
});

$('#opt-announce').addEventListener('change', (event) => {
  settings.announce = event.target.checked;
  write(K.settings, settings);
  applyAnnounce();
});

$('#file-import').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) importData(file);
  event.target.value = '';
});

document.querySelector('[data-action="trigger-import"]').addEventListener('click', () => {
  $('#file-import').click();
});

window.addEventListener('pagehide', () => {
  if (S.playing && S.record && S.record.items.length && !S.committed) {
    S.record.endedAt = Date.now();
    commitSession(S.record);
  }
});

function applyAnnounce() {
  ui.stage.setAttribute('aria-live', settings.announce ? 'assertive' : 'off');
}

/* ------------------------------------------------------------------ */
/* Service worker                                                      */
/* ------------------------------------------------------------------ */

function registerWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;

  navigator.serviceWorker.register(new URL('../sw.js', import.meta.url)).catch(() => {
    /* Registration failures are not fatal. */
  });
}

async function checkUpdate() {
  if (!('serviceWorker' in navigator)) {
    toast('Este navegador no soporta actualizaciones instaladas');
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    toast('Sin service worker activo en esta sesión');
    return;
  }

  try {
    await registration.update();
  } catch (error) {
    /* Falls through: the waiting check below still tells the truth. */
  }

  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'skip-waiting' });
    toast('Actualizando');
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
    return;
  }

  toast('Ya tienes la última versión');
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

function boot() {
  migrate();
  applyAnnounce();
  renderHome();
  renderSettings();
  showView('home');
  registerWorker();

  if ('storage' in navigator && 'persist' in navigator.storage) {
    navigator.storage.persist().catch(() => {});
  }
}

boot();
