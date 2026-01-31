'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Minus, AlertTriangle, Package } from 'lucide-react'

export default function Inventory() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    name_ar: '',
    unit: '',
    min_stock_level: 0,
    reorder_point: 0,
  })
  const queryClient = useQueryClient()

  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name')
      return data || []
    },
  })

  const addItem = useMutation({
    mutationFn: async () => {
      // @ts-ignore
      const { error } = await supabase.from('inventory_items').insert(newItem)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setShowAddModal(false)
      setNewItem({ name: '', name_ar: '', unit: '', min_stock_level: 0, reorder_point: 0 })
    },
  })

  const adjustStock = useMutation({
    mutationFn: async ({ itemId, quantity, type }: { itemId: string; quantity: number; type: 'in' | 'out' }) => {
      // Update inventory item
      // @ts-ignore
      const { data: item } = await supabase
        .from('inventory_items')
        .select('current_stock')
        .eq('id', itemId)
        .single()

      const itemData = item as any
      const newStock = type === 'in' 
        ? (itemData?.current_stock || 0) + quantity 
        : (itemData?.current_stock || 0) - quantity

      const { error: updateError } = await (supabase
        .from('inventory_items') as any)
        .update({ current_stock: newStock })
        .eq('id', itemId)

      if (updateError) throw updateError

      // Create movement record
      // @ts-ignore
      const { error: movementError } = await supabase.from('inventory_movements').insert({
        inventory_item_id: itemId,
        movement_type: type,
        quantity: type === 'in' ? quantity : -quantity,
        reference_type: 'manual_adjustment',
      })

      if (movementError) throw movementError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })

  // @ts-ignore
  const lowStockItems = inventory?.filter(
    (item: any) => item.current_stock <= item.min_stock_level
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-800 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold">Low Stock Alert</h3>
          </div>
          <p className="text-yellow-700">
            {lowStockItems.length} items are below minimum stock level
          </p>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Min Level
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(inventory as any[])?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.name_ar}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    {item.current_stock}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {item.min_stock_level}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.current_stock <= item.min_stock_level ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => adjustStock.mutate({ itemId: item.id, quantity: 1, type: 'in' })}
                        className="p-1 hover:bg-green-100 text-green-600 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => adjustStock.mutate({ itemId: item.id, quantity: 1, type: 'out' })}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Inventory Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English)
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Arabic)
                </label>
                <input
                  type="text"
                  value={newItem.name_ar}
                  onChange={(e) => setNewItem({ ...newItem, name_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="kg, liter, piece, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock Level
                  </label>
                  <input
                    type="number"
                    value={newItem.min_stock_level}
                    onChange={(e) => setNewItem({ ...newItem, min_stock_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Point
                  </label>
                  <input
                    type="number"
                    value={newItem.reorder_point}
                    onChange={(e) => setNewItem({ ...newItem, reorder_point: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => addItem.mutate()}
                disabled={addItem.isPending || !newItem.name || !newItem.unit}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {addItem.isPending ? 'Adding...' : 'Add Item'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
