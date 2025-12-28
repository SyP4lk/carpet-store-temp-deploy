import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, localeConfig } from "@/localization/config";

export function useLocale() {
  const pathName = usePathname();
  const router = useRouter();
  const defaultLocale = localeConfig.defaultLocale;
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const initialized = useRef(false); 

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let initialLocale: Locale = defaultLocale;

    if (pathName) {
      const segments = pathName.split("/");
      if (segments.length > 1 && segments[1]) {
        initialLocale = segments[1] as Locale;
      }
    }

    if (typeof document !== "undefined") {
      const match = document.cookie.match(/NEXT_LANG=(\w{2})/);
      if (match && match[1]) {
        initialLocale = match[1] as Locale;
      }
    }

    setLocale(initialLocale);
  }, [pathName, defaultLocale]);

  const setLang = (newLocale: Locale) => {
    if (!pathName) return;
    const segments = pathName.split("/");
    if (segments.length > 1) segments[1] = newLocale;
    else segments.unshift("", newLocale);
    const newPath = segments.join("/") || "/";
    setLocale(newLocale);
    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LANG=${newLocale};path=/`;
    }
    router.replace(newPath);
  };

  return [locale, setLang] as const;
}
