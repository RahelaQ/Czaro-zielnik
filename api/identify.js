// ---------------------------------------------------------------------------
// Funkcja serverless (Vercel). Rozpoznawanie roślin przez Pl@ntNet API.
// Darmowy klucz: https://my.plantnet.org/ → "My API keys".
// Zmienna środowiskowa: PLANTNET_API_KEY (Vercel → Settings → Environment
// Variables). Bez niej endpoint zwraca 500 z kodem missing_api_key, który
// appka pokazuje jako czytelny komunikat, a nie jako "nie udało się".
//
// Dopasowanie idzie trzema stopniami, żeby wynik NIGDY nie był pusty:
//   1. pełne hasło w zielniku      → karta z tradycją, kalendarzem, ostrzeżeniami
//   2. indeks rozpoznawczy         → polska nazwa, rodzina, wzmianka o leczeniu
//   3. sama odpowiedź Pl@ntNet     → łacina i rodzina
// Wcześniej istniał tylko stopień 1 na trzynastu ziołach, więc praktycznie
// wszystko wracało bez polskiej nazwy i bez treści.
// ---------------------------------------------------------------------------

import { HERBS } from "../src/data/herbs.js";
import { lookupSpecies, normalizeLatin } from "../src/data/speciesIndex.js";

const PLANTNET_TIMEOUT_MS = 20000;

function findZielnikMatch(scientificName) {
  const target = normalizeLatin(scientificName);
  if (!target) return null;
  return HERBS.find((h) => normalizeLatin(h.nameLat) === target) || null;
}

