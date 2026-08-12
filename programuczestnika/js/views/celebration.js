/**
 * Widok: gratulacje po ukończeniu planu. (WŁASNOŚĆ: widoki uczestnika)
 * render(root, ctx): wielki emoji + powrót do domu.
 */

import { el, header, bigButton } from '../ui.js';

export function render(root, ctx) {
  const { go, params } = ctx;
  const personId = params.p || null;

  root.append(header('Brawo!', { back: () => go('home', { p: personId }) }));
  root.append(el('div', { class: 'celebration' }, [
    el('span', { class: 'big-emoji', text: '🎉' }),
    el('h1', { text: 'Brawo!' }),
    el('p', { text: 'Cały plan zrobiony!' }),
    bigButton({ label: 'Wróć do domu', emoji: '🏠', onClick: () => go('home', { p: personId }) }),
  ]));
}
