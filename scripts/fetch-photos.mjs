#!/usr/bin/env node
// ---------------------------------------------------------------------------
// POBIERANIE ZDJĘĆ ZIÓŁ Z WIKIMEDIA COMMONS
//
// Odpalasz u siebie, ze zwykłego terminala (nie z Cowork — piaskownica nie ma
// dostępu do Wikimediów):
//
//     node scripts/fetch-photos.mjs
//     node scripts/fetch-photos.mjs --force     # nadpisz istniejące
//     node scripts/fetch-photos.mjs rumianek mieta    # tylko wybrane
//
// Co robi:
//   1. dla każdego hasła pyta polską Wikipedię o zdjęcie główne,
//   2. bierze gotową miniaturę 900 px (Wikimedia skaluje po swojej stronie,
//      więc nie potrzebujemy żadnej biblioteki graficznej),
//   3. dociąga autora i licencję — Commons tego wymaga i to nie jest opcjonalne,
//   4. zapisuje do public/herbs/<id>.jpg,
//   5. generuje src/data/herbPhotos.js z podpisami.
//
// Po tym zdjęcia są w repo, więc idą do precache service workera i wyświetlają
// się w lesie bez zasięgu, natychmiast.
// ---------------------------------------------------------------------------

import { writeFile, mkdir, access } from "node:fs/promises";
import { HERBS } from "../src/data/herbs.js";

const OUT_DIR = "public/herbs";
const THUMB_PX = 900;
const UA = "Czaro-Zielnik/0.1 (aplikacja zielarska; kontakt przez repozytorium)";

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url =
    "https://pl.wikipedia.org/w/api.php?" +
    new URLSearchParams({ format: "json", formatversion: "2", ...params });
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}

// Wikipedia oddaje miniaturę i nazwę pliku źródłowego jednym zapytaniem.
async function pageImage(title) {
  const json = await api({
    action: "query",
    prop: "pageimages",
    piprop: "thumbnail|name",
    pithumbsize: String(THUMB_PX),
    titles: title,
  });
  const page = json?.query?.pages?.[0];
  if (!page || page.missing) return null;
  return {
    thumb: page.thumbnail?.source || null,
    file: page.pageimage ? `File:${page.pageimage}` : null,
  };
}

// Licencja i autor. Bez tego nie wolno tych zdjęć opublikować.
async function fileCredit(fileTitle) {
  const json = await api({
    action: "query",
    prop: "imageinfo",
    iiprop: "extmetadata|url",
    titles: fileTitle,
  });
  const info = json?.query?.pages?.[0]?.imageinfo?.[0];
  const meta = info?.extmetadata || {};
  const strip = (html) =>
    html ? String(html).replace(/<[^>]*>/g, "").trim() : null;
  return {
    autor: strip(meta.Artist?.value) || "nieznany",
    licencja: strip(meta.LicenseShortName?.value) || "patrz Commons",
    zrodlo: info?.descriptionurl || null,
  };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const targets = only.length ? HERBS.filter((h) => only.includes(h.id)) : HERBS;

await mkdir(OUT_DIR, { recursive: true });

const photos = {};
let pobrane = 0,
  pominiete = 0,
  bledy = 0;

for (const herb of targets) {
  const dest = `${OUT_DIR}/${herb.id}.jpg`;

  if (!force && (await exists(dest))) {
    console.log(`  ·  ${herb.id} — już jest, pomijam`);
    pominiete++;
    continue;
  }

  try {
    const found = await pageImage(herb.wiki || herb.namePl);
    if (!found?.thumb) {
      console.log(`  ✗  ${herb.id} — Wikipedia nie ma zdjęcia dla "${herb.wiki}"`);
      bledy++;
      continue;
    }

    const bin = await fetch(found.thumb, { headers: { "User-Agent": UA } });
    if (!bin.ok) throw new Error(`pobieranie ${bin.status}`);
    await writeFile(dest, Buffer.from(await bin.arrayBuffer()));

    const credit = found.file ? await fileCredit(found.file) : {};
    photos[herb.id] = { plik: `/herbs/${herb.id}.jpg`, ...credit };

    const kb = Math.round((await bin.headers.get("content-length")) / 1024) || "?";
    console.log(`  ✓  ${herb.id} — ${kb} KB, ${credit.licencja || "?"}`);
    pobrane++;

    // Wikimedia prosi o nieuderzanie zbyt gęsto. To nie jest opcjonalne.
    await sleep(250);
  } catch (err) {
    console.log(`  ✗  ${herb.id} — ${err.message}`);
    bledy++;
  }
}

// Plik z podpisami dopisujemy tylko dla tego, co faktycznie pobraliśmy;
// przy zbiorze częściowym scalamy ze starym, żeby nie zgubić poprzednich.
let poprzednie = {};
try {
  const mod = await import("../src/data/herbPhotos.js");
  poprzednie = mod.HERB_PHOTOS || {};
} catch {
  // pierwszy przebieg, nie ma czego scalać
}

const scalone = { ...poprzednie, ...photos };
const body = `// PLIK GENEROWANY — nie edytuj ręcznie.
// Źródło: scripts/fetch-photos.mjs (Wikimedia Commons).
// Autor i licencja każdego zdjęcia MUSZĄ być pokazane w interfejsie —
// tego wymagają licencje CC, na których stoi Commons.

export const HERB_PHOTOS = ${JSON.stringify(scalone, null, 2)};
`;
await writeFile("src/data/herbPhotos.js", body);

console.log(
  `\nPobrane: ${pobrane} · pominięte: ${pominiete} · bez zdjęcia: ${bledy}` +
    `\nPodpisy zapisane w src/data/herbPhotos.js (${Object.keys(scalone).length} pozycji).`
);
