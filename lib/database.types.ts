export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          tax_number: string
          commercial_registration: string | null
          address: string | null
          city: string | null
          phone: string | null
          email: string | null
          eta_api_key: string | null
          eta_api_secret: string | null
          eta_pos_serial: string | null
          vat_rate: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tax_number: string
          commercial_registration?: string | null
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          eta_api_key?: string | null
          eta_api_secret?: string | null
          eta_pos_serial?: string | null
          vat_rate?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tax_number?: string
          commercial_registration?: string | null
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          eta_api_key?: string | null
          eta_api_secret?: string | null
          eta_pos_serial?: string | null
          vat_rate?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      branches: {
        Row: {
          id: string
          company_id: string | null
          name: string
          address: string | null
          city: string | null
          phone: string | null
          eta_pos_serial: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          address?: string | null
          city?: string | null
          phone?: string | null
          eta_pos_serial?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          address?: string | null
          city?: string | null
          phone?: string | null
          eta_pos_serial?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string | null
          branch_id: string | null
          email: string
          password_hash: string
          full_name: string
          role: 'admin' | 'manager' | 'cashier' | 'chef' | 'waiter' | 'accountant'
          national_id: string | null
          phone: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          branch_id?: string | null
          email: string
          password_hash: string
          full_name: string
          role: 'admin' | 'manager' | 'cashier' | 'chef' | 'waiter' | 'accountant'
          national_id?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          branch_id?: string | null
          email?: string
          password_hash?: string
          full_name?: string
          role?: 'admin' | 'manager' | 'cashier' | 'chef' | 'waiter' | 'accountant'
          national_id?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string | null
          company_id: string | null
          branch_id: string | null
          employee_code: string | null
          hire_date: string
          job_title: string | null
          department: string | null
          basic_salary: number
          social_insurance_number: string | null
          social_insurance_amount: number
          employer_insurance_amount: number
          tax_exemption_amount: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          company_id?: string | null
          branch_id?: string | null
          employee_code?: string | null
          hire_date: string
          job_title?: string | null
          department?: string | null
          basic_salary: number
          social_insurance_number?: string | null
          social_insurance_amount?: number
          employer_insurance_amount?: number
          tax_exemption_amount?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          company_id?: string | null
          branch_id?: string | null
          employee_code?: string | null
          hire_date?: string
          job_title?: string | null
          department?: string | null
          basic_salary?: number
          social_insurance_number?: string | null
          social_insurance_amount?: number
          employer_insurance_amount?: number
          tax_exemption_amount?: number
          is_active?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          company_id: string | null
          name: string
          name_ar: string | null
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          name_ar?: string | null
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          name_ar?: string | null
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          company_id: string | null
          category_id: string | null
          name: string
          name_ar: string | null
          description: string | null
          sku: string | null
          price: number
          cost: number
          vat_applicable: boolean
          vat_rate: number
          is_available: boolean
          image_url: string | null
          preparation_time: number | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          category_id?: string | null
          name: string
          name_ar?: string | null
          description?: string | null
          sku?: string | null
          price: number
          cost?: number
          vat_applicable?: boolean
          vat_rate?: number
          is_available?: boolean
          image_url?: string | null
          preparation_time?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          category_id?: string | null
          name?: string
          name_ar?: string | null
          description?: string | null
          sku?: string | null
          price?: number
          cost?: number
          vat_applicable?: boolean
          vat_rate?: number
          is_available?: boolean
          image_url?: string | null
          preparation_time?: number | null
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          company_id: string | null
          name: string
          name_ar: string | null
          unit: string
          current_stock: number
          min_stock_level: number
          reorder_point: number
          unit_cost: number
          supplier_id: string | null
          expiry_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          name_ar?: string | null
          unit: string
          current_stock?: number
          min_stock_level?: number
          reorder_point?: number
          unit_cost?: number
          supplier_id?: string | null
          expiry_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          name_ar?: string | null
          unit?: string
          current_stock?: number
          min_stock_level?: number
          reorder_point?: number
          unit_cost?: number
          supplier_id?: string | null
          expiry_date?: string | null
          created_at?: string
        }
      }
      inventory_movements: {
        Row: {
          id: string
          inventory_item_id: string | null
          branch_id: string | null
          movement_type: 'in' | 'out' | 'adjustment'
          quantity: number
          unit_cost: number | null
          reference_type: string | null
          reference_id: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inventory_item_id?: string | null
          branch_id?: string | null
          movement_type: 'in' | 'out' | 'adjustment'
          quantity: number
          unit_cost?: number | null
          reference_type?: string | null
          reference_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          inventory_item_id?: string | null
          branch_id?: string | null
          movement_type?: 'in' | 'out' | 'adjustment'
          quantity?: number
          unit_cost?: number | null
          reference_type?: string | null
          reference_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          company_id: string | null
          name: string
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          tax_number: string | null
          payment_terms: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          tax_number?: string | null
          payment_terms?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          tax_number?: string | null
          payment_terms?: number
          is_active?: boolean
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_id: string | null
          name: string
          phone: string | null
          email: string | null
          address: string | null
          tax_number: string | null
          loyalty_points: number
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          tax_number?: string | null
          loyalty_points?: number
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          tax_number?: string | null
          loyalty_points?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          company_id: string | null
          branch_id: string | null
          customer_id: string | null
          user_id: string | null
          order_number: string | null
          order_type: 'dine_in' | 'takeaway' | 'delivery'
          table_number: string | null
          status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'
          subtotal: number
          discount_amount: number
          vat_amount: number
          service_charge: number
          total_amount: number
          payment_method: 'cash' | 'card' | 'wallet' | 'mix' | null
          payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
          eta_invoice_uuid: string | null
          eta_submission_status: 'pending' | 'submitted' | 'accepted' | 'rejected'
          eta_response: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          branch_id?: string | null
          customer_id?: string | null
          user_id?: string | null
          order_number?: string | null
          order_type: 'dine_in' | 'takeaway' | 'delivery'
          table_number?: string | null
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'
          subtotal?: number
          discount_amount?: number
          vat_amount?: number
          service_charge?: number
          total_amount?: number
          payment_method?: 'cash' | 'card' | 'wallet' | 'mix' | null
          payment_status?: 'pending' | 'partial' | 'paid' | 'refunded'
          eta_invoice_uuid?: string | null
          eta_submission_status?: 'pending' | 'submitted' | 'accepted' | 'rejected'
          eta_response?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          branch_id?: string | null
          customer_id?: string | null
          user_id?: string | null
          order_number?: string | null
          order_type?: 'dine_in' | 'takeaway' | 'delivery'
          table_number?: string | null
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'
          subtotal?: number
          discount_amount?: number
          vat_amount?: number
          service_charge?: number
          total_amount?: number
          payment_method?: 'cash' | 'card' | 'wallet' | 'mix' | null
          payment_status?: 'pending' | 'partial' | 'paid' | 'refunded'
          eta_invoice_uuid?: string | null
          eta_submission_status?: 'pending' | 'submitted' | 'accepted' | 'rejected'
          eta_response?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          menu_item_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          vat_amount: number
          special_instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          menu_item_id?: string | null
          quantity: number
          unit_price: number
          total_price: number
          vat_amount?: number
          special_instructions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          menu_item_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          vat_amount?: number
          special_instructions?: string | null
          created_at?: string
        }
      }
      payroll_periods: {
        Row: {
          id: string
          company_id: string | null
          start_date: string
          end_date: string
          status: 'open' | 'processing' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          start_date: string
          end_date: string
          status?: 'open' | 'processing' | 'closed'
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          start_date?: string
          end_date?: string
          status?: 'open' | 'processing' | 'closed'
          created_at?: string
        }
      }
      payroll_records: {
        Row: {
          id: string
          payroll_period_id: string | null
          employee_id: string | null
          basic_salary: number
          overtime_hours: number
          overtime_amount: number
          bonuses: number
          deductions: number
          social_insurance: number
          income_tax: number
          net_salary: number
          created_at: string
        }
        Insert: {
          id?: string
          payroll_period_id?: string | null
          employee_id?: string | null
          basic_salary: number
          overtime_hours?: number
          overtime_amount?: number
          bonuses?: number
          deductions?: number
          social_insurance?: number
          income_tax?: number
          net_salary: number
          created_at?: string
        }
        Update: {
          id?: string
          payroll_period_id?: string | null
          employee_id?: string | null
          basic_salary?: number
          overtime_hours?: number
          overtime_amount?: number
          bonuses?: number
          deductions?: number
          social_insurance?: number
          income_tax?: number
          net_salary?: number
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          company_id: string | null
          branch_id: string | null
          category: string
          description: string | null
          amount: number
          vat_amount: number
          receipt_number: string | null
          expense_date: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          branch_id?: string | null
          category: string
          description?: string | null
          amount: number
          vat_amount?: number
          receipt_number?: string | null
          expense_date: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          branch_id?: string | null
          category?: string
          description?: string | null
          amount?: number
          vat_amount?: number
          receipt_number?: string | null
          expense_date?: string
          created_by?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          company_id: string | null
          user_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          user_id?: string | null
          action: string
          table_name?: string | null
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          user_id?: string | null
          action?: string
          table_name?: string | null
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_egypt_payroll: {
        Args: {
          p_basic_salary: number
          p_overtime_hours?: number
          p_bonuses?: number
          p_deductions?: number
        }
        Returns: {
          overtime_amount: number
          gross_salary: number
          social_insurance: number
          income_tax: number
          net_salary: number
        }[]
      }
      generate_eta_invoice: {
        Args: {
          p_order_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
