import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import data from '@/context/data.json'
import { RugProduct } from '@/types/product'

const addStockSchema = z.object({
  productCode: z.string().min(1, 'Product code is required'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productCode } = addStockSchema.parse(body)

    const sourceProduct = (data as RugProduct[]).find(
      (p) => p.product_code === productCode
    )

    if (!sourceProduct) {
      return NextResponse.json(
        { error: 'Product not found in catalog' },
        { status: 404 }
      )
    }

    const existingProduct = await prisma.product.findUnique({
      where: { productCode }
    })

    if (existingProduct) {
      const updated = await prisma.product.update({
        where: { productCode },
        data: { inStock: true },
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
        message: 'Product marked as in stock',
        product: updated
      })
    }

    const newProduct = await prisma.product.create({
      data: {
        productCode: sourceProduct.product_code,
        price: sourceProduct.price,
        sizes: sourceProduct.sizes,
        images: sourceProduct.images,
        isNew: sourceProduct.isNew || false,
        isRunners: sourceProduct.isRunners || false,
        inStock: true,
        productNames: {
          create: [
            { locale: 'en', name: sourceProduct.product_name.en },
            { locale: 'ru', name: sourceProduct.product_name.ru },
          ],
        },
        descriptions: {
          create: [
            { locale: 'en', description: sourceProduct.description.en },
            { locale: 'ru', description: sourceProduct.description.ru },
          ],
        },
        features: {
          create: [
            {
              locale: 'en',
              head: sourceProduct.features.en.head,
              careAndWarranty: sourceProduct.features.en.care_and_warranty,
              technicalInfo: sourceProduct.features.en.technical_info,
            },
            {
              locale: 'ru',
              head: sourceProduct.features.ru.head,
              careAndWarranty: sourceProduct.features.ru.care_and_warranty,
              technicalInfo: sourceProduct.features.ru.technical_info,
            },
          ],
        },
        colors: {
          create: [
            { locale: 'en', name: sourceProduct.color.en, value: sourceProduct.color.value },
            { locale: 'ru', name: sourceProduct.color.ru, value: sourceProduct.color.value },
          ],
        },
        collections: {
          create: [
            { locale: 'en', name: sourceProduct.collection.en, value: sourceProduct.collection.value },
            { locale: 'ru', name: sourceProduct.collection.ru, value: sourceProduct.collection.value },
          ],
        },
        styles: {
          create: [
            { locale: 'en', name: sourceProduct.style.en, value: sourceProduct.style.value },
            { locale: 'ru', name: sourceProduct.style.ru, value: sourceProduct.style.value },
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

    // Revalidate all product-related pages
    revalidatePath('/', 'layout')
    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]/[filter]', 'page')
    revalidateTag('products')

    return NextResponse.json({
      message: 'Product added to stock',
      product: newProduct
    }, { status: 201 })

  } catch (error) {
    console.error('Add to stock error:', error)
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
