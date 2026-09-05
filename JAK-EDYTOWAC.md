# Jak samodzielnie edytować Czaro-Zielnik

Instrukcja dla Ciebie, nie dla programisty. Wszystko, co dotyczy treści zielnika, siedzi w **jednym pliku**: `src/data/herbs.js`. Reszta kodu rysuje to, co tam wpiszesz.

---

## Zanim zaczniesz: podgląd na żywo

W Terminalu, raz na sesję pracy:

```bash
cd ~/Workspace/Repos/Czaro\ zielnik
npm run dev
```

Otworzy się adres `http://localhost:5173`. Zostaw to okno Terminala otwarte. Teraz każdy zapis pliku od razu odświeża stronę w przeglądarce — piszesz, zapisujesz, patrzysz. Na koniec pracy zamykasz Terminal albo naciskasz `Ctrl + C`.

To jest najważniejszy nawyk: **nie edytuj na ślepo**. Podgląd pokazuje błąd składni natychmiast, zamiast puszczać go na produkcję.

---

## Mapa: co gdzie leży

| chcę zmienić | plik |
|---|---|
| treść hasła, dodać roślinę | `src/data/herbs.js` |
| co się wyświetla w karcie rośliny i w jakiej kolejności | `src/components/HerbDetail.jsx` |
| po czym szuka wyszukiwarka | `src/components/LibraryView.jsx` |
| kolory, czcionki, odstępy | `src/styles.css` |
| ekran główny (zioło dnia, kafle) | `src/components/HomeView.jsx` |
| znak aplikacji | `src/components/Logo.jsx` |
| ikony na telefonie | `scripts/make-icons.py` |

---

## Anatomia hasła

Każda roślina to jeden blok w nawiasach klamrowych. Pełny wzór ze wszystkimi polami:

```js
  {
    id: "tojad",
    namePl: "Tojad",
    nameLat: "Aconitum",
    wiki: "Tojad",
    months: [6, 7, 8],
    part: "Ziele w pełni kwitnienia, w suchy dzień",
    moc: "Tekst o tradycji ludowo-magicznej.",
    zrodlo: "Skąd to wiadomo i jak mocny jest ten zapis.",
    nazwyLudowe: {
      nazwy: ["toja", "mordownik"],
      skad: "Skąd się wzięły te nazwy. Pole opcjonalne.",
      zrodlo: "Gdzie te nazwy zapisano.",
    },
    dzien: "Sobota (Saturn)",
    zywiol: "Ziemia",
    rodzina: "Jaskrowate (Ranunculaceae)",
    kategoria: "Trujące",
    trujaca: true,
    uwaga: "Ostrzeżenie o SAMEJ roślinie.",
    sobowtor: {
      namePl: "Z czym się myli",
      nameLat: "Nazwa łacińska tego czegoś",
      jak: "Po czym poznasz różnicę.",
      ryzyko: "Co się stanie, jeśli pomylisz.",
    },
  },
```

### Co znaczy które pole

**`id`** — wewnętrzna nazwa, mała litera, bez spacji i polskich znaków. **Nigdy go nie zmieniaj po tym, jak hasło trafiło na produkcję.** Po `id` zapamiętane są Moje Zbiory użytkowniczek — zmiana id kasuje im wpis.

**`namePl`, `nameLat`** — sama nazwa, nic więcej. Żadnych wyjaśnień w nawiasie, żadnych „bywa nazywany". Na to są inne pola.

**`wiki`** — dokładny tytuł hasła na `pl.wikipedia.org`, stąd bierze się zdjęcie. Sprawdź, wchodząc na Wikipedię i przepisując tytuł ze strony co do znaku. Zły tytuł = brak zdjęcia.

**`months`** — miesiące zbioru, cyframi: `[6, 7, 8]` to czerwiec–sierpień. Roślina, której się nie zbiera, ma `months: []`.

**`part`** — co i kiedy się zbiera. Przy trujących wpisz `"Nie zbieramy, w Polsce chronione"` albo `"NIE ZBIERAMY — hasło rozpoznawcze"`.

**`moc`** — tradycja ludowo-magiczna. Serce hasła.

**`zrodlo`** — patrz osobny rozdział niżej. To pole odróżnia tę apkę od blogów.

**`nazwyLudowe`** — nazwy gwarowe i dawne. Wyszukiwarka po nich szuka, więc `mordownik` znajduje tojad.

**`dzien`** — dozwolone: `"Poniedziałek (Księżyc)"`, `"Wtorek (Mars)"`, `"Środa (Merkury)"`, `"Czwartek (Jowisz)"`, `"Piątek (Wenus)"`, `"Sobota (Saturn)"`, `"Niedziela (Słońce)"`. Jest też kilka wariantów typu `"Noc świętojańska"` czy `"Piątek / Sobota"`.

**`zywiol`** — dokładnie jedno z: `"Ogień"`, `"Woda"`, `"Powietrze"`, `"Ziemia"`.

**`kategoria`** — dokładnie jedno z: `"Kwiaty"`, `"Liście"`, `"Ziele"`, `"Korzenie"`, `"Kora"`, `"Owoce"`, `"Trujące"`. To są zakładki filtra w Bibliotece. Wpiszesz coś innego — roślina zniknie z każdego filtra.

**`trujaca: true`** — wyłącza roślinę z rotacji „zioła dnia" na ekranie głównym. Trująca roślina nie może witać użytkowniczki jako propozycja.

**`uwaga`** — ostrzeżenie o samej roślinie: toksyczność, interakcje z lekami, ciąża.

**`sobowtor`** — z czym się myli. To jedyna sekcja w apce, która realnie ratuje zdrowie.

Pola opcjonalne można pominąć w całości — nie zostawiaj pustych `""` ani `"..."`, bo wtedy w karcie pojawia się pusty nagłówek.

---

## Jak dodać nową roślinę

1. Otwórz `src/data/herbs.js`.
2. Znajdź miejsce między dwoma hasłami — szukaj linijki `},` a pod nią `{`.
3. Wklej wzór z góry tej instrukcji i wypełnij.
4. Sprawdź, czy blok kończy się `},` z **przecinkiem**.
5. Zapisz i spójrz w przeglądarkę.

Kolejność haseł w pliku nie ma znaczenia dla Biblioteki (sortuje się sama), ale numer w „ARCHIWUM BOTANICZNE" bierze się z pozycji w pliku.

---

## Zasady pisania `zrodlo`

To pole nie mówi, co roślina robi. Mówi, **jak mocno jest to zapisane**. Trzy rzeczy muszą się w nim znaleźć:

**Skąd.** Nie „w polskiej tradycji", tylko konkretnie: autor, tytuł, rok, strona.

```js
zrodlo: "Słownik Adama Fischera, PTL, Wrocław 2016, hasło „Tojad”, s. 479–480."
```

**Jak mocno.** Trzy poziomy, których używamy:
- „bardzo dobrze udokumentowane" — zapis terenowy z podaną miejscowością, Kolberg, Fischer
- „dobrze poświadczone" — powtarzane w literaturze, bez konkretnej lokalizacji
- „zapis słaby" — powtarzane we współczesnym zielarstwie, bez potwierdzenia etnograficznego

**Czyj to głos** — przy źródłach historycznych. Marcin z Urzędowa czasem cytuje Pliniusza po to, żeby go wyśmiać. Bez tej adnotacji przypiszesz mu magię, którą on wprost odrzuca:

```js
zrodlo: "Marcin z Urzędowa, Herbarz Polski, Kraków 1595, s. 177 (ks. I, cap. 201)
         — przepis Pliniusza, przytoczony i odrzucony przez autora."
```

Pełny opis dwóch źródeł, których używamy, i sposób wyszukiwania w nich: dokument `zrodla-etnobotaniczne.md` w projekcie.

---

## Pułapki składni

To jest plik JavaScriptu i on się obraża o drobiazgi. Cztery rzeczy psują wszystko:

**Cudzysłów prosty w środku tekstu.** Tekst otwiera i zamyka `"`. Jeśli wstawisz `"` w środku, tekst się urwie w złym miejscu. Wewnątrz używaj cudzysłowów drukarskich `„ ”` — wyglądają lepiej i nic nie psują.

