# Mój Plan Dnia

Aplikacja do układania **planu dnia dla osób z niepełnosprawnością intelektualną**.
Uczestnik wybiera swoje zainteresowania i potrzeby rozwojowe, a aplikacja proponuje
zajęcia (czas wolny + nauka) dopasowane do profilu i pomaga ułożyć z nich plan dnia.
Całość zaprojektowana tak, by obsługiwała ją sama osoba: duże przyciski, karty
obrazkowe, proste zdania, czytanie na głos.

## Uruchomienie

Aplikacja jest statyczna — bez kroku budowania, bez zależności. Wystarczy serwować
katalog:

```bash
cd programuczestnika
python3 -m http.server 4173
```

i otworzyć <http://localhost:4173>.

## Testy

```bash
cd programuczestnika
npm test
```

Testy (`test/store.test.mjs`) pokrywają warstwę danych: profile, katalog,
dopasowanie zajęć, plan dnia i PIN.

## Jak korzystać

**Uczestnik** (główna ścieżka):

1. **Ekran startowy** — wybiera siebie (duża karta z awatarem i imieniem).
2. **Co lubię?** — zaznacza zainteresowania (karty z obrazkami, max 8 na ekran).
3. **Czego chcę się nauczyć?** — zaznacza potrzeby rozwojowe.
4. **Pomysły na dziś** — przegląda propozycje zajęć („Lubisz muzykę", „Ćwiczysz
   liczenie"), dotyka karty, aby dodać ją do planu; może też nacisnąć
   **„Zaproponuj mi plan"** i dostać zbalansowany plan od razu.
5. **Mój plan** — odhacza zajęcia wielkim przyciskiem „Zrobiłem ✓"; pasek postępu
   pokazuje, ile zostało; po ukończeniu — ekran gratulacji. Plan można wydrukować.

**Opiekun** (dolny, dyskretny przycisk „dla opiekuna", PIN domyślnie `1234`):

- **Uczestnicy** — dodawanie, edycja (imię, awatar, zainteresowania, potrzeby)
  i usuwanie profili.
- **Katalog zajęć** — dodawanie, edycja i usuwanie zajęć (tytuł, emoji, kategoria,
  powiązane tagi, opis jak wykonać). Katalog startowy ma 30 zajęć.
- **Zmień PIN** — ustawienie nowego kodu (4 cyfry).

## Struktura

```
programuczestnika/
├── index.html          # powłoka aplikacji
├── css/
│   ├── base.css        # design system (wspólny)
│   ├── participant.css # style widoków uczestnika
│   └── caregiver.css   # style panelu opiekuna
├── js/
│   ├── app.js          # router (hash)
│   ├── data.js         # słowniki tagów + katalog startowy
│   ├── store.js        # warstwa danych (localStorage) + dopasowanie
│   ├── ui.js           # wspólne elementy UI (karty, nagłówek, mowa)
│   └── views/          # ekrany
├── test/
│   └── store.test.mjs  # testy warstwy danych
└── package.json
```

## Uwagi

- Dane trzymane są w `localStorage` przeglądarki — nie ma backendu ani kont.
  Warstwa danych jest wydzielona w `js/store.js`, więc podpięcie synchronizacji
  między tabletami wymaga podmiany tylko tego modułu.
- Czytanie na głos używa Web Speech API przeglądarki (Chrome/Edge/Safari).
  Bez wsparcia mowy aplikacja działa w pełni wizualnie.
