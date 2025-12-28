import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Исправление коллекций Trinity и Naturale...')

  // 1. Исправляем опечатку: trinty -> trinity
  console.log('\n1️⃣ Исправление trinty -> trinity...')
  const trintyCollections = await prisma.productCollection.findMany({
    where: { value: 'trinty' }
  })

  console.log(`Найдено ${trintyCollections.length} записей с 'trinty'`)

  for (const collection of trintyCollections) {
    await prisma.productCollection.update({
      where: { id: collection.id },
      data: { value: 'trinity' }
    })
  }

  console.log(`✅ Исправлено ${trintyCollections.length} записей trinty -> trinity`)

  // 2. Добавляем цены для naturale (используем цену как у trinty = 560€)
  console.log('\n2️⃣ Добавление цен для naturale...')
  const naturaleProducts = await prisma.product.findMany({
    where: {
      collections: {
        some: {
          value: 'naturale'
        }
      },
      OR: [
        { price: '' },
        { price: '0' }
      ]
    }
  })

  console.log(`Найдено ${naturaleProducts.length} товаров naturale без цены`)

  const NATURALE_PRICE = '480.00' // Цена для naturale (можете изменить)

  for (const product of naturaleProducts) {
    await prisma.product.update({
      where: { id: product.id },
      data: { price: NATURALE_PRICE }
    })
  }

  console.log(`✅ Обновлено ${naturaleProducts.length} товаров naturale с ценой ${NATURALE_PRICE}€`)

  console.log('\n🎉 Готово! Коллекции Trinity и Naturale исправлены')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })