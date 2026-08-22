import React, { useMemo, useState } from "react";
import { HERBS } from "./data/herbs.js";
import HerbDetail from "./components/HerbDetail.jsx";
import CalendarView from "./components/CalendarView.jsx";
import IdentifyView from "./components/IdentifyView.jsx";
import HomeView from "./components/HomeView.jsx";
import LibraryView from "./components/LibraryView.jsx";
import MyCollectionView from "./components/MyCollectionView.jsx";
import { useMyCollection } from "./hooks/useMyCollection.js";
import { useRecentlyViewed } from "./hooks/useRecentlyViewed.js";
import { LeafIcon, MoonIcon, CameraIcon } from "./components/Icons.jsx";

// Ekrany, które w nowym designie używają ciemnego motywu "Pine Smoke".
const DARK_TABS = new Set(["kalendarz", "rozpoznaj"]);

export default function App() {
  const [tab, setTab] = useState("home");
  const [opened, setOpened] = useState(null);
  const collection = useMyCollection();
  const recent = useRecentlyViewed();

  const herbById = useMemo(
    () => Object.fromEntries(HERBS.map((h) => [h.id, h])),
    []
  );

  const openHerb = (herb) => {
    setOpened(herb);
    recent.recordView(herb);
  };

  // Moje Zbiory = wpisy z Biblioteki (dociągnięte po id) + rośliny "custom"
  // rozpoznane ze zdjęcia, których nie ma w Bibliotece — pełny opis trzymany
  // bezpośrednio w kolekcji (patrz useMyCollection.js).
  const myHerbs = useMemo(() => {
    return collection.items
      .map((item) => {
        if (item.source === "biblioteka") {
          const h = herbById[item.id];
          return h ? { ...h, addedAt: item.addedAt } : null;
        }
        return {
          id: item.id,
          namePl: item.custom.namePl,
          nameLat: item.custom.nameLat,
          wiki: item.custom.wiki,
          moc: item.custom.opis,
          months: [],
          part: "",
          dzien: "",
          zywiol: "",
          rodzina: item.custom.rodzina || "",
          addedAt: item.addedAt,
          isCustom: true,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.addedAt - a.addedAt);
  }, [collection.items, herbById]);

  const recentHerbs = useMemo(() => {
    return recent.items
      .map((r) => {
        const known = herbById[r.id];
        return known ? { ...known } : { ...r };
      })
      .slice(0, 3);
  }, [recent.items, herbById]);

  return (
    <div className={"app-root" + (DARK_TABS.has(tab) ? " theme-dark" : "")}>
      {tab === "home" && (
        <HomeView
          onOpen={openHerb}
          onNavigate={setTab}
          collectionCount={collection.items.length}
          recentHerbs={recentHerbs}
        />
      )}

      {tab === "biblioteka" && (
        <LibraryView onOpen={openHerb} collection={collection} />
      )}

      {tab === "zbiory" && (
        <MyCollectionView
          herbs={myHerbs}
          onOpen={openHerb}
          collection={collection}
          onNavigate={setTab}
        />
      )}

      {tab === "kalendarz" && <CalendarView onOpen={openHerb} />}

      {tab === "rozpoznaj" && (
        <IdentifyView
          herbById={herbById}
          onOpenHerb={openHerb}
          onNavigate={setTab}
          collection={collection}
        />
      )}

      <nav className="tab-bar">
        <button
          className={tab === "home" ? "tab-btn tab-btn--active" : "tab-btn"}
          onClick={() => setTab("home")}
        >
          <LeafIcon />
          <span>Zielnik</span>
        </button>
        <button
          className={
            tab === "kalendarz" ? "tab-btn tab-btn--active" : "tab-btn"
          }
          onClick={() => setTab("kalendarz")}
        >
          <MoonIcon />
          <span>Kalendarz</span>
        </button>
        <button
          className={
            tab === "rozpoznaj" ? "tab-btn tab-btn--active" : "tab-btn"
          }
          onClick={() => setTab("rozpoznaj")}
        >
          <CameraIcon />
          <span>Rozpoznaj</span>
        </button>
      </nav>

      {opened && (
        <HerbDetail
          herb={opened}
          onClose={() => setOpened(null)}
          collection={collection}
        />
      )}
    </div>
  );
}
