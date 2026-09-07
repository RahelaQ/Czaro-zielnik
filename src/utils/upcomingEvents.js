// ---------------------------------------------------------------------------
// NADCHODZĄCE WYDARZENIA — ekran główny.
//
// Trzy źródła, jedna oś czasu: fazy księżyca (moonPhase.js), sabaty
// (wheelOfYear.js) i start sezonu zbioru (HERBS.months). Nic tu nie liczy
// niczego nowego astronomicznie — to wyłącznie odpytanie już istniejących
// funkcji dzień po dniu albo miesiąc po miesiącu i poskładanie wyniku
// w jedną, posortowaną listę.
// ---------------------------------------------------------------------------

import { HERBS, MONTH_NAMES } from "../data/herbs.js";
import { moonPhase, moonEventsInMonth } from "./moonPhase.js";
import { sabatyWPrzedziale } from "./wheelOfYear.js";

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Kolejne dni, w których zmienia się NAZWA fazy księżyca — czyli początek
 * każdego z ośmiu odcinków cyklu (nów, przybywający sierp, pierwsza
 * kwadra...). Odpytuje moonPhase() dzień po dniu i łapie moment, w którym
 * `key` się zmienia — do paska na ekranie głównym, osobnego od pełnowymiarowej
 * listy wydarzeń niżej.
 */
export function nadchodzaceFazyKsiezyca(n = 6, from = new Date()) {
  const wyniki = [];
  let poprzedniKey = null;
  const dzien = startOfDay(from);
  for (let i = 0; wyniki.length < n && i < 60; i += 1) {
    const data = new Date(dzien);
    data.setDate(dzien.getDate() + i);
    const faza = moonPhase(data);
    if (faza.key !== poprzedniKey) {
      wyniki.push({ data, faza });
      poprzedniKey = faza.key;
    }
  }
  return wyniki;
}

/**
 * Miesiące, w których zaczyna się sezon zbioru co najmniej jednego ziela —
 * miesiąc jest w `months` danego ziela, a poprzedni nie był. Data zdarzenia
 * to pierwszy dzień tego miesiąca, godzina umowna.
 */
export function startySezonuZbioru(n = 3, from = new Date()) {
  const wyniki = [];
  const dzisiaj = startOfDay(from);
  let rok = from.getFullYear();
  let miesiac = from.getMonth() + 1; // 1-12, bieżący

  for (let i = 0; wyniki.length < n && i < 13; i += 1) {
    const poprzedniMiesiac = miesiac === 1 ? 12 : miesiac - 1;
    const zaczynajace = HERBS.filter(
      (h) => h.months.includes(miesiac) && !h.months.includes(poprzedniMiesiac)
    );
    const pierwszy = new Date(rok, miesiac - 1, 1, 9, 0);
    if (zaczynajace.length > 0 && pierwszy >= dzisiaj) {
      wyniki.push({ data: pierwszy, ziola: zaczynajace });
    }
    miesiac += 1;
    if (miesiac > 12) { miesiac = 1; rok += 1; }
  }
  return wyniki;
}

/**
 * Połączona lista nadchodzących wydarzeń: sabaty, pełnia i nów (jedyne dwie
 * fazy, które dostają tu pełną kartę — reszta faz stoi w osobnym pasku
 * powyżej) i start sezonu zbioru. Posortowane po dacie, przycięte do `n`.
 */
export function nadchodzaceWydarzenia(n = 4, from = new Date()) {
  const dzisiaj = startOfDay(from);
  const za90Dni = new Date(dzisiaj);
  za90Dni.setDate(za90Dni.getDate() + 90);

  const sabaty = sabatyWPrzedziale(dzisiaj, za90Dni).map((s) => ({
    id: `sabat-${s.id}-${s.data.getFullYear()}`,
    typ: "sabat",
    nazwa: s.nazwa,
    opis: s.opis,
    data: s.data,
  }));

  const ksiezycowe = [];
  let rok = dzisiaj.getFullYear();
  let miesiac = dzisiaj.getMonth() + 1;
  for (let i = 0; i < 4; i += 1) {
    moonEventsInMonth(rok, miesiac).forEach((ev) => {
      if (ev.date >= dzisiaj) {
        ksiezycowe.push({
          id: `${ev.type}-${ev.date.toISOString()}`,
          typ: ev.type === "full" ? "pelnia" : "now",
          nazwa: ev.type === "full" ? "Pełnia" : "Nów",
          opis:
            ev.type === "full"
              ? "Esbat — szczyt cyklu, czas mocy i domykania."
              : "Nowy początek — czas siania intencji.",
          data: ev.date,
        });
      }
    });
    miesiac += 1;
    if (miesiac > 12) { miesiac = 1; rok += 1; }
  }

  const zbior = startySezonuZbioru(3, dzisiaj).map((z) => {
    const nazwy = z.ziola.map((h) => h.namePl);
    const opis =
      nazwy.length <= 3
        ? nazwy.join(", ")
        : `${nazwy.slice(0, 3).join(", ")} i ${nazwy.length - 3} więcej`;
    return {
      id: `zbior-${z.data.toISOString()}`,
      typ: "zbior",
      nazwa: `Start zbioru — ${MONTH_NAMES[z.data.getMonth()]}`,
      opis,
      data: z.data,
    };
  });

  return [...sabaty, ...ksiezycowe, ...zbior]
    .sort((a, b) => a.data - b.data)
    .slice(0, n);
}
