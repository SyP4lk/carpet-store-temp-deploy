'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useStock } from '@/context/StockContext'

interface AdminStockButtonProps {
  productCode: string
  className?: string
}

export default function AdminStockButton({ productCode, className = '' }: AdminStockButtonProps) {
  const { data: session, status } = useSession()
  const { stockData, isLoading, updateStock } = useStock()
  const [processing, setProcessing] = useState(false)

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  // Получаем статус из контекста
  const inStock = stockData[productCode] ?? false

  const handleToggleStock = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setProcessing(true)

    try {
      const endpoint = inStock ? '/api/admin/stock/remove' : '/api/admin/stock/add'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productCode })
      })

      if (!response.ok) {
        throw new Error('Failed to update stock status')
      }

      // Обновляем локальное состояние в контексте
      updateStock(productCode, !inStock)
    } catch (error) {
      console.error('Stock update error:', error)
      alert('Failed to update stock status')
    } finally {
      setProcessing(false)
    }
  }

  if (status === 'loading' || !isAdmin || isLoading) {
    return null
  }

  return (
    <Button
      onClick={handleToggleStock}
      disabled={processing}
      variant={inStock ? 'destructive' : 'default'}
      className={`z-40 ${className}`}
    >
      {processing ? 'Обработка...' : inStock ? 'Убрать из наличия' : 'Добавить в наличие'}
    </Button>
  )
}
