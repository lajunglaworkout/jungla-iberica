// Sistema de permisos flexible para La Jungla CRM

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  baseRole: 'ceo' | 'director' | 'center_manager' | 'trainer' | 'employee';
  center: 'central' | 'sevilla' | 'jerez' | 'puerto';
  assignedModules: string[]; // Módulos asignados manualmente
  isActive: boolean;
}

// Módulos disponibles
export const CRM_MODULES = {
  logistics: { name: 'Logística', icon: '📦' },
  maintenance: { name: 'Mantenimiento', icon: '🔧' },
  accounting: { name: 'Contabilidad', icon: '💰' },
  marketing: { name: 'Marketing', icon: '📢' },
  hr: { name: 'RRHH', icon: '👥' },
  online: { name: 'Online', icon: '💻' },
  events: { name: 'Eventos', icon: '🎉' },
  reports: { name: 'Reportes', icon: '📊' }
};

// Equipo La Jungla con asignaciones flexibles
export const TEAM_DATA: UserProfile[] = [
  {
    id: '1',
    name: 'Carlos Suárez',
    email: 'carlossuarezparra@gmail.com',
    baseRole: 'ceo',
    center: 'central',
    assignedModules: Object.keys(CRM_MODULES), // Acceso total
    isActive: true
  },
  {
    id: '2',
    name: 'Benito Morales',
    email: 'benito@lajungla.es',
    baseRole: 'director',
    center: 'central',
    assignedModules: ['logistics', 'maintenance', 'accounting'], // Múltiples departamentos
    isActive: true
  },
  {
    id: '3',
    name: 'Vicente Corbaón',
    email: 'lajunglacentral@gmail.com',
    baseRole: 'director',
    center: 'central',
    assignedModules: ['hr', 'online'],
    isActive: true
  },
  {
    id: '10',
    name: 'Jesús Rosado',
    email: 'jesus2003.betis@gmail.com',
    baseRole: 'director',
    center: 'sevilla',
    assignedModules: ['online'],
    isActive: true
  },
  {
    id: '4',
    name: 'Diego Montilla',
    email: 'diego@lajungla.es',
    baseRole: 'director',
    center: 'central',
    assignedModules: ['marketing'],
    isActive: true
  },
  {
    id: '7',
    name: 'Fran Giraldez',
    email: 'fran.sevilla@lajungla.es',
    baseRole: 'center_manager',
    center: 'sevilla',
    assignedModules: [], // Solo acceso básico (centro + fichaje + RRHH)
    isActive: true
  },
  {
    id: '9',
    name: 'Javier Surian',
    email: 'javier.sevilla@lajungla.es',
    baseRole: 'trainer',
    center: 'sevilla',
    assignedModules: [], // Solo acceso básico
    isActive: true
  }
];

// Función para verificar permisos
export const canUserAccessModule = (userEmail: string, moduleId: string): boolean => {
  const user = TEAM_DATA.find(u => u.email === userEmail);
  if (!user || !user.isActive) return false;

  // CEO tiene acceso a todo
  if (user.baseRole === 'ceo') return true;

  // Verificar módulos asignados
  return user.assignedModules.includes(moduleId);
};

// Permisos básicos por rol
export const getBasicPermissions = (role: string) => ({
  canViewOwnCenter: true,
  canUseTimeTracking: true,
  canUseChecklist: true,
  canMessageHR: true,
  canManageUsers: role === 'ceo'
});
