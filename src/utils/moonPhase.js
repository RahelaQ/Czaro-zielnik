// ---------------------------------------------------------------------------
// FAZA KSIĘŻYCA — z rzeczywistych momentów nowiu i pełni.
//
// Poprzednia wersja liczyła wiek księżyca liniowo: jeden nów z roku 2000 plus
// średnia długość miesiąca synodycznego. Orbita nie jest okręgiem, więc
// prawdziwy nów wypada nawet o pół doby obok średniego. Gorsze było jednak
// nazywanie: nazwa fazy brała się z zaokrąglenia wieku do jednej ósmej cyklu,
// czyli „Pełnia" świeciła przez blisko cztery doby, w tym dwie już po pełni.
// A licznik liczył do pełni ŚREDNIEJ — w dobie prawdziwej pełni przekraczał
// półmetek cyklu i pisał „Pełnia za 29 dni". Stąd rozjazd z kalendarzem.
//
// Tutaj momenty czterech faz liczy szereg Meeusa (Astronomical Algorithms,
// rozdz. 49) — ten sam, na którym stoją almanachy. Zgodność z efemerydą to
// pojedyncze minuty. Nazwa „Pełnia" pojawia się dokładnie w tej dobie, w
// której pełnia naprawdę wypada, i tylko w niej; licznik liczy doby
// kalendarzowe do tej daty, więc nigdy nie przeskoczy o cykl.
//
// Bez zależności i bez sieci — aplikacja ma działać na miedzy.
// ---------------------------------------------------------------------------

const RAD = Math.PI / 180;
const J1970 = 2440587.5; // dzień juliański epoki uniksowej
const SYNODIC_MONTH = 29.530588861; // średni miesiąc synodyczny, w dniach

const FIRST_QUARTER = 0.25;
const FULL = 0.5;
const LAST_QUARTER = 0.75;

const fromJd = (j) => new Date(Math.round((j - J1970) * 86400000));
const sin = (deg) => Math.sin(deg * RAD);
const cos = (deg) => Math.cos(deg * RAD);

// ΔT — o tyle czas dynamiczny, w którym liczy Meeus, wyprzedza UTC.
// Wielomian Espenaka–Meeusa dla lat 2005–2050. Idzie o sekundy, nie o doby,
// ale skoro reszta jest liczona co do minuty, to niech i to się zgadza.
function deltaTDays(year) {
  const t = year - 2000;
  return (62.92 + 0.32217 * t + 0.005589 * t * t) / 86400;
}

// Przybliżony numer lunacji od nowiu ze stycznia 2000. Służy tylko do
// trafienia we właściwy cykl — dokładność bierze się z szeregu niżej.
function approxK(date) {
  const y = date.getUTCFullYear();
  const start = Date.UTC(y, 0, 1);
  const end = Date.UTC(y + 1, 0, 1);
  const decimalYear = y + (date.getTime() - start) / (end - start);
  return (decimalYear - 2000) * 12.3685;
}

// Poprawki peryodyczne dla nowiu i pełni (Meeus, tab. 49.A).
// Tablice różnią się tylko kilkoma pierwszymi współczynnikami, ale są
// przepisane osobno — scalanie ich „bo prawie takie same" to dokładnie ten
// rodzaj sprytu, przez który potem nikt nie umie sprawdzić wzoru ze źródłem.
function newMoonCorrection(E, M, Mp, F, Om) {
  return (
    -0.4072 * sin(Mp) +
    0.17241 * E * sin(M) +
    0.01608 * sin(2 * Mp) +
    0.01039 * sin(2 * F) +
    0.00739 * E * sin(Mp - M) -
    0.00514 * E * sin(Mp + M) +
    0.00208 * E * E * sin(2 * M) -
    0.00111 * sin(Mp - 2 * F) -
    0.00057 * sin(Mp + 2 * F) +
    0.00056 * E * sin(2 * Mp + M) -
    0.00042 * sin(3 * Mp) +
    0.00042 * E * sin(M + 2 * F) +
    0.00038 * E * sin(M - 2 * F) -
    0.00024 * E * sin(2 * Mp - M) -
    0.00017 * sin(Om) -
    0.00007 * sin(Mp + 2 * M) +
    0.00004 * sin(2 * Mp - 2 * F) +
    0.00004 * sin(3 * M) +
    0.00003 * sin(Mp + M - 2 * F) +
    0.00003 * sin(2 * Mp + 2 * F) -
    0.00003 * sin(Mp + M + 2 * F) +
    0.00003 * sin(Mp - M + 2 * F) -
    0.00002 * sin(Mp - M - 2 * F) -
    0.00002 * sin(3 * Mp + M) +
    0.00002 * sin(4 * Mp)
  );
}

