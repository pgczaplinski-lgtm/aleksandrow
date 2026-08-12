/**
 * Widok: zarządzanie katalogiem zajęć (lista + formularz). (WŁASNOŚĆ: panel opiekuna)
 * render(root, ctx): lista zajęć; formularz dodawania/edycji (tytuł, emoji,
 * kategoria, tagi, opis). Wymaga store.isUnlocked() — inaczej go('pin').
 */

import { el, header, bigButton, toast } from '../ui.js';
import { INTERESTS, NEEDS, CATEGORIES } from '../data.js';

export function render(root, ctx) {
  root.replaceChildren();
  const { store, go, params } = ctx;

  if (!store.isUnlocked()) return go('pin');

  root.append(header('Katalog zajęć', { back: () => go('caregiver') }));

  if (params.edit) renderForm(root, ctx, params.edit);
  else renderList(root, ctx);
}

/** „1 tag", „3 tagi", „5 tagów". */
function tagsLabel(n) {
  if (n === 1) return '1 tag';
  const mod100 = n % 100;
  if (mod100 >= 12 && mod100 <= 14) return `${n} tagów`;
  const mod10 = n % 10;
  if (mod10 >= 2 && mod10 <= 4) return `${n} tagi`;
  return `${n} tagów`;
}

function renderList(root, ctx) {
  const { store, go } = ctx;

  const redraw = () => {
    root.replaceChildren();
    render(root, ctx);
  };

  const activities = store.getCatalog();
  if (activities.length === 0) {
    root.append(el('div', { class: 'empty' }, [
      el('span', { class: 'empty-emoji', text: '🗂️' }),
      'Brak zajęć w katalogu. Dodaj pierwsze.',
    ]));
  }
  for (const a of activities) {
    const cat = CATEGORIES[a.category];
    const tagCount = a.interests.length + a.needs.length;
    root.append(el('div', { class: 'list-row' }, [
      el('span', { class: 'act-emoji', text: a.emoji || '⭐' }),
      el('div', { class: 'row-main' }, [
        el('div', { class: 'row-title', text: a.title }),
        el('div', { class: 'row-sub', text: `${cat?.label ?? '—'} · ${tagsLabel(tagCount)}` }),
      ]),
      el('div', { class: 'row-actions' }, [
        el('button', { class: 'btn btn-sm btn-secondary', text: 'Edytuj', onclick: () => go('catalog', { edit: a.id }) }),
        el('button', {
          class: 'btn btn-sm btn-danger',
          text: 'Usuń',
          onclick: () => {
            if (!confirm(`Usunąć zajęcie „${a.title}”?`)) return;
            store.deleteActivity(a.id);
            redraw();
          },
        }),
      ]),
    ]));
  }

  root.append(el('div', { class: 'btn-gap' }));
  root.append(bigButton({ label: 'Dodaj zajęcie', emoji: '➕', onClick: () => go('catalog', { edit: 'new' }) }));
}

function renderForm(root, ctx, edit) {
  const { store, go } = ctx;

  const existing = edit !== 'new' ? store.getCatalog().find((a) => a.id === edit) : null;

  const state = {
    title: existing?.title || '',
    emoji: existing?.emoji || '',
    category: existing?.category || 'free',
    interests: new Set(existing?.interests || []),
    needs: new Set(existing?.needs || []),
    howTo: existing?.howTo || '',
  };

  const titleInput = el('input', {
    class: 'input',
    type: 'text',
    maxlength: '60',
    placeholder: 'np. Gra w piłkę',
    oninput: (e) => { state.title = e.target.value; },
  });
  const emojiInput = el('input', {
    class: 'input',
    type: 'text',
    maxlength: '8',
    placeholder: 'np. ⚽',
    oninput: (e) => { state.emoji = e.target.value; },
  });

  const categorySelect = el('select', {
    class: 'select',
    onchange: (e) => { state.category = e.target.value; },
  });
  for (const [id, c] of Object.entries(CATEGORIES)) {
    categorySelect.append(el('option', { value: id, text: `${c.emoji} ${c.label}` }));
  }
  categorySelect.value = state.category;

  const makeChips = (tags, setKey) => {
    const box = el('div', { class: 'chips' });
    const draw = () => {
      box.replaceChildren();
      for (const t of tags) {
        const set = state[setKey];
        const on = set.has(t.id);
        box.append(el('button', {
          class: `chip${on ? ' on' : ''}`,
          'aria-pressed': on ? 'true' : 'false',
          onclick: () => {
            if (on) set.delete(t.id);
            else set.add(t.id);
            draw();
          },
        }, [el('span', { text: `${t.emoji} ${t.label}` })]));
      }
    };
    draw();
    return box;
  };

  const howToInput = el('textarea', {
    class: 'textarea',
    maxlength: '200',
    placeholder: 'Krok po kroku, jak wykonać zajęcie…',
    oninput: (e) => { state.howTo = e.target.value; },
  });

  root.append(
    el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Tytuł' }), titleInput]),
    el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Emoji' }), emojiInput]),
    el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Kategoria' }), categorySelect]),
    el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Zainteresowania' }), makeChips(INTERESTS, 'interests')]),
    el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Potrzeby' }), makeChips(NEEDS, 'needs')]),
    el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Opis jak wykonać' }), howToInput]),
    bigButton({
      label: 'Zapisz',
      emoji: '💾',
      onClick: () => {
        if (!state.title.trim()) return toast('Podaj tytuł zajęcia.');
        store.saveActivity({
          id: edit === 'new' ? undefined : edit,
          title: state.title.trim(),
          emoji: state.emoji.trim(),
          category: state.category,
          interests: [...state.interests],
          needs: [...state.needs],
          howTo: state.howTo.trim(),
        });
        go('catalog');
      },
    }),
    el('button', { class: 'btn btn-secondary btn-block', text: 'Anuluj', onclick: () => go('catalog') }),
  );

  if (existing) {
    root.append(el('button', {
      class: 'btn btn-danger btn-block',
      style: 'margin-top: 10px',
      text: 'Usuń zajęcie',
      onclick: () => {
        if (!confirm(`Usunąć zajęcie „${state.title}”?`)) return;
        store.deleteActivity(existing.id);
        go('catalog');
      },
    }));
  }
}