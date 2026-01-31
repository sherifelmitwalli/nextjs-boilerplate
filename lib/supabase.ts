import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aebfvyzjjypuudpjyykp.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYmZ2eXpqanlwdXVkcGp5eWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MjE2OTAsImV4cCI6MjA4NTE5NzY5MH0.Eq9k8IOf7KIZV8sdu5SKYXdxy4ph9BQRsHb5-IaYbRY'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
