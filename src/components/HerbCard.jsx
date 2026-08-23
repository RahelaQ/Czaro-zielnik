import React from "react";
import HerbImage from "./HerbImage.jsx";

export default function HerbCard({
  herb,
  onOpen,
  activeThisMonth,
  inCollection,
  onToggleCollection,
}) {
  return (
    <div className="herb-card">
      <button className="herb-card-main" onClick={() => onOpen(herb)}>
        <HerbImage id={herb.id} title={herb.wiki} namePl={herb.namePl} nameLat={herb.nameLat} />
        {activeThisMonth && <span className="badge-now">zbiór teraz</span>}
        {inCollection && <span className="badge-saved">moje zbiory</span>}
        <div className="herb-card-text">
          <p className="herb-card-lat">{herb.nameLat}</p>
          <p className="herb-card-pl">{herb.namePl}</p>
        </div>
      </button>
      {onToggleCollection && (
        <button
          className={
            "herb-card-toggle" +
            (inCollection ? " herb-card-toggle--active" : "")
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollection();
          }}
          aria-label={
            inCollection ? "Usuń z Moich Zbiorów" : "Dodaj do Moich Zbiorów"
          }
        >
          {inCollection ? "✓" : "+"}
        </button>
      )}
    </div>
  );
}
