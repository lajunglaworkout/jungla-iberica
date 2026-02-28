// src/components/hr/shiftAdvanced/ShiftAdvancedTypes.ts

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  break_minutes: number;
  center_id: number;
  max_employees: number;
  min_employees: number;
  is_support: boolean;
  description?: string;
  is_active: boolean;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
  published_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  center_id: string;
  activo: boolean;
}

export interface ShiftAssignment {
  id: number;
  employee_id: string;
  shift_id: number;
  date: string;
  is_substitute: boolean;
  original_employee_id?: string;
  notes?: string;
  status: string;
}

// Fila de empleado tal como viene de la BBDD (antes de mapear a Employee)
export interface EmployeeRow {
  id: string | number;
  activo?: boolean;
  is_active?: boolean;
  active?: boolean;
  nombre?: string;
  name?: string;
  first_name?: string;
  apellidos?: string;
  last_name?: string;
  surname?: string;
  email?: string;
  cargo?: string;
  center_id?: string | number;
}
