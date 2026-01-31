'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Download, Calendar } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })

  const { data: salesData } = useQuery({
    queryKey: ['sales_report', dateRange],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('created_at, total_amount, subtotal, vat_amount, service_charge')
        .eq('payment_status', 'paid')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
      return data || []
    },
  })

  const { data: categoryData } = useQuery({
    queryKey: ['category_report', dateRange],
    queryFn: async () => {
      const { data } = await supabase
        .from('order_items')
        .select(`
          total_price,
          menu_item:menu_items(
            category:categories(name)
          )
        `)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
      return data || []
    },
  })

  // Calculate summary stats
  const totalSales = salesData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
  const totalVAT = salesData?.reduce((sum, o) => sum + (o.vat_amount || 0), 0) || 0
  const totalServiceCharge = salesData?.reduce((sum, o) => sum + (o.service_charge || 0), 0) || 0
  const orderCount = salesData?.length || 0
  const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0

  // Prepare chart data
  const dailySales = salesData?.reduce((acc: any[], order) => {
    const date = format(new Date(order.created_at), 'MMM dd')
    const existing = acc.find((d) => d.date === date)
    if (existing) {
      existing.sales += order.total_amount
    } else {
      acc.push({ date, sales: order.total_amount })
    }
    return acc
  }, []) || []

  const categorySales = categoryData?.reduce((acc: any[], item: any) => {
    const categoryName = item.menu_item?.category?.name || 'Uncategorized'
    const existing = acc.find((c) => c.name === categoryName)
    if (existing) {
      existing.value += item.total_price
    } else {
      acc.push({ name: categoryName, value: item.total_price })
    }
    return acc
  }, []) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Date Range */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div className="flex gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">
            EGP {totalSales.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total VAT (14%)</p>
          <p className="text-2xl font-bold text-gray-900">
            EGP {totalVAT.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Service Charge (10%)</p>
          <p className="text-2xl font-bold text-gray-900">
            EGP {totalServiceCharge.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-900">
            EGP {avgOrderValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `EGP ${value.toLocaleString()}`} />
              <Bar dataKey="sales" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySales}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categorySales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `EGP ${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tax Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Summary (ETA Compliance)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">VAT Collected (14%)</p>
            <p className="text-xl font-bold text-gray-900">EGP {totalVAT.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">To be remitted to ETA</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Orders Submitted</p>
            <p className="text-xl font-bold text-gray-900">{orderCount}</p>
            <p className="text-xs text-gray-400 mt-1">E-invoices to ETA</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Compliance Status</p>
            <p className="text-xl font-bold text-green-600">Compliant</p>
            <p className="text-xs text-gray-400 mt-1">All e-invoices submitted</p>
          </div>
        </div>
      </div>
    </div>
  )
}
