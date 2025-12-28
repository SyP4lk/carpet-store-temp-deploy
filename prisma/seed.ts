import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface JsonProduct {
  id: number
  product_name: { en: string; ru: string }
  description: { en: string; ru: string }
  features: {
    en: { head: string; care_and_warranty: string[]; technical_info: string[] }
    ru: { head: string; care_and_warranty: string[]; technical_info: string[] }
  }
  color: { en: string; ru: string; value: string }
  collection: { en: string; ru: string; value: string }
  style: { en: string; ru: string; value: string }
  sizes: string[]
  product_code: string
  price: string
  images: string[]
  isNew: boolean
  isRunners: boolean
  inStock: boolean
}

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  console.log('👤 Creating admin user...')
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@koenigcarpet.ru' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@koenigcarpet.ru',
      password: hashedPassword,
      name: 'Admin',
      role: 'SUPER_ADMIN',
    },
  })

  // Load products from JSON
  console.log('📦 Loading products from JSON...')
  const jsonPath = path.join(process.cwd(), 'src', 'context', 'data.json')
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as JsonProduct[]

  console.log(`📊 Found ${jsonData.length} products to migrate`)

  // Migrate products in batches
  const batchSize = 100
  let processed = 0

  for (let i = 0; i < jsonData.length; i += batchSize) {
    const batch = jsonData.slice(i, i + batchSize)

    console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(jsonData.length / batchSize)}`)

    for (const jsonProduct of batch) {
      try {
        // Create main product
        const product = await prisma.product.create({
          data: {
            productCode: jsonProduct.product_code,
            price: jsonProduct.price,
            sizes: jsonProduct.sizes,
            images: jsonProduct.images,
            isNew: jsonProduct.isNew,
            isRunners: jsonProduct.isRunners,
            inStock: jsonProduct.inStock,
          },
        })

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

          // Features
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
        if (processed % 10 === 0) {
          console.log(`✅ Processed ${processed}/${jsonData.length} products`)
        }
      } catch (error) {
        console.error(`❌ Error processing product ${jsonProduct.product_code}:`, error)
      }
    }
  }

  console.log(`🎉 Migration completed! Processed ${processed} products`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })