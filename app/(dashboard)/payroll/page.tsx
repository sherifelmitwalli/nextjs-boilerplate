'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { Calculator, Download, Plus } from 'lucide-react'

export default function Payroll() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const queryClient = useQueryClient()

  const { data: periods } = useQuery({
    queryKey: ['payroll_periods'],
    queryFn: async () => {
      const { data } = await supabase
        .from('payroll_periods')
        .select('*')
        .order('start_date', { ascending: false })
      return data || []
    },
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await supabase
        .from('employees')
        .select(`
          *,
          user:users(full_name)
        `)
        .eq('is_active', true)
      return data || []
    },
  })

  const { data: payrollRecords } = useQuery({
    queryKey: ['payroll_records', selectedPeriod],
    queryFn: async () => {
      if (!selectedPeriod) return []
      const { data } = await supabase
        .from('payroll_records')
        .select(`
          *,
          employee:employees(
            user:users(full_name),
            employee_code
          )
        `)
        .eq('payroll_period_id', selectedPeriod)
      return data || []
    },
    enabled: !!selectedPeriod,
  })

  const calculatePayroll = useMutation({
    mutationFn: async (employeeId: string) => {
      const employee = employees?.find((e) => e.id === employeeId)
      if (!employee) return

      const { data, error } = await supabase.rpc('calculate_egypt_payroll', {
        p_basic_salary: employee.basic_salary,
        p_overtime_hours: 0,
        p_bonuses: 0,
        p_deductions: 0,
      })

      if (error) throw error

      // Insert payroll record
      const { error: insertError } = await supabase.from('payroll_records').insert({
        payroll_period_id: selectedPeriod,
        employee_id: employeeId,
        basic_salary: employee.basic_salary,
        overtime_hours: 0,
        overtime_amount: data[0].overtime_amount,
        bonuses: 0,
        deductions: 0,
        social_insurance: data[0].social_insurance,
        income_tax: data[0].income_tax,
        net_salary: data[0].net_salary,
      })

      if (insertError) throw insertError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll_records'] })
    },
  })

  const createPeriod = useMutation({
    mutationFn: async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const { error } = await supabase.from('payroll_periods').insert({
        start_date: startOfMonth.toISOString().split('T')[0],
        end_date: endOfMonth.toISOString().split('T')[0],
        status: 'open',
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll_periods'] })
    },
  })

  const totalNetSalary = payrollRecords?.reduce((sum, r) => sum + (r.net_salary || 0), 0) || 0
  const totalTax = payrollRecords?.reduce((sum, r) => sum + (r.income_tax || 0), 0) || 0
  const totalInsurance = payrollRecords?.reduce((sum, r) => sum + (r.social_insurance || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <button
          onClick={() => createPeriod.mutate()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Period
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Net Salary</p>
          <p className="text-2xl font-bold text-gray-900">
            EGP {totalNetSalary.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Income Tax</p>
          <p className="text-2xl font-bold text-gray-900">
            EGP {totalTax.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Social Insurance</p>
          <p className="text-2xl font-bold text-gray-900">
            EGP {totalInsurance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Payroll Period
        </label>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Select a period</option>
          {periods?.map((period) => (
            <option key={period.id} value={period.id}>
              {format(new Date(period.start_date), 'MMM yyyy')} ({period.status})
            </option>
          ))}
        </select>
      </div>

      {/* Employees without payroll */}
      {selectedPeriod && employees && payrollRecords && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Employees Pending Calculation
          </h2>
          <div className="space-y-2">
            {employees
              .filter(
                (e) => !payrollRecords.some((r) => r.employee_id === e.id)
              )
              .map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {(employee.user as any)?.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Code: {employee.employee_code} | Basic: EGP {employee.basic_salary}
                    </p>
                  </div>
                  <button
                    onClick={() => calculatePayroll.mutate(employee.id)}
                    disabled={calculatePayroll.isPending}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Calculator className="w-4 h-4" />
                    Calculate
                  </button>
                </div>
              ))}
            {employees.filter(
              (e) => !payrollRecords.some((r) => r.employee_id === e.id)
            ).length === 0 && (
              <p className="text-gray-500 text-center py-4">
                All employees have been calculated for this period
              </p>
            )}
          </div>
        </div>
      )}

      {/* Payroll Records */}
      {payrollRecords && payrollRecords.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Payroll Records</h2>
            <button className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Basic Salary
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Social Insurance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Income Tax
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Net Salary
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrollRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {(record.employee as any)?.user?.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(record.employee as any)?.employee_code}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      EGP {record.basic_salary?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      EGP {record.social_insurance?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      EGP {record.income_tax?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      EGP {record.net_salary?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
