import { MetadataRoute } from "next";
import { localeConfig } from "@/localization/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koenigcarpet.ru";
  const lastModified = formatDate(new Date());

  const servicePages = ["atelier", "vr", "designer", "demonstration"];
  const infoPages = ["contact", "about", "delivery-return", "faq", "feedback", "our-projects"];
  const catalogPages = [
    "all-rugs",
    "rugs-in-stock",
    "new-rugs",
    "runners",
    "marquise",
    "oriental",
    "amorph",
    "ethnique",
    "shell",
    "trinity",
  ];

  const staticPages: MetadataRoute.Sitemap = [];

  for (const locale of localeConfig.locales) {
    staticPages.push({
      url: `${baseUrl}/${locale}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    });

    for (const slug of [...servicePages, ...infoPages, ...catalogPages]) {
      staticPages.push({
        url: `${baseUrl}/${locale}/${slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  const products = await prisma.product.findMany({
    where: {
      price: { not: "" },
    },
    select: { id: true },
  });

  const productPages: MetadataRoute.Sitemap = products.flatMap((product) =>
    localeConfig.locales.map((locale) => ({
      url: `${baseUrl}/${locale}/rugs/${product.id}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    }))
  );

  return [...staticPages, ...productPages];
}
