/**
 * Mój Plan Dnia — słowniki i katalog startowy zajęć.
 *
 * Struktury danych (JSDoc):
 * @typedef {{id: string, label: string, obl: string, emoji: string}} Tag
 *   Tag zainteresowania lub potrzeby. `obl` to forma słowa po „Lubisz…"/„Ćwiczysz…"
 *   (biernik), np. label „Muzyka" → obl „muzykę".
 * @typedef {{id: string, name: string, avatar: string,
 *            interests: string[], needs: string[]}} Profile
 *   Profil uczestnika. `interests`/`needs` to listy id tagów (prefiks i-/n-).
 * @typedef {{id: string, title: string, emoji: string,
 *            category: 'free'|'learn', interests: string[], needs: string[],
 *            howTo: string}} Activity
 *   Zajęcie z katalogu. `category`: 'free' = czas wolny, 'learn' = nauka.
 */

export const CATEGORIES = {
  free: { id: 'free', label: 'Czas wolny', emoji: '🌤️' },
  learn: { id: 'learn', label: 'Nauka i rozwój', emoji: '🌟' },
};

/** Zainteresowania (prefiks id: i-). */
export const INTERESTS = [
  { id: 'i-music', label: 'Muzyka', obl: 'muzykę', emoji: '🎵' },
  { id: 'i-sport', label: 'Sport', obl: 'sport', emoji: '⚽' },
  { id: 'i-cooking', label: 'Gotowanie', obl: 'gotowanie', emoji: '🧑‍🍳' },
  { id: 'i-nature', label: 'Przyroda', obl: 'przyrodę', emoji: '🌳' },
  { id: 'i-animals', label: 'Zwierzęta', obl: 'zwierzęta', emoji: '🐕' },
  { id: 'i-art', label: 'Plastyka', obl: 'plastykę', emoji: '🎨' },
  { id: 'i-computer', label: 'Komputer', obl: 'komputer', emoji: '🖥️' },
  { id: 'i-books', label: 'Książki', obl: 'książki', emoji: '📚' },
  { id: 'i-walk', label: 'Spacery', obl: 'spacery', emoji: '🚶' },
  { id: 'i-dance', label: 'Taniec', obl: 'taniec', emoji: '💃' },
  { id: 'i-film', label: 'Film i teatr', obl: 'filmy i teatr', emoji: '🎬' },
  { id: 'i-crafts', label: 'Rękodzieło', obl: 'rękodzieło', emoji: '🧶' },
];

/** Potrzeby rozwojowe (prefiks id: n-). */
export const NEEDS = [
  { id: 'n-reading', label: 'Czytanie', obl: 'czytanie', emoji: '📖' },
  { id: 'n-writing', label: 'Pisanie', obl: 'pisanie', emoji: '✏️' },
  { id: 'n-counting', label: 'Liczenie', obl: 'liczenie', emoji: '🔢' },
  { id: 'n-memory', label: 'Pamięć', obl: 'pamięć', emoji: '🧠' },
  { id: 'n-movement', label: 'Sprawność ruchowa', obl: 'sprawność ruchową', emoji: '🤸' },
  { id: 'n-communication', label: 'Rozmowa', obl: 'rozmowę', emoji: '🗣️' },
  { id: 'n-independence', label: 'Samodzielność', obl: 'samodzielność', emoji: '🧥' },
  { id: 'n-emotions', label: 'Emocje', obl: 'emocje', emoji: '😊' },
  { id: 'n-cooking', label: 'Gotowanie', obl: 'gotowanie', emoji: '🥪' },
  { id: 'n-money', label: 'Pieniądze', obl: 'pieniądze', emoji: '💰' },
];

/** Wszystkie tagi w jednej mapie: id → Tag. */
export const TAG_BY_ID = Object.fromEntries(
  [...INTERESTS, ...NEEDS].map((t) => [t.id, t]),
);

/** Gotowe awatary do wyboru dla uczestnika. */
export const AVATARS = ['🦊', '🐻', '🐰', '🐱', '🐶', '🦁', '🐧', '🐳', '🦋', '🐢', '🦉', '🐸', '🐼', '🐨', '🦄', '🐝'];

/** Proponowane godziny zajęć w planie dnia. */
export const TIME_SLOTS = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'];

/** Katalog startowy zajęć — opiekun może go edytować w panelu. */
export const SEED_ACTIVITIES = [
  // ---- Czas wolny ----
  { id: 'a1', title: 'Słuchanie muzyki', emoji: '🎵', category: 'free', interests: ['i-music'], needs: [], howTo: 'Wybierz ulubioną piosenkę i włącz ją głośno.' },
  { id: 'a2', title: 'Śpiewanie piosenek', emoji: '🎤', category: 'free', interests: ['i-music'], needs: ['n-communication'], howTo: 'Śpiewaj razem z muzyką.' },
  { id: 'a3', title: 'Gra w piłkę', emoji: '⚽', category: 'free', interests: ['i-sport'], needs: ['n-movement'], howTo: 'Rzucajcie lub kopcie piłkę.' },
  { id: 'a4', title: 'Spacer', emoji: '🚶', category: 'free', interests: ['i-walk', 'i-nature'], needs: ['n-movement'], howTo: 'Wyjdź na spacer i patrz na drzewa.' },
  { id: 'a5', title: 'Zabawy w wodzie', emoji: '🏊', category: 'free', interests: ['i-sport'], needs: ['n-movement'], howTo: 'Za zgodą opiekuna — pluskaj się i pływaj.' },
  { id: 'a6', title: 'Malowanie farbami', emoji: '🎨', category: 'free', interests: ['i-art'], needs: [], howTo: 'Pomaluj obrazek farbami.' },
  { id: 'a7', title: 'Wycinanki', emoji: '✂️', category: 'free', interests: ['i-crafts', 'i-art'], needs: ['n-movement'], howTo: 'Wytnij i naklej kształty na kartkę.' },
  { id: 'a8', title: 'Gry na komputerze', emoji: '🖥️', category: 'free', interests: ['i-computer'], needs: ['n-memory'], howTo: 'Zagraj w prostą grę na komputerze lub tablecie.' },
  { id: 'a9', title: 'Układanie puzzli', emoji: '🧩', category: 'free', interests: ['i-crafts'], needs: ['n-memory', 'n-emotions'], howTo: 'Ułóż puzzle do końca.' },
  { id: 'a10', title: 'Zabawa ze zwierzętami', emoji: '🐕', category: 'free', interests: ['i-animals', 'i-nature'], needs: ['n-emotions'], howTo: 'Pogłaszcz psa i pobaw się z nim.' },
  { id: 'a11', title: 'Przyroda wokół nas', emoji: '🌳', category: 'free', interests: ['i-nature', 'i-walk'], needs: [], howTo: 'Oglądaj rośliny, ptaki i owady.' },
  { id: 'a12', title: 'Taniec', emoji: '💃', category: 'free', interests: ['i-dance', 'i-music'], needs: ['n-movement'], howTo: 'Zatańcz do ulubionej muzyki.' },
  { id: 'a13', title: 'Oglądanie filmu', emoji: '🎬', category: 'free', interests: ['i-film'], needs: [], howTo: 'Wybierz film i obejrzyj go do końca.' },
  { id: 'a14', title: 'Rzucanie do kosza', emoji: '🏀', category: 'free', interests: ['i-sport'], needs: ['n-movement'], howTo: 'Rzucaj piłką do kosza lub do koszyka.' },
  { id: 'a15', title: 'Gry planszowe', emoji: '🎲', category: 'free', interests: ['i-crafts'], needs: ['n-communication', 'n-emotions', 'n-memory'], howTo: 'Zagraj w planszówkę z kimś bliskim.' },
  { id: 'a16', title: 'Granie na instrumentach', emoji: '🎹', category: 'free', interests: ['i-music'], needs: ['n-movement'], howTo: 'Spróbuj grać na bębenku albo dzwonkach.' },
  { id: 'a17', title: 'Czytanie książki', emoji: '📚', category: 'free', interests: ['i-books'], needs: ['n-reading'], howTo: 'Przeczytaj książkę z obrazkami.' },
  { id: 'a18', title: 'Zabawa w teatr', emoji: '🎭', category: 'free', interests: ['i-film', 'i-dance'], needs: ['n-communication', 'n-emotions'], howTo: 'Odtwórz scenkę z bajki.' },

  // ---- Nauka i rozwój ----
  { id: 'a19', title: 'Nauka czytania', emoji: '📖', category: 'learn', interests: [], needs: ['n-reading'], howTo: 'Czytaj krótkie słowa z pomocą.' },
  { id: 'a20', title: 'Pisanie liter', emoji: '✏️', category: 'learn', interests: [], needs: ['n-writing'], howTo: 'Zapisuj litery i proste słowa.' },
  { id: 'a21', title: 'Liczenie', emoji: '🔢', category: 'learn', interests: [], needs: ['n-counting'], howTo: 'Policz przedmioty w pokoju.' },
  { id: 'a22', title: 'Pieniądze', emoji: '💰', category: 'learn', interests: [], needs: ['n-money', 'n-counting'], howTo: 'Poznaj monety i banknoty.' },
  { id: 'a23', title: 'Ćwiczenie pamięci', emoji: '🧠', category: 'learn', interests: [], needs: ['n-memory'], howTo: 'Zagraj w grę pamięciową (memory).' },
  { id: 'a24', title: 'Gimnastyka', emoji: '🤸', category: 'learn', interests: [], needs: ['n-movement'], howTo: 'Zrób proste ćwiczenia: skłony, przysiady.' },
  { id: 'a25', title: 'Rozmowa', emoji: '🗣️', category: 'learn', interests: [], needs: ['n-communication'], howTo: 'Porozmawiaj o tym, co dziś robisz.' },
  { id: 'a26', title: 'Samodzielne ubieranie', emoji: '🧥', category: 'learn', interests: [], needs: ['n-independence'], howTo: 'Ubierz się samodzielnie.' },
  { id: 'a27', title: 'Moje emocje', emoji: '😊', category: 'learn', interests: [], needs: ['n-emotions'], howTo: 'Nazwij, jak się czujesz (radość, smutek…).' },
  { id: 'a28', title: 'Kanapka dla siebie', emoji: '🥪', category: 'learn', interests: ['i-cooking'], needs: ['n-cooking', 'n-independence'], howTo: 'Przygotuj sobie kanapkę.' },
  { id: 'a29', title: 'Zakupy z listą', emoji: '🛒', category: 'learn', interests: [], needs: ['n-money', 'n-counting', 'n-communication', 'n-independence'], howTo: 'Kup z listą rzeczy ze sklepu.' },
  { id: 'a30', title: 'Porządki w pokoju', emoji: '🧹', category: 'learn', interests: [], needs: ['n-independence', 'n-movement'], howTo: 'Posprzątaj swoje rzeczy na miejsce.' },
];