function fullMoonCorrection(E, M, Mp, F, Om) {
  return (
    -0.40614 * sin(Mp) +
    0.17302 * E * sin(M) +
    0.01614 * sin(2 * Mp) +
    0.01043 * sin(2 * F) +
    0.00734 * E * sin(Mp - M) -
    0.00515 * E * sin(Mp + M) +
    0.00209 * E * E * sin(2 * M) -
    0.00111 * sin(Mp - 2 * F) -
    0.00057 * sin(Mp + 2 * F) +
    0.00056 * E * sin(2 * Mp + M) -
    0.00042 * sin(3 * Mp) +
    0.00042 * E * sin(M + 2 * F) +
    0.00038 * E * sin(M - 2 * F) -
    0.00024 * E * sin(2 * Mp - M) -
    0.00017 * sin(Om) -
    0.00007 * sin(Mp + 2 * M) +
    0.00004 * sin(2 * Mp - 2 * F) +
    0.00004 * sin(3 * M) +
    0.00003 * sin(Mp + M - 2 * F) +
    0.00003 * sin(2 * Mp + 2 * F) -
    0.00003 * sin(Mp + M + 2 * F) +
    0.00003 * sin(Mp - M + 2 * F) -
    0.00002 * sin(Mp - M - 2 * F) -
    0.00002 * sin(3 * Mp + M) +
    0.00002 * sin(4 * Mp)
  );
}

// Kwadry (Meeus, tab. 49.B) plus poprawka W, dodawana w pierwszej kwadrze
// i odejmowana w ostatniej.
function quarterCorrection(E, M, Mp, F, Om) {
  return (
    -0.62801 * sin(Mp) +
    0.17172 * E * sin(M) -
    0.01183 * E * sin(Mp + M) +
    0.00862 * sin(2 * Mp) +
    0.00804 * sin(2 * F) +
    0.00454 * E * sin(Mp - M) +
    0.00204 * E * E * sin(2 * M) -
    0.0018 * sin(Mp - 2 * F) -
    0.0007 * sin(Mp + 2 * F) -
    0.0004 * sin(3 * Mp) -
    0.00034 * E * sin(2 * Mp - M) +
    0.00032 * E * sin(M + 2 * F) +
    0.00032 * E * sin(M - 2 * F) -
    0.00028 * E * E * sin(Mp + 2 * M) +
    0.00027 * E * sin(2 * Mp + M) -
    0.00017 * sin(Om) -
    0.00005 * sin(Mp - M - 2 * F) +
    0.00004 * sin(2 * Mp + 2 * F) -
    0.00004 * sin(Mp + M + 2 * F) +
    0.00004 * sin(Mp - 2 * M) +
    0.00003 * sin(Mp + M - 2 * F) +
    0.00003 * sin(3 * M) +
    0.00002 * sin(2 * Mp - 2 * F) +
    0.00002 * sin(Mp - M + 2 * F) -
    0.00002 * sin(3 * Mp + M)
  );
}

function quarterW(E, M, Mp, F) {
  return (
    0.00306 -
    0.00038 * E * cos(M) +
    0.00026 * cos(Mp) -
    0.00002 * cos(Mp - M) +
    0.00002 * cos(Mp + M) +
    0.00002 * cos(2 * F)
  );
}

