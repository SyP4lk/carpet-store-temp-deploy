import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

const productUpdateSchema = z.object({
  productCode: z.string().min(1).optional(),
  price: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  defaultSize: z.string().optional(),
  images: z.array(z.string()).optional(),
  isNew: z.boolean().optional(),
  isRunners: z.boolean().optional(),
  inStock: z.boolean().optional(),
  productNames: z.object({
    en: z.string().min(1),
    ru: z.string().min(1),
  }).optional(),
  descriptions: z.object({
    en: z.string().min(1),
    ru: z.string().min(1),
  }).optional(),
  features: z.object({
    en: z.object({
      head: z.string(),
      careAndWarranty: z.array(z.string()),
      technicalInfo: z.array(z.string()),
    }),
    ru: z.object({
      head: z.string(),
      careAndWarranty: z.array(z.string()),
      technicalInfo: z.array(z.string()),
    }),
  }).optional(),
  color: z.object({
    en: z.string().min(1),
    ru: z.string().min(1),
    value: z.string().min(1),
  }).optional(),
  collection: z.object({
    en: z.string().min(1),
    ru: z.string().min(1),
    value: z.string().min(1),
  }).optional(),
  style: z.object({
    en: z.string().min(1),
    ru: z.string().min(1),
    value: z.string().min(1),
  }).optional(),
})

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const productId = parseInt(id)
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productNames: true,
        descriptions: true,
        features: true,
        colors: true,
        collections: true,
        styles: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const productId = parseInt(id)
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = productUpdateSchema.parse(body)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Update the product
    const updateData: any = {}

    // Update basic fields
    if (validatedData.productCode) updateData.productCode = validatedData.productCode
    if (validatedData.price) updateData.price = validatedData.price
    if (validatedData.sizes) updateData.sizes = validatedData.sizes
    if (validatedData.defaultSize !== undefined) {
      updateData.defaultSize = validatedData.defaultSize || null
      console.log('[ADMIN] Updating defaultSize:', validatedData.defaultSize, '→', updateData.defaultSize)
    }
    if (validatedData.images) updateData.images = validatedData.images
    if (validatedData.isNew !== undefined) updateData.isNew = validatedData.isNew
    if (validatedData.isRunners !== undefined) updateData.isRunners = validatedData.isRunners
    if (validatedData.inStock !== undefined) updateData.inStock = validatedData.inStock

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        productNames: true,
        descriptions: true,
        features: true,
        colors: true,
        collections: true,
        styles: true,
      },
    })

    // Update localized data if provided
    if (validatedData.productNames) {
      await Promise.all([
        prisma.productName.upsert({
          where: { productId_locale: { productId, locale: 'en' } },
          update: { name: validatedData.productNames.en },
          create: { productId, locale: 'en', name: validatedData.productNames.en },
        }),
        prisma.productName.upsert({
          where: { productId_locale: { productId, locale: 'ru' } },
          update: { name: validatedData.productNames.ru },
          create: { productId, locale: 'ru', name: validatedData.productNames.ru },
        }),
      ])
    }

    // Update descriptions
    if (validatedData.descriptions) {
      await Promise.all([
        prisma.description.upsert({
          where: { productId_locale: { productId, locale: 'en' } },
          update: { description: validatedData.descriptions.en },
          create: { productId, locale: 'en', description: validatedData.descriptions.en },
        }),
        prisma.description.upsert({
          where: { productId_locale: { productId, locale: 'ru' } },
          update: { description: validatedData.descriptions.ru },
          create: { productId, locale: 'ru', description: validatedData.descriptions.ru },
        }),
      ])
    }

    // Update features
    if (validatedData.features) {
      await Promise.all([
        prisma.feature.upsert({
          where: { productId_locale: { productId, locale: 'en' } },
          update: {
            head: validatedData.features.en.head,
            careAndWarranty: validatedData.features.en.careAndWarranty,
            technicalInfo: validatedData.features.en.technicalInfo,
          },
          create: {
            productId,
            locale: 'en',
            head: validatedData.features.en.head,
            careAndWarranty: validatedData.features.en.careAndWarranty,
            technicalInfo: validatedData.features.en.technicalInfo,
          },
        }),
        prisma.feature.upsert({
          where: { productId_locale: { productId, locale: 'ru' } },
          update: {
            head: validatedData.features.ru.head,
            careAndWarranty: validatedData.features.ru.careAndWarranty,
            technicalInfo: validatedData.features.ru.technicalInfo,
          },
          create: {
            productId,
            locale: 'ru',
            head: validatedData.features.ru.head,
            careAndWarranty: validatedData.features.ru.careAndWarranty,
            technicalInfo: validatedData.features.ru.technicalInfo,
          },
        }),
      ])
    }

    // Update colors
    if (validatedData.color) {
      await Promise.all([
        prisma.productColor.upsert({
          where: { productId_locale: { productId, locale: 'en' } },
          update: { name: validatedData.color.en, value: validatedData.color.value },
          create: { productId, locale: 'en', name: validatedData.color.en, value: validatedData.color.value },
        }),
        prisma.productColor.upsert({
          where: { productId_locale: { productId, locale: 'ru' } },
          update: { name: validatedData.color.ru, value: validatedData.color.value },
          create: { productId, locale: 'ru', name: validatedData.color.ru, value: validatedData.color.value },
        }),
      ])
    }

    // Update collections
    if (validatedData.collection) {
      await Promise.all([
        prisma.productCollection.upsert({
          where: { productId_locale: { productId, locale: 'en' } },
          update: { name: validatedData.collection.en, value: validatedData.collection.value },
          create: { productId, locale: 'en', name: validatedData.collection.en, value: validatedData.collection.value },
        }),
        prisma.productCollection.upsert({
          where: { productId_locale: { productId, locale: 'ru' } },
          update: { name: validatedData.collection.ru, value: validatedData.collection.value },
          create: { productId, locale: 'ru', name: validatedData.collection.ru, value: validatedData.collection.value },
        }),
      ])
    }

    // Update styles
    if (validatedData.style) {
      await Promise.all([
        prisma.productStyle.upsert({
          where: { productId_locale: { productId, locale: 'en' } },
          update: { name: validatedData.style.en, value: validatedData.style.value },
          create: { productId, locale: 'en', name: validatedData.style.en, value: validatedData.style.value },
        }),
        prisma.productStyle.upsert({
          where: { productId_locale: { productId, locale: 'ru' } },
          update: { name: validatedData.style.ru, value: validatedData.style.value },
          create: { productId, locale: 'ru', name: validatedData.style.ru, value: validatedData.style.value },
        }),
      ])
    }

    // Revalidate all product-related pages
    try {
      revalidatePath('/', 'layout')
      revalidatePath('/en', 'layout')
      revalidatePath('/ru', 'layout')
      revalidatePath(`/en/rugs/${productId}`, 'page')
      revalidatePath(`/ru/rugs/${productId}`, 'page')
      revalidatePath('/en/rugs', 'page')
      revalidatePath('/ru/rugs', 'page')
      revalidateTag('products')
      console.log('[ADMIN] Cache revalidated for product:', productId)
    } catch (revalidateError) {
      console.error('[ADMIN] Revalidation error:', revalidateError)
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const productId = parseInt(id)
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete the product (cascade will handle related data)
    await prisma.product.delete({
      where: { id: productId },
    })

    // Revalidate all product-related pages after deletion
    revalidatePath('/', 'layout')
    revalidatePath('/[locale]', 'layout')
    revalidatePath(`/[locale]/rugs/${productId}`)
    revalidatePath('/[locale]/[filter]', 'page')
    revalidateTag('products')

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}