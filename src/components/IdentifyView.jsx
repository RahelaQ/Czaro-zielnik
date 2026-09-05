import React, { useEffect, useRef, useState } from "react";
import { compressForUpload } from "../utils/image.js";
import { CameraIcon, GalleryIcon } from "./Icons.jsx";
import { getCoords } from "../utils/db.js";
import {
  identifyPlant,
  IdentifyError,
  ERROR_COPY,
  RETRYABLE,
} from "../utils/identifyClient.js";

// Etapy pokazywane po kolei, żeby było widać, że coś się dzieje. Bez tego
// pierwsze sekundy wyglądają jak zawieszenie i człowiek klika drugi raz.
const STAGE_TEXT = {
  compress: "Przygotowuję zdjęcie...",
  upload: "Wysyłam do rozpoznania...",
  wait: "Przyglądam się roślinie...",
};

function formatKb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

export default function IdentifyView({
  herbById,
  onOpenHerb,
  onNavigate,
  collection,
  queue,
}) {
  const [preview, setPreview] = useState(null);
  const [stage, setStage] = useState(null); // compress | upload | wait | null
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // { kind, queued }
  const [stats, setStats] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const abortRef = useRef(null);
  const wynikRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Wynik pojawia sie na dole ekranu, poza polem widzenia i poza fokusem.
  // Przenosimy tam fokus — tak samo, jak zrobilaby to zmiana strony.
  useEffect(() => {
    if (result) wynikRef.current?.focus({ preventScroll: false });
  }, [result]);

  const reset = () => {
    setResult(null);
    setError(null);
    setJustAdded(false);
    setStats(null);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // żeby dało się wybrać to samo zdjęcie drugi raz
    if (!file) return;

    reset();
    setStage("compress");

    let shot;
    try {
      shot = await compressForUpload(file);
    } catch {
      setStage(null);
      setError({ kind: "too_large", queued: false });
      return;
    }

    // Podgląd robimy ze skompresowanego pliku — ładuje się natychmiast
    // i nie trzyma w pamięci pięciu megabajtów oryginału.
    setPreview(URL.createObjectURL(shot.blob));
    setStats({ before: shot.bytesBefore, after: shot.bytesAfter });

    // Pozycja przyda się, gdy zdjęcie pójdzie do kolejki: chcesz wiedzieć,
    // gdzie wrócić po zbiór. Nigdzie jej nie wysyłamy.
    //
    // NIE czekamy tu na nią. Wcześniej stało tu `await getCoords()` przed
    // wysyłką, więc rozpoznanie zaczynało się dopiero po tym, jak GPS się
    // odezwie albo odmówi — a na dokładkę pasek postępu pokazywał w tym
    // czasie "Przygotowuję zdjęcie...", czyli mówił nieprawdę. Teraz pytanie
    // o pozycję leci równolegle z wysyłką, a jej wynik odbieramy dopiero
    // tam, gdzie jest naprawdę potrzebny: przy zapisie.
    const pozycja = getCoords();

    setStage("upload");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setStage("wait");
      const parsed = await identifyPlant({
        base64: shot.base64,
        mediaType: shot.mediaType,
        signal: controller.signal,
      });
      setResult(parsed);
      setStage(null);
      queue?.remember({ blob: shot.blob, coords: await pozycja, result: parsed });
    } catch (err) {
      const kind = err instanceof IdentifyError ? err.kind : "server";
      const canQueue = RETRYABLE.has(kind);
      if (canQueue) await queue?.enqueue({ blob: shot.blob, coords: await pozycja });
      setStage(null);
      setError({ kind, queued: canQueue });
    }
  };

  const matched = result?.zielnikId ? herbById[result.zielnikId] : null;
  const alreadySaved = matched ? collection.isSaved(matched.id) : false;
  const savedNow = alreadySaved || justAdded;
  const pendingCount = queue?.pending?.length || 0;
  const failedCount = queue?.failed?.length || 0;

  const handleAdd = () => {
    if (matched) collection.addFromLibrary(matched);
    else if (result) collection.addCustom(result);
    setJustAdded(true);
  };

  return (
    <div className="identify-view">
      <div className="screen-header">
        <div>
          <h1>Rozpoznaj</h1>
          <p>Zrób zdjęcie rośliny lub wybierz z galerii</p>
        </div>
      </div>

      {failedCount > 0 && (
        <div className="queue-banner" role="status">
          <span
            className="queue-banner__dot"
            style={{ background: "#9A3B3B" }}
            aria-hidden="true"
          />
          <div>
            <strong>
              {failedCount === 1
                ? "1 zdjęcia nie udało się rozpoznać"
                : `${failedCount} zdjęć nie udało się rozpoznać`}
            </strong>
            <p>
              Po pięciu próbach przestaję ponawiać.{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => queue?.porzucNieudane()}
              >
                Usuń z kolejki
              </button>
            </p>
          </div>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="queue-banner" role="status">
          <span className="queue-banner__dot" aria-hidden="true" />
          <div>
            <strong>
              {pendingCount === 1
                ? "1 zdjęcie czeka na rozpoznanie"
                : `${pendingCount} zdjęcia czekają na rozpoznanie`}
            </strong>
            <p>
              {queue?.isSyncing
                ? "Rozpoznaję je teraz..."
                : "Rozpoznam je automatycznie, gdy wróci zasięg."}
            </p>
          </div>
        </div>
      )}

      {/*
        Dwa OSOBNE pola, nie jedno. Atrybut capture="environment" na iOS nie
        jest podpowiedzia — on wymusza aparat i CALKOWICIE usuwa wybor
        "Biblioteka zdjec". Dlatego wczesniej nie dalo sie wgrac zdjecia
        zrobionego wczesniej. Pole bez capture otwiera galerie normalnie.

        Pole pliku ma klase visually-hidden, a NIE display: none. Element
        ukryty przez display: none nie da sie sfokusowac, wiec obsluga
        z klawiatury byla tu wczesniej niemozliwa: przez caly ekran
        "Rozpoznaj" po prostu nie dalo sie przejsc Tabem.
      */}
      <label className="upload-area">
        <span className="upload-corner upload-corner--tl" aria-hidden="true" />
        <span className="upload-corner upload-corner--tr" aria-hidden="true" />
        <span className="upload-corner upload-corner--bl" aria-hidden="true" />
        <span className="upload-corner upload-corner--br" aria-hidden="true" />
        {preview ? (
          <img src={preview} alt="Zdjęcie wybrane do rozpoznania" className="upload-preview" />
        ) : (
          <>
            <span className="upload-icon">
              <CameraIcon width="30" height="30" aria-hidden="true" focusable="false" />
            </span>
            <span className="upload-text-main">Zrób zdjęcie</span>
            <span className="upload-text-sub">
              Liść, kwiat albo kora — jeden organ, blisko, na spokojnym tle
            </span>
          </>
        )}
        <input
          type="file"
          className="visually-hidden"
          accept="image/*"
          capture="environment"
          aria-label="Zrób zdjęcie rośliny aparatem"
          onChange={handleFile}
        />
      </label>

      <label className="upload-alt">
        <GalleryIcon width="18" height="18" aria-hidden="true" focusable="false" />
        <span>{preview ? "Wybierz inne zdjęcie z galerii" : "Wybierz z galerii"}</span>
        <input
          type="file"
          className="visually-hidden"
          accept="image/*"
          aria-label="Wybierz zdjęcie rośliny z galerii telefonu"
          onChange={handleFile}
        />
      </label>

      {/* Postep trwa kilkanascie sekund i zmienia sie trzy razy. Bez zywego
          komunikatu czytnik ekranu milczy przez caly ten czas. */}
      <div className="id-progress-live" role="status" aria-live="polite">
        {stage && (
          <div className="id-progress">
            <span className="id-progress__spinner" aria-hidden="true" />
            <span>{STAGE_TEXT[stage]}</span>
          </div>
        )}
      </div>

      {stats && !stage && (
        <p className="id-stats">
          Zdjęcie zmniejszone z {formatKb(stats.before)} do {formatKb(stats.after)} przed wysłaniem.
        </p>
      )}

      {/* role="alert" — blad ma przerwac to, co czytnik akurat mowi.
          Rozpoznanie sie nie udalo i dalsze czekanie nie ma sensu. */}
      {error && (
        <div className="id-error" role="alert">
          <strong>{ERROR_COPY[error.kind]?.title || "Nie udało się"}</strong>
          <p>
            {ERROR_COPY[error.kind]?.body ||
              "Spróbuj jeszcze raz, najlepiej przy dobrym świetle i z liściem lub kwiatem w kadrze."}
          </p>
          <div className="id-error__actions">
            {error.queued && (
              <button type="button" className="btn-outline" onClick={() => queue?.flush()}>
                Spróbuj teraz
              </button>
            )}
            <button
              type="button"
              className="btn-outline"
              onClick={() => onNavigate("biblioteka")}
            >
              Szukaj w bibliotece
            </button>
          </div>
        </div>
      )}

      {result && (
        <section
          className="id-result"
          ref={wynikRef}
          tabIndex={-1}
          aria-labelledby="wynik-rozpoznania"
        >
          <h2 className="section-label" style={{ margin: "0 0 0.6rem" }}>
            Najbliższe dopasowanie
          </h2>
          <div className="id-result-card">
            <div className="id-result-top">
              <div>
                <p className="eyebrow eyebrow--light" style={{ margin: 0 }}>
                  {result.nameLat}
                </p>
                <h3 className="id-result-title" id="wynik-rozpoznania">
                  {result.namePl}
                  <span className="visually-hidden">, {result.nameLat}</span>
                </h3>
              </div>
              {result.pewnosc && (
                <span className="id-confidence">
                  <span className="visually-hidden">Pewność dopasowania: </span>
                  {result.pewnosc}
                </span>
              )}
            </div>

            <p className="id-result-desc">{result.opis}</p>

            {result.ostrzezenie &&
              !(result.sobowtor && result.ostrzezenieZrodlo === "sobowtor") && (
              <div className="kupala-note id-warning" role="note">
                <span className="visually-hidden">Ostrzeżenie: </span>
                {result.ostrzezenie} Nigdy nie jedz ani nie stosuj rośliny na
                podstawie samego rozpoznania ze zdjęcia — skonsultuj się z
                doświadczonym zbieraczem lub atlasem roślin.
              </div>
            )}

            {/* Sobowtór. API zwracało to pole od dawna, ale ten widok go nie
                czytał — ostrzeżenie o roślinie, z którą można pomylić właśnie
                rozpoznaną, dawało się zobaczyć dopiero po kliknięciu "Karta".
                Czyli: stoisz nad podagrycznikiem, aplikacja mówi "podagrycznik,
                72%" i milczy o szczwole plamistym. Tu, na ekranie, na którym
                stoisz nad rośliną, jest to potrzebne bardziej niż gdziekolwiek
                indziej. Ten sam układ co w karcie zioła, świadomie. */}
            {result.sobowtor && (
              <div
                className="warn-box warn-box--lookalike"
                role="note"
                style={{ margin: "0.9rem 0 0" }}
              >
                <h4 className="warn-box__label">Można pomylić z</h4>
                <p className="lookalike-name">
                  {result.sobowtor.namePl}{" "}
                  <span className="lookalike-lat">{result.sobowtor.nameLat}</span>
                </p>
                <p>
                  <strong>Po czym poznasz:</strong> {result.sobowtor.jak}
                </p>
                <p className="lookalike-risk">
                  <strong>Ryzyko pomyłki:</strong> {result.sobowtor.ryzyko}
                </p>
              </div>
            )}

            <div className="id-actions">
              {savedNow ? (
                <div className="id-added-row">
                  <span className="badge-saved badge-saved--static">
                    <span aria-hidden="true">✓ </span>w Moich Zbiorach
                  </span>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => onNavigate("zbiory")}
                  >
                    Zobacz w Moich Zbiorach<span aria-hidden="true"> →</span>
                  </button>
                </div>
              ) : (
                <button type="button" className="btn-primary" onClick={handleAdd}>
                  + Dodaj {result.namePl} do zbiorów
                </button>
              )}
              {matched && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => onOpenHerb(matched)}
                >
                  Karta<span className="visually-hidden"> rośliny {matched.namePl}</span>
                </button>
              )}
            </div>
          </div>

          <p className="id-disclaimer">
            Rozpoznanie jest podpowiedzią, nie pewnikiem. Nie zbieraj ani nie
            spożywaj roślin bez własnej weryfikacji.
          </p>
        </section>
      )}
    </div>
  );
}
