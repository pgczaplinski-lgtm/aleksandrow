/**
 * Widok: pomysły na dziś — propozycje zajęć. (WŁASNOŚĆ: widoki uczestnika)
 * render(root, ctx): karty zajęć (czas wolny + nauka); dotknięcie dodaje/usuwa z planu.
 */

import { store } from '../store.js';
import { el, header, activityCard, bigButton, chunk, pageDots, todayKey } from '../ui.js';

export function render(root, ctx) {
  const { go, params } = ctx;
  const personId = params.p || store.getLastPersonId();
  if (!personId) return go('');
  const profile = store.getProfiles().find((p) => p.id === personId);
  if (!profile) return go('');

  root.append(header('Pomysły na dziś', { back: () => go('home', { p: personId }), onSpeak: 'Wybierz zajęcia na dziś. Dotknij kartę, aby dodać do planu.' }));

  const matched = store.matchActivities(profile);
  const today = todayKey();

  if (profile.interests.length === 0 && profile.needs.length === 0) {
    root.append(el('div', { class: 'empty' }, [
      el('span', { class: 'empty-emoji', text: '💡' }),
      el('span', { text: 'Najpierw wybierz, co lubisz i czego chcesz się nauczyć.' }),
    ]));
    root.append(bigButton({ label: 'Co lubię?', emoji: '❤️', variant: 'secondary', onClick: () => go('interests', { p: personId }) }));
    root.append(bigButton({ label: 'Czego chcę się nauczyć?', emoji: '🌟', variant: 'secondary', onClick: () => go('needs', { p: personId }) }));
  }

  const section = (title, list) => {
    root.append(el('h2', { class: 'section-title', text: title }));
    const pages = chunk(list, 8);
    let page = 0;
    const body = el('div');

    const draw = () => {
      const plan = store.getPlan(personId, today) || { date: today, items: [] };
      const inPlan = new Set(plan.items.map((i) => i.activityId));
      body.replaceChildren();
      const grid = el('div', { class: 'card-grid' });
      for (const act of pages[page]) {
        const selected = inPlan.has(act.id);
        grid.append(activityCard({
          emoji: act.emoji,
          title: act.title,
          reason: act.reason,
          selected,
          onClick: () => {
            if (inPlan.has(act.id)) {
              const item = plan.items.find((i) => i.activityId === act.id);
              store.removeFromPlan(personId, today, item.id);
            } else {
              store.addToPlan(personId, today, act.id);
            }
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
  };

  section('🌤️ Czas wolny', matched.free);
  section('🌟 Nauka i rozwój', matched.learn);

  root.append(bigButton({
    label: 'Zaproponuj mi plan',
    emoji: '✨',
    variant: 'secondary',
    onClick: () => {
      const suggested = store.buildSuggestedPlan(profile, today);
      store.setPlan(personId, suggested);
      go('plan', { p: personId });
    },
  }));
  root.append(bigButton({ label: 'Przejdź do planu', emoji: '📋', onClick: () => go('plan', { p: personId }) }));
}
