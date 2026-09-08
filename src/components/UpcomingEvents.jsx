import React from "react";
import { FlameIcon, SproutIcon } from "./Icons.jsx";
import MoonPhase from "./MoonPhase.jsx";
import { MONTH_NAMES } from "../data/herbs.js";
import { nadchodzaceWydarzenia } from "../utils/upcomingEvents.js";

function Ikona({ typ }) {
  if (typ === "sabat") return <FlameIcon aria-hidden="true" focusable="false" />;
  if (typ === "pelnia") return <MoonPhase fraction={0.5} size={20} />;
  if (typ === "now") return <MoonPhase fraction={0} size={20} />;
  return <SproutIcon aria-hidden="true" focusable="false" />;
}

/**
 * Lista najbliższych wydarzeń: sabaty Koła Roku, pełnia i nów, start
 * sezonu zbioru. Dane składa utils/upcomingEvents.js z trzech już
 * istniejących źródeł — ten komponent tylko je rysuje.
 */
export default function UpcomingEvents() {
  const wydarzenia = nadchodzaceWydarzenia(4);

  if (wydarzenia.length === 0) return null;

  return (
    <section aria-labelledby="nadchodzace-wydarzenia">
      <h2
        className="section-label"
        id="nadchodzace-wydarzenia"
        style={{ marginTop: "1.5rem" }}
      >
        Nadchodzące wydarzenia
      </h2>
      <ul className="event-list reset-list-row">
        {wydarzenia.map((ev) => (
          <li key={ev.id} className="event-card">
            <span className="event-card-icon" aria-hidden="true">
              <Ikona typ={ev.typ} />
            </span>
            <span className="event-card-text">
              <span className="event-card-title">{ev.nazwa}</span>
              <span className="event-card-desc">{ev.opis}</span>
            </span>
            <span className="event-card-date">
              <span>
                {ev.data.getDate()} {MONTH_NAMES[ev.data.getMonth()].slice(0, 3)}
              </span>
              <span className="event-card-time">
                {ev.data.toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
