import {
  Building2, Users, FileText, Package, Wrench, DollarSign,
  Globe, Zap, Calendar, BookOpen, TrendingUp, Briefcase,
  MoreHorizontal
} from 'lucide-react';

export interface Department {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

export interface UserDepartmentAccess {
  email: string;
  name: string;
  role: string;
  departments: string[]; // IDs de departamentos a los que tiene acceso
  isAdmin: boolean;
}

// Configuración de departamentos
export const DEPARTMENTS_CONFIG: Record<string, Department> = {
  direccion: {
    id: 'direccion',
    name: 'Dirección',
    icon: Building2,
    color: '#dc2626',
    description: 'Reuniones de dirección estratégica'
  },
  rrhh: {
    id: 'rrhh',
    name: 'RRHH',
    icon: Users,
    color: '#059669',
    description: 'Gestión de recursos humanos'
  },
  procedimientos: {
    id: 'procedimientos',
    name: 'Procedimientos',
    icon: FileText,
    color: '#3b82f6',
    description: 'Procedimientos y normativas'
  },
  logistica: {
    id: 'logistica',
    name: 'Logística',
    icon: Package,
    color: '#ea580c',
    description: 'Gestión de logística'
  },
  mantenimiento: {
    id: 'mantenimiento',
    name: 'Mantenimiento',
    icon: Wrench,
    color: '#f59e0b',
    description: 'Mantenimiento de instalaciones'
  },
  contabilidad: {
    id: 'contabilidad',
    name: 'Contabilidad',
    icon: DollarSign,
    color: '#8b5cf6',
    description: 'Gestión contable y financiera'
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    icon: Globe,
    color: '#ec4899',
    description: 'Estrategia y campañas de marketing'
  },
  online: {
    id: 'online',
    name: 'Online',
    icon: Zap,
    color: '#06b6d4',
    description: 'Gestión de plataformas online'
  },
  eventos: {
    id: 'eventos',
    name: 'Eventos',
    icon: Calendar,
    color: '#14b8a6',
    description: 'Organización de eventos'
  },
  academy: {
    id: 'academy',
    name: 'Academy',
    icon: BookOpen,
    color: '#6366f1',
    description: 'Programas de formación'
  },
  ventas: {
    id: 'ventas',
    name: 'Ventas',
    icon: TrendingUp,
    color: '#10b981',
    description: 'Gestión de ventas y franquicias'
  },
  jungla_tech: {
    id: 'jungla_tech',
    name: 'Jungla Tech',
    icon: Briefcase,
    color: '#7c3aed',
    description: 'Tecnología y desarrollo'
  },
  centros_operativos: {
    id: 'centros_operativos',
    name: 'Centros Operativos',
    icon: Building2,
    color: '#0891b2',
    description: 'Gestión de centros'
  },
  varios: {
    id: 'varios',
    name: 'Varios',
    icon: MoreHorizontal,
    color: '#6b7280',
    description: 'Reuniones diversas'
  }
};

// Configuración de acceso por usuario
export const USER_DEPARTMENT_ACCESS: Record<string, UserDepartmentAccess> = {
  'carlossuarezparra@gmail.com': {
    email: 'carlossuarezparra@gmail.com',
    name: 'Carlos Suárez Parra',
    role: 'CEO',
    departments: Object.keys(DEPARTMENTS_CONFIG), // Acceso a todo
    isAdmin: true
  },
  'beni.jungla@gmail.com': {
    email: 'beni.jungla@gmail.com',
    name: 'Benito Morales',
    role: 'Director Logística, Mantenimiento, Contabilidad y Ventas',
    departments: ['logistica', 'mantenimiento', 'contabilidad', 'ventas', 'centros_operativos'],
    isAdmin: false
  },
  'vicente@jungla.com': {
    email: 'vicente@jungla.com',
    name: 'Vicente Benítez',
    role: 'Director RRHH, Procedimientos, Academy, Dirección y Eventos',
    departments: ['direccion', 'rrhh', 'procedimientos', 'academy', 'eventos', 'centros_operativos'],
    isAdmin: false
  },
  'director.rrhh@jungla.com': {
    email: 'director.rrhh@jungla.com',
    name: 'Director RRHH',
    role: 'Director RRHH',
    departments: ['rrhh'],
    isAdmin: false
  },
  'director.procedimientos@jungla.com': {
    email: 'director.procedimientos@jungla.com',
    name: 'Director Procedimientos',
    role: 'Director Procedimientos',
    departments: ['procedimientos', 'centros_operativos', 'eventos', 'academy'],
    isAdmin: false
  },
  'director.logistica@jungla.com': {
    email: 'director.logistica@jungla.com',
    name: 'Director Logística',
    role: 'Director Logística',
    departments: ['logistica'],
    isAdmin: false
  },
  'director.mantenimiento@jungla.com': {
    email: 'director.mantenimiento@jungla.com',
    name: 'Director Mantenimiento',
    role: 'Director Mantenimiento',
    departments: ['mantenimiento'],
    isAdmin: false
  },
  'responsable.contabilidad@jungla.com': {
    email: 'responsable.contabilidad@jungla.com',
    name: 'Responsable Contabilidad',
    role: 'Responsable Contabilidad',
    departments: ['contabilidad'],
    isAdmin: false
  },
  'director.marketing@jungla.com': {
    email: 'director.marketing@jungla.com',
    name: 'Director Marketing',
    role: 'Director Marketing',
    departments: ['marketing', 'eventos'],
    isAdmin: false
  },
  'director.online@jungla.com': {
    email: 'director.online@jungla.com',
    name: 'Director Online',
    role: 'Director Online',
    departments: ['online'],
    isAdmin: false
  },
  'director.academy@jungla.com': {
    email: 'director.academy@jungla.com',
    name: 'Director Academy',
    role: 'Director Academy',
    departments: ['academy'],
    isAdmin: false
  },
  'diegomontilla.fotografias@gmail.com': {
    email: 'diegomontilla.fotografias@gmail.com',
    name: 'Diego Montilla',
    role: 'Director Marketing',
    departments: ['marketing'],
    isAdmin: false
  },
  'lajunglawonline@gmail.com': {
    email: 'lajunglawonline@gmail.com',
    name: 'Jonathan Padilla',
    role: 'Director Online',
    departments: ['online'],
    isAdmin: false
  },
  'lajunglaweventos@gmail.com': {
    email: 'lajunglaweventos@gmail.com',
    name: 'Antonio Durán',
    role: 'Director Eventos',
    departments: ['eventos'],
    isAdmin: false
  },
  'danivf1991@gmail.com': {
    email: 'danivf1991@gmail.com',
    name: 'Dani Valverde',
    role: 'Director Academy',
    departments: ['academy'],
    isAdmin: false
  }
};

// Función para obtener departamentos accesibles por un usuario
export const getUserAccessibleDepartments = (userEmail: string): Department[] => {
  const userAccess = USER_DEPARTMENT_ACCESS[userEmail];

  if (!userAccess) {
    return []; // Sin acceso
  }

  return userAccess.departments
    .map(deptId => DEPARTMENTS_CONFIG[deptId])
    .filter(Boolean);
};

// Función para verificar si un usuario puede acceder a un departamento
export const canUserAccessDepartment = (userEmail: string, departmentId: string): boolean => {
  const userAccess = USER_DEPARTMENT_ACCESS[userEmail];

  if (!userAccess) {
    return false;
  }

  return userAccess.departments.includes(departmentId);
};

// Función para obtener información del usuario
export const getUserInfo = (userEmail: string): UserDepartmentAccess | null => {
  return USER_DEPARTMENT_ACCESS[userEmail] || null;
};

// Opciones de notificación (en minutos)
export const NOTIFICATION_TIMING_OPTIONS = [
  { value: 5, label: '5 minutos antes' },
  { value: 10, label: '10 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' }
];
