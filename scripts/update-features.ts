import { PrismaClient } from '@prisma/client'
import data from '../src/context/data.json'

const prisma = new PrismaClient()

interface JsonProduct {
  id: number
  product_code: string
  features: {
    en: { head: string; care_and_warranty: string[]; technical_info: string[] }
    ru: { head: string; care_and_warranty: string[]; technical_info: string[] }
    tr: { head: string; care_and_warranty: string[]; technical_info: string[] }
  }
}

async function updateFeatures() {
  console.log('🔄 Updating features in database...')
  console.log(`Total products: ${data.length}\n`)

  let updated = 0
  let errors = 0

  for (const item of data as JsonProduct[]) {
    try {
      // Найти продукт
      const product = await prisma.product.findUnique({
        where: { productCode: item.product_code },
      })

      if (!product) {
        console.log(`⚠️  Product not found: ${item.product_code}`)
        continue
      }

      // Удалить старые features
      await prisma.feature.deleteMany({
        where: { productId: product.id },
      })

      // Создать новые features
      await prisma.feature.createMany({
        data: [
          {
            productId: product.id,
            locale: 'en',
            head: item.features.en.head,
            careAndWarranty: item.features.en.care_and_warranty || [],
            technicalInfo: item.features.en.technical_info || [],
          },
          {
            productId: product.id,
            locale: 'ru',
            head: item.features.ru.head,
            careAndWarranty: item.features.ru.care_and_warranty || [],
            technicalInfo: item.features.ru.technical_info || [],
          },
          {
            productId: product.id,
            locale: 'tr',
            head: item.features.tr.head,
            careAndWarranty: item.features.tr.care_and_warranty || [],
            technicalInfo: item.features.tr.technical_info || [],
          },
        ],
      })

      updated++
      if (updated % 100 === 0) {
        console.log(`✅ Updated ${updated} products...`)
      }
    } catch (error) {
      errors++
      console.error(`❌ Error updating ${item.product_code}:`, error)
    }
  }

  console.log('\n📊 Summary:')
  console.log(`✅ Updated: ${updated}`)
  console.log(`❌ Errors: ${errors}`)
}

updateFeatures()
  .catch((e) => {
    console.error('Update failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
