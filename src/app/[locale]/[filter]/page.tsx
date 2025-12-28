import FilterProduct from "@/components/shared/filterProduct";
import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import ProductControl from "@/components/shared/productControl";
import { notFound } from "next/navigation";
import { FC, Suspense } from "react";
import { filterProducts } from "@/lib/filterProduct";
import { generateFilterData } from "@/lib/generateFilterData";
import { Locale } from "@/localization/config"
import { getDictionary } from "@/localization/dictionary"
import { RugProduct } from "@/types/product";
import { getAllProducts } from "@/lib/products";


type RugsPageProps = {
  params: Promise<{ filter: string, locale: Locale }>;
  searchParams: Promise<Record<string, string>>;
};

const VALID_FILTERS = [
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
] as const;

type FilterType = (typeof VALID_FILTERS)[number];

const RugsPage: FC<RugsPageProps> = async ({ params, searchParams }) => {
  const filter = (await params).filter;
  const urlSearchParams = await searchParams;
  const pathParams = await params;
  const dict = await getDictionary();

  if (!VALID_FILTERS.includes(filter as FilterType)) {
    return notFound();
  }

  const images: Record<string, string> = {
    "all-rugs": "/static/banner/all-rugs.png",
    "rugs-in-stock": "/static/banner/rugs-in-stock.png",
    "new-rugs": "/static/banner/new-rugs.jpg",
    runners: "/static/banner/runners.png",
    marquise: "/static/banner/marquise.png",
    oriental: "/static/banner/oriental.jpg",
    amorph: "/static/banner/amorph.png",
    ethnique: "/static/banner/ethnique.png",
    shell: "/static/banner/shell.png",
    trinity: "/static/banner/trinity.png",
  };


  const mergedSearchParams = {
    ...urlSearchParams,
    ...(filter !== "all-rugs" &&
      ["marquise", "oriental", "amorph", "ethnique", "shell", "trinity"].includes(filter)
      ? { collection: filter }
      : {}),
  };

  const data = await getAllProducts();

  let filteredRugs = filterProducts(data, mergedSearchParams);

  if (filter === "new-rugs") {
    filteredRugs = filteredRugs.filter((r) => r.isNew === true);
  }

  if (filter === "runners") {
    filteredRugs = filteredRugs.filter((r) => r.isRunners === true);
  }

  if (filter === "rugs-in-stock") {
    filteredRugs = filteredRugs.filter((r) => r.inStock === true);
  }


  const pageRaw = urlSearchParams.page;
  const perPageRaw = urlSearchParams.perPage;

  const perPage = Math.max(1, Math.min(parseInt(perPageRaw as string) || 12, 200));
  const currentPage = Math.max(1, parseInt(pageRaw as string) || 1);

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const displayedRugs = filteredRugs.slice(start, end);

  const filterData = generateFilterData(data, pathParams.locale, dict)
  const category = dict.home.categories.find((item) => "/" + filter === item.path)

  return (
    <div className="flex flex-col">
      <Banner filter={category?.title ? category.title : ""} image={images[filter]} />
      <Suspense fallback={null}>
        <ProductControl />
      </Suspense>

      <FilterProduct
        searchParams={urlSearchParams}
        rugs={displayedRugs}
        rugsCount={filteredRugs.length}
        filterData={filterData}
      />

      <Footer />
    </div>
  );
};

export default RugsPage;

// ISR: Кешировать страницу на 1 час (3600 секунд)
// Обновление произойдет автоматически или при вызове revalidatePath()
export const revalidate = 3600;

export const generateStaticParams = async () => {
  return VALID_FILTERS.map((filter) => ({ filter }));
};
