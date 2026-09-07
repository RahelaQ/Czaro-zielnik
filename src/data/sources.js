// -----------------------------------------------------------------------------
// NOTA EDUKACYJNA I ŹRÓDŁA
//
// Treść drobnego druku pod każdą kartą rośliny. Stoi w danych, nie w kodzie
// komponentu, z dwóch powodów: żeby dało się ją poprawić bez dotykania JSX-a
// i żeby pod każdym hasłem stała dokładnie ta sama — zmiana tutaj zmienia ją
// w całej appce naraz.
//
// Zasada przy pisaniu tych tekstów jest ta sama, co przy polu `zrodlo`
// w herbs.js: mówimy, skąd wiemy i jak mocno, a tam gdzie nie wiemy —
// mówimy, że nie wiemy. Nota, która obiecuje mniej, niż appka daje, jest
// bezpieczna. Nota, która obiecuje więcej, jest niebezpieczna.
// -----------------------------------------------------------------------------

// Nota widoczna od razu, bez rozwijania, pod kazdym haslem.
//
// Slowa sa autorskie i celowo ulozone w tej kolejnosci: najpierw czym ten
// tekst JEST (material edukacyjny, opis tradycji), potem czym NIE jest
// (diagnoza, leczenie, porada), na koncu co zrobic (skonsultowac sie) i kogo
// dotyczy to najbardziej. Nie przepisuj tego "ladniej" — to jest
// oswiadczenie, nie tekst ozdobny — i nie skracaj wyliczenia na koncu:
// ciaza, karmienie, leki i choroba przewlekla to cztery sytuacje, w ktorych
// ziolo najczesciej robi realna szkode.
export const NOTA_CZYM_JEST =
  "Uwaga: powyższy materiał służy wyłącznie celom edukacyjnym. Czaro-Zielnik opisuje, w co wierzono w tradycji słowiańskiej i gdzie to zapisano. Nie służy diagnozowaniu, leczeniu ani zapobieganiu chorobom i nie jest poradą lekarską. Przed użyciem jakiegokolwiek zioła skonsultuj się z lekarzem lub farmaceutą — szczególnie jeśli jesteś w ciąży, karmisz piersią, przyjmujesz leki albo chorujesz przewlekle.";

// Rozwijana lista. Każdy wpis: skąd bierze się dana warstwa aplikacji.
// Kolejność idzie za tym, co w karcie rośliny widać najwyżej.
export const ZRODLA = [
  {
    tytul: "Tradycja ludowa i nazwy gwarowe",
    tresc:
      "Rośliny w wierzeniach i zwyczajach ludowych. Słownik Adama Fischera, oprac. M. Kujawska, Ł. Łuczaj, J. Sosnowska, P. Klepacki, Polskie Towarzystwo Ludoznawcze, Wrocław 2016 — wydanie maszynopisu Adama Fischera z lat 30. XX wieku. Hasła podają miejscowość, powiat i źródło zapisu, dlatego to one, a nie zbiorcze „w polskiej tradycji”, stoją w polu Zapis.",
  },
  {
    tytul: "Źródło historyczne",
    tresc:
      "Marcin z Urzędowa, Herbarz Polski, Kraków, Drukarnia Łazarzowa 1595. Cytujemy z zaznaczeniem, czyj to głos: autor regularnie przytacza Pliniusza po to, żeby go odrzucić, więc przepis przytoczony nie znaczy przepis zalecany.",
  },
  {
    tytul: "Co znaczy pole „Zapis”",
    tresc:
      "Mówi nie o tym, co roślina robi, tylko jak mocno rzecz jest udokumentowana. Trzy poziomy: bardzo dobrze udokumentowane (zapis terenowy z podaną miejscowością), dobrze poświadczone (powtarzane w literaturze, bez lokalizacji) i zapis słaby (powtarzane we współczesnym zielarstwie, bez potwierdzenia etnograficznego).",
  },
  {
    tytul: "Ostrzeżenia i sobowtóry",
    tresc:
      "Ostrzeżenia mają chronić, nie wyczerpywać temat. Brak ostrzeżenia przy haśle nie znaczy, że roślina jest bezpieczna — znaczy tylko, że nic tu nie zapisano. Rośliny trujące mają w tym zielniku własne hasła po to, żeby je rozpoznać i ominąć, nigdy po to, żeby ich użyć.",
  },
  {
    tytul: "Rozpoznawanie ze zdjęcia",
    tresc:
      "Pl@ntNet (my-api.plantnet.org) — podpowiedź statystyczna oparta na podobieństwie do zdjęć w bazie, nie oznaczenie botaniczne. Zdjęcie idzie wyłącznie tam i nie jest u nas przechowywane. Pozycja zapisywana przy zdjęciu zostaje w telefonie i nigdzie nie jest wysyłana.",
  },
  {
    tytul: "Zdjęcia roślin",
    tresc:
      "Wikimedia Commons, pobierane przez polską Wikipedię; gdy hasła tam nie ma — Unsplash. Autor i licencja stoją pod każdym zdjęciem, bo licencje Commons tego wymagają.",
  },
  {
    tytul: "Fazy księżyca",
    tresc:
      "Liczone astronomicznie w telefonie, z pozycji Słońca i Księżyca — nie pobierane z sieci i nie przybliżane wykresem kołowym.",
  },
  {
    tytul: "Co zostaje w telefonie",
    tresc:
      "Moje Zbiory, notatki i kolejka rozpoznań leżą w pamięci przeglądarki na tym urządzeniu. Aplikacja nie ma kont, nie zbiera statystyk i nie wysyła niczego poza zdjęciem do rozpoznania.",
  },
  {
    tytul: "Sprostowania",
    tresc:
      "Błąd w haśle albo źródło, którego tu brakuje — proszę o wiadomość. Hasła są pisane ręcznie i poprawiane ręcznie; w tym zielniku nie ma tekstów generowanych przez model językowy.",
  },
];
