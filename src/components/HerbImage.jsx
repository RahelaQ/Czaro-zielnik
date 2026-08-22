import React from "react";
import { useHerbImage } from "../hooks/useHerbImage.js";

export default function HerbImage({ title, namePl, nameLat, showCredit }) {
  const { src, credit, status } = useHerbImage({ wiki: title, nameLat });

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
      {showCredit && credit?.name && (
        <a
          className="photo-credit"
          href={credit.link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          zdjęcie: {credit.name} / Unsplash
        </a>
      )}
    </div>
  );
}
