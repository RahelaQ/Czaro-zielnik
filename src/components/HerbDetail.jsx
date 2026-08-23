import React, { useEffect, useState } from "react";
import HerbImage from "./HerbImage.jsx";
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
      <div className="detail-card" onClick={(e) => e.stopPropagation()}>
        <div className="detail-image-wrap">
          <span className="detail-archive-label">{archiveLabel(herb)}</span>
          <button className="close-btn" onClick={onClose} aria-label="Zamknij">
            ×
          </button>
          <HerbImage
            id={herb.id}
            title={herb.wiki}
            namePl={herb.namePl}
            nameLat={herb.nameLat}
            showCredit
          />
        </div>
        <div className="detail-body">
          <div className="detail-title-row">
            <div>
              <p className="eyebrow">{herb.nameLat}</p>
              <h2>{herb.namePl}</h2>
            </div>
          </div>

          <div className="detail-row">
            {saved && (
              <span className="tag tag--saved" style={{ fontWeight: 600 }}>
                MOJE ZBIORY
              </span>
            )}
            {herb.zywiol && <span className="tag">{herb.zywiol}</span>}
            {herb.months?.length > 0 && (
              <span className="tag tag--month">
                Zbiór: {herb.months.map((m) => MONTH_NAMES[m - 1]).join(", ")}
              </span>
            )}
          </div>

          {herb.part && (
            <>
              <p className="section-label">Część rośliny i termin</p>
              <p>{herb.part}</p>
            </>
          )}

          <p className="section-label">Moc i symbolika</p>
          <p>{herb.moc}</p>

          {/* Jak mocny jest zapis tej tradycji. Bez tego zielnik zrównuje
              rzecz udokumentowaną u Kolberga z powtarzanką z internetu. */}
          {herb.zrodlo && <p className="zrodlo-note">Zapis: {herb.zrodlo}</p>}

          {/* Ostrzeżenie o samej roślinie — toksyczność, interakcje z lekami. */}
          {herb.uwaga && (
            <div className="warn-box warn-box--plant">
              <p className="warn-box__label">Uwaga</p>
              <p>{herb.uwaga}</p>
            </div>
          )}

          {/* Sobowtór. To jedyna sekcja w całej appce, która realnie ratuje
              zdrowie — dlatego jest wyżej niż tabelka botaniczna. */}
          {herb.sobowtor && (
            <div className="warn-box warn-box--lookalike">
              <p className="warn-box__label">Można pomylić z</p>
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
            <div className="info-box">
              {herb.rodzina && (
                <div className="info-row">
                  <span>Rodzina</span>
                  <span>{herb.rodzina}</span>
                </div>
              )}
              {herb.dzien && (
                <div className="info-row">
                  <span>Dzień</span>
                  <span>{herb.dzien}</span>
                </div>
              )}
              {herb.zywiol && (
                <div className="info-row">
                  <span>Żywioł</span>
                  <span>{herb.zywiol}</span>
                </div>
              )}
            </div>
          )}

          {collection && (
            <button
              className={saved ? "btn-outline" : "btn-primary"}
              style={{ width: "100%", marginBottom: "1rem" }}
              onClick={handleToggle}
            >
              {saved ? "✓ W Moich Zbiorach — usuń" : "+ Dodaj do moich zbiorów"}
            </button>
          )}

          <p className="section-label">Twoje notatki</p>
          <textarea
            className="note-box"
            placeholder="np. gdzie znalazłam, kiedy zebrałam, efekty..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => setNote(draft)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
