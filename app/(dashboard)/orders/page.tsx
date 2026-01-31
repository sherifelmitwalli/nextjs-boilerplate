'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { Eye, FileText } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-purple-100 text-purple-800',
  served: 'bg-green-100 text-green-800',
  paid: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  partial: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-red-100 text-red-800',
}

export default function Orders() {
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name),
          user:users(full_name)
        `)
        .order('created_at', { ascending: false })
      return data || []
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Payment
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  ETA
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(orders as any[])?.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    {(order.customer as any)?.name || 'Walk-in'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize">{order.order_type.replace('_', ' ')}</span>
                    {order.table_number && (
                      <span className="text-gray-500"> (Table {order.table_number})</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    EGP {order.total_amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${paymentStatusColors[order.payment_status]}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {order.eta_submission_status === 'submitted' ? (
                      <span className="text-green-600 text-sm">✓ Submitted</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
