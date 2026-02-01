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
  isAuthenticated: boolean
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
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        console.log('[AuthStore] Starting login for:', email)
        set({ isLoading: true, error: null })
        try {
          // Fetch user from database with proper authentication
          console.log('[AuthStore] Fetching user from Supabase...')
          const { data: user, error } = await supabase
            .from('users')
            .select(`
              *,
              company:companies(*),
              branch:branches(*)
            `)
            .eq('email', email)
            .single()

          console.log('[AuthStore] Supabase response:', { user: !!user, error })

          if (error || !user) {
            console.error('[AuthStore] User not found or error:', error)
            throw new Error('Invalid credentials')
          }

          // Check password (plain text comparison for demo)
          const userRecord = user as any
          console.log('[AuthStore] Checking password...')
          if (userRecord.password_hash !== password) {
            console.error('[AuthStore] Password mismatch')
            throw new Error('Invalid credentials')
          }

          console.log('[AuthStore] Login successful, setting user state')
          set({ user, isAuthenticated: true, isLoading: false })
          console.log('[AuthStore] User state set successfully')
        } catch (error: any) {
          console.error('[AuthStore] Login error:', error)
          set({ error: error.message, isLoading: false, isAuthenticated: false })
          throw error
        }
      },

      logout: async () => {
        console.log('[AuthStore] Logging out')
        set({ user: null, error: null, isAuthenticated: false })
      },

      setUser: (user) => {
        console.log('[AuthStore] Setting user manually:', !!user)
        set({ user, isAuthenticated: !!user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
