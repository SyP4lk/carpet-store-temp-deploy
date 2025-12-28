import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const productCodesParam = url.searchParams.get('productCodes')

    if (!productCodesParam) {
      return NextResponse.json({ error: 'Product codes are required' }, { status: 400 })
    }

    // Разделяем коды по запятой
    const productCodes = productCodesParam.split(',').filter(code => code.trim())

    if (productCodes.length === 0) {
      return NextResponse.json({ error: 'No valid product codes provided' }, { status: 400 })
    }

    // Один запрос в БД для всех товаров
    const products = await prisma.product.findMany({
      where: {
        productCode: {
          in: productCodes
        }
      },
      select: {
        productCode: true,
        inStock: true
      }
    })

    // Преобразуем в объект { productCode: inStock }
    const stockData = products.reduce((acc, product) => {
      acc[product.productCode] = product.inStock
      return acc
    }, {} as Record<string, boolean>)

    return NextResponse.json(stockData)

  } catch (error) {
    console.error('Batch stock check error:', error)
    return NextResponse.json(
      { error: 'Failed to check stock status' },
      { status: 500 }
    )
  }
}
