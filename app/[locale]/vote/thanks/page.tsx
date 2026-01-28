import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function VoteThanksPage() {
  const t = await getTranslations("thanks");

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

      <div className="relative flex min-h-screen w-full items-center justify-center px-6 pt-24">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-24 w-24 -translate-y-10 items-center justify-center rounded-full bg-[#f5d061]/15 ring-2 ring-[#f5d061]">
            <svg width="42" height="42" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M20 6L9 17l-5-5"
                fill="none"
                stroke="#f5d061"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="-mt-2 text-5xl font-bold leading-tight text-white">
            {t("title")}
          </h1>
          <p className="mt-6 whitespace-pre-line font-sans text-lg leading-8 text-white/70">
            {t("desc")}
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className={[
                "inline-flex w-full items-center justify-center rounded-full px-10 py-5",
                "font-sans font-extrabold uppercase",
                "text-lg tracking-wider",
                "text-black",
                "shadow-2xl",
                "bg-gradient-to-r from-[#b8860b] via-[#f3e3bd] to-white",
                "ring-1 ring-black/10",
                "transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]",
              ].join(" ")}
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
