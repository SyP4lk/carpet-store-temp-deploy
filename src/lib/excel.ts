import * as XLSX from 'xlsx'
import { Product } from '@prisma/client'
import { calculateRugPrice } from './calculatePrice'

interface ProductWithNames extends Product {
  productNames: Array<{ locale: string; name: string }>
  descriptions: Array<{ locale: string; description: string }>
}

export async function exportProductsToExcel(products: ProductWithNames[], eurToRubRate: number = 105): Promise<Buffer> {
  const data = products.map(product => {
    const nameRu = product.productNames.find(n => n.locale === 'ru')?.name || ''
    const descriptionRu = product.descriptions.find(d => d.locale === 'ru')?.description || ''

    // Calculate price for default size (if exists) or base price (for smallest size)
    const basePrice = typeof product.price === 'string'
      ? parseFloat(product.price.replace(/,/g, ''))
      : parseFloat(product.price || '0')

    // Если есть размеры и defaultSize, рассчитываем цену для defaultSize
    let priceEur = basePrice
    if (product.sizes && product.sizes.length > 0 && product.defaultSize) {
      priceEur = calculateRugPrice(basePrice, product.sizes, product.defaultSize)
    }

    // Применяем ту же логику что и на сайте: EUR -> RUB + 2% наценка
    // Используем актуальный курс из API ЦБ РФ
    const priceRub = Math.round(priceEur * eurToRubRate * 1.02)

    // Get 4th image URL (index 3)
    const imageUrl = product.images[3]
      ? (product.images[3].startsWith('http')
          ? product.images[3]
          : `https://www.koenigcarpet.ru${product.images[3]}`)
      : ''

    // Product page URL
    const productUrl = `https://www.koenigcarpet.ru/ru/rugs/${product.id}`

    return {
      'Наименование': nameRu,
      'Цена': priceRub,
      'Ссылка на товар на сайте магазина': productUrl,
      'Ссылка на картинку': imageUrl,
      'Описание': descriptionRu,
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(data)

  // Column widths
  worksheet['!cols'] = [
    { wch: 50 },  // Наименование
    { wch: 15 },  // Цена
    { wch: 65 },  // Ссылка на товар на сайте магазина
    { wch: 65 },  // Ссылка на картинку
    { wch: 120 }, // Описание (увеличено для полного текста)
  ];

  // Auto-filter для всех колонок
  if (data.length > 0) {
    worksheet['!autofilter'] = { ref: `A1:E${data.length + 1}` };
  }

  // Стили для заголовков (первая строка)
  const headerStyle = {
    font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "366092" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true }
  };

  // Применяем стили к заголовкам
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = headerStyle;
  }

  // Выравнивание для колонки "Цена" (по центру)
  for (let row = 1; row <= data.length; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 }); // Цена - 2-я колонка (индекс 1)
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        alignment: { horizontal: "center", vertical: "center" },
        numFmt: '#,##0 ₽'
      };
    }
  }

  // Перенос текста для описания
  for (let row = 1; row <= data.length; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 4 }); // Описание - 5-я колонка (индекс 4)
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        alignment: { wrapText: true, vertical: "top" }
      };
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары в наличии')

  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  })

  return buffer as Buffer
}

export async function exportProductsToExcelYandex(products: ProductWithNames[], eurToRubRate: number = 105): Promise<Buffer> {
  const data = products.map(product => {
    const nameRu = product.productNames.find(n => n.locale === 'ru')?.name || ''
    const descriptionRu = product.descriptions.find(d => d.locale === 'ru')?.description || ''

    // Calculate price for default size (if exists) or base price (for smallest size)
    const basePrice = typeof product.price === 'string'
      ? parseFloat(product.price.replace(/,/g, ''))
      : parseFloat(product.price || '0')

    // Если есть размеры и defaultSize, рассчитываем цену для defaultSize
    let priceEur = basePrice
    if (product.sizes && product.sizes.length > 0 && product.defaultSize) {
      priceEur = calculateRugPrice(basePrice, product.sizes, product.defaultSize)
    }

    const priceRub = Math.round(priceEur * eurToRubRate * 1.02)

    // Get 4th image URL (index 3)
    const imageUrl = product.images[3]
      ? (product.images[3].startsWith('http')
          ? product.images[3]
          : `https://www.koenigcarpet.ru${product.images[3]}`)
      : ''

    // Product page URL
    const productUrl = `https://www.koenigcarpet.ru/ru/rugs/${product.id}`

    return {
      'Категория': 'ковры',
      'Название': nameRu,
      'Идентификатор': product.productCode || '',
      'Описание': descriptionRu,
      'Короткое описание': `Ковёр ${nameRu}`,
      'Цена': priceRub,
      'Фото': imageUrl,
      'Популярный': 'да',
      'В наличии': 'да',
      'Количество': 1,
      'Единица измерения': 'шт',
      'Ссылка': productUrl,
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(data)

  // Column widths
  worksheet['!cols'] = [
    { wch: 15 },  // Категория
    { wch: 50 },  // Название
    { wch: 20 },  // Идентификатор
    { wch: 120 }, // Описание
    { wch: 20 },  // Короткое описание
    { wch: 15 },  // Цена
    { wch: 65 },  // Фото
    { wch: 12 },  // Популярный
    { wch: 12 },  // В наличии
    { wch: 12 },  // Количество
    { wch: 18 },  // Единица измерения
    { wch: 65 },  // Ссылка
  ];

  // Auto-filter для всех колонок
  if (data.length > 0) {
    worksheet['!autofilter'] = { ref: `A1:L${data.length + 1}` };
  }

  // Стили для заголовков (первая строка)
  const headerStyle = {
    font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "366092" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true }
  };

  // Применяем стили к заголовкам
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = headerStyle;
  }

  // Выравнивание для колонки "Цена" (по центру)
  for (let row = 1; row <= data.length; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 5 }); // Цена - 6-я колонка (индекс 5)
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        alignment: { horizontal: "center", vertical: "center" },
        numFmt: '#,##0 ₽'
      };
    }
  }

  // Перенос текста для описания
  for (let row = 1; row <= data.length; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 3 }); // Описание - 4-я колонка (индекс 3)
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        alignment: { wrapText: true, vertical: "top" }
      };
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары для Яндекс')

  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  })

  return buffer as Buffer
}
