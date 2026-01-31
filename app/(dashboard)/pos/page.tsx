'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Minus, Trash2, Receipt, Printer } from 'lucide-react'
import type { Tables } from '@/lib/supabase'

interface CartItem extends Tables<'menu_items'> {
  quantity: number
}

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in')
  const [tableNumber, setTableNumber] = useState('')
  const queryClient = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true)
      return data || []
    },
  })

  const { data: menuItems } = useQuery({
    queryKey: ['menu_items', selectedCategory],
    queryFn: async () => {
      let query = supabase.from('menu_items').select('*').eq('is_available', true)
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }
      const { data } = await query
      return data || []
    },
  })

  const createOrder = useMutation({
    mutationFn: async () => {
      if (cart.length === 0) return

      // Calculate totals
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const vatRate = 0.14 // 14% VAT in Egypt
      const vatAmount = subtotal * vatRate
      const serviceCharge = subtotal * 0.10 // 10% service charge
      const totalAmount = subtotal + vatAmount + serviceCharge

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_type: orderType,
          table_number: tableNumber || null,
          subtotal,
          vat_amount: vatAmount,
          service_charge: serviceCharge,
          total_amount: totalAmount,
          payment_status: 'pending',
          eta_submission_status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        vat_amount: item.price * item.quantity * vatRate,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      return order
    },
    onSuccess: () => {
      setCart([])
      setTableNumber('')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      alert('Order created successfully!')
    },
  })

  const addToCart = (item: Tables<'menu_items'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const vatAmount = cartTotal * 0.14
  const serviceCharge = cartTotal * 0.10
  const grandTotal = cartTotal + vatAmount + serviceCharge

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col">
        {/* Order Type & Table */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="flex gap-4 items-center">
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="dine_in">Dine In</option>
              <option value="takeaway">Takeaway</option>
              <option value="delivery">Delivery</option>
            </select>
            {orderType === 'dine_in' && (
              <input
                type="text"
                placeholder="Table Number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg w-32"
              />
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All Items
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
            {menuItems?.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
              >
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.name_ar}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  EGP {item.price}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Current Order</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items added</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">EGP {item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>EGP {cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">VAT (14%)</span>
            <span>EGP {vatAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service Charge (10%)</span>
            <span>EGP {serviceCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>EGP {grandTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4">
            <button
              onClick={() => createOrder.mutate()}
              disabled={cart.length === 0 || createOrder.isPending}
              className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Receipt className="w-4 h-4" />
              {createOrder.isPending ? 'Saving...' : 'Save Order'}
            </button>
            <button
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
