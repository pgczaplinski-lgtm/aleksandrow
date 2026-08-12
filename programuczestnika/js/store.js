/**
 * Mój Plan Dnia — lokalna warstwa danych (localStorage).
 *
 * Jedyny moduł, który czyta i zapisuje dane. Widoki NIE korzystają
 * bezpośrednio z localStorage — tylko z API poniżej.
 *
 * Struktury danych — patrz js/data.js. Dodatkowo:
 * @typedef {{date: string, items: PlanItem[]}} DayPlan  date = 'YYYY-MM-DD'
 * @typedef {{id: string, activityId: string, time: string, done: boolean}} PlanItem
 */

import { SEED_ACTIVITIES, TAG_BY_ID, TIME_SLOTS, CATEGORIES } from './data.js';

const KEY = {
  profiles: 'mpd.profiles',
  catalog: 'mpd.catalog',
  lastPerson: 'mpd.lastPerson',
  plans: 'mpd.plans', // { [personId]: { [date]: DayPlan } }
  pin: 'mpd.pin',
  unlocked: 'mpd.caregiverUnlocked', // sesja: czy panel opiekuna odblokowany
  seeded: 'mpd.seeded', // czy jednorazowy seed profili już wykonany
};

const DEFAULT_PIN = '2323';

/** Fikcyjne profile na pierwsze uruchomienie. */
const SEED_PROFILES = [
  { name: 'Ania', avatar: '🦊', interests: ['i-music', 'i-dance', 'i-art'], needs: ['n-communication', 'n-emotions'] },
  { name: 'Bartek', avatar: '🐻', interests: ['i-sport', 'i-walk', 'i-nature'], needs: ['n-movement', 'n-independence'] },
  { name: 'Kasia', avatar: '🐰', interests: ['i-animals', 'i-books', 'i-crafts'], needs: ['n-reading', 'n-memory'] },
  { name: 'Michał', avatar: '🐱', interests: ['i-computer', 'i-film'], needs: ['n-counting', 'n-money', 'n-writing'] },
];

function uid(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Tworzy magazyn danych. `storage` musi mieć getItem/setItem (jak localStorage)
 * albo być Mapą — wtedy traktowany jak pamięć (do testów w Node).
 */
export function createStore(storage = null) {
  const mem = new Map();
  const s = storage == null && typeof localStorage !== 'undefined' ? localStorage : storage;
  const get = (k, fallback) => {
    try {
      const raw = s && typeof s.getItem === 'function' ? s.getItem(k) : mem.get(k);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  };
  const set = (k, v) => {
    const json = JSON.stringify(v);
    if (s && typeof s.setItem === 'function') s.setItem(k, json);
    else mem.set(k, json);
  };

  /** @returns {Profile[]} */
  function getProfiles() {
    return get(KEY.profiles, []);
  }

  /** Zapisuje profil (dodaje id, gdy nowy). @returns {Profile} */
  function saveProfile(profile) {
    const profiles = getProfiles();
    const idx = profiles.findIndex((p) => p.id === profile.id);
    const saved = idx >= 0 ? { ...profiles[idx], ...profile } : { ...profile, id: profile.id || uid('p') };
    if (idx >= 0) profiles[idx] = saved;
    else profiles.push(saved);
    set(KEY.profiles, profiles);
    return saved;
  }

  function deleteProfile(id) {
    set(KEY.profiles, getProfiles().filter((p) => p.id !== id));
    const plans = get(KEY.plans, {});
    delete plans[id];
    set(KEY.plans, plans);
    if (getLastPersonId() === id) setLastPersonId(null);
  }

  function getLastPersonId() {
    return get(KEY.lastPerson, null);
  }

  function setLastPersonId(id) {
    set(KEY.lastPerson, id);
  }

  /** @returns {Activity[]} */
  function getCatalog() {
    return get(KEY.catalog, null) ?? SEED_ACTIVITIES;
  }

  /** Zapisuje zajęcie (dodaje id, gdy nowe). @returns {Activity} */
  function saveActivity(activity) {
    const catalog = getCatalog();
    const idx = catalog.findIndex((a) => a.id === activity.id);
    const saved = idx >= 0 ? { ...catalog[idx], ...activity } : { ...activity, id: activity.id || uid('a') };
    if (idx >= 0) catalog[idx] = saved;
    else catalog.push(saved);
    set(KEY.catalog, catalog);
    return saved;
  }

  function deleteActivity(id) {
    set(KEY.catalog, getCatalog().filter((a) => a.id !== id));
  }

  // ---- Plan dnia ----

  /** @returns {DayPlan|null} */
  function getPlan(personId, date) {
    return get(KEY.plans, {})[personId]?.[date] ?? null;
  }

  function setPlan(personId, plan) {
    const plans = get(KEY.plans, {});
    plans[personId] = plans[personId] || {};
    plans[personId][plan.date] = plan;
    set(KEY.plans, plans);
    return plan;
  }

  /** Dodaje zajęcie na koniec planu z następną wolną godziną. @returns {DayPlan} */
  function addToPlan(personId, date, activityId) {
    const plan = getPlan(personId, date) || { date, items: [] };
    const act = getCatalog().find((a) => a.id === activityId);
    if (!act) return plan;
    if (plan.items.some((it) => it.activityId === activityId)) return plan; // bez duplikatów
    const time = TIME_SLOTS[Math.min(plan.items.length, TIME_SLOTS.length - 1)];
    plan.items.push({ id: uid('i'), activityId, time, done: false });
    return setPlan(personId, plan);
  }

  function removeFromPlan(personId, date, itemId) {
    const plan = getPlan(personId, date);
    if (!plan) return null;
    plan.items = plan.items.filter((it) => it.id !== itemId);
    return setPlan(personId, plan);
  }

  /** @returns {DayPlan} */
  function toggleDone(personId, date, itemId) {
    const plan = getPlan(personId, date);
    if (!plan) return plan;
    const item = plan.items.find((it) => it.id === itemId);
    if (item) item.done = !item.done;
    return setPlan(personId, plan);
  }

  function clearPlan(personId, date) {
    const plans = get(KEY.plans, {});
    if (plans[personId]) delete plans[personId][date];
    set(KEY.plans, plans);
    return null;
  }

  // ---- Dopasowanie zajęć ----

  function scoreAndReason(act, profile) {
    const matchedInterests = act.interests.filter((t) => profile.interests.includes(t));
    const matchedNeeds = act.needs.filter((t) => profile.needs.includes(t));
    const score = matchedInterests.length + matchedNeeds.length;
    let reason;
    if (score > 0 && matchedInterests.length > 0) {
      reason = `Lubisz ${TAG_BY_ID[matchedInterests[0]].obl}`;
    } else if (score > 0 && matchedNeeds.length > 0) {
      reason = `Ćwiczysz ${TAG_BY_ID[matchedNeeds[0]].obl}`;
    } else {
      reason = 'Nowa rzecz do spróbowania';
    }
    return { score, reason };
  }

  /**
   * Wszystkie zajęcia z katalogu posortowane według dopasowania do profilu
   * (malejąco; zajęcia bez dopasowania na końcu).
   * @returns {{free: Activity[], learn: Activity[]}}
   */
  function matchActivities(profile) {
    const ranked = (category) =>
      getCatalog()
        .filter((a) => a.category === category)
        .map((a, index) => ({ ...a, index, ...scoreAndReason(a, profile) }))
        .sort((x, y) => y.score - x.score || x.index - y.index);
    return { free: ranked('free'), learn: ranked('learn') };
  }

  /**
   * Zbalansowany plan na dziś: na zmianę czas wolny i nauka, według dopasowania.
   * NIE zapisuje planu — widok decyduje.
   * @returns {DayPlan}
   */
  function buildSuggestedPlan(profile, date) {
    const { free, learn } = matchActivities(profile);
    const pick = (list, n) => list.slice(0, n).filter((a) => a.score > 0);
    const freePick = pick(free, 3);
    const learnPick = pick(learn, 3);
    const order = [];
    for (let i = 0; i < Math.max(freePick.length, learnPick.length); i++) {
      if (freePick[i]) order.push(freePick[i]);
      if (learnPick[i]) order.push(learnPick[i]);
    }
    const items = order.map((a, i) => ({
      id: uid('i'),
      activityId: a.id,
      time: TIME_SLOTS[Math.min(i, TIME_SLOTS.length - 1)],
      done: false,
    }));
    return { date, items };
  }

  // ---- PIN panelu opiekuna ----

  function getPin() {
    return get(KEY.pin, DEFAULT_PIN);
  }

  function setPin(pin) {
    if (!/^\d{4}$/.test(String(pin))) return false;
    set(KEY.pin, String(pin));
    return true;
  }

  function checkPin(pin) {
    return String(pin) === getPin();
  }

  function isUnlocked() {
    return get(KEY.unlocked, false) === true;
  }

  function setUnlocked(v) {
    set(KEY.unlocked, v === true);
  }

  /** Kasuje wszystkie dane (przydatne w opiekunie/narażone). */
  function resetAll() {
    for (const k of Object.values(KEY)) {
      if (s && typeof s.removeItem === 'function') s.removeItem(k);
      else mem.delete(k);
    }
  }

  // Jednorazowy seed fikcyjnych profili — tylko gdy magazyn jest pusty.
  if (!get(KEY.seeded, false)) {
    set(KEY.seeded, true);
    if (getProfiles().length === 0) {
      for (const p of SEED_PROFILES) saveProfile(p);
    }
  }

  return {
    getProfiles,
    saveProfile,
    deleteProfile,
    getLastPersonId,
    setLastPersonId,
    getCatalog,
    saveActivity,
    deleteActivity,
    getPlan,
    setPlan,
    addToPlan,
    removeFromPlan,
    toggleDone,
    clearPlan,
    matchActivities,
    buildSuggestedPlan,
    getPin,
    setPin,
    checkPin,
    isUnlocked,
    setUnlocked,
    resetAll,
  };
}

/** Domyślny magazyn aplikacji (w przeglądarce: localStorage). */
export const store = createStore();

export { CATEGORIES, SEED_PROFILES };
