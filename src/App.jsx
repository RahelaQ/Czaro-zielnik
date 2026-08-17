import React, { useMemo, useState } from "react";
import { HERBS } from "./data/herbs.js";
import HerbCard from "./components/HerbCard.jsx";
import HerbDetail from "./components/HerbDetail.jsx";
import CalendarView from "./components/CalendarView.jsx";
import IdentifyView from "./components/IdentifyView.jsx";

export default function App() {
  const [tab, setTab] = useState("zielnik");
  const [query, setQuery] = useState("");
  const [opened, setOpened] = useState(null);
  const currentMonth = new Date().getMonth() + 1;

  const herbById = useMemo(
    () => Object.fromEntries(HERBS.map((h) => [h.id, h])),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HERBS;
    return HERBS.filter(
      (h) =>
        h.namePl.toLowerCase().includes(q) ||
        h.nameLat.toLowerCase().includes(q) ||
        h.moc.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="app-root">
      <header className="app-header">
        <p className="app-eyebrow">Czaro</p>
        <h1>Zielnik</h1>
      </header>

      {tab === "zielnik" && (
        <div className="zielnik-view">
          <input
            className="search-box"
            placeholder="Szukaj po nazwie lub mocy..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="herb-grid">
            {filtered.map((h) => (
              <HerbCard
                key={h.id}
                herb={h}
                onOpen={setOpened}
                activeThisMonth={h.months.includes(currentMonth)}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "kalendarz" && <CalendarView onOpen={setOpened} />}

      {tab === "rozpoznaj" && (
        <IdentifyView herbById={herbById} onOpenHerb={setOpened} />
      )}

      <nav className="tab-bar">
        <button
          className={tab === "zielnik" ? "tab-btn tab-btn--active" : "tab-btn"}
          onClick={() => setTab("zielnik")}
        >
          🌿 Zielnik
        </button>
        <button
          className={
            tab === "kalendarz" ? "tab-btn tab-btn--active" : "tab-btn"
          }
          onClick={() => setTab("kalendarz")}
        >
          🌙 Kalendarz
        </button>
        <button
          className={
            tab === "rozpoznaj" ? "tab-btn tab-btn--active" : "tab-btn"
          }
          onClick={() => setTab("rozpoznaj")}
        >
          📷 Rozpoznaj
        </button>
      </nav>

      {opened && <HerbDetail herb={opened} onClose={() => setOpened(null)} />}
    </div>
  );
}
