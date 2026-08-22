// Funkcja serverless (Vercel). Rozpoznawanie roślin przez Pl@ntNet API —
// darmowe do 500 identyfikacji dziennie, bez karty płatniczej, zrobione
// specjalnie do tego zadania (https://my.plantnet.org/).
//
// Ustaw zmienną środowiskową PLANTNET_API_KEY w panelu Vercel przed
// wdrożeniem (Settings → Environment Variables). Klucz zakładasz za darmo
// na https://my.plantnet.org/ → "My API keys".

import { HERBS } from "../src/data/herbs.js";

// Pl@ntNet zwraca np. "Matricaria chamomilla L." — nas interesują tylko
// pierwsze dwa "słowne" człony (rodzaj + gatunek), bez autora taksonu i
// znaków typu "×".
function normalizeLatin(name) {
  if (!name) return "";
  const words = name
    .split(/\s+/)
    .filter((w) => /^[a-zA-ZÀ-ÿ-]+$/.test(w));
  return words.slice(0, 2).join(" ").toLowerCase();
}

function findZielnikMatch(scientificName) {
  const target = normalizeLatin(scientificName);
  if (!target) return null;
  return HERBS.find((h) => normalizeLatin(h.nameLat) === target) || null;
}

function confidenceLabel(score) {
  if (score >= 0.5) return "wysoka";
  if (score >= 0.2) return "srednia";
  return "niska";
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

    const response = await fetch(url, { method: "POST", body: form });
    const data = await response.json();

    if (!response.ok) {
      // Pl@ntNet np. odrzuca zdjęcie, jeśli nie widzi na nim rośliny.
      console.error("Pl@ntNet error:", data);
      res.status(200).json({
        namePl: "Nie rozpoznano",
        nameLat: "",
        pewnosc: "niska",
        opis:
          data?.message ||
          "Nie udało się rozpoznać rośliny na tym zdjęciu. Spróbuj zrobić zdjęcie liścia lub kwiatu z bliska, przy dobrym świetle.",
        ostrzezenie: null,
        zielnikId: null,
      });
      return;
    }

    const top = data.results?.[0];
    if (!top) {
      res.status(200).json({
        namePl: "Nie rozpoznano",
        nameLat: "",
        pewnosc: "niska",
        opis: "Pl@ntNet nie znalazł żadnego pasującego gatunku na tym zdjęciu.",
        ostrzezenie: null,
        zielnikId: null,
      });
      return;
    }

    const match = findZielnikMatch(top.species?.scientificNameWithoutAuthor);
    const pewnosc = confidenceLabel(top.score);
    const percent = Math.round(top.score * 100);
    const commonPl = top.species?.commonNames?.[0];

    const second = data.results?.[1];
    const secondNote =
      second && second.score > top.score * 0.6
        ? ` Możliwa też pomyłka z ${second.species?.scientificNameWithoutAuthor} (${Math.round(
            second.score * 100
          )}% pewności).`
        : "";

    res.status(200).json({
      namePl: match?.namePl || commonPl || top.species?.scientificNameWithoutAuthor,
      nameLat: top.species?.scientificNameWithoutAuthor || "",
      pewnosc,
      opis: `Pl@ntNet rozpoznał tę roślinę z ${percent}% pewnością (rodzina: ${
        top.species?.family?.scientificNameWithoutAuthor || "nieznana"
      }).${secondNote}`,
      ostrzezenie:
        pewnosc === "wysoka"
          ? null
          : "Pewność rozpoznania nie jest wysoka — nie zbieraj ani nie stosuj tej rośliny bez potwierdzenia przez doświadczoną osobę lub atlas roślin. Niektóre gatunki mają toksyczne sobowtóry.",
      zielnikId: match?.id || null,
      rodzina: top.species?.family?.scientificNameWithoutAuthor || null,
    });
  } catch (err) {
    console.error("identify.js error:", err);
    res.status(500).json({ error: "identify_failed" });
  }
}
