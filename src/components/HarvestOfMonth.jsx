import React from "react";
import HerbImage from "./HerbImage.jsx";

/**
 * Pokazuje zioła gotowe do zbioru w aktualnym miesiącu.
 * Ułożone w siatkę — kliknięcie otwiera kartę rośliny.
 */
const MONTH_NAMES = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
];

export default function HarvestOfMonth({ herbs, onOpen }) {
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Filtruj zioła dostępne w aktualnym miesiącu
  const harvestHerbs = herbs.filter((h) => h.months?.includes(currentMonth));

  // Jeśli nic nie ma w tym miesiącu, nie pokazuj sekcji
  if (harvestHerbs.length === 0) return null;

  const miesiac = MONTH_NAMES[currentMonth - 1];

  return (
    <section aria-labelledby="zbior-miesiaca">
      <h2
        className="section-label"
        id="zbior-miesiaca"
        style={{ marginTop: "1.5rem" }}
      >
        ZBÓR {miesiac.toUpperCase()}
      </h2>

      <ul className="harvest-grid reset-list-grid">
        {harvestHerbs.slice(0, 4).map((herb) => (
          <li key={herb.id}>
            <button
              type="button"
              className="harvest-card"
              onClick={() => onOpen(herb)}
              aria-label={`${herb.namePl}, ${herb.nameLat} — gotowa do zbioru teraz${
                herb.part ? `: ${herb.part}` : ""
              }. Otwórz kartę`}
            >
              <span className="harvest-card-image">
                <HerbImage
                  id={herb.id}
                  title={herb.wiki}
                  namePl={herb.namePl}
                  nameLat={herb.nameLat}
                  decorative
                />
                <span className="harvest-badge" aria-hidden="true">
                  Gotów teraz
                </span>
              </span>
              <span className="harvest-card-text">
                <span className="harvest-card-pl">{herb.namePl}</span>
                <span className="harvest-card-part">{herb.part}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {harvestHerbs.length > 4 && (
        <p className="harvest-more">
          + {harvestHerbs.length - 4} więcej w tym miesiącu
          <span className="visually-hidden">
            {" "}— pełna lista w Kalendarzu
          </span>
        </p>
      )}
    </section>
  );
}
