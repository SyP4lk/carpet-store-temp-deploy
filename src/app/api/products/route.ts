import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import data from '@/context/data.json'

export async function GET() {
  try {
    const productsInStock = await prisma.product.findMany({
      where: { inStock: true },
      select: { productCode: true }
    })

    const stockCodes = new Set(productsInStock.map(p => p.productCode))

    const mergedData = data.map(product => ({
      ...product,
      inStock: stockCodes.has(product.product_code)
    }))

    return NextResponse.json(mergedData)
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(data.map(p => ({ ...p, inStock: p.inStock || false })))
  }
}
