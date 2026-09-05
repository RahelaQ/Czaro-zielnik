import React, { useState } from "react";
import HerbCard from "./HerbCard.jsx";
import { HERBS, MONTH_NAMES } from "../data/herbs.js";
import { moonPhase } from "../utils/moonPhase.js";
import MoonPhase from "./MoonPhase.jsx";

// „za 1 dni" kłuło w oczy przy każdym cyklu — a to jedyny przypadek, w którym
// polska odmiana odbiega od reszty liczebników.
const dni = (n) => (n === 1 ? "1 dzień" : `${n} dni`);

// Nazwy miesiecy w miejscowniku. Wczesniej naglowek sklejalo sie z mianownika
// plus "u" — wychodzilo "Do zbioru w wrzesieńu" i "w listopadu". Na ekranie
// razilo, a czytnik ekranu czytal to na glos slowo w slowo.
const W_MIESIACU = [
  "w styczniu", "w lutym", "w marcu", "w kwietniu", "w maju", "w czerwcu",
  "w lipcu", "w sierpniu", "we wrześniu", "w październiku", "w listopadzie",
  "w grudniu",
];

export default function CalendarView({ onOpen }) {
  const currentMonth = new Date().getMonth() + 1;
  const [selected, setSelected] = useState(currentMonth);

  const inSeason = HERBS.filter((h) => h.months.includes(selected));
  const isKupala = selected === 6;
  const phase = moonPhase();

  // Dokładny moment najbliższej pełni. Skoro liczymy go co do minuty, to
  // niech go widać: w terenie różnica między pełnią o 6 rano a o 22 to
  // różnica między dwoma wieczorami.
  const momentPelni = phase.fullMoon.toLocaleString("pl-PL", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Najbliższy tydzień księżyca. W zielarstwie termin zbioru wiąże się
  // z fazą, więc widok siedmiu dni naraz jest praktyczny, nie ozdobny.
  const today = new Date();
  const tydzien = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return { data: d, faza: moonPhase(d), dzis: i === 0 };
  });

  return (
    <div className="calendar-view">
      <div className="screen-header">
        <div>
          <h1>Kalendarz</h1>
          <p>Rytm zbiorów i księżyca</p>
        </div>
      </div>

      <section aria-labelledby="faza-ksiezyca">
        <div className="moon-card">
          <div>
            <h2 className="section-label" id="faza-ksiezyca" style={{ margin: 0 }}>
              {phase.name.toUpperCase()}
            </h2>
            <p className="moon-card-phase">
              {phase.isFullMoon
                ? "Pełnia dziś"
                : `Pełnia za ${dni(phase.daysToFullMoon)}`}
            </p>
            <p className="moon-card-sub">
              {momentPelni}
              {phase.waxing ? " · czas wzrostu i nastawiania" : ""}
            </p>
          </div>
          {/* Rysunek fazy powtarza to, co stoi obok slowami, wiec dla czytnika
              ekranu jest ozdobnikiem — inaczej "pierwsza kwadra" pada dwa razy. */}
          <MoonPhase
            fraction={phase.fraction}
            size={64}
            className="moon-dial"
          />
        </div>

        {/* Pasek siedmiu dni. Kazdy dzien to data i nazwa fazy — sam rysunek
            nie mowi nic osobie, ktora go nie widzi. */}
        {/* tabIndex=0: pasek przewija sie w poziomie, a przewijalny obszar
            bez elementu do sfokusowania jest niedostepny z klawiatury —
            strzalkami nie da sie go ruszyc, jesli nie mozna w nim stanac. */}
        <ul
          className="moon-strip reset-list-row"
          tabIndex={0}
          aria-label="Fazy księżyca na najbliższy tydzień"
        >
          {tydzien.map(({ data, faza, dzis }) => (
            <li
              key={data.toISOString()}
              className={"moon-strip__day" + (dzis ? " moon-strip__day--today" : "")}
            >
              <MoonPhase fraction={faza.fraction} size={30} />
              <span className="moon-strip__label" aria-hidden="true">
                {dzis ? "dziś" : data.toLocaleDateString("pl-PL", { weekday: "short" })}
              </span>
              <span className="visually-hidden">
                {dzis ? "Dziś, " : ""}
                {data.toLocaleDateString("pl-PL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                {" — "}
                {faza.name}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="do-zbioru">
        <div className="month-scroller" role="group" aria-label="Wybór miesiąca">
          {MONTH_NAMES.map((m, idx) => (
            <button
              key={m}
              type="button"
              className={
                "month-pill" + (selected === idx + 1 ? " month-pill--active" : "")
              }
              aria-pressed={selected === idx + 1}
              onClick={() => setSelected(idx + 1)}
            >
              <span aria-hidden="true">{m.slice(0, 3)}</span>
              <span className="visually-hidden">{m}</span>
            </button>
          ))}
        </div>

        {isKupala && (
          <div className="kupala-note">
            <span aria-hidden="true">🌕 </span>Noc świętojańska (Kupała), 23/24
            czerwca — tradycyjnie najsilniejszy czas mocy ziół: dziurawca,
            bylicy piołun i paproci.
          </div>
        )}

        <h2 className="section-label" id="do-zbioru" style={{ marginTop: "1.3rem" }}>
          Do zbioru {W_MIESIACU[selected - 1]}
        </h2>

        {/* Zmiana miesiaca przebudowuje liste, nie ruszajac fokusu. */}
        <p className="visually-hidden" role="status">
          {MONTH_NAMES[selected - 1]}:{" "}
          {inSeason.length === 0
            ? "brak roślin w sezonie"
            : inSeason.length === 1
            ? "1 roślina do zbioru"
            : `${inSeason.length} roślin do zbioru`}
        </p>

        {inSeason.length === 0 ? (
          <p className="empty-note">
            W tym miesiącu ziemia odpoczywa — żadne z ziół z Twojego zielnika nie
            jest teraz w sezonie.
          </p>
        ) : (
          <ul className="herb-grid reset-list-grid">
            {inSeason.map((h) => (
              <li key={h.id}>
                <HerbCard herb={h} onOpen={onOpen} activeThisMonth />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
