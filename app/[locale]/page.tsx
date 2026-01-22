"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, options);

    io.observe(el);
    return () => io.unobserve(el);
  }, [options]);

  return { ref, inView };
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = -30;
  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset + offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}

export default function Home() {
  const t = useTranslations("home");

  const slideImages = useMemo(
    () => Array.from({ length: 10 }, (_, i) => `/${i + 1}.png`),
    [],
  );

  const [active, setActive] = useState(0);
  // Position index includes cloned slides for seamless looping
  const slidesWithClones = useMemo(() => {
    if (slideImages.length === 0) return [] as string[];
    const first = slideImages[0];
    const last = slideImages[slideImages.length - 1];
    return [last, ...slideImages, first];
  }, [slideImages]);

  const [position, setPosition] = useState(1); // start at first real slide
  const [animate, setAnimate] = useState(true);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const heroHeader = useInView<HTMLDivElement>({ threshold: 0.2 });
  const heroText = useInView<HTMLDivElement>({ threshold: 0.2 });
  const heroCtas = useInView<HTMLDivElement>({ threshold: 0.2 });

  const slideTitle = useInView<HTMLDivElement>({ threshold: 0.25 });
  const slideCarousel = useInView<HTMLDivElement>({ threshold: 0.25 });
  const slideChevron = useInView<HTMLDivElement>({ threshold: 0.25 });

  // Auto slide
  useEffect(() => {
    if (slidesWithClones.length === 0) return;
    const id = setInterval(() => {
      setPosition((p) => p + 1);
      setActive((a) => (a + 1) % slideImages.length);
    }, 4000);
    return () => clearInterval(id);
  }, [slideImages.length, slidesWithClones.length]);

  // Handle transition end to reset when hitting clones
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onEnd = () => {
      if (position === slidesWithClones.length - 1) {
        // Moved onto last clone (after last real slide) → snap back to first real
        setAnimate(false);
        setPosition(1);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
      } else if (position === 0) {
        // Moved onto first clone (before first real slide) → snap back to last real
        setAnimate(false);
        setPosition(slidesWithClones.length - 2);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
      }
    };
    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [position, slidesWithClones.length]);

  return (
    <div className="w-full relative min-h-screen">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Image
          src="/background.png"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>
      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
          <div className="flex w-full max-w-3xl flex-col items-center gap-10 text-center">
            {/* Header */}
            <div
              ref={heroHeader.ref}
              className={[
                "transition-all duration-700 ease-out",
                heroHeader.inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0",
              ].join(" ")}
            >
              <Image
                src="/header.png"
                alt="Year End Party 2026"
                width={1400}
                height={500}
                priority
                className="h-auto w-full max-w-2xl"
              />
            </div>

            {/* Hero text */}
            <div
              ref={heroText.ref}
              className={[
                "transition-all duration-700 ease-out delay-100",
                heroText.inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0",
              ].join(" ")}
            >
              <p className="max-w-md whitespace-pre-line font-sans text-base leading-7 text-white/90">
                {t("hero")}
              </p>
            </div>

            {/* CTA group */}
            <div
              ref={heroCtas.ref}
              className={[
                "flex flex-col items-center gap-4",
                "transition-all duration-700 ease-out delay-150",
                heroCtas.inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0",
              ].join(" ")}
            >
              {/* Main CTA */}
              <button
                type="button"
                onClick={() => scrollToId("slide")}
                className={[
                  "rounded-full px-10 py-4",
                  "font-sans font-bold uppercase",
                  "text-sm tracking-wide",
                  "text-black",
                  "shadow-xl",
                  "transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]",
                  "bg-gradient-to-r from-[#b8860b] via-[#f3e3bd] to-white",
                  "ring-1 ring-black/10",
                ].join(" ")}
              >
                {t("cta")}
              </button>

              {/* Secondary CTAs */}
              <div className="flex gap-3 sm:flex-row">
                <Link
                  href="/timeline"
                  className={[
                    "rounded-full px-6 py-3",
                    "font-sans font-semibold",
                    "text-sm",
                    "text-black/70",
                    "transition-transform duration-200",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "bg-gradient-to-r from-[#f7f5f0] via-[#f1ede4] to-[#e8e4da]",
                    "ring-1 ring-black/10",
                  ].join(" ")}
                >
                  {t("ctaTimeline")}
                </Link>

                <Link
                  href="/got-talent"
                  className={[
                    "rounded-full px-6 py-3",
                    "font-sans font-semibold",
                    "text-sm",
                    "text-black/70",
                    "transition-transform duration-200",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "bg-gradient-to-r from-[#f7f5f0] via-[#f1ede4] to-[#e8e4da]",
                    "ring-1 ring-black/10",
                  ].join(" ")}
                >
                  {t("ctaGotTalent")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SLIDE SECTION */}
      <section
        id="slide"
        className="relative w-full scroll-mt-24 bg-transparent  px-6 py-16"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
          {/* Slogan */}
          <div
            ref={slideTitle.ref}
            className={[
              "transition-all duration-700 ease-out",
              slideTitle.inView
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0",
            ].join(" ")}
          >
            <Image
              src="/slogan.png"
              alt="Slogan"
              width={1400}
              height={300}
              className="h-auto w-full max-w-3xl"
              priority={false}
            />
          </div>

          {/* Carousel */}
          <div
            ref={slideCarousel.ref}
            className={[
              "w-full",
              "transition-all duration-700 ease-out",
              slideCarousel.inView
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0",
            ].join(" ")}
          >
            <div className="relative mx-auto w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
              <div
                ref={trackRef}
                className={[
                  "flex",
                  animate ? "transition-transform duration-500 ease-out" : "",
                ].join(" ")}
                style={{ transform: `translateX(-${position * 100}%)` }}
              >
                {slidesWithClones.map((src, idx) => (
                  <div
                    key={`${idx}-${src}`}
                    className="relative h-[60vh] w-full shrink-0"
                  >
                    <Image
                      src={src}
                      alt={`Slide ${((idx - 1 + slideImages.length) % slideImages.length) + 1}`}
                      fill
                      className="object-cover"
                      priority={idx === 1}
                    />
                  </div>
                ))}
              </div>

              {/* Controls */}
              <button
                type="button"
                onClick={() => {
                  setPosition((p) => p - 1);
                  setActive(
                    (v) => (v - 1 + slideImages.length) % slideImages.length,
                  );
                }}
                className={[
                  "absolute left-3 top-1/2 -translate-y-1/2",
                  "rounded-full px-3 py-2",
                  "text-white/90",
                  "bg-black/40",
                  "ring-1 ring-white/15",
                  "backdrop-blur",
                  "hover:bg-black/55",
                ].join(" ")}
                aria-label="Previous slide"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() => {
                  setPosition((p) => p + 1);
                  setActive((v) => (v + 1) % slideImages.length);
                }}
                className={[
                  "absolute right-3 top-1/2 -translate-y-1/2",
                  "rounded-full px-3 py-2",
                  "text-white/90",
                  "bg-black/40",
                  "ring-1 ring-white/15",
                  "backdrop-blur",
                  "hover:bg-black/55",
                ].join(" ")}
                aria-label="Next slide"
              >
                ›
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {slideImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setActive(i);
                      setPosition(i + 1);
                    }}
                    className={[
                      "h-2 w-2 rounded-full transition-all",
                      i === active ? "bg-white" : "bg-white/40",
                    ].join(" ")}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Down chevron */}
          <div
            ref={slideChevron.ref}
            className={[
              "transition-all duration-700 ease-out",
              slideChevron.inView ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => scrollToId("next")}
              className="group flex flex-col items-center"
              aria-label="Scroll to next section"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-10 w-10 animate-bounce text-white/90 group-hover:text-white"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 10l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 6l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* NEXT SECTION (placeholder để scroll tới) */}
      <section
        id="next"
        className="w-full scroll-mt-24 bg-neutral-950 px-6 py-24"
      >
        <div className="mx-auto w-full max-w-5xl text-center text-white/90">
          {/* TODO: section tiếp theo bạn sẽ thay nội dung */}
          <div className="text-xl font-semibold">Next section</div>
        </div>
      </section>
    </div>
  );
}
