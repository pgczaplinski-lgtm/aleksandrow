/**
 * Testy jednostkowe warstwy danych (store.js) — działają w Node bez przeglądarki.
 * Uruchomienie: npm test (z katalogu programuczestnika) albo node --test test/.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, SEED_PROFILES } from '../js/store.js';
import { SEED_ACTIVITIES, INTERESTS, NEEDS, AVATARS } from '../js/data.js';

function memStore() {
  return createStore(new Map());
}

test('katalog startowy: 30 zajęć, komplet pól, wszystkie tagi w słowniku', () => {
  const s = memStore();
  const catalog = s.getCatalog();
  assert.equal(catalog.length, 30);
  for (const a of catalog) {
    assert.ok(a.id && a.title && a.emoji && a.howTo, `brak pola u ${a.title}`);
    assert.ok(a.category === 'free' || a.category === 'learn');
    for (const t of [...a.interests, ...a.needs]) {
      assert.ok(
        (a.interests.includes(t) && INTERESTS.some((i) => i.id === t)) ||
          (a.needs.includes(t) && NEEDS.some((n) => n.id === t)),
        `nieznany tag ${t} w ${a.title}`,
      );
    }
  }
});

test('pierwsze uruchomienie: seed fikcyjnych profili', () => {
  const s = memStore();
  const profiles = s.getProfiles();
  assert.equal(profiles.length, SEED_PROFILES.length);
  assert.ok(profiles.length >= 3 && profiles.length <= 4);
  for (const p of profiles) {
    assert.ok(p.id && p.name && p.avatar);
    assert.ok(AVATARS.includes(p.avatar), `nieznany awatar ${p.avatar}`);
    assert.ok(p.interests.length > 0 && p.interests.every((t) => INTERESTS.some((i) => i.id === t)));
    assert.ok(p.needs.length > 0 && p.needs.every((t) => NEEDS.some((n) => n.id === t)));
  }
  assert.equal(new Set(profiles.map((p) => p.id)).size, profiles.length);
});

test('seed: nie duplikuje profili', () => {
  const mem = new Map();
  const s = createStore(mem);
  s.getProfiles();
  s.getProfiles();
  const s2 = createStore(mem);
  assert.equal(s.getProfiles().length, SEED_PROFILES.length);
  assert.equal(s2.getProfiles().length, SEED_PROFILES.length);
});

test('seed: usunięcie profilu nie przywraca go', () => {
  const s = memStore();
  const first = s.getProfiles()[0];
  s.deleteProfile(first.id);
  const profiles = s.getProfiles();
  assert.equal(profiles.length, SEED_PROFILES.length - 1);
  assert.ok(!profiles.some((p) => p.id === first.id));
});

test('seed: resetAll czyści flagę — nowy store seeduje ponownie', () => {
  const mem = new Map();
  const s = createStore(mem);
  assert.equal(s.getProfiles().length, SEED_PROFILES.length);
  s.resetAll();
  const s2 = createStore(mem);
  assert.equal(s2.getProfiles().length, SEED_PROFILES.length);
});

test('profile: zapis, odczyt, usunięcie, id nadawane automatycznie', () => {
  const s = memStore();
  const saved = s.saveProfile({ name: 'Ania', avatar: '🦊', interests: ['i-music'], needs: ['n-reading'] });
  assert.ok(saved.id);
  assert.ok(s.getProfiles().some((p) => p.id === saved.id));
  s.saveProfile({ ...saved, interests: ['i-music', 'i-dance'] });
  assert.deepEqual(s.getProfiles().find((p) => p.id === saved.id).interests, ['i-music', 'i-dance']);
  s.deleteProfile(saved.id);
  assert.ok(!s.getProfiles().some((p) => p.id === saved.id));
});

test('ostatnio wybrana osoba', () => {
  const s = memStore();
  assert.equal(s.getLastPersonId(), null);
  s.setLastPersonId('p-x');
  assert.equal(s.getLastPersonId(), 'p-x');
});

test('dopasowanie: profil muzyczny → słuchanie muzyki na górze czasu wolnego', () => {
  const s = memStore();
  const profile = { id: 'p1', name: 'X', avatar: '🦊', interests: ['i-music'], needs: [] };
  const { free, learn } = s.matchActivities(profile);
  assert.equal(free[0].id, 'a1');
  assert.match(free[0].reason, /muzyk/);
  assert.equal(free[0].score, 1);
  // Zajęcia nauki bez dopasowania — na końcu listy, ze score 0
  assert.ok(learn.every((a) => a.score === 0));
});

test('dopasowanie: profil bez tagów → wszystkie zajęcia z „Nowa rzecz do spróbowania"', () => {
  const s = memStore();
  const profile = { id: 'p2', name: 'X', avatar: '🦊', interests: [], needs: [] };
  const { free, learn } = s.matchActivities(profile);
  assert.equal(free.length + learn.length, 30);
  assert.ok([...free, ...learn].every((a) => a.reason === 'Nowa rzecz do spróbowania' && a.score === 0));
});

test('dopasowanie: potrzeba liczenia → „Liczenie" i „Pieniądze" na górze nauki', () => {
  const s = memStore();
  const profile = { id: 'p3', name: 'X', avatar: '🦊', interests: [], needs: ['n-counting'] };
  const { learn } = s.matchActivities(profile);
  assert.equal(learn[0].id, 'a21');
  assert.match(learn[0].reason, /liczeni/);
});

test('katalog: edycja i usuwanie zajęć przez opiekuna', () => {
  const s = memStore();
  const a = s.saveActivity({ title: 'Testowe', emoji: '🧪', category: 'free', interests: [], needs: [], howTo: 'x' });
  assert.ok(a.id);
  assert.ok(s.getCatalog().some((x) => x.id === a.id));
  s.deleteActivity(a.id);
  assert.ok(!s.getCatalog().some((x) => x.id === a.id));
});

test('plan dnia: dodawanie bez duplikatów, godziny z TIME_SLOTS', () => {
  const s = memStore();
  assert.equal(s.getPlan('p1', '2026-01-01'), null);
  let plan = s.addToPlan('p1', '2026-01-01', 'a1');
  assert.equal(plan.items.length, 1);
  assert.equal(plan.items[0].time, '09:00');
  plan = s.addToPlan('p1', '2026-01-01', 'a1'); // duplikat ignorowany
  assert.equal(plan.items.length, 1);
  s.addToPlan('p1', '2026-01-01', 'a3');
  assert.equal(s.getPlan('p1', '2026-01-01').items.length, 2);
});

test('plan dnia: odhaczanie, usuwanie, czyszczenie', () => {
  const s = memStore();
  s.addToPlan('p1', '2026-01-01', 'a1');
  s.addToPlan('p1', '2026-01-01', 'a3');
  const plan = s.getPlan('p1', '2026-01-01');
  const [first, second] = plan.items;
  s.toggleDone('p1', '2026-01-01', first.id);
  let updated = s.getPlan('p1', '2026-01-01');
  assert.equal(updated.items[0].done, true);
  s.toggleDone('p1', '2026-01-01', first.id);
  updated = s.getPlan('p1', '2026-01-01');
  assert.equal(updated.items[0].done, false);
  s.removeFromPlan('p1', '2026-01-01', second.id);
  assert.equal(s.getPlan('p1', '2026-01-01').items.length, 1);
  s.clearPlan('p1', '2026-01-01');
  assert.equal(s.getPlan('p1', '2026-01-01'), null);
});

test('proponowany plan: zbalansowany (czas wolny + nauka), tylko dopasowane zajęcia', () => {
  const s = memStore();
  const profile = { id: 'p4', name: 'X', avatar: '🦊', interests: ['i-music', 'i-sport'], needs: ['n-counting', 'n-movement'] };
  const plan = s.buildSuggestedPlan(profile, '2026-01-01');
  assert.ok(plan.items.length >= 4 && plan.items.length <= 6);
  const cats = plan.items.map((it) => s.getCatalog().find((a) => a.id === it.activityId).category);
  assert.ok(cats.includes('free') && cats.includes('learn'));
  assert.ok(plan.items.every((it) => !it.done));
  assert.equal(plan.date, '2026-01-01');
});

test('PIN: domyślny 2323, zmiana tylko na 4 cyfry', () => {
  const s = memStore();
  assert.equal(s.getPin(), '2323');
  assert.ok(s.checkPin('2323'));
  assert.ok(!s.checkPin('0000'));
  assert.equal(s.setPin('9999'), true);
  assert.ok(s.checkPin('9999'));
  assert.equal(s.setPin('abc'), false);
  assert.equal(s.getPin(), '9999');
});

test('separacja magazynów: dwa store nie widzą swoich danych', () => {
  const a = memStore();
  const b = memStore();
  a.saveProfile({ name: 'Ania', avatar: '🦊', interests: [], needs: [] });
  assert.equal(b.getProfiles().length, 0);
});
