"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Image
        src="/background.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
        <div className="flex w-full max-w-3xl flex-col items-center gap-10 text-center">
          <div className="animate-enter-up [animation-delay:60ms]">
            <Image
              src="/header.png"
              alt="Year End Party 2026"
              width={1400}
              height={500}
              priority
              className="h-auto w-full max-w-2xl"
            />
          </div>

          <div className="animate-enter-up [animation-delay:180ms]">
            <p className="max-w-md font-sans text-base leading-7 text-white/90">
              {t("hero")}
            </p>
          </div>

          <div className="animate-enter-up [animation-delay:300ms]">
            <button
              type="button"
              onClick={() => {
                // TODO: scroll action sẽ thêm sau
              }}
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
          </div>
        </div>
      </div>
    </div>
  );
}
