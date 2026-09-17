"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  coupleName: string;
  photos: string[];
};

export default function GalleryClient({ coupleName, photos }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (selected === null || photos.length === 0) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") setSelected((selected + 1) % photos.length);
      if (event.key === "ArrowLeft") setSelected((selected - 1 + photos.length) % photos.length);
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected, photos.length]);

  return (
    <main className="gallery-page">
      <div className="gallery-page-wash" aria-hidden="true" />
      <header className="gallery-page-header">
        <button type="button" className="gallery-back" onClick={() => router.back()}>← Invitation</button>
        <p className="eyebrow">{coupleName}</p>
        <h1>Our Gallery</h1>
        <p>A collection of moments from our journey together.</p>
      </header>

      <section className="gallery-page-grid" aria-label="Wedding gallery">
        {photos.map((src, index) => (
          <motion.button
            type="button"
            className={`gallery-page-card ${index < 5 ? `gallery-page-card-${index + 1}` : "gallery-page-card-extra"}`}
            key={`${src}-${index}`}
            onClick={() => setSelected(index)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.78, delay: (index % 3) * 0.07, ease }}
            aria-label={`Open gallery photo ${index + 1}`}
          >
            <Image src={src} alt={`${coupleName} ${index + 1}`} fill sizes="(max-width: 720px) 94vw, 32vw" className="cover-image" unoptimized={src.startsWith("http")} />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </motion.button>
        ))}
      </section>

      <AnimatePresence>
        {selected !== null && photos[selected] && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={() => setSelected(null)}>
            <button className="lightbox-close" type="button" onClick={() => setSelected(null)} aria-label="Close gallery">×</button>
            <button className="lightbox-arrow lightbox-prev" type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected - 1 + photos.length) % photos.length); }} aria-label="Previous photo">‹</button>
            <motion.div className="lightbox-image" key={photos[selected]} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease }} onClick={(event) => event.stopPropagation()}>
              <Image src={photos[selected]} alt={`${coupleName} gallery photo ${selected + 1}`} fill sizes="94vw" className="lightbox-fit" priority unoptimized={photos[selected].startsWith("http")} />
            </motion.div>
            <button className="lightbox-arrow lightbox-next" type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected + 1) % photos.length); }} aria-label="Next photo">›</button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
