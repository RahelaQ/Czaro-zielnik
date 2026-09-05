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
      {/* Znak firmowy jest jednoczesnie tytulem ekranu — h1, nie sam rysunek.
          Logo dostaje aria-hidden, bo nazwa stoi tuz obok slowami; inaczej
          czytnik ekranu przeczytalby ja dwa razy. */}
      <div className="wordmark-row">
        <h1 className="lockup">
          <Logo size={38} weight={1.5} aria-hidden="true" />
          <span className="lockup-rule" aria-hidden="true" />
          <span className="wordmark">CZARO — ZIELNIK</span>
        </h1>
      </div>

      <section aria-labelledby="zielo-dnia">
        <h2 className="section-label" id="zielo-dnia">Zioło dnia</h2>
        <div className="hero-card">
          <div className="hero-card-text">
            <h3>{herb.namePl}</h3>
            <p className="hero-card-lat">{herb.nameLat}</p>
            <p className="hero-card-desc">{herb.moc}</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onOpen(herb)}
            >
              Otwórz kartę<span className="visually-hidden"> rośliny {herb.namePl}</span>
            </button>
          </div>
          <div className="hero-card-image">
            <HerbImage
              id={herb.id}
              title={herb.wiki}
              namePl={herb.namePl}
              nameLat={herb.nameLat}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="skroty">
        <h2 className="visually-hidden" id="skroty">Skróty</h2>
        <div className="quick-access-grid">
          <button
            type="button"
            className="quick-tile"
            onClick={() => onNavigate("zbiory")}
            aria-label={`Moje zbiory — ${collectionCount} ${
              collectionCount === 1 ? "roślina" : "roślin"
            }`}
          >
            <span className="quick-tile-icon">
              <BasketIcon aria-hidden="true" focusable="false" />
            </span>
            <span>
              Moje zbiory
              <span className="quick-tile-count">{collectionCount}</span>
            </span>
          </button>
          <button
            type="button"
            className="quick-tile"
            onClick={() => onNavigate("kalendarz")}
            aria-label="Kalendarz — zbiory i faza księżyca"
          >
            <span className="quick-tile-icon">
              <CalendarIcon aria-hidden="true" focusable="false" />
            </span>
            <span>
              Kalendarz
              <span className="quick-tile-count">zbiory i faza</span>
            </span>
          </button>
          <button
            type="button"
            className="quick-tile"
            onClick={() => onNavigate("rozpoznaj")}
            aria-label="Rozpoznaj roślinę ze zdjęcia"
          >
            <span className="quick-tile-icon">
              <CameraIcon aria-hidden="true" focusable="false" />
            </span>
            <span>
              Rozpoznaj
              <span className="quick-tile-count">ze zdjęcia</span>
            </span>
          </button>
        </div>
      </section>

      <HarvestOfMonth herbs={HERBS} onOpen={onOpen} />

      {recentHerbs.length > 0 && (
        <section aria-labelledby="ostatnio">
          <div className="row-header">
            <h2 className="section-label" id="ostatnio">
              Ostatnio oglądane
            </h2>
            <button
              type="button"
              className="link-button link-button--quiet"
              onClick={() => onNavigate("biblioteka")}
            >
              Wszystkie<span className="visually-hidden"> rośliny w Bibliotece</span>
            </button>
          </div>
          <ul className="recent-row reset-list-row">
            {recentHerbs.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  className="recent-card"
                  onClick={() => onOpen(h)}
                  aria-label={`${h.namePl}, ${h.nameLat}. Otwórz kartę`}
                >
                  <span className="recent-card-image">
                    <HerbImage
                      id={h.id}
                      title={h.wiki}
                      namePl={h.namePl}
                      nameLat={h.nameLat}
                      decorative
                    />
                  </span>
                  <span>
                    <span className="recent-card-pl">{h.namePl}</span>
                    <span className="recent-card-lat">{h.nameLat}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="archiwum">
        <h2 className="section-label" id="archiwum" style={{ marginTop: "1.5rem" }}>
          Archiwum botaniczne
        </h2>
        <button
          type="button"
          className="archive-banner"
          onClick={() => onNavigate("biblioteka")}
          aria-label={`Otwórz Bibliotekę — ${HERBS.length} roślin z tradycji ludowej`}
        >
          <span className="archive-banner-text">
            <span className="archive-banner-title">Biblioteka</span>
            <span>{HERBS.length} roślin z tradycji ludowej</span>
          </span>
          <span className="archive-banner-arrow" aria-hidden="true">→</span>
        </button>
      </section>
    </div>
  );
}