```js
moc: "Mówiono „nie ruszaj” i odchodzono.",     // dobrze
moc: "Mówiono "nie ruszaj" i odchodzono.",     // ZEPSUTE
```

**Brakujący przecinek** po zamknięciu bloku. Każde hasło kończy się `},`.

**Polski ogonek w `id`.** `id` ma być bez ogonków i bez spacji.

**Skasowany nawias.** Jeśli podgląd nagle pokaże białą stronę, prawie zawsze chodzi o nawias albo cudzysłów. Cofnij ostatnią zmianę (`Cmd + Z`) i spróbuj jeszcze raz mniejszym kawałkiem.

---

## Sprawdzenie, czy nic nie jest zepsute

Zanim wypuścisz zmiany:

```bash
cd ~/Workspace/Repos/Czaro\ zielnik
npm run build
```

Ma się skończyć linijką `✓ built in …`. Jeśli zamiast tego widzisz czerwony błąd — podaje numer linii w `herbs.js`, tam szukaj.

Szybki test samych danych, wypisuje liczbę haseł i wyłapuje zaślepki:

```bash
node --input-type=module -e "
import { HERBS } from './src/data/herbs.js';
console.log('haseł:', HERBS.length);
console.log('zaślepki:', HERBS.filter(h => h.moc === '...' || !h.moc).map(h => h.id).join(', ') || 'brak');
console.log('bez źródła:', HERBS.filter(h => !h.zrodlo).map(h => h.id).join(', ') || 'brak');
"
```

---

## Jak wypuścić zmiany na produkcję

```bash
cd ~/Workspace/Repos/Czaro\ zielnik
git add -A
git commit -m "Krótki opis, co zmieniłaś"
git push origin main
```

Vercel łapie push do `main` sam i przebudowuje `czaro-zielnik.vercel.app` w kilkadziesiąt sekund.

**Najczęstsza pomyłka w tym projekcie:** push do innej gałęzi wygląda jak wdrożenie (dostajesz działający adres), ale główny adres zostaje na starym kodzie. Sprawdzenie, co naprawdę jest na produkcji:

```bash
git fetch origin && git log --oneline origin/main -1
```

Szczegóły o gałęziach, becie dla testerów i APK na Androida: dokument `czaro-zielnik-wdrazanie.md` w projekcie.

**Telefon może pokazywać starą wersję.** Kolejność sprawdzania: czy `origin/main` ma commit → czy deploy w panelu Vercela ma stan **Ready** → dopiero potem ubij aplikację na telefonie i otwórz od nowa. Zminimalizowana PWA potrafi tygodniami serwować stary kod. Ikona na ekranie głównym nie zmienia się nigdy sama — trzeba usunąć skrót i dodać od nowa.

---

## Czego lepiej nie ruszać bez potrzeby

`vite.config.js`, `api/`, `src/utils/`, `src/hooks/` — to jest maszyneria: service worker, kolejka rozpoznań, kompresja zdjęć, klucz API. Działa i jest wystrojona pod pracę bez zasięgu.

`node_modules/` i `dist/` — generowane automatycznie, nie są w repozytorium.

Jeśli git odmówi z powodu `index.lock` po zerwanym połączeniu:

```bash
rm -f .git/index.lock
```

---

## Dostępność — zasady na dalej

Od września 2026 aplikacja jest zgodna z WCAG 2.2 na poziomie AA i ma to taka zostać. Poniżej krótka lista tego, o co trzeba zadbać przy **każdej** kolejnej zmianie. Nie jest długa, bo większość rzeczy dzieje się sama, jeśli pisze się zwykły HTML.

### Sprawdzenie przed wypchnięciem

Przejdź nowy ekran **samym Tabem**, bez dotykania myszy ani ekranu:

- widać, gdzie jesteś (gruba obwódka wokół elementu) — jeśli nie widać, coś nadpisało `outline`,
- da się dojść wszędzie i uruchomić wszystko Enterem albo spacją,
- z okna, które się otworzyło, wychodzi się Escape'em, a fokus wraca tam, skąd przyszedł.

Na Macu: **Cmd + F5** włącza VoiceOver, ten sam skrót wyłącza. Przejdź ekran raz i posłuchaj, czy przyciski mają nazwy — „przycisk" bez nazwy to błąd.

