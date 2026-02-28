// Types and interfaces for the ShiftAssignmentSystem

export interface ShiftLocal {
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
  min_employees: number;
  max_employees: number;
  center_id: number;
  description?: string;
}

export interface EmployeeLocal {
  id: number;
  nombre: string;
  apellidos: string;
  center_id: number;
  activo: boolean;
  cargo?: string;
}

export interface CenterLocal {
  id: number;
  name: string;
}

export interface ShiftAssignmentLocal {
  id?: number;
  employee_id: number;
  shift_id: number;
  date: string;
}

export interface AssignmentWithDetails extends ShiftAssignmentLocal {
  employee_name: string;
  shift_name: string;
  shift_start_time: string;
  shift_end_time: string;
  shift_center_id?: number;
}

export interface SelectedDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface BulkAssignmentData {
  shift_id: number | null;
  employee_id: number | null;
  start_date: string;
  end_date: string;
  exclude_weekends: boolean;
  exclude_dates: string[];
}

export interface QuickAssignData {
  shift_id: number | null;
  employee_id: number | null;
  start_date: string;
  end_date: string;
}

// Util: fecha local YYYY-MM-DD (evita desfases por huso horario)
export const toLocalYMD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
