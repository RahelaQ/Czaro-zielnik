import React from "react";
import HerbImage from "./HerbImage.jsx";

export default function HerbCard({
  herb,
  onOpen,
  activeThisMonth,
  inCollection,
  onToggleCollection,
}) {
  // Nazwa przycisku dla czytnika ekranu. Plakietki "zbior teraz" i "moje
  // zbiory" sa na karcie kolorowym paskiem — bez tego zdania niosa
  // informacje wylacznie dla osoby, ktora je widzi.
  const opis = [
    herb.namePl,
    herb.nameLat,
    activeThisMonth ? "do zbioru w tym miesiącu" : null,
    inCollection ? "w Moich Zbiorach" : null,
    herb.trujaca ? "roślina trująca" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="herb-card">
      <button
        type="button"
        className="herb-card-main"
        onClick={() => onOpen(herb)}
        aria-label={`${opis}. Otwórz kartę`}
      >
        <HerbImage
          id={herb.id}
          title={herb.wiki}
          namePl={herb.namePl}
          nameLat={herb.nameLat}
          decorative
        />
        {activeThisMonth && (
          <span className="badge-now" aria-hidden="true">zbiór teraz</span>
        )}
        {inCollection && (
          <span className="badge-saved" aria-hidden="true">moje zbiory</span>
        )}
        <span className="herb-card-text">
          <span className="herb-card-lat">{herb.nameLat}</span>
          <span className="herb-card-pl">{herb.namePl}</span>
        </span>
      </button>
      {onToggleCollection && (
        <button
          type="button"
          className={
            "herb-card-toggle" +
            (inCollection ? " herb-card-toggle--active" : "")
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollection();
          }}
          aria-label={
            inCollection
              ? `Usuń ${herb.namePl} z Moich Zbiorów`
              : `Dodaj ${herb.namePl} do Moich Zbiorów`
          }
        >
          <span aria-hidden="true">{inCollection ? "✓" : "+"}</span>
        </button>
      )}
    </div>
  );
}
