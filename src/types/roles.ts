// src/types/roles.ts - Sistema de Roles Simplificado
// Enums principales
export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin', // Vicente y Beni
  BRAND_EMPLOYEE = 'brand_employee', // Empleados de Jungla Ibérica
  DEPARTMENT_MANAGER = 'department_manager', // Jefes de departamento corporativo
  
  // Roles de Centros
  FRANCHISEE = 'franchisee',
  CENTER_MANAGER = 'center_manager', // Encargado de centro propio o franquicia
  TRAINER = 'trainer',
  COLLABORATOR = 'collaborator' // Fisio, nutrición
}

export enum BusinessUnit {
  JUNGLA_WORKOUT = 'jungla_workout', // Centros físicos
  JUNGLA_ONLINE = 'jungla_online',   // Plataforma digital
  JUNGLA_ACADEMY = 'jungla_academy', // Formación
  JUNGLA_TECH = 'jungla_tech'        // Desarrollo tecnológico
}

// ===== MAPEO ENTRE BD ACTUAL Y ROLES AVANZADOS =====
export const ROLE_MAPPING: Record<string, UserRole> = {
  'Administrador': UserRole.ADMIN,
  'Director': UserRole.ADMIN,
  'Encargado': UserRole.CENTER_MANAGER,
  'Empleado': UserRole.BRAND_EMPLOYEE,
  'Proveedor': UserRole.COLLABORATOR
};

// Función para determinar el rol avanzado
export const getAdvancedRole = (dbRole: string, employee?: any): UserRole => {
  // Casos especiales
  if (employee?.email === 'superadmin@lajungla.com') {
    return UserRole.SUPERADMIN;
  }
  
  // Si es encargado de franquicia
  if (dbRole === 'Encargado' && employee?.center?.type === 'Franquicia') {
    return UserRole.FRANCHISEE;
  }
  
  // Mapeo estándar
  return ROLE_MAPPING[dbRole] || UserRole.BRAND_EMPLOYEE;
};

// ===== SISTEMA DE PERMISOS =====
export interface RolePermissions {
  canViewAllBusinessUnits: boolean;
  canViewAllCenters: boolean | string;
  canViewAllDepartments: boolean;
  canManageUsers: boolean | string;
  canViewFinancials: boolean | string;
  canEditSystemSettings: boolean | string;
  canViewReports: boolean | string;
  canManageRoles: boolean | string;
  canManageFranchises?: boolean;
  canViewBrandMetrics?: boolean | string;
  canInteractWithBrand?: boolean | string;
  businessUnitsAccess: string[] | string;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  [UserRole.SUPERADMIN]: {
    canViewAllBusinessUnits: true,
    canViewAllCenters: true,
    canViewAllDepartments: true,
    canManageUsers: true,
    canViewFinancials: 'all',
    canEditSystemSettings: true,
    canViewReports: 'all',
    canManageRoles: true,
    canManageFranchises: true,
    canViewBrandMetrics: true,
    businessUnitsAccess: ['jungla_workout', 'jungla_online', 'jungla_academy', 'jungla_tech']
  },
  [UserRole.ADMIN]: {
    canViewAllBusinessUnits: true,
    canViewAllCenters: true,
    canViewAllDepartments: true,
    canManageUsers: 'brand_and_centers',
    canViewFinancials: 'operational',
    canEditSystemSettings: 'limited',
    canViewReports: 'operational',
    canManageRoles: 'limited',
    canManageFranchises: true,
    canViewBrandMetrics: true,
    businessUnitsAccess: ['jungla_workout', 'jungla_online', 'jungla_academy']
  },
  [UserRole.DEPARTMENT_MANAGER]: {
    canViewAllBusinessUnits: false,
    canViewAllCenters: 'support_only',
    canViewAllDepartments: false,
    canManageUsers: 'department_only',
    canViewFinancials: 'department_only',
    canEditSystemSettings: false,
    canViewReports: 'department_and_centers',
    canManageRoles: false,
    canManageFranchises: false,
    canViewBrandMetrics: 'department_related',
    businessUnitsAccess: 'department_related'
  },
  [UserRole.BRAND_EMPLOYEE]: {
    canViewAllBusinessUnits: false,
    canViewAllCenters: 'interaction_only',
    canViewAllDepartments: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditSystemSettings: false,
    canViewReports: 'assigned_tasks',
    canManageRoles: false,
    canManageFranchises: false,
    canViewBrandMetrics: 'limited',
    businessUnitsAccess: 'assigned'
  },
  [UserRole.FRANCHISEE]: {
    canViewAllBusinessUnits: false,
    canViewAllCenters: false,
    canViewAllDepartments: false,
    canManageUsers: 'owned_centers_only',
    canViewFinancials: 'owned_centers_only',
    canEditSystemSettings: false,
    canViewReports: 'owned_centers',
    canManageRoles: false,
    canManageFranchises: false,
    canViewBrandMetrics: 'franchisee_relevant',
    canInteractWithBrand: true,
    businessUnitsAccess: []
  },
  [UserRole.CENTER_MANAGER]: {
    canViewAllBusinessUnits: false,
    canViewAllCenters: false,
    canViewAllDepartments: false,
    canManageUsers: 'center_only',
    canViewFinancials: 'center_limited',
    canEditSystemSettings: false,
    canViewReports: 'center_operational',
    canManageRoles: false,
    canManageFranchises: false,
    canViewBrandMetrics: false,
    canInteractWithBrand: true,
    businessUnitsAccess: []
  },
  [UserRole.TRAINER]: {
    canViewAllBusinessUnits: false,
    canViewAllCenters: false,
    canViewAllDepartments: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditSystemSettings: false,
    canViewReports: 'personal_classes',
    canManageRoles: false,
    canManageFranchises: false,
    canViewBrandMetrics: false,
    canInteractWithBrand: 'limited',
    businessUnitsAccess: []
  },
  [UserRole.COLLABORATOR]: {
    canViewAllBusinessUnits: false,
    canViewAllCenters: false,
    canViewAllDepartments: false,
    canManageUsers: false,
    canViewFinancials: 'personal_earnings',
    canEditSystemSettings: false,
    canViewReports: 'personal_services',
    canManageRoles: false,
    canManageFranchises: false,
    canViewBrandMetrics: false,
    canInteractWithBrand: false,
    businessUnitsAccess: []
  }
};

