export async function fetchEURtoRUBRate(): Promise<number> {
  try {
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js', {
      next: { revalidate: 43200 } // Обновлять каждые 12 часов (2 раза в день)
    });

    if (!response.ok) {
      throw new Error('CBR API error');
    }

    const data = await response.json();
    return data.Valute.EUR.Value;
  } catch (error) {
    console.error('Failed to fetch EUR rate from CBR:', error);
    return 105; // Фоллбэк курс EUR/RUB
  }
}

/**
 * Форматировать цену с конвертацией EUR -> RUB + 2% наценка
 * @param eurPrice - цена в евро
 * @param locale - текущая локаль
 * @param eurToRubRate - актуальный курс EUR/RUB (опционально, по умолчанию 105)
 */
export function formatPrice(
  eurPrice: string | number,
  locale: string,
  eurToRubRate: number = 105
): string {
  // Убираем запятые из строки перед парсингом (1,390.00 -> 1390.00)
  const cleanPrice = typeof eurPrice === 'string' ? eurPrice.replace(/,/g, '') : eurPrice.toString();
  const price = parseFloat(cleanPrice);

  if (isNaN(price)) {
    return locale === 'ru' ? '0 ₽' : '€0';
  }

  if (locale === 'ru') {
    const rubPrice = price * eurToRubRate * 1.02; // +2% наценка
    return `${Math.round(rubPrice).toLocaleString('ru-RU')} ₽`;
  }

  // EN: показываем евро + 2% наценка
  const priceWithMarkup = price * 1.02;
  return `€${Math.round(priceWithMarkup).toLocaleString('en-US')}`;
}