'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ProductsSearchProps {
  initialSearch: string
  initialInStock?: string
}

export default function ProductsSearch({ initialSearch, initialInStock }: ProductsSearchProps) {
  const [search, setSearch] = useState(initialSearch)
  const [inStock, setInStock] = useState(initialInStock || 'all')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (inStock !== 'all') params.set('inStock', inStock)
    params.set('page', '1') // Reset to first page

    router.push(`/admin/products?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    setInStock('all')
    router.push('/admin/products')
  }

  return (
    <form onSubmit={handleSearch} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Поиск товаров по названию или коду..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <select
          value={inStock}
          onChange={(e) => setInStock(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">Все товары</option>
          <option value="true">В наличии</option>
          <option value="false">Нет в наличии</option>
        </select>
        <Button type="submit">Поиск</Button>
        {(search || inStock !== 'all') && (
          <Button type="button" variant="outline" onClick={handleClear}>
            Очистить
          </Button>
        )}
      </div>
    </form>
  )
}