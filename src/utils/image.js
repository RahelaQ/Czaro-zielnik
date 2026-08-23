// ---------------------------------------------------------------------------
// KOMPRESJA ZDJĘCIA W PRZEGLĄDARCE — zanim cokolwiek poleci na serwer.
//
// Dlaczego to istnieje:
// Zdjęcie z iPhone'a waży 3-5 MB. Zakodowane w base64 puchnie o 33% (~6,5 MB),
// a Vercel ucina request body na 4,5 MB i zwraca 413 FUNCTION_PAYLOAD_TOO_LARGE.
// Efekt w terenie: appka mieliła upload przez pół minuty na LTE i tak czy siak
// kończyła błędem. Zawsze, niezależnie od zasięgu.
//
// Po kompresji zdjęcie waży 150-250 KB. Upload schodzi z ~40 s do ~2 s.
// Pl@ntNet i tak przeskalowuje zdjęcia po swojej stronie — 1280 px w zupełności
// wystarcza do rozpoznania liścia, kwiatu czy kory.
// ---------------------------------------------------------------------------

export const MAX_EDGE = 1280;          // dłuższy bok po przeskalowaniu
export const JPEG_QUALITY = 0.82;      // wizualnie bez różnicy, ~4x mniejszy plik
export const MAX_UPLOAD_BYTES = 3_000_000; // twardy sufit z zapasem pod limit Vercela

// createImageBitmap dekoduje zdjęcie poza głównym wątkiem — na telefonie to
// różnica między "appka na chwilę zamarła" a płynnością. Starsze Safari go nie
// zna albo nie zna opcji imageOrientation, więc mamy dwa poziomy odwrotu.
async function loadBitmap(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        // lecimy do <img> poniżej
      }
    }
  }
  return loadViaImgElement(file);
}

function loadViaImgElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("nie_moge_odczytac_zdjecia"));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("kompresja_nieudana"))),
      "image/jpeg",
      quality
    );
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("nie_moge_odczytac_zdjecia"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Przyjmuje plik z aparatu/galerii, oddaje skompresowany JPEG.
 * Zwraca { blob, base64, mediaType, width, height, bytesBefore, bytesAfter }.
 */
export async function compressForUpload(file) {
  const bytesBefore = file.size;
  const source = await loadBitmap(file);

  const srcW = source.width || source.naturalWidth;
  const srcH = source.height || source.naturalHeight;
  if (!srcW || !srcH) throw new Error("nie_moge_odczytac_zdjecia");

  const scale = Math.min(1, MAX_EDGE / Math.max(srcW, srcH));
  const width = Math.round(srcW * scale);
  const height = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.drawImage(source, 0, 0, width, height);
  if (typeof source.close === "function") source.close();

  // Zdjęcia bardzo szczegółowe (trawa, gęste liście) potrafią po kompresji
  // wciąż być duże — schodzimy z jakością, aż zmieszczą się w limicie.
  let quality = JPEG_QUALITY;
  let blob = await canvasToBlob(canvas, quality);
  while (blob.size > MAX_UPLOAD_BYTES && quality > 0.4) {
    quality -= 0.15;
    blob = await canvasToBlob(canvas, quality);
  }

  return {
    blob,
    base64: await blobToBase64(blob),
    mediaType: "image/jpeg",
    width,
    height,
    bytesBefore,
    bytesAfter: blob.size,
  };
}
