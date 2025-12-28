"use client";

import { FC, useRef, useState, useEffect, useMemo } from "react";
import { RugProduct } from "@/types/product";
import ProductCard from "@/components/shared/productCard";
import { Locale } from "@/localization/config";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StockProvider } from "@/context/StockContext";

type Props = {
  recommendations: RugProduct[];
  locale: Locale;
  title?: string;
};

const RugRecommendations: FC<Props> = ({ recommendations, locale, title }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Проверяем возможность прокрутки
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Проверяем при монтировании и изменении размера окна
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [recommendations]);

  // Прокрутка влево
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Прокрутка вправо
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Собираем все product codes для батч-запроса
  const productCodes = useMemo(() => {
    return recommendations.map(product => product.product_code).filter(Boolean)
  }, [recommendations])

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <StockProvider productCodes={productCodes}>
      <div className="w-full py-10 bg-gray-50">
      <div className="w-full">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 uppercase px-4 md:px-10">
          {title || (locale === 'ru' ? 'Рекомендуем также' : 'We Also Recommend')}
        </h2>

        {/* Контейнер с навигацией */}
        <div className="relative px-4 md:px-10">
          {/* Стрелка влево */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-200 hover:scale-110"
              aria-label="Прокрутить влево"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
            </button>
          )}

          {/* Горизонтальная прокручиваемая карусель */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="overflow-x-auto scrollbar-hide"
          >
            <div className="flex gap-4 md:gap-6" style={{ width: 'max-content' }}>
              {recommendations.map((product) => (
                <div key={product.id} className="w-[200px] md:w-[280px] flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Стрелка вправо */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-200 hover:scale-110"
              aria-label="Прокрутить вправо"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      </div>
    </StockProvider>
  );
};

export default RugRecommendations;
