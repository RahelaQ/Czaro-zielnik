// ---------------------------------------------------------------------------
// LOKALNY MAGAZYN — IndexedDB.
//
// Dwa zbiory:
//   queue     — zdjęcia zrobione bez zasięgu, czekające na rozpoznanie
//   sightings — trwały dziennik znalezisk (zdjęcie + wynik + data + miejsce)
//
// Dlaczego IndexedDB, a nie localStorage: localStorage trzyma wyłącznie tekst
// i ma ~5 MB sufitu na całą domenę. Zdjęcia to Bloby po ~200 KB — dwadzieścia
// znalezisk i localStorage pęka. IndexedDB trzyma Bloby natywnie i ma
// do dyspozycji setki megabajtów.
//
// Ustawienia (motyw, ostatnia zakładka) zostają w localStorage — tam jest
// synchroniczny odczyt przy starcie i nie ma mrugnięcia złym motywem.
// ---------------------------------------------------------------------------

const DB_NAME = "czaro-zielnik";
const DB_VERSION = 1;
const STORE_QUEUE = "queue";
const STORE_SIGHTINGS = "sightings";

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const q = db.createObjectStore(STORE_QUEUE, { keyPath: "id" });
        q.createIndex("createdAt", "createdAt");
      }
      if (!db.objectStoreNames.contains(STORE_SIGHTINGS)) {
        const s = db.createObjectStore(STORE_SIGHTINGS, { keyPath: "id" });
        s.createIndex("createdAt", "createdAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    let result;
    try {
      result = fn(store);
    } catch (err) {
      reject(err);
      return;
    }
    transaction.oncomplete = () => resolve(result?.result ?? result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// --- kolejka -------------------------------------------------------------

export async function queueAdd({ blob, coords }) {
  const entry = {
    id: newId(),
    blob,
    coords: coords || null,
    createdAt: Date.now(),
    attempts: 0,
    lastError: null,
  };
  await tx(STORE_QUEUE, "readwrite", (s) => s.put(entry));
  return entry;
}

export async function queueAll() {
  const items = await tx(STORE_QUEUE, "readonly", (s) => s.getAll());
  return (items || []).sort((a, b) => a.createdAt - b.createdAt);
}

export async function queueRemove(id) {
  await tx(STORE_QUEUE, "readwrite", (s) => s.delete(id));
}

export async function queueMarkFailed(id, message) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_QUEUE, "readwrite");
    const store = transaction.objectStore(STORE_QUEUE);
    const get = store.get(id);
    get.onsuccess = () => {
      const item = get.result;
      if (item) {
        item.attempts = (item.attempts || 0) + 1;
        item.lastError = message || null;
        store.put(item);
      }
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// --- dziennik znalezisk --------------------------------------------------

export async function sightingAdd({ blob, coords, result, createdAt }) {
  const entry = {
    id: newId(),
    blob,
    coords: coords || null,
    result,
    createdAt: createdAt || Date.now(),
  };
  await tx(STORE_SIGHTINGS, "readwrite", (s) => s.put(entry));
  return entry;
}

export async function sightingsAll() {
  const items = await tx(STORE_SIGHTINGS, "readonly", (s) => s.getAll());
  return (items || []).sort((a, b) => b.createdAt - a.createdAt);
}

export async function sightingRemove(id) {
  await tx(STORE_SIGHTINGS, "readwrite", (s) => s.delete(id));
}

// --- pozycja -------------------------------------------------------------

// Miejsce znaleziska zapisujemy lokalnie i nigdzie nie wysyłamy — służy
// wyłącznie do tego, żebyś wiedziała, gdzie wrócić po zbiór.
export function getCoords({ timeout = 6000 } = {}) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);

    // Twardy limit po naszej stronie. Opcja `timeout` przekazywana do
    // getCurrentPosition liczy sie DOPIERO od chwili przyznania uprawnienia:
    // dopoki wisi okienko "czy zezwolic na dostep do lokalizacji", zegar nie
    // chodzi. Jesli uzytkowniczka go nie dotknie — a w lesie, jedna reka, z
    // roslina w drugiej, to sytuacja domyslna — nie przychodzi ani callback
    // sukcesu, ani bledu, i obietnica nie rozwiazuje sie nigdy.
    // Rozpoznawanie stalo wtedy na "Przygotowuje zdjecie..." bez konca:
    // bez wyniku, bez bledu, bez wyjscia.
    //
    // Pozycja jest dodatkiem — wiadomo, gdzie wrocic po zbior. Nigdy nie
    // powinna byc powodem, dla ktorego rozpoznanie nie dochodzi do skutku.
    let zamkniete = false;
    const zakoncz = (wynik) => {
      if (zamkniete) return;
      zamkniete = true;
      resolve(wynik);
    };
    const straznik = setTimeout(() => zakoncz(null), timeout + 1500);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(straznik);
        zakoncz({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lon: Number(pos.coords.longitude.toFixed(5)),
          acc: Math.round(pos.coords.accuracy),
        });
      },
      () => {
        clearTimeout(straznik);
        zakoncz(null);
      },
      { enableHighAccuracy: false, timeout, maximumAge: 120000 }
    );
  });
}
