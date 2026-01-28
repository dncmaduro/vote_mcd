"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Home() {
  const t = useTranslations("home");

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
            <div className="animate-enter-up">
              <Image
                src="/header.png"
                alt="My Candy's Got Talent"
                width={1400}
                height={500}
                priority
                className="h-auto w-full max-w-2xl"
              />
            </div>

            {/* Hero text */}
            <div className="animate-enter-up">
              <p className="max-w-md whitespace-pre-line font-sans text-base leading-7 text-white/90">
                {t("hero")}
              </p>
            </div>

            {/* CTA group */}
            <div className="flex flex-col items-center gap-4 animate-enter-up">
              <Link
                href="/vote"
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
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
