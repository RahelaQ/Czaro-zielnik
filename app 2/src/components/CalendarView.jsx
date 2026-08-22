import React, { useState } from "react";
import HerbCard from "./HerbCard.jsx";
import { HERBS, MONTH_NAMES } from "../data/herbs.js";
import { moonPhase } from "../utils/moonPhase.js";

export default function CalendarView({ onOpen }) {
  const currentMonth = new Date().getMonth() + 1;
  const [selected, setSelected] = useState(currentMonth);

  const inSeason = HERBS.filter((h) => h.months.includes(selected));
  const isKupala = selected === 6;
  const phase = moonPhase();

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
            {phase.daysToFullMoon === 0
              ? "Pełnia dziś"
              : `Pełnia za ${phase.daysToFullMoon} dni`}
          </p>
          <p className="moon-card-sub">Czas wzrostu i nastawiania</p>
        </div>
        <div
          className="moon-dial"
          style={{
            background: `conic-gradient(#CD9DA2 ${Math.round(
              phase.fraction * 360
            )}deg, var(--bg-image) 0deg)`,
          }}
        />
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
