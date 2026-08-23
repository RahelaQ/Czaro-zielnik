import React from "react";
import { SunIcon, MoonIcon, AutoThemeIcon } from "./Icons.jsx";
import { THEME_LABEL } from "../hooks/useTheme.js";

const ICON = {
  system: AutoThemeIcon,
  light: SunIcon,
  dark: MoonIcon,
};

const NEXT_HINT = {
  system: "Dotknij, aby wymusić jasny",
  light: "Dotknij, aby wymusić ciemny",
  dark: "Dotknij, aby wrócić do systemowego",
};

export default function ThemeToggle({ preference, onCycle }) {
  const Icon = ICON[preference] || AutoThemeIcon;
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onCycle}
      aria-label={`${THEME_LABEL[preference]}. ${NEXT_HINT[preference]}`}
      title={THEME_LABEL[preference]}
    >
      <Icon width="18" height="18" />
    </button>
  );
}
