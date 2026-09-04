import React from "react";

// -----------------------------------------------------------------------------
// Znak Czaro-Zielnika: babka w owalu.
//
// Trzy liscie wyrastaja z jednego wezla na osi pionowej, koncowki bocznych
// siedza dokladnie tam, gdzie wpisany okrag przecina poziom. Nad liscmi trzy
// iskry — magia z geometrii, nie z pentagramu.
//
// Rysunek jest hairline'owy, wiec o czytelnosci decyduje NIE rozmiar, tylko
// grubosc kreski przeliczona na piksele. Dlatego `weight` podaje sie w px
// ekranu, a komponent sam przelicza je na jednostki viewBoxa (120).
//
// Ponizej pewnego rozmiaru rysunek sie zalepia, wiec sa trzy warianty:
//   > 32 px   pelny (owal + trzy liscie + iskry)
//   20-32 px  bez iskier — same by sie zlaly w kropki
//   < 20 px   jeden lisc w owalu
// Wariant "veined" (zylkowany) jest do duzych uzyc: splash, druk, opis appki.
// -----------------------------------------------------------------------------

const LEAF_CENTER = "M60 101 C43.5 84 43.5 61 60 42 C76.5 61 76.5 84 60 101 Z";
const LEAF_LEFT = "M60 101 C39 97 27 80.5 25.5 61.5 C46 65.5 58.5 82 60 101 Z";
const LEAF_RIGHT = "M60 101 C81 97 93 80.5 94.5 61.5 C74 65.5 61.5 82 60 101 Z";
const LEAF_SOLO = "M60 101 C41 82 41 59 60 39 C79 59 79 82 60 101 Z";

function Sparkles() {
  return (
    <g opacity=".85">
      <path d="M60 25 L60 35 M55 30 L65 30" />
      <path d="M41 39 L41 45.5 M37.75 42.25 L44.25 42.25" />
      <path d="M79 39 L79 45.5 M75.75 42.25 L82.25 42.25" />
    </g>
  );
}

function Veins() {
  return (
    <>
      <path d="M60 101 L60 44" opacity=".55" />
      <path d="M60 101 C53 88 49.5 74 51 57" opacity=".42" />
      <path d="M60 101 C67 88 70.5 74 69 57" opacity=".42" />
      <path d="M60 101 C48 94 38 84 31.5 70" opacity=".42" />
      <path d="M60 101 C72 94 82 84 88.5 70" opacity=".42" />
    </>
  );
}

function pickVariant(size) {
  if (size > 32) return "full";
  if (size >= 20) return "plain";
  return "min";
}

export default function Logo({
  size = 40,
  variant = "auto",
  weight = 1.4, // grubosc kreski w pikselach ekranu, nie w jednostkach viewBoxa
  title,
  ...rest
}) {
  const kind = variant === "auto" ? pickVariant(size) : variant;
  const strokeWidth = (120 / size) * weight;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <ellipse cx="60" cy="60" rx="39" ry="47" />
      {kind === "min" ? (
        <path d={LEAF_SOLO} />
      ) : (
        <>
          <path d={LEAF_CENTER} />
          <path d={LEAF_LEFT} />
          <path d={LEAF_RIGHT} />
          {kind === "veined" ? <Veins /> : null}
          {kind === "full" || kind === "veined" ? <Sparkles /> : null}
        </>
      )}
    </svg>
  );
}
