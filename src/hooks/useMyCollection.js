import { useCallback, useEffect, useState } from "react";

const KEY = "zielnik:myCollection";

// Wpis w kolekcji:
//   { id, source: "biblioteka" | "custom", addedAt, custom?: {...} }
// "biblioteka"  -> roślina znana z Biblioteki (src/data/herbs.js), trzymamy tylko id
// "custom"      -> roślina rozpoznana ze zdjęcia, której NIE MA w Bibliotece —
//                   pełny opis trzymamy tutaj, bo nigdzie indziej nie istnieje

function readCollection() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCollection(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // localStorage niedostępny (np. tryb prywatny) — kolekcja żyje tylko w sesji
  }
}

export function useMyCollection() {
  const [items, setItems] = useState(readCollection);

  useEffect(() => {
    writeCollection(items);
  }, [items]);

  const isSaved = useCallback(
    (id) => items.some((it) => it.id === id),
    [items]
  );

  const addFromLibrary = useCallback((herb) => {
    setItems((prev) =>
      prev.some((it) => it.id === herb.id)
        ? prev
        : [...prev, { id: herb.id, source: "biblioteka", addedAt: Date.now() }]
    );
  }, []);

  // result = obiekt zwrócony przez /api/identify.js (namePl, nameLat, opis, ...)
  const addCustom = useCallback((result) => {
    const id = "custom-" + Date.now();
    setItems((prev) => [
      ...prev,
      {
        id,
        source: "custom",
        addedAt: Date.now(),
        custom: {
          namePl: result.namePl,
          nameLat: result.nameLat,
          opis: result.opis || "",
          rodzina: result.rodzina || "",
          wiki: result.namePl,
          // Ostrzeżenie zapisujemy RAZEM z rośliną. Wcześniej przepadało tutaj:
          // roślina rozpoznana przez indeks jako trująca lądowała w Moich
          // Zbiorach jako zwykły wpis i jej karta nie mówiła już o niczym.
          // Wpis custom nie ma dokąd sięgnąć po te dane później — nie ma go
          // w herbs.js — więc albo zapiszemy je teraz, albo znikną na zawsze.
          uwaga: result.ostrzezenie || "",
          sobowtor: result.sobowtor || null,
          trujaca: !!result.trujaca,
        },
      },
    ]);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  return { items, isSaved, addFromLibrary, addCustom, remove };
}
