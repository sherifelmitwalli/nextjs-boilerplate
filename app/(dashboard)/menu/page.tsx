'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { Tables } from '@/lib/supabase'

export default function Menu() {
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Tables<'menu_items'> | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    price: 0,
    cost: 0,
    category_id: '',
    vat_applicable: true,
    is_available: true,
  })
  const queryClient = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true)
      return data || []
    },
  })

  const { data: menuItems } = useQuery({
    queryKey: ['menu_items'],
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(name)
        `)
        .order('name')
      return data || []
    },
  })

  const saveItem = useMutation({
    mutationFn: async () => {
      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(formData)
          .eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('menu_items').insert(formData)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] })
      setShowModal(false)
      setEditingItem(null)
      setFormData({
        name: '',
        name_ar: '',
        price: 0,
        cost: 0,
        category_id: '',
        vat_applicable: true,
        is_available: true,
      })
    },
  })

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] })
    },
  })

  const openEditModal = (item: Tables<'menu_items'>) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      name_ar: item.name_ar || '',
      price: item.price,
      cost: item.cost || 0,
      category_id: item.category_id || '',
      vat_applicable: item.vat_applicable,
      is_available: item.is_available,
    })
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      name_ar: '',
      price: 0,
      cost: 0,
      category_id: '',
      vat_applicable: true,
      is_available: true,
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cost
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  VAT
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
              {menuItems?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.name_ar}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {(item.category as any)?.name || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    EGP {item.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    EGP {item.cost?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.vat_applicable ? (
                      <span className="text-green-600">{item.vat_rate}%</span>
                    ) : (
                      <span className="text-gray-400">No VAT</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.is_available ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        Unavailable
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 hover:bg-blue-100 text-blue-600 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem.mutate(item.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Arabic)
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (EGP) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost (EGP)
                  </label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.vat_applicable}
                    onChange={(e) => setFormData({ ...formData, vat_applicable: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">VAT Applicable</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Available</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => saveItem.mutate()}
                disabled={saveItem.isPending || !formData.name || formData.price <= 0}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saveItem.isPending ? 'Saving...' : editingItem ? 'Update' : 'Add'}
              </button>
              <button
                onClick={() => setShowModal(false)}
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
