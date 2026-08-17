# 🌿 Czaro-Zielnik

Osobisty zielnik ziół polskich — nazwy polskie i łacińskie, zdjęcia z
Wikipedii, kalendarz zbioru, tradycje ludowo-magiczne przypisane do każdej
rośliny, notatki własne oraz rozpoznawanie roślin ze zdjęcia (Claude Vision).

## Struktura projektu

```
src/
  data/herbs.js          — baza ziół (tu dopisujesz kolejne rośliny)
  hooks/useWikiImage.js  — pobieranie zdjęć z Wikipedii
  hooks/useHerbNote.js   — zapisywanie Twoich notatek (localStorage)
  components/            — widoki: karta, szczegóły, kalendarz, rozpoznawanie
  App.jsx                — spina wszystko w całość
api/identify.js          — funkcja serwerowa, bezpiecznie woła Anthropic API
```

## 1. Uruchomienie lokalnie (na komputerze)

Potrzebujesz zainstalowanego [Node.js](https://nodejs.org) (wersja 18+).

```bash
npm install
npm run dev
```

Aplikacja otworzy się pod `http://localhost:5173`. Zakładki **Zielnik** i
**Kalendarz** będą działać od razu. Zakładka **Rozpoznaj** wymaga wdrożenia
(patrz krok 3) albo lokalnego serwera funkcji — na start możesz ją pominąć.

## 2. Wrzucenie na GitHub

```bash
git init
git add .
git commit -m "Pierwsza wersja zielnika"
```

Potem stwórz puste repozytorium na [github.com](https://github.com/new) i
wykonaj polecenia, które GitHub Ci pokaże (`git remote add origin ...`,
`git push`).

## 3. Wdrożenie w internecie — Vercel (za darmo)

1. Wejdź na [vercel.com](https://vercel.com), zaloguj się przez GitHub.
2. Kliknij **Add New → Project**, wybierz swoje repo `czaro-zielnik`.
3. W ustawieniach projektu → **Environment Variables** dodaj:
   - `ANTHROPIC_API_KEY` = Twój klucz z [console.anthropic.com](https://console.anthropic.com)
     (zakładka API Keys)
4. Kliknij **Deploy**. Po chwili dostaniesz publiczny adres, np.
   `czaro-zielnik.vercel.app` — to już działająca aplikacja, dostępna z
   telefonu.

Uwaga: rozpoznawanie zdjęć kosztuje (opłata za wywołania API Anthropic wg
zużycia — grosze za zdjęcie, ale warto pilnować limitów w konsoli
Anthropic).

## 4. Zainstalowanie na telefonie (jak prawdziwa aplikacja)

Aplikacja jest skonfigurowana jako PWA (Progressive Web App):

- **Android (Chrome)**: wejdź na swój adres Vercel → menu (⋮) → *Dodaj do
  ekranu głównego*.
- **iPhone (Safari)**: wejdź na adres → przycisk *Udostępnij* → *Dodaj do
  ekranu początkowego*.

Od tej pory ikonka "Zielnik z Mocą" będzie na ekranie głównym telefonu,
otwiera się bez paska adresu, jak normalna aplikacja.

## Dopisywanie kolejnych ziół

Otwórz `src/data/herbs.js` i dodaj kolejny obiekt do tablicy `HERBS`, np.:

```js
{
  id: "lubczyk",
  namePl: "Lubczyk ogrodowy",
  nameLat: "Levisticum officinale",
  wiki: "Lubczyk ogrodowy",       // dokładny tytuł hasła na pl.wikipedia.org
  months: [6, 7, 8],
  part: "Liście i korzeń",
  moc: "...",
  dzien: "...",
  zywiol: "...",
},
```

Zdjęcie pobierze się samo z Wikipedii, jeśli tytuł hasła (`wiki`) jest
poprawny.

## Ikony aplikacji

W `public/` brakuje jeszcze `icon-192.png` i `icon-512.png` (ikonka na
ekranie telefonu) oraz `favicon.svg`. Możesz dorzucić własne — np.
narysowany listek albo zdjęcie ziół — albo poproś mnie, żebym pomogła je
przygotować.
