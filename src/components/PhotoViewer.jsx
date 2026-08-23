import React, { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// PODGLĄD ZDJĘCIA NA CAŁY EKRAN
//
// Na karcie zdjęcie jest przycięte do paska 240 px (object-fit: cover), więc
// widać z niego środek i tyle. Przy rozpoznawaniu rośliny liczy się to, co
// zwykle wypada poza kadrem: kształt liścia przy nasadzie, owłosienie łodygi,
// przekrój ogonka. Dlatego tutaj object-fit: contain — całe zdjęcie, bez
// obcinania, nawet jeśli zostaną czarne pasy.
//
// Obsługuje wiele zdjęć: strzałki, kropki, przesunięcie palcem i klawisze.
// ---------------------------------------------------------------------------

export default function PhotoViewer({ photos, startIndex = 0, herbName, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const dotyk = useRef(null);
  const overlayRef = useRef(null);

  const ile = photos.length;
  const foto = photos[index];

  const dalej = useCallback(() => setIndex((i) => (i + 1) % ile), [ile]);
  const wstecz = useCallback(() => setIndex((i) => (i - 1 + ile) % ile), [ile]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && ile > 1) dalej();
      else if (e.key === "ArrowLeft" && ile > 1) wstecz();
    };
    window.addEventListener("keydown", onKey);
    // Blokujemy przewijanie tła — inaczej pod podglądem jeździ karta rośliny.
    const poprzedni = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlayRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = poprzedni;
    };
  }, [onClose, dalej, wstecz, ile]);

  const start = (e) => {
    const t = e.touches[0];
    dotyk.current = { x: t.clientX, y: t.clientY };
  };

  const koniec = (e) => {
    if (!dotyk.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - dotyk.current.x;
    const dy = t.clientY - dotyk.current.y;
    dotyk.current = null;
    // Pionowy gest zamyka, poziomy przewija — ale tylko gdy jest dokąd.
    if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx)) return onClose();
    if (ile > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? dalej() : wstecz();
    }
  };

  return (
    <div
      className="photo-viewer"
      ref={overlayRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Zdjęcie: ${herbName}`}
      onClick={onClose}
      onTouchStart={start}
      onTouchEnd={koniec}
    >
      <button className="photo-viewer__close" onClick={onClose} aria-label="Zamknij podgląd">
        ×
      </button>

      {ile > 1 && (
        <>
          <button
            className="photo-viewer__arrow photo-viewer__arrow--prev"
            onClick={(e) => {
              e.stopPropagation();
              wstecz();
            }}
            aria-label="Poprzednie zdjęcie"
          >
            ‹
          </button>
          <button
            className="photo-viewer__arrow photo-viewer__arrow--next"
            onClick={(e) => {
              e.stopPropagation();
              dalej();
            }}
            aria-label="Następne zdjęcie"
          >
            ›
          </button>
        </>
      )}

      <img
        className="photo-viewer__img"
        src={foto.src}
        alt={herbName}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="photo-viewer__bar" onClick={(e) => e.stopPropagation()}>
        {ile > 1 && (
          <div className="photo-viewer__dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={"photo-viewer__dot" + (i === index ? " photo-viewer__dot--on" : "")}
                onClick={() => setIndex(i)}
                aria-label={`Zdjęcie ${i + 1} z ${ile}`}
                aria-current={i === index}
              />
            ))}
          </div>
        )}

        {/* Licencje Commons wymagają podania autora także tutaj — podgląd
            pełnoekranowy to osobne pokazanie zdjęcia, nie miniatura. */}
        {foto.credit?.name && (
          <p className="photo-viewer__credit">
            {foto.credit.link ? (
              <a href={foto.credit.link} target="_blank" rel="noreferrer">
                {foto.credit.name}
              </a>
            ) : (
              foto.credit.name
            )}
            {foto.credit.licencja ? ` · ${foto.credit.licencja}` : ""}
            {foto.credit.zrodlo ? ` · ${foto.credit.zrodlo}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
