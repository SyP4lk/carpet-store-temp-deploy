import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

const removeStockSchema = z.object({
  productCode: z.string().min(1, 'Product code is required'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productCode } = removeStockSchema.parse(body)

    const existingProduct = await prisma.product.findUnique({
      where: { productCode }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found in database' },
        { status: 404 }
      )
    }

    const updated = await prisma.product.update({
      where: { productCode },
      data: { inStock: false },
      include: {
        productNames: true,
        descriptions: true,
        features: true,
        colors: true,
        collections: true,
        styles: true,
      }
    })

    // Revalidate all product-related pages
    revalidatePath('/', 'layout')
    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]/[filter]', 'page')
    revalidateTag('products')

    return NextResponse.json({
      message: 'Product removed from stock',
      product: updated
    })

  } catch (error) {
    console.error('Remove from stock error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
