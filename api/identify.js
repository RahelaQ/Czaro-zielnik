// Funkcja serverless (Vercel). Trzyma klucz ANTHROPIC_API_KEY po stronie
// serwera, żeby nigdy nie trafił do przeglądarki/telefonu użytkowniczki.
// Ustaw zmienną środowiskową ANTHROPIC_API_KEY w panelu Vercel przed wdrożeniem.

import { HERBS } from "../src/data/herbs.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const { image, mediaType } = req.body || {};
  if (!image) {
    res.status(400).json({ error: "missing_image" });
    return;
  }

  const herbList = HERBS.map((h) => `${h.id}: ${h.namePl} (${h.nameLat})`).join(
    "\n"
  );

  const systemPrompt = `Jesteś botanikiem pomagającym rozpoznać rośliny/zioła ze zdjęcia, na potrzeby polskiego zielnika ludowego.
Odpowiedz WYŁĄCZNIE czystym JSON-em (bez markdown, bez komentarzy), o dokładnie takiej strukturze:
{
  "namePl": "polska nazwa rośliny",
  "nameLat": "łacińska nazwa",
  "pewnosc": "wysoka" | "srednia" | "niska",
  "opis": "2-3 zdania: jak rozpoznałeś, cechy charakterystyczne widoczne na zdjęciu",
  "ostrzezenie": "krótkie ostrzeżenie jeśli roślina ma toksyczne sobowtóry albo pewność jest niska/średnia, inaczej null",
  "zielnikId": "id z poniższej listy jeśli roślina na nim występuje, inaczej null"
}
Lista roślin w zielniku użytkowniczki (dopasuj id tylko jeśli to naprawdę ta sama roślina):
${herbList}
Jeśli nie rozpoznajesz rośliny z sensowną pewnością, ustaw pewnosc na "niska" i szczerze to napisz w opisie.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType || "image/jpeg",
                  data: image,
                },
              },
              { type: "text", text: "Co to za roślina?" },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = (data.content || [])
      .map((b) => b.text || "")
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const parsed = JSON.parse(text);
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: "identify_failed" });
  }
}
