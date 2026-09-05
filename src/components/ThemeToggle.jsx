import React from "react";
import { SunIcon, MoonIcon, AutoThemeIcon } from "./Icons.jsx";
import { THEME_LABEL } from "../hooks/useTheme.js";

const ICON = {
  system: AutoThemeIcon,
  light: SunIcon,
  dark: MoonIcon,
};

// "Dotknij" zaklada palec. Przycisk obsluguje sie takze klawiatura, wiec
// etykieta mowi, co sie stanie, a nie czym trzeba to zrobic.
const NEXT_HINT = {
  system: "przełącz na jasny",
  light: "przełącz na ciemny",
  dark: "wróć do motywu systemowego",
};

export default function ThemeToggle({ preference, onCycle }) {
  const Icon = ICON[preference] || AutoThemeIcon;
  return (
    <>
      <button
        type="button"
        className="theme-toggle"
        onClick={onCycle}
        aria-label={`${THEME_LABEL[preference]}. Naciśnij, aby ${NEXT_HINT[preference]}`}
        title={THEME_LABEL[preference]}
      >
        <Icon width="18" height="18" />
      </button>
      {/* Przelaczenie motywu zmienia wylacznie kolory — dla osoby, ktora ich
          nie widzi, nie dzieje sie nic. Mowimy, co sie zmienilo. */}
      <p className="visually-hidden" role="status">
        {THEME_LABEL[preference]}
      </p>
    </>
  );
}
