import React from "react";
import { useHerbImage } from "../hooks/useHerbImage.js";

export default function HerbImage({ id, title, namePl, nameLat, showCredit }) {
  const { src, credit, status } = useHerbImage({ id, wiki: title, nameLat });

  if (status === "loading") {
    return (
      <div className="herb-photo herb-photo--loading">
        <span className="leaf-spinner">🌿</span>
      </div>
    );
  }
  if (!src) {
    return (
      <div className="herb-photo herb-photo--fallback">
        <span>🌿</span>
      </div>
    );
  }
  return (
    <div className="herb-photo">
      <img src={src} alt={namePl} loading="lazy" />
      {/* Licencje Commons wymagaja podania autora — to nie jest ozdobnik. */}
      {showCredit && credit?.name && (
        credit.link ? (
          <a
            className="photo-credit"
            href={credit.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            zdjęcie: {credit.name}
            {credit.licencja ? ` (${credit.licencja})` : ""} / {credit.zrodlo}
          </a>
        ) : (
          <span className="photo-credit">
            zdjęcie: {credit.name}
            {credit.licencja ? ` (${credit.licencja})` : ""}
          </span>
        )
      )}
    </div>
  );
}
