import React from "react";
import { useWikiImage } from "../hooks/useWikiImage.js";

export default function HerbImage({ title, namePl }) {
  const { src, status } = useWikiImage(title);

  if (status === "loading") {
    return (
      <div className="herb-photo herb-photo--loading">
        <span className="leaf-spinner">🌿</span>
      </div>
    );
  }
  if (!src) {
    return (
      <div className="herb-photo herb-photo--fallback">
        <span>🌿</span>
      </div>
    );
  }
  return (
    <div className="herb-photo">
      <img src={src} alt={namePl} loading="lazy" />
    </div>
  );
}
