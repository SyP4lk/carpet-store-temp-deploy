import { prisma } from './prisma'

export async function initializeDatabase() {
  try {
    const count = await prisma.product.count()

    if (count === 0) {
      console.log('⚠️  Database is empty. Please run migration:')
      console.log('   npm run db:migrate')
      return false
    }

    console.log(`✅ Database initialized: ${count} products loaded`)
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}
