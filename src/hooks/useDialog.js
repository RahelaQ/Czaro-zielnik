import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// OKNO MODALNE — fokus, Escape, blokada tla
//
// Karta rosliny i podglad zdjecia wygladaly jak okna modalne, ale nimi nie
// byly: fokus klawiatury zostawal pod spodem, na przyciskach, ktorych nie
// bylo juz widac. Osoba obslugujaca appke klawiatura albo czytnikiem ekranu
// otwierala karte babki i dalej "chodzila" po bibliotece za nia.
//
// Ten hook robi z dowolnego diva prawdziwe okno modalne:
//   • zapamietuje, skad przyszedl fokus, i oddaje go tam przy zamknieciu —
//     inaczej po zamknieciu karty fokus laduje na poczatku strony i trzeba
//     przejsc cala liste od nowa,
//   • trzyma Tab w srodku okna,
//   • zamyka na Escape,
//   • blokuje przewijanie tla.
//
// Okna moga stac jedno na drugim (podglad zdjecia otwiera sie NA karcie
// rosliny), wiec trzymamy stos. Klawisze obsluguje wylacznie okno na wierzchu,
// a przewijanie tla wraca dopiero, gdy zamknie sie ostatnie.
// ---------------------------------------------------------------------------

const stos = [];
let poprzedniOverflow = null;

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusowalne(root) {
  return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
  );
}

export function useDialog(onClose) {
  const ref = useRef(null);
  // onClose bywa funkcja strzalkowa tworzona przy kazdym renderze; trzymamy ja
  // w refie, zeby efekt nie przepinal sie po kazdym wpisanym znaku w notatce.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const okno = ref.current;
    if (!okno) return;

    const wracamyDo = document.activeElement;
    stos.push(okno);

    if (stos.length === 1) {
      poprzedniOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    // Fokus na pierwszy sensowny element w srodku. Gdy okno nie ma zadnego
    // (sam obrazek), bierzemy je samo — dlatego wolajacy daje mu tabIndex=-1.
    const pierwszy = focusowalne(okno)[0] || okno;
    // Po malowaniu, inaczej Safari potrafi zignorowac focus() na swiezym wezle.
    const id = requestAnimationFrame(() => pierwszy.focus({ preventScroll: true }));

    const onKey = (e) => {
      // Tylko okno na wierzchu reaguje — inaczej Escape zamykalby oba naraz.
      if (stos[stos.length - 1] !== okno) return;

      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;

      const lista = focusowalne(okno);
      if (lista.length === 0) {
        e.preventDefault();
        okno.focus();
        return;
      }
      const pierwszyEl = lista[0];
      const ostatni = lista[lista.length - 1];

      // Fokus wyszedl poza okno (np. przez pasek adresu) — wciagamy z powrotem.
      if (!okno.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? ostatni : pierwszyEl).focus();
        return;
      }
      if (e.shiftKey && document.activeElement === pierwszyEl) {
        e.preventDefault();
        ostatni.focus();
      } else if (!e.shiftKey && document.activeElement === ostatni) {
        e.preventDefault();
        pierwszyEl.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey, true);
      const i = stos.indexOf(okno);
      if (i >= 0) stos.splice(i, 1);
      if (stos.length === 0) {
        document.body.style.overflow = poprzedniOverflow ?? "";
        poprzedniOverflow = null;
      }
      // Oddajemy fokus tam, skad przyszedl — o ile ten element wciaz istnieje.
      if (wracamyDo instanceof HTMLElement && document.contains(wracamyDo)) {
        wracamyDo.focus({ preventScroll: true });
      }
    };
  }, []);

  return ref;
}

// Czy jakiekolwiek okno modalne stoi otwarte. Tlo pod nim chowamy przed
// czytnikiem ekranu (aria-hidden), zeby nie dalo sie go tam "zwiedzac".
export function czyOtwarte() {
  return stos.length > 0;
}
