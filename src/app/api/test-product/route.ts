import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        productCode: true,
        defaultSize: true,
        sizes: true,
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product,
      debug: {
        defaultSizeType: typeof product.defaultSize,
        defaultSizeValue: product.defaultSize,
        defaultSizeIsNull: product.defaultSize === null,
        defaultSizeIsEmpty: product.defaultSize === '',
        sizesCount: product.sizes?.length || 0,
      }
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ error: 'Internal error', details: String(error) }, { status: 500 })
  }
}
