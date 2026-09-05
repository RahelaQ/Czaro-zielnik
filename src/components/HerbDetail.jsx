import React, { useEffect, useId, useState } from "react";
import HerbImage from "./HerbImage.jsx";
import PhotoViewer from "./PhotoViewer.jsx";
import { useDialog } from "../hooks/useDialog.js";
import { useHerbNote } from "../hooks/useHerbNote.js";
import { HERBS, MONTH_NAMES } from "../data/herbs.js";

function archiveLabel(herb) {
  if (herb.isCustom) return "ARCHIWUM BOTANICZNE · ROZPOZNANE";
  const idx = HERBS.findIndex((h) => h.id === herb.id);
  const num = idx >= 0 ? String(idx + 1).padStart(3, "0") : "—";
  return `ARCHIWUM BOTANICZNE · ${num}`;
}

export default function HerbDetail({ herb, onClose, collection }) {
  const { note, setNote } = useHerbNote(herb.id);
  const [draft, setDraft] = useState(note);
  // Lista zdjęć otwarta w podglądzie pełnoekranowym (null = zamknięty).
  const [podglad, setPodglad] = useState(null);

  // Karta jest oknem modalnym: trzyma fokus, zamyka sie Escape i oddaje
  // fokus tam, skad ja otwarto. Patrz hooks/useDialog.js.
  const kartaRef = useDialog(onClose);

  const uid = useId();
  const titleId = `karta-${uid}`;
  const noteId = `notatka-${uid}`;

  useEffect(() => setDraft(note), [note]);

  const saved = collection ? collection.isSaved(herb.id) : false;

  const handleToggle = () => {
    if (!collection) return;
    if (saved) {
      collection.remove(herb.id);
    } else {
      collection.addFromLibrary(herb);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="detail-card"
        ref={kartaRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-image-wrap">
          <span className="detail-archive-label">{archiveLabel(herb)}</span>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Zamknij kartę rośliny"
          >
            <span aria-hidden="true">×</span>
          </button>
          <HerbImage
            id={herb.id}
            title={herb.wiki}
            namePl={herb.namePl}
            nameLat={herb.nameLat}
            showCredit
            onOpen={setPodglad}
          />
        </div>
        <div className="detail-body">
          <div className="detail-title-row">
            <div>
              <p className="eyebrow">{herb.nameLat}</p>
              {/* Nazwa lacinska stoi nad polska, ale to nazwa polska jest
                  tytulem tej karty — i to ona zapowiada okno czytnikowi. */}
              <h2 id={titleId}>
                {herb.namePl}
                <span className="visually-hidden">, {herb.nameLat}</span>
              </h2>
            </div>
          </div>

          <div className="detail-row">
            {saved && (
              <span className="tag tag--saved" style={{ fontWeight: 600 }}>
                MOJE ZBIORY
              </span>
            )}
            {herb.zywiol && (
              <span className="tag">
                <span className="visually-hidden">Żywioł: </span>
                {herb.zywiol}
              </span>
            )}
            {herb.months?.length > 0 && (
              <span className="tag tag--month">
                Zbiór: {herb.months.map((m) => MONTH_NAMES[m - 1]).join(", ")}
              </span>
            )}
          </div>

          {herb.part && (
            <>
              <h3 className="section-label">Część rośliny i termin</h3>
              <p>{herb.part}</p>
            </>
          )}

          {/* Nazwy ludowe stoją PRZED "Moc i symbolika", bo w terenie zwykle
              przypomina się nazwa babci, nie botaniczna — a wyszukiwarka
              szuka po nich tak samo jak po nazwie łacińskiej. */}
          {herb.nazwyLudowe?.nazwy?.length > 0 && (
            <>
              <h3 className="section-label">Nazwy ludowe</h3>
              <p className="folk-names">
                {herb.nazwyLudowe.nazwy.join(" · ")}
              </p>
              {herb.nazwyLudowe.skad && <p>{herb.nazwyLudowe.skad}</p>}
              {herb.nazwyLudowe.zrodlo && (
                <p className="zrodlo-note">Zapis: {herb.nazwyLudowe.zrodlo}</p>
              )}
            </>
          )}

          <h3 className="section-label">Moc i symbolika</h3>
          <p>{herb.moc}</p>

          {/* Jak mocny jest zapis tej tradycji. Bez tego zielnik zrównuje
              rzecz udokumentowaną u Kolberga z powtarzanką z internetu. */}
          {herb.zrodlo && <p className="zrodlo-note">Zapis: {herb.zrodlo}</p>}

          {/* Ostrzeżenie o samej roślinie — toksyczność, interakcje z lekami.
              role="note" i naglowek zamiast zwyklego akapitu: czytnik ekranu
              ma powiedziec, ze to ostrzezenie, zanim przeczyta tresc, a nie
              po niej. Dla osoby stojacej nad roslina to cala roznica. */}
          {herb.uwaga && (
            <div className="warn-box warn-box--plant" role="note">
              <h3 className="warn-box__label">Uwaga</h3>
              <p>{herb.uwaga}</p>
            </div>
          )}

          {/* Sobowtór. To jedyna sekcja w całej appce, która realnie ratuje
              zdrowie — dlatego jest wyżej niż tabelka botaniczna. */}
          {herb.sobowtor && (
            <div className="warn-box warn-box--lookalike" role="note">
              <h3 className="warn-box__label">Można pomylić z</h3>
              <p className="lookalike-name">
                {herb.sobowtor.namePl}{" "}
                <span className="lookalike-lat">{herb.sobowtor.nameLat}</span>
              </p>
              <p>
                <strong>Po czym poznasz:</strong> {herb.sobowtor.jak}
              </p>
              <p className="lookalike-risk">
                <strong>Ryzyko pomyłki:</strong> {herb.sobowtor.ryzyko}
              </p>
            </div>
          )}

          {(herb.dzien || herb.zywiol || herb.rodzina) && (
            <>
              <h3 className="visually-hidden">Dane botaniczne i tradycyjne</h3>
              <dl className="info-box">
                {herb.rodzina && (
                  <div className="info-row">
                    <dt>Rodzina</dt>
                    <dd>{herb.rodzina}</dd>
                  </div>
                )}
                {herb.dzien && (
                  <div className="info-row">
                    <dt>Dzień</dt>
                    <dd>{herb.dzien}</dd>
                  </div>
                )}
                {herb.zywiol && (
                  <div className="info-row">
                    <dt>Żywioł</dt>
                    <dd>{herb.zywiol}</dd>
                  </div>
                )}
              </dl>
            </>
          )}

          {collection && (
            <button
              type="button"
              className={saved ? "btn-outline" : "btn-primary"}
              style={{ width: "100%", marginBottom: "1rem" }}
              onClick={handleToggle}
            >
              {saved
                ? `✓ W Moich Zbiorach — usuń ${herb.namePl}`
                : `+ Dodaj ${herb.namePl} do moich zbiorów`}
            </button>
          )}

          <h3 className="section-label">
            <label htmlFor={noteId}>Twoje notatki</label>
          </h3>
          <textarea
            id={noteId}
            className="note-box"
            placeholder="np. gdzie znalazłam, kiedy zebrałam, efekty..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => setNote(draft)}
            rows={3}
          />
        </div>
      </div>

      {podglad && (
        <PhotoViewer
          photos={podglad}
          herbName={herb.namePl}
          onClose={() => setPodglad(null)}
        />
      )}
    </div>
  );
}
