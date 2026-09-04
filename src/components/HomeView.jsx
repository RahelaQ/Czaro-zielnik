import React from "react";
import HerbImage from "./HerbImage.jsx";
import HarvestOfMonth from "./HarvestOfMonth.jsx";
import { HERBS } from "../data/herbs.js";
import { BasketIcon, CalendarIcon, CameraIcon } from "./Icons.jsx";
import Logo from "./Logo.jsx";

// Stabilne w ciągu dnia (liczone od epoki), zmienia się raz na dobę o północy —
// każdego dnia inne zioło, ale bez losowości przy każdym odświeżeniu appki.
//
// Rośliny trujące są wyłączone z tej rotacji. Hasła w rodzaju barszczu
// Sosnowskiego czy szczwołu istnieją po to, żeby je ROZPOZNAĆ i ominąć —
// witanie nimi użytkowniczki jako "ziołem dnia" jest dokładnie odwrotnym
// komunikatem, niż appka ma nadawać.
const HERBS_DNIA = HERBS.filter((h) => !h.trujaca);

function herbOfTheDay() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return HERBS_DNIA[dayIndex % HERBS_DNIA.length];
}

export default function HomeView({ onOpen, onNavigate, collectionCount, recentHerbs }) {
  const herb = herbOfTheDay();

  return (
    <div className="home-view">
      <div className="wordmark-row">
        <div className="lockup">
          <Logo size={38} weight={1.5} title="Czaro-Zielnik" />
          <span className="lockup-rule" aria-hidden="true" />
          <span className="wordmark">CZARO — ZIELNIK</span>
        </div>
      </div>

      <span className="section-label">Zioło dnia</span>
      <div className="hero-card">
        <div className="hero-card-text">
          <h2>{herb.namePl}</h2>
          <p className="hero-card-lat">{herb.nameLat}</p>
          <p className="hero-card-desc">{herb.moc}</p>
          <button className="btn-primary" onClick={() => onOpen(herb)}>
            Otwórz kartę
          </button>
        </div>
        <div className="hero-card-image">
          <HerbImage id={herb.id} title={herb.wiki} namePl={herb.namePl} nameLat={herb.nameLat} />
        </div>
      </div>

      <div className="quick-access-grid">
        <button className="quick-tile" onClick={() => onNavigate("zbiory")}>
          <span className="quick-tile-icon">
            <BasketIcon />
          </span>
          <span>
            Moje zbiory
            <span className="quick-tile-count">{collectionCount}</span>
          </span>
        </button>
        <button className="quick-tile" onClick={() => onNavigate("kalendarz")}>
          <span className="quick-tile-icon">
            <CalendarIcon />
          </span>
          <span>
            Kalendarz
            <span className="quick-tile-count">zbiory i faza</span>
          </span>
        </button>
        <button className="quick-tile" onClick={() => onNavigate("rozpoznaj")}>
          <span className="quick-tile-icon">
            <CameraIcon />
          </span>
          <span>
            Rozpoznaj
            <span className="quick-tile-count">ze zdjęcia</span>
          </span>
        </button>
      </div>

      <HarvestOfMonth herbs={HERBS} onOpen={onOpen} />

      {recentHerbs.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              margin: "1.5rem 1.4rem 0.6rem",
            }}
          >
            <span className="section-label" style={{ margin: 0 }}>
              Ostatnio oglądane
            </span>
            <button
              onClick={() => onNavigate("biblioteka")}
              style={{
                border: "none",
                background: "none",
                color: "var(--accent)",
                font: "500 0.72rem 'Inter', sans-serif",
                cursor: "pointer",
              }}
            >
              Wszystkie
            </button>
          </div>
          <div className="recent-row">
            {recentHerbs.map((h) => (
              <button
                key={h.id}
                className="recent-card"
                onClick={() => onOpen(h)}
              >
                <div className="recent-card-image">
                  <HerbImage id={h.id} title={h.wiki} namePl={h.namePl} nameLat={h.nameLat} />
                </div>
                <div>
                  <p className="recent-card-pl">{h.namePl}</p>
                  <p className="recent-card-lat">{h.nameLat}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <p className="section-label" style={{ marginTop: "1.5rem" }}>
        Archiwum botaniczne
      </p>
      <button className="archive-banner" onClick={() => onNavigate("biblioteka")}>
        <div className="archive-banner-text">
          <p>Biblioteka</p>
          <span>{HERBS.length} roślin z tradycji ludowej</span>
        </div>
        <span className="archive-banner-arrow">→</span>
      </button>
    </div>
  );
}
