import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { GalleryImage } from "../types";

interface GalleryProps {
  images: GalleryImage[];
}

export function Gallery({ images }: GalleryProps) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) => setIndex((prev) => (prev === null ? prev : (prev + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step, close]);

  if (images.length === 0) return null;

  return (
    <>
      <ul className="gallery-grid">
        {images.map((image, i) => (
          <li key={image.src} className="gallery-item">
            <button
              type="button"
              className="gallery-thumb"
              onClick={() => setIndex(i)}
              aria-label={`Zvětšit fotku: ${image.alt}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading={i < 2 ? "eager" : "lazy"}
              />
              <span className="gallery-thumb-zoom" aria-hidden="true">
                <Expand size={18} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && index !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Galerie apartmánu" onClick={close}>
          <button type="button" className="lightbox-close" onClick={close} aria-label="Zavřít galerii">
            <X size={24} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="lightbox-nav lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
            aria-label="Předchozí fotka"
          >
            <ChevronLeft size={28} aria-hidden="true" />
          </button>
          <figure className="lightbox-figure" onClick={(event) => event.stopPropagation()}>
            <img src={images[index].src} alt={images[index].alt} />
            <figcaption>
              {images[index].alt}
              <span className="lightbox-counter">
                {index + 1} / {images.length}
              </span>
            </figcaption>
          </figure>
          <button
            type="button"
            className="lightbox-nav lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
            aria-label="Další fotka"
          >
            <ChevronRight size={28} aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
