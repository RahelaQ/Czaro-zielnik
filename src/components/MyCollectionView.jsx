import React, { useMemo, useState } from "react";
import HerbImage from "./HerbImage.jsx";

const DRYING_DAYS = 7;
const ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function formatDatePl(ts) {
  const d = new Date(ts);
  return `${d.getDate()} ${ROMAN_MONTHS[d.getMonth()]}`;
}

// "Schnie" przez pierwsze DRYING_DAYS dni od dodania, potem "gotowe" —
// prosta symulacja procesu suszenia ziół oparta o realną datę dodania
// (addedAt), bez dodatkowego stanu do ręcznego zarządzania.
function dryingStatus(addedAt) {
  const daysSince = Math.floor((Date.now() - addedAt) / 86400000);
  if (daysSince < DRYING_DAYS) {
    const day = daysSince + 1;
    return {
      status: "schnie",
      label: `schnie · dzień ${day} z ${DRYING_DAYS}`,
      progress: day / DRYING_DAYS,
    };
  }
  return {
    status: "gotowe",
    label: `gotowe · zebrane ${formatDatePl(addedAt)}`,
    progress: 1,
  };
}

// Moje Zbiory = tylko rośliny, które użytkowniczka faktycznie dodała
// (z Biblioteki albo przez rozpoznanie ze zdjęcia). Osobny, żywy dziennik —
// w odróżnieniu od statycznej Biblioteki.
export default function MyCollectionView({ herbs, onOpen, collection, onNavigate }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("wszystko");

  const withStatus = useMemo(
    () => herbs.map((h) => ({ herb: h, ...dryingStatus(h.addedAt) })),
    [herbs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withStatus.filter(({ herb, status }) => {
      if (filter !== "wszystko" && status !== filter) return false;
      if (!q) return true;
      return (
        herb.namePl.toLowerCase().includes(q) ||
        herb.nameLat.toLowerCase().includes(q)
      );
    });
  }, [withStatus, query, filter]);

  return (
    <div className="collection-view">
      <div className="screen-header">
        <div>
          <h1>Moje zbiory</h1>
          <p>Twoja prywatna baza roślin</p>
        </div>
        <button className="pill-btn" onClick={() => onNavigate?.("biblioteka")}>
          + Dodaj
        </button>
      </div>

      {herbs.length > 0 && (
        <>
          <input
            className="search-box"
            placeholder={`Szukaj wśród ${herbs.length} pozycji`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="filter-row">
            {[
              ["wszystko", "Wszystko"],
              ["schnie", "Schnie"],
              ["gotowe", "Gotowe"],
            ].map(([key, label]) => (
              <button
                key={key}
                className={
                  "filter-pill" + (filter === key ? " filter-pill--active" : "")
                }
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {herbs.length === 0 ? (
        <p className="empty-note" style={{ margin: "0.6rem 1.4rem" }}>
          Nie masz jeszcze żadnych roślin w swoich zbiorach. Rozpoznaj roślinę
          ze zdjęcia albo dodaj ją z Biblioteki, żeby zaczęła się tu pojawiać.
        </p>
      ) : (
        <div className="collection-list">
          {filtered.map(({ herb, status, label, progress }) => (
            <button
              key={herb.id}
              className="collection-row"
              onClick={() => onOpen(herb)}
            >
              <div className="collection-row-image">
                <HerbImage id={herb.id} title={herb.wiki} namePl={herb.namePl} nameLat={herb.nameLat} />
              </div>
              <div className="collection-row-body">
                <p className="collection-row-pl">{herb.namePl}</p>
                <p className="collection-row-lat">{herb.nameLat}</p>
                {status === "schnie" && (
                  <div className="collection-progress">
                    <div
                      className="collection-progress-fill"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                )}
                <p className="collection-row-status">{label}</p>
              </div>
              <span
                className="collection-row-remove"
                role="button"
                aria-label="Usuń z Moich Zbiorów"
                onClick={(e) => {
                  e.stopPropagation();
                  collection.remove(herb.id);
                }}
              >
                ✕
              </span>
            </button>
          ))}
          <button
            className="collection-add-cta"
            onClick={() => onNavigate?.("rozpoznaj")}
          >
            + dodaj z aparatu lub z zielnika
          </button>
        </div>
      )}
    </div>
  );
}
