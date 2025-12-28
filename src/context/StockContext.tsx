'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface StockContextType {
  stockData: Record<string, boolean>
  isLoading: boolean
  updateStock: (productCode: string, inStock: boolean) => void
  refreshStock: (productCodes: string[]) => Promise<void>
}

const StockContext = createContext<StockContextType | undefined>(undefined)

interface StockProviderProps {
  children: ReactNode
  productCodes: string[] // Коды всех товаров на странице
}

export function StockProvider({ children, productCodes }: StockProviderProps) {
  const { data: session, status } = useSession()
  const [stockData, setStockData] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  // Функция для загрузки данных батчем
  const refreshStock = async (codes: string[]) => {
    if (!isAdmin || codes.length === 0) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Один запрос для всех товаров
      const response = await fetch(
        `/api/admin/stock/batch?productCodes=${codes.join(',')}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch stock data')
      }

      const data = await response.json()
      setStockData(data)
    } catch (error) {
      console.error('Failed to load stock data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Загружаем данные при монтировании
  useEffect(() => {
    if (status === 'loading') return

    if (!isAdmin) {
      setIsLoading(false)
      return
    }

    if (productCodes.length > 0) {
      refreshStock(productCodes)
    } else {
      setIsLoading(false)
    }
  }, [productCodes.join(','), isAdmin, status])

  // Локальное обновление при изменении статуса
  const updateStock = (productCode: string, inStock: boolean) => {
    setStockData(prev => ({
      ...prev,
      [productCode]: inStock
    }))
  }

  return (
    <StockContext.Provider value={{ stockData, isLoading, updateStock, refreshStock }}>
      {children}
    </StockContext.Provider>
  )
}

export function useStock() {
  const context = useContext(StockContext)
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider')
  }
  return context
}
