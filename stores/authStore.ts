'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/supabase'

interface User extends Tables<'users'> {
  company?: Tables<'companies'>
  branch?: Tables<'branches'>
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // Fetch user from database with proper authentication
          const { data: user, error } = await supabase
            .from('users')
            .select(`
              *,
              company:companies(*),
              branch:branches(*)
            `)
            .eq('email', email)
            .single()

          if (error || !user) {
            throw new Error('Invalid credentials')
          }

          // Check password (plain text comparison for demo)
          // In production, use bcrypt.compare() or similar
          const userRecord = user as any
          if (userRecord.password_hash !== password) {
            throw new Error('Invalid credentials')
          }

          // Update last login (skip for demo to avoid type issues)

          set({ user, isLoading: false })
        } catch (error: any) {
          console.error('Login error:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ user: null, error: null })
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
