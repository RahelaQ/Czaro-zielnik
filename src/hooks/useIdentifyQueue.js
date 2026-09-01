// ---------------------------------------------------------------------------
// KOLEJKA ROZPOZNAŃ — zdjęcie zrobione bez zasięgu nie przepada.
//
// Ląduje w IndexedDB razem z datą i pozycją, a appka sama je rozpoznaje,
// gdy sieć wróci: po zdarzeniu "online", po powrocie do zakładki i przy
// starcie appki. Idziesz dalej po lesie, telefon nadrabia w tle.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";
import {
  queueAdd,
  queueAll,
  queueRemove,
  queueMarkFailed,
  sightingAdd,
  sightingsAll,
  sightingRemove,
} from "../utils/db.js";
import { identifyPlant, IdentifyError, RETRYABLE } from "../utils/identifyClient.js";

const MAX_ATTEMPTS = 5;

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("odczyt_nieudany"));
    reader.readAsDataURL(blob);
  });
}

export function useIdentifyQueue() {
  const [pending, setPending] = useState([]);
  // Wpisy, ktore wyczerpaly proby. Trzymane osobno, bo one juz nie czekaja —
  // nic sie z nimi samo nie stanie.
  const [failed, setFailed] = useState([]);
  const [sightings, setSightings] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncing = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const [q, s] = await Promise.all([queueAll(), sightingsAll()]);
      // Wpis po MAX_ATTEMPTS jest w petli flush pomijany, ale zostawal w
      // kolejce i nadal liczyl sie do banera "N zdjec czeka na rozpoznanie".
      // Baner swiecil wiec bez konca, obiecujac cos, co nigdy nie mialo sie
      // wydarzyc, a usunac wpisu nie dalo sie z zadnego ekranu.
      setPending(q.filter((it) => (it.attempts || 0) < MAX_ATTEMPTS));
      setFailed(q.filter((it) => (it.attempts || 0) >= MAX_ATTEMPTS));
      setSightings(s);
    } catch {
      // IndexedDB potrafi być niedostępna w trybie prywatnym Safari —
      // appka ma wtedy działać dalej, po prostu bez kolejki i dziennika.
    }
  }, []);

  const enqueue = useCallback(
    async ({ blob, coords }) => {
      await queueAdd({ blob, coords });
      await refresh();
    },
    [refresh]
  );

  const remember = useCallback(
    async ({ blob, coords, result, createdAt }) => {
      await sightingAdd({ blob, coords, result, createdAt });
      await refresh();
    },
    [refresh]
  );

  const forget = useCallback(
    async (id) => {
      await sightingRemove(id);
      await refresh();
    },
    [refresh]
  );

  // Wyrzucenie wpisu, ktory sie nie uda. Bez tego jedyna droga byloby
  // wyczyszczenie danych aplikacji w ustawieniach przegladarki.
  const porzuc = useCallback(
    async (id) => {
      await queueRemove(id);
      await refresh();
    },
    [refresh]
  );

  const porzucNieudane = useCallback(async () => {
    const wszystkie = await queueAll();
    for (const it of wszystkie) {
      if ((it.attempts || 0) >= MAX_ATTEMPTS) await queueRemove(it.id);
    }
    await refresh();
  }, [refresh]);

  // Przerabia kolejkę po jednym zdjęciu. Przy pierwszym błędzie, który da się
  // przeczekać, przerywa cały przebieg — skoro sieć nie działa dla jednego
  // zdjęcia, nie zadziała dla kolejnych, a każda próba kosztuje baterię.
  const flush = useCallback(async () => {
    if (syncing.current) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;

    syncing.current = true;
    setIsSyncing(true);
    try {
      const items = await queueAll();
      for (const item of items) {
        if ((item.attempts || 0) >= MAX_ATTEMPTS) continue;
        try {
          const base64 = await blobToBase64(item.blob);
          const result = await identifyPlant({ base64, mediaType: "image/jpeg" });
          await sightingAdd({
            blob: item.blob,
            coords: item.coords,
            result,
            createdAt: item.createdAt,
          });
          await queueRemove(item.id);
        } catch (err) {
          const kind = err instanceof IdentifyError ? err.kind : "server";
          await queueMarkFailed(item.id, kind);
          if (RETRYABLE.has(kind)) break;
          // Błąd nie do naprawienia czekaniem (np. brak klucza API) —
          // zostawiamy wpis w kolejce z adnotacją i idziemy dalej.
        }
      }
      await refresh();
    } finally {
      syncing.current = false;
      setIsSyncing(false);
    }
  }, [refresh]);

  useEffect(() => {
    refresh().then(flush);

    const onOnline = () => flush();
    const onVisible = () => {
      if (document.visibilityState === "visible") flush();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh, flush]);

  return {
    pending,
    failed,
    sightings,
    isSyncing,
    enqueue,
    remember,
    forget,
    porzuc,
    porzucNieudane,
    flush,
    refresh,
  };
}