// ===== CONFIGURACIÓN DE DASHBOARDS =====
export interface DashboardConfig {
  title: string;
  subtitle: string;
  icon: string; // Nombre del icono como string
  color: string;
  sections: string[];
}

export const dashboardConfig: Record<UserRole, DashboardConfig> = {
  [UserRole.SUPERADMIN]: {
    title: 'SuperAdmin Dashboard',
    subtitle: 'Jungla Ibérica - Control Total',
    icon: 'Crown',
    color: 'emerald',
    sections: [
      'global_kpis',
      'business_units_overview',
      'all_centers_summary',
      'brand_departments',
      'financial_overview',
      'franchise_management',
      'user_management',
      'system_health',
      'personal_tasks',
      'quick_actions'
    ]
  },
  [UserRole.ADMIN]: {
    title: 'Admin Dashboard',
    subtitle: 'Gestión Operativa Jungla Ibérica',
    icon: 'Shield',
    color: 'blue',
    sections: [
      'operational_kpis',
      'business_units_operational',
      'centers_management',
      'brand_departments',
      'franchise_support',
      'user_management',
      'operational_reports',
      'personal_tasks',
      'quick_actions'
    ]
  },
  [UserRole.DEPARTMENT_MANAGER]: {
    title: 'Department Manager Dashboard',
    subtitle: 'Gestión Departamental + Soporte Centros',
    icon: 'UserCheck',
    color: 'purple',
    sections: [
      'department_kpis',
      'department_team',
      'centers_support_view',
      'department_tasks',
      'center_interaction_tools',
      'department_reports',
      'personal_tasks',
      'quick_actions'
    ]
  },
  [UserRole.BRAND_EMPLOYEE]: {
    title: 'Brand Employee Dashboard',
    subtitle: 'Jungla Ibérica - Área Personal',
    icon: 'Briefcase',
    color: 'gray',
    sections: [
      'personal_kpis',
      'assigned_tasks',
      'centers_interaction',
      'team_updates',
      'brand_resources',
      'personal_calendar',
      'quick_actions'
    ]
  },
  [UserRole.FRANCHISEE]: {
    title: 'Franchisee Dashboard',
    subtitle: 'Mi(s) Centro(s) La Jungla Workout',
    icon: 'Building2',
    color: 'orange',
    sections: [
      'franchise_kpis',
      'centers_financials',
      'centers_staff',
      'centers_members',
      'franchise_performance',
      'brand_communication',
      'brand_orders',
      'brand_support',
      'quick_actions'
    ]
  },
  [UserRole.CENTER_MANAGER]: {
    title: 'Center Manager Dashboard',
    subtitle: 'Operaciones Centro La Jungla Workout',
    icon: 'Users',
    color: 'green',
    sections: [
      'center_operations',
      'daily_metrics',
      'staff_management',
      'member_activity',
      'class_schedules',
      'brand_communication',
      'brand_requests',
      'quick_actions'
    ]
  },
  [UserRole.TRAINER]: {
    title: 'Trainer Dashboard',
    subtitle: 'Mis Clases - La Jungla Workout',
    icon: 'Dumbbell',
    color: 'red',
    sections: [
      'class_schedule',
      'client_progress',
      'class_metrics',
      'personal_performance',
      'brand_updates',
      'quick_actions'
    ]
  },
  [UserRole.COLLABORATOR]: {
    title: 'Collaborator Dashboard',
    subtitle: 'Servicios Especializados',
    icon: 'Heart',
    color: 'pink',
    sections: [
      'service_schedule',
      'client_appointments',
      'service_metrics',
      'earnings_overview',
      'quick_actions'
    ]
  }
};

// ===== FUNCIONES HELPER =====
export const hasPermission = (userRole: UserRole, permission: keyof RolePermissions): boolean => {
  const permissions = rolePermissions[userRole];
  return permissions[permission] === true;
};

export const getRoleConfig = (userRole: UserRole) => {
  return {
    config: dashboardConfig[userRole],
    permissions: rolePermissions[userRole]
  };
};

export const hasBusinessUnitAccess = (userRole: UserRole, businessUnit: BusinessUnit): boolean => {
  const permissions = rolePermissions[userRole];
  const access = permissions.businessUnitsAccess;
  
  if (Array.isArray(access)) {
    return access.includes(businessUnit);
  }
  
  return access === 'all' || permissions.canViewAllBusinessUnits;
};

// ===== INTERFACE EXTENDIDA =====
import type { Employee } from './database';

export interface EmployeeWithRole extends Employee {
  advancedRole: UserRole;
  permissions: RolePermissions;
  dashboardConfig: DashboardConfig;
  center?: {
    id: number;
    name: string;
    type: 'Propio' | 'Franquicia';
    [key: string]: any;
  };
}

// Alias para evitar conflictos con el User existente
export type JunglaUser = EmployeeWithRole;