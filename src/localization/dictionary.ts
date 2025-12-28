import "server-only";

import { cookies } from "next/headers";
import { Locale, localeConfig } from "./config";

const dictionaries = {
  en: () => import('./dictionary/en.json').then((module) => module.default),
  ru: () => import('./dictionary/ru.json').then((module) => module.default),
}

export const getDictionary = async (locale?: Locale) => {
  let localeIn = locale;
  if (localeIn) return dictionaries[localeIn]?.();
  const cookieStore = await cookies();
  const cookieName = localeConfig.cookieName;
  const defaultLocale = localeConfig.defaultLocale;
  localeIn = cookieStore.get(cookieName)?.value as Locale;
  return (await dictionaries[localeIn]?.()) ?? dictionaries[defaultLocale]();
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)[Locale]>>;
