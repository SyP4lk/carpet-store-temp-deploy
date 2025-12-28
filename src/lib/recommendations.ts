import { RugProduct } from "@/types/product";

/**
 * Извлекает список цветов из названия товара
 * Название содержит цвета через дефис, например: "BONE - NOUGAT - KHAKI - BLUE"
 */
function extractColorsFromName(productName: string): string[] {
  // Разделяем название по дефисам и берём отдельные слова
  const parts = productName.split(" - ");

  // Убираем последнее слово если это "RUG" или название коллекции
  const colors = parts
    .map(part => part.trim().toUpperCase())
    .filter(part =>
      part !== "RUG" &&
      part !== "CARPET" &&
      part !== "HALI" &&
      part !== "КОВЕР" &&
      part.length > 2 // Убираем очень короткие слова
    );

  return colors;
}

/**
 * Подсчитывает количество совпадающих цветов между двумя товарами
 */
function countMatchingColors(colors1: string[], colors2: string[]): number {
  let matches = 0;

  for (const color1 of colors1) {
    for (const color2 of colors2) {
      if (color1 === color2) {
        matches++;
        break;
      }
    }
  }

  return matches;
}

/**
 * Вычисляет разницу в цене между двумя товарами (в процентах)
 */
function calculatePriceDifference(price1: number, price2: number): number {
  if (price1 === 0) return 100;
  return Math.abs((price2 - price1) / price1) * 100;
}

/**
 * Получает рекомендованные товары на основе цветов ниток и цены
 *
 * Логика приоритета:
 * 1. Товары с максимальным совпадением цветов
 * 2. Товары с хотя бы одним совпадающим цветом
 * 3. Товары близкие по цене (±20%)
 *
 * @param currentProduct - текущий товар
 * @param allProducts - все товары для выбора рекомендаций
 * @param limit - максимальное количество рекомендаций (по умолчанию 200)
 * @returns массив рекомендованных товаров без дубликатов
 */
export function getRecommendations(
  currentProduct: RugProduct,
  allProducts: RugProduct[],
  limit: number = 200
): RugProduct[] {
  // Убираем текущий товар из списка и удаляем дубликаты по модели (первое слово названия)
  const seenModels = new Set<string>();
  const uniqueProducts: RugProduct[] = [];

  for (const product of allProducts) {
    if (product.id === currentProduct.id) continue; // Пропускаем текущий товар

    // Пропускаем товары без цены или с нулевой ценой
    const productPrice = parseFloat(
      typeof product.price === 'string'
        ? product.price.replace(/,/g, '')
        : String(product.price || '0')
    );
    if (!product.price || product.price === '' || productPrice === 0) continue;

    // Извлекаем модель - первое слово из английского названия (например, "ANATOLIA", "MARRAKESH")
    const modelName = product.product_name.en.split(" ")[0];

    if (!seenModels.has(modelName)) {
      seenModels.add(modelName);
      uniqueProducts.push(product);
    }
  }

  const otherProducts = uniqueProducts;

  // Извлекаем цвета из названия текущего товара
  const currentColors = extractColorsFromName(currentProduct.product_name.en);
  const currentPrice = parseFloat(
    typeof currentProduct.price === 'string'
      ? currentProduct.price.replace(/,/g, '')
      : String(currentProduct.price || '0')
  );

  // Создаём массив товаров с оценкой релевантности
  const scoredProducts = otherProducts.map(product => {
    const productColors = extractColorsFromName(product.product_name.en);
    const matchingColors = countMatchingColors(currentColors, productColors);

    const productPrice = parseFloat(
      typeof product.price === 'string'
        ? product.price.replace(/,/g, '')
        : String(product.price || '0')
    );
    const priceDiff = calculatePriceDifference(currentPrice, productPrice);

    // Расчёт общего скора:
    // - Совпадающие цвета дают большой вес (100 баллов за каждый цвет)
    // - Близкая цена даёт дополнительные баллы (до 20 баллов)
    let score = matchingColors * 100;

    // Бонус за близкую цену (в пределах ±20%)
    if (priceDiff <= 20) {
      score += (20 - priceDiff);
    }

    return {
      product,
      score,
      matchingColors,
      priceDiff
    };
  });

  // Сортируем по скору (сначала самые релевантные)
  scoredProducts.sort((a, b) => {
    // Сначала сравниваем по количеству совпадающих цветов
    if (b.matchingColors !== a.matchingColors) {
      return b.matchingColors - a.matchingColors;
    }
    // Если совпадений одинаково, сравниваем по цене
    return a.priceDiff - b.priceDiff;
  });

  // Возвращаем топ N товаров
  return scoredProducts.slice(0, limit).map(item => item.product);
}
