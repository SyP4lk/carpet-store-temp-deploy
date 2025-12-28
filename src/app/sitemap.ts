import { MetadataRoute } from "next";
import data from "@/context/data.json";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.koenigcarpet.ru";

  const products = (data as any[]).map((product) => {
    const id = product.id;
    return {
      url: `${baseUrl}/en/rugs/${id}`,
      lastModified: formatDate(new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/en/rugs/${id}`,
          ru: `${baseUrl}/ru/rugs/${id}`,
          tr: `${baseUrl}/tr/rugs/${id}`,
        },
      },
      images: product.images,
    };
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: formatDate(new Date()),
      changeFrequency: "daily" as const,
      priority: 1,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          ru: `${baseUrl}/ru`,
          tr: `${baseUrl}/tr`,
        },
      },
    },
  ];

  return [...staticPages, ...products];
}
