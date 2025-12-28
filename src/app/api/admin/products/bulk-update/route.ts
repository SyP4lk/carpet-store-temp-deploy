import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

const bulkUpdateSchema = z.object({
  productIds: z.array(z.number()).min(1),
  updates: z.object({
    inStock: z.boolean().optional(),
    isNew: z.boolean().optional(),
    isRunners: z.boolean().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one update field is required"
  })
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productIds, updates } = bulkUpdateSchema.parse(body)

    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: productIds
        }
      },
      data: updates
    })

    // Revalidate all product-related pages after bulk update
    revalidatePath('/', 'layout')
    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]/[filter]', 'page')
    revalidateTag('products')

    return NextResponse.json({
      success: true,
      updatedCount: result.count
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
