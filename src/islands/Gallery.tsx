import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Island (SPEC-Lite §3, chunk 5). Port legacy/src/components/Gallery.tsx.
// Proti legacy doplněno a11y dle DoD §3: focus trap, initial focus a focus
// restore. Mřížka + lightbox logika (Esc / šipky / scroll lock) beze změny.

interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface GalleryProps {
  images: GalleryImage[];
}

export function Gallery({ images }: GalleryProps) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) => setIndex((prev) => (prev === null ? prev : (prev + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;

    // Initial focus + focus restore: zapamatuj spouštěč (thumbnail), přesuň
    // fokus na tlačítko Zavřít, po zavření vrať fokus zpět.
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("[data-lightbox-close]")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key === "ArrowRight") {
        step(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        step(-1);
        return;
      }
      // Focus trap: Tab cykluje jen mezi ovládacími tlačítky dialogu.
      if (event.key === "Tab" && dialog) {
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled])"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (!dialog.contains(active)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      restoreFocusRef.current?.focus();
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
        <div
          ref={dialogRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Galerie apartmánu"
          onClick={close}
        >
          <button
            type="button"
            className="lightbox-close"
            data-lightbox-close
            onClick={close}
            aria-label="Zavřít galerii"
          >
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
