import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exportProductsToExcelYandex } from '@/lib/excel'
import { fetchEURtoRUBRate } from '@/lib/currency'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем актуальный курс EUR/RUB
    const eurToRubRate = await fetchEURtoRUBRate()

    const products = await prisma.product.findMany({
      where: { inStock: true },
      include: {
        productNames: true,
        descriptions: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    const buffer = await exportProductsToExcelYandex(products, eurToRubRate)

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `products-yandex-${timestamp}.xlsx`

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export products' },
      { status: 500 }
    )
  }
}
