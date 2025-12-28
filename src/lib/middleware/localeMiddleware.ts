import { Locale, localeConfig } from "@/localization/config";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { type NextRequest, NextResponse } from "next/server";

export async function localeMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  const locales = localeConfig.locales;
  const pathLocale = locales.find((loc) => pathname.startsWith(`/${loc}`));

  if (pathLocale) {
    const res = NextResponse.next();
    res.cookies.set(localeConfig.cookieName, pathLocale, {
      path: "/",
      maxAge: localeConfig.cookieMaxAge,
    });
    res.headers.set('x-locale', pathLocale);
    return res;
  }

  const locale = getLocale(req);
  const search = req.nextUrl.search;

  const response = NextResponse.redirect(
    new URL(`/${locale}${pathname}${search}`, req.url)
  );

  response.cookies.set(localeConfig.cookieName, locale, {
    path: "/",
    maxAge: localeConfig.cookieMaxAge,
  });
  response.headers.set('x-locale', locale);

  return response;
}

function getLocale(request: NextRequest): string {
  const cookieLang = request.cookies.get(localeConfig.cookieName)?.value as Locale;
  const locales = localeConfig.locales;
  const defaultLocale = localeConfig.defaultLocale;

  if (cookieLang && locales.includes(cookieLang)) {
    return cookieLang;
  }

  try {
    const acceptLanguage = request.headers.get("accept-language");

    // Если заголовок пустой или невалидный, сразу используем defaultLocale
    if (!acceptLanguage || acceptLanguage.trim() === '' || acceptLanguage === '*') {
      return defaultLocale;
    }

    const headers = {
      "accept-language": acceptLanguage,
    };

    const languages = new Negotiator({ headers }).languages();

    // Фильтруем невалидные локали (пустые, '*', слишком длинные и т.д.)
    const validLanguages = languages.filter(lang => {
      return lang &&
             lang !== '*' &&
             lang.length > 0 &&
             lang.length < 20 &&
             /^[a-zA-Z]{2}(-[a-zA-Z]{2})?$/.test(lang.split(';')[0].trim());
    });

    if (validLanguages.length === 0) {
      return defaultLocale;
    }

    return match(validLanguages, locales, defaultLocale);
  } catch (error) {
    // Тихо возвращаем defaultLocale без спама в логи
    // Ошибки локалей от ботов - это нормально, не нужно логировать
    return defaultLocale;
  }
}
