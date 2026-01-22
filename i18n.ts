import { getRequestConfig } from "next-intl/server";

const LOCALES = ["vi", "en", "zh"] as const;
type AppLocale = (typeof LOCALES)[number];

function isAppLocale(value: string): value is AppLocale {
  return (LOCALES as readonly string[]).includes(value);
}

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale is a Promise in Next.js 15+
  const requested = await requestLocale;
  const resolvedLocale: AppLocale =
    requested && isAppLocale(requested) ? requested : "vi";

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  };
});
