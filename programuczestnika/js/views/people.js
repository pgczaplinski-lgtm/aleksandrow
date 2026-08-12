/**
 * Widok: zarządzanie uczestnikami (lista + formularz). (WŁASNOŚĆ: panel opiekuna)
 * render(root, ctx): lista profili; formularz dodawania/edycji (imię, awatar,
 * zainteresowania, potrzeby). Wymaga store.isUnlocked() — inaczej go('pin').
 */

import { el, header, bigButton, toast } from '../ui.js';
import { INTERESTS, NEEDS, AVATARS } from '../data.js';

export function render(root, ctx) {
  root.replaceChildren();
  const { store, go, params } = ctx;

  if (!store.isUnlocked()) return go('pin');

  root.append(header('Uczestnicy', { back: () => go('caregiver') }));

  if (params.edit) renderForm(root, ctx, params.edit);
  else renderList(root, ctx);
}

function renderList(root, ctx) {
  const { store, go } = ctx;

  const redraw = () => {
    root.replaceChildren();
    render(root, ctx);
  };

  const profiles = store.getProfiles();
  if (profiles.length === 0) {
    root.append(el('div', { class: 'empty' }, [
      el('span', { class: 'empty-emoji', text: '👤' }),
      'Brak uczestników. Dodaj pierwszą osobę.',
    ]));
  }
  for (const p of profiles) {
    root.append(el('div', { class: 'list-row' }, [
      el('span', { class: 'avatar', text: p.avatar }),
      el('div', { class: 'row-main' }, [
        el('div', { class: 'row-title', text: p.name }),
        el('div', { class: 'row-sub', text: `Zainteresowania: ${p.interests.length} · Potrzeby: ${p.needs.length}` }),
      ]),
      el('div', { class: 'row-actions' }, [
        el('button', { class: 'btn btn-sm btn-secondary', text: 'Edytuj', onclick: () => go('people', { edit: p.id }) }),
        el('button', {
          class: 'btn btn-sm btn-danger',
          text: 'Usuń',
          onclick: () => {
            if (!confirm(`Usunąć uczestnika „${p.name}”?`)) return;
            store.deleteProfile(p.id);
            redraw();
          },
        }),
      ]),
    ]));
  }

  root.append(el('div', { class: 'btn-gap' }));
  root.append(bigButton({ label: 'Dodaj osobę', emoji: '➕', onClick: () => go('people', { edit: 'new' }) }));
}

function renderForm(root, ctx, edit) {
  const { store, go } = ctx;

  const existing = edit !== 'new' ? store.getProfiles().find((p) => p.id === edit) : null;

  const state = {
    name: existing?.name || '',
    avatar: existing?.avatar || AVATARS[0],
    interests: new Set(existing?.interests || []),
    needs: new Set(existing?.needs || []),
  };

  const nameInput = el('input', {
    class: 'input',
    type: 'text',
    maxlength: '40',
    placeholder: 'np. Ania',
    oninput: (e) => { state.name = e.target.value; },
  });

  const avatarChips = el('div', { class: 'chips' });
  const drawAvatars = () => {
    avatarChips.replaceChildren();
    for (const a of AVATARS) {
      const on = state.avatar === a;
      avatarChips.append(el('button', {
        class: `chip${on ? ' on' : ''}`,
        'aria-pressed': on ? 'true' : 'false',
        onclick: () => { state.avatar = a; drawAvatars(); },
      }, [el('span', { text: a })]));
    }
  };
  drawAvatars();

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

  root.append(
    el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Imię' }), nameInput]),
    el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Awatar' }), avatarChips]),
    el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Zainteresowania' }), makeChips(INTERESTS, 'interests')]),
    el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Potrzeby' }), makeChips(NEEDS, 'needs')]),
    bigButton({
      label: 'Zapisz',
      emoji: '💾',
      onClick: () => {
        if (!state.name.trim()) return toast('Podaj imię uczestnika.');
        store.saveProfile({
          id: edit === 'new' ? undefined : edit,
          name: state.name.trim(),
          avatar: state.avatar,
          interests: [...state.interests],
          needs: [...state.needs],
        });
        go('people');
      },
    }),
    el('button', { class: 'btn btn-secondary btn-block', text: 'Anuluj', onclick: () => go('people') }),
  );

  if (existing) {
    root.append(el('button', {
      class: 'btn btn-danger btn-block',
      style: 'margin-top: 10px',
      text: 'Usuń osobę',
      onclick: () => {
        if (!confirm(`Usunąć uczestnika „${state.name}”?`)) return;
        store.deleteProfile(existing.id);
        go('people');
      },
    }));
  }
}