import React, { useEffect, useMemo, useRef, useState } from "react";
import { HERBS } from "./data/herbs.js";
import HerbDetail from "./components/HerbDetail.jsx";
import CalendarView from "./components/CalendarView.jsx";
import IdentifyView from "./components/IdentifyView.jsx";
import HomeView from "./components/HomeView.jsx";
import LibraryView from "./components/LibraryView.jsx";
import MyCollectionView from "./components/MyCollectionView.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { useMyCollection } from "./hooks/useMyCollection.js";
import { useTheme } from "./hooks/useTheme.js";
import { useIdentifyQueue } from "./hooks/useIdentifyQueue.js";
import { useRecentlyViewed } from "./hooks/useRecentlyViewed.js";
import {
  LeafIcon,
  BookIcon,
  MoonIcon,
  CameraIcon,
} from "./components/Icons.jsx";

// Cztery zakladki zamiast trzech. Biblioteka — czyli wszystkie hasla — dawala
// sie otworzyc wylacznie z ekranu glownego, choc jest sercem tej appki.
// Moje Zbiory zostaja kaflem na ekranie glownym: siega sie po nie po powrocie
// do domu, nie stojac nad roslina, wiec nie musza zabierac miejsca w pasku.
// Kolejnosc idzie za uzyciem: co dzis > wszystko > kiedy zbierac > co to jest.
const TABS = [
  { id: "home", label: "Zielnik", Icon: LeafIcon },
  { id: "biblioteka", label: "Biblioteka", Icon: BookIcon },
  { id: "kalendarz", label: "Kalendarz", Icon: MoonIcon },
  { id: "rozpoznaj", label: "Rozpoznaj", Icon: CameraIcon },
];

// Nazwy ekranow do zapowiedzi dla czytnika ekranu. Zakladka "zbiory" nie ma
// swojego przycisku w pasku, ale ekran ma — i tez musi sie zapowiedziec.
const NAZWY_EKRANOW = {
  home: "Zielnik",
  biblioteka: "Biblioteka",
  zbiory: "Moje zbiory",
  kalendarz: "Kalendarz",
  rozpoznaj: "Rozpoznaj",
};

export default function App() {
  const [tab, setTab] = useState("home");
  const [opened, setOpened] = useState(null);
  const collection = useMyCollection();
  const recent = useRecentlyViewed();
  const theme = useTheme();
  // Kolejka zyje na poziomie appki, nie zakladki — zdjecie zrobione bez
  // zasiegu ma sie rozpoznac samo takze wtedy, gdy jestes akurat w Kalendarzu.
  const queue = useIdentifyQueue();

  const mainRef = useRef(null);
  const pierwszyRender = useRef(true);

  // Przelaczenie zakladki podmienia CALA tresc strony, ale nie przewija jej
  // ani nie rusza fokusu — obslugujac appke klawiatura zostawalo sie w pasku
  // zakladek, a czytnik ekranu nie mowil nic. Przenosimy fokus na poczatek
  // nowego ekranu, tak jak robi to przejscie na inna strone.
  useEffect(() => {
    if (pierwszyRender.current) {
      pierwszyRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [tab]);

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
          // Ostrzeżenia przepuszczamy dalej — HerbDetail rysuje je z pól
          // `uwaga` i `sobowtor`, więc bez tych trzech linii karta rośliny
          // rozpoznanej jako trująca wyglądała jak karta dowolnego zioła.
          uwaga: item.custom.uwaga || "",
          sobowtor: item.custom.sobowtor || null,
          trujaca: !!item.custom.trujaca,
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

  // Gdy karta rosliny stoi otwarta, tlo przestaje istniec dla klawiatury
  // i dla czytnika ekranu. Bez tego dalo sie przejsc Tabem "za" okno.
  const tloWylaczone = opened ? "" : undefined;

  return (
    <div className="app-root">
      {/* Pierwszy element w kolejnosci Tab. Niewidoczny, dopoki nie dostanie
          fokusu — wtedy pozwala ominac pasek zakladek i wejsc wprost w tresc. */}
      <a className="skip-link" href="#tresc">
        Przejdź do treści
      </a>

      <div inert={tloWylaczone}>
        <ThemeToggle preference={theme.preference} onCycle={theme.cycle} />

        <main
          id="tresc"
          ref={mainRef}
          tabIndex={-1}
          aria-label={NAZWY_EKRANOW[tab]}
        >
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
              queue={queue}
              herbById={herbById}
              onOpenHerb={openHerb}
              onNavigate={setTab}
              collection={collection}
            />
          )}
        </main>

        <nav className="tab-bar" aria-label="Główne ekrany">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "tab-btn tab-btn--active" : "tab-btn"}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon aria-hidden="true" focusable="false" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

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
