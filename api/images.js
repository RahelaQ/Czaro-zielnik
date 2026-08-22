// Funkcja serverless (Vercel). Proxy do Unsplash Search API — klucz
// UNSPLASH_ACCESS_KEY trzymany po stronie serwera, nigdy w przeglądarce.
// Ustaw zmienną środowiskową UNSPLASH_ACCESS_KEY w panelu Vercel
// (Settings → Environment Variables) przed wdrożeniem.
//
// Darmowy klucz: https://unsplash.com/developers → "New Application".
// Bez klucza endpoint po prostu zwraca { url: null }, a appka i tak
// pokaże zdjęcie z Wikimedia (patrz src/hooks/useHerbImage.js).

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const { query } = req.query;
  if (!query) {
    res.status(400).json({ error: "missing_query" });
    return;
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    res.status(200).json({ url: null, credit: null });
    return;
  }

  try {
    const url =
      "https://api.unsplash.com/search/photos" +
      "?per_page=1&orientation=squarish&query=" +
      encodeURIComponent(query);

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) throw new Error("unsplash_error");

    const data = await response.json();
    const photo = data.results?.[0];
    const found = photo?.urls?.regular || null;

    res.status(200).json({
      url: found,
      // Unsplash API wymaga podania autora przy hotlinkowaniu zdjęć —
      // pokazujemy to w HerbDetail (patrz komponent HerbImage).
      credit: photo
        ? { name: photo.user?.name, link: photo.links?.html }
        : null,
    });
  } catch (err) {
    res.status(200).json({ url: null, credit: null });
  }
}
