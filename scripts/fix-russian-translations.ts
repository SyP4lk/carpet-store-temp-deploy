import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'src/context/data.json')

// Словарь переводов английских фраз на русский
const translations: Record<string, string> = {
  'It is a flat woven rug.': 'Это плоский тканый ковер.',
  'Produced with hand craftsmanship on special looms.': 'Изготовлено вручную на специальных станках.',
  'Thickness is 7 mm.': 'Толщина — 7 мм.',
  'Made of acrylic, cotton, and viscose materials.': 'Изготовлено из акрила, хлопка и вискозы.',
  'Suitable for use throughout the year.': 'Подходит для использования круглый год.',
}

console.log('🔄 Fixing Russian translations in data.json...\n')

// Читаем файл
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

let totalFixed = 0
let productsAffected = 0

// Проходим по всем товарам
data.forEach((product: any, index: number) => {
  let productFixed = false

  if (product.features?.ru?.technical_info) {
    const originalLength = product.features.ru.technical_info.length

    product.features.ru.technical_info = product.features.ru.technical_info.map((text: string) => {
      if (translations[text]) {
        totalFixed++
        productFixed = true
        return translations[text]
      }
      return text
    })

    if (productFixed && (index + 1) % 100 === 0) {
      console.log(`✅ Processed ${index + 1} products...`)
    }
  }

  if (productFixed) {
    productsAffected++
  }
})

// Сохраняем обновленный файл
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8')

console.log('\n📊 Summary:')
console.log(`✅ Total strings fixed: ${totalFixed}`)
console.log(`📦 Products affected: ${productsAffected}`)
console.log('✨ File updated successfully!')
