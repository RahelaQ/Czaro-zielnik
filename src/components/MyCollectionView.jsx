import React, { useId, useMemo, useState } from "react";
import HerbImage from "./HerbImage.jsx";

const DRYING_DAYS = 7;
const ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const MIESIACE = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
];

function formatDatePl(ts) {
  const d = new Date(ts);
  return `${d.getDate()} ${ROMAN_MONTHS[d.getMonth()]}`;
}

// Data zapisana cyframi rzymskimi jest czytelna okiem, ale czytnik ekranu
// mowi "5 iks" zamiast "5 pazdziernika". Dla niego trzymamy wersje slowna.
function dataSlowem(ts) {
  const d = new Date(ts);
  return `${d.getDate()} ${MIESIACE[d.getMonth()]} ${d.getFullYear()}`;
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
      opis: `Schnie, dzień ${day} z ${DRYING_DAYS}`,
      dzien: day,
      progress: day / DRYING_DAYS,
    };
  }
  return {
    status: "gotowe",
    label: `gotowe · zebrane ${formatDatePl(addedAt)}`,
    opis: `Gotowe, zebrane ${dataSlowem(addedAt)}`,
    dzien: DRYING_DAYS,
    progress: 1,
  };
}

// Moje Zbiory = tylko rośliny, które użytkowniczka faktycznie dodała
// (z Biblioteki albo przez rozpoznanie ze zdjęcia). Osobny, żywy dziennik —
// w odróżnieniu od statycznej Biblioteki.
export default function MyCollectionView({ herbs, onOpen, collection, onNavigate }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("wszystko");
  const uid = useId();
  const searchId = `szukaj-zbiory-${uid}`;

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
        <button
          type="button"
          className="pill-btn"
          onClick={() => onNavigate?.("biblioteka")}
        >
          + Dodaj<span className="visually-hidden"> roślinę z Biblioteki</span>
        </button>
      </div>

      {herbs.length > 0 && (
        <>
          <label className="visually-hidden" htmlFor={searchId}>
            Szukaj wśród {herbs.length} zebranych roślin
          </label>
          <input
            id={searchId}
            type="search"
            className="search-box"
            placeholder={`Szukaj wśród ${herbs.length} pozycji`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {/* aria-pressed, nie aria-current: to nie jest nawigacja, tylko
              przelacznik, ktory zostaje wcisniety. */}
          <div className="filter-row" role="group" aria-label="Filtr stanu suszenia">
            {[
              ["wszystko", "Wszystko"],
              ["schnie", "Schnie"],
              ["gotowe", "Gotowe"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={
                  "filter-pill" + (filter === key ? " filter-pill--active" : "")
                }
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Zmiana filtra albo wpisanie litery przebudowuje liste, ale nie rusza
          fokusu — bez tego komunikatu czytnik ekranu nie mowi, ile zostalo. */}
      {herbs.length > 0 && (
        <p className="visually-hidden" role="status">
          {filtered.length === 1
            ? "1 roślina na liście"
            : `${filtered.length} roślin na liście`}
        </p>
      )}

      {herbs.length === 0 ? (
        <p className="empty-note" style={{ margin: "0.6rem 1.4rem" }}>
          Nie masz jeszcze żadnych roślin w swoich zbiorach. Rozpoznaj roślinę
          ze zdjęcia albo dodaj ją z Biblioteki, żeby zaczęła się tu pojawiać.
        </p>
      ) : (
        <div className="collection-list">
          <ul className="reset-list">
            {filtered.map(({ herb, status, label, opis, dzien, progress }) => (
              <li key={herb.id} className="collection-row">
                <button
                  type="button"
                  className="collection-row-main"
                  onClick={() => onOpen(herb)}
                >
                  <span className="collection-row-image">
                    <HerbImage
                      id={herb.id}
                      title={herb.wiki}
                      namePl={herb.namePl}
                      nameLat={herb.nameLat}
                      decorative
                    />
                  </span>
                  <span className="collection-row-body">
                    <span className="collection-row-pl">{herb.namePl}</span>
                    <span className="collection-row-lat">{herb.nameLat}</span>
                    {status === "schnie" && (
                      <span
                        className="collection-progress"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={DRYING_DAYS}
                        aria-valuenow={dzien}
                        aria-valuetext={`Dzień ${dzien} z ${DRYING_DAYS} suszenia`}
                      >
                        <span
                          className="collection-progress-fill"
                          style={{ width: `${Math.round(progress * 100)}%` }}
                        />
                      </span>
                    )}
                    {/* Na ekranie skrot z kropka i data rzymska, dla czytnika
                        pelne zdanie — ta sama informacja, dwa zapisy. */}
                    <span className="collection-row-status" aria-hidden="true">
                      {label}
                    </span>
                    <span className="visually-hidden">{opis}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="collection-row-remove"
                  aria-label={`Usuń ${herb.namePl} z Moich Zbiorów`}
                  onClick={() => collection.remove(herb.id)}
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
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
