import { PrismaClient } from '@prisma/client'
import data from '../src/context/data.json'

const prisma = new PrismaClient()

interface JsonProduct {
  id: number
  product_code: string
  product_name: { en: string; ru: string; tr: string }
  description: { en: string; ru: string; tr: string }
  features: {
    en: { head: string; care_and_warranty: string[]; technical_info: string[] }
    ru: { head: string; care_and_warranty: string[]; technical_info: string[] }
    tr: { head: string; care_and_warranty: string[]; technical_info: string[] }
  }
  color: { en: string; ru: string; tr: string; value: string }
  collection: { en: string; ru: string; tr: string; value: string }
  style: { en: string; ru: string; tr: string; value: string }
  price: string
  sizes: string[]
  images: string[]
  isNew: boolean
  isRunners: boolean
  inStock: boolean
}

async function migrateData() {
  console.log('Starting data migration...')
  console.log(`Total products to migrate: ${data.length}`)

  let successCount = 0
  let errorCount = 0

  for (const item of data as JsonProduct[]) {
    try {
      await prisma.product.upsert({
        where: { productCode: item.product_code },
        update: {
          price: item.price,
          sizes: item.sizes || [],
          images: item.images || [],
          isNew: item.isNew || false,
          isRunners: item.isRunners || false,
          inStock: item.inStock || false,
        },
        create: {
          productCode: item.product_code,
          price: item.price,
          sizes: item.sizes || [],
          images: item.images || [],
          isNew: item.isNew || false,
          isRunners: item.isRunners || false,
          inStock: item.inStock || false,
          productNames: {
            create: [
              { locale: 'en', name: item.product_name.en },
              { locale: 'ru', name: item.product_name.ru },
              { locale: 'tr', name: item.product_name.tr },
            ],
          },
          descriptions: {
            create: [
              { locale: 'en', description: item.description.en },
              { locale: 'ru', description: item.description.ru },
              { locale: 'tr', description: item.description.tr },
            ],
          },
          features: {
            create: [
              {
                locale: 'en',
                head: item.features.en.head,
                careAndWarranty: item.features.en.care_and_warranty || [],
                technicalInfo: item.features.en.technical_info || [],
              },
              {
                locale: 'ru',
                head: item.features.ru.head,
                careAndWarranty: item.features.ru.care_and_warranty || [],
                technicalInfo: item.features.ru.technical_info || [],
              },
              {
                locale: 'tr',
                head: item.features.tr.head,
                careAndWarranty: item.features.tr.care_and_warranty || [],
                technicalInfo: item.features.tr.technical_info || [],
              },
            ],
          },
          colors: {
            create: [
              { locale: 'en', name: item.color.en, value: item.color.value },
              { locale: 'ru', name: item.color.ru, value: item.color.value },
              { locale: 'tr', name: item.color.tr, value: item.color.value },
            ],
          },
          collections: {
            create: [
              { locale: 'en', name: item.collection.en, value: item.collection.value },
              { locale: 'ru', name: item.collection.ru, value: item.collection.value },
              { locale: 'tr', name: item.collection.tr, value: item.collection.value },
            ],
          },
          styles: {
            create: [
              { locale: 'en', name: item.style.en, value: item.style.value },
              { locale: 'ru', name: item.style.ru, value: item.style.value },
              { locale: 'tr', name: item.style.tr, value: item.style.value },
            ],
          },
        },
      })

      successCount++
      if (successCount % 100 === 0) {
        console.log(`Migrated ${successCount} products...`)
      }
    } catch (error) {
      errorCount++
      console.error(`Error migrating product ${item.product_code}:`, error)
    }
  }

  console.log('\n=== Migration Complete ===')
  console.log(`✅ Successfully migrated: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
}

migrateData()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
