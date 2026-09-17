"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMusic } from "@/components/audio/MusicProvider";
import BotanicalCorner from "./BotanicalCorner";
import { wedding as defaultWedding } from "@/lib/wedding-data";
import type { WeddingConfig } from "@/lib/wedding-config";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0 },
};

const clipReveal = {
  hidden: { opacity: 0, clipPath: "inset(12% 10% 12% 10% round 42px)" },
  show: { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 42px)" },
};

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
      variants={fadeUp}
      transition={{ duration: 0.9, ease }}
      className="section-heading"
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <motion.span
        className="heading-flourish"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.12, ease }}
      />
    </motion.div>
  );
}

function WatercolorBackdrop({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`watercolor-layer${compact ? " compact" : ""}`} aria-hidden="true">
      <motion.span
        className="wash wash-one"
        animate={{ x: [0, 10, -4, 0], y: [0, -8, 6, 0], rotate: [0, 2, -1, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="wash wash-two"
        animate={{ x: [0, -8, 7, 0], y: [0, 8, -5, 0], rotate: [0, -2, 1, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="wash wash-three"
        animate={{ scale: [1, 1.035, 0.985, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="gold-speckles speckles-a" />
      <span className="gold-speckles speckles-b" />
    </div>
  );
}

function IntroOverlay({ onOpen, data }: { onOpen: () => void; data: WeddingConfig }) {
  return (
    <motion.div
      className="intro-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.025 }}
      transition={{ duration: 0.8, ease }}
    >
      <WatercolorBackdrop />
      <div className="leaf-canopy" aria-hidden="true">
        <motion.div
          className="leaf-canopy-piece leaf-canopy-left"
          initial={{ opacity: 0, x: -24, y: -10 }}
          animate={{ opacity: 0.95, x: 0, y: 0 }}
          transition={{ duration: 1.1, delay: 0.1, ease }}
        >
          <BotanicalCorner className="leaf-canopy-art" />
        </motion.div>
        <motion.div
          className="leaf-canopy-piece leaf-canopy-right"
          initial={{ opacity: 0, x: 24, y: -10 }}
          animate={{ opacity: 0.95, x: 0, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease }}
        >
          <BotanicalCorner className="leaf-canopy-art" flip />
        </motion.div>
      </div>
      <motion.div
        className="intro-card"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, ease }}
      >
        <p className="eyebrow">The wedding invitation of</p>
        <p className="intro-monogram">{data.couple.monogram}</p>
        <h1>
          {data.couple.bride}
          <span>&</span>
          {data.couple.groom}
        </h1>
        <p className="intro-date">{data.event.dateLabel}</p>

        <motion.button
          type="button"
          className="open-invitation-button"
          onClick={onOpen}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Open Invitation</span>
          <i aria-hidden="true">→</i>
        </motion.button>
        <p className="intro-audio-note">Music starts automatically when your browser allows it</p>
      </motion.div>
    </motion.div>
  );
}

type WeddingInvitationProps = {
  guestLabel?: string;
  rsvpHref?: string;
  weddingData?: WeddingConfig;
};

export default function WeddingInvitation({ guestLabel, rsvpHref, weddingData }: WeddingInvitationProps) {
  const data = weddingData ?? ({ ...defaultWedding, photos: [...defaultWedding.photos], galleryPhotos: [...defaultWedding.photos], programme: defaultWedding.programme.map((item) => ({ ...item })), story: [...defaultWedding.story], contacts: defaultWedding.contacts.map((contact) => ({ ...contact })) } as unknown as WeddingConfig);
  const [opened, setOpened] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { play: playMusic } = useMusic();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 70]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);


  const openInvitation = () => {
    setOpened(true);
    playMusic();
  };


  return (
    <main className="invitation-shell">
      <AnimatePresence>{!opened && <IntroOverlay onOpen={openInvitation} data={data} />}</AnimatePresence>


      <section ref={heroRef} className="hero-section section-shell">
        <WatercolorBackdrop />
  

        <motion.div className="welcome-hero content-width" style={{ y: heroContentY, opacity: heroOpacity }}>
          <motion.div
            className="welcome-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ delay: 0.28, duration: 0.9, ease }}
          >
            <p className="eyebrow">With joyful hearts</p>
            {guestLabel ? (
              <motion.p
                className="welcome-dear"
                initial={{ opacity: 0, y: 12 }}
                animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ delay: 0.42, duration: 0.7, ease }}
              >
                Dear {guestLabel},
              </motion.p>
            ) : (
              <p className="welcome-dear">To our family & friends,</p>
            )}
            <h1>We would love to celebrate this beautiful beginning with you.</h1>
            <p className="welcome-message">
              Join Raveena & Roshana as they celebrate the promise of forever, surrounded by the people who make their story even more meaningful.
            </p>

            <div className="welcome-meta">
              <div>
                <span>Date</span>
                <strong>{data.event.dateLabel}</strong>
              </div>
              <div>
                <span>Venue</span>
                <strong>{data.event.venue}</strong>
                <small>{data.event.room}</small>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="welcome-photo-stage"
            initial={{ opacity: 0, x: 40, scale: 0.985 }}
            animate={opened ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 40, scale: 0.985 }}
            transition={{ delay: 0.62, duration: 1.05, ease }}
          >
            <div className="welcome-photo-main">
              <Image
                src={data.photos[2]}
                alt="Raveena and Roshana"
                fill
                priority
                sizes="(max-width: 860px) 92vw, 44vw"
                className="cover-image"
              />
              <div className="welcome-photo-line" />
            </div>
            <div className="welcome-stamp">21 · 10 · 2026</div>
          </motion.div>
        </motion.div>

        <motion.a
          href="#story"
          className="scroll-cue"
          initial={{ opacity: 0 }}
          animate={opened ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1.75, duration: 0.7 }}
        >
          <span>Discover our story</span>
          <i />
        </motion.a>
      </section>

      <section id="story" className="story-section section-shell paper-section">
        <WatercolorBackdrop compact />
        <BotanicalCorner className="botanical story-botanical" />

        <div className="story-grid content-width">
          <motion.div
            className="story-photo-composition"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.24 }}
            variants={clipReveal}
            transition={{ duration: 1.05, ease }}
          >
            <div className="story-photo-primary">
              <Image
                src={data.photos[1]}
                alt="Raveena and Roshana together"
                fill
                sizes="(max-width: 900px) 92vw, 42vw"
                className="cover-image story-position"
              />
            </div>
            <motion.div
              className="story-ring"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <span>RAVEENA • ROSHANA • 21.10.2026 • </span>
            </motion.div>
          </motion.div>

          <motion.div
            className="story-copy"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.18 }}
            variants={fadeUp}
            transition={{ duration: 0.95, ease }}
          >
            <p className="eyebrow">Our love story</p>
            <h2 className="script-title">Raveena <em>&</em> Roshana</h2>
            {data.story.map((paragraph, index) => (
              <motion.p
                key={paragraph}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.7, delay: index * 0.06, ease }}
              >
                {paragraph}
              </motion.p>
            ))}
            <motion.strong
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              {data.storyClosing}
            </motion.strong>
          </motion.div>
        </div>
      </section>

      <section className="programme-section section-shell paper-section programme-paper">
        <div className="programme-ornament ornament-left" aria-hidden="true" />
        <div className="programme-ornament ornament-right" aria-hidden="true" />
        <div className="content-width programme-wrap">
          <SectionHeading eyebrow={data.event.dateLabel} title="The Programme" />

          <div className="programme-list">
            {data.programme.map((item, index) => (
              <motion.div
                className="programme-row"
                key={item.time}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ duration: 0.72, delay: index * 0.09, ease }}
              >
                <div className="programme-index">0{index + 1}</div>
                <time>{item.time}</time>
                <div className="programme-line" />
                <p>{item.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="photo-feature section-shell">
        <motion.div
          className="feature-photo-wrap"
          initial={{ opacity: 0, scale: 0.985 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.15, ease }}
        >
          <Image
            src={data.photos[3]}
            alt="Raveena and Roshana at night"
            fill
            sizes="100vw"
            className="feature-image"
          />
          <div className="feature-overlay" />
          <motion.div
            className="feature-quote"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.45 }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease }}
          >
            <span className="quote-line quote-line-1">Two hearts.</span>
            <span className="quote-line quote-line-2">One journey.</span>
            <span className="quote-line quote-line-3">One forever.</span>
          </motion.div>
        </motion.div>
      </section>

      <section className="venue-section section-shell paper-section">
        <WatercolorBackdrop compact />
        <div className="content-width venue-grid">
          <motion.div
            className="venue-copy"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease }}
          >
            <p className="eyebrow">Where we celebrate</p>
            <h2>Venue</h2>
            <h3>{data.event.venue}</h3>
            <p className="room-name">{data.event.room}</p>

            <a className="venue-button" href={data.event.mapUrl} target="_blank" rel="noreferrer">
              <span>Open location</span>
              <i>↗</i>
            </a>

            <div className="dress-block">
              <span>Dress Code</span>
              <strong>{data.event.dressCode}</strong>
            </div>
          </motion.div>

          <motion.div
            className="venue-photo-wrap"
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease }}
          >
            <div className="venue-photo">
              <Image
                src={data.photos[4]}
                alt="Raveena and Roshana portrait"
                fill
                sizes="(max-width: 900px) 92vw, 45vw"
                className="cover-image venue-photo-position"
              />
            </div>
            <motion.div
              className="venue-seal"
              animate={reduceMotion ? undefined : { rotate: [0, 4, -4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              21<br />OCT<br />2026
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="gallery-preview section-shell paper-section">
        <div className="content-width">
          <SectionHeading eyebrow="A few moments from us" title="Our Gallery" />

          <div className="gallery-grid">
            {data.galleryPhotos.map((src, index) => (
              <motion.div
                className={`gallery-card gallery-card-${index + 1}`}
                key={`${src}-${index}`}
                initial={{ opacity: 0, y: 38, rotate: index % 2 ? 0.8 : -0.8 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.16 }}
                transition={{ duration: 0.82, delay: (index % 3) * 0.06, ease }}
              >
                <Image
                  src={src}
                  alt={`Raveena and Roshana gallery photo ${index + 1}`}
                  fill
                  sizes="(max-width: 700px) 94vw, (max-width: 1100px) 46vw, 31vw"
                  className="cover-image"
                  unoptimized={src.startsWith("http")}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-section section-shell paper-section">
        <WatercolorBackdrop compact />
        <BotanicalCorner className="botanical closing-botanical-top" />
        <BotanicalCorner className="botanical closing-botanical-bottom" flip />

        <motion.div
          className="closing-card"
          initial={{ opacity: 0, y: 28, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.95, ease }}
        >
          <p className="eyebrow">With love</p>
          <h2>{data.closing}</h2>
          <p className="deadline">
            Kindly RSVP before <strong>{data.event.rsvpDeadline}</strong>
          </p>

          <div className="contact-row">
            {data.contacts.map((contact) => (
              <a href={contact.href} key={contact.name}>
                <span>{contact.name}</span>
                <strong>{contact.display}</strong>
              </a>
            ))}
          </div>

          <div className="rsvp-placeholder">
            <span>RSVP</span>
            <p>{rsvpHref ? "Please confirm your attendance using your personalised RSVP form." : "Personalised RSVP links are sent directly to invited guests."}</p>
            {rsvpHref && (
              <Link href={rsvpHref} className="rsvp-preview-link">RSVP Now</Link>
            )}
          </div>

          <div className="developer-credit">
            <strong>{data.marketing?.heading ?? "Digital Wedding Experience by Imesh Peiris"}</strong>
            <p>{data.marketing?.body ?? "Beautifully crafted wedding invitation websites designed to make your celebration memorable from the very first impression."}</p>
            <small>{data.marketing?.services ?? "Personalised guest invitations • Interactive RSVP • Elegant galleries • Seamless digital sharing"}</small>
            <span>Bookings & Enquiries · <a href={`tel:+94${(data.marketing?.phone ?? "0767550215").replace(/\D/g, "").replace(/^0/, "")}`}>{data.marketing?.phone ?? "0767550215"}</a> · <a href={`mailto:${data.marketing?.email ?? "t.i.tpeeriya@gmail.com"}`}>{data.marketing?.email ?? "t.i.tpeeriya@gmail.com"}</a></span>
          </div>

          <p className="signature">{data.couple.display}</p>
          <p className="closing-date">{data.event.dateLabel}</p>
        </motion.div>
      </section>
    </main>
  );
}
