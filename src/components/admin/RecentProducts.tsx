import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function RecentProducts() {
  try {
    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        productNames: {
          where: { locale: 'en' }
        }
      }
    })

    if (recentProducts.length === 0) {
      return (
        <div className="text-gray-500 text-center py-8">
          Товары не найдены. Добавьте свой первый товар!
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {recentProducts.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">
                {product.productNames[0]?.name || 'Без названия'}
              </h4>
              <p className="text-sm text-gray-500">
                Код: {product.productCode} | Цена: ${product.price}
              </p>
            </div>
            <div className="flex gap-2">
              {product.isNew && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Новый
                </span>
              )}
              {product.inStock ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  В наличии
                </span>
              ) : (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                  Нет в наличии
                </span>
              )}
            </div>
          </div>
        ))}

        <Link
          href="/admin/products"
          className="block text-center text-blue-600 hover:text-blue-800 mt-4"
        >
          Посмотреть все товары →
        </Link>
      </div>
    )
  } catch (error) {
    console.error('Recent products error:', error)
    return (
      <div className="text-red-600">
        Ошибка загрузки последних товаров. Проверьте подключение к базе данных.
      </div>
    )
  }
}