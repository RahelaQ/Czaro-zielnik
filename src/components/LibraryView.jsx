import React, { useMemo, useState } from "react";
import HerbCard from "./HerbCard.jsx";
import { HERBS } from "../data/herbs.js";

// Biblioteka = wszystkie rośliny, które appka "zna" — referencyjna, statyczna.
// Niezależna od Moich Zbiorów (to, co użytkowniczka faktycznie dodała).
const CATEGORIES = ["Wszystkie", "Kwiaty", "Liście", "Ziele", "Korzenie", "Kora", "Owoce", "Trujące"];

export default function LibraryView({ onOpen, collection }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const currentMonth = new Date().getMonth() + 1;

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

      <input
        className="search-box"
        placeholder="Nazwa, objaw, intencja…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="filter-row">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={
              "filter-pill" + (category === c ? " filter-pill--active" : "")
            }
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="herb-grid">
        {filtered.map((h) => (
          <HerbCard
            key={h.id}
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
        ))}
      </div>
    </div>
  );
}
