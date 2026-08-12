/**
 * Widok: ekran startowy — wybór osoby. (WŁASNOŚĆ: widoki uczestnika)
 * render(root, ctx): lista kart osób; wybór → setLastPersonId + go('home', {p: id}).
 */

import { store } from '../store.js';
import { el, header, personCard, bigButton } from '../ui.js';

export function render(root, ctx) {
  const { go } = ctx;
  root.append(header('Mój Plan Dnia', { onSpeak: 'Kto dzisiaj jest? Wybierz siebie.' }));

  const profiles = store.getProfiles();
  if (profiles.length === 0) {
    root.append(el('div', { class: 'empty' }, [
      el('span', { class: 'empty-emoji', text: '👋' }),
      el('span', { text: 'Nie ma jeszcze żadnej osoby.' }),
    ]));
  } else {
    const grid = el('div', { class: 'card-grid' });
    for (const p of profiles) {
      grid.append(personCard({
        name: p.name,
        avatar: p.avatar,
        onClick: () => {
          store.setLastPersonId(p.id);
          go('home', { p: p.id });
        },
      }));
    }
    root.append(grid);
  }

  root.append(bigButton({ label: 'dla opiekuna', variant: 'ghost', onClick: () => go('pin') }));
}
