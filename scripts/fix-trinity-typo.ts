import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Исправление опечатки trinty -> trinity в базе данных...')

  // Исправляем опечатку: trinty -> trinity
  const trintyCollections = await prisma.productCollection.findMany({
    where: { value: 'trinty' }
  })

  console.log(`📊 Найдено ${trintyCollections.length} записей с опечаткой 'trinty'`)

  if (trintyCollections.length === 0) {
    console.log('✅ Опечаток не найдено, все уже исправлено!')
    return
  }

  for (const collection of trintyCollections) {
    await prisma.productCollection.update({
      where: { id: collection.id },
      data: { value: 'trinity' }
    })
  }

  console.log(`✅ Исправлено ${trintyCollections.length} записей trinty -> trinity`)
  console.log('🎉 Готово! Теперь товары коллекции Trinity будут отображаться на сайте')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })