import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeBrackets() {
  console.log('🔄 Начинаю удаление скобок из артикулов...')

  try {
    // Получаем все товары со скобками
    const products = await prisma.product.findMany({
      where: {
        productCode: {
          startsWith: '('
        }
      },
      select: {
        id: true,
        productCode: true
      }
    })

    console.log(`📦 Найдено товаров со скобками: ${products.length}`)

    let updated = 0
    let deleted = 0
    let errors = 0

    for (const product of products) {
      const originalCode = product.productCode
      const cleanCode = originalCode.replace(/^\(/, '').replace(/\)$/, '')

      try {
        // Проверяем, существует ли товар с таким же кодом без скобок
        const existingProduct = await prisma.product.findUnique({
          where: { productCode: cleanCode }
        })

        if (existingProduct) {
          // Если существует дубликат, удаляем товар со скобками
          await prisma.product.delete({
            where: { id: product.id }
          })
          deleted++
          console.log(`🗑️  Удалён дубликат: ${originalCode} (уже есть ${cleanCode})`)
        } else {
          // Если дубликата нет, просто убираем скобки
          await prisma.product.update({
            where: { id: product.id },
            data: { productCode: cleanCode }
          })
          updated++
          console.log(`✅ Обновлено: ${originalCode} → ${cleanCode}`)
        }
      } catch (error) {
        errors++
        console.error(`❌ Ошибка при обработке ${originalCode}:`, error)
      }
    }

    console.log(`\n✅ Готово!`)
    console.log(`📊 Статистика:`)
    console.log(`   - Обновлено: ${updated}`)
    console.log(`   - Удалено дубликатов: ${deleted}`)
    console.log(`   - Ошибок: ${errors}`)
    console.log(`   - Всего обработано: ${products.length}`)

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

removeBrackets()
