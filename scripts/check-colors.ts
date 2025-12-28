import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkColors() {
  try {
    // Получаем все уникальные цвета
    const colorRecords = await prisma.productColor.findMany({
      distinct: ['value']
    });

    const colors = new Set<string>();
    colorRecords.forEach(c => {
      colors.add(c.value);
    });

    console.log('Уникальные цвета в базе данных:');
    console.log(Array.from(colors).sort());

    const hasOrange = Array.from(colors).includes('orange');
    const hasGreen = Array.from(colors).includes('green');

    console.log('\n✅ Orange:', hasOrange);
    console.log('✅ Green:', hasGreen);

    if (hasOrange && hasGreen) {
      console.log('\n✅ Цвета orange и green найдены в базе данных!');
    } else {
      console.log('\n❌ Цвета orange и/или green НЕ найдены в базе данных. Нужно запустить seed.');
    }

    // Проверяем количество товаров с этими цветами
    if (hasOrange || hasGreen) {
      const orangeCount = await prisma.productColor.count({
        where: { value: 'orange' }
      });
      const greenCount = await prisma.productColor.count({
        where: { value: 'green' }
      });
      console.log(`\nКоличество товаров:\n- Orange: ${orangeCount}\n- Green: ${greenCount}`);
    }

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkColors();
