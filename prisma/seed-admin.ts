import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123456', 10)

  const admin = await prisma.user.upsert({
where: { email: 'admin@koenigcarpet.ru' },
    update: {},
    create: {
      email: 'admin@koenigcarpet.ru',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:')
  console.log('Email:', admin.email)
  console.log('Password: admin123456')
  console.log('Role:', admin.role)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
