import { useEffect, useState } from "react";

// Prosty pamięciowy cache, żeby to samo zioło nie było odpytywane wielokrotnie
const wikiImageCache = new Map();

export function useWikiImage(title) {
  const [src, setSrc] = useState(wikiImageCache.get(title) ?? undefined);
  const [status, setStatus] = useState(
    wikiImageCache.has(title) ? "ready" : "loading"
  );

  useEffect(() => {
    if (wikiImageCache.has(title)) {
      setSrc(wikiImageCache.get(title));
      setStatus("ready");
      return;
    }
    let cancelled = false;
    setStatus("loading");

    const url =
      "https://pl.wikipedia.org/w/api.php" +
      "?action=query&format=json&origin=*&formatversion=2" +
      "&prop=pageimages&piprop=original|thumbnail&pithumbsize=500" +
      "&titles=" +
      encodeURIComponent(title);

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (cancelled) return;
        const page = json?.query?.pages?.[0];
        const found =
          page?.original?.source || page?.thumbnail?.source || null;
        wikiImageCache.set(title, found);
        setSrc(found);
        setStatus(found ? "ready" : "error");
      })
      .catch(() => {
        if (cancelled) return;
        wikiImageCache.set(title, null);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [title]);

  return { src, status };
}
