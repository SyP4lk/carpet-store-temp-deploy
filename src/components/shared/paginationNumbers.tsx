"use client";

import { FC, useEffect, useMemo } from "react";
import { useQueryState } from "@/hooks/useQueryState";
import nProgress from "nprogress";

type Props = {
  totalItemsCount: number;
  defaultPerPage?: number;
  maxPerPage?: number;
  perPageOptions?: number[];
};

const clamp = (num: number, min: number, max: number) =>
  Math.max(min, Math.min(num, max));

const safeParseInt = (val: string | null | undefined, fallback: number): number => {
  const parsed = parseInt(val ?? "");
  return Number.isNaN(parsed) ? fallback : parsed;
};


const buildRange = (current: number, total: number, delta = 2): (number | string)[] => {
  if (total <= 1) return [1];
  const pages: (number | string)[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  pages.push(1);
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  if (total > 1) pages.push(total);

  return pages;
};

const PaginationNumbers: FC<Props> = ({
  totalItemsCount,
  defaultPerPage = 12,
  maxPerPage = 200,
  perPageOptions = [12, 24, 48],
}) => {
  
  const [pageRaw, setPage] = useQueryState("page", false);
  const [perPageRaw, setPerPage] = useQueryState("perPage", false);

  
  const rawPer = safeParseInt(perPageRaw, defaultPerPage);
  const perPage = clamp(rawPer, 1, maxPerPage);

  const items = Math.max(0, totalItemsCount || 0);
  const totalPages = Math.max(1, Math.ceil(items / perPage));

  const rawPage = safeParseInt(pageRaw, 1);
  const currentPage = clamp(rawPage, 1, totalPages);

  
  useEffect(() => {
    const needsPerFix = rawPer !== perPage;
    const needsPageFix = rawPage !== currentPage;

    if (needsPerFix) {
      setPerPage(String(perPage));
    }
    if (needsPageFix) {
      setPage(String(currentPage));
    }
    
  }, [rawPer, perPage, rawPage, currentPage, setPage, setPerPage]);

  
  const pages = useMemo(() => buildRange(currentPage, totalPages, 2), [currentPage, totalPages]);

  if (items === 0 || totalPages <= 1) return null;

  const goToPage = (p: number) => {
    const next = clamp(p, 1, totalPages);
    if (next === currentPage) return;
    nProgress.start();
    setPage(String(next));
  };

  const handlePrev = () => goToPage(currentPage - 1);
  const handleNext = () => goToPage(currentPage + 1);
  const handleFirst = () => goToPage(1);
  const handleLast = () => goToPage(totalPages);

  const handlePerPageChange = (val: string) => {
    const next = clamp(safeParseInt(val, defaultPerPage), 1, maxPerPage);
    nProgress.start();
    setPerPage(String(next));
  };

  
  const normalizedOptions = Array.from(
    new Set([...perPageOptions, defaultPerPage].map((n) => clamp(n, 1, maxPerPage)))
  ).sort((a, b) => a - b);

  return (
    <nav
      className="col-span-full mt-6 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {/* First (md dan katta) */}
      <button
        onClick={handleFirst}
        disabled={currentPage === 1}
        className="hidden md:inline-flex px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
        aria-label="First page"
      >
        «
      </button>

      {/* Prev */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
        aria-label="Previous page"
      >
        ‹
      </button>

      {/* Katta ekran: raqamlar + ellipsis */}
      <div className="hidden md:flex gap-2">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-3 py-1 text-gray-400 select-none" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={`p-${p}`}
              onClick={() => goToPage(p as number)}
              data-active={p === currentPage}
              className="
                px-3 py-1 border rounded transition-colors
                hover:bg-gray-100 cursor-pointer
                data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:border-gray-900
              "
              aria-current={p === currentPage ? "page" : undefined}
              aria-label={`Page ${p}`}
            >
              {String(p)}
            </button>
          )
        )}
      </div>

      {/* Kichik ekran: faqat current / total */}
      <div className="flex md:hidden items-center gap-2">
        <span
          className="px-3 py-1 border rounded bg-gray-900 text-white"
          aria-current="page"
        >
          {String(currentPage)}
        </span>
        <span className="text-gray-500 text-sm select-none">/ {String(totalPages)}</span>
      </div>

      {/* Next */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
        aria-label="Next page"
      >
        ›
      </button>

      {/* Last (md dan katta) */}
      <button
        onClick={handleLast}
        disabled={currentPage === totalPages}
        className="hidden md:inline-flex px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
        aria-label="Last page"
      >
        »
      </button>

      <label className="ml-3 text-sm text-gray-600 hidden sm:inline-block">
        <span className="sr-only">Items per page</span>
      </label>
      <select
        value={perPage}
        onChange={(e) => handlePerPageChange(e.target.value)}
        className="ml-2 border rounded px-2 py-1 text-sm cursor-pointer"
        aria-label="Items per page"
      >
        {normalizedOptions.map((opt) => (
          <option key={opt} value={opt} className="cursor-pointer">
            {opt}
          </option>
        ))}
      </select>
    </nav>
  );
};

export default PaginationNumbers;
