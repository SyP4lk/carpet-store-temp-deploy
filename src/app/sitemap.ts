import { MetadataRoute } from "next";
import data from "@/context/data.json";
import { localeConfig } from "@/localization/config";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.koenigcarpet.ru";
  const lastModified = formatDate(new Date());

  const staticSlugs = [
    "", // home
    "about",
    "contact",
    "delivery-return",
    "faq",
    "our-projects",
    "feedback",
    "rugs",
    "atelier",
    "vr",
    "designer",
    "demonstration",
  ];

  const staticPages: MetadataRoute.Sitemap = [];

  for (const locale of localeConfig.locales) {
    for (const slug of staticSlugs) {
      const url = slug
        ? `${baseUrl}/${locale}/${slug}`
        : `${baseUrl}/${locale}`;

      staticPages.push({
        url,
        lastModified,
        changeFrequency: "weekly",
        priority: slug === "" ? 1 : 0.7,
      });
    }
  }

  const products: MetadataRoute.Sitemap = (data as any[]).flatMap((product) => {
    const id = product.id;
    return localeConfig.locales.map((locale) => ({
      url: `${baseUrl}/${locale}/rugs/${id}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  });

  return [...staticPages, ...products];
}
