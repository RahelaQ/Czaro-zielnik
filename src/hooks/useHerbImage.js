import { useEffect, useMemo, useState } from "react";
import { HERB_PHOTOS } from "../data/herbPhotos.js";

// ---------------------------------------------------------------------------
// ZDJĘCIE ROŚLINY — kolejność ma znaczenie w terenie.
//
//   1) zdjęcie wbudowane w appkę (public/herbs/) — natychmiast, bez sieci
//   2) Wikimedia Commons — trafne botanicznie
//   3) Unsplash — ładniejsze, ale często trafia w zupełnie inny gatunek
//
// Poprzednia wersja pytała najpierw Unsplash, przy KAŻDYM otwarciu karty
// i zawsze przez sieć. W lesie to znaczyło: karta wisi, aż fetch padnie
// po timeoucie. Teraz bez zasięgu w ogóle nie próbujemy sieci — pokazujemy
// zdjęcie wbudowane albo od razu znak zastępczy.
//
// Zdjęcia pobrane raz z sieci zostają w cache service workera (patrz
// vite.config.js), więc drugi raz też są natychmiastowe.
// ---------------------------------------------------------------------------

const imageCache = new Map();

// HERB_PHOTOS[id] moze byc pojedynczym zdjeciem albo lista. Oba zapisy sa
// poprawne, zeby dorzucenie drugiego zdjecia nie wymagalo przepisywania
// calego pliku danych — wystarczy zamienic obiekt na { zdjecia: [...] }.
function zdjeciaWbudowane(id) {
  const wpis = id ? HERB_PHOTOS[id] : null;
  if (!wpis) return [];
  const lista = Array.isArray(wpis) ? wpis : wpis.zdjecia || [wpis];
  return lista
    .filter((z) => z && z.plik)
    .map((z) => ({
      src: z.plik,
      credit: {
        name: z.autor,
        link: z.zrodlo,
        licencja: z.licencja,
        zrodlo: "Wikimedia Commons",
      },
    }));
}

async function fetchWikimedia(title) {
  const url =
    "https://pl.wikipedia.org/w/api.php" +
    "?action=query&format=json&origin=*&formatversion=2" +
    "&prop=pageimages&piprop=original|thumbnail&pithumbsize=700" +
    "&titles=" +
    encodeURIComponent(title);
  const r = await fetch(url);
  if (!r.ok) return null;
  const json = await r.json();
  const page = json?.query?.pages?.[0];
  return page?.original?.source || page?.thumbnail?.source || null;
}

async function fetchUnsplash(query) {
  const r = await fetch("/api/images?query=" + encodeURIComponent(query));
  if (!r.ok) return { url: null, credit: null };
  const json = await r.json();
  return { url: json.url || null, credit: json.credit || null };
}

export function useHerbImage({ id, wiki, nameLat }) {
  const wbudowane = useMemo(() => zdjeciaWbudowane(id), [id]);
  const local = wbudowane[0] || null;
  const cacheKey = `${id || ""}|${wiki}|${nameLat || ""}`;
  const cached = imageCache.get(cacheKey);

  const [src, setSrc] = useState(local?.src || cached?.src);
  const [credit, setCredit] = useState(local?.credit ?? cached?.credit ?? null);
  const [status, setStatus] = useState(local || cached ? "ready" : "loading");

  useEffect(() => {
    // Zdjęcie wbudowane — nic nie pobieramy, koniec tematu.
    if (local?.src) {
      setSrc(local.src);
      setCredit(local.credit);
      setStatus("ready");
      return;
    }

    if (imageCache.has(cacheKey)) {
      const c = imageCache.get(cacheKey);
      setSrc(c.src);
      setCredit(c.credit);
      setStatus(c.src ? "ready" : "error");
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    (async () => {
      let found = null;
      let creditInfo = null;

      // Wikimedia idzie pierwsza: gorzej wygląda, ale pokazuje właściwy gatunek.
      // W zielniku, po którym się zbiera, trafność bije urodę.
      try {
        found = await fetchWikimedia(wiki);
        if (found) creditInfo = { name: "Wikimedia Commons", link: null, zrodlo: "Wikimedia Commons" };
      } catch {
        found = null;
      }

      if (!found) {
        try {
          const unsplash = await fetchUnsplash(nameLat || wiki);
          if (unsplash.url) {
            found = unsplash.url;
            creditInfo = { ...unsplash.credit, zrodlo: "Unsplash" };
          }
        } catch {
          // trudno — pokażemy znak zastępczy
        }
      }

      if (cancelled) return;
      imageCache.set(cacheKey, { src: found, credit: creditInfo });
      setSrc(found);
      setCredit(creditInfo);
      setStatus(found ? "ready" : "error");
    })();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, wiki, nameLat, local?.src]);

  // photos = wszystko, co da się pokazać w podglądzie pełnoekranowym.
  // Przy zdjęciach wbudowanych bywa ich kilka; z sieci wraca jedno.
  const photos = wbudowane.length
    ? wbudowane
    : src
      ? [{ src, credit }]
      : [];

  return { src, credit, status, photos };
}
