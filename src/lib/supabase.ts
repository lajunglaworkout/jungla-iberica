// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Para Vite, las variables de entorno se acceden con import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de la base de datos basados en tu esquema
export type Database = {
  public: {
    Tables: {
      // ===== TABLAS DE LOGÍSTICA =====
      product_categories: {
        Row: {
          id: number
          name: string
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: number
          name: string
          contact_person?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          postal_code?: string
          tax_id?: string
          payment_terms: number
          is_active: boolean
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          contact_person?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          postal_code?: string
          tax_id?: string
          payment_terms?: number
          is_active?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          contact_person?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          postal_code?: string
          tax_id?: string
          payment_terms?: number
          is_active?: boolean
          notes?: string
          updated_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: number
          name: string
          description?: string
          category_id?: number
          supplier_id?: number
          sku?: string
          size?: string
          color?: string
          quantity: number
          min_stock: number
          max_stock: number
          cost_per_unit: number
          selling_price: number
          location?: string
          barcode?: string
          status: string
          last_restock_date?: string
          expiry_date?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
          category_id?: number
          supplier_id?: number
          sku?: string
          size?: string
          color?: string
          quantity?: number
          min_stock?: number
          max_stock?: number
          cost_per_unit?: number
          selling_price?: number
          location?: string
          barcode?: string
          status?: string
          last_restock_date?: string
          expiry_date?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          category_id?: number
          supplier_id?: number
          sku?: string
          size?: string
          color?: string
          quantity?: number
          min_stock?: number
          max_stock?: number
          cost_per_unit?: number
          selling_price?: number
          location?: string
          barcode?: string
          status?: string
          last_restock_date?: string
          expiry_date?: string
          notes?: string
          updated_at?: string
        }
      }
      supplier_orders: {
        Row: {
          id: number
          order_number: string
          supplier_id: number
          status: string
          order_date: string
          expected_delivery?: string
          actual_delivery?: string
          total_amount: number
          tax_amount: number
          shipping_cost: number
          discount_amount: number
          created_by?: number
          approved_by?: number
          received_by?: number
          notes?: string
          tracking_number?: string
          invoice_number?: string
          payment_status: string
          payment_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_number?: string
          supplier_id: number
          status?: string
          order_date?: string
          expected_delivery?: string
          actual_delivery?: string
          total_amount?: number
          tax_amount?: number
          shipping_cost?: number
          discount_amount?: number
          created_by?: number
          approved_by?: number
          received_by?: number
          notes?: string
          tracking_number?: string
          invoice_number?: string
          payment_status?: string
          payment_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_number?: string
          supplier_id?: number
          status?: string
          order_date?: string
          expected_delivery?: string
          actual_delivery?: string
          total_amount?: number
          tax_amount?: number
          shipping_cost?: number
          discount_amount?: number
          created_by?: number
          approved_by?: number
          received_by?: number
          notes?: string
          tracking_number?: string
          invoice_number?: string
          payment_status?: string
          payment_date?: string
          updated_at?: string
        }
      }
      supplier_order_items: {
        Row: {
          id: number
          order_id: number
          inventory_item_id?: number
          item_name: string
          item_description?: string
          size?: string
          color?: string
          quantity: number
          unit_cost: number
          total_cost: number
          received_quantity: number
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_id: number
          inventory_item_id?: number
          item_name: string
          item_description?: string
          size?: string
          color?: string
          quantity: number
          unit_cost: number
          received_quantity?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          inventory_item_id?: number
          item_name?: string
          item_description?: string
          size?: string
          color?: string
          quantity?: number
          unit_cost?: number
          received_quantity?: number
          notes?: string
          updated_at?: string
        }
      }
      inventory_movements: {
        Row: {
          id: number
          inventory_item_id: number
          movement_type: string
          quantity: number
          previous_quantity: number
          new_quantity: number
          unit_cost?: number
          reference_type?: string
          reference_id?: number
          reason?: string
          performed_by?: number
          location_from?: string
          location_to?: string
          created_at: string
        }
        Insert: {
          id?: number
          inventory_item_id: number
          movement_type: string
          quantity: number
          previous_quantity: number
          new_quantity: number
          unit_cost?: number
          reference_type?: string
          reference_id?: number
          reason?: string
          performed_by?: number
          location_from?: string
          location_to?: string
          created_at?: string
        }
        Update: {
          id?: number
          inventory_item_id?: number
          movement_type?: string
          quantity?: number
          previous_quantity?: number
          new_quantity?: number
          unit_cost?: number
          reference_type?: string
          reference_id?: number
          reason?: string
          performed_by?: number
          location_from?: string
          location_to?: string
        }
      }
      stock_alerts: {
        Row: {
          id: number
          inventory_item_id: number
          alert_type: string
          message: string
          is_resolved: boolean
          resolved_by?: number
          resolved_at?: string
          created_at: string
        }
        Insert: {
          id?: number
          inventory_item_id: number
          alert_type: string
          message: string
          is_resolved?: boolean
          resolved_by?: number
          resolved_at?: string
          created_at?: string
        }
        Update: {
          id?: number
          inventory_item_id?: number
          alert_type?: string
          message?: string
          is_resolved?: boolean
          resolved_by?: number
          resolved_at?: string
        }
      }
      // ===== TABLAS EXISTENTES =====
      empleados: {
        Row: {
          id: string
          nombre: string
          email: string
          telefono?: string
          direccion?: string
          rol: string
          centro_id?: string
          activo: boolean
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          telefono?: string
          direccion?: string
          rol?: string
          centro_id?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          telefono?: string
          direccion?: string
          rol?: string
          centro_id?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      centros: {
        Row: {
          id: string
          nombre: string
          direccion?: string
          ciudad: string
          provincia?: string
          codigo_postal?: string
          telefono?: string
          email?: string
          activo: boolean
          created_at: string
        }
      }
      daily_checklists: {
        Row: {
          id: string
          fecha: string
          centro_id: string
          empleado_id: string
          turno: 'apertura' | 'tarde' | 'cierre'
          tareas: any // JSON
          estado: 'pendiente' | 'en_progreso' | 'completado'
          created_at: string
          updated_at?: string
        }
      }
      objetivos: {
        Row: {
          id: string
          titulo: string
          descripcion?: string
          departamento: string
          asignado_a: string
          mes_objetivo: string
          fecha_limite: string
          estado: string
          porcentaje_completitud: number
          created_at: string
        }
      }
      reuniones: {
        Row: {
          id: string
          titulo: string
          descripcion?: string
          fecha: string
          hora_inicio: string
          hora_fin: string
          participantes: string[]
          tipo: string
          estado: string
          created_at: string
        }
      }
      tareas: {
        Row: {
          id: string
          titulo: string
          descripcion?: string
          asignado_a: string
          creado_por: string
          fecha_limite: string
          prioridad: 'baja' | 'media' | 'alta' | 'critica'
          estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado'
          created_at: string
          updated_at?: string
        }
      }
      notificaciones: {
        Row: {
          id: string
          usuario_id: string
          titulo: string
          mensaje: string
          tipo: 'info' | 'warning' | 'error' | 'success'
          leida: boolean
          created_at: string
        }
      }
    }
  }
}