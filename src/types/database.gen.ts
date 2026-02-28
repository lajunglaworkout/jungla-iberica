export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      academy_block_downloadables: {
        Row: {
          block_id: string | null
          created_at: string | null
          file_url: string | null
          id: string
          name: string
          order: number | null
          prompt_generation: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          block_id?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          name: string
          order?: number | null
          prompt_generation?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          block_id?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          name?: string
          order?: number | null
          prompt_generation?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_block_downloadables_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "academy_lesson_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_cohorte_tutors: {
        Row: {
          cohorte_id: string
          tutor_id: string
        }
        Insert: {
          cohorte_id: string
          tutor_id: string
        }
        Update: {
          cohorte_id?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_cohorte_tutors_cohorte_id_fkey"
            columns: ["cohorte_id"]
            isOneToOne: false
            referencedRelation: "academy_cohortes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_cohorte_tutors_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "academy_tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_cohortes: {
        Row: {
          center_id: string | null
          city: string
          created_at: string | null
          end_date: string | null
          enrolled_students: number | null
          id: string
          max_students: number | null
          modality: string | null
          name: string
          notes: string | null
          partner_center_id: string | null
          start_date: string
          status: string | null
        }
        Insert: {
          center_id?: string | null
          city: string
          created_at?: string | null
          end_date?: string | null
          enrolled_students?: number | null
          id?: string
          max_students?: number | null
          modality?: string | null
          name: string
          notes?: string | null
          partner_center_id?: string | null
          start_date: string
          status?: string | null
        }
        Update: {
          center_id?: string | null
          city?: string
          created_at?: string | null
          end_date?: string | null
          enrolled_students?: number | null
          id?: string
          max_students?: number | null
          modality?: string | null
          name?: string
          notes?: string | null
          partner_center_id?: string | null
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_cohortes_partner_center_id_fkey"
            columns: ["partner_center_id"]
            isOneToOne: false
            referencedRelation: "academy_partner_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_companies_cache: {
        Row: {
          amount_paid: number | null
          category: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          external_id: string | null
          id: string
          last_synced: string | null
          name: string | null
          request_date: string | null
          status: string | null
        }
        Insert: {
          amount_paid?: number | null
          category?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          external_id?: string | null
          id?: string
          last_synced?: string | null
          name?: string | null
          request_date?: string | null
          status?: string | null
        }
        Update: {
          amount_paid?: number | null
          category?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          external_id?: string | null
          id?: string
          last_synced?: string | null
          name?: string | null
          request_date?: string | null
          status?: string | null
        }
        Relationships: []
      }
      academy_lesson_blocks: {
        Row: {
          accion: string | null
          block_number: number | null
          concepto: string | null
          content: string | null
          description: string | null
          duration: number | null
          file_url: string | null
          full_content: string | null
          genspark_prompt: string | null
          id: string
          key_points: string | null
          lesson_id: string | null
          main_ideas: string | null
          ppt_url: string | null
          production_status: string | null
          progress_percentage: number | null
          title: string | null
          updated_at: string | null
          valor: string | null
          video_url: string | null
        }
        Insert: {
          accion?: string | null
          block_number?: number | null
          concepto?: string | null
          content?: string | null
          description?: string | null
          duration?: number | null
          file_url?: string | null
          full_content?: string | null
          genspark_prompt?: string | null
          id?: string
          key_points?: string | null
          lesson_id?: string | null
          main_ideas?: string | null
          ppt_url?: string | null
          production_status?: string | null
          progress_percentage?: number | null
          title?: string | null
          updated_at?: string | null
          valor?: string | null
          video_url?: string | null
        }
        Update: {
          accion?: string | null
          block_number?: number | null
          concepto?: string | null
          content?: string | null
          description?: string | null
          duration?: number | null
          file_url?: string | null
          full_content?: string | null
          genspark_prompt?: string | null
          id?: string
          key_points?: string | null
          lesson_id?: string | null
          main_ideas?: string | null
          ppt_url?: string | null
          production_status?: string | null
          progress_percentage?: number | null
          title?: string | null
          updated_at?: string | null
          valor?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_lesson_blocks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lesson_files: {
        Row: {
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          lesson_id: string | null
          uploaded_at: string | null
        }
        Insert: {
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          lesson_id?: string | null
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          lesson_id?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_lesson_files_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lessons: {
        Row: {
          created_at: string | null
          duration: number | null
          has_test: boolean | null
          id: string
          module_id: string | null
          order: number
          ppt_url: string | null
          script_url: string | null
          status: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          has_test?: boolean | null
          id?: string
          module_id?: string | null
          order: number
          ppt_url?: string | null
          script_url?: string | null
          status?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          has_test?: boolean | null
          id?: string
          module_id?: string | null
          order?: number
          ppt_url?: string | null
          script_url?: string | null
          status?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "academy_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_modules: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_duration: number | null
          id: string
          order: number
          responsible_id: string | null
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          order: number
          responsible_id?: string | null
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          order?: number
          responsible_id?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      academy_partner_centers: {
        Row: {
          address: string | null
          agreement_date: string | null
          city: string
          compensation_per_student: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          status: string | null
        }
        Insert: {
          address?: string | null
          agreement_date?: string | null
          city: string
          compensation_per_student?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          address?: string | null
          agreement_date?: string | null
          city?: string
          compensation_per_student?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: []
      }
      academy_partner_payments: {
        Row: {
          amount: number | null
          cohorte_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          partner_center_id: string | null
          payment_date: string | null
          student_id: string | null
          student_name: string | null
        }
        Insert: {
          amount?: number | null
          cohorte_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          partner_center_id?: string | null
          payment_date?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Update: {
          amount?: number | null
          cohorte_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          partner_center_id?: string | null
          payment_date?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_partner_payments_cohorte_id_fkey"
            columns: ["cohorte_id"]
            isOneToOne: false
            referencedRelation: "academy_cohortes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_partner_payments_partner_center_id_fkey"
            columns: ["partner_center_id"]
            isOneToOne: false
            referencedRelation: "academy_partner_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_partner_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "academy_students_cache"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_students_cache: {
        Row: {
          cohorte_id: string | null
          email: string | null
          enrollment_date: string | null
          external_id: string | null
          id: string
          last_synced: string | null
          modality: string | null
          name: string | null
          progress_percentage: number | null
          satisfaction_rating: number | null
          status: string | null
          tutor_id: string | null
        }
        Insert: {
          cohorte_id?: string | null
          email?: string | null
          enrollment_date?: string | null
          external_id?: string | null
          id?: string
          last_synced?: string | null
          modality?: string | null
          name?: string | null
          progress_percentage?: number | null
          satisfaction_rating?: number | null
          status?: string | null
          tutor_id?: string | null
        }
        Update: {
          cohorte_id?: string | null
          email?: string | null
          enrollment_date?: string | null
          external_id?: string | null
          id?: string
          last_synced?: string | null
          modality?: string | null
          name?: string | null
          progress_percentage?: number | null
          satisfaction_rating?: number | null
          status?: string | null
          tutor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_students_cache_cohorte_id_fkey"
            columns: ["cohorte_id"]
            isOneToOne: false
            referencedRelation: "academy_cohortes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_students_cache_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "academy_tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          lesson_related: string | null
          module_related: string | null
          priority: string | null
          progress: number | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lesson_related?: string | null
          module_related?: string | null
          priority?: string | null
          progress?: number | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lesson_related?: string | null
          module_related?: string | null
          priority?: string | null
          progress?: number | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_tasks_lesson_related_fkey"
            columns: ["lesson_related"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_tasks_module_related_fkey"
            columns: ["module_related"]
            isOneToOne: false
            referencedRelation: "academy_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_transactions: {
        Row: {
          amount: number
          category: string | null
          cohorte_id: string | null
          concept: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          partner_center_id: string | null
          student_id: string | null
          synced_from_academy: boolean | null
          tutor_id: string | null
          type: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          cohorte_id?: string | null
          concept: string
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          partner_center_id?: string | null
          student_id?: string | null
          synced_from_academy?: boolean | null
          tutor_id?: string | null
          type?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          cohorte_id?: string | null
          concept?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          partner_center_id?: string | null
          student_id?: string | null
          synced_from_academy?: boolean | null
          tutor_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_transactions_cohorte_id_fkey"
            columns: ["cohorte_id"]
            isOneToOne: false
            referencedRelation: "academy_cohortes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_transactions_partner_center_id_fkey"
            columns: ["partner_center_id"]
            isOneToOne: false
            referencedRelation: "academy_partner_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "academy_students_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_transactions_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "academy_tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_tutor_students: {
        Row: {
          cohorte_id: string | null
          created_at: string | null
          end_date: string | null
          hours_completed: number | null
          hours_total: number | null
          id: string
          start_date: string | null
          status: string | null
          student_id: string | null
          student_name: string | null
          tutor_id: string | null
        }
        Insert: {
          cohorte_id?: string | null
          created_at?: string | null
          end_date?: string | null
          hours_completed?: number | null
          hours_total?: number | null
          id?: string
          start_date?: string | null
          status?: string | null
          student_id?: string | null
          student_name?: string | null
          tutor_id?: string | null
        }
        Update: {
          cohorte_id?: string | null
          created_at?: string | null
          end_date?: string | null
          hours_completed?: number | null
          hours_total?: number | null
          id?: string
          start_date?: string | null
          status?: string | null
          student_id?: string | null
          student_name?: string | null
          tutor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_tutor_students_cohorte_id_fkey"
            columns: ["cohorte_id"]
            isOneToOne: false
            referencedRelation: "academy_cohortes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_tutor_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "academy_students_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_tutor_students_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "academy_tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_tutors: {
        Row: {
          availability: string | null
          center_id: string | null
          city: string | null
          compensation_rate: number | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          specialties: string[] | null
        }
        Insert: {
          availability?: string | null
          center_id?: string | null
          city?: string | null
          compensation_rate?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          specialties?: string[] | null
        }
        Update: {
          availability?: string | null
          center_id?: string | null
          city?: string | null
          compensation_rate?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          specialties?: string[] | null
        }
        Relationships: []
      }
      actualizaciones_objetivos: {
        Row: {
          actualizado_por: string
          comentario: string | null
          fecha_actualizacion: string | null
          id: string
          objetivo_id: string | null
          tipo_actualizacion: string
          valor_anterior: Json | null
          valor_nuevo: Json | null
        }
        Insert: {
          actualizado_por: string
          comentario?: string | null
          fecha_actualizacion?: string | null
          id?: string
          objetivo_id?: string | null
          tipo_actualizacion: string
          valor_anterior?: Json | null
          valor_nuevo?: Json | null
        }
        Update: {
          actualizado_por?: string
          comentario?: string | null
          fecha_actualizacion?: string | null
          id?: string
          objetivo_id?: string | null
          tipo_actualizacion?: string
          valor_anterior?: Json | null
          valor_nuevo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "actualizaciones_objetivos_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "objetivos"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_automaticas: {
        Row: {
          accion_recomendada: string | null
          creado_en: string | null
          departamento_afectado: string | null
          descripcion: string
          destinatarios: string[]
          es_automatica: boolean | null
          estado: string | null
          id: string
          nivel_urgencia: string | null
          objetivo_relacionado: string | null
          regla_disparadora: Json | null
          resuelta_en: string | null
          reunion_relacionada: string | null
          tipo_alerta: string
          titulo: string
          vista_en: string | null
        }
        Insert: {
          accion_recomendada?: string | null
          creado_en?: string | null
          departamento_afectado?: string | null
          descripcion: string
          destinatarios: string[]
          es_automatica?: boolean | null
          estado?: string | null
          id?: string
          nivel_urgencia?: string | null
          objetivo_relacionado?: string | null
          regla_disparadora?: Json | null
          resuelta_en?: string | null
          reunion_relacionada?: string | null
          tipo_alerta: string
          titulo: string
          vista_en?: string | null
        }
        Update: {
          accion_recomendada?: string | null
          creado_en?: string | null
          departamento_afectado?: string | null
          descripcion?: string
          destinatarios?: string[]
          es_automatica?: boolean | null
          estado?: string | null
          id?: string
          nivel_urgencia?: string | null
          objetivo_relacionado?: string | null
          regla_disparadora?: Json | null
          resuelta_en?: string | null
          reunion_relacionada?: string | null
          tipo_alerta?: string
          titulo?: string
          vista_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_automaticas_objetivo_relacionado_fkey"
            columns: ["objetivo_relacionado"]
            isOneToOne: false
            referencedRelation: "objetivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_automaticas_reunion_relacionada_fkey"
            columns: ["reunion_relacionada"]
            isOneToOne: false
            referencedRelation: "reuniones"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_processing_log: {
        Row: {
          absence_count: number | null
          center_id: number | null
          early_departure_count: number | null
          error_message: string | null
          id: number
          incidents_detected: number | null
          late_count: number | null
          process_date: string
          processed_at: string | null
          status: string | null
        }
        Insert: {
          absence_count?: number | null
          center_id?: number | null
          early_departure_count?: number | null
          error_message?: string | null
          id?: number
          incidents_detected?: number | null
          late_count?: number | null
          process_date: string
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          absence_count?: number | null
          center_id?: number | null
          early_departure_count?: number | null
          error_message?: string | null
          id?: number
          incidents_detected?: number | null
          late_count?: number | null
          process_date?: string
          processed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_center"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          employee_id: number
          hours_late: number | null
          id: number
          notes: string | null
          reason: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          employee_id: number
          hours_late?: number | null
          id?: number
          notes?: string | null
          reason: string
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          employee_id?: number
          hours_late?: number | null
          id?: number
          notes?: string | null
          reason?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: number
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: number
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: number
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      automatizaciones_config: {
        Row: {
          acciones: Json
          activa: boolean | null
          condiciones: Json
          creado_en: string | null
          creado_por: string
          descripcion: string | null
          frecuencia_revision: string | null
          id: string
          nombre_regla: string
          ultima_ejecucion: string | null
          veces_ejecutada: number | null
        }
        Insert: {
          acciones: Json
          activa?: boolean | null
          condiciones: Json
          creado_en?: string | null
          creado_por: string
          descripcion?: string | null
          frecuencia_revision?: string | null
          id?: string
          nombre_regla: string
          ultima_ejecucion?: string | null
          veces_ejecutada?: number | null
        }
        Update: {
          acciones?: Json
          activa?: boolean | null
          condiciones?: Json
          creado_en?: string | null
          creado_por?: string
          descripcion?: string | null
          frecuencia_revision?: string | null
          id?: string
          nombre_regla?: string
          ultima_ejecucion?: string | null
          veces_ejecutada?: number | null
        }
        Relationships: []
      }
      centers: {
        Row: {
          address: string | null
          bank_account: string | null
          billing_email: string | null
          cif: string | null
          city: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          franchisee_id: number | null
          id: number
          manager_id: number | null
          max_capacity: number | null
          monthly_fee: number | null
          name: string
          opening_date: string | null
          opening_hours: string | null
          postal_code: string | null
          province: string | null
          qr_code_id: string | null
          status: Database["public"]["Enums"]["center_status"]
          type: Database["public"]["Enums"]["center_type"]
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          billing_email?: string | null
          cif?: string | null
          city?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          franchisee_id?: number | null
          id?: number
          manager_id?: number | null
          max_capacity?: number | null
          monthly_fee?: number | null
          name: string
          opening_date?: string | null
          opening_hours?: string | null
          postal_code?: string | null
          province?: string | null
          qr_code_id?: string | null
          status?: Database["public"]["Enums"]["center_status"]
          type?: Database["public"]["Enums"]["center_type"]
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          billing_email?: string | null
          cif?: string | null
          city?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          franchisee_id?: number | null
          id?: number
          manager_id?: number | null
          max_capacity?: number | null
          monthly_fee?: number | null
          name?: string
          opening_date?: string | null
          opening_hours?: string | null
          postal_code?: string | null
          province?: string | null
          qr_code_id?: string | null
          status?: Database["public"]["Enums"]["center_status"]
          type?: Database["public"]["Enums"]["center_type"]
        }
        Relationships: [
          {
            foreignKeyName: "centers_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centers_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_incidents: {
        Row: {
          action_plan: string | null
          auto_notify: string[] | null
          center_id: string
          center_name: string
          created_at: string | null
          department: string
          description: string
          estimated_time: string | null
          has_images: boolean | null
          id: number
          image_urls: string[] | null
          incident_type: string
          inventory_item: string | null
          inventory_quantity: number | null
          notified_at: string | null
          priority: string
          rejection_reason: string | null
          reporter_id: string | null
          reporter_name: string
          requires_verification: boolean | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          responsible: string
          started_at: string | null
          started_by: string | null
          status: string
          title: string
          updated_at: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          action_plan?: string | null
          auto_notify?: string[] | null
          center_id: string
          center_name: string
          created_at?: string | null
          department: string
          description: string
          estimated_time?: string | null
          has_images?: boolean | null
          id?: number
          image_urls?: string[] | null
          incident_type: string
          inventory_item?: string | null
          inventory_quantity?: number | null
          notified_at?: string | null
          priority?: string
          rejection_reason?: string | null
          reporter_id?: string | null
          reporter_name: string
          requires_verification?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          responsible: string
          started_at?: string | null
          started_by?: string | null
          status?: string
          title: string
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          action_plan?: string | null
          auto_notify?: string[] | null
          center_id?: string
          center_name?: string
          created_at?: string | null
          department?: string
          description?: string
          estimated_time?: string | null
          has_images?: boolean | null
          id?: number
          image_urls?: string[] | null
          incident_type?: string
          inventory_item?: string | null
          inventory_quantity?: number | null
          notified_at?: string | null
          priority?: string
          rejection_reason?: string | null
          reporter_id?: string | null
          reporter_name?: string
          requires_verification?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          responsible?: string
          started_at?: string | null
          started_by?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      checklist_submissions: {
        Row: {
          completada_en: string | null
          daily_checklist_id: number | null
          estado: string
          id: number
          notas: string | null
          template_id: number | null
        }
        Insert: {
          completada_en?: string | null
          daily_checklist_id?: number | null
          estado: string
          id?: never
          notas?: string | null
          template_id?: number | null
        }
        Update: {
          completada_en?: string | null
          daily_checklist_id?: number | null
          estado?: string
          id?: never
          notas?: string | null
          template_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_submissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          categoria: string
          created_at: string | null
          descripcion: string | null
          id: number
          numero_orden: number | null
          requerido: boolean | null
          tiempo_estimado_min: number | null
          titulo: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          descripcion?: string | null
          id?: never
          numero_orden?: number | null
          requerido?: boolean | null
          tiempo_estimado_min?: number | null
          titulo: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          descripcion?: string | null
          id?: never
          numero_orden?: number | null
          requerido?: boolean | null
          tiempo_estimado_min?: number | null
          titulo?: string
        }
        Relationships: []
      }
      client_cancellations: {
        Row: {
          año: number
          baja_1_año: number | null
          baja_1_mes: number | null
          baja_3_meses: number | null
          baja_6_meses: number | null
          baja_mas_1_año: number | null
          center_id: string
          created_at: string | null
          id: string
          mes: number
          motivo_otro: number | null
          motivo_precio: number | null
          motivo_servicio: number | null
          motivo_ubicacion: number | null
          total_bajas: number
          updated_at: string | null
        }
        Insert: {
          año: number
          baja_1_año?: number | null
          baja_1_mes?: number | null
          baja_3_meses?: number | null
          baja_6_meses?: number | null
          baja_mas_1_año?: number | null
          center_id: string
          created_at?: string | null
          id?: string
          mes: number
          motivo_otro?: number | null
          motivo_precio?: number | null
          motivo_servicio?: number | null
          motivo_ubicacion?: number | null
          total_bajas?: number
          updated_at?: string | null
        }
        Update: {
          año?: number
          baja_1_año?: number | null
          baja_1_mes?: number | null
          baja_3_meses?: number | null
          baja_6_meses?: number | null
          baja_mas_1_año?: number | null
          center_id?: string
          created_at?: string | null
          id?: string
          mes?: number
          motivo_otro?: number | null
          motivo_precio?: number | null
          motivo_servicio?: number | null
          motivo_ubicacion?: number | null
          total_bajas?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      client_cancellations_backup: {
        Row: {
          año: number | null
          baja_1_año: number | null
          baja_1_mes: number | null
          baja_3_meses: number | null
          baja_6_meses: number | null
          baja_mas_1_año: number | null
          center_id: string | null
          created_at: string | null
          id: string | null
          mes: number | null
          motivo_otro: number | null
          motivo_precio: number | null
          motivo_servicio: number | null
          motivo_ubicacion: number | null
          total_bajas: number | null
          updated_at: string | null
        }
        Insert: {
          año?: number | null
          baja_1_año?: number | null
          baja_1_mes?: number | null
          baja_3_meses?: number | null
          baja_6_meses?: number | null
          baja_mas_1_año?: number | null
          center_id?: string | null
          created_at?: string | null
          id?: string | null
          mes?: number | null
          motivo_otro?: number | null
          motivo_precio?: number | null
          motivo_servicio?: number | null
          motivo_ubicacion?: number | null
          total_bajas?: number | null
          updated_at?: string | null
        }
        Update: {
          año?: number | null
          baja_1_año?: number | null
          baja_1_mes?: number | null
          baja_3_meses?: number | null
          baja_6_meses?: number | null
          baja_mas_1_año?: number | null
          center_id?: string | null
          created_at?: string | null
          id?: string | null
          mes?: number | null
          motivo_otro?: number | null
          motivo_precio?: number | null
          motivo_servicio?: number | null
          motivo_ubicacion?: number | null
          total_bajas?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_metrics: {
        Row: {
          altas_bonos: number | null
          altas_fundador: number | null
          altas_normal: number | null
          altas_reales: number | null
          año: number
          bajas_reales: number | null
          center_id: string
          center_name: string
          clientes_activos: number | null
          clientes_contabilidad: number | null
          created_at: string | null
          facturacion_total: number | null
          id: string
          leads: number | null
          mes: number
          new_center_id: number | null
          objetivo_mensual: number | null
          updated_at: string | null
        }
        Insert: {
          altas_bonos?: number | null
          altas_fundador?: number | null
          altas_normal?: number | null
          altas_reales?: number | null
          año: number
          bajas_reales?: number | null
          center_id: string
          center_name: string
          clientes_activos?: number | null
          clientes_contabilidad?: number | null
          created_at?: string | null
          facturacion_total?: number | null
          id?: string
          leads?: number | null
          mes: number
          new_center_id?: number | null
          objetivo_mensual?: number | null
          updated_at?: string | null
        }
        Update: {
          altas_bonos?: number | null
          altas_fundador?: number | null
          altas_normal?: number | null
          altas_reales?: number | null
          año?: number
          bajas_reales?: number | null
          center_id?: string
          center_name?: string
          clientes_activos?: number | null
          clientes_contabilidad?: number | null
          created_at?: string | null
          facturacion_total?: number | null
          id?: string
          leads?: number | null
          mes?: number
          new_center_id?: number | null
          objetivo_mensual?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_metrics_backup: {
        Row: {
          altas_reales: number | null
          año: number | null
          bajas_reales: number | null
          center_id: string | null
          center_name: string | null
          clientes_activos: number | null
          clientes_contabilidad: number | null
          created_at: string | null
          facturacion_total: number | null
          id: string | null
          leads: number | null
          mes: number | null
          objetivo_mensual: number | null
          updated_at: string | null
        }
        Insert: {
          altas_reales?: number | null
          año?: number | null
          bajas_reales?: number | null
          center_id?: string | null
          center_name?: string | null
          clientes_activos?: number | null
          clientes_contabilidad?: number | null
          created_at?: string | null
          facturacion_total?: number | null
          id?: string | null
          leads?: number | null
          mes?: number | null
          objetivo_mensual?: number | null
          updated_at?: string | null
        }
        Update: {
          altas_reales?: number | null
          año?: number | null
          bajas_reales?: number | null
          center_id?: string | null
          center_name?: string | null
          clientes_activos?: number | null
          clientes_contabilidad?: number | null
          created_at?: string | null
          facturacion_total?: number | null
          id?: string | null
          leads?: number | null
          mes?: number | null
          objetivo_mensual?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comentarios_tarea: {
        Row: {
          autor: string
          comentario: string
          fecha: string | null
          id: string
          tarea_id: string | null
          tipo: string | null
        }
        Insert: {
          autor: string
          comentario: string
          fecha?: string | null
          id?: string
          tarea_id?: string | null
          tipo?: string | null
        }
        Update: {
          autor?: string
          comentario?: string
          fecha?: string | null
          id?: string
          tarea_id?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_tarea_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
      contenido_marketing: {
        Row: {
          actualizado_en: string | null
          alcance: string | null
          asignado_grabacion: string | null
          asignado_publicacion: string | null
          categoria: string | null
          centro_especifico: string | null
          creado_en: string | null
          creado_por: string
          enlace_drive: string
          estado_grabacion: string | null
          estado_publicacion: string | null
          fecha_limite: string
          fecha_publicacion_programada: string | null
          id: string
          metricas_objetivo: Json | null
          notas_produccion: string | null
          tipo_contenido: string | null
          titulo: string
        }
        Insert: {
          actualizado_en?: string | null
          alcance?: string | null
          asignado_grabacion?: string | null
          asignado_publicacion?: string | null
          categoria?: string | null
          centro_especifico?: string | null
          creado_en?: string | null
          creado_por: string
          enlace_drive: string
          estado_grabacion?: string | null
          estado_publicacion?: string | null
          fecha_limite: string
          fecha_publicacion_programada?: string | null
          id?: string
          metricas_objetivo?: Json | null
          notas_produccion?: string | null
          tipo_contenido?: string | null
          titulo: string
        }
        Update: {
          actualizado_en?: string | null
          alcance?: string | null
          asignado_grabacion?: string | null
          asignado_publicacion?: string | null
          categoria?: string | null
          centro_especifico?: string | null
          creado_en?: string | null
          creado_por?: string
          enlace_drive?: string
          estado_grabacion?: string | null
          estado_publicacion?: string | null
          fecha_limite?: string
          fecha_publicacion_programada?: string | null
          id?: string
          metricas_objetivo?: Json | null
          notas_produccion?: string | null
          tipo_contenido?: string | null
          titulo?: string
        }
        Relationships: []
      }
      crm_sync: {
        Row: {
          employee_id: number | null
          id: number
          last_sync: string | null
          status: string | null
        }
        Insert: {
          employee_id?: number | null
          id?: number
          last_sync?: string | null
          status?: string | null
        }
        Update: {
          employee_id?: number | null
          id?: number
          last_sync?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_sync_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      cuota_types: {
        Row: {
          activo: boolean | null
          center_id: string
          created_at: string | null
          id: string
          lleva_iva: boolean | null
          nombre: string
          precio: number
        }
        Insert: {
          activo?: boolean | null
          center_id: string
          created_at?: string | null
          id?: string
          lleva_iva?: boolean | null
          nombre: string
          precio: number
        }
        Update: {
          activo?: boolean | null
          center_id?: string
          created_at?: string | null
          id?: string
          lleva_iva?: boolean | null
          nombre?: string
          precio?: number
        }
        Relationships: []
      }
      daily_attendance: {
        Row: {
          absence_reason: string | null
          actual_clock_in: string | null
          actual_clock_out: string | null
          break_minutes: number | null
          center_id: number | null
          created_at: string | null
          date: string
          employee_id: string | null
          id: number
          is_justified: boolean | null
          notes: string | null
          overtime_hours: number | null
          scheduled_hours: number | null
          scheduled_shift_id: number | null
          status: string | null
          updated_at: string | null
          worked_hours: number | null
        }
        Insert: {
          absence_reason?: string | null
          actual_clock_in?: string | null
          actual_clock_out?: string | null
          break_minutes?: number | null
          center_id?: number | null
          created_at?: string | null
          date: string
          employee_id?: string | null
          id?: number
          is_justified?: boolean | null
          notes?: string | null
          overtime_hours?: number | null
          scheduled_hours?: number | null
          scheduled_shift_id?: number | null
          status?: string | null
          updated_at?: string | null
          worked_hours?: number | null
        }
        Update: {
          absence_reason?: string | null
          actual_clock_in?: string | null
          actual_clock_out?: string | null
          break_minutes?: number | null
          center_id?: number | null
          created_at?: string | null
          date?: string
          employee_id?: string | null
          id?: number
          is_justified?: boolean | null
          notes?: string | null
          overtime_hours?: number | null
          scheduled_hours?: number | null
          scheduled_shift_id?: number | null
          status?: string | null
          updated_at?: string | null
          worked_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_attendance_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_attendance_scheduled_shift_id_fkey"
            columns: ["scheduled_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checklists: {
        Row: {
          apertura_tasks: Json | null
          center_id: string
          center_name: string | null
          cierre_tasks: Json | null
          completed_at: string | null
          created_at: string | null
          date: string
          employee_id: string | null
          firma_apertura: Json | null
          firma_cierre: Json | null
          id: number
          incidencias: Json | null
          limpieza_tasks: Json | null
          status: string
          tasks: Json
          updated_at: string | null
        }
        Insert: {
          apertura_tasks?: Json | null
          center_id: string
          center_name?: string | null
          cierre_tasks?: Json | null
          completed_at?: string | null
          created_at?: string | null
          date: string
          employee_id?: string | null
          firma_apertura?: Json | null
          firma_cierre?: Json | null
          id?: number
          incidencias?: Json | null
          limpieza_tasks?: Json | null
          status?: string
          tasks?: Json
          updated_at?: string | null
        }
        Update: {
          apertura_tasks?: Json | null
          center_id?: string
          center_name?: string | null
          cierre_tasks?: Json | null
          completed_at?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string | null
          firma_apertura?: Json | null
          firma_cierre?: Json | null
          id?: number
          incidencias?: Json | null
          limpieza_tasks?: Json | null
          status?: string
          tasks?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      dataset_attcliente: {
        Row: {
          context: string | null
          created_at: string | null
          final_reply: string
          id: string
          original_message: string
          sentiment: string | null
          source_message_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          final_reply: string
          id?: string
          original_message: string
          sentiment?: string | null
          source_message_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          final_reply?: string
          id?: string
          original_message?: string
          sentiment?: string | null
          source_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dataset_attcliente_source_message_id_fkey"
            columns: ["source_message_id"]
            isOneToOne: false
            referencedRelation: "inbox_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      employee_departments: {
        Row: {
          created_at: string | null
          department_id: number | null
          employee_id: number | null
          id: number
        }
        Insert: {
          created_at?: string | null
          department_id?: number | null
          employee_id?: number | null
          id?: number
        }
        Update: {
          created_at?: string | null
          department_id?: number | null
          employee_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_departments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          center_id: number | null
          document_name: string
          document_type: string
          employee_id: number
          file_size: number | null
          file_type: string | null
          file_url: string
          id: number
          notes: string | null
          period: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          center_id?: number | null
          document_name: string
          document_type: string
          employee_id: number
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: number
          notes?: string | null
          period?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          center_id?: number | null
          document_name?: string
          document_type?: string
          employee_id?: number
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: number
          notes?: string | null
          period?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_shifts: {
        Row: {
          created_at: string | null
          date: string
          employee_id: number
          id: number
          shift_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          employee_id: number
          id?: number
          shift_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          employee_id?: number
          id?: number
          shift_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_shifts_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          assigned_modules: string[] | null
          banco: string | null
          bank_account_number: string | null
          base_role: string | null
          birth_date: string | null
          center_id: number | null
          city: string | null
          contract_type: string | null
          created_at: string | null
          degree: string | null
          departamento: string | null
          department_id: number | null
          dni: string | null
          education_level: string | null
          email: string
          first_name: string | null
          foto_perfil: string | null
          gross_annual_salary: number | null
          hire_date: string | null
          iban: string | null
          id: number
          is_active: boolean | null
          jacket_size: string | null
          last_name: string | null
          name: string
          observaciones: string | null
          pant_size: string | null
          phone: string | null
          position: string | null
          postal_code: string | null
          profile_image: string | null
          role: Database["public"]["Enums"]["user_role"]
          shirt_size: string | null
          specialization: string | null
          termination_date: string | null
          tiene_alta_ss: boolean | null
          tiene_contrato_firmado: boolean | null
          tiene_formacion_riesgos: boolean | null
          updated_at: string | null
          user_id: string | null
          vestuario_camiseta_entrenamiento: string | null
          vestuario_chaleco_frio: string | null
          vestuario_chandal: string | null
          vestuario_observaciones: string | null
          vestuario_pantalon_corto: string | null
          vestuario_polo_verde: string | null
          vestuario_sudadera_frio: string | null
          work_schedule: string | null
        }
        Insert: {
          address?: string | null
          assigned_modules?: string[] | null
          banco?: string | null
          bank_account_number?: string | null
          base_role?: string | null
          birth_date?: string | null
          center_id?: number | null
          city?: string | null
          contract_type?: string | null
          created_at?: string | null
          degree?: string | null
          departamento?: string | null
          department_id?: number | null
          dni?: string | null
          education_level?: string | null
          email: string
          first_name?: string | null
          foto_perfil?: string | null
          gross_annual_salary?: number | null
          hire_date?: string | null
          iban?: string | null
          id?: number
          is_active?: boolean | null
          jacket_size?: string | null
          last_name?: string | null
          name: string
          observaciones?: string | null
          pant_size?: string | null
          phone?: string | null
          position?: string | null
          postal_code?: string | null
          profile_image?: string | null
          role: Database["public"]["Enums"]["user_role"]
          shirt_size?: string | null
          specialization?: string | null
          termination_date?: string | null
          tiene_alta_ss?: boolean | null
          tiene_contrato_firmado?: boolean | null
          tiene_formacion_riesgos?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          vestuario_camiseta_entrenamiento?: string | null
          vestuario_chaleco_frio?: string | null
          vestuario_chandal?: string | null
          vestuario_observaciones?: string | null
          vestuario_pantalon_corto?: string | null
          vestuario_polo_verde?: string | null
          vestuario_sudadera_frio?: string | null
          work_schedule?: string | null
        }
        Update: {
          address?: string | null
          assigned_modules?: string[] | null
          banco?: string | null
          bank_account_number?: string | null
          base_role?: string | null
          birth_date?: string | null
          center_id?: number | null
          city?: string | null
          contract_type?: string | null
          created_at?: string | null
          degree?: string | null
          departamento?: string | null
          department_id?: number | null
          dni?: string | null
          education_level?: string | null
          email?: string
          first_name?: string | null
          foto_perfil?: string | null
          gross_annual_salary?: number | null
          hire_date?: string | null
          iban?: string | null
          id?: number
          is_active?: boolean | null
          jacket_size?: string | null
          last_name?: string | null
          name?: string
          observaciones?: string | null
          pant_size?: string | null
          phone?: string | null
          position?: string | null
          postal_code?: string | null
          profile_image?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          shirt_size?: string | null
          specialization?: string | null
          termination_date?: string | null
          tiene_alta_ss?: boolean | null
          tiene_contrato_firmado?: boolean | null
          tiene_formacion_riesgos?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          vestuario_camiseta_entrenamiento?: string | null
          vestuario_chaleco_frio?: string | null
          vestuario_chandal?: string | null
          vestuario_observaciones?: string | null
          vestuario_pantalon_corto?: string | null
          vestuario_polo_verde?: string | null
          vestuario_sudadera_frio?: string | null
          work_schedule?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      employees_backup_2025_12_05: {
        Row: {
          address: string | null
          apellidos: string | null
          assigned_modules: string[] | null
          banco: string | null
          base_role: string | null
          birth_date: string | null
          cargo: string | null
          center_id: number | null
          ciudad: string | null
          codigo_postal: string | null
          contract_type: string | null
          created_at: string | null
          departamento: string | null
          department_id: number | null
          direccion: string | null
          dni: string | null
          email: string | null
          especialidad: string | null
          fecha_alta: string | null
          fecha_baja: string | null
          fecha_nacimiento: string | null
          foto_perfil: string | null
          hire_date: string | null
          iban: string | null
          id: number | null
          is_active: boolean | null
          jornada: string | null
          name: string | null
          nivel_estudios: string | null
          nombre: string | null
          numero_cuenta: string | null
          observaciones: string | null
          phone: string | null
          position: string | null
          profile_image: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          salario_bruto_anual: number | null
          talla_camiseta: string | null
          talla_chaqueton: string | null
          talla_pantalon: string | null
          telefono: string | null
          tiene_alta_ss: boolean | null
          tiene_contrato_firmado: boolean | null
          tiene_formacion_riesgos: boolean | null
          tipo_contrato: string | null
          titulacion: string | null
          updated_at: string | null
          user_id: string | null
          vestuario_camiseta_entrenamiento: string | null
          vestuario_chaleco_frio: string | null
          vestuario_chandal: string | null
          vestuario_observaciones: string | null
          vestuario_pantalon_corto: string | null
          vestuario_polo_verde: string | null
          vestuario_sudadera_frio: string | null
        }
        Insert: {
          address?: string | null
          apellidos?: string | null
          assigned_modules?: string[] | null
          banco?: string | null
          base_role?: string | null
          birth_date?: string | null
          cargo?: string | null
          center_id?: number | null
          ciudad?: string | null
          codigo_postal?: string | null
          contract_type?: string | null
          created_at?: string | null
          departamento?: string | null
          department_id?: number | null
          direccion?: string | null
          dni?: string | null
          email?: string | null
          especialidad?: string | null
          fecha_alta?: string | null
          fecha_baja?: string | null
          fecha_nacimiento?: string | null
          foto_perfil?: string | null
          hire_date?: string | null
          iban?: string | null
          id?: number | null
          is_active?: boolean | null
          jornada?: string | null
          name?: string | null
          nivel_estudios?: string | null
          nombre?: string | null
          numero_cuenta?: string | null
          observaciones?: string | null
          phone?: string | null
          position?: string | null
          profile_image?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          salario_bruto_anual?: number | null
          talla_camiseta?: string | null
          talla_chaqueton?: string | null
          talla_pantalon?: string | null
          telefono?: string | null
          tiene_alta_ss?: boolean | null
          tiene_contrato_firmado?: boolean | null
          tiene_formacion_riesgos?: boolean | null
          tipo_contrato?: string | null
          titulacion?: string | null
          updated_at?: string | null
          user_id?: string | null
          vestuario_camiseta_entrenamiento?: string | null
          vestuario_chaleco_frio?: string | null
          vestuario_chandal?: string | null
          vestuario_observaciones?: string | null
          vestuario_pantalon_corto?: string | null
          vestuario_polo_verde?: string | null
          vestuario_sudadera_frio?: string | null
        }
        Update: {
          address?: string | null
          apellidos?: string | null
          assigned_modules?: string[] | null
          banco?: string | null
          base_role?: string | null
          birth_date?: string | null
          cargo?: string | null
          center_id?: number | null
          ciudad?: string | null
          codigo_postal?: string | null
          contract_type?: string | null
          created_at?: string | null
          departamento?: string | null
          department_id?: number | null
          direccion?: string | null
          dni?: string | null
          email?: string | null
          especialidad?: string | null
          fecha_alta?: string | null
          fecha_baja?: string | null
          fecha_nacimiento?: string | null
          foto_perfil?: string | null
          hire_date?: string | null
          iban?: string | null
          id?: number | null
          is_active?: boolean | null
          jornada?: string | null
          name?: string | null
          nivel_estudios?: string | null
          nombre?: string | null
          numero_cuenta?: string | null
          observaciones?: string | null
          phone?: string | null
          position?: string | null
          profile_image?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          salario_bruto_anual?: number | null
          talla_camiseta?: string | null
          talla_chaqueton?: string | null
          talla_pantalon?: string | null
          telefono?: string | null
          tiene_alta_ss?: boolean | null
          tiene_contrato_firmado?: boolean | null
          tiene_formacion_riesgos?: boolean | null
          tipo_contrato?: string | null
          titulacion?: string | null
          updated_at?: string | null
          user_id?: string | null
          vestuario_camiseta_entrenamiento?: string | null
          vestuario_chaleco_frio?: string | null
          vestuario_chandal?: string | null
          vestuario_observaciones?: string | null
          vestuario_pantalon_corto?: string | null
          vestuario_polo_verde?: string | null
          vestuario_sudadera_frio?: string | null
        }
        Relationships: []
      }
      evento_centros: {
        Row: {
          centro_id: number | null
          evento_id: number | null
          id: number
        }
        Insert: {
          centro_id?: number | null
          evento_id?: number | null
          id?: number
        }
        Update: {
          centro_id?: number | null
          evento_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "evento_centros_centro_id_fkey"
            columns: ["centro_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_centros_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_checklist: {
        Row: {
          completado: boolean | null
          completado_at: string | null
          completado_por: number | null
          created_at: string | null
          descripcion: string | null
          evento_id: number | null
          fecha_limite: string
          id: number
          nombre: string
          notas: string | null
          plantilla_id: number | null
        }
        Insert: {
          completado?: boolean | null
          completado_at?: string | null
          completado_por?: number | null
          created_at?: string | null
          descripcion?: string | null
          evento_id?: number | null
          fecha_limite: string
          id?: number
          nombre: string
          notas?: string | null
          plantilla_id?: number | null
        }
        Update: {
          completado?: boolean | null
          completado_at?: string | null
          completado_por?: number | null
          created_at?: string | null
          descripcion?: string | null
          evento_id?: number | null
          fecha_limite?: string
          id?: number
          nombre?: string
          notas?: string | null
          plantilla_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_checklist_completado_por_fkey"
            columns: ["completado_por"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_checklist_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_checklist_plantilla_id_fkey"
            columns: ["plantilla_id"]
            isOneToOne: false
            referencedRelation: "evento_checklist_plantilla"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_checklist_plantilla: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          dias_antes: number
          id: number
          nombre: string
          obligatorio: boolean | null
          orden: number | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          dias_antes?: number
          id?: number
          nombre: string
          obligatorio?: boolean | null
          orden?: number | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          dias_antes?: number
          id?: number
          nombre?: string
          obligatorio?: boolean | null
          orden?: number | null
        }
        Relationships: []
      }
      evento_encuestas: {
        Row: {
          comentarios: string | null
          created_at: string | null
          evento_id: number | null
          id: number
          origen: string | null
          participante_id: number | null
          participante_nombre: string | null
          puntuacion_contenido: number | null
          puntuacion_general: number | null
          puntuacion_organizacion: number | null
          recomendaria: boolean | null
        }
        Insert: {
          comentarios?: string | null
          created_at?: string | null
          evento_id?: number | null
          id?: number
          origen?: string | null
          participante_id?: number | null
          participante_nombre?: string | null
          puntuacion_contenido?: number | null
          puntuacion_general?: number | null
          puntuacion_organizacion?: number | null
          recomendaria?: boolean | null
        }
        Update: {
          comentarios?: string | null
          created_at?: string | null
          evento_id?: number | null
          id?: number
          origen?: string | null
          participante_id?: number | null
          participante_nombre?: string | null
          puntuacion_contenido?: number | null
          puntuacion_general?: number | null
          puntuacion_organizacion?: number | null
          recomendaria?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_encuestas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_gastos: {
        Row: {
          coste: number
          created_at: string | null
          enlace_factura: string | null
          evento_id: number | null
          fecha: string | null
          id: number
          pagado: boolean | null
          partida: string
        }
        Insert: {
          coste?: number
          created_at?: string | null
          enlace_factura?: string | null
          evento_id?: number | null
          fecha?: string | null
          id?: number
          pagado?: boolean | null
          partida: string
        }
        Update: {
          coste?: number
          created_at?: string | null
          enlace_factura?: string | null
          evento_id?: number | null
          fecha?: string | null
          id?: number
          pagado?: boolean | null
          partida?: string
        }
        Relationships: [
          {
            foreignKeyName: "evento_gastos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_informes: {
        Row: {
          aprendizajes: string | null
          conclusiones: string | null
          contras: string | null
          created_at: string | null
          created_by: number | null
          evento_id: number | null
          id: number
          objetivo_comunidad: string | null
          objetivo_organizacion: string | null
          objetivo_participacion: string | null
          objetivo_ventas: string | null
          pros: string | null
          valoracion_encargado: number | null
        }
        Insert: {
          aprendizajes?: string | null
          conclusiones?: string | null
          contras?: string | null
          created_at?: string | null
          created_by?: number | null
          evento_id?: number | null
          id?: number
          objetivo_comunidad?: string | null
          objetivo_organizacion?: string | null
          objetivo_participacion?: string | null
          objetivo_ventas?: string | null
          pros?: string | null
          valoracion_encargado?: number | null
        }
        Update: {
          aprendizajes?: string | null
          conclusiones?: string | null
          contras?: string | null
          created_at?: string | null
          created_by?: number | null
          evento_id?: number | null
          id?: number
          objetivo_comunidad?: string | null
          objetivo_organizacion?: string | null
          objetivo_participacion?: string | null
          objetivo_ventas?: string | null
          pros?: string | null
          valoracion_encargado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_informes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_informes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: true
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_ingresos: {
        Row: {
          concepto: string | null
          created_at: string | null
          evento_id: number | null
          fecha: string | null
          id: number
          importe: number
        }
        Insert: {
          concepto?: string | null
          created_at?: string | null
          evento_id?: number | null
          fecha?: string | null
          id?: number
          importe?: number
        }
        Update: {
          concepto?: string | null
          created_at?: string | null
          evento_id?: number | null
          fecha?: string | null
          id?: number
          importe?: number
        }
        Relationships: [
          {
            foreignKeyName: "evento_ingresos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_materiales: {
        Row: {
          archivo_url: string | null
          created_at: string | null
          evento_id: number | null
          id: number
          nombre: string
          subido_por: number | null
          tipo: string | null
        }
        Insert: {
          archivo_url?: string | null
          created_at?: string | null
          evento_id?: number | null
          id?: number
          nombre: string
          subido_por?: number | null
          tipo?: string | null
        }
        Update: {
          archivo_url?: string | null
          created_at?: string | null
          evento_id?: number | null
          id?: number
          nombre?: string
          subido_por?: number | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_materiales_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_materiales_subido_por_fkey"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_participantes: {
        Row: {
          asistio: boolean | null
          created_at: string | null
          email: string | null
          equipo_nombre: string | null
          evento_id: number | null
          fecha_inscripcion: string | null
          id: number
          modalidad: string | null
          nombre: string
          nombre_equipo: string | null
          telefono: string | null
        }
        Insert: {
          asistio?: boolean | null
          created_at?: string | null
          email?: string | null
          equipo_nombre?: string | null
          evento_id?: number | null
          fecha_inscripcion?: string | null
          id?: number
          modalidad?: string | null
          nombre: string
          nombre_equipo?: string | null
          telefono?: string | null
        }
        Update: {
          asistio?: boolean | null
          created_at?: string | null
          email?: string | null
          equipo_nombre?: string | null
          evento_id?: number | null
          fecha_inscripcion?: string | null
          id?: number
          modalidad?: string | null
          nombre?: string
          nombre_equipo?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_participantes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_servicios: {
        Row: {
          coste: number | null
          empresa: string | null
          evento_id: number | null
          id: number
          localizacion: string | null
          tipo: string | null
        }
        Insert: {
          coste?: number | null
          empresa?: string | null
          evento_id?: number | null
          id?: number
          localizacion?: string | null
          tipo?: string | null
        }
        Update: {
          coste?: number | null
          empresa?: string | null
          evento_id?: number | null
          id?: number
          localizacion?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_servicios_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_tareas: {
        Row: {
          completado_at: string | null
          completado_por: number | null
          created_at: string | null
          descripcion: string
          enlaces: string | null
          evento_id: number | null
          fecha_limite: string | null
          id: number
          observaciones: string | null
          persona_designada_id: number | null
          prioridad: string | null
          realizado: boolean | null
        }
        Insert: {
          completado_at?: string | null
          completado_por?: number | null
          created_at?: string | null
          descripcion: string
          enlaces?: string | null
          evento_id?: number | null
          fecha_limite?: string | null
          id?: number
          observaciones?: string | null
          persona_designada_id?: number | null
          prioridad?: string | null
          realizado?: boolean | null
        }
        Update: {
          completado_at?: string | null
          completado_por?: number | null
          created_at?: string | null
          descripcion?: string
          enlaces?: string | null
          evento_id?: number | null
          fecha_limite?: string | null
          id?: number
          observaciones?: string | null
          persona_designada_id?: number | null
          prioridad?: string | null
          realizado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_tareas_completado_por_fkey"
            columns: ["completado_por"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_tareas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_tareas_persona_designada_id_fkey"
            columns: ["persona_designada_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          alcance: string | null
          asistencia_no_socios: boolean | null
          center_id: number | null
          created_at: string | null
          created_by: number | null
          descripcion: string | null
          empresa_colaboradora: string | null
          enlace_multimedia: string | null
          estado: string | null
          fecha_evento: string
          fecha_limite_inscripcion: string | null
          id: number
          localizacion: string | null
          modelo_economico: string | null
          nombre: string
          observaciones: string | null
          periodicidad: string | null
          plazas_esperadas: number | null
          plazas_max: number | null
          plazas_reales: number | null
          precio: number | null
          responsable_id: number | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          alcance?: string | null
          asistencia_no_socios?: boolean | null
          center_id?: number | null
          created_at?: string | null
          created_by?: number | null
          descripcion?: string | null
          empresa_colaboradora?: string | null
          enlace_multimedia?: string | null
          estado?: string | null
          fecha_evento: string
          fecha_limite_inscripcion?: string | null
          id?: number
          localizacion?: string | null
          modelo_economico?: string | null
          nombre: string
          observaciones?: string | null
          periodicidad?: string | null
          plazas_esperadas?: number | null
          plazas_max?: number | null
          plazas_reales?: number | null
          precio?: number | null
          responsable_id?: number | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          alcance?: string | null
          asistencia_no_socios?: boolean | null
          center_id?: number | null
          created_at?: string | null
          created_by?: number | null
          descripcion?: string | null
          empresa_colaboradora?: string | null
          enlace_multimedia?: string | null
          estado?: string | null
          fecha_evento?: string
          fecha_limite_inscripcion?: string | null
          id?: number
          localizacion?: string | null
          modelo_economico?: string | null
          nombre?: string
          observaciones?: string | null
          periodicidad?: string | null
          plazas_esperadas?: number | null
          plazas_max?: number | null
          plazas_reales?: number | null
          precio?: number | null
          responsable_id?: number | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_data: {
        Row: {
          alquiler: number | null
          año: number
          center_id: string
          center_name: string
          created_at: string | null
          entrenamiento_personal: number | null
          entrenamientos_grupales: number | null
          fisioterapia: number | null
          id: string
          mantenimiento: number | null
          marketing: number | null
          mes: number
          nominas: number | null
          nutricion: number | null
          otros: number | null
          royalty: number | null
          seguridad_social: number | null
          software_gestion: number | null
          suministros: number | null
          updated_at: string | null
        }
        Insert: {
          alquiler?: number | null
          año: number
          center_id: string
          center_name: string
          created_at?: string | null
          entrenamiento_personal?: number | null
          entrenamientos_grupales?: number | null
          fisioterapia?: number | null
          id?: string
          mantenimiento?: number | null
          marketing?: number | null
          mes: number
          nominas?: number | null
          nutricion?: number | null
          otros?: number | null
          royalty?: number | null
          seguridad_social?: number | null
          software_gestion?: number | null
          suministros?: number | null
          updated_at?: string | null
        }
        Update: {
          alquiler?: number | null
          año?: number
          center_id?: string
          center_name?: string
          created_at?: string | null
          entrenamiento_personal?: number | null
          entrenamientos_grupales?: number | null
          fisioterapia?: number | null
          id?: string
          mantenimiento?: number | null
          marketing?: number | null
          mes?: number
          nominas?: number | null
          nutricion?: number | null
          otros?: number | null
          royalty?: number | null
          seguridad_social?: number | null
          software_gestion?: number | null
          suministros?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      franquiciado_mensajes: {
        Row: {
          asunto: string
          categoria: string
          center_id: number | null
          created_at: string | null
          estado: string | null
          franquiciado_id: number | null
          id: number
          mensaje: string
          prioridad: string | null
          respondido_at: string | null
          respondido_por: number | null
          respuesta: string | null
        }
        Insert: {
          asunto: string
          categoria: string
          center_id?: number | null
          created_at?: string | null
          estado?: string | null
          franquiciado_id?: number | null
          id?: number
          mensaje: string
          prioridad?: string | null
          respondido_at?: string | null
          respondido_por?: number | null
          respuesta?: string | null
        }
        Update: {
          asunto?: string
          categoria?: string
          center_id?: number | null
          created_at?: string | null
          estado?: string | null
          franquiciado_id?: number | null
          id?: number
          mensaje?: string
          prioridad?: string | null
          respondido_at?: string | null
          respondido_por?: number | null
          respuesta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franquiciado_mensajes_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franquiciado_mensajes_franquiciado_id_fkey"
            columns: ["franquiciado_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franquiciado_mensajes_respondido_por_fkey"
            columns: ["respondido_por"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos_extras: {
        Row: {
          categoria: string
          concepto: string
          created_at: string | null
          financial_data_id: string | null
          id: string
          importe: number
        }
        Insert: {
          categoria: string
          concepto: string
          created_at?: string | null
          financial_data_id?: string | null
          id?: string
          importe: number
        }
        Update: {
          categoria?: string
          concepto?: string
          created_at?: string | null
          financial_data_id?: string | null
          id?: string
          importe?: number
        }
        Relationships: [
          {
            foreignKeyName: "gastos_extras_financial_data_id_fkey"
            columns: ["financial_data_id"]
            isOneToOne: false
            referencedRelation: "financial_data"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos_marca: {
        Row: {
          año: number
          concepto: string
          created_at: string | null
          fecha: string
          id: string
          importe: number
          iva: boolean
          mes: number
          notas: string | null
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          año: number
          concepto: string
          created_at?: string | null
          fecha: string
          id?: string
          importe: number
          iva?: boolean
          mes: number
          notas?: string | null
          tipo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          año?: number
          concepto?: string
          created_at?: string | null
          fecha?: string
          id?: string
          importe?: number
          iva?: boolean
          mes?: number
          notas?: string | null
          tipo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      holidays: {
        Row: {
          center_id: string | null
          created_at: string | null
          date: string
          id: number
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          center_id?: string | null
          created_at?: string | null
          date: string
          id?: number
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          center_id?: string | null
          created_at?: string | null
          date?: string
          id?: number
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hr_updates: {
        Row: {
          affected_employees: number
          description: string
          id: number
          update_date: string | null
        }
        Insert: {
          affected_employees: number
          description: string
          id?: number
          update_date?: string | null
        }
        Update: {
          affected_employees?: number
          description?: string
          id?: number
          update_date?: string | null
        }
        Relationships: []
      }
      inbox_messages: {
        Row: {
          agent_proposal: Json | null
          content: string
          created_at: string | null
          id: string
          raw_data: Json | null
          received_at: string | null
          reply_sent_at: string | null
          reply_to_send: string | null
          sender: string
          source: string | null
          status: string | null
          wodbuster_chat_id: string | null
        }
        Insert: {
          agent_proposal?: Json | null
          content: string
          created_at?: string | null
          id?: string
          raw_data?: Json | null
          received_at?: string | null
          reply_sent_at?: string | null
          reply_to_send?: string | null
          sender: string
          source?: string | null
          status?: string | null
          wodbuster_chat_id?: string | null
        }
        Update: {
          agent_proposal?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          raw_data?: Json | null
          received_at?: string | null
          reply_sent_at?: string | null
          reply_to_send?: string | null
          sender?: string
          source?: string | null
          status?: string | null
          wodbuster_chat_id?: string | null
        }
        Relationships: []
      }
      incident_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      incident_comments: {
        Row: {
          comment: string
          created_at: string | null
          employee_id: number
          id: number
          incident_id: number
          is_internal: boolean | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          employee_id: number
          id?: number
          incident_id: number
          is_internal?: boolean | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          employee_id?: number
          id?: number
          incident_id?: number
          is_internal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_comments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_comments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_comments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_types: {
        Row: {
          approver_role: string | null
          category_id: number | null
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          max_days: number | null
          name: string
          requires_approval: boolean | null
          requires_clothing_details: boolean | null
          requires_dates: boolean | null
        }
        Insert: {
          approver_role?: string | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          max_days?: number | null
          name: string
          requires_approval?: boolean | null
          requires_clothing_details?: boolean | null
          requires_dates?: boolean | null
        }
        Update: {
          approver_role?: string | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          max_days?: number | null
          name?: string
          requires_approval?: boolean | null
          requires_clothing_details?: boolean | null
          requires_dates?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "incident_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          approved_at: string | null
          approved_by: number | null
          attachments: Json | null
          clothing_size: string | null
          clothing_type: string | null
          comments: Json | null
          created_at: string | null
          days_requested: number | null
          description: string
          employee_id: number
          end_date: string | null
          id: number
          incident_type_id: number
          priority: string | null
          quantity: number | null
          rejection_reason: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: number | null
          attachments?: Json | null
          clothing_size?: string | null
          clothing_type?: string | null
          comments?: Json | null
          created_at?: string | null
          days_requested?: number | null
          description: string
          employee_id: number
          end_date?: string | null
          id?: number
          incident_type_id: number
          priority?: string | null
          quantity?: number | null
          rejection_reason?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: number | null
          attachments?: Json | null
          clothing_size?: string | null
          clothing_type?: string | null
          comments?: Json | null
          created_at?: string | null
          days_requested?: number | null
          description?: string
          employee_id?: number
          end_date?: string | null
          id?: number
          incident_type_id?: number
          priority?: string | null
          quantity?: number | null
          rejection_reason?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_incident_type_id_fkey"
            columns: ["incident_type_id"]
            isOneToOne: false
            referencedRelation: "incident_types"
            referencedColumns: ["id"]
          },
        ]
      }
      ingresos_marca: {
        Row: {
          año: number
          concepto: string
          created_at: string | null
          fecha: string
          id: string
          importe: number
          iva: boolean
          mes: number
          notas: string | null
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          año: number
          concepto: string
          created_at?: string | null
          fecha: string
          id?: string
          importe: number
          iva?: boolean
          mes: number
          notas?: string | null
          tipo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          año?: number
          concepto?: string
          created_at?: string | null
          fecha?: string
          id?: string
          importe?: number
          iva?: boolean
          mes?: number
          notas?: string | null
          tipo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          cantidad_actual: number | null
          cantidad_inicial: number | null
          categoria: string | null
          center_id: number | null
          codigo: string
          compradas: number | null
          condition: string | null
          created_at: string | null
          deterioradas: number | null
          estado: string | null
          fecha_ultima_compra: string | null
          id: number
          last_updated: string | null
          location: string | null
          max_stock: number | null
          min_stock: number | null
          nombre_item: string
          notas: string | null
          precio_compra: number | null
          precio_venta: number | null
          proveedor: string | null
          purchase_price: number | null
          quantity: number | null
          roturas: number | null
          sale_price: number | null
          size: string | null
          status: string | null
          supplier: string | null
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          cantidad_actual?: number | null
          cantidad_inicial?: number | null
          categoria?: string | null
          center_id?: number | null
          codigo: string
          compradas?: number | null
          condition?: string | null
          created_at?: string | null
          deterioradas?: number | null
          estado?: string | null
          fecha_ultima_compra?: string | null
          id?: number
          last_updated?: string | null
          location?: string | null
          max_stock?: number | null
          min_stock?: number | null
          nombre_item: string
          notas?: string | null
          precio_compra?: number | null
          precio_venta?: number | null
          proveedor?: string | null
          purchase_price?: number | null
          quantity?: number | null
          roturas?: number | null
          sale_price?: number | null
          size?: string | null
          status?: string | null
          supplier?: string | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          cantidad_actual?: number | null
          cantidad_inicial?: number | null
          categoria?: string | null
          center_id?: number | null
          codigo?: string
          compradas?: number | null
          condition?: string | null
          created_at?: string | null
          deterioradas?: number | null
          estado?: string | null
          fecha_ultima_compra?: string | null
          id?: number
          last_updated?: string | null
          location?: string | null
          max_stock?: number | null
          min_stock?: number | null
          nombre_item?: string
          notas?: string | null
          precio_compra?: number | null
          precio_venta?: number | null
          proveedor?: string | null
          purchase_price?: number | null
          quantity?: number | null
          roturas?: number | null
          sale_price?: number | null
          size?: string | null
          status?: string | null
          supplier?: string | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          center_id: number | null
          created_at: string | null
          id: number
          inventory_item_id: number
          location_from: string | null
          location_to: string | null
          movement_type: string
          new_quantity: number
          performed_by: number | null
          previous_quantity: number
          quantity: number
          reason: string | null
          reference_id: number | null
          reference_type: string | null
          type: string | null
          unit_cost: number | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          center_id?: number | null
          created_at?: string | null
          id?: number
          inventory_item_id: number
          location_from?: string | null
          location_to?: string | null
          movement_type: string
          new_quantity: number
          performed_by?: number | null
          previous_quantity: number
          quantity: number
          reason?: string | null
          reference_id?: number | null
          reference_type?: string | null
          type?: string | null
          unit_cost?: number | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          center_id?: number | null
          created_at?: string | null
          id?: number
          inventory_item_id?: number
          location_from?: string | null
          location_to?: string | null
          movement_type?: string
          new_quantity?: number
          performed_by?: number | null
          previous_quantity?: number
          quantity?: number
          reason?: string | null
          reference_id?: number | null
          reference_type?: string | null
          type?: string | null
          unit_cost?: number | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_movements_item"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inventory_movements_item_id"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_leads: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          investment_range: string
          investor_profile: string | null
          message: string | null
          phone: string
          source: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          investment_range: string
          investor_profile?: string | null
          message?: string | null
          phone: string
          source: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          investment_range?: string
          investor_profile?: string | null
          message?: string | null
          phone?: string
          source?: string
          status?: string | null
        }
        Relationships: []
      }
      lead_documents: {
        Row: {
          created_at: string | null
          enviado_fecha: string | null
          firmado: boolean | null
          id: string
          lead_id: string | null
          nombre: string
          tipo: string | null
          url: string | null
          visto: boolean | null
        }
        Insert: {
          created_at?: string | null
          enviado_fecha?: string | null
          firmado?: boolean | null
          id?: string
          lead_id?: string | null
          nombre: string
          tipo?: string | null
          url?: string | null
          visto?: boolean | null
        }
        Update: {
          created_at?: string | null
          enviado_fecha?: string | null
          firmado?: boolean | null
          id?: string
          lead_id?: string | null
          nombre?: string
          tipo?: string | null
          url?: string | null
          visto?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_interactions: {
        Row: {
          asunto: string | null
          contenido: string | null
          created_at: string | null
          created_by: string | null
          direccion: string | null
          duracion_minutos: number | null
          fecha: string | null
          fecha_seguimiento: string | null
          id: string
          lead_id: string | null
          proximos_pasos: string | null
          respondido: boolean | null
          resultado: string | null
          tarea_creada: boolean | null
          tarea_id: string | null
          tipo: string
        }
        Insert: {
          asunto?: string | null
          contenido?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          duracion_minutos?: number | null
          fecha?: string | null
          fecha_seguimiento?: string | null
          id?: string
          lead_id?: string | null
          proximos_pasos?: string | null
          respondido?: boolean | null
          resultado?: string | null
          tarea_creada?: boolean | null
          tarea_id?: string | null
          tipo: string
        }
        Update: {
          asunto?: string | null
          contenido?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          duracion_minutos?: number | null
          fecha?: string | null
          fecha_seguimiento?: string | null
          id?: string
          lead_id?: string | null
          proximos_pasos?: string | null
          respondido?: boolean | null
          resultado?: string | null
          tarea_creada?: boolean | null
          tarea_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          asignado_a: string | null
          cargo: string | null
          ciudad: string | null
          created_at: string | null
          email: string | null
          empresa: string | null
          estado: string | null
          fecha_primer_contacto: string | null
          fecha_proxima_accion: string | null
          fecha_ultimo_contacto: string | null
          id: string
          nombre: string
          notas: string | null
          porcentaje_interes: number | null
          prioridad: string | null
          probabilidad_cierre: number | null
          proxima_accion: string | null
          proyecto_nombre: string | null
          rango_inversion: string | null
          telefono: string | null
          updated_at: string | null
          valoracion_proyecto: number | null
        }
        Insert: {
          asignado_a?: string | null
          cargo?: string | null
          ciudad?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          fecha_primer_contacto?: string | null
          fecha_proxima_accion?: string | null
          fecha_ultimo_contacto?: string | null
          id?: string
          nombre: string
          notas?: string | null
          porcentaje_interes?: number | null
          prioridad?: string | null
          probabilidad_cierre?: number | null
          proxima_accion?: string | null
          proyecto_nombre?: string | null
          rango_inversion?: string | null
          telefono?: string | null
          updated_at?: string | null
          valoracion_proyecto?: number | null
        }
        Update: {
          asignado_a?: string | null
          cargo?: string | null
          ciudad?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          fecha_primer_contacto?: string | null
          fecha_proxima_accion?: string | null
          fecha_ultimo_contacto?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          porcentaje_interes?: number | null
          prioridad?: string | null
          probabilidad_cierre?: number | null
          proxima_accion?: string | null
          proyecto_nombre?: string | null
          rango_inversion?: string | null
          telefono?: string | null
          updated_at?: string | null
          valoracion_proyecto?: number | null
        }
        Relationships: []
      }
      maintenance_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          center_id: string
          center_name: string
          created_at: string | null
          id: string
          message: string
          related_id: string | null
          severity: string | null
          title: string
          type: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          center_id: string
          center_name: string
          created_at?: string | null
          id?: string
          message: string
          related_id?: string | null
          severity?: string | null
          title: string
          type: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          center_id?: string
          center_name?: string
          created_at?: string | null
          id?: string
          message?: string
          related_id?: string | null
          severity?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      maintenance_concepts: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          inspection_frequency: string | null
          name: string
          priority: string | null
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id: string
          inspection_frequency?: string | null
          name: string
          priority?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          inspection_frequency?: string | null
          name?: string
          priority?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_concepts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "maintenance_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_inspection_items: {
        Row: {
          assigned_to: string | null
          beni_notification_sent_at: string | null
          beni_notified: boolean | null
          can_close_task: boolean | null
          completed_date: string | null
          concept_id: string | null
          concept_name: string
          created_at: string | null
          due_date: string | null
          estimated_cost: number | null
          id: string
          inspection_id: string | null
          is_critical_for_checklist: boolean | null
          observations: string | null
          photos_deterioro: string[] | null
          photos_reparacion: string[] | null
          photos_required: boolean | null
          status: string
          task_priority: string | null
          task_status: string | null
          task_to_perform: string | null
          updated_at: string | null
          zone_id: string | null
          zone_name: string
        }
        Insert: {
          assigned_to?: string | null
          beni_notification_sent_at?: string | null
          beni_notified?: boolean | null
          can_close_task?: boolean | null
          completed_date?: string | null
          concept_id?: string | null
          concept_name: string
          created_at?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          inspection_id?: string | null
          is_critical_for_checklist?: boolean | null
          observations?: string | null
          photos_deterioro?: string[] | null
          photos_reparacion?: string[] | null
          photos_required?: boolean | null
          status: string
          task_priority?: string | null
          task_status?: string | null
          task_to_perform?: string | null
          updated_at?: string | null
          zone_id?: string | null
          zone_name: string
        }
        Update: {
          assigned_to?: string | null
          beni_notification_sent_at?: string | null
          beni_notified?: boolean | null
          can_close_task?: boolean | null
          completed_date?: string | null
          concept_id?: string | null
          concept_name?: string
          created_at?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          inspection_id?: string | null
          is_critical_for_checklist?: boolean | null
          observations?: string | null
          photos_deterioro?: string[] | null
          photos_reparacion?: string[] | null
          photos_required?: boolean | null
          status?: string
          task_priority?: string | null
          task_status?: string | null
          task_to_perform?: string | null
          updated_at?: string | null
          zone_id?: string | null
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_inspection_items_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "maintenance_concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_inspection_items_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "maintenance_inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_inspection_items_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "maintenance_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_inspections: {
        Row: {
          center_id: string
          center_name: string
          created_at: string | null
          id: string
          inspection_date: string
          inspection_month: string
          inspection_year: number
          inspector_email: string
          inspector_name: string
          items_bad: number | null
          items_ok: number | null
          items_regular: number | null
          notes: string | null
          overall_score: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          total_items: number | null
          updated_at: string | null
        }
        Insert: {
          center_id: string
          center_name: string
          created_at?: string | null
          id?: string
          inspection_date: string
          inspection_month: string
          inspection_year: number
          inspector_email: string
          inspector_name: string
          items_bad?: number | null
          items_ok?: number | null
          items_regular?: number | null
          notes?: string | null
          overall_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          total_items?: number | null
          updated_at?: string | null
        }
        Update: {
          center_id?: string
          center_name?: string
          created_at?: string | null
          id?: string
          inspection_date?: string
          inspection_month?: string
          inspection_year?: number
          inspector_email?: string
          inspector_name?: string
          items_bad?: number | null
          items_ok?: number | null
          items_regular?: number | null
          notes?: string | null
          overall_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          total_items?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_reports: {
        Row: {
          average_score: number | null
          center_id: string
          center_name: string
          cost_trend: string | null
          generated_at: string | null
          generated_by: string
          id: string
          issues_pending: number | null
          issues_resolved: number | null
          issues_trend: string | null
          period_end: string
          period_start: string
          report_type: string
          score_trend: string | null
          total_cost: number | null
          total_inspections: number | null
          total_issues: number | null
        }
        Insert: {
          average_score?: number | null
          center_id: string
          center_name: string
          cost_trend?: string | null
          generated_at?: string | null
          generated_by: string
          id?: string
          issues_pending?: number | null
          issues_resolved?: number | null
          issues_trend?: string | null
          period_end: string
          period_start: string
          report_type: string
          score_trend?: string | null
          total_cost?: number | null
          total_inspections?: number | null
          total_issues?: number | null
        }
        Update: {
          average_score?: number | null
          center_id?: string
          center_name?: string
          cost_trend?: string | null
          generated_at?: string | null
          generated_by?: string
          id?: string
          issues_pending?: number | null
          issues_resolved?: number | null
          issues_trend?: string | null
          period_end?: string
          period_start?: string
          report_type?: string
          score_trend?: string | null
          total_cost?: number | null
          total_inspections?: number | null
          total_issues?: number | null
        }
        Relationships: []
      }
      maintenance_review_notifications: {
        Row: {
          created_at: string | null
          deadline_date: string | null
          id: number
          message: string
          notification_type: string
          read_at: string | null
          review_id: number | null
          status: string | null
          user_email: string
        }
        Insert: {
          created_at?: string | null
          deadline_date?: string | null
          id?: number
          message: string
          notification_type: string
          read_at?: string | null
          review_id?: number | null
          status?: string | null
          user_email: string
        }
        Update: {
          created_at?: string | null
          deadline_date?: string | null
          id?: number
          message?: string
          notification_type?: string
          read_at?: string | null
          review_id?: number | null
          status?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_review_notifications_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "quarterly_maintenance_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          assigned_by: string
          assigned_to: string | null
          center_id: string
          center_name: string
          completed_date: string | null
          concept_name: string
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_cost: number | null
          estimated_hours: number | null
          id: string
          inspection_item_id: string | null
          notes: string | null
          photos_after: string[] | null
          photos_before: string[] | null
          priority: string | null
          started_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          zone_name: string
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_by: string
          assigned_to?: string | null
          center_id: string
          center_name: string
          completed_date?: string | null
          concept_name: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          inspection_item_id?: string | null
          notes?: string | null
          photos_after?: string[] | null
          photos_before?: string[] | null
          priority?: string | null
          started_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          zone_name: string
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_by?: string
          assigned_to?: string | null
          center_id?: string
          center_name?: string
          completed_date?: string | null
          concept_name?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          inspection_item_id?: string | null
          notes?: string | null
          photos_after?: string[] | null
          photos_before?: string[] | null
          priority?: string | null
          started_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_inspection_item_id_fkey"
            columns: ["inspection_item_id"]
            isOneToOne: false
            referencedRelation: "maintenance_inspection_items"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tickets: {
        Row: {
          assigned_to: string | null
          center_id: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          inspection_item_id: string | null
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          center_id: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          inspection_item_id?: string | null
          priority: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          center_id?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          inspection_item_id?: string | null
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tickets_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tickets_inspection_item_id_fkey"
            columns: ["inspection_item_id"]
            isOneToOne: false
            referencedRelation: "maintenance_inspection_items"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_zones: {
        Row: {
          active: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketing_content: {
        Row: {
          categoria: string | null
          centro_especifico_id: number | null
          creado_por_id: number | null
          created_at: string | null
          enlace_drive: string | null
          estado_grabacion: string | null
          estado_publicacion: string | null
          fecha_limite: string | null
          filmmaker_asignado_id: number | null
          id: number
          perfil_ig: string | null
          tipo_contenido: string | null
          titulo: string
        }
        Insert: {
          categoria?: string | null
          centro_especifico_id?: number | null
          creado_por_id?: number | null
          created_at?: string | null
          enlace_drive?: string | null
          estado_grabacion?: string | null
          estado_publicacion?: string | null
          fecha_limite?: string | null
          filmmaker_asignado_id?: number | null
          id?: never
          perfil_ig?: string | null
          tipo_contenido?: string | null
          titulo: string
        }
        Update: {
          categoria?: string | null
          centro_especifico_id?: number | null
          creado_por_id?: number | null
          created_at?: string | null
          enlace_drive?: string | null
          estado_grabacion?: string | null
          estado_publicacion?: string | null
          fecha_limite?: string | null
          filmmaker_asignado_id?: number | null
          id?: never
          perfil_ig?: string | null
          tipo_contenido?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_content_centro_especifico_id_fkey"
            columns: ["centro_especifico_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_content_creado_por_id_fkey"
            columns: ["creado_por_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_content_filmmaker_asignado_id_fkey"
            columns: ["filmmaker_asignado_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_bottlenecks: {
        Row: {
          asignado_a: string | null
          categoria: string | null
          created_at: string | null
          departamento: string
          fecha_limite: string | null
          id: number
          meeting_id: number | null
          motivo: string
          recurrente: boolean | null
          tarea_id: number | null
          tarea_titulo: string
        }
        Insert: {
          asignado_a?: string | null
          categoria?: string | null
          created_at?: string | null
          departamento: string
          fecha_limite?: string | null
          id?: number
          meeting_id?: number | null
          motivo: string
          recurrente?: boolean | null
          tarea_id?: number | null
          tarea_titulo: string
        }
        Update: {
          asignado_a?: string | null
          categoria?: string | null
          created_at?: string | null
          departamento?: string
          fecha_limite?: string | null
          id?: number
          meeting_id?: number | null
          motivo?: string
          recurrente?: boolean | null
          tarea_id?: number | null
          tarea_titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_bottlenecks_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_metrics: {
        Row: {
          created_at: string | null
          departamento: string
          id: number
          meeting_id: number | null
          porcentaje_cumplimiento: number | null
          tareas_anteriores_completadas: number | null
          tareas_anteriores_pendientes: number | null
          tareas_anteriores_total: number | null
          tareas_recurrentes_completadas: number | null
          tareas_recurrentes_total: number | null
          tipo_reunion: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          departamento: string
          id?: number
          meeting_id?: number | null
          porcentaje_cumplimiento?: number | null
          tareas_anteriores_completadas?: number | null
          tareas_anteriores_pendientes?: number | null
          tareas_anteriores_total?: number | null
          tareas_recurrentes_completadas?: number | null
          tareas_recurrentes_total?: number | null
          tipo_reunion?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          departamento?: string
          id?: number
          meeting_id?: number | null
          porcentaje_cumplimiento?: number | null
          tareas_anteriores_completadas?: number | null
          tareas_anteriores_pendientes?: number | null
          tareas_anteriores_total?: number | null
          tareas_recurrentes_completadas?: number | null
          tareas_recurrentes_total?: number | null
          tipo_reunion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_metrics_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_objectives: {
        Row: {
          created_at: string | null
          cumplido: boolean | null
          departamento: string
          id: number
          meeting_id: number | null
          nombre: string
          tipo_objetivo: string | null
          unidad: string | null
          valor_anterior: string | null
          valor_objetivo: string | null
        }
        Insert: {
          created_at?: string | null
          cumplido?: boolean | null
          departamento: string
          id?: number
          meeting_id?: number | null
          nombre: string
          tipo_objetivo?: string | null
          unidad?: string | null
          valor_anterior?: string | null
          valor_objetivo?: string | null
        }
        Update: {
          created_at?: string | null
          cumplido?: boolean | null
          departamento?: string
          id?: number
          meeting_id?: number | null
          nombre?: string
          tipo_objetivo?: string | null
          unidad?: string | null
          valor_anterior?: string | null
          valor_objetivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_objectives_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_recordings: {
        Row: {
          audio_url: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          meeting_id: number
          meeting_minutes: string | null
          status: string | null
          tasks_assigned: Json | null
          transcript: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          meeting_id: number
          meeting_minutes?: string | null
          status?: string | null
          tasks_assigned?: Json | null
          transcript?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          meeting_id?: number
          meeting_minutes?: string | null
          status?: string | null
          tasks_assigned?: Json | null
          transcript?: string | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          agenda: string | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          date: string
          department: string
          duration_minutes: number | null
          end_time: string | null
          id: number
          kpis: Json | null
          lead_id: string | null
          leader_email: string | null
          notes: string | null
          numero_cuellos_botella: number | null
          objectives: string[] | null
          participants: string[] | null
          porcentaje_cumplimiento: number | null
          start_time: string | null
          status: string | null
          summary: string | null
          tasks: Json | null
          tiene_cuellos_botella: boolean | null
          tipo_reunion: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          agenda?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          date: string
          department: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: number
          kpis?: Json | null
          lead_id?: string | null
          leader_email?: string | null
          notes?: string | null
          numero_cuellos_botella?: number | null
          objectives?: string[] | null
          participants?: string[] | null
          porcentaje_cumplimiento?: number | null
          start_time?: string | null
          status?: string | null
          summary?: string | null
          tasks?: Json | null
          tiene_cuellos_botella?: boolean | null
          tipo_reunion?: string | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          agenda?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          department?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: number
          kpis?: Json | null
          lead_id?: string | null
          leader_email?: string | null
          notes?: string | null
          numero_cuellos_botella?: number | null
          objectives?: string[] | null
          participants?: string[] | null
          porcentaje_cumplimiento?: number | null
          start_time?: string | null
          status?: string | null
          summary?: string | null
          tasks?: Json | null
          tiene_cuellos_botella?: boolean | null
          tipo_reunion?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      metricas_departamento: {
        Row: {
          calculado_en: string | null
          departamento: string
          efectividad_reuniones: number | null
          id: string
          mes: string
          numero_reuniones: number | null
          objetivos_completados: number | null
          objetivos_en_riesgo: number | null
          objetivos_totales: number | null
          prediccion_siguiente_mes: number | null
          score_rendimiento: number | null
          tasa_cumplimiento: number | null
          tendencia: string | null
          tiempo_promedio_resolucion: number | null
        }
        Insert: {
          calculado_en?: string | null
          departamento: string
          efectividad_reuniones?: number | null
          id?: string
          mes: string
          numero_reuniones?: number | null
          objetivos_completados?: number | null
          objetivos_en_riesgo?: number | null
          objetivos_totales?: number | null
          prediccion_siguiente_mes?: number | null
          score_rendimiento?: number | null
          tasa_cumplimiento?: number | null
          tendencia?: string | null
          tiempo_promedio_resolucion?: number | null
        }
        Update: {
          calculado_en?: string | null
          departamento?: string
          efectividad_reuniones?: number | null
          id?: string
          mes?: string
          numero_reuniones?: number | null
          objetivos_completados?: number | null
          objetivos_en_riesgo?: number | null
          objetivos_totales?: number | null
          prediccion_siguiente_mes?: number | null
          score_rendimiento?: number | null
          tasa_cumplimiento?: number | null
          tendencia?: string | null
          tiempo_promedio_resolucion?: number | null
        }
        Relationships: []
      }
      monthly_cuotas: {
        Row: {
          cantidad: number
          created_at: string | null
          cuota_type_id: string | null
          financial_data_id: string | null
          id: string
          importe: number
          iva: number
        }
        Insert: {
          cantidad?: number
          created_at?: string | null
          cuota_type_id?: string | null
          financial_data_id?: string | null
          id?: string
          importe: number
          iva: number
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          cuota_type_id?: string | null
          financial_data_id?: string | null
          id?: string
          importe?: number
          iva?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_cuotas_cuota_type_id_fkey"
            columns: ["cuota_type_id"]
            isOneToOne: false
            referencedRelation: "cuota_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_cuotas_financial_data_id_fkey"
            columns: ["financial_data_id"]
            isOneToOne: false
            referencedRelation: "financial_data"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          metadata: Json | null
          priority: Database["public"]["Enums"]["notification_priority"]
          recipient_email: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: number | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          recipient_email?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string
          user_id?: number | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          recipient_email?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      objetivos: {
        Row: {
          acciones_correctivas: string | null
          actualizado_en: string | null
          asignado_a: string | null
          creado_en: string | null
          creado_por: string
          departamento: string
          descripcion: string | null
          dificultad: number | null
          estado: string | null
          etiquetas: string[] | null
          fecha_inicio: string | null
          fecha_limite: string | null
          id: string
          impacto_negocio: number | null
          mes_objetivo: string
          metrica_actual: Json | null
          metrica_objetivo: Json | null
          motivo_no_cumplimiento: string | null
          objetivo_padre: string | null
          porcentaje_completitud: number | null
          probabilidad_cumplimiento: number | null
          reunion_origen: string | null
          riesgo_calculado: string | null
          tipo_asignacion: string | null
          titulo: string
          ultima_prediccion: string | null
        }
        Insert: {
          acciones_correctivas?: string | null
          actualizado_en?: string | null
          asignado_a?: string | null
          creado_en?: string | null
          creado_por: string
          departamento: string
          descripcion?: string | null
          dificultad?: number | null
          estado?: string | null
          etiquetas?: string[] | null
          fecha_inicio?: string | null
          fecha_limite?: string | null
          id?: string
          impacto_negocio?: number | null
          mes_objetivo: string
          metrica_actual?: Json | null
          metrica_objetivo?: Json | null
          motivo_no_cumplimiento?: string | null
          objetivo_padre?: string | null
          porcentaje_completitud?: number | null
          probabilidad_cumplimiento?: number | null
          reunion_origen?: string | null
          riesgo_calculado?: string | null
          tipo_asignacion?: string | null
          titulo: string
          ultima_prediccion?: string | null
        }
        Update: {
          acciones_correctivas?: string | null
          actualizado_en?: string | null
          asignado_a?: string | null
          creado_en?: string | null
          creado_por?: string
          departamento?: string
          descripcion?: string | null
          dificultad?: number | null
          estado?: string | null
          etiquetas?: string[] | null
          fecha_inicio?: string | null
          fecha_limite?: string | null
          id?: string
          impacto_negocio?: number | null
          mes_objetivo?: string
          metrica_actual?: Json | null
          metrica_objetivo?: Json | null
          motivo_no_cumplimiento?: string | null
          objetivo_padre?: string | null
          porcentaje_completitud?: number | null
          probabilidad_cumplimiento?: number | null
          reunion_origen?: string | null
          riesgo_calculado?: string | null
          tipo_asignacion?: string | null
          titulo?: string
          ultima_prediccion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objetivos_objetivo_padre_fkey"
            columns: ["objetivo_padre"]
            isOneToOne: false
            referencedRelation: "objetivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objetivos_reunion_origen_fkey"
            columns: ["reunion_origen"]
            isOneToOne: false
            referencedRelation: "reuniones"
            referencedColumns: ["id"]
          },
        ]
      }
      online_calendar: {
        Row: {
          caption: string | null
          content_id: string | null
          created_at: string | null
          hashtags: string | null
          id: string
          metrics: Json | null
          notes: string | null
          platform: string | null
          profile: string | null
          scheduled_at: string
          status: string | null
          url: string | null
        }
        Insert: {
          caption?: string | null
          content_id?: string | null
          created_at?: string | null
          hashtags?: string | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          platform?: string | null
          profile?: string | null
          scheduled_at: string
          status?: string | null
          url?: string | null
        }
        Update: {
          caption?: string | null
          content_id?: string | null
          created_at?: string | null
          hashtags?: string | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          platform?: string | null
          profile?: string | null
          scheduled_at?: string
          status?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "online_calendar_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "online_content"
            referencedColumns: ["id"]
          },
        ]
      }
      online_clients: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          harbiz_id: string | null
          id: string
          join_date: string | null
          last_connection: string | null
          next_payment_date: string | null
          notes: string | null
          origin: string | null
          payment_method: string | null
          plan: string | null
          status: string | null
          total_paid: number | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          harbiz_id?: string | null
          id?: string
          join_date?: string | null
          last_connection?: string | null
          next_payment_date?: string | null
          notes?: string | null
          origin?: string | null
          payment_method?: string | null
          plan?: string | null
          status?: string | null
          total_paid?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          harbiz_id?: string | null
          id?: string
          join_date?: string | null
          last_connection?: string | null
          next_payment_date?: string | null
          notes?: string | null
          origin?: string | null
          payment_method?: string | null
          plan?: string | null
          status?: string | null
          total_paid?: number | null
        }
        Relationships: []
      }
      online_content: {
        Row: {
          buyer_persona: string | null
          category: string | null
          created_at: string | null
          cta: string | null
          description: string | null
          display_id: string | null
          duration: number | null
          editing_date: string | null
          editor: string | null
          gym_compatible: boolean | null
          id: string
          level: string | null
          locations: string[] | null
          materials_url: string | null
          notes: string | null
          objective: string | null
          people: string[] | null
          platforms: string[] | null
          producer: string | null
          recording_date: string | null
          scheduled_date: string | null
          status: string | null
          subcategory: string | null
          tags: string[] | null
          title: string
          video_url: string | null
        }
        Insert: {
          buyer_persona?: string | null
          category?: string | null
          created_at?: string | null
          cta?: string | null
          description?: string | null
          display_id?: string | null
          duration?: number | null
          editing_date?: string | null
          editor?: string | null
          gym_compatible?: boolean | null
          id?: string
          level?: string | null
          locations?: string[] | null
          materials_url?: string | null
          notes?: string | null
          objective?: string | null
          people?: string[] | null
          platforms?: string[] | null
          producer?: string | null
          recording_date?: string | null
          scheduled_date?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          video_url?: string | null
        }
        Update: {
          buyer_persona?: string | null
          category?: string | null
          created_at?: string | null
          cta?: string | null
          description?: string | null
          display_id?: string | null
          duration?: number | null
          editing_date?: string | null
          editor?: string | null
          gym_compatible?: boolean | null
          id?: string
          level?: string | null
          locations?: string[] | null
          materials_url?: string | null
          notes?: string | null
          objective?: string | null
          people?: string[] | null
          platforms?: string[] | null
          producer?: string | null
          recording_date?: string | null
          scheduled_date?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      online_ideas: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_completed: boolean | null
          notes: string | null
          priority: string | null
          status: string | null
          suggested_by: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          suggested_by?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          suggested_by?: string | null
          title?: string
        }
        Relationships: []
      }
      online_metrics: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          period_end: string | null
          period_start: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          type?: string | null
        }
        Relationships: []
      }
      online_tasks: {
        Row: {
          assigned_to: string[] | null
          completed_at: string | null
          created_at: string | null
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          origin: string | null
          priority: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          origin?: string | null
          priority?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          origin?: string | null
          priority?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          available_stock: number | null
          created_at: string | null
          has_sufficient_stock: boolean | null
          id: number
          order_id: string
          product_id: number | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          available_stock?: number | null
          created_at?: string | null
          has_sufficient_stock?: boolean | null
          id?: number
          order_id: string
          product_id?: number | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          available_stock?: number | null
          created_at?: string | null
          has_sufficient_stock?: boolean | null
          id?: number
          order_id?: string
          product_id?: number | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string | null
          created_by: string | null
          delivery_date: string | null
          estimated_delivery: string | null
          from_location: string
          id: string
          notes: string | null
          order_date: string
          order_source: string | null
          processed_date: string | null
          review_id: number | null
          sent_date: string | null
          status: string | null
          to_location: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          delivery_date?: string | null
          estimated_delivery?: string | null
          from_location: string
          id: string
          notes?: string | null
          order_date?: string
          order_source?: string | null
          processed_date?: string | null
          review_id?: number | null
          sent_date?: string | null
          status?: string | null
          to_location: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          delivery_date?: string | null
          estimated_delivery?: string | null
          from_location?: string
          id?: string
          notes?: string | null
          order_date?: string
          order_source?: string | null
          processed_date?: string | null
          review_id?: number | null
          sent_date?: string | null
          status?: string | null
          to_location?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      outbox_messages: {
        Row: {
          approved_at: string | null
          content: string
          created_at: string | null
          id: string
          recipient: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          content: string
          created_at?: string | null
          id?: string
          recipient: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          content?: string
          created_at?: string | null
          id?: string
          recipient?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      pending_signatures: {
        Row: {
          center_id: string
          center_name: string
          created_at: string | null
          employee_id: string | null
          employee_name: string | null
          expires_at: string
          id: number
          signature_id: string
          signature_type: string
          signed_at: string | null
          status: string
        }
        Insert: {
          center_id: string
          center_name: string
          created_at?: string | null
          employee_id?: string | null
          employee_name?: string | null
          expires_at: string
          id?: number
          signature_id: string
          signature_type: string
          signed_at?: string | null
          status?: string
        }
        Update: {
          center_id?: string
          center_name?: string
          created_at?: string | null
          employee_id?: string | null
          employee_name?: string | null
          expires_at?: string
          id?: number
          signature_id?: string
          signature_type?: string
          signed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      plantillas_departamento: {
        Row: {
          activa: boolean | null
          actualizado_en: string | null
          creado_en: string | null
          creado_por: string
          departamento: string
          frecuencia_revision: string | null
          id: string
          metricas_clave: string[] | null
          nombre_plantilla: string
          notificaciones_automaticas: boolean | null
          objetivos_predefinidos: Json | null
          tipo_reunion: string
          umbrales_alerta: Json | null
        }
        Insert: {
          activa?: boolean | null
          actualizado_en?: string | null
          creado_en?: string | null
          creado_por: string
          departamento: string
          frecuencia_revision?: string | null
          id?: string
          metricas_clave?: string[] | null
          nombre_plantilla: string
          notificaciones_automaticas?: boolean | null
          objetivos_predefinidos?: Json | null
          tipo_reunion: string
          umbrales_alerta?: Json | null
        }
        Update: {
          activa?: boolean | null
          actualizado_en?: string | null
          creado_en?: string | null
          creado_por?: string
          departamento?: string
          frecuencia_revision?: string | null
          id?: string
          metricas_clave?: string[] | null
          nombre_plantilla?: string
          notificaciones_automaticas?: boolean | null
          objetivos_predefinidos?: Json | null
          tipo_reunion?: string
          umbrales_alerta?: Json | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          alquiler_mensual: number | null
          capital_esperado: number | null
          created_at: string | null
          descripcion: string | null
          ebitda_actual: number | null
          ebitda_proyectado: number | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          investment_total: number | null
          metros_cuadrados: number | null
          name: string
          roi: number | null
          roi_proyectado: number | null
          shares_sold: number | null
          status: string | null
          ticket_disponible: number | null
          ticket_minimo: number | null
          tipo: string | null
          ubicacion: string | null
          updated_at: string | null
          valor_proyecto: number | null
        }
        Insert: {
          alquiler_mensual?: number | null
          capital_esperado?: number | null
          created_at?: string | null
          descripcion?: string | null
          ebitda_actual?: number | null
          ebitda_proyectado?: number | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          investment_total?: number | null
          metros_cuadrados?: number | null
          name: string
          roi?: number | null
          roi_proyectado?: number | null
          shares_sold?: number | null
          status?: string | null
          ticket_disponible?: number | null
          ticket_minimo?: number | null
          tipo?: string | null
          ubicacion?: string | null
          updated_at?: string | null
          valor_proyecto?: number | null
        }
        Update: {
          alquiler_mensual?: number | null
          capital_esperado?: number | null
          created_at?: string | null
          descripcion?: string | null
          ebitda_actual?: number | null
          ebitda_proyectado?: number | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          investment_total?: number | null
          metros_cuadrados?: number | null
          name?: string
          roi?: number | null
          roi_proyectado?: number | null
          shares_sold?: number | null
          status?: string | null
          ticket_disponible?: number | null
          ticket_minimo?: number | null
          tipo?: string | null
          ubicacion?: string | null
          updated_at?: string | null
          valor_proyecto?: number | null
        }
        Relationships: []
      }
      proveedores: {
        Row: {
          categoria: string | null
          center_id: number | null
          created_at: string | null
          created_by: number | null
          email: string | null
          id: number
          nombre: string
          notas: string | null
          servicio: string | null
          telefono: string | null
          valoracion: number | null
        }
        Insert: {
          categoria?: string | null
          center_id?: number | null
          created_at?: string | null
          created_by?: number | null
          email?: string | null
          id?: number
          nombre: string
          notas?: string | null
          servicio?: string | null
          telefono?: string | null
          valoracion?: number | null
        }
        Update: {
          categoria?: string | null
          center_id?: number | null
          created_at?: string | null
          created_by?: number | null
          email?: string | null
          id?: number
          nombre?: string
          notas?: string | null
          servicio?: string | null
          telefono?: string | null
          valoracion?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proveedores_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proveedores_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_tokens: {
        Row: {
          center_id: number
          created_at: string | null
          employee_id: string | null
          expires_at: string
          id: number
          is_used: boolean | null
          token: string
        }
        Insert: {
          center_id: number
          created_at?: string | null
          employee_id?: string | null
          expires_at: string
          id?: number
          is_used?: boolean | null
          token: string
        }
        Update: {
          center_id?: number
          created_at?: string | null
          employee_id?: string | null
          expires_at?: string
          id?: number
          is_used?: boolean | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_tokens_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_inventory_assignments: {
        Row: {
          assigned_to: string | null
          center_id: number | null
          center_name: string | null
          completed_at: string | null
          completed_by: string | null
          id: number
          review_id: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          assigned_to?: string | null
          center_id?: number | null
          center_name?: string | null
          completed_at?: string | null
          completed_by?: string | null
          id?: number
          review_id?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          assigned_to?: string | null
          center_id?: number | null
          center_name?: string | null
          completed_at?: string | null
          completed_by?: string | null
          id?: number
          review_id?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_inventory_assignments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarterly_inventory_assignments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "quarterly_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_inventory_results: {
        Row: {
          assignment_id: number | null
          counted_quantity: number | null
          id: number
          item_name: string
          observations: string | null
          system_quantity: number | null
        }
        Insert: {
          assignment_id?: number | null
          counted_quantity?: number | null
          id?: number
          item_name: string
          observations?: string | null
          system_quantity?: number | null
        }
        Update: {
          assignment_id?: number | null
          counted_quantity?: number | null
          id?: number
          item_name?: string
          observations?: string | null
          system_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_inventory_results_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "quarterly_review_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_maintenance_assignments: {
        Row: {
          assigned_to: string | null
          center_id: number | null
          center_name: string | null
          completed_at: string | null
          completed_by: string | null
          id: number
          review_id: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          assigned_to?: string | null
          center_id?: number | null
          center_name?: string | null
          completed_at?: string | null
          completed_by?: string | null
          id?: number
          review_id?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          assigned_to?: string | null
          center_id?: number | null
          center_name?: string | null
          completed_at?: string | null
          completed_by?: string | null
          id?: number
          review_id?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_maintenance_assignments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarterly_maintenance_assignments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "quarterly_maintenance_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_maintenance_items: {
        Row: {
          assignment_id: number | null
          concept_id: string
          concept_name: string
          created_at: string | null
          id: number
          is_critical: boolean | null
          observations: string | null
          photos_deterioro: string[] | null
          photos_reparacion: string[] | null
          status: string | null
          task_priority: string | null
          task_to_perform: string | null
          updated_at: string | null
          zone_id: string
          zone_name: string
        }
        Insert: {
          assignment_id?: number | null
          concept_id: string
          concept_name: string
          created_at?: string | null
          id?: number
          is_critical?: boolean | null
          observations?: string | null
          photos_deterioro?: string[] | null
          photos_reparacion?: string[] | null
          status?: string | null
          task_priority?: string | null
          task_to_perform?: string | null
          updated_at?: string | null
          zone_id: string
          zone_name: string
        }
        Update: {
          assignment_id?: number | null
          concept_id?: string
          concept_name?: string
          created_at?: string | null
          id?: number
          is_critical?: boolean | null
          observations?: string | null
          photos_deterioro?: string[] | null
          photos_reparacion?: string[] | null
          status?: string | null
          task_priority?: string | null
          task_to_perform?: string | null
          updated_at?: string | null
          zone_id?: string
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_maintenance_items_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "quarterly_maintenance_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_maintenance_results: {
        Row: {
          assignment_id: number | null
          equipment_name: string
          id: number
          observations: string | null
          status: string | null
        }
        Insert: {
          assignment_id?: number | null
          equipment_name: string
          id?: number
          observations?: string | null
          status?: string | null
        }
        Update: {
          assignment_id?: number | null
          equipment_name?: string
          id?: number
          observations?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_maintenance_results_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "quarterly_review_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_maintenance_reviews: {
        Row: {
          activated_at: string | null
          completed_centers: number | null
          created_by: string
          created_date: string | null
          deadline_date: string | null
          id: number
          notes: string | null
          quarter: string
          status: string | null
          total_centers: number | null
          year: number
        }
        Insert: {
          activated_at?: string | null
          completed_centers?: number | null
          created_by: string
          created_date?: string | null
          deadline_date?: string | null
          id?: number
          notes?: string | null
          quarter: string
          status?: string | null
          total_centers?: number | null
          year: number
        }
        Update: {
          activated_at?: string | null
          completed_centers?: number | null
          created_by?: string
          created_date?: string | null
          deadline_date?: string | null
          id?: number
          notes?: string | null
          quarter?: string
          status?: string | null
          total_centers?: number | null
          year?: number
        }
        Relationships: []
      }
      quarterly_review_assignments: {
        Row: {
          center_id: number | null
          completed_at: string | null
          completed_by: string | null
          id: number
          review_id: number | null
          status: string | null
        }
        Insert: {
          center_id?: number | null
          completed_at?: string | null
          completed_by?: string | null
          id?: number
          review_id?: number | null
          status?: string | null
        }
        Update: {
          center_id?: number | null
          completed_at?: string | null
          completed_by?: string | null
          id?: number
          review_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_review_assignments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarterly_review_assignments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "quarterly_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_review_items: {
        Row: {
          assignment_id: number | null
          category: string | null
          counted_quantity: number | null
          current_system_quantity: number
          deteriorated_quantity: number | null
          id: number
          inventory_item_id: number
          observations: string | null
          product_name: string
          regular_quantity: number | null
          regular_state_quantity: number | null
          review_id: number | null
          status: string | null
          to_remove_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          assignment_id?: number | null
          category?: string | null
          counted_quantity?: number | null
          current_system_quantity: number
          deteriorated_quantity?: number | null
          id?: number
          inventory_item_id: number
          observations?: string | null
          product_name: string
          regular_quantity?: number | null
          regular_state_quantity?: number | null
          review_id?: number | null
          status?: string | null
          to_remove_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: number | null
          category?: string | null
          counted_quantity?: number | null
          current_system_quantity?: number
          deteriorated_quantity?: number | null
          id?: number
          inventory_item_id?: number
          observations?: string | null
          product_name?: string
          regular_quantity?: number | null
          regular_state_quantity?: number | null
          review_id?: number | null
          status?: string | null
          to_remove_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_review_items_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "quarterly_inventory_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarterly_review_items_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "quarterly_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_reviews: {
        Row: {
          activated_at: string | null
          approved_by: string | null
          approved_date: string | null
          center_id: number
          center_name: string
          created_by: string
          created_date: string | null
          deadline_date: string | null
          id: number
          notes: string | null
          quarter: string
          review_date: string | null
          reviewed_by: string | null
          status: string | null
          total_discrepancies: number | null
          total_items: number | null
          type: string | null
          year: number
        }
        Insert: {
          activated_at?: string | null
          approved_by?: string | null
          approved_date?: string | null
          center_id: number
          center_name: string
          created_by: string
          created_date?: string | null
          deadline_date?: string | null
          id?: number
          notes?: string | null
          quarter: string
          review_date?: string | null
          reviewed_by?: string | null
          status?: string | null
          total_discrepancies?: number | null
          total_items?: number | null
          type?: string | null
          year: number
        }
        Update: {
          activated_at?: string | null
          approved_by?: string | null
          approved_date?: string | null
          center_id?: number
          center_name?: string
          created_by?: string
          created_date?: string | null
          deadline_date?: string | null
          id?: number
          notes?: string | null
          quarter?: string
          review_date?: string | null
          reviewed_by?: string | null
          status?: string | null
          total_discrepancies?: number | null
          total_items?: number | null
          type?: string | null
          year?: number
        }
        Relationships: []
      }
      reuniones: {
        Row: {
          acta_reunion: string | null
          actualizado_en: string | null
          creado_en: string | null
          creado_por: string
          departamento_objetivo: string | null
          descripcion: string | null
          efectividad_reunion: number | null
          estado: string | null
          fecha: string
          hora_fin: string
          hora_inicio: string
          id: string
          objetivos_creados: string[] | null
          objetivos_revisados: string[] | null
          participantes: string[] | null
          plantilla_utilizada: string | null
          tareas_generadas: string[] | null
          tiempo_real_duracion: number | null
          tipo: string | null
          tipo_reunion: string | null
          titulo: string
        }
        Insert: {
          acta_reunion?: string | null
          actualizado_en?: string | null
          creado_en?: string | null
          creado_por: string
          departamento_objetivo?: string | null
          descripcion?: string | null
          efectividad_reunion?: number | null
          estado?: string | null
          fecha: string
          hora_fin: string
          hora_inicio: string
          id?: string
          objetivos_creados?: string[] | null
          objetivos_revisados?: string[] | null
          participantes?: string[] | null
          plantilla_utilizada?: string | null
          tareas_generadas?: string[] | null
          tiempo_real_duracion?: number | null
          tipo?: string | null
          tipo_reunion?: string | null
          titulo: string
        }
        Update: {
          acta_reunion?: string | null
          actualizado_en?: string | null
          creado_en?: string | null
          creado_por?: string
          departamento_objetivo?: string | null
          descripcion?: string | null
          efectividad_reunion?: number | null
          estado?: string | null
          fecha?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          objetivos_creados?: string[] | null
          objetivos_revisados?: string[] | null
          participantes?: string[] | null
          plantilla_utilizada?: string | null
          tareas_generadas?: string[] | null
          tiempo_real_duracion?: number | null
          tipo?: string | null
          tipo_reunion?: string | null
          titulo?: string
        }
        Relationships: []
      }
      reuniones_accionistas: {
        Row: {
          acta: string | null
          acta_pdf_url: string | null
          acuerdos: string[] | null
          asistentes: string[] | null
          center_id: number | null
          created_at: string | null
          created_by: number | null
          descripcion: string | null
          fecha: string
          hora: string | null
          id: number
          tipo: string | null
          titulo: string
        }
        Insert: {
          acta?: string | null
          acta_pdf_url?: string | null
          acuerdos?: string[] | null
          asistentes?: string[] | null
          center_id?: number | null
          created_at?: string | null
          created_by?: number | null
          descripcion?: string | null
          fecha: string
          hora?: string | null
          id?: number
          tipo?: string | null
          titulo: string
        }
        Update: {
          acta?: string | null
          acta_pdf_url?: string | null
          acuerdos?: string[] | null
          asistentes?: string[] | null
          center_id?: number | null
          created_at?: string | null
          created_by?: number | null
          descripcion?: string | null
          fecha?: string
          hora?: string | null
          id?: number
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "reuniones_accionistas_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reuniones_accionistas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      review_notifications: {
        Row: {
          id: number
          message: string
          notification_type: string
          read_at: string | null
          review_id: number | null
          sent_at: string | null
          user_email: string
        }
        Insert: {
          id?: number
          message: string
          notification_type: string
          read_at?: string | null
          review_id?: number | null
          sent_at?: string | null
          user_email: string
        }
        Update: {
          id?: number
          message?: string
          notification_type?: string
          read_at?: string | null
          review_id?: number | null
          sent_at?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_notifications_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "quarterly_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_changes: {
        Row: {
          approved_by: string | null
          change_date: string
          change_type: string | null
          created_at: string | null
          employee_id: string | null
          id: number
          new_shift_id: number | null
          notes: string | null
          original_shift_id: number | null
          reason: string | null
        }
        Insert: {
          approved_by?: string | null
          change_date: string
          change_type?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: number
          new_shift_id?: number | null
          notes?: string | null
          original_shift_id?: number | null
          reason?: string | null
        }
        Update: {
          approved_by?: string | null
          change_date?: string
          change_type?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: number
          new_shift_id?: number | null
          notes?: string | null
          original_shift_id?: number | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_changes_new_shift_id_fkey"
            columns: ["new_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_changes_original_shift_id_fkey"
            columns: ["original_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_coverage: {
        Row: {
          assigned_employees: number | null
          coverage_status: string | null
          created_at: string | null
          date: string
          id: number
          is_covered: boolean | null
          required_employees: number | null
          shift_id: number | null
        }
        Insert: {
          assigned_employees?: number | null
          coverage_status?: string | null
          created_at?: string | null
          date: string
          id?: number
          is_covered?: boolean | null
          required_employees?: number | null
          shift_id?: number | null
        }
        Update: {
          assigned_employees?: number | null
          coverage_status?: string | null
          created_at?: string | null
          date?: string
          id?: number
          is_covered?: boolean | null
          required_employees?: number | null
          shift_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_coverage_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_notifications: {
        Row: {
          created_at: string | null
          employee_email: string
          employee_id: string
          error_message: string | null
          id: number
          notification_type: string
          sent_at: string | null
          shift_id: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          employee_email: string
          employee_id: string
          error_message?: string | null
          id?: number
          notification_type: string
          sent_at?: string | null
          shift_id?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          employee_email?: string
          employee_id?: string
          error_message?: string | null
          id?: number
          notification_type?: string
          sent_at?: string | null
          shift_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_notifications_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          break_minutes: number | null
          center_id: number | null
          created_at: string | null
          description: string | null
          end_time: string
          friday: boolean | null
          id: number
          is_active: boolean | null
          is_support: boolean | null
          max_employees: number | null
          min_employees: number | null
          monday: boolean | null
          name: string
          published_at: string | null
          published_by: string | null
          saturday: boolean | null
          start_time: string
          status: string | null
          sunday: boolean | null
          thursday: boolean | null
          tuesday: boolean | null
          updated_at: string | null
          wednesday: boolean | null
        }
        Insert: {
          break_minutes?: number | null
          center_id?: number | null
          created_at?: string | null
          description?: string | null
          end_time: string
          friday?: boolean | null
          id?: number
          is_active?: boolean | null
          is_support?: boolean | null
          max_employees?: number | null
          min_employees?: number | null
          monday?: boolean | null
          name: string
          published_at?: string | null
          published_by?: string | null
          saturday?: boolean | null
          start_time: string
          status?: string | null
          sunday?: boolean | null
          thursday?: boolean | null
          tuesday?: boolean | null
          updated_at?: string | null
          wednesday?: boolean | null
        }
        Update: {
          break_minutes?: number | null
          center_id?: number | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          friday?: boolean | null
          id?: number
          is_active?: boolean | null
          is_support?: boolean | null
          max_employees?: number | null
          min_employees?: number | null
          monday?: boolean | null
          name?: string
          published_at?: string | null
          published_by?: string | null
          saturday?: boolean | null
          start_time?: string
          status?: string | null
          sunday?: boolean | null
          thursday?: boolean | null
          tuesday?: boolean | null
          updated_at?: string | null
          wednesday?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: number
          inventory_item_id: number
          is_resolved: boolean | null
          message: string
          resolved_at: string | null
          resolved_by: number | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: number
          inventory_item_id: number
          is_resolved?: boolean | null
          message: string
          resolved_at?: string | null
          resolved_by?: number | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: number
          inventory_item_id?: number
          is_resolved?: boolean | null
          message?: string
          resolved_at?: string | null
          resolved_by?: number | null
        }
        Relationships: []
      }
      supplier_order_items: {
        Row: {
          color: string | null
          created_at: string | null
          id: number
          inventory_item_id: number | null
          item_description: string | null
          item_name: string
          notes: string | null
          order_id: number
          quantity: number
          received_quantity: number | null
          size: string | null
          total_cost: number | null
          unit_cost: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: number
          inventory_item_id?: number | null
          item_description?: string | null
          item_name: string
          notes?: string | null
          order_id: number
          quantity: number
          received_quantity?: number | null
          size?: string | null
          total_cost?: number | null
          unit_cost: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: number
          inventory_item_id?: number | null
          item_description?: string | null
          item_name?: string
          notes?: string | null
          order_id?: number
          quantity?: number
          received_quantity?: number | null
          size?: string | null
          total_cost?: number | null
          unit_cost?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_orders: {
        Row: {
          actual_delivery: string | null
          approved_by: number | null
          created_at: string | null
          created_by: number | null
          discount_amount: number | null
          expected_delivery: string | null
          id: number
          invoice_number: string | null
          notes: string | null
          order_date: string
          order_number: string
          payment_date: string | null
          payment_status: string | null
          received_by: number | null
          shipping_cost: number | null
          status: string | null
          supplier_id: number
          tax_amount: number | null
          total_amount: number | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery?: string | null
          approved_by?: number | null
          created_at?: string | null
          created_by?: number | null
          discount_amount?: number | null
          expected_delivery?: string | null
          id?: number
          invoice_number?: string | null
          notes?: string | null
          order_date?: string
          order_number: string
          payment_date?: string | null
          payment_status?: string | null
          received_by?: number | null
          shipping_cost?: number | null
          status?: string | null
          supplier_id: number
          tax_amount?: number | null
          total_amount?: number | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery?: string | null
          approved_by?: number | null
          created_at?: string | null
          created_by?: number | null
          discount_amount?: number | null
          expected_delivery?: string | null
          id?: number
          invoice_number?: string | null
          notes?: string | null
          order_date?: string
          order_number?: string
          payment_date?: string | null
          payment_status?: string | null
          received_by?: number | null
          shipping_cost?: number | null
          status?: string | null
          supplier_id?: number
          tax_amount?: number | null
          total_amount?: number | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string[] | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          delivery_time: string | null
          email: string | null
          id: number
          is_active: boolean | null
          last_order_date: string | null
          name: string
          notes: string | null
          payment_terms: number | null
          phone: string | null
          postal_code: string | null
          rating: number | null
          tax_id: string | null
          total_amount: number | null
          total_orders: number | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string[] | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          delivery_time?: string | null
          email?: string | null
          id?: number
          is_active?: boolean | null
          last_order_date?: string | null
          name: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          tax_id?: string | null
          total_amount?: number | null
          total_orders?: number | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string[] | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          delivery_time?: string | null
          email?: string | null
          id?: number
          is_active?: boolean | null
          last_order_date?: string | null
          name?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          tax_id?: string | null
          total_amount?: number | null
          total_orders?: number | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string
          id: string
          level: string
          message: string
          meta: Json | null
          module: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level: string
          message: string
          meta?: Json | null
          module: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          message?: string
          meta?: Json | null
          module?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tareas: {
        Row: {
          actualizado_en: string | null
          asignado_a: string
          asignado_nombre: string | null
          attachments: Json | null
          completada_por: string | null
          completed_at: string | null
          completed_by: string | null
          creado_en: string | null
          creado_por: string
          departamento: string | null
          descripcion: string | null
          estado: string | null
          etiquetas: string[] | null
          fecha_completada: string | null
          fecha_finalizacion: string | null
          fecha_inicio: string | null
          fecha_limite: string
          fecha_verificacion: string | null
          id: string
          links: string[] | null
          notas_cierre: string | null
          prioridad: string | null
          reunion_acta: string | null
          reunion_fecha: string | null
          reunion_origen: number | null
          reunion_participantes: string | null
          reunion_titulo: string | null
          tiempo_estimado: number | null
          tiempo_real: number | null
          titulo: string
          updated_at: string | null
          verificacion_requerida: boolean | null
          verificado_por: string | null
        }
        Insert: {
          actualizado_en?: string | null
          asignado_a: string
          asignado_nombre?: string | null
          attachments?: Json | null
          completada_por?: string | null
          completed_at?: string | null
          completed_by?: string | null
          creado_en?: string | null
          creado_por: string
          departamento?: string | null
          descripcion?: string | null
          estado?: string | null
          etiquetas?: string[] | null
          fecha_completada?: string | null
          fecha_finalizacion?: string | null
          fecha_inicio?: string | null
          fecha_limite: string
          fecha_verificacion?: string | null
          id?: string
          links?: string[] | null
          notas_cierre?: string | null
          prioridad?: string | null
          reunion_acta?: string | null
          reunion_fecha?: string | null
          reunion_origen?: number | null
          reunion_participantes?: string | null
          reunion_titulo?: string | null
          tiempo_estimado?: number | null
          tiempo_real?: number | null
          titulo: string
          updated_at?: string | null
          verificacion_requerida?: boolean | null
          verificado_por?: string | null
        }
        Update: {
          actualizado_en?: string | null
          asignado_a?: string
          asignado_nombre?: string | null
          attachments?: Json | null
          completada_por?: string | null
          completed_at?: string | null
          completed_by?: string | null
          creado_en?: string | null
          creado_por?: string
          departamento?: string | null
          descripcion?: string | null
          estado?: string | null
          etiquetas?: string[] | null
          fecha_completada?: string | null
          fecha_finalizacion?: string | null
          fecha_inicio?: string | null
          fecha_limite?: string
          fecha_verificacion?: string | null
          id?: string
          links?: string[] | null
          notas_cierre?: string | null
          prioridad?: string | null
          reunion_acta?: string | null
          reunion_fecha?: string | null
          reunion_origen?: number | null
          reunion_participantes?: string | null
          reunion_titulo?: string | null
          tiempo_estimado?: number | null
          tiempo_real?: number | null
          titulo?: string
          updated_at?: string | null
          verificacion_requerida?: boolean | null
          verificado_por?: string | null
        }
        Relationships: []
      }
      time_records: {
        Row: {
          break_minutes: number | null
          center_id: number | null
          clock_in_location: Json | null
          clock_in_method: string | null
          clock_in_qr_token: string | null
          clock_in_time: string | null
          clock_out_location: Json | null
          clock_out_method: string | null
          clock_out_qr_token: string | null
          clock_out_time: string | null
          created_at: string | null
          date: string
          employee_id: string | null
          id: number
          is_early_departure: boolean | null
          is_late: boolean | null
          notes: string | null
          overtime_hours: number | null
          status: string | null
          total_hours: number | null
          type: string | null
          updated_at: string | null
          validated_by: string | null
          validation_notes: string | null
        }
        Insert: {
          break_minutes?: number | null
          center_id?: number | null
          clock_in_location?: Json | null
          clock_in_method?: string | null
          clock_in_qr_token?: string | null
          clock_in_time?: string | null
          clock_out_location?: Json | null
          clock_out_method?: string | null
          clock_out_qr_token?: string | null
          clock_out_time?: string | null
          created_at?: string | null
          date: string
          employee_id?: string | null
          id?: number
          is_early_departure?: boolean | null
          is_late?: boolean | null
          notes?: string | null
          overtime_hours?: number | null
          status?: string | null
          total_hours?: number | null
          type?: string | null
          updated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
        }
        Update: {
          break_minutes?: number | null
          center_id?: number | null
          clock_in_location?: Json | null
          clock_in_method?: string | null
          clock_in_qr_token?: string | null
          clock_in_time?: string | null
          clock_out_location?: Json | null
          clock_out_method?: string | null
          clock_out_qr_token?: string | null
          clock_out_time?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string | null
          id?: number
          is_early_departure?: boolean | null
          is_late?: boolean | null
          notes?: string | null
          overtime_hours?: number | null
          status?: string | null
          total_hours?: number | null
          type?: string | null
          updated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_records_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      timeclock_records: {
        Row: {
          center_id: number
          clock_in: string | null
          clock_out: string | null
          created_at: string | null
          date: string
          device_info: string | null
          employee_id: number
          id: number
          location_lat: number | null
          location_lng: number | null
          qr_token_used: string | null
          status: string | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          center_id: number
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date: string
          device_info?: string | null
          employee_id: number
          id?: number
          location_lat?: number | null
          location_lng?: number | null
          qr_token_used?: string | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          center_id?: number
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date?: string
          device_info?: string | null
          employee_id?: number
          id?: number
          location_lat?: number | null
          location_lng?: number | null
          qr_token_used?: string | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timeclock_records_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeclock_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          assigned_to: string | null
          brand: string | null
          category: string
          condition: string | null
          created_at: string | null
          current_location: string | null
          id: number
          last_maintenance: string | null
          model: string | null
          name: string
          next_maintenance: string | null
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          brand?: string | null
          category: string
          condition?: string | null
          created_at?: string | null
          current_location?: string | null
          id?: number
          last_maintenance?: string | null
          model?: string | null
          name: string
          next_maintenance?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          brand?: string | null
          category?: string
          condition?: string | null
          created_at?: string | null
          current_location?: string | null
          id?: number
          last_maintenance?: string | null
          model?: string | null
          name?: string
          next_maintenance?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      uniform_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          confirmation_deadline: string | null
          confirmed_at: string | null
          created_at: string
          delivered_at: string | null
          delivered_by: string | null
          dispute_reason: string | null
          employee_name: string
          id: number
          items: Json
          location: string
          notes: string | null
          reason: string
          requested_at: string
          shipped_at: string | null
          shipped_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          confirmation_deadline?: string | null
          confirmed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivered_by?: string | null
          dispute_reason?: string | null
          employee_name: string
          id?: number
          items: Json
          location: string
          notes?: string | null
          reason: string
          requested_at?: string
          shipped_at?: string | null
          shipped_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          confirmation_deadline?: string | null
          confirmed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivered_by?: string | null
          dispute_reason?: string | null
          employee_name?: string
          id?: number
          items?: Json
          location?: string
          notes?: string | null
          reason?: string
          requested_at?: string
          shipped_at?: string | null
          shipped_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      vacation_requests: {
        Row: {
          comments: string | null
          created_at: string | null
          days_requested: number
          employee_id: string
          employee_name: string
          end_date: string
          id: number
          reason: string
          requested_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          days_requested: number
          employee_id: string
          employee_name: string
          end_date: string
          id?: number
          reason: string
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          days_requested?: number
          employee_id?: string
          employee_name?: string
          end_date?: string
          id?: number
          reason?: string
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      wodbuster_snapshots: {
        Row: {
          active_count: number | null
          athlete_count: number | null
          center: string
          created_at: string
          data: Json
          id: string
          metrics: Json | null
        }
        Insert: {
          active_count?: number | null
          athlete_count?: number | null
          center: string
          created_at?: string
          data: Json
          id?: string
          metrics?: Json | null
        }
        Update: {
          active_count?: number | null
          athlete_count?: number | null
          center?: string
          created_at?: string
          data?: Json
          id?: string
          metrics?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      department_objectives_tracking: {
        Row: {
          departamento: string | null
          objetivo: string | null
          tipo_objetivo: string | null
          total_mediciones: number | null
          unidad: string | null
          valor_promedio: number | null
          veces_cumplido: number | null
        }
        Relationships: []
      }
      department_performance: {
        Row: {
          cuellos_botella_recurrentes: number | null
          cumplimiento_promedio: number | null
          departamento: string | null
          total_cuellos_botella: number | null
          total_reuniones: number | null
          total_tareas: number | null
          total_tareas_completadas: number | null
        }
        Relationships: []
      }
      incidents_with_details: {
        Row: {
          approved_at: string | null
          approved_by: number | null
          approved_by_name: string | null
          approver_role: string | null
          attachments: Json | null
          category_color: string | null
          category_icon: string | null
          category_name: string | null
          center_name: string | null
          clothing_size: string | null
          clothing_type: string | null
          comments: Json | null
          created_at: string | null
          days_requested: number | null
          description: string | null
          employee_email: string | null
          employee_id: number | null
          employee_name: string | null
          employee_position: string | null
          end_date: string | null
          id: number | null
          incident_type_description: string | null
          incident_type_id: number | null
          incident_type_name: string | null
          priority: string | null
          quantity: number | null
          rejection_reason: string | null
          requires_clothing_details: boolean | null
          requires_dates: boolean | null
          start_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_incident_type_id_fkey"
            columns: ["incident_type_id"]
            isOneToOne: false
            referencedRelation: "incident_types"
            referencedColumns: ["id"]
          },
        ]
      }
      resumen_mensual_marca: {
        Row: {
          año: number | null
          beneficio_neto: number | null
          iva_gastos: number | null
          iva_ingresos: number | null
          mes: number | null
          total_gastos: number | null
          total_ingresos: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_monthly_hours: {
        Args: { emp_id: string; target_month: string }
        Returns: {
          overtime_hours: number
          regular_hours: number
          total_hours: number
        }[]
      }
      calculate_worked_hours: {
        Args: { break_mins?: number; clock_in: string; clock_out: string }
        Returns: number
      }
      calculate_working_days: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      cleanup_expired_notifications: { Args: never; Returns: number }
      create_notification: {
        Args: {
          p_body?: string
          p_expires_in_hours?: number
          p_link?: string
          p_metadata?: Json
          p_priority?: Database["public"]["Enums"]["notification_priority"]
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: number
        }
        Returns: string
      }
      find_available_substitutes: {
        Args: {
          target_center_id: number
          target_date: string
          target_shift_id: number
        }
        Returns: {
          employee_id: string
          employee_name: string
          has_experience: boolean
          weekly_hours: number
        }[]
      }
      get_authenticated_user_role: { Args: never; Returns: string }
      get_employee_profile_by_id: {
        Args: { auth_id: string }
        Returns: {
          address: string | null
          assigned_modules: string[] | null
          banco: string | null
          bank_account_number: string | null
          base_role: string | null
          birth_date: string | null
          center_id: number | null
          city: string | null
          contract_type: string | null
          created_at: string | null
          degree: string | null
          departamento: string | null
          department_id: number | null
          dni: string | null
          education_level: string | null
          email: string
          first_name: string | null
          foto_perfil: string | null
          gross_annual_salary: number | null
          hire_date: string | null
          iban: string | null
          id: number
          is_active: boolean | null
          jacket_size: string | null
          last_name: string | null
          name: string
          observaciones: string | null
          pant_size: string | null
          phone: string | null
          position: string | null
          postal_code: string | null
          profile_image: string | null
          role: Database["public"]["Enums"]["user_role"]
          shirt_size: string | null
          specialization: string | null
          termination_date: string | null
          tiene_alta_ss: boolean | null
          tiene_contrato_firmado: boolean | null
          tiene_formacion_riesgos: boolean | null
          updated_at: string | null
          user_id: string | null
          vestuario_camiseta_entrenamiento: string | null
          vestuario_chaleco_frio: string | null
          vestuario_chandal: string | null
          vestuario_observaciones: string | null
          vestuario_pantalon_corto: string | null
          vestuario_polo_verde: string | null
          vestuario_sudadera_frio: string | null
          work_schedule: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "employees"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_incident_stats_by_center: {
        Args: { center_filter?: string }
        Returns: {
          avg_resolution_time: unknown
          center_id: string
          center_name: string
          critical_incidents: number
          open_incidents: number
          resolved_incidents: number
          total_incidents: number
        }[]
      }
      get_my_claim: { Args: { claim: string }; Returns: Json }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      mark_recurring_bottlenecks: { Args: never; Returns: undefined }
      validate_shift_coverage: {
        Args: { target_date: string }
        Returns: undefined
      }
    }
    Enums: {
      center_status: "Activo" | "En Construcción" | "Suspendido" | "Cerrado"
      center_type: "Propio" | "Franquicia"
      gasto_marca_tipo:
        | "personal"
        | "software"
        | "gestoria"
        | "autonomo"
        | "auditoria"
        | "mantenimiento_web"
        | "financiacion"
        | "otro"
      ingreso_marca_tipo:
        | "royalty"
        | "merchandising"
        | "arreglos"
        | "acuerdo_colaboracion"
        | "venta_franquicia"
        | "otro"
      notification_priority: "low" | "normal" | "high" | "urgent"
      notification_type:
        | "incident"
        | "event"
        | "message"
        | "task"
        | "system"
        | "vacation"
      user_role:
        | "Administrador"
        | "Director"
        | "Encargado"
        | "Empleado"
        | "Proveedor"
        | "SUPERADMIN"
        | "Admin"
        | "director_online"
        | "director_eventos"
        | "director_marketing"
        | "Franquiciado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      center_status: ["Activo", "En Construcción", "Suspendido", "Cerrado"],
      center_type: ["Propio", "Franquicia"],
      gasto_marca_tipo: [
        "personal",
        "software",
        "gestoria",
        "autonomo",
        "auditoria",
        "mantenimiento_web",
        "financiacion",
        "otro",
      ],
      ingreso_marca_tipo: [
        "royalty",
        "merchandising",
        "arreglos",
        "acuerdo_colaboracion",
        "venta_franquicia",
        "otro",
      ],
      notification_priority: ["low", "normal", "high", "urgent"],
      notification_type: [
        "incident",
        "event",
        "message",
        "task",
        "system",
        "vacation",
      ],
      user_role: [
        "Administrador",
        "Director",
        "Encargado",
        "Empleado",
        "Proveedor",
        "SUPERADMIN",
        "Admin",
        "director_online",
        "director_eventos",
        "director_marketing",
        "Franquiciado",
      ],
    },
  },
} as const
