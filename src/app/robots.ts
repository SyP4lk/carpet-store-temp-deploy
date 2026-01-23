import { MetadataRoute } from "next";
import { localeConfig } from "@/localization/config";

export default function robots(): MetadataRoute.Robots {
  const disallow: string[] = ["/admin", "/api"];

  for (const loc of localeConfig.locales) {
    disallow.push(`/${loc}/cart`);
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: "https://www.koenigcarpet.ru/sitemap.xml",
  };
}
