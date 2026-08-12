/**
 * Widok: strona główna panelu opiekuna. (WŁASNOŚĆ: panel opiekuna)
 * render(root, ctx): skróty do zarządzania uczestnikami i katalogiem + zmiana PIN.
 * Wymaga store.isUnlocked() — inaczej go('pin').
 */

import { el, header, bigButton, toast } from '../ui.js';

export function render(root, ctx) {
  root.replaceChildren();
  const { store, go } = ctx;

  if (!store.isUnlocked()) return go('pin');

  root.append(header('Panel opiekuna', { back: () => go('') }));

  root.append(bigButton({ label: 'Uczestnicy', emoji: '👥', onClick: () => go('people') }));
  root.append(el('div', { class: 'btn-gap' }));
  root.append(bigButton({ label: 'Katalog zajęć', emoji: '🗂️', onClick: () => go('catalog') }));

  let pinOpen = false;
  const pinSection = el('div', { class: 'btn-gap' });
  const renderPinSection = () => {
    pinSection.replaceChildren();
    if (!pinOpen) {
      pinSection.append(bigButton({
        label: 'Zmień PIN',
        emoji: '🔑',
        variant: 'secondary',
        onClick: () => { pinOpen = true; renderPinSection(); },
      }));
      return;
    }
    const p1 = el('input', {
      class: 'input',
      type: 'password',
      inputmode: 'numeric',
      maxlength: '4',
      autocomplete: 'off',
      placeholder: '4 cyfry',
    });
    const p2 = el('input', {
      class: 'input',
      type: 'password',
      inputmode: 'numeric',
      maxlength: '4',
      autocomplete: 'off',
      placeholder: '4 cyfry',
    });
    const save = () => {
      const a = p1.value.trim();
      const b = p2.value.trim();
      if (!/^\d{4}$/.test(a)) return toast('PIN musi mieć 4 cyfry.');
      if (a !== b) return toast('Kody nie pasują do siebie.');
      if (!store.setPin(a)) return toast('PIN musi mieć 4 cyfry.');
      toast('PIN został zmieniony.');
      pinOpen = false;
      renderPinSection();
    };
    pinSection.append(
      el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Nowy PIN' }), p1]),
      el('div', { class: 'field' }, [el('label', { class: 'label', text: 'Powtórz nowy PIN' }), p2]),
      bigButton({ label: 'Zapisz PIN', emoji: '💾', onClick: save }),
      el('button', { class: 'btn btn-ghost btn-block', text: 'Anuluj', onclick: () => { pinOpen = false; renderPinSection(); } }),
    );
  };
  renderPinSection();
  root.append(pinSection);

  root.append(el('div', { class: 'btn-gap' }));
  root.append(el('button', { class: 'btn btn-ghost btn-block', text: 'Wróć do aplikacji', onclick: () => go('') }));
  root.append(el('button', {
    class: 'btn btn-danger btn-block',
    style: 'margin-top: 10px',
    text: 'Wyczyść wszystkie dane',
    onclick: () => {
      if (!confirm('Wyczyścić wszystkie dane? Tej operacji nie można cofnąć.')) return;
      store.resetAll();
      toast('Wszystkie dane zostały wyczyszczone.');
    },
  }));
}
