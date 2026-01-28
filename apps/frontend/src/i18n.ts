import { getRequestConfig } from 'next-intl/server';

export const locales = ['ru', 'en', 'uz', 'tg', 'ky'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
