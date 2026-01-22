"use client";

import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { usePathname as useNextPathname } from "next/navigation";

const LOCALES = [
  { code: "vi", label: "VI" },
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const nextPathname = useNextPathname();

  // Lấy pathname từ Next.js (có locale prefix) và loại bỏ locale prefix
  // Ví dụ: "/en/about" -> "/about", "/vi" -> "/"
  const pathname =
    nextPathname.replace(
      new RegExp(`^/(${LOCALES.map((l) => l.code).join("|")})(/|$)`),
      "",
    ) || "/";

  const handleLocaleChange = (newLocale: string) => {
    // Sử dụng router.replace với pathname đã loại bỏ locale prefix
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="fixed right-2 top-2 z-50 p-2">
      <div className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 backdrop-blur-md">
        {LOCALES.map((item) => {
          const isActive = locale === item.code;

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => handleLocaleChange(item.code)}
              className={[
                "rounded-full px-3 py-1",
                "text-xs font-sans font-bold",
                "transition-colors duration-200",
                isActive
                  ? "bg-white text-black"
                  : "text-white/80 hover:bg-white/20",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