// Poprawki planetarne, wspólne dla wszystkich czterech faz (Meeus, s. 351).
function planetaryCorrection(k, T) {
  const A = [
    [299.77 + 0.107408 * k - 0.009173 * T * T, 0.000325],
    [251.88 + 0.016321 * k, 0.000165],
    [251.83 + 26.651886 * k, 0.000164],
    [349.42 + 36.412478 * k, 0.000126],
    [84.66 + 18.206239 * k, 0.00011],
    [141.74 + 53.303771 * k, 0.000062],
    [207.14 + 2.453732 * k, 0.00006],
    [154.84 + 7.30686 * k, 0.000056],
    [34.52 + 27.261239 * k, 0.000047],
    [207.19 + 0.121824 * k, 0.000042],
    [291.34 + 1.844379 * k, 0.00004],
    [161.72 + 24.198154 * k, 0.000037],
    [239.56 + 25.513099 * k, 0.000035],
    [331.55 + 3.592518 * k, 0.000023],
  ];
  return A.reduce((sum, [angle, amp]) => sum + amp * sin(angle), 0);
}

// Moment jednej z czterech faz, jako Date w UTC.
// k całkowite = nów; +0,25 pierwsza kwadra; +0,5 pełnia; +0,75 ostatnia.
function phaseMoment(k) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  let j =
    2451550.09766 +
    SYNODIC_MONTH * k +
    0.00015437 * T2 -
    0.00000015 * T3 +
    0.00000000073 * T4;

  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3;
  const Mp =
    201.5643 +
    385.81693528 * k +
    0.0107582 * T2 +
    0.00001238 * T3 -
    0.000000058 * T4;
  const F =
    160.7108 +
    390.67050284 * k -
    0.0016118 * T2 -
    0.00000227 * T3 +
    0.000000011 * T4;
  const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3;

  const frac = ((k % 1) + 1) % 1;
  if (Math.abs(frac - FULL) < 1e-6) {
    j += fullMoonCorrection(E, M, Mp, F, Om);
  } else if (Math.abs(frac - FIRST_QUARTER) < 1e-6) {
    j += quarterCorrection(E, M, Mp, F, Om) + quarterW(E, M, Mp, F);
  } else if (Math.abs(frac - LAST_QUARTER) < 1e-6) {
    j += quarterCorrection(E, M, Mp, F, Om) - quarterW(E, M, Mp, F);
  } else {
    j += newMoonCorrection(E, M, Mp, F, Om);
  }

  j += planetaryCorrection(k, T);
  j -= deltaTDays(2000 + k / 12.3685); // czas dynamiczny → UTC

  return fromJd(j);
}

// Numer lunacji, której nów wypada nie później niż `date`.
// Szereg jest ciągły, więc wystarczy zejść lub podejść o jeden cykl.
function lunationAt(date) {
  let k = Math.floor(approxK(date));
  for (let i = 0; i < 4; i += 1) {
    if (phaseMoment(k) > date) k -= 1;
    else if (phaseMoment(k + 1) <= date) k += 1;
    else break;
  }
  return k;
}

// --- doby kalendarzowe, lokalnie -------------------------------------------
// Zbieractwo dzieje się w dobach, nie w ułamkach cyklu: „pełnia jest dziś"
// znaczy „moment pełni wypada w dzisiejszej dacie", w strefie użytkownika.
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();
const dayDiff = (from, to) =>
  Math.round((startOfDay(to) - startOfDay(from)) / 86400000);

const PHASE_NAMES = {
  new: "Nów",
  waxingCrescent: "Przybywający sierp",
  firstQuarter: "Pierwsza kwadra",
  waxingGibbous: "Przybywający garb",
  full: "Pełnia",
  waningGibbous: "Ubywający garb",
  lastQuarter: "Ostatnia kwadra",
  waningCrescent: "Ubywający sierp",
};

/**
 * Cztery momenty otaczające podaną datę: nów rozpoczynający bieżącą lunację,
 * jej kwadry i pełnia, oraz nów następny.
 */
export function lunation(date = new Date()) {
  const k = lunationAt(date);
  return {
    k,
    newMoon: phaseMoment(k),
    firstQuarter: phaseMoment(k + FIRST_QUARTER),
    fullMoon: phaseMoment(k + FULL),
    lastQuarter: phaseMoment(k + LAST_QUARTER),
    nextNewMoon: phaseMoment(k + 1),
  };
}

