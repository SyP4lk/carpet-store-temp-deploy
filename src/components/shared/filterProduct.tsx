"use client";

import ProductCard from "@/components/shared/productCard";
import ProductWrapper from "@/components/shared/productWrapper";
import PaginationNumbers from "@/components/shared/paginationNumbers";
import { RugProduct } from "@/types/product";
import { FC, Suspense, useEffect, useMemo } from "react";
import { useDictionary } from "@/hooks/useDictionary";
import { useFilterStore } from "@/hooks/useFilterDataStore"
import { StockProvider } from "@/context/StockContext";

type Props = {
  rugs: RugProduct[];
  searchParams: Record<string, string | string[]>;
  rugsCount: number;
  filterData: any[]
};

const FilterProduct: FC<Props> = ({ rugs = [], searchParams, rugsCount, filterData }) => {
  const { dictionary } = useDictionary();
  const { setFilters } = useFilterStore()

  useEffect(() => {
    setFilters(filterData)
  }, [filterData, setFilters])

  // Собираем все product codes для батч-запроса
  const productCodes = useMemo(() => {
    return rugs.map(product => product.product_code).filter(Boolean)
  }, [rugs])

  return (
    <StockProvider productCodes={productCodes}>
      <ProductWrapper searchParams={searchParams}>
        {rugs.length > 0 ? (
          rugs.map((product, i) => <ProductCard key={i} product={product} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            {dictionary?.shared.notFound}
          </p>
        )}
        <Suspense fallback={null}>
          <PaginationNumbers
            totalItemsCount={rugsCount}
            defaultPerPage={12}
            maxPerPage={200}
          />
        </Suspense>
      </ProductWrapper>
    </StockProvider>
  );
};

export default FilterProduct;
