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

  useEffect(() => () => abortRef.current?.abort(), []);

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

      {pendingCount > 0 && (
        <div className="queue-banner">
          <span className="queue-banner__dot" />
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
      */}
      <label className="upload-area">
        <span className="upload-corner upload-corner--tl" />
        <span className="upload-corner upload-corner--tr" />
        <span className="upload-corner upload-corner--bl" />
        <span className="upload-corner upload-corner--br" />
        {preview ? (
          <img src={preview} alt="Twoje zdjęcie" className="upload-preview" />
        ) : (
          <>
            <span className="upload-icon">
              <CameraIcon width="30" height="30" />
            </span>
            <span className="upload-text-main">Zrób zdjęcie</span>
            <span className="upload-text-sub">
              Liść, kwiat albo kora — jeden organ, blisko, na spokojnym tle
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          style={{ display: "none" }}
        />
      </label>

      <label className="upload-alt">
        <GalleryIcon width="18" height="18" />
        <span>{preview ? "Wybierz inne zdjęcie z galerii" : "Wybierz z galerii"}</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: "none" }}
        />
      </label>

      {stage && (
        <div className="id-progress">
          <span className="id-progress__spinner" />
          <span>{STAGE_TEXT[stage]}</span>
        </div>
      )}

      {stats && !stage && (
        <p className="id-stats">
          Zdjęcie zmniejszone z {formatKb(stats.before)} do {formatKb(stats.after)} przed wysłaniem.
        </p>
      )}

      {error && (
        <div className="id-error">
          <strong>{ERROR_COPY[error.kind]?.title || "Nie udało się"}</strong>
          <p>
            {ERROR_COPY[error.kind]?.body ||
              "Spróbuj jeszcze raz, najlepiej przy dobrym świetle i z liściem lub kwiatem w kadrze."}
          </p>
          <div className="id-error__actions">
            {error.queued && (
              <button className="btn-outline" onClick={() => queue?.flush()}>
                Spróbuj teraz
              </button>
            )}
            <button className="btn-outline" onClick={() => onNavigate("biblioteka")}>
              Szukaj w bibliotece
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="id-result">
          <p className="section-label" style={{ margin: "0 0 0.6rem" }}>
            Najbliższe dopasowanie
          </p>
          <div className="id-result-card">
            <div className="id-result-top">
              <div>
                <p className="eyebrow eyebrow--light" style={{ margin: 0 }}>
                  {result.nameLat}
                </p>
                <h2 className="id-result-title">{result.namePl}</h2>
              </div>
              {result.pewnosc && (
                <span className="id-confidence">{result.pewnosc}</span>
              )}
            </div>

            <p
              style={{
                margin: "0.8rem 0 0",
                color: "var(--text-body)",
                fontSize: "0.85rem",
                lineHeight: 1.55,
              }}
            >
              {result.opis}
            </p>

            {result.ostrzezenie &&
              !(result.sobowtor && result.ostrzezenieZrodlo === "sobowtor") && (
              <div
                className="kupala-note"
                style={{ margin: "0.9rem 0 0", background: "var(--bg-surface)" }}
              >
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
                style={{ margin: "0.9rem 0 0" }}
              >
                <p className="warn-box__label">Można pomylić z</p>
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
                    ✓ w Moich Zbiorach
                  </span>
                  <button className="btn-outline" onClick={() => onNavigate("zbiory")}>
                    Zobacz w Moich Zbiorach →
                  </button>
                </div>
              ) : (
                <button className="btn-primary" onClick={handleAdd}>
                  + Dodaj do zbiorów
                </button>
              )}
              {matched && (
                <button className="btn-outline" onClick={() => onOpenHerb(matched)}>
                  Karta
                </button>
              )}
            </div>
          </div>

          <p className="id-disclaimer">
            Rozpoznanie jest podpowiedzią, nie pewnikiem. Nie zbieraj ani nie
            spożywaj roślin bez własnej weryfikacji.
          </p>
        </div>
      )}
    </div>
  );
}
