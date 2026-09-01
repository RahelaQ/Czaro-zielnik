import React from "react";
import { useHerbImage } from "../hooks/useHerbImage.js";

export default function HerbImage({
  id,
  title,
  namePl,
  nameLat,
  showCredit,
  onOpen, // gdy podane, zdjęcie da się kliknąć i obejrzeć w pełni
}) {
  const { src, credit, status, photos } = useHerbImage({ id, wiki: title, nameLat });

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

  const klikalne = Boolean(onOpen) && photos.length > 0;

  return (
    <div className={"herb-photo" + (klikalne ? " herb-photo--clickable" : "")}>
      <img src={src} alt={namePl} loading="lazy" />

      {klikalne && (
        <button
          type="button"
          className="herb-photo__zoom"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(photos);
          }}
          aria-label={
            photos.length > 1
              ? `Zobacz ${photos.length} zdjęcia w pełnym kadrze`
              : "Zobacz zdjęcie w pełnym kadrze"
          }
        >
          {/* Karta przycina zdjęcie do paska, więc trzeba dać znać, że jest
              co rozwinąć — inaczej nikt nie zgadnie, że to klikalne. */}
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 3H4.5A1.5 1.5 0 0 0 3 4.5V9M15 3h4.5A1.5 1.5 0 0 1 21 4.5V9M9 21H4.5A1.5 1.5 0 0 1 3 19.5V15M15 21h4.5a1.5 1.5 0 0 0 1.5-1.5V15" />
          </svg>
          {photos.length > 1 && (
            <span className="herb-photo__count">{photos.length}</span>
          )}
        </button>
      )}

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
