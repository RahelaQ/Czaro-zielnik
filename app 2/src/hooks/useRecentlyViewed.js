import { useCallback, useEffect, useState } from "react";

const KEY = "zielnik:recentlyViewed";
const MAX_ITEMS = 6;

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // localStorage niedostępny — historia żyje tylko w sesji
  }
}

// Zapisujemy lekką migawkę rośliny (nie całą kartę), więc działa zarówno
// dla ziół z Biblioteki, jak i rozpoznanych ze zdjęcia (custom).
export function useRecentlyViewed() {
  const [items, setItems] = useState(read);

  useEffect(() => write(items), [items]);

  const recordView = useCallback((herb) => {
    if (!herb?.id) return;
    setItems((prev) => {
      const snapshot = {
        id: herb.id,
        namePl: herb.namePl,
        nameLat: herb.nameLat,
        wiki: herb.wiki,
        viewedAt: Date.now(),
      };
      const withoutDup = prev.filter((it) => it.id !== herb.id);
      return [snapshot, ...withoutDup].slice(0, MAX_ITEMS);
    });
  }, []);

  return { items, recordView };
}
