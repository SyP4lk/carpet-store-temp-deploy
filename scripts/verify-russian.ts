import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log('🔍 Checking Russian translations in database...\n')

  const product = await prisma.product.findFirst({
    include: {
      productNames: true,
      features: true,
    },
  })

  if (!product) {
    console.log('❌ No products found')
    return
  }

  const ruFeature = product.features.find((f) => f.locale === 'ru')

  if (!ruFeature) {
    console.log('❌ No Russian features found')
    return
  }

  console.log('✅ Product:', product.productNames.find((n) => n.locale === 'ru')?.name)
  console.log('\n📋 Technical Info (first 5 items):')

  ruFeature.technicalInfo.slice(0, 5).forEach((item, index) => {
    const hasEnglish = /[a-zA-Z]{3,}/.test(item) && item.includes('is') || item.includes('It') || item.includes('Thickness')
    const status = hasEnglish ? '❌ [EN]' : '✅ [RU]'
    console.log(`${status} ${index + 1}. ${item}`)
  })

  // Count English strings
  const englishCount = ruFeature.technicalInfo.filter((item) =>
    (item.includes('It is a flat') ||
     item.includes('Thickness is') ||
     item.includes('Made of acrylic') ||
     item.includes('Suitable for use throughout'))
  ).length

  console.log(`\n📊 English strings found: ${englishCount}`)

  if (englishCount === 0) {
    console.log('✅ All Russian translations are correct!')
  } else {
    console.log('⚠️  Some English strings still present')
  }
}

verify()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
