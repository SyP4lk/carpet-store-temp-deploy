import { RugProduct } from "@/types/product";

type FilterValue = string | string[];
type Filters = Record<string, FilterValue>;

const toList = (v: any): string[] => (Array.isArray(v) ? v : v ? [v] : []);

export const getFilters = (searchParams: any, filter?: string, slug?: string) => {
  const inStock = searchParams.inStock === "true";
  const colors = toList(searchParams.color);
  const styles = toList(searchParams.style);
  const collections = toList(searchParams.collection);
  const sizes = toList(searchParams.sizes);

  const baseFilters: Filters = {
    inStock: inStock ? ["IN_STOCK"] : [],
    color:colors,
    style: styles,
    collection: collections,
    sizes,
  };

  if (filter && slug) {
    switch (filter) {
      case "color":
        baseFilters.color = [slug];
        break;
      case "style":
        baseFilters.style = [slug];
        break;
      case "collection":
        baseFilters.collection = [slug];
        break;
      case "size":
        baseFilters.sizes = [slug];
        break;
      default:
        baseFilters[filter] = [slug];
    }
  }

  return baseFilters;
};

const getPropertyValues = (product: RugProduct, key: string): string[] => {
  switch (key) {
    case "color":
      return [product.color.value.toLowerCase()];
    case "collection":
      return [product.collection.value.toLowerCase()];
    case "style":
      return [product.style.value.toLowerCase()];
    case "sizes":
      return product.sizes?.map((s) => s.toLowerCase()) ?? [];
    // case "inStock":
    //   return product.stock > 0 ? ["IN_STOCK"] : [];
    default:
      return [];
  }
};

export const filterProducts = (
  products: RugProduct[],
  searchParams: any,
  filter?: string,
  slug?: string
): RugProduct[] => {
  const filters = getFilters(searchParams, filter, slug);
  

  return products.filter((product) => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true;

      const propValues = getPropertyValues(product, key);


      const filterValuesStr = (Array.isArray(filterValue) ? filterValue : [filterValue]).map((v) =>
        String(v).toLowerCase()
      );
      return filterValuesStr.some((v) => propValues.includes(v));
    });
  });
};
