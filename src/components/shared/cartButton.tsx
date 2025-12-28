"use client"

import { useCartStore } from '@/hooks/useCartStore'
import { ShoppingCart } from 'lucide-react'
import React from 'react'

const CartButton = () => {
  const { cart } = useCartStore()

  return (
    <button className="cursor-pointer relative p-2 rounded-full transition">
      <ShoppingCart className="size-4 md:size-6" />
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] md:text-xs font-bold px-1.5 py-0.5 rounded-full">
        {cart.reduce((acc, c) => acc + c.quantity, 0)}
      </span>
    </button>
  )
}

export default CartButton
