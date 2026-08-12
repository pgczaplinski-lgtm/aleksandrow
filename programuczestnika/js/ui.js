/**
 * Mój Plan Dnia — wspólne elementy UI.
 * Widoki budują ekrany wyłącznie przez te funkcje + klasy z css/base.css.
 */

/**
 * Buduje element DOM. Atrybuty: class, text, html, onclick oraz dowolne
 * atrybuty; child to element, string lub tablica takich.
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'onclick') node.addEventListener('click', v);
    else if (k === 'onchange') node.addEventListener('change', v);
    else if (k === 'oninput') node.addEventListener('input', v);
    else if (k === 'onsubmit') node.addEventListener('submit', (e) => { e.preventDefault(); v(e); });
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  const flat = children.flat(Infinity);
  for (const c of flat) {
    if (c == null) continue;
    node.append(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  return node;
}

// ---- Mowa (Web Speech API) ----

export function speak(text) {
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pl-PL';
  u.rate = 0.92;
  speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}

// ---- Nagłówek ekranu ----

/**
 * Nagłówek ekranu: [← Wstecz]  [tytuł]  [🔈].
 * @param {string} title
 * @param {{back?: (() => void), onSpeak?: string}} opts
 */
export function header(title, { back, onSpeak } = {}) {
  const bar = el('header', { class: 'header' });
  if (back) {
    bar.append(el('button', { class: 'btn btn-icon', 'aria-label': 'Wstecz', title: 'Wstecz', onclick: back }, ['←']));
  } else {
    bar.append(el('span', { class: 'header-spacer' }));
  }
  bar.append(el('h1', { class: 'header-title', text: title }));
  if (onSpeak) {
    bar.append(el('button', { class: 'btn btn-icon', 'aria-label': 'Przeczytaj na głos', title: 'Przeczytaj na głos', onclick: () => speak(onSpeak) }, ['🔈']));
  } else {
    bar.append(el('span', { class: 'header-spacer' }));
  }
  return bar;
}

// ---- Przyciski ----

export function bigButton({ label, emoji, onClick, variant = 'primary', block = true, ariaLabel }) {
  return el('button', {
    class: `btn btn-${variant}${block ? ' btn-block' : ''}`,
    onclick: onClick,
    'aria-label': ariaLabel || label,
  }, emoji ? [el('span', { class: 'btn-emoji', text: emoji }), el('span', { text: label })] : [el('span', { text: label })]);
}

// ---- Karty ----

/** Karta tagu (zainteresowanie / potrzeba) do wyboru. */
export function tagCard({ emoji, label, selected, onClick }) {
  return el('button', {
    class: `card tag-card${selected ? ' selected' : ''}`,
    'aria-pressed': selected ? 'true' : 'false',
    onclick: onClick,
  }, [el('span', { class: 'tag-emoji', text: emoji }), el('span', { class: 'tag-label', text: label })]);
}

/** Karta osoby (ekran startowy). */
export function personCard({ name, avatar, onClick }) {
  return el('button', { class: 'card person-card', onclick: onClick }, [
    el('span', { class: 'avatar', text: avatar }),
    el('span', { class: 'person-name', text: name }),
  ]);
}

/** Karta zajęcia (propozycja na ekranie „Pomysły na dziś"). */
export function activityCard({ emoji, title, reason, selected, onClick }) {
  return el('button', {
    class: `card activity-card${selected ? ' selected' : ''}`,
    'aria-pressed': selected ? 'true' : 'false',
    onclick: onClick,
  }, [
    el('span', { class: 'act-emoji', text: emoji }),
    el('span', { class: 'act-title', text: title }),
    el('span', { class: 'act-reason', text: reason }),
  ]);
}

// ---- Paginacja ----

/** Dzieli listę na strony po `perPage` elementów. */
export function chunk(list, perPage) {
  const out = [];
  for (let i = 0; i < list.length; i += perPage) out.push(list.slice(i, i + perPage));
  return out;
}

/** Kropki paginacji; `page` (0-based), `count` stron. */
export function pageDots(page, count) {
  const dots = el('div', { class: 'page-dots', role: 'tablist', 'aria-label': 'Strony' });
  for (let i = 0; i < count; i++) {
    dots.append(el('span', { class: `dot${i === page ? ' on' : ''}` }));
  }
  return dots;
}

// ---- Toast ----

let toastTimer = null;
export function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = el('div', { class: 'toast', role: 'status' });
    document.body.append(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ---- Daty ----

/** Klucz daty lokalnej: 'YYYY-MM-DD'. */
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Etykieta daty: „Dziś" albo „poniedziałek 5.6". */
export function dateLabel(key) {
  if (key === todayKey()) return 'Dziś';
  const [y, m, d] = key.split('-').map(Number);
  const names = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  return `${names[new Date(y, m - 1, d).getDay()]} ${d}.${m}`;
}