// Położenie w cyklu, 0 = nów, 0,5 = pełnia. Interpolowane odcinkami między
// czterema prawdziwymi momentami, a nie liniowo od nowiu — dzięki temu
// rysunek tarczy pokazuje dokładnie pół koła w kwadrze i pełne w pełni,
// nawet gdy księżyc idzie przez perygeum i cykl jest niesymetryczny.
function cycleFraction(date, l) {
  const t = date.getTime();
  const points = [
    [l.newMoon.getTime(), 0],
    [l.firstQuarter.getTime(), 0.25],
    [l.fullMoon.getTime(), 0.5],
    [l.lastQuarter.getTime(), 0.75],
    [l.nextNewMoon.getTime(), 1],
  ];
  for (let i = 0; i < points.length - 1; i += 1) {
    const [t0, f0] = points[i];
    const [t1, f1] = points[i + 1];
    if (t <= t1) return f0 + ((t - t0) / (t1 - t0)) * (f1 - f0);
  }
  return 1;
}

export function moonPhase(date = new Date()) {
  const l = lunation(date);
  const fraction = cycleFraction(date, l);

  // Nazwa punktowa należy się tylko tej dobie, w której moment naprawdę
  // wypada. Poza nią — nazwa przedziału. Inaczej „Pełnia" wisi cztery dni.
  let key;
  if (sameDay(date, l.newMoon) || sameDay(date, l.nextNewMoon)) key = "new";
  else if (sameDay(date, l.firstQuarter)) key = "firstQuarter";
  else if (sameDay(date, l.fullMoon)) key = "full";
  else if (sameDay(date, l.lastQuarter)) key = "lastQuarter";
  else if (fraction < 0.25) key = "waxingCrescent";
  else if (fraction < 0.5) key = "waxingGibbous";
  else if (fraction < 0.75) key = "waningGibbous";
  else key = "waningCrescent";

  // Najbliższa pełnia: dzisiejsza, jeśli wypada dziś, inaczej ta z tej
  // lunacji lub — gdy już minęła — z następnej.
  const fullMoon =
    sameDay(date, l.fullMoon) || l.fullMoon >= date
      ? l.fullMoon
      : phaseMoment(l.k + 1 + FULL);
  // Nów bieżącej lunacji zaczyna się przed `date` z definicji, ale jeśli
  // wypadł dziś nad ranem, to dla kalendarza wciąż jest „dzisiejszy nów",
  // a nie ten za miesiąc.
  const newMoon = sameDay(date, l.newMoon) ? l.newMoon : l.nextNewMoon;

  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;

  return {
    name: PHASE_NAMES[key],
    key,
    fraction,
    illumination,
    waxing: fraction < 0.5,
    age: (date - l.newMoon) / 86400000,
    fullMoon,
    newMoon,
    daysToFullMoon: dayDiff(date, fullMoon),
    daysToNewMoon: dayDiff(date, newMoon),
    isFullMoon: key === "full",
    isNewMoon: key === "new",
  };
}

// Wiek księżyca w dniach od prawdziwego nowiu. Zostaje, bo bywa czytelniejszy
// niż ułamek cyklu, a przy okazji trzyma stare wywołania przy życiu.
export function moonAge(date = new Date()) {
  return (date - lunation(date).newMoon) / 86400000;
}

/**
 * Momenty nowiu i pełni wypadające w danym miesiącu kalendarzowym.
 * Miesiąc liczony po ludzku: 1 = styczeń.
 */
export function moonEventsInMonth(year, month) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);
  const events = [];
  let k = lunationAt(from) - 1;
  for (let i = 0; i < 4; i += 1, k += 1) {
    const nw = phaseMoment(k);
    const fl = phaseMoment(k + FULL);
    if (nw >= from && nw < to) events.push({ type: "new", name: PHASE_NAMES.new, date: nw });
    if (fl >= from && fl < to) events.push({ type: "full", name: PHASE_NAMES.full, date: fl });
  }
  return events.sort((a, b) => a.date - b.date);
}

export { SYNODIC_MONTH, PHASE_NAMES };
