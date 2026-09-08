// ---------------------------------------------------------------------------
// KOŁO ROKU — osiem sabatów: cztery liczone astronomicznie (równonoce i
// przesilenia), cztery liczone kalendarzowo (dni krzyżowe, od dawna stałe
// w tradycji, nie astronomiczne).
//
// Równonoce i przesilenia liczy niskoprecyzyjny szereg Meeusa (Astronomical
// Algorithms, rozdz. 27) — ten sam rodzaj źródła co fazy księżyca w
// moonPhase.js, tylko mniejszy zestaw stałych, bo do innego zjawiska.
// Powielenie kilku linii (ΔT, sin/cos w stopniach) jest tańsze niż
// doklejanie zależności między modułami, które nie mają ze sobą nic
// wspólnego poza tym, że oba liczą coś na niebie — ta sama zasada, co przy
// osobnych tabelach poprawek nowiu i pełni w moonPhase.js.
//
// Koło Roku to układ neopogański (wiccański) z XX wieku — appka nie udaje,
// że to zapis dawnej Słowiańszczyzny. Tam, gdzie w polskiej tradycji ludowej
// stoi bliski odpowiednik, jest on dopisany wprost przy nazwie — tak jak
// Kalendarz już robi to z Kupałą.
// ---------------------------------------------------------------------------

const RAD = Math.PI / 180;
const sin = (deg) => Math.sin(deg * RAD);
const cos = (deg) => Math.cos(deg * RAD);
const J1970 = 2440587.5;
const fromJd = (j) => new Date(Math.round((j - J1970) * 86400000));

// ΔT — czas dynamiczny wyprzedza UTC. Ten sam wielomian (Espenak–Meeus,
// 2005–2050) co w moonPhase.js.
function deltaTDays(year) {
  const t = year - 2000;
  return (62.92 + 0.32217 * t + 0.005589 * t * t) / 86400;
}

// Meeus, tab. 27.C — 24 wyrazy poprawki peryodycznej, wspólne dla
// równonocy i przesileń.
const TERMS = [
  [485, 324.96, 1934.136], [203, 337.23, 32964.467], [199, 342.08, 20.186],
  [182, 27.85, 445267.112], [156, 73.14, 45036.886], [136, 171.52, 22518.443],
  [77, 222.54, 65928.934], [74, 296.72, 3034.906], [70, 243.58, 9037.513],
  [58, 119.81, 33718.147], [52, 297.17, 150.678], [50, 21.02, 2281.226],
  [45, 247.54, 29929.562], [44, 325.15, 31555.956], [29, 60.93, 4443.417],
  [18, 155.12, 67555.328], [17, 288.79, 4562.452], [16, 198.04, 62894.029],
  [14, 199.76, 31436.921], [12, 95.39, 14577.848], [12, 287.11, 31931.756],
  [12, 320.81, 34777.259], [9, 227.73, 1222.114], [8, 15.45, 16859.074],
];

// Meeus 27.1 — wielomiany momentu średniego (JDE0), osobne dla każdego z
// czterech zjawisk, ważne dla lat 1000–3000: ogromny zapas na potrzeby
// tej appki.
const JDE0_POLY = {
  marzec: [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
  czerwiec: [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.0003],
  wrzesien: [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
  grudzien: [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032],
};

function moment(sezon, year) {
  const Y = (year - 2000) / 1000;
  const [c0, c1, c2, c3, c4] = JDE0_POLY[sezon];
  const jde0 = c0 + c1 * Y + c2 * Y * Y + c3 * Y * Y * Y + c4 * Y * Y * Y * Y;

  const T = (jde0 - 2451545.0) / 36525;
  const W = 35999.373 * T - 2.47;
  const deltaLambda = 1 + 0.0334 * cos(W) + 0.0007 * cos(2 * W);
  const S = TERMS.reduce((suma, [a, b, c]) => suma + a * cos(b + c * T), 0);

  const jde = jde0 + (0.00001 * S) / deltaLambda;
  return fromJd(jde - deltaTDays(year));
}

export const rownonocWiosenna = (year) => moment("marzec", year);
export const przesilenieLetnie = (year) => moment("czerwiec", year);
export const rownonocJesienna = (year) => moment("wrzesien", year);
export const przesilenieZimowe = (year) => moment("grudzien", year);

// Dni krzyżowe — stałe kalendarzowo, godzina 9:00 jako umowna pora dnia
// (nie ma tu nic do liczenia astronomicznie).
const stala = (year, month, day) => new Date(year, month - 1, day, 9, 0);

export function sabatyWRoku(year) {
  return [
    { id: "imbolc", nazwa: "Imbolc", data: stala(year, 2, 2),
      opis: "Zapowiedź wiosny i powrót światła, święto Brygidy." },
    { id: "ostara", nazwa: "Ostara", data: rownonocWiosenna(year),
      opis: "Równonoc wiosenna — dzień równy nocy, budzenie się ziemi." },
    { id: "beltane", nazwa: "Beltane", data: stala(year, 5, 1),
      opis: "Początek lata w dawnym kalendarzu — ogień i płodność." },
    { id: "litha", nazwa: "Litha", data: przesilenieLetnie(year),
      opis: "Przesilenie letnie, najdłuższy dzień roku — w Polsce noc świętojańska, Kupała." },
    { id: "lughnasadh", nazwa: "Lughnasadh", data: stala(year, 8, 1),
      opis: "Pierwsze żniwa, święto plonów zboża." },
    { id: "mabon", nazwa: "Mabon", data: rownonocJesienna(year),
      opis: "Równonoc jesienna, drugie żniwa — podziękowanie za plony." },
    { id: "samhain", nazwa: "Samhain", data: stala(year, 11, 1),
      opis: "Koniec roku obrzędowego, czas pamięci o zmarłych — blisko polskich Zaduszek." },
    { id: "yule", nazwa: "Yule", data: przesilenieZimowe(year),
      opis: "Przesilenie zimowe, najdłuższa noc — blisko Szczodrych Godów." },
  ];
}

/**
 * Sabaty wypadające w przedziale [from, to). Dolicza rok poprzedni i
 * następny, żeby złapać sabaty tuż przy granicy roku kalendarzowego.
 */
export function sabatyWPrzedziale(from, to) {
  const lata = [from.getFullYear() - 1, from.getFullYear(), from.getFullYear() + 1];
  const wszystkie = lata.flatMap((y) => sabatyWRoku(y));
  return wszystkie
    .filter((s) => s.data >= from && s.data < to)
    .sort((a, b) => a.data - b.data);
}
