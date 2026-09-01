import React, { useState } from "react";
import HerbCard from "./HerbCard.jsx";
import { HERBS, MONTH_NAMES } from "../data/herbs.js";
import { moonPhase } from "../utils/moonPhase.js";
import MoonPhase from "./MoonPhase.jsx";

// „za 1 dni" kłuło w oczy przy każdym cyklu — a to jedyny przypadek, w którym
// polska odmiana odbiega od reszty liczebników.
const dni = (n) => (n === 1 ? "1 dzień" : `${n} dni`);

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

      <div className="moon-card">
        <div>
          <span className="section-label" style={{ margin: 0 }}>
            {phase.name.toUpperCase()}
          </span>
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
        <MoonPhase
          fraction={phase.fraction}
          size={64}
          className="moon-dial"
          title={phase.name}
        />
      </div>

      <div className="moon-strip">
        {tydzien.map(({ data, faza, dzis }) => (
          <div
            key={data.toISOString()}
            className={"moon-strip__day" + (dzis ? " moon-strip__day--today" : "")}
            title={`${data.toLocaleDateString("pl-PL")} — ${faza.name}`}
          >
            <MoonPhase fraction={faza.fraction} size={30} />
            <span className="moon-strip__label">
              {dzis ? "dziś" : data.toLocaleDateString("pl-PL", { weekday: "short" })}
            </span>
          </div>
        ))}
      </div>

      <div className="month-scroller">
        {MONTH_NAMES.map((m, idx) => (
          <button
            key={m}
            className={
              "month-pill" + (selected === idx + 1 ? " month-pill--active" : "")
            }
            onClick={() => setSelected(idx + 1)}
          >
            {m.slice(0, 3)}
          </button>
        ))}
      </div>

      {isKupala && (
        <div className="kupala-note">
          🌕 Noc świętojańska (Kupała), 23/24 czerwca — tradycyjnie najsilniejszy
          czas mocy ziół: dziurawca, bylicy piołun i paproci.
        </div>
      )}

      <p className="section-label" style={{ marginTop: "1.3rem" }}>
        Do zbioru w {MONTH_NAMES[selected - 1].toLowerCase()}u
      </p>

      {inSeason.length === 0 ? (
        <p className="empty-note">
          W tym miesiącu ziemia odpoczywa — żadne z ziół z Twojego zielnika nie
          jest teraz w sezonie.
        </p>
      ) : (
        <div className="herb-grid">
          {inSeason.map((h) => (
            <HerbCard key={h.id} herb={h} onOpen={onOpen} activeThisMonth />
          ))}
        </div>
      )}
    </div>
  );
}