function confidenceLabel(score) {
  if (score >= 0.5) return "wysoka";
  if (score >= 0.2) return "średnia";
  return "niska";
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function nieRozpoznano(opis) {
  return {
    namePl: "Nie rozpoznano",
    nameLat: "",
    pewnosc: "niska",
    opis,
    ostrzezenie: null,
    zielnikId: null,
    zrodloWpisu: "brak",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const { image, mediaType } = req.body || {};
  if (!image) {
    res.status(400).json({ error: "missing_image" });
    return;
  }

  if (!process.env.PLANTNET_API_KEY) {
    console.error("Brak PLANTNET_API_KEY w zmiennych środowiskowych.");
    res.status(500).json({ error: "missing_api_key" });
    return;
  }

  try {
    const buffer = Buffer.from(image, "base64");
    const blob = new Blob([buffer], { type: mediaType || "image/jpeg" });

    const form = new FormData();
    form.append("images", blob, "photo.jpg");
    form.append("organs", "auto");

    const url =
      "https://my-api.plantnet.org/v2/identify/all" +
      "?api-key=" +
      process.env.PLANTNET_API_KEY +
      "&lang=pl&nb-results=3";

    // Bez własnego limitu czasu funkcja potrafiła wisieć aż do ścięcia przez
    // platformę, a telefon w terenie dostawał wtedy stronę błędu zamiast JSON-a.
    const upstream = AbortSignal.timeout
      ? AbortSignal.timeout(PLANTNET_TIMEOUT_MS)
      : undefined;

    const response = await fetch(url, {
      method: "POST",
      body: form,
      signal: upstream,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Pl@ntNet error:", response.status, data);
      res.status(200).json(
        nieRozpoznano(
          data?.message ||
            "Pl@ntNet nie rozpoznał rośliny na tym zdjęciu. Spróbuj sfotografować pojedynczy liść albo kwiat z bliska, na spokojnym tle."
        )
      );
      return;
    }

    const top = data?.results?.[0];
    if (!top) {
      res
        .status(200)
        .json(
          nieRozpoznano(
            "Pl@ntNet nie znalazł żadnego pasującego gatunku. Najlepiej działa zdjęcie jednego organu — liścia, kwiatu, owocu lub kory — wypełniającego kadr."
          )
        );
      return;
    }

    const scientific = top.species?.scientificNameWithoutAuthor || "";
    const family = top.species?.family?.scientificNameWithoutAuthor || null;
    const percent = Math.round((top.score || 0) * 100);
    const pewnosc = confidenceLabel(top.score || 0);

    const herb = findZielnikMatch(scientific);
    const indexed = herb ? null : lookupSpecies(scientific);

    // Drugie trafienie warto pokazać tylko wtedy, gdy naprawdę konkuruje
    // z pierwszym — inaczej każdy wynik straszy pomyłką bez powodu.
    const second = data.results?.[1];
    const secondNote =
      second && second.score > (top.score || 0) * 0.6
        ? ` Możliwa też pomyłka z ${second.species?.scientificNameWithoutAuthor} (${Math.round(
            second.score * 100
          )}%).`
        : "";

    let namePl;
    let zrodloWpisu;
    let opis;

    if (herb) {
      namePl = herb.namePl;
      zrodloWpisu = "zielnik";
      opis = `Rozpoznane z ${percent}% pewnością. To hasło jest w Twoim zielniku — otwórz kartę, żeby zobaczyć kalendarz zbioru i tradycję.${secondNote}`;
    } else if (indexed) {
      namePl = capitalize(indexed.namePl);
      zrodloWpisu = "indeks";
      const leczniczaNota = indexed.trujaca
        ? " Roślina notowana jako trująca."
        : indexed.lecznicza
          ? " Ma udokumentowane użycie zielarskie, ale nie ma jeszcze pełnego hasła w zielniku."
          : " Brak wzmianki o użyciu leczniczym.";
      opis = `Rozpoznane z ${percent}% pewnością (rodzina: ${indexed.rodzina}).${leczniczaNota}${secondNote}`;
    } else {
      namePl = top.species?.commonNames?.[0] || scientific;
      zrodloWpisu = "plantnet";
      opis = `Rozpoznane z ${percent}% pewnością (rodzina: ${family || "nieznana"}). Tego gatunku nie ma jeszcze w zielniku ani w indeksie.${secondNote}`;
    }

    // Ostrzeżenia idą kaskadą od najostrzejszego: własne hasło wie najwięcej,
    // potem indeks, na końcu sama niepewność rozpoznania.
    //
    // Sobowtór MUSI być w tej kaskadzie. Wcześniej go nie było i cztery hasła
    // z opisanym sobowtórem, ale bez pola `uwaga` — podagrycznik, rumianek,
    // macierzanka, łopian — przy wysokiej pewności wypadały z niej na wylot
    // i wracały z ostrzezenie: null. Podagrycznik myli się ze szczwołem
    // plamistym, czyli rośliną, którą otruto Sokratesa. Wychodziło na to, że
    // im lepiej Pl@ntNet rozpoznał roślinę, tym mniej ostrzeżeń dostawała
    // użytkowniczka.
    //
    // Pole `sobowtor` idzie osobno w odpowiedzi i to ono jest pokazywane
    // porządnie (IdentifyView). Tutaj streszczamy je jeszcze raz w `ostrzezenie`
    // celowo: telefon z zainstalowaną PWA potrafi długo trzymać stary bundel,
    // a starszy widok czytał wyłącznie to jedno pole.
    let ostrzezenie = null;
    let ostrzezenieZrodlo = null;
    if (herb?.uwaga) {
      ostrzezenie = herb.uwaga;
      ostrzezenieZrodlo = "roslina";
    } else if (indexed?.trujaca) {
      ostrzezenie =
        "Ta roślina jest notowana jako trująca. Nie zbieraj jej i nie stosuj.";
      ostrzezenieZrodlo = "roslina";
    } else if (herb?.sobowtor) {
      ostrzezenie =
        `Można pomylić z: ${herb.sobowtor.namePl} (${herb.sobowtor.nameLat}). ` +
        `Ryzyko pomyłki: ${herb.sobowtor.ryzyko}`;
      ostrzezenieZrodlo = "sobowtor";
    } else if (pewnosc !== "wysoka") {
      ostrzezenie =
        "Pewność rozpoznania nie jest wysoka — nie zbieraj ani nie stosuj tej rośliny bez potwierdzenia przez doświadczoną osobę lub atlas roślin. Niektóre gatunki mają toksyczne sobowtóry.";
      ostrzezenieZrodlo = "pewnosc";
    }

    res.status(200).json({
      namePl,
      nameLat: scientific,
      pewnosc,
      procent: percent,
      opis,
      ostrzezenie,
      // Skąd wzięło się `ostrzezenie`. Nowy widok pomija pudełko, gdy treść
      // jest streszczeniem sobowtóra, bo zaraz pod spodem rysuje go w całości
      // — bez tego użytkowniczka czyta to samo dwa razy. Starszy widok, który
      // tego pola nie zna, pokaże streszczenie i nadal będzie ostrzeżony.
      ostrzezenieZrodlo,
      zielnikId: herb?.id || null,
      rodzina: herb?.rodzina || indexed?.rodzina || family,
      lecznicza: herb ? true : indexed?.lecznicza ?? null,
      trujaca: herb?.trujaca || indexed?.trujaca || false,
      sobowtor: herb?.sobowtor || null,
      zrodloWpisu,
    });
  } catch (err) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      console.error("Pl@ntNet timeout");
      res.status(504).json({ error: "upstream_timeout" });
      return;
    }
    console.error("identify.js error:", err);
    res.status(500).json({ error: "identify_failed" });
  }
}