### Kolory

Cała paleta siedzi w `:root` na górze `src/styles.css` i **jest policzona**. Każdy tekst ma wobec swojego tła co najmniej 4,5 : 1, każda obwódka i kreska co najmniej 3 : 1. Jeśli zmieniasz którykolwiek z tych kolorów, policz kontrast na nowo — na przykład na webaim.org/resources/contrastchecker. Zmiana „tylko o odcień" potrafi zejść poniżej progu.

Najczęstsza pułapka: pożyczanie zmiennej od czegoś innego. Plakietka „Zbiór: maj" miała kiedyś tło placeholdera zdjęcia i w ciemnym motywie wychodziło z tego 3,17 : 1. Dlatego ma teraz własne `--tag-month-bg` i `--tag-month-text`.

### Nowy przycisk

```jsx
<button type="button" onClick={...} aria-label="Usuń rumianek z Moich Zbiorów">
  <span aria-hidden="true">✕</span>
</button>
```

- `type="button"` zawsze — bez tego przycisk w formularzu wysyła formularz,
- przycisk z samym znaczkiem albo ikoną **musi** mieć `aria-label` mówiący, co robi i czego dotyczy („Usuń", bez nazwy rośliny, nic nie mówi, gdy takich przycisków jest dwanaście),
- sam znaczek dostaje `aria-hidden="true"` — „✕" czytnik ekranu przeczytałby jako „litera iks".

### Czego nie wolno w `<button>`

W przycisku nie mogą stać `<p>`, `<h2>` ani drugi `<button>`. Zamiast akapitów — `<span>` z `display: block` w CSS. Jeśli wiersz ma dwie akcje (otwórz i usuń), to są dwa przyciski obok siebie, a nie jeden w drugim.

### Ikony i rysunki

Ikony z `Icons.jsx` mają `aria-hidden` domyślnie — są ozdobą przy podpisie słowami. Jeśli rysunek niesie informację, której nigdzie indziej nie ma (jak faza księżyca w pasku tygodnia), dołóż obok tekst w `<span className="visually-hidden">`.

### Zdjęcia

`<HerbImage>` sam pisze opis alternatywny. Gdy stoi wewnątrz przycisku, który i tak nazywa się nazwą rośliny, podaj `decorative` — inaczej czytnik ekranu powtarza nazwę dwa razy.

### Coś się zmieniło na ekranie bez kliknięcia

Jeśli zmiana filtru, przyjście wyniku albo błąd zmienia treść, a fokus zostaje na miejscu, czytnik ekranu o tym nie wie. Trzeba mu powiedzieć:

- `role="status"` — spokojna informacja, doczyta po skończeniu zdania („12 roślin na liście"),
- `role="alert"` — przerywa w pół słowa; tylko dla błędów,
- kontener musi istnieć w drzewie **zanim** coś się w nim pojawi (stąd pusty `.id-progress-live` na ekranie „Rozpoznaj").

### Nowe okno modalne

Użyj `useDialog` z `src/hooks/useDialog.js` — to on trzyma fokus w środku, obsługuje Escape, blokuje przewijanie tła i oddaje fokus tam, skąd przyszedł. Do tego `role="dialog"`, `aria-modal="true"` i `aria-labelledby` wskazujące na nagłówek okna.

### Rozmiar celu dotyku

Każdy przycisk ma co najmniej 44 × 44 px obszaru klikalnego — appka jest używana w terenie, zimną ręką. Jeśli rysunek ma być mniejszy, nie powiększaj przycisku: dopisz go do listy przy `::after` w sekcji DOSTĘPNOŚĆ na końcu `styles.css`, która dokłada niewidoczny margines dotyku. **Uwaga:** ta lista ustawia `position: relative`, więc nie wpisuj tam przycisków, które już stoją na `absolute` albo `fixed` — wylecą poza ekran.

### Automatyczne sprawdzenie

Rozszerzenie **axe DevTools** albo **WAVE** w przeglądarce, na `npm run dev`. Przejdź nim wszystkie pięć ekranów, w jasnym i w ciemnym motywie, plus otwartą kartę rośliny. Stan na wrzesień 2026: zero naruszeń na każdym z nich.
