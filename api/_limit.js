// ---------------------------------------------------------------------------
// OSŁONA ENDPOINTÓW — limit żądań i sprawdzenie pochodzenia.
//
// Dopóki repozytorium było prywatne, /api/identify chronił się niejasnością:
// nikt z zewnątrz nie wiedział, że istnieje ani co przyjmuje. Po otwarciu
// repo widać to w pierwszym pliku, na który się trafi. Za endpointem stoi
// darmowy klucz Pl@ntNet — 500 rozpoznań na dobę — więc jedna pętla w bashu
// wyczerpuje limit na cały dzień i rozpoznawanie przestaje działać także
// właścicielce aplikacji, w lesie, bez żadnego komunikatu o przyczynie.
//
// To nie jest zabezpieczenie kryptograficzne i nie udaje takiego. Nagłówek
// Origin da się podrobić, a pamięć instancji serverless znika przy zimnym
// starcie. Chodzi o to, żeby przypadkowy skrypt i ciekawski przechodzień
// kosztowali limit dzienny, a nie o powstrzymanie kogoś zdeterminowanego.
// Na to trzeba by trwałego licznika (Vercel KV) i klucza po stronie klienta.
// ---------------------------------------------------------------------------

const OKNA = [
  { nazwa: "minuta", ms: 60_000, limit: 12 },
  { nazwa: "godzina", ms: 3_600_000, limit: 120 },
];

// Klucz → lista znaczników czasu. Żyje tyle, co ciepła instancja funkcji.
const historia = new Map();

function klucz(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "nieznany";
}

// Mapa rośnie z każdym nowym adresem, a funkcja może żyć godzinami. Bez tego
// sprzątania pamięć instancji puchłaby aż do ścięcia jej przez platformę.
function posprzataj(teraz) {
  const najdluzsze = Math.max(...OKNA.map((o) => o.ms));
  for (const [k, czasy] of historia) {
    const zywe = czasy.filter((t) => teraz - t < najdluzsze);
    if (zywe.length) historia.set(k, zywe);
    else historia.delete(k);
  }
}

/**
 * Zwraca null, gdy żądanie przechodzi. W przeciwnym razie obiekt
 * { status, error, retryAfter } gotowy do odesłania.
 */
export function sprawdzLimit(req) {
  const teraz = Date.now();
  if (historia.size > 500) posprzataj(teraz);

  const k = klucz(req);
  const czasy = (historia.get(k) || []).filter(
    (t) => teraz - t < Math.max(...OKNA.map((o) => o.ms))
  );

  for (const okno of OKNA) {
    const w = czasy.filter((t) => teraz - t < okno.ms);
    if (w.length >= okno.limit) {
      const najstarsze = Math.min(...w);
      return {
        status: 429,
        error: "rate_limited",
        retryAfter: Math.ceil((okno.ms - (teraz - najstarsze)) / 1000),
      };
    }
  }

  czasy.push(teraz);
  historia.set(k, czasy);
  return null;
}

/**
 * Żądanie ma pochodzić z tej samej strony, która je wysyła. Nie wpisujemy
 * żadnej domeny na sztywno — porównujemy Origin z Host, więc działa tak samo
 * na produkcji, na podglądach Vercela i na własnej domenie, gdyby kiedyś była.
 * Brak Origin przepuszczamy: tak wyglądają żądania z zainstalowanej PWA na
 * części przeglądarek i odcięcie ich zepsułoby aplikację w terenie.
 */
export function obcePochodzenie(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  try {
    const host = new URL(origin).host;
    if (host === req.headers.host) return false;
    if (/^localhost(:\d+)?$/.test(host) || /^127\.0\.0\.1(:\d+)?$/.test(host)) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}
