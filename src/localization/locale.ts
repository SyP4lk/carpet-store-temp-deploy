import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, localeConfig } from "@/localization/config";

export function useLocale() {
  const pathName = usePathname();
  const router = useRouter();
  const defaultLocale = localeConfig.defaultLocale;
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    if (!pathName) return;
    const segments = pathName.split("/");
    if (segments.length > 1 && segments[1]) {
      setLocale(segments[1] as Locale);
    }
  }, [pathName]);

  const setLang = (newLocale: Locale) => {
    if (!pathName) return;
    const segments = pathName.split("/");
    if (segments.length > 1) segments[1] = newLocale;
    else segments.unshift("", newLocale);
    const newPath = segments.join("/") || "/";
    setLocale(newLocale);
    document.cookie = `NEXT_LANG=${newLocale};path=/`;
    router.replace(newPath);
  };

  return [locale, setLang];
}
