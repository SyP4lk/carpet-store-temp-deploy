import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import LazyImage from "@/components/shared/lazyImage";
import { Locale } from "@/localization/config";
import { getDictionary } from "@/localization/dictionary";
import { use } from "react";

const products = [
  "/static/our-projects/3ac3847e-a017-4180-8ce8-dc7527df475b.jpg",
  "/static/our-projects/4b09e67e-2763-414b-b847-9edcab866a64.jpeg",
  "/static/our-projects/08aa562d-2b1f-4dff-ab63-86f6bf5ce963.jpg",
  "/static/our-projects/17.jpg",
  "/static/our-projects/993a6f3defc1ddd1c789d7e735922cbe.jpg",
  "/static/our-projects/20241217_151223.jpg",
  "/static/our-projects/a08aa1fd-bb33-4d54-9f75-e71637e10ca4.jpg",
  "/static/our-projects/biblos-galeri-10-1.jpg",
  "/static/our-projects/biblos-galeri-12.jpg",
  "/static/our-projects/biblos-galeri-44.jpg",
  "/static/our-projects/biblos-galeri-46.jpg",
  "/static/our-projects/biblos-galeri-48.jpg",
  "/static/our-projects/biblos-galeri-50.jpg",
  "/static/our-projects/c1dc474b-a279-44ce-94f3-2f2aefc4b504.jpeg",
  "/static/our-projects/divan-ankara-rooms-deluxe-room-king-city.jpg",
  "/static/our-projects/divan-ankara-rooms-executive-suite-king-.jpg",
];

type ProductDetailsProps = {
  params: Promise<{ locale: Locale }>
};

export default function Page({ params }: ProductDetailsProps) {
  const pathParams = use(params)
  const dict = use(getDictionary(pathParams.locale))
  return (
    <>
      <Banner filter={dict.shared.ourProjects} image="/static/image2.png" />
      <div className="p-6">
        <div className="columns-2 md:columns-4 gap-2 md:gap-4">
          {products.map((src, i) => (
            <div key={i} className="overflow-hidden mb-2 md:mb-4" >
              <LazyImage
                src={src}
                alt={`Product ${i + 1}`}
                width={400}
                height={400}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
