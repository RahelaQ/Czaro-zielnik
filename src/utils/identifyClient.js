// ---------------------------------------------------------------------------
// KLIENT ROZPOZNAWANIA — z limitem czasu i uczciwym rozróżnieniem błędów.
//
// Poprzednia wersja miała jeden catch i jeden komunikat: "nie udało się".
// W terenie to bezużyteczne, bo nie wiadomo, czy przestawić się na inny kadr,
// wyjść spod drzew po zasięg, czy po prostu poczekać.
// ---------------------------------------------------------------------------

export const TIMEOUT_MS = 25000;

export class IdentifyError extends Error {
  constructor(kind, message) {
    super(message || kind);
    this.kind = kind; // offline | timeout | too_large | no_key | rate_limited | server | network
  }
}

export async function identifyPlant({ base64, mediaType, signal }) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new IdentifyError("offline");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  // Jeśli komponent odmontuje się w trakcie, przerywamy razem z nim.
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

  let response;
  try {
    response = await fetch("/api/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64, mediaType }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err?.name === "AbortError") throw new IdentifyError("timeout");
    // fetch rzuca TypeError przy zerwanym połączeniu — w lesie to norma
    throw new IdentifyError("network");
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 413) throw new IdentifyError("too_large");

  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      // odpowiedź nie jest JSON-em (np. strona błędu Vercela) — trudno
    }
    if (body?.error === "missing_api_key") throw new IdentifyError("no_key");
    if (response.status === 504) throw new IdentifyError("timeout");
    // 429 wraca z naszej własnej osłony (api/_limit.js). Bez osobnego rodzaju
    // wpadałoby do "server" i mówiło "coś padło po stronie serwera", co jest
    // nieprawdą i kieruje uwagę w złe miejsce.
    if (response.status === 429) throw new IdentifyError("rate_limited");
    throw new IdentifyError("server", body?.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Komunikaty pisane pod człowieka stojącego w terenie z telefonem w ręce:
// każdy mówi, co się stało I co z tym zrobić.
export const ERROR_COPY = {
  offline: {
    title: "Brak zasięgu",
    body: "Zdjęcie odłożyłam do kolejki — rozpoznam je samo, gdy wrócisz w zasięg. Możesz iść dalej.",
  },
  network: {
    title: "Sieć się urwała",
    body: "Zdjęcie czeka w kolejce i rozpozna się samo, gdy połączenie wróci.",
  },
  timeout: {
    title: "Zasięg zbyt słaby",
    body: "Serwer nie odpowiedział na czas. Zdjęcie jest w kolejce — spróbuję ponownie, gdy sygnał będzie mocniejszy.",
  },
  too_large: {
    title: "Zdjęcie za duże",
    body: "Nie udało się go zmniejszyć na tyle, żeby przeszło. Zrób zdjęcie jeszcze raz, z bliższej odległości.",
  },
  no_key: {
    title: "Rozpoznawanie nieskonfigurowane",
    body: "Brakuje klucza PLANTNET_API_KEY po stronie serwera. To ustawienie w panelu Vercel, nie problem z Twoim telefonem.",
  },
  rate_limited: {
    title: "Za dużo rozpoznań naraz",
    body: "Aplikacja ma dzienny limit rozpoznań i właśnie go przyciska. Zdjęcie czeka w kolejce — spróbuję ponownie za chwilę.",
  },
  server: {
    title: "Coś padło po stronie serwera",
    body: "Zdjęcie zostało zapisane w kolejce. Spróbuj ponownie za chwilę.",
  },
};

// Te błędy da się naprawić samym czekaniem — zdjęcie trafia do kolejki.
export const RETRYABLE = new Set(["offline", "network", "timeout", "server", "rate_limited"]);
