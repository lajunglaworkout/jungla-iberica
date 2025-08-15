// ============ INTERFAZ COMPLETA DE EMPLEADO - TODOS LOS CAMPOS DE LA JUNGLA ============

export interface Employee {
  // Datos Personales
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  dni: string;
  fecha_nacimiento: Date;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  
  // Datos Laborales
  center_id: string;
  centro_nombre?: string;
  fecha_alta: Date;
  fecha_baja?: Date;
  tipo_contrato: 'Indefinido' | 'Temporal' | 'Prácticas' | 'Media Jornada' | 'Jornada Completa';
  jornada: 'Completa' | 'Parcial' | '20h' | '30h' | '40h';
  salario_bruto_anual: number;
  salario_neto_mensual?: number;
  rol: 'employee' | 'manager' | 'admin' | 'superadmin';
  departamento: string;
  cargo: string;
  
  // Datos Bancarios
  numero_cuenta: string;
  iban?: string;
  banco?: string;
  
  // Datos Académicos
  nivel_estudios: 'ESO' | 'Bachillerato' | 'FP Medio' | 'FP Superior' | 'Universitario' | 'Máster' | 'Doctorado';
  titulacion?: string;
  especialidad?: string;
  
  // Uniformes
  talla_camiseta: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  talla_pantalon: string; // 36, 38, 40, 42, 44, 46, 48, 50
  talla_chaqueton: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  
  // Otros
  foto_perfil?: string;
  activo: boolean;
  observaciones?: string;
  
  // Documentos
  tiene_contrato_firmado: boolean;
  tiene_alta_ss: boolean;
  tiene_formacion_riesgos: boolean;
  
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

export const DEPARTAMENTOS = [
  'Dirección',
  'RRHH y Procedimientos', 
  'Logística y Operaciones',
  'Marketing',
  'Ventas',
  'Contabilidad',
  'Eventos',
  'Online',
  'Entrenamiento',
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
  'Jornada Completa'
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
  'employee',
  'manager', 
  'admin',
  'superadmin'
] as const;
