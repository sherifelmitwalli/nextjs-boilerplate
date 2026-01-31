'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Save, Building2, Receipt, Users } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'company' | 'eta' | 'users'>('company')
  const queryClient = useQueryClient()

  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const { data } = await supabase.from('companies').select('*').single()
      return data
    },
  })

  const [companyForm, setCompanyForm] = useState({
    name: company?.name || '',
    tax_number: company?.tax_number || '',
    commercial_registration: company?.commercial_registration || '',
    address: company?.address || '',
    city: company?.city || '',
    phone: company?.phone || '',
    email: company?.email || '',
    vat_rate: company?.vat_rate || 14,
  })

  const [etaForm, setEtaForm] = useState({
    eta_api_key: company?.eta_api_key || '',
    eta_api_secret: company?.eta_api_secret || '',
    eta_pos_serial: company?.eta_pos_serial || '',
  })

  const updateCompany = useMutation({
    mutationFn: async () => {
      // @ts-ignore
      const { error } = await supabase
        .from('companies')
        .update(companyForm)
        .eq('id', company?.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      alert('Company settings saved!')
    },
  })

  const updateETA = useMutation({
    mutationFn: async () => {
      // @ts-ignore
      const { error } = await supabase
        .from('companies')
        .update(etaForm)
        .eq('id', company?.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      alert('ETA settings saved!')
    },
  })

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'eta', label: 'ETA Integration', icon: Receipt },
    { id: 'users', label: 'Users', icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Company Settings */}
      {activeTab === 'company' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Number *
                </label>
                <input
                  type="text"
                  value={companyForm.tax_number}
                  onChange={(e) => setCompanyForm({ ...companyForm, tax_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commercial Registration
                </label>
                <input
                  type="text"
                  value={companyForm.commercial_registration}
                  onChange={(e) => setCompanyForm({ ...companyForm, commercial_registration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={companyForm.city}
                  onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VAT Rate (%)
              </label>
              <input
                type="number"
                value={companyForm.vat_rate}
                onChange={(e) => setCompanyForm({ ...companyForm, vat_rate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Standard VAT rate in Egypt is 14%
              </p>
            </div>
            <button
              onClick={() => updateCompany.mutate()}
              disabled={updateCompany.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateCompany.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ETA Settings */}
      {activeTab === 'eta' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Egyptian Tax Authority (ETA) Integration
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> Starting September 15, 2025, all restaurants in Egypt must
              integrate with the ETA e-invoicing system. Enter your API credentials below.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ETA API Key
              </label>
              <input
                type="text"
                value={etaForm.eta_api_key}
                onChange={(e) => setEtaForm({ ...etaForm, eta_api_key: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Your ETA API Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ETA API Secret
              </label>
              <input
                type="password"
                value={etaForm.eta_api_secret}
                onChange={(e) => setEtaForm({ ...etaForm, eta_api_secret: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Your ETA API Secret"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                POS Serial Number
              </label>
              <input
                type="text"
                value={etaForm.eta_pos_serial}
                onChange={(e) => setEtaForm({ ...etaForm, eta_pos_serial: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="POS Device Serial Number"
              />
            </div>
            <button
              onClick={() => updateETA.mutate()}
              disabled={updateETA.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateETA.isPending ? 'Saving...' : 'Save ETA Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
          <p className="text-gray-500">
            User management functionality will be implemented here. You can add, edit, and manage
            staff accounts with different roles (Admin, Manager, Cashier, Chef, etc.).
          </p>
        </div>
      )}
    </div>
  )
}
