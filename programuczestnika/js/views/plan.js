let celebrationTimer = null;

/**
 * Widok: mój plan — lista zajęć na dziś z postępem. (WŁASNOŚĆ: widoki uczestnika)
 * render(root, ctx): pasek postępu + elementy planu; „Zrobiłem" przełącza done.
 */

import { store } from '../store.js';
import { el, header, bigButton, todayKey, dateLabel } from '../ui.js';

export function render(root, ctx) {
  const { go, params } = ctx;
  const personId = params.p || store.getLastPersonId();
  if (!personId) return go('');
  const profile = store.getProfiles().find((p) => p.id === personId);
  if (!profile) return go('');
  const today = todayKey();

  const plan = store.getPlan(personId, today);
  if (!plan || plan.items.length === 0) {
    root.append(header('Mój plan', { back: () => go('home', { p: personId }), onSpeak: 'Twój plan na dziś. Dotknij Zrobiłem, gdy skończysz.' }));
    root.append(el('div', { class: 'empty' }, [
      el('span', { class: 'empty-emoji', text: '📋' }),
      el('span', { text: 'Plan jest pusty.' }),
    ]));
    root.append(bigButton({ label: 'Zobacz pomysły', emoji: '💡', onClick: () => go('suggestions', { p: personId }) }));
    return;
  }

  const draw = () => {
    clearTimeout(celebrationTimer);
    const current = store.getPlan(personId, today);
    const items = current.items;
    const done = items.filter((i) => i.done).length;
    const total = items.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const body = el('div');
    body.append(el('p', { class: 'progress-label', text: dateLabel(today) }));
    body.append(el('div', { class: 'progress-track' }, [el('div', { class: 'progress-fill', style: `width:${pct}%` })]));
    body.append(el('p', { class: 'progress-label', text: `Zrobione: ${done} z ${total}` }));
    if (done > 0) body.append(el('p', { class: 'hint center', text: 'Super! Tak trzymaj!' }));

    const list = el('div', { class: 'no-print' });
    for (const item of items) {
      const act = store.getCatalog().find((a) => a.id === item.activityId);
      if (!act) continue;
      list.append(el('div', { class: `plan-item${item.done ? ' done' : ''}` }, [
        el('span', { class: 'act-time', text: item.time }),
        el('span', { class: 'act-emoji', text: act.emoji }),
        el('span', { class: 'act-title', text: act.title }),
        el('button', {
          class: `btn ${item.done ? 'btn-secondary' : 'btn-primary'}`,
          onclick: () => { store.toggleDone(personId, today, item.id); draw(); },
        }, ['Zrobiłem ✓']),
      ]));
    }
    body.append(list);

    const printBlock = el('div', { class: 'print-only' }, [
      el('h2', { text: `Plan dnia — ${profile.name}` }),
      el('p', { text: dateLabel(today) }),
    ]);
    for (const item of items) {
      const act = store.getCatalog().find((a) => a.id === item.activityId);
      if (!act) continue;
      printBlock.append(el('div', { class: 'plan-item' }, [
        el('span', { class: 'act-time', text: item.time }),
        el('span', { class: 'act-title', text: act.title }),
      ]));
    }
    body.append(printBlock);

    root.replaceChildren();
    root.append(header('Mój plan', { back: () => go('home', { p: personId }), onSpeak: 'Twój plan na dziś. Dotknij Zrobiłem, gdy skończysz.' }));
    root.append(body);
    root.append(bigButton({ label: 'Dodaj pomysły', emoji: '💡', variant: 'secondary', onClick: () => go('suggestions', { p: personId }) }));
    root.append(el('button', { class: 'btn btn-secondary btn-block no-print', onclick: () => window.print() }, [
      el('span', { class: 'btn-emoji', text: '🖨️' }),
      el('span', { text: 'Wydrukuj plan' }),
    ]));

    if (total > 0 && done === total) {
      celebrationTimer = setTimeout(() => go('celebration', { p: personId }), 900);
    }
  };

  draw();
}
