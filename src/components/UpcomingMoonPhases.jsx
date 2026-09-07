import React from "react";
import MoonPhase from "./MoonPhase.jsx";
import { MONTH_NAMES } from "../data/herbs.js";
import { nadchodzaceFazyKsiezyca } from "../utils/upcomingEvents.js";

/**
 * Pasek najbliższych ośmiu odcinków cyklu księżyca — nów, przybywający
 * sierp, pierwsza kwadra... Tarcza rysowana tym samym komponentem co
 * w Kalendarzu (MoonPhase.jsx), więc żadnej nowej grafiki.
 */
export default function UpcomingMoonPhases() {
  const fazy = nadchodzaceFazyKsiezyca(6);

  if (fazy.length === 0) return null;

  return (
    <section aria-labelledby="nadchodzace-fazy">
      <h2
        className="section-label"
        id="nadchodzace-fazy"
        style={{ marginTop: "1.5rem" }}
      >
        Nadchodzące fazy księżyca
      </h2>
      {/* Pasek przewija się w poziomie — tabIndex, żeby dało się go ruszyć
          strzałkami z klawiatury, tak jak moon-strip w Kalendarzu. */}
      <ul
        className="upcoming-moon-row reset-list-row"
        tabIndex={0}
        aria-label="Nadchodzące fazy księżyca"
      >
        {fazy.map(({ data, faza }) => (
          <li key={data.toISOString()} className="upcoming-moon-card">
            <MoonPhase fraction={faza.fraction} size={34} />
            <span className="upcoming-moon-card-name">{faza.name}</span>
            <span className="upcoming-moon-card-date" aria-hidden="true">
              {data.getDate()} {MONTH_NAMES[data.getMonth()].slice(0, 3)}
            </span>
            <span className="visually-hidden">
              {data.toLocaleDateString("pl-PL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
