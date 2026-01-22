import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["vi", "en", "zh"],
  defaultLocale: "vi",
  localePrefix: "always", // QUAN TRỌNG: luôn có /vi /en /zh
  localeDetection: false, // Tắt auto-detect từ accept-language header, luôn dùng defaultLocale
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
