// ========================================================================
// INTERFAZ CENTRAL DEL EMPLEADO
// Esta es la pieza principal que conecta la autenticación con los perfiles.
// ========================================================================

// 1. Definimos los roles que existen en tu base de datos para que TypeScript los conozca.
export type UserRole = 'SUPERADMIN' | 'Director' | 'Empleado' | 'Administrador' | 'Encargado' | 'Proveedor';

// 2. Esta es la interfaz principal para un empleado. Refleja la estructura de tu tabla "public.employees".
export interface Employee {
  id: number;                   // El ID numérico de la tabla
  user_id: string;              // El UUID de la tabla 'auth.users'
  name: string;
  email: string;
  role: UserRole;               // El rol, usando nuestro tipo de arriba
  position: string | null;      // El cargo específico (ej: 'Director de Marketing')
  center_id: number | null;     // El ID del centro al que pertenece (o null si es corporativo)
  department_id: number | null; // El ID del departamento al que pertenece (o null si es de centro)
  is_active: boolean;
  created_at: string;
}


// ========================================================================
// MÓDULOS DE RECURSOS HUMANOS (Tu código original)
// Todas las interfaces y tipos que ya habías diseñado.
// ========================================================================

export interface WorkSchedule {
  id: string;
  employeeId: string;
  name: string;
  mondayStart?: string;
  mondayEnd?: string;
  tuesdayStart?: string;
  tuesdayEnd?: string;
  wednesdayStart?: string;
  wednesdayEnd?: string;
  thursdayStart?: string;
  thursdayEnd?: string;
  fridayStart?: string;
  fridayEnd?: string;
  saturdayStart?: string;
  saturdayEnd?: string;
  sundayStart?: string;
  sundayEnd?: string;
  weeklyHours: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  overtimeHours: number;
  status: 'present' | 'late' | 'absent' | 'partial';
  notes?: string;
  location?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick_leave' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'unpaid';
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Absence {
  id: string;
  employeeId: string;
  date: string;
  type: 'sick' | 'unauthorized' | 'late' | 'early_leave' | 'no_show';
  hoursMissed?: number;
  reason?: string;
  documented: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  centerId?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeeContract {
  id: string;
  employeeId: string;
  contractNumber?: string;
  startDate: string;
  endDate?: string;
  annualSalary?: number;
  hourlyRate?: number;
  vacationDaysPerYear: number;
  vacationDaysUsed: number;
  sickDaysPerYear: number;
  sickDaysUsed: number;
  workScheduleId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeStats {
  totalHoursThisMonth: number;
  overtimeHoursThisMonth: number;
  vacationDaysRemaining: number;
  sickDaysRemaining: number;
  attendanceRate: number;
  averageHoursPerDay: number;
}


// ========================================================================
// ETIQUETAS Y CONSTANTES (Tu código original)
// ========================================================================

export const LeaveTypeLabels = {
  vacation: 'Vacaciones',
  sick_leave: 'Baja médica',
  personal: 'Asunto personal',
  maternity: 'Maternidad',
  paternity: 'Paternidad',
  bereavement: 'Luto',
  unpaid: 'Sin sueldo'
};

export const LeaveStatusLabels = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada'
};

export const AbsenceTypeLabels = {
  sick: 'Enfermedad',
  unauthorized: 'No autorizada',
  late: 'Retraso',
  early_leave: 'Salida temprana',
  no_show: 'No presentado'
};

export const TimeEntryStatusLabels = {
  present: 'Presente',
  late: 'Tarde',
  absent: 'Ausente',
  partial: 'Parcial'
};