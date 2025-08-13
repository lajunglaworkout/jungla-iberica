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