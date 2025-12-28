import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProductsTable from '@/components/admin/ProductsTable'
import ProductsSearch from '@/components/admin/ProductsSearch'

interface Props {
  searchParams: Promise<{
    page?: string
    search?: string
    limit?: string
    inStock?: string
  }>
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const limit = parseInt(params.limit || '10')
  const inStock = params.inStock

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Товары</h1>
          <p className="text-gray-600 mt-2">
            Управление инвентарем ковров
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/api/admin/stock/export">
            <Button variant="outline">Экспорт для 2ГИС</Button>
          </Link>
          <Link href="/api/admin/stock/export-yandex">
            <Button variant="outline">Экспорт для Яндекс</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>Добавить новый товар</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список товаров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ProductsSearch initialSearch={search} initialInStock={inStock} />
            <Suspense fallback={<ProductsTableSkeleton />}>
              <ProductsTable
                page={page}
                search={search}
                limit={limit}
                inStock={inStock}
              />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProductsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded mb-2"></div>
        ))}
      </div>
    </div>
  )
}