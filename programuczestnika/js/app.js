/**
 * Mój Plan Dnia — router.
 *
 * Routing po hashu: `#/nazwa?param=wartosc`.
 * Każdy widok w js/views/ eksportuje:
 *   render(root, ctx)
 * gdzie root = kontener #app, a ctx = { store, go, params }.
 *   go(nazwa, params) — nawigacja; params: obiekt → query string.
 * Widoki nie modyfikują app.js.
 */

import { store } from './store.js';
import { stopSpeaking } from './ui.js';

import * as start from './views/start.js';
import * as home from './views/home.js';
import * as interests from './views/interests.js';
import * as needs from './views/needs.js';
import * as suggestions from './views/suggestions.js';
import * as plan from './views/plan.js';
import * as celebration from './views/celebration.js';
import * as pin from './views/pin.js';
import * as caregiver from './views/caregiver.js';
import * as people from './views/people.js';
import * as catalog from './views/catalog.js';

const ROUTES = {
  '': start,
  home,
  interests,
  needs,
  suggestions,
  plan,
  celebration,
  pin,
  caregiver,
  people,
  catalog,
};

export function go(name, params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) q.set(k, v);
  }
  const qs = q.toString();
  const target = `#/${name}${qs ? '?' + qs : ''}`;
  if (location.hash === target) {
    renderRoute();
  } else {
    location.hash = target;
  }
}

function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  const [name, query = ''] = h.split('?');
  return { name, params: Object.fromEntries(new URLSearchParams(query)) };
}

function renderRoute() {
  const { name, params } = parseRoute();
  const view = ROUTES[name];
  stopSpeaking();
  const root = document.getElementById('app');
  root.innerHTML = '';
  window.scrollTo(0, 0);
  if (!view) return go('');
  view.render(root, { store, go, params });
}

window.addEventListener('hashchange', renderRoute);
renderRoute();
