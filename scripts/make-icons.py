# Generuje ikony PWA i favicon ze znaku appki (babka w owalu).
# Odpalasz tylko wtedy, gdy zmienia sie znak:
#
#   python3 -m pip install cairosvg
#   python3 scripts/make-icons.py
#
# Zrodlem jest ten sam rysunek, co w src/components/Logo.jsx — jedne sciezki,
# jeden znak. Rasteryzujemy przez cairosvg, bo Pillow nie umie beziera z pliku
# SVG, a przepisywanie lisci na kod rysujacy rozjechaloby sie z komponentem.

from pathlib import Path

import cairosvg

BG = "#2F3A31"    # gleboka zielen lasu
MARK = "#9BAD94"  # przygaszona zielen (sage) — znak

ELLIPSE = '<ellipse cx="60" cy="60" rx="39" ry="47"/>'
LEAVES = (
    '<path d="M60 101 C43.5 84 43.5 61 60 42 C76.5 61 76.5 84 60 101 Z"/>'
    '<path d="M60 101 C39 97 27 80.5 25.5 61.5 C46 65.5 58.5 82 60 101 Z"/>'
    '<path d="M60 101 C81 97 93 80.5 94.5 61.5 C74 65.5 61.5 82 60 101 Z"/>'
)
SPARKLES = (
    '<g opacity=".85">'
    '<path d="M60 25 L60 35 M55 30 L65 30"/>'
    '<path d="M41 39 L41 45.5 M37.75 42.25 L44.25 42.25"/>'
    '<path d="M79 39 L79 45.5 M75.75 42.25 L82.25 42.25"/>'
    "</g>"
)
LEAF_SOLO = '<path d="M60 101 C41 82 41 59 60 39 C79 59 79 82 60 101 Z"/>'


def svg(scale=1.0, stroke=2.2, sparkles=True, solo=False, radius=0):
    """Znak wysrodkowany na ciemnym kaflu. `scale` zmniejsza rysunek wzgledem
    kafla — wersja maskable musi zmiescic sie w srodkowych 80%, bo Android
    przycina ikone do kola."""
    body = ELLIPSE + (LEAF_SOLO if solo else LEAVES)
    if sparkles and not solo:
        body += SPARKLES
    # 120-jednostkowy znak wpisany w 120-jednostkowy kafel, przeskalowany
    # wokol srodka. Kreska rosnie odwrotnie do skali, zeby zostala tej samej
    # grubosci na gotowej ikonie.
    tile = f'<rect width="120" height="120" rx="{radius}" fill="{BG}"/>'
    g = (
        f'<g transform="translate(60 60) scale({scale}) translate(-60 -60)" '
        f'fill="none" stroke="{MARK}" stroke-width="{stroke / scale}" '
        'stroke-linecap="round" stroke-linejoin="round">'
        f"{body}</g>"
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" '
        f'width="120" height="120">{tile}{g}</svg>'
    )


def png(markup, path, size):
    cairosvg.svg2png(
        bytestring=markup.encode("utf-8"),
        write_to=str(path),
        output_width=size,
        output_height=size,
    )
    print(f"  {path}  {size}x{size}")


root = Path(__file__).resolve().parent.parent
public = root / "public"

print("Ikony:")
tile = svg(scale=0.78)
png(tile, public / "icon-512.png", 512)
png(tile, public / "icon-192.png", 192)
png(tile, public / "apple-touch-icon.png", 180)

# Maskable: znak schodzi do 62% kafla, wiec caly miesci sie w bezpiecznym kole.
png(svg(scale=0.62), public / "icon-maskable-512.png", 512)

# Favicon: 32 px i mniej. Iskry sie zlepiaja, wiec ich tu nie ma; kafel
# zaokraglony, zeby w karcie przegladarki nie byl kwadratem.
(public / "favicon.svg").write_text(
    svg(scale=0.74, stroke=4.5, sparkles=False, radius=18), encoding="utf-8"
)
print(f"  {public / 'favicon.svg'}")
