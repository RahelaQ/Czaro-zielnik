import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ---------------------------------------------------------------------------
// Zejście ekranu powitalnego.
//
// Sam ekran stoi w index.html i jest narysowany, zanim ten plik w ogóle się
// wczyta — o to w nim chodzi. Tutaj tylko go zdejmujemy, i to dopiero wtedy,
// gdy React ma już co pokazać pod spodem. Bez minimalnego czasu znak mrugnąłby
// na szybkim telefonie na trzy klatki, co wygląda jak usterka, a nie jak
// powitanie.
//
// Jeśli powitania nie ma (ciepły start — patrz skrypt w index.html), tego
// elementu po prostu nie ma w drzewie i cały ten blok się nie wykonuje.
// ---------------------------------------------------------------------------
const powitanie = document.getElementById("splash");
if (powitanie) {
  const MIN_MS = 900;
  const zejdz = () => {
    powitanie.classList.add("splash--gone");
    // Element znika z drzewa po zaniku, żeby nie został nad appką jako
    // przezroczysta warstwa łapiąca dotyk.
    window.setTimeout(() => powitanie.remove(), 500);
  };
  const start = window.__czaroPowitanieOd || Date.now();
  window.setTimeout(zejdz, Math.max(0, MIN_MS - (Date.now() - start)));
}
