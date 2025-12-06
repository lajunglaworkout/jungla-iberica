// ============ INTERFAZ COMPLETA DE EMPLEADO - TODOS LOS CAMPOS DE LA JUNGLA ============

export interface Employee {
  // Personal Data
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dni: string;
  birth_date: Date;
  address: string;
  city: string;
  postal_code: string;

  // Work Data
  center_id: string;
  centro_nombre?: string; // Kept as is if it's a joined field, or rename if derived
  hire_date: Date;
  termination_date?: Date;
  contract_type: 'Indefinido' | 'Temporal' | 'Prácticas' | 'Media Jornada' | 'Jornada Completa' | 'Autónomo';
  work_schedule: 'Completa' | 'Parcial' | '20h' | '30h' | '40h';
  gross_annual_salary: number;
  salario_neto_mensual?: number; // Optional derived
  role: UserRole;
  department_id?: number; // Legacy, kept for backward compatibility
  departamento?: string; // Legacy
  departments?: { id: number; name: string }[]; // New multi-department support
  position: string;

  // Banking Data
  bank_account_number: string;
  iban?: string;
  banco?: string;

  // Academic Data
  education_level: 'ESO' | 'Bachillerato' | 'FP Medio' | 'FP Superior' | 'Universitario' | 'Máster' | 'Doctorado';
  degree?: string;
  specialization?: string;

  // Uniforms
  shirt_size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  pant_size: string; // 36, 38, 40, 42, 44, 46, 48, 50
  jacket_size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';

  // Vestuario La Jungla - Tallas asignadas (Keep these as they might be specific app logic not in DB or JSON fields)
  vestuario_chandal?: 'S' | 'M' | 'L' | 'XL';
  vestuario_sudadera_frio?: 'S' | 'M' | 'L' | 'XL';
  vestuario_chaleco_frio?: 'S' | 'M' | 'L' | 'XL';
  vestuario_pantalon_corto?: 'S' | 'M' | 'L' | 'XL';
  vestuario_polo_verde?: 'S' | 'M' | 'L' | 'XL';
  vestuario_camiseta_entrenamiento?: 'S' | 'M' | 'L' | 'XL';
  vestuario_asignado_fecha?: Date;
  vestuario_observaciones?: string;

  // Other
  foto_perfil?: string; // profile_picture? Let's check if this was in DB. DB has no photo column in the list I saw, maybe it's storage.
  is_active: boolean;
  observaciones?: string; // observations?

  // Documents
  tiene_contrato_firmado: boolean; // has_signed_contract?
  tiene_alta_ss: boolean; // has_social_security?
  tiene_formacion_riesgos: boolean; // has_risk_training?

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

// ============ INTERFACES AUXILIARES ============

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'vacaciones' | 'enfermedad' | 'personal' | 'maternidad';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  reason?: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  totalHours?: number;
  status: 'presente' | 'tarde' | 'ausente';
}

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'pendiente' | 'procesada' | 'pagada';
}

// ============ CONSTANTES Y ETIQUETAS ============

export type UserRole = 'Admin' | 'Director' | 'Encargado' | 'Empleado';

export const DEPARTAMENTOS = [
  'Dirección',
  'RRHH',
  'Logística',
  'Marketing',
  'Ventas',
  'Contabilidad',
  'Eventos',
  'Online',
  'Entrenamiento',
  'Academy',
  'Recepción'
] as const;

export const CENTROS = [
  { id: '1', nombre: 'Sevilla' },
  { id: '2', nombre: 'Jerez' },
  { id: '3', nombre: 'Puerto' },
  { id: '0', nombre: 'Oficina Central' }
] as const;

export const TALLAS_ROPA = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;
export const TALLAS_PANTALON = ['36', '38', '40', '42', '44', '46', '48', '50', '52'] as const;

export const TIPOS_CONTRATO = [
  'Indefinido',
  'Temporal',
  'Prácticas',
  'Media Jornada',
  'Jornada Completa',
  'Autónomo'
] as const;

export const JORNADAS = [
  'Completa',
  'Parcial',
  '20h',
  '30h',
  '40h'
] as const;

export const NIVELES_ESTUDIOS = [
  'ESO',
  'Bachillerato',
  'FP Medio',
  'FP Superior',
  'Universitario',
  'Máster',
  'Doctorado'
] as const;

export const ROLES_SISTEMA = [
  'Empleado',
  'Encargado',
  'Director',
  'Admin'
] as const;
