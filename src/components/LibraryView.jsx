import React, { useId, useMemo, useState } from "react";
import HerbCard from "./HerbCard.jsx";
import { HERBS } from "../data/herbs.js";

// Biblioteka = wszystkie rośliny, które appka "zna" — referencyjna, statyczna.
// Niezależna od Moich Zbiorów (to, co użytkowniczka faktycznie dodała).
const CATEGORIES = ["Wszystkie", "Kwiaty", "Liście", "Ziele", "Korzenie", "Kora", "Owoce", "Trujące"];

export default function LibraryView({ onOpen, collection }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const currentMonth = new Date().getMonth() + 1;
  const uid = useId();
  const searchId = `szukaj-biblioteka-${uid}`;
  const opisId = `szukaj-opis-${uid}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HERBS.filter((h) => {
      if (category !== "Wszystkie" && h.kategoria !== category) return false;
      if (!q) return true;
      // Szukamy też po sobowtórze — stojąc nad rośliną, której nie znasz,
      // częściej pamiętasz nazwę tej trującej, z którą ją mylisz.
      return (
        h.namePl.toLowerCase().includes(q) ||
        h.nameLat.toLowerCase().includes(q) ||
        h.moc.toLowerCase().includes(q) ||
        (h.rodzina || "").toLowerCase().includes(q) ||
        (h.sobowtor?.namePl || "").toLowerCase().includes(q) ||
        (h.sobowtor?.nameLat || "").toLowerCase().includes(q) ||
        // Nazwa gwarowa jest często jedyną, jaką się pamięta: ktoś szuka
        // "mordownika", nie "Aconitum napellus".
        (h.nazwyLudowe?.nazwy || []).some((n) =>
          n.toLowerCase().includes(q)
        )
      );
    });
  }, [query, category]);

  return (
    <div className="zielnik-view">
      <div className="screen-header">
        <div>
          <h1>Zielnik</h1>
          <p>{HERBS.length} kart botanicznych · działa bez zasięgu</p>
        </div>
      </div>

      {/* Etykieta pola, a nie sam placeholder: placeholder znika po pierwszej
          literze i przestaje istniec dla czytnika ekranu. Podpowiedz o tym,
          ze szukamy takze po nazwie ludowej i po sobowtorze, jest w opisie —
          bez niej nie sposob zgadnac, ze to dziala. */}
      <label className="visually-hidden" htmlFor={searchId}>
        Szukaj w zielniku
      </label>
      <input
        id={searchId}
        type="search"
        className="search-box"
        placeholder="Nazwa, objaw, intencja…"
        aria-describedby={opisId}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p id={opisId} className="visually-hidden">
        Szuka po nazwie polskiej i łacińskiej, po nazwie ludowej, po opisie,
        po rodzinie botanicznej oraz po nazwie rośliny trującej, z którą dana
        roślina bywa mylona.
      </p>

      <div className="filter-row" role="group" aria-label="Filtr kategorii">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={
              "filter-pill" + (category === c ? " filter-pill--active" : "")
            }
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Lista przebudowuje sie bez ruszania fokusu — komunikat mowi, ile
          zostalo, i czy w ogole cokolwiek. */}
      <p className="visually-hidden" role="status">
        {filtered.length === 0
          ? "Brak roślin spełniających kryteria"
          : filtered.length === 1
          ? "1 roślina"
          : `${filtered.length} roślin`}
      </p>

      {filtered.length === 0 ? (
        <p className="empty-note">
          Nic nie pasuje do tego, czego szukasz. Spróbuj nazwy ludowej albo
          łacińskiej — albo zdejmij filtr kategorii.
        </p>
      ) : (
        <ul className="herb-grid reset-list-grid">
          {filtered.map((h) => (
            <li key={h.id}>
              <HerbCard
                herb={h}
                onOpen={onOpen}
                activeThisMonth={h.months.includes(currentMonth)}
                inCollection={collection.isSaved(h.id)}
                onToggleCollection={() =>
                  collection.isSaved(h.id)
                    ? collection.remove(h.id)
                    : collection.addFromLibrary(h)
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
