import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { useDialog } from "../hooks/useDialog.js";

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
// Fokus, Escape i blokada tła siedzą w useDialog — podgląd otwiera się NA
// karcie rośliny, więc dwa okna stoją jedno na drugim i tylko wierzchnie
// ma reagować na klawisze.
// ---------------------------------------------------------------------------

export default function PhotoViewer({ photos, startIndex = 0, herbName, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const dotyk = useRef(null);
  const overlayRef = useDialog(onClose);

  const uid = useId();
  const titleId = `podglad-${uid}`;

  const ile = photos.length;
  const foto = photos[index];

  const dalej = useCallback(() => setIndex((i) => (i + 1) % ile), [ile]);
  const wstecz = useCallback(() => setIndex((i) => (i - 1 + ile) % ile), [ile]);

  // Strzalki przewijaja zdjecia. Escape i pulapka fokusu — w useDialog.
  useEffect(() => {
    if (ile < 2) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") dalej();
      else if (e.key === "ArrowLeft") wstecz();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dalej, wstecz, ile]);

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
      aria-labelledby={titleId}
      onClick={onClose}
      onTouchStart={start}
      onTouchEnd={koniec}
    >
      <h2 id={titleId} className="visually-hidden">
        {herbName} — zdjęcie w pełnym kadrze
        {ile > 1 ? `, ${index + 1} z ${ile}` : ""}
      </h2>

      <button
        type="button"
        className="photo-viewer__close"
        onClick={onClose}
        aria-label="Zamknij podgląd zdjęcia"
      >
        <span aria-hidden="true">×</span>
      </button>

      {ile > 1 && (
        <>
          <button
            type="button"
            className="photo-viewer__arrow photo-viewer__arrow--prev"
            onClick={(e) => {
              e.stopPropagation();
              wstecz();
            }}
            aria-label="Poprzednie zdjęcie"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            className="photo-viewer__arrow photo-viewer__arrow--next"
            onClick={(e) => {
              e.stopPropagation();
              dalej();
            }}
            aria-label="Następne zdjęcie"
          >
            <span aria-hidden="true">›</span>
          </button>
        </>
      )}

      <img
        className="photo-viewer__img"
        src={foto.src}
        alt={
          ile > 1
            ? `${herbName} — zdjęcie ${index + 1} z ${ile}`
            : `${herbName} — zdjęcie w pełnym kadrze`
        }
        onClick={(e) => e.stopPropagation()}
      />

      {/* Zmiana zdjecia strzalka albo gestem nie przenosi fokusu, wiec bez
          tego czytnik ekranu milczy i nie wiadomo, ze cokolwiek sie stalo. */}
      <p className="visually-hidden" aria-live="polite">
        {ile > 1 ? `Zdjęcie ${index + 1} z ${ile}` : ""}
      </p>

      <div className="photo-viewer__bar" onClick={(e) => e.stopPropagation()}>
        {ile > 1 && (
          <div className="photo-viewer__dots" role="group" aria-label="Wybór zdjęcia">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                className={"photo-viewer__dot" + (i === index ? " photo-viewer__dot--on" : "")}
                onClick={() => setIndex(i)}
                aria-label={`Pokaż zdjęcie ${i + 1} z ${ile}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        )}

        {/* Licencje Commons wymagają podania autora także tutaj — podgląd
            pełnoekranowy to osobne pokazanie zdjęcia, nie miniatura. */}
        {foto.credit?.name && (
          <p className="photo-viewer__credit">
            {foto.credit.link ? (
              <a
                href={foto.credit.link}
                target="_blank"
                rel="noreferrer"
                aria-label={`Autor zdjęcia: ${foto.credit.name} — otwiera się w nowej karcie`}
              >
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
