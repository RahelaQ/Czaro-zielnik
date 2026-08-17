import { useEffect, useState } from "react";

// Odpowiednik window.storage z artefaktów Claude, ale trwały lokalnie
// na telefonie/w przeglądarce użytkowniczki (localStorage).
export function useHerbNote(id) {
  const key = `zielnik:note:${id}`;
  const [note, setNoteState] = useState(() => {
    try {
      return localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      setNoteState(localStorage.getItem(key) ?? "");
    } catch {
      setNoteState("");
    }
  }, [key]);

  const save = (value) => {
    setNoteState(value);
    try {
      localStorage.setItem(key, value);
    } catch {
      // brak dostępu do localStorage (np. tryb prywatny) - notatka zostaje tylko w widoku
    }
  };

  return { note, setNote: save };
}
