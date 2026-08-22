// Prosta astronomiczna aproksymacja fazy księżyca (dokładność ±1 dzień,
// w sam raz na potrzeby kalendarza zielarskiego — bez zewnętrznego API).
const SYNODIC_MONTH = 29.530588853; // dni
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // referencyjny nów

const PHASE_NAMES = [
  "Nów",
  "Przybywający sierp",
  "Pierwsza kwadra",
  "Przybywający garb",
  "Pełnia",
  "Ubywający garb",
  "Ostatnia kwadra",
  "Ubywający sierp",
];

// age: liczba dni od ostatniego nowiu (0 .. SYNODIC_MONTH)
export function moonAge(date = new Date()) {
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const days = diff / 86400000;
  const age = days % SYNODIC_MONTH;
  return age < 0 ? age + SYNODIC_MONTH : age;
}

export function moonPhase(date = new Date()) {
  const age = moonAge(date);
  const fraction = age / SYNODIC_MONTH; // 0..1
  const index = Math.round(fraction * 8) % 8;
  const daysToFullMoon = (() => {
    const fullMoonAge = SYNODIC_MONTH / 2;
    let d = fullMoonAge - age;
    if (d < 0) d += SYNODIC_MONTH;
    return Math.round(d);
  })();
  const daysToNewMoon = Math.round(SYNODIC_MONTH - age) % Math.round(SYNODIC_MONTH);

  return {
    name: PHASE_NAMES[index],
    age,
    fraction,
    daysToFullMoon,
    daysToNewMoon,
  };
}
