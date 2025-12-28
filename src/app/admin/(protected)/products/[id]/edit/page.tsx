import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/admin/ProductForm'

interface Props {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  const productId = parseInt(id)
  if (isNaN(productId)) {
    return null
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

  return product
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Редактировать товар</h1>
        <p className="text-gray-600 mt-2">
          Обновите информацию о товаре с многоязычной поддержкой
        </p>
      </div>

      <ProductForm product={JSON.parse(JSON.stringify(product))} />
    </div>
  )
}
