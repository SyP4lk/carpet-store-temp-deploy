'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Product {
  id: number
  productCode: string
  price: string
  inStock: boolean
  isNew: boolean
  createdAt: string
  productNames: Array<{ locale: string; name: string }>
}

interface ProductsTableProps {
  page: number
  search: string
  limit: number
  inStock?: string
}

export default function ProductsTable({ page, search, limit, inStock }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(inStock && { inStock })
        })

        const response = await fetch(`/api/admin/products?${params}`)
        if (!response.ok) throw new Error('Failed to fetch products')

        const data = await response.json()
        setProducts(data.products)
        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [page, search, limit, inStock])

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Не удалось удалить товар')

      setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось удалить товар')
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map(p => p.id))
    }
  }

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkUpdate = async (updates: { inStock?: boolean; isNew?: boolean; isRunners?: boolean }) => {
    if (selectedIds.length === 0) {
      alert('Пожалуйста, выберите хотя бы один товар')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedIds,
          updates
        })
      })

      if (!response.ok) throw new Error('Не удалось выполнить массовое обновление')

      const data = await response.json()
      alert(`Успешно обновлено ${data.updatedCount} товаров`)

      setProducts(products.map(p =>
        selectedIds.includes(p.id) ? { ...p, ...updates } : p
      ))
      setSelectedIds([])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось обновить товары')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка товаров...</div>
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">Ошибка: {error}</div>
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Товары не найдены</p>
        <Link href="/admin/products/new">
          <Button>Добавить первый товар</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">
                Выбрано {selectedIds.length} товар{selectedIds.length > 1 ? 'ов' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleBulkUpdate({ inStock: true })}
                disabled={processing}
                size="sm"
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                В наличии
              </Button>
              <Button
                onClick={() => handleBulkUpdate({ inStock: false })}
                disabled={processing}
                size="sm"
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                Нет в наличии
              </Button>
              <Button
                onClick={() => handleBulkUpdate({ isNew: true })}
                disabled={processing}
                size="sm"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Новый товар
              </Button>
              <Button
                onClick={() => handleBulkUpdate({ isRunners: true })}
                disabled={processing}
                size="sm"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Дорожка
              </Button>
              <Button
                onClick={() => setSelectedIds([])}
                disabled={processing}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-600 hover:bg-gray-50"
              >
                Очистить
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-2 w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="border p-2 text-left">Товар</th>
              <th className="border p-2 text-left">Код</th>
              <th className="border p-2 text-left">Цена</th>
              <th className="border p-2 text-left">Статус</th>
              <th className="border p-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="border p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => handleSelectOne(product.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="border p-2">
                  <div>
                    <h4 className="font-medium">
                      {product.productNames.find(n => n.locale === 'en')?.name || 'Без названия'}
                    </h4>
                    {product.isNew && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                        Новый
                      </span>
                    )}
                  </div>
                </td>
                <td className="border p-2 font-mono text-sm">{product.productCode}</td>
                <td className="border p-2">${product.price}</td>
                <td className="border p-2">
                  {product.inStock ? (
                    <span className="text-green-600">В наличии</span>
                  ) : (
                    <span className="text-red-600">Нет в наличии</span>
                  )}
                </td>
                <td className="border p-2">
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm">Изменить</Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Показано с {((pagination.page - 1) * pagination.limit) + 1} по{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} из{' '}
          {pagination.total} товаров
        </div>
        <div className="flex gap-2">
          {pagination.page > 1 && (
            <Link href={`?page=${pagination.page - 1}&search=${search}&limit=${limit}${inStock ? `&inStock=${inStock}` : ''}`}>
              <Button variant="outline">Назад</Button>
            </Link>
          )}
          {pagination.page < pagination.pages && (
            <Link href={`?page=${pagination.page + 1}&search=${search}&limit=${limit}${inStock ? `&inStock=${inStock}` : ''}`}>
              <Button variant="outline">Вперед</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}