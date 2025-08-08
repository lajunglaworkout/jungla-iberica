// src/types/database.ts

// Corresponde a la tabla 'employees'
export interface Employee {
  id: number;
  user_id: string; // UUID de Supabase Auth
  center_id?: number | null;
  name: string;
  email: string;
  phone?: string | null;
  dni?: string | null;
  birth_date?: string | null;
  address?: string | null;
  role: 'Administrador' | 'Director' | 'Encargado' | 'Empleado' | 'Proveedor';
  position?: string | null;
  hire_date?: string | null;
  contract_type?: string | null;
  profile_image?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Corresponde a la tabla 'centers'
export interface Center {
  id: number;
  name: string;
  address?: string | null;
  qr_code_id?: string | null;
  created_at: string;
  type: 'Propio' | 'Franquicia';
  status: 'Activo' | 'En Construcción' | 'Suspendido' | 'Cerrado';
  city?: string | null;
  postal_code?: string | null;
  province?: string | null;
  cif?: string | null;
  opening_date?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  manager_id?: number | null;
  franchisee_id?: number | null;
  monthly_fee?: number | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  bank_account?: string | null;
  billing_email?: string | null;
  max_capacity?: number | null;
  opening_hours?: string | null;
}