import React, { useEffect, useState } from "react";
import HerbImage from "./HerbImage.jsx";
import { useHerbNote } from "../hooks/useHerbNote.js";
import { MONTH_NAMES } from "../data/herbs.js";

export default function HerbDetail({ herb, onClose }) {
  const { note, setNote } = useHerbNote(herb.id);
  const [draft, setDraft] = useState(note);

  useEffect(() => setDraft(note), [note]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="detail-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Zamknij">
          ×
        </button>
        <HerbImage title={herb.wiki} namePl={herb.namePl} />
        <div className="detail-body">
          <p className="eyebrow">{herb.nameLat}</p>
          <h2>{herb.namePl}</h2>

          <div className="detail-row">
            <span className="tag tag--month">
              Zbiór: {herb.months.map((m) => MONTH_NAMES[m - 1]).join(", ")}
            </span>
          </div>

          <p className="section-label">Część rośliny i termin</p>
          <p>{herb.part}</p>

          <p className="section-label">Moc</p>
          <p>{herb.moc}</p>

          <div className="correspondences">
            <div>
              <span className="section-label">Dzień</span>
              <p>{herb.dzien}</p>
            </div>
            <div>
              <span className="section-label">Żywioł</span>
              <p>{herb.zywiol}</p>
            </div>
          </div>

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
