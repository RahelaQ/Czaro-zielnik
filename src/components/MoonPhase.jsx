import React, { useId } from "react";

// ---------------------------------------------------------------------------
// FAZA KSIĘŻYCA — rysowana naprawdę, nie udawana.
//
// Wcześniej w kalendarzu był conic-gradient, czyli wycinek tortu: przy 30%
// cyklu rysował 30% koła jak na wykresie kołowym. Z fazą księżyca nie miało
// to wspólnego nic poza tym, że jest okrągłe.
//
// Tutaj geometria jest prawdziwa. Granica światła i cienia (terminator) to
// elipsa o półosi r·|cos(2π·faza)|, a oświetlona część powstaje przez maskę:
//     połowa tarczy po stronie oświetlonej
//   + elipsa  (garb — wypukły)
//   − elipsa  (sierp — wklęsły)
// Dzięki temu sierp jest wklęsły, a garb wypukły, tak jak na niebie.
//
// Wypełnienie: kreskowanie poziome, technika rytownicza ze starych zielników
// i atlasów astronomicznych. Rysowane wektorowo od zera — żadnego obrazka,
// żadnej licencji, ostre przy każdej rozdzielczości.
// ---------------------------------------------------------------------------

const R = 50;
const C = 60;

export default function MoonPhase({
  fraction = 0,
  size = 64,
  hatch = true,
  className,
  title,
}) {
  // useId, bo na jednej stronie stoi kilka księżyców obok siebie, a wspólne
  // id maski w SVG sprawia, że wszystkie przyjmują kształt pierwszego.
  const uid = useId().replace(/:/g, "");
  const maskId = `moon-mask-${uid}`;
  const hatchId = `moon-hatch-${uid}`;

  const f = ((fraction % 1) + 1) % 1;
  const illum = (1 - Math.cos(2 * Math.PI * f)) / 2; // 0 = nów, 1 = pełnia
  const rx = R * Math.abs(Math.cos(2 * Math.PI * f));
  const waxing = f < 0.5; // przybywa → świeci prawa strona

  // Garb dokłada elipsę do oświetlonej połowy, sierp ją odejmuje.
  const ellipseFill = illum < 0.5 ? "#000" : "#fff";

  // Rozstaw kresek liczony w jednostkach viewBoxa tak, żeby NA EKRANIE
  // wyszło zawsze około 3 px niezależnie od rozmiaru ikony. Stały rozstaw
  // dawał przy 30 px kreski co 1,5 px, czyli szarą plamę zamiast rytu.
  const skala = 120 / size;
  const rozstaw = Math.max(4, Math.round(3 * skala));
  const grubosc = rozstaw * 0.55;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <pattern
          id={hatchId}
          width={rozstaw * 2}
          height={rozstaw}
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1={rozstaw / 2}
            x2={rozstaw * 2}
            y2={rozstaw / 2}
            stroke="currentColor"
            strokeWidth={grubosc}
          />
        </pattern>

        <mask id={maskId}>
          <rect x="0" y="0" width="120" height="120" fill="#000" />
          <rect
            x={waxing ? C : C - R}
            y={C - R}
            width={R}
            height={R * 2}
            fill="#fff"
          />
          <ellipse cx={C} cy={C} rx={rx} ry={R} fill={ellipseFill} />
        </mask>
      </defs>

      {/* Nieoświetlona część — ledwie widoczna, ale musi być: bez niej garb
          w 90% oświetlony wygląda jak zwykłe pełne kółko i cały pasek tygodnia
          zlewa się w siedem identycznych kropek. */}
      <circle cx={C} cy={C} r={R} fill="currentColor" opacity="0.15" />

      {/* Oświetlona część tarczy. */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill={hatch ? `url(#${hatchId})` : "currentColor"}
        mask={`url(#${maskId})`}
      />

      {/* Obwódka całej tarczy — rysowana zawsze, także w nowiu, żeby było
          widać, że księżyc tam jest, tylko nieoświetlony. */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth={Math.max(2.6, skala * 1.3)}
      />
    </svg>
  );
}
