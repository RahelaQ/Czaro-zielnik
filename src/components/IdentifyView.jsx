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

export default function IdentifyView({ herbById, onOpenHerb }) {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("loading");
    setResult(null);
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

  return (
    <div className="identify-view">
      <p className="section-label" style={{ marginTop: "1rem" }}>
        Rozpoznaj roślinę ze zdjęcia
      </p>

      <label className="upload-area">
        {preview ? (
          <img src={preview} alt="Twoje zdjęcie" className="upload-preview" />
        ) : (
          <>
            <span className="upload-plus">+</span>
            <span className="upload-text-main">Dodaj zdjęcie rośliny</span>
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
          <p className="eyebrow" style={{ marginLeft: "1.4rem" }}>
            {result.nameLat}
          </p>
          <h2 style={{ margin: "0 1.4rem 0.3rem" }}>{result.namePl}</h2>
          <span
            className="tag"
            style={{ marginLeft: "1.4rem", marginBottom: "0.8rem" }}
          >
            pewność: {result.pewnosc}
          </span>
          <p style={{ margin: "0.8rem 1.4rem" }}>{result.opis}</p>

          {result.ostrzezenie && (
            <div className="kupala-note" style={{ marginTop: "0.3rem" }}>
              ⚠️ {result.ostrzezenie} Nigdy nie jedz ani nie stosuj rośliny na
              podstawie samego rozpoznania ze zdjęcia — skonsultuj się z
              doświadczonym zbieraczem lub atlasem roślin.
            </div>
          )}

          {matched && (
            <button
              className="month-pill month-pill--active"
              style={{ margin: "1rem 1.4rem" }}
              onClick={() => onOpenHerb(matched)}
            >
              Zobacz w zielniku →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
