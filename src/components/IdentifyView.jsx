import React, { useState } from "react";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function identifyPlant(base64, mediaType) {
  // Woła NASZ backend (api/identify.js), a nie bezpośrednio api.anthropic.com —
  // dzięki temu klucz API nigdy nie trafia do przeglądarki/telefonu.
  const response = await fetch("/api/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64, mediaType }),
  });
  if (!response.ok) throw new Error("identify_failed");
  return response.json();
}

export default function IdentifyView({ herbById, onOpenHerb, onNavigate, collection }) {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [justAdded, setJustAdded] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("loading");
    setResult(null);
    setJustAdded(false);
    try {
      const base64 = await fileToBase64(file);
      setPreview(`data:${file.type};base64,${base64}`);
      const parsed = await identifyPlant(base64, file.type || "image/jpeg");
      setResult(parsed);
      setStatus("done");
    } catch (err) {
      setStatus("error");
    }
  };

  const matched = result?.zielnikId ? herbById[result.zielnikId] : null;
  const alreadySaved = matched ? collection.isSaved(matched.id) : false;
  const savedNow = alreadySaved || justAdded;

  const handleAdd = () => {
    if (matched) {
      collection.addFromLibrary(matched);
    } else if (result) {
      collection.addCustom(result);
    }
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

      <label className="upload-area">
        <span className="upload-corner upload-corner--tl" />
        <span className="upload-corner upload-corner--tr" />
        <span className="upload-corner upload-corner--bl" />
        <span className="upload-corner upload-corner--br" />
        {preview ? (
          <img src={preview} alt="Twoje zdjęcie" className="upload-preview" />
        ) : (
          <>
            <span className="upload-plus">+</span>
            <span className="upload-text-main">Aparat / galeria</span>
            <span className="upload-text-sub">📷 Aparat &nbsp;·&nbsp; 🖼️ Galeria</span>
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

      {status === "loading" && (
        <p className="empty-note">Przyglądam się roślinie...</p>
      )}

      {status === "error" && (
        <p className="empty-note">
          Nie udało się rozpoznać zdjęcia. Spróbuj jeszcze raz, najlepiej przy
          dobrym świetle i z liśćmi/kwiatem w kadrze.
        </p>
      )}

      {status === "done" && result && (
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

            <p style={{ margin: "0.8rem 0 0", color: "var(--text-body)", fontSize: "0.85rem", lineHeight: 1.55 }}>
              {result.opis}
            </p>

            {result.ostrzezenie && (
              <div className="kupala-note" style={{ margin: "0.9rem 0 0", background: "var(--bg-surface)" }}>
                ⚠️ {result.ostrzezenie} Nigdy nie jedz ani nie stosuj rośliny na
                podstawie samego rozpoznania ze zdjęcia — skonsultuj się z
                doświadczonym zbieraczem lub atlasem roślin.
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
