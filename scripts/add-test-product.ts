import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding test product 5108-M-999-5820-4618-7141...')

  try {
    // Create main product
    const product = await prisma.product.create({
      data: {
        productCode: '5108-M-999-5820-4618-7141',
        price: '450.00',
        sizes: ['80x150 cm', '120x170 cm', '160x230 cm', '200x290 cm'],
        defaultSize: '160x230 cm',
        images: [
          'https://picsum.photos/seed/5108-1/800/1000',
          'https://picsum.photos/seed/5108-2/800/1000',
          'https://picsum.photos/seed/5108-3/800/1000'
        ],
        isNew: true,
        isRunners: false,
        inStock: true,
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
          name: locale === 'en'
            ? 'TEST CARPET - MULTI COLOR DESIGN'
            : 'ТЕСТОВЫЙ КОВЕР - МНОГОЦВЕТНЫЙ ДИЗАЙН',
        },
      })

      // Descriptions
      await prisma.description.create({
        data: {
          productId: product.id,
          locale,
          description: locale === 'en'
            ? 'This is a test carpet with modern design and high quality materials. Perfect for any room in your home.'
            : 'Это тестовый ковер с современным дизайном и высококачественными материалами. Идеально подходит для любой комнаты в вашем доме.',
        },
      })

      // Features
      await prisma.feature.create({
        data: {
          productId: product.id,
          locale,
          head: locale === 'en'
            ? 'Premium quality test carpet with modern features and easy maintenance.'
            : 'Тестовый ковер премиум качества с современными характеристиками и простым уходом.',
          careAndWarranty: locale === 'en'
            ? [
                'Machine washable at 30°C',
                'Do not bleach',
                'Vacuum regularly',
                'Suitable for robot vacuum',
                'Do not tumble dry'
              ]
            : [
                'Машинная стирка при 30°C',
                'Не отбеливать',
                'Регулярная чистка пылесосом',
                'Подходит для робот-пылесоса',
                'Не сушить в барабане'
              ],
          technicalInfo: locale === 'en'
            ? [
                'Made in Turkey',
                'Material: 100% Polypropylene',
                'Weight: 2400 g/m²',
                'Thickness: 8 mm',
                'Anti-slip backing',
                'Suitable for all rooms'
              ]
            : [
                'Производство: Турция',
                'Материал: 100% полипропилен',
                'Плотность: 2400 г/м²',
                'Толщина: 8 мм',
                'Противоскользящая основа',
                'Подходит для всех комнат'
              ],
        },
      })

      // Colors
      await prisma.productColor.create({
        data: {
          productId: product.id,
          locale,
          name: locale === 'en' ? 'Multi Color' : 'Многоцветный',
          value: 'multicolor',
        },
      })

      // Collections
      await prisma.productCollection.create({
        data: {
          productId: product.id,
          locale,
          name: locale === 'en' ? 'Modern Collection' : 'Современная Коллекция',
          value: 'modern',
        },
      })

      // Styles
      await prisma.productStyle.create({
        data: {
          productId: product.id,
          locale,
          name: locale === 'en' ? 'Contemporary' : 'Современный',
          value: 'contemporary',
        },
      })
    }

    console.log('✅ All localized data created')
    console.log(`\n🎉 Product successfully added!`)
    console.log(`Product ID: ${product.id}`)
    console.log(`Product Code: ${product.productCode}`)
    console.log(`\nView on site:`)
    console.log(`EN: http://localhost:3000/en/rugs/${product.id}`)
    console.log(`RU: http://localhost:3000/ru/rugs/${product.id}`)
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
