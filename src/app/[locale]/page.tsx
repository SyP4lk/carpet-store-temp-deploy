import Category from "@/components/pages/home/category";
import SlideWrapper from "@/components/pages/home/slideWrapper";
import Footer from "@/components/shared/footer";
import Navbar from "@/components/shared/navbar";
import type { Metadata } from "next";
import { getDictionary } from "@/localization/dictionary";
import { Locale } from "@/localization/config";
import { use } from "react";


export default function Home() {
  const dict = use(getDictionary())

  return (
    <div className="h-screen w-full overflow-hidden relative">
      <Navbar fixed />
      <SlideWrapper elem={<Footer />}>
        {dict.home.categories.map((category) => (
          <Category key={category.title} category={category} />
        ))}
      </SlideWrapper>
      
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const locale = (await params).locale;
  const dictionary = await getDictionary(locale);
  const meta = dictionary.home.meta;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.openGraph.title,
      description: meta.openGraph.description,
      images: [{ url: meta.openGraph.image, width: 1200, height: 630 }],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: meta.twitter.title,
      description: meta.twitter.description,
      images: [meta.twitter.image]
    }
  };
}
