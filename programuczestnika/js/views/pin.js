/**
 * Widok: PIN opiekuna. (WŁASNOŚĆ: panel opiekuna)
 * render(root, ctx): klawiatura 4-cyfrowego PIN; po sukcesie store.setUnlocked(true)
 * i go('caregiver').
 */

import { el, header, toast } from '../ui.js';

export function render(root, ctx) {
  root.replaceChildren();
  const { store, go } = ctx;

  root.append(header('Dla opiekuna', { back: () => go('') }));

  let entered = '';

  const dots = el('div', { class: 'pin-dots' });
  const drawDots = () => {
    dots.replaceChildren();
    for (let i = 0; i < 4; i++) {
      dots.append(el('span', { class: `pin-dot${i < entered.length ? ' on' : ''}` }));
    }
  };

  const tryUnlock = () => {
    if (entered.length !== 4) return;
    if (store.checkPin(entered)) {
      store.setUnlocked(true);
      go('caregiver');
    } else {
      toast('Zły kod. Spróbuj jeszcze raz.');
      entered = '';
      drawDots();
    }
  };

  const press = (d) => {
    if (entered.length >= 4) return;
    entered += d;
    drawDots();
    tryUnlock();
  };

  const backspace = () => {
    entered = entered.slice(0, -1);
    drawDots();
  };

  drawDots();
  root.append(dots);

  const keypad = el('div', { class: 'keypad' });
  for (const n of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) {
    keypad.append(el('button', { class: 'btn key', text: n, onclick: () => press(n) }));
  }
  keypad.append(el('button', { class: 'btn key', text: '←', onclick: backspace }));
  keypad.append(el('button', { class: 'btn key', text: '0', onclick: () => press('0') }));
  keypad.append(el('button', { class: 'btn key key-ok', text: 'OK', onclick: tryUnlock }));
  root.append(keypad);
}
