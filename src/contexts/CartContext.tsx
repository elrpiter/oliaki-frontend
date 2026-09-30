import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  storeId: string
  storeName: string
  stock?: number // 👈 Adicionado o limite de estoque
}

interface CartContextData {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalAmount: number
  totalItems: number
}

const CartContext = createContext<CartContextData>({} as CartContextData)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number) {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((p) => p.id === item.id)
      const maxStock = typeof item.stock === 'number' ? item.stock : 999

      if (existingIndex > -1) {
        const updated = [...prevCart]
        // Garante que a soma não ultrapasse o estoque
        const newQty = Math.min(maxStock, updated[existingIndex].quantity + quantity)
        updated[existingIndex].quantity = newQty
        return updated
      }

      const initialQty = Math.min(maxStock, quantity)
      return [...prevCart, { ...item, quantity: initialQty }]
    })
  }

  function removeFromCart(productId: string) {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const maxStock = typeof item.stock === 'number' ? item.stock : 999
          // Limita a quantidade ao estoque máximo do produto
          const cappedQty = Math.min(maxStock, quantity)
          return { ...item, quantity: cappedQty }
        }
        return item
      })
    )
  }

  function clearCart() {
    setCart([])
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}