import { MetadataRoute } from "next";
import { localeConfig } from "@/localization/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koenigcarpet.ru";
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
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
