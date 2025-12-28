import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface JsonProduct {
  id: number
  product_name: { en: string; ru: string; tr?: string }
  description: { en: string; ru: string; tr?: string }
  features: {
    en: { head: string; care_and_warranty: string[]; technical_info: string[] }
    ru: { head: string; care_and_warranty: string[]; technical_info: string[] }
    tr?: any
  }
  color: { en: string; ru: string; tr?: string; value: string }
  collection: { en: string; ru: string; tr?: string; value: string }
  style: { en: string; ru: string; tr?: string; value: string }
  sizes: string[]
  defaultSize?: string
  product_code: string
  price: string
  images: string[]
  isNew: boolean
  isRunners: boolean
  inStock: boolean
}

async function main() {
  console.log('🌱 Adding specific products to database...')

  // Target product codes
  const targetCodes = ['2024-E-5051', '2025-C-1841']

  // Load products from JSON
  console.log('📦 Loading products from JSON...')
  const jsonPath = path.join(process.cwd(), 'src', 'context', 'data.json')
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as JsonProduct[]

  // Filter only target products
  const targetProducts = jsonData.filter(p => targetCodes.includes(p.product_code))

  console.log(`📊 Found ${targetProducts.length} target products`)

  let processed = 0
  const addedProducts: string[] = []

  for (const jsonProduct of targetProducts) {
    try {
      console.log(`\n🔄 Processing ${jsonProduct.product_code}...`)

      // Check if product already exists
      const existing = await prisma.product.findFirst({
        where: { productCode: jsonProduct.product_code }
      })

      if (existing) {
        console.log(`⚠️  Product ${jsonProduct.product_code} already exists (ID: ${existing.id}), skipping...`)
        continue
      }

      // Create main product
      const product = await prisma.product.create({
        data: {
          productCode: jsonProduct.product_code,
          price: jsonProduct.price,
          sizes: jsonProduct.sizes,
          defaultSize: jsonProduct.defaultSize || jsonProduct.sizes[0] || null,
          images: jsonProduct.images,
          isNew: jsonProduct.isNew,
          isRunners: jsonProduct.isRunners,
          inStock: jsonProduct.inStock,
        },
      })

      console.log(`✅ Product created with ID: ${product.id}`)

      // Create localized data
      const locales = ['en', 'ru'] as const

      for (const locale of locales) {
        // Product names
        await prisma.productName.create({
          data: {
            productId: product.id,
            locale,
            name: jsonProduct.product_name[locale],
          },
        })

        // Descriptions
        await prisma.description.create({
          data: {
            productId: product.id,
            locale,
            description: jsonProduct.description[locale],
          },
        })

        // Features - convert from snake_case to camelCase
        await prisma.feature.create({
          data: {
            productId: product.id,
            locale,
            head: jsonProduct.features[locale].head,
            careAndWarranty: jsonProduct.features[locale].care_and_warranty,
            technicalInfo: jsonProduct.features[locale].technical_info,
          },
        })

        // Colors
        await prisma.productColor.create({
          data: {
            productId: product.id,
            locale,
            name: jsonProduct.color[locale],
            value: jsonProduct.color.value,
          },
        })

        // Collections
        await prisma.productCollection.create({
          data: {
            productId: product.id,
            locale,
            name: jsonProduct.collection[locale],
            value: jsonProduct.collection.value,
          },
        })

        // Styles
        await prisma.productStyle.create({
          data: {
            productId: product.id,
            locale,
            name: jsonProduct.style[locale],
            value: jsonProduct.style.value,
          },
        })
      }

      processed++
      addedProducts.push(jsonProduct.product_code)
      console.log(`✅ Product ${jsonProduct.product_code} added successfully`)
    } catch (error) {
      console.error(`❌ Error processing product ${jsonProduct.product_code}:`, error)
    }
  }

  console.log(`\n🎉 Process completed! Added ${processed} products`)

  if (addedProducts.length > 0) {
    console.log('\nAdded products:')
    addedProducts.forEach(code => {
      console.log(`- ${code}`)
    })
  } else {
    console.log('\n✅ All target products already exist in database')
  }
}

main()
  .catch((e) => {
    console.error('❌ Process failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
