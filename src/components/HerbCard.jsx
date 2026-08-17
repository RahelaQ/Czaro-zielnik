import React from "react";
import HerbImage from "./HerbImage.jsx";

export default function HerbCard({ herb, onOpen, activeThisMonth }) {
  return (
    <button className="herb-card" onClick={() => onOpen(herb)}>
      <HerbImage title={herb.wiki} namePl={herb.namePl} />
      {activeThisMonth && <span className="badge-now">zbiór teraz</span>}
      <div className="herb-card-text">
        <p className="herb-card-lat">{herb.nameLat}</p>
        <p className="herb-card-pl">{herb.namePl}</p>
      </div>
    </button>
  );
}
