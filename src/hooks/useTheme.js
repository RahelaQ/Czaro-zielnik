// ---------------------------------------------------------------------------
// MOTYW — trzy stany, nie dwa.
//
//   "system" (domyslny) — idzie za ustawieniem telefonu
//   "light"             — wymuszony jasny
//   "dark"              — wymuszony ciemny
//
// Trzeci stan ma znaczenie: telefon sam przelacza sie na ciemny o zmierzchu,
// i dopoki nie dotkniesz przelacznika, appka ma robic to samo.
//
// Wybor trzymamy w localStorage, nie w IndexedDB — musi byc czytelny
// synchronicznie w skrypcie w index.html, zanim cokolwiek sie narysuje.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";

const KEY = "czaro-theme";
export const THEME_ORDER = ["system", "light", "dark"];

export const THEME_LABEL = {
  system: "Motyw: systemowy",
  light: "Motyw: jasny",
  dark: "Motyw: ciemny",
};

function read() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function apply(pref) {
  const root = document.documentElement;
  if (pref === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", pref);

  const isDark = pref === "dark" || (pref === "system" && systemPrefersDark());
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", isDark ? "#313531" : "#EAE4DA");
  return isDark;
}

export function useTheme() {
  const [preference, setPreference] = useState(read);
  const [isDark, setIsDark] = useState(() => {
    const p = read();
    return p === "dark" || (p === "system" && systemPrefersDark());
  });

  useEffect(() => {
    setIsDark(apply(preference));
    try {
      if (preference === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, preference);
    } catch {
      // brak dostepu do localStorage nie moze wywrocic appki
    }
  }, [preference]);

  // Gdy siedzimy na "systemowym", a telefon przelaczy sie o zmierzchu —
  // appka ma pojsc za nim od razu, bez przeladowania.
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setIsDark(apply("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const cycle = useCallback(() => {
    setPreference((p) => THEME_ORDER[(THEME_ORDER.indexOf(p) + 1) % THEME_ORDER.length]);
  }, []);

  return { preference, setPreference, cycle, isDark };
}
