import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

// Schema for product creation/update
const productSchema = z.object({
  productCode: z.string().min(1),
  price: z.string(),
  sizes: z.array(z.string()),
  defaultSize: z.string().optional(),
  images: z.array(z.string()),
  isNew: z.boolean().default(false),
  isRunners: z.boolean().default(false),
  inStock: z.boolean().default(true),
  productNames: z.object({
    en: z.string().min(1),
    ru: z.string().min(1),
  }),
  descriptions: z.object({
    en: z.string().min(1),
    ru: z.string().min(1),
  }),
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
  }),
  color: z.object({
    en: z.string().min(1),
    ru: z.string().min(1),
    value: z.string().min(1),
  }),
  collection: z.object({
    en: z.string().min(1),
    ru: z.string().min(1),
    value: z.string().min(1),
  }),
  style: z.object({
    en: z.string().min(1),
    ru: z.string().min(1),
    value: z.string().min(1),
  }),
})

// GET /api/admin/products - List products with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const inStockParam = searchParams.get('inStock')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Add search filter
    if (search) {
      where.OR = [
        { productCode: { contains: search, mode: 'insensitive' as const } },
        {
          productNames: {
            some: {
              name: { contains: search, mode: 'insensitive' as const },
            },
          },
        },
      ]
    }

    // Add inStock filter
    if (inStockParam === 'true') {
      where.inStock = true
    } else if (inStockParam === 'false') {
      where.inStock = false
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          // Загружаем только productNames для списка (остальное не используется)
          productNames: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        productCode: validatedData.productCode,
        price: validatedData.price,
        sizes: validatedData.sizes,
        defaultSize: validatedData.defaultSize || null,
        images: validatedData.images,
        isNew: validatedData.isNew,
        isRunners: validatedData.isRunners,
        inStock: validatedData.inStock,
        productNames: {
          create: [
            { locale: 'en', name: validatedData.productNames.en },
            { locale: 'ru', name: validatedData.productNames.ru },
          ],
        },
        descriptions: {
          create: [
            { locale: 'en', description: validatedData.descriptions.en },
            { locale: 'ru', description: validatedData.descriptions.ru },
          ],
        },
        features: {
          create: [
            {
              locale: 'en',
              head: validatedData.features.en.head,
              careAndWarranty: validatedData.features.en.careAndWarranty,
              technicalInfo: validatedData.features.en.technicalInfo,
            },
            {
              locale: 'ru',
              head: validatedData.features.ru.head,
              careAndWarranty: validatedData.features.ru.careAndWarranty,
              technicalInfo: validatedData.features.ru.technicalInfo,
            },
          ],
        },
        colors: {
          create: [
            { locale: 'en', name: validatedData.color.en, value: validatedData.color.value },
            { locale: 'ru', name: validatedData.color.ru, value: validatedData.color.value },
          ],
        },
        collections: {
          create: [
            { locale: 'en', name: validatedData.collection.en, value: validatedData.collection.value },
            { locale: 'ru', name: validatedData.collection.ru, value: validatedData.collection.value },
          ],
        },
        styles: {
          create: [
            { locale: 'en', name: validatedData.style.en, value: validatedData.style.value },
            { locale: 'ru', name: validatedData.style.ru, value: validatedData.style.value },
          ],
        },
      },
      include: {
        productNames: true,
        descriptions: true,
        features: true,
        colors: true,
        collections: true,
        styles: true,
      },
    })

    // Revalidate all product-related pages after creation
    revalidatePath('/', 'layout')
    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]/[filter]', 'page')
    revalidatePath(`/[locale]/rugs/${product.id}`, 'page') // Новая страница товара
    revalidateTag('products')

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}