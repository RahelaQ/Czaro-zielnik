# 🌿 Czaro-Zielnik

Osobisty zielnik ziół polskich — nazwy polskie i łacińskie, zdjęcia z Wikipedii, kalendarz zbioru, tradycje ludowo-magiczne przypisane do każdej
rośliny, notatki własne oraz rozpoznawanie roślin ze zdjęcia (Pl@ntNet —darmowe, do 500 zdjęć dziennie).

## Struktura projektu

```
src/
  data/herbs.js            — Biblioteka: baza ziół (tu dopisujesz kolejne rośliny)
  hooks/useHerbImage.js    — zdjęcia: najpierw Unsplash, potem Wikimedia (fallback)
  hooks/useHerbNote.js     — Twoje notatki (localStorage)
  hooks/useMyCollection.js — Moje Zbiory: co dodałaś (localStorage)
  components/
    HomeView.jsx           — ekran startowy: Zioło dnia + szybki dostęp
    LibraryView.jsx        — Biblioteka: pełna lista + szukajka
    MyCollectionView.jsx   — Moje Zbiory: tylko to, co dodałaś
    HerbCard.jsx / HerbDetail.jsx / CalendarView.jsx / IdentifyView.jsx
  App.jsx                  — spina wszystko w całość, routing zakładek
api/
  identify.js              — funkcja serwerowa, bezpiecznie woła Pl@ntNet API
  images.js                — funkcja serwerowa, bezpiecznie woła Unsplash API
```

## 1. Uruchomienie lokalnie (na komputerze)

Potrzebujesz zainstalowanego [Node.js](https://nodejs.org) (wersja 18+).

### Szybki podgląd (bez rozpoznawania zdjęć)

```bash
npm install
npm run dev
```

Aplikacja otworzy się pod `http://localhost:5173`. **Home**, **Biblioteka**,
**Moje Zbiory** i **Kalendarz** działają od razu — możesz dodawać rośliny do
zbiorów, przeglądać, wszystko zapisuje się lokalnie w przeglądarce.

Zdjęcia ziół (Unsplash → Wikimedia) też się pobiorą, bo lecą bezpośrednio z
przeglądarki do zewnętrznych API — to nie wymaga backendu.

### Pełny podgląd (razem z zakładką „Rozpoznaj")

Zakładka **Rozpoznaj** i endpoint `/api/images` to funkcje serwerowe
(Vercel) — `npm run dev` (czysty Vite) ich nie uruchamia, dostaniesz błąd
404 przy próbie zrobienia zdjęcia. Żeby zobaczyć to lokalnie, potrzebujesz
Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

Przy pierwszym uruchomieniu `vercel dev` zapyta, czy połączyć projekt z
Twoim kontem Vercel — potwierdź. Poda inny port (zwykle
`http://localhost:3000`), pod nim zadziała już wszystko, łącznie z
rozpoznawaniem zdjęć i zdjęciami z Unsplash — **pod warunkiem że masz
lokalny plik `.env.local`** z kluczami (patrz niżej), bo `vercel dev` nie
korzysta automatycznie z kluczy ustawionych w panelu Vercel online.

Stwórz w głównym folderze projektu plik `.env.local` (nie commituj go do
gita — jest już w `.gitignore`):

```
PLANTNET_API_KEY=twoj_klucz_tutaj
UNSPLASH_ACCESS_KEY=twoj_klucz_tutaj
```

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
   - `PLANTNET_API_KEY` = Twój darmowy klucz z [my.plantnet.org](https://my.plantnet.org/)
     (zakładka "My API keys" — zakładanie konta i klucz nic nie kosztują)
4. Kliknij **Deploy**. Po chwili dostaniesz publiczny adres, np.
   `czaro-zielnik.vercel.app` — to już działająca aplikacja, dostępna z
   telefonu.

Uwaga: rozpoznawanie zdjęć jest darmowe do 500 identyfikacji dziennie —
z ogromnym zapasem na potrzeby osobistej aplikacji. Licznik pozostałych
zapytań na dany dzień widać w panelu na my.plantnet.org.

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
