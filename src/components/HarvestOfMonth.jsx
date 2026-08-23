import React from "react";
import HerbImage from "./HerbImage.jsx";

/**
 * Pokazuje zioła gotowe do zbioru w aktualnym miesiącu
 * Ułożone w grid — user może kliknąć żeby otworzyć kartę
 */
export default function HarvestOfMonth({ herbs, onOpen }) {
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Filtruj zioła dostępne w aktualnym miesiącu
  const harvestHerbs = herbs.filter((h) => h.months?.includes(currentMonth));

  // Jeśli nic nie ma w tym miesiącu, nie pokazuj sekcji
  if (harvestHerbs.length === 0) return null;

  const MONTH_NAMES = [
    "stycznia",
    "lutego",
    "marca",
    "kwietnia",
    "maja",
    "czerwca",
    "lipca",
    "sierpnia",
    "września",
    "października",
    "listopada",
    "grudnia",
  ];

  return (
    <>
      <p className="section-label" style={{ marginTop: "1.5rem" }}>
        ZBÓR {MONTH_NAMES[currentMonth - 1].toUpperCase()}
      </p>

      <div className="harvest-grid">
        {harvestHerbs.slice(0, 4).map((herb) => (
          <button
            key={herb.id}
            className="harvest-card"
            onClick={() => onOpen(herb)}
            aria-label={`${herb.namePl} - ${herb.nameLat}`}
          >
            <div className="harvest-card-image">
              <HerbImage
                id={herb.id}
                title={herb.wiki}
                namePl={herb.namePl}
                nameLat={herb.nameLat}
              />
              <span className="harvest-badge">Gotów teraz</span>
            </div>
            <div className="harvest-card-text">
              <h4 className="harvest-card-pl">{herb.namePl}</h4>
              <p className="harvest-card-part">{herb.part}</p>
            </div>
          </button>
        ))}
      </div>

      {harvestHerbs.length > 4 && (
        <p
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginTop: "0.5rem",
            padding: "0 1.4rem",
          }}
        >
          + {harvestHerbs.length - 4} więcej w tym miesiącu
        </p>
      )}
    </>
  );
}
