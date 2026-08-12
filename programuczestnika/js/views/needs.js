/**
 * Widok: wybór potrzeb rozwojowych. (WŁASNOŚĆ: widoki uczestnika)
 * render(root, ctx): karty tagów (8 na stronę); dotknięcie przełącza wybór.
 */

import { store } from '../store.js';
import { NEEDS } from '../data.js';
import { el, header, tagCard, bigButton, chunk, pageDots } from '../ui.js';

export function render(root, ctx) {
  const { go, params } = ctx;
  const personId = params.p || store.getLastPersonId();
  if (!personId) return go('');
  const profile = store.getProfiles().find((p) => p.id === personId);
  if (!profile) return go('');

  root.append(header('Czego chcę się nauczyć?', { back: () => go('home', { p: personId }), onSpeak: 'Czego chcesz się nauczyć? Dotknij, co wybierasz.' }));

  const pages = chunk(NEEDS, 8);
  let page = 0;
  const body = el('div');

  const draw = () => {
    body.replaceChildren();
    const grid = el('div', { class: 'card-grid' });
    for (const tag of pages[page]) {
      const selected = profile.needs.includes(tag.id);
      grid.append(tagCard({
        emoji: tag.emoji,
        label: tag.label,
        selected,
        onClick: () => {
          if (selected) profile.needs = profile.needs.filter((i) => i !== tag.id);
          else profile.needs.push(tag.id);
          store.saveProfile(profile);
          draw();
        },
      }));
    }
    body.append(grid);
    if (pages.length > 1) {
      body.append(pageDots(page, pages.length));
      const nav = el('div', { class: 'pager' });
      nav.append(el('button', { class: 'btn btn-ghost', 'aria-label': 'Poprzednia strona', onclick: () => { if (page > 0) { page--; draw(); } } }, ['←']));
      nav.append(el('button', { class: 'btn btn-ghost', 'aria-label': 'Następna strona', onclick: () => { if (page < pages.length - 1) { page++; draw(); } } }, ['→']));
      body.append(nav);
    }
  };

  draw();
  root.append(body);
  root.append(bigButton({ label: 'Gotowe', emoji: '✅', onClick: () => go('suggestions', { p: personId }) }));
}
