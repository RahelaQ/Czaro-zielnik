# Generuje ikony PWA. Odpalasz tylko wtedy, gdy chcesz zmienic znak:
#   python3 scripts/make-icons.py
# Rysujemy w 1024 px i zmniejszamy z LANCZOS — krawedzie wychodza gladkie
# bez zadnych zewnetrznych bibliotek poza Pillow.

from PIL import Image, ImageDraw

S = 1024
BG = (47, 58, 49)        # gleboka zielen lasu
CREAM = (234, 228, 218)  # Nordic Linen
SAGE = (155, 173, 148)   # przygaszona zielen na liscie

def sprig(size=S, pad=0.0):
    """Ksiezyc w nowiu i galazka — botanika plus magia, znak calej appki."""
    img = Image.new("RGBA", (size, size), BG + (255,))
    d = ImageDraw.Draw(img)
    c = size / 2
    k = size * (1 - 2 * pad)          # obszar rysunku po odjeciu marginesu
    off = size * pad

    # --- ksiezyc: pelne kolo minus kolo przesuniete ---
    moon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    md = ImageDraw.Draw(moon)
    r = k * 0.20
    mx, my = off + k * 0.70, off + k * 0.26
    md.ellipse([mx - r, my - r, mx + r, my + r], fill=CREAM + (255,))
    md.ellipse(
        [mx - r * 1.30, my - r * 1.18, mx + r * 0.72, my + r * 0.94],
        fill=(0, 0, 0, 0),
    )
    img.alpha_composite(moon)

    # --- lodyga ---
    stem_w = max(3, int(k * 0.022))
    top = (c, off + k * 0.30)
    bottom = (c, off + k * 0.86)
    d.line([top, bottom], fill=CREAM + (255,), width=stem_w, joint="curve")

    # --- liscie: elipsy rysowane osobno i obracane, po trzy na strone.
    # Rosna ku dolowi, malejac ku wierzcholkowi — tak, jak rosnie roslina.
    for i, t in enumerate((0.22, 0.44, 0.66)):
        ly = top[1] + (bottom[1] - top[1]) * t
        lw = k * (0.185 + i * 0.050)
        lh = k * (0.072 + i * 0.016)
        for side in (-1, 1):
            leaf = Image.new("RGBA", (int(lw * 2), int(lw * 2)), (0, 0, 0, 0))
            ld = ImageDraw.Draw(leaf)
            cx = lw
            ld.ellipse([cx - lw / 2, cx - lh / 2, cx + lw / 2, cx + lh / 2],
                       fill=SAGE + (255,))
            leaf = leaf.rotate(-28 * side, resample=Image.BICUBIC)
            px = int(c + side * lw * 0.42 - lw)
            py = int(ly - lw)
            img.alpha_composite(leaf, (px, py))

    return img.convert("RGB")

base = sprig()
base.resize((512, 512), Image.LANCZOS).save("public/icon-512.png")
base.resize((192, 192), Image.LANCZOS).save("public/icon-192.png")
base.resize((180, 180), Image.LANCZOS).save("public/apple-touch-icon.png")

# Wersja maskable: Android przycina ikone do kola, wiec znak musi zmiescic sie
# w srodkowych 80% — inaczej ksiezyc zniknie pod krawedzia.
sprig(pad=0.11).resize((512, 512), Image.LANCZOS).save("public/icon-maskable-512.png")

print("Ikony zapisane w public/")
