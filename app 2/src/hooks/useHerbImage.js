import { useEffect, useState } from "react";

// Kolejność prób dla zdjęcia rośliny:
//   1) Unsplash (przez nasz /api/images.js — ładniejsze, "dark mood",
//      ale nie zawsze trafi w rzadszy gatunek)
//   2) Wikimedia Commons, przez API polskiej Wikipedii (mniej efektowne,
//      ale prawie zawsze trafne botanicznie)
// Wynik cache'owany w pamięci na czas sesji, żeby appka nie odpytywała
// dwa razy tej samej rośliny.
const imageCache = new Map();

async function fetchWikimedia(title) {
  const url =
    "https://pl.wikipedia.org/w/api.php" +
    "?action=query&format=json&origin=*&formatversion=2" +
    "&prop=pageimages&piprop=original|thumbnail&pithumbsize=500" +
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

export function useHerbImage({ wiki, nameLat }) {
  const cacheKey = `${wiki}|${nameLat || ""}`;
  const cached = imageCache.get(cacheKey);
  const [src, setSrc] = useState(cached?.src);
  const [credit, setCredit] = useState(cached?.credit ?? null);
  const [status, setStatus] = useState(cached ? "ready" : "loading");

  useEffect(() => {
    if (imageCache.has(cacheKey)) {
      const c = imageCache.get(cacheKey);
      setSrc(c.src);
      setCredit(c.credit);
      setStatus(c.src ? "ready" : "error");
      return;
    }
    let cancelled = false;
    setStatus("loading");

    (async () => {
      let found = null;
      let creditInfo = null;

      try {
        const unsplash = await fetchUnsplash(nameLat || wiki);
        if (unsplash.url) {
          found = unsplash.url;
          creditInfo = unsplash.credit;
        }
      } catch {
        // Unsplash zawiódł — próbujemy Wikimedia poniżej
      }

      if (!found) {
        try {
          found = await fetchWikimedia(wiki);
        } catch {
          found = null;
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
  }, [cacheKey, wiki, nameLat]);

  return { src, credit, status };
}
