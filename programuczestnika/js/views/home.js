/**
 * Widok: strona główna — powitanie i nawigacja. (WŁASNOŚĆ: widoki uczestnika)
 * render(root, ctx): powitanie + duże przyciski do głównych ekranów.
 */

import { store } from '../store.js';
import { el, header, bigButton, todayKey } from '../ui.js';

export function render(root, ctx) {
  const { go, params } = ctx;
  const personId = params.p || store.getLastPersonId();
  if (!personId) return go('');
  const profile = store.getProfiles().find((p) => p.id === personId);
  if (!profile) return go('');

  const name = profile.name;
  root.append(header('Mój Plan Dnia', { onSpeak: `Cześć ${name}! Co chcesz robić?` }));

  root.append(el('div', { class: 'greeting' }, [
    el('span', { class: 'avatar', text: profile.avatar }),
    el('h2', { text: `Cześć, ${name}!` }),
  ]));

  root.append(bigButton({ label: 'Co lubię?', emoji: '❤️', onClick: () => go('interests', { p: personId }) }));
  root.append(bigButton({ label: 'Czego chcę się nauczyć?', emoji: '🌟', onClick: () => go('needs', { p: personId }) }));
  root.append(bigButton({ label: 'Pomysły na dziś', emoji: '💡', onClick: () => go('suggestions', { p: personId }) }));
  root.append(bigButton({ label: 'Mój plan', emoji: '📋', onClick: () => go('plan', { p: personId }) }));

  const plan = store.getPlan(personId, todayKey());
  if (plan && plan.items.length > 0) {
    const done = plan.items.filter((i) => i.done).length;
    root.append(el('p', { class: 'hint center', text: `Dziś zrobione: ${done} z ${plan.items.length}` }));
  }

  root.append(bigButton({ label: 'Zmienić osobę', variant: 'ghost', onClick: () => go('') }));
}
