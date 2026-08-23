import React from "react";

const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function LeafIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M20 4c-9 0-16 5-16 14 9 0 14-6 14-14 0 0 1 0 2 0z" />
      <path d="M6 18C10 13 13 10 18 6" />
    </svg>
  );
}

export function MoonIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
    </svg>
  );
}

export function CameraIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" />
      <circle cx="12" cy="12.5" r="3.3" />
    </svg>
  );
}

export function SunIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

// Pol slonca, pol ksiezyca — motyw idacy za ustawieniem telefonu.
export function AutoThemeIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Koszyk zbieracza — wiklinowy, z pałąkiem. Do "Moich zbiorów".
export function BasketIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3 9h18l-1.6 9.2a2 2 0 0 1-2 1.8H6.6a2 2 0 0 1-2-1.8L3 9z" />
      <path d="M8.5 9 12 3.5 15.5 9" />
      <path d="M9 12.5v4M15 12.5v4" />
    </svg>
  );
}

// Kalendarz z księżycem — appka liczy zbiory i fazy naraz.
export function CalendarIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M16 16.5a2.6 2.6 0 1 1-3-3.4 3.2 3.2 0 0 0 3 3.4z" />
    </svg>
  );
}

// Stos zdjęć — wybór z biblioteki zdjęć telefonu.
export function GalleryIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="7" y="3.5" width="14" height="14" rx="2.5" />
      <circle cx="11.5" cy="8" r="1.4" />
      <path d="M21 13.5 17 10l-6 5.5" />
      <path d="M17 20.5H5.5A2.5 2.5 0 0 1 3 18V6.5" />
    </svg>
  );
}
