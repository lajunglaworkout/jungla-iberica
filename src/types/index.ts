// src/types/index.ts - Actualizado con sistema completo de tipos

// ===== INTERFACES EXISTENTES =====

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ceo' | 'director' | 'department_head' | 'center_manager' | 'center_employee' | 'franchisee' | 'supplier';
  department?: string;
  centerId?: string; // Para empleados/encargados de centro específico
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  position?: string; // Cargo específico

  // Información personal adicional
  dni?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  postalCode?: string;

  // Información laboral
  employeeType: 'brand' | 'center'; // Trabaja para la marca o para un centro
  hireDate?: string;
  baseSalary?: number;
  contractType?: 'indefinido' | 'temporal' | 'practicas' | 'freelance';
  socialSecurityNumber?: string;
  bankAccount?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  // Foto de perfil
  profileImage?: string;

  // Supervisor (para jerarquía)
  supervisorId?: string;
  canManageEmployees?: boolean; // Si puede contratar/gestionar empleados
}

export interface Permission {
  module: string; // 'centers', 'inventory', 'users', 'reports', etc.
  actions: string[]; // 'create', 'read', 'update', 'delete'
}

// ===== SISTEMA DE ROLES AVANZADO =====

export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'department_manager'
  | 'brand_employee'
  | 'franchisee'
  | 'center_manager'
  | 'trainer'
  | 'collaborator'
  | 'employee';

export type BusinessUnit =
  | 'jungla_workout'
  | 'jungla_online'
  | 'jungla_academy'
  | 'jungla_tech'
  | 'all';

export interface RolePermissions {
  // Gestión de usuarios y empleados
  canManageUsers: boolean | string;
  canViewAllEmployees: boolean;
  canCreateEmployees: boolean;
  canEditEmployees: boolean | string;
  canDeleteEmployees: boolean | string;

  // Gestión de centros
  canViewAllCenters: boolean;
  canCreateCenters: boolean;
  canEditCenters: boolean | string;
  canDeleteCenters: boolean;
  canManageFranchises: boolean;

  // Datos financieros y reportes
  canViewFinancials: boolean | string;
  canViewReports: boolean | string;
  canExportData: boolean;

  // Configuración del sistema
  canManageSystem: boolean;
  canViewLogs: boolean;
  canManageIntegrations: boolean;

  // Operaciones específicas
  canManageInventory: boolean | string;
  canManageTasks: boolean | string;
  canManageMarketing: boolean | string;
  canViewAnalytics: boolean | string;

  // Reuniones y tareas ejecutivas
  canCreateMeetings: boolean;
  canManageExecutiveTasks: boolean;
  canViewExecutiveDashboard: boolean;
}

export interface DashboardConfig {
  defaultView: string;
  availableViews: string[];
  showFinancialMetrics: boolean;
  showOperationalMetrics: boolean;
  showUserManagement: boolean;
  showCenterManagement: boolean;
  showReports: boolean;
  allowDataExport: boolean;
  businessUnitsAccess: BusinessUnit[];
}

// ===== INTERFAZ PRINCIPAL PARA EMPLEADOS =====

export interface EmployeeWithRole {
  // Datos básicos
  id: string;
  name: string;
  email: string;
  role: string;

  // Datos de Supabase (tabla empleados)
  identificacion?: string;
  correo_electronico?: string;
  telefono?: string;
  DNI?: string;
  fecha_de_nacimiento?: string;
  DIRECCION?: string;
  posicion?: string;
  fecha_de_contratacion?: string;
  tipo_de_contrato?: string;
  imagen_de_perfil?: string;
  esta_activo?: boolean;
  id_del_centro?: string;
  id_departamento?: string;

  // Propiedades de compatibilidad
  avatar?: string;
  phone?: string;
  address?: string;
  position?: string;
  isActive?: boolean;
  centerId?: string;
  departmentId?: string;

  // Sistema de roles avanzado
  advancedRole: UserRole;
  permissions: RolePermissions;
  dashboardConfig: DashboardConfig;

  // Metadatos
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

// ===== FUNCIONES DEL SISTEMA DE ROLES =====

export function getAdvancedRole(dbRole: string, employee: any): UserRole {
  // Mapeo específico para tus usuarios
  const email = employee.correo_electronico || employee.email;

  if (email === 'carlossuarezparra@gmail.com') return 'superadmin';  // Carlos


  // Mapeo por rol de BD
  switch (dbRole?.toLowerCase()) {
    case 'administrador':
    case 'superadmin':
      return 'superadmin';
    case 'director':
    case 'admin':
      return 'admin';
    case 'encargado':
      return employee.id_del_centro ? 'center_manager' : 'department_manager';
    case 'empleado':
      return employee.id_del_centro ? 'center_manager' : 'brand_employee';
    case 'entrenador':
      return 'trainer';
    case 'franquiciado':
      return 'franchisee';
    case 'proveedor':
      return 'collaborator';
    default:
      return 'employee';
  }
}

export function getRoleConfig(role: UserRole): { permissions: RolePermissions; config: DashboardConfig } {
  const configs: Record<UserRole, { permissions: RolePermissions; config: DashboardConfig }> = {
    superadmin: {
      permissions: {
        canManageUsers: true,
        canViewAllEmployees: true,
        canCreateEmployees: true,
        canEditEmployees: true,
        canDeleteEmployees: true,
        canViewAllCenters: true,
        canCreateCenters: true,
        canEditCenters: true,
        canDeleteCenters: true,
        canManageFranchises: true,
        canViewFinancials: true,
        canViewReports: true,
        canExportData: true,
        canManageSystem: true,
        canViewLogs: true,
        canManageIntegrations: true,
        canManageInventory: true,
        canManageTasks: true,
        canManageMarketing: true,
        canViewAnalytics: true,
        canCreateMeetings: true,
        canManageExecutiveTasks: true,
        canViewExecutiveDashboard: true,
      },
      config: {
        defaultView: 'executive',
        availableViews: ['executive', 'analytics', 'centers', 'users', 'reports'],
        showFinancialMetrics: true,
        showOperationalMetrics: true,
        showUserManagement: true,
        showCenterManagement: true,
        showReports: true,
        allowDataExport: true,
        businessUnitsAccess: ['all'],
      },
    },
    admin: {
      permissions: {
        canManageUsers: true,
        canViewAllEmployees: true,
        canCreateEmployees: true,
        canEditEmployees: true,
        canDeleteEmployees: 'own_unit',
        canViewAllCenters: true,
        canCreateCenters: true,
        canEditCenters: true,
        canDeleteCenters: false,
        canManageFranchises: true,
        canViewFinancials: true,
        canViewReports: true,
        canExportData: true,
        canManageSystem: false,
        canViewLogs: true,
        canManageIntegrations: false,
        canManageInventory: true,
        canManageTasks: true,
        canManageMarketing: true,
        canViewAnalytics: true,
        canCreateMeetings: true,
        canManageExecutiveTasks: true,
        canViewExecutiveDashboard: true,
      },
      config: {
        defaultView: 'executive',
        availableViews: ['executive', 'analytics', 'centers', 'users'],
        showFinancialMetrics: true,
        showOperationalMetrics: true,
        showUserManagement: true,
        showCenterManagement: true,
        showReports: true,
        allowDataExport: true,
        businessUnitsAccess: ['all'],
      },
    },
    // Configuraciones simplificadas para otros roles
    department_manager: {
      permissions: {
        canManageUsers: false,
        canViewAllEmployees: false,
        canCreateEmployees: false,
        canEditEmployees: 'own_department',
        canDeleteEmployees: false,
        canViewAllCenters: true,
        canCreateCenters: false,
        canEditCenters: false,
        canDeleteCenters: false,
        canManageFranchises: false,
        canViewFinancials: 'department',
        canViewReports: 'department',
        canExportData: false,
        canManageSystem: false,
        canViewLogs: false,
        canManageIntegrations: false,
        canManageInventory: 'own_department',
        canManageTasks: 'own_department',
        canManageMarketing: false,
        canViewAnalytics: 'department',
        canCreateMeetings: false,
        canManageExecutiveTasks: false,
        canViewExecutiveDashboard: false,
      },
      config: {
        defaultView: 'dashboard',
        availableViews: ['dashboard', 'tasks'],
        showFinancialMetrics: false,
        showOperationalMetrics: true,
        showUserManagement: false,
        showCenterManagement: false,
        showReports: false,
        allowDataExport: false,
        businessUnitsAccess: ['jungla_workout'],
      },
    },
    // Otros roles con configuraciones básicas
    brand_employee: {
      permissions: {
        canManageUsers: false,
        canViewAllEmployees: false,
        canCreateEmployees: false,
        canEditEmployees: false,
        canDeleteEmployees: false,
        canViewAllCenters: false,
        canCreateCenters: false,
        canEditCenters: false,
        canDeleteCenters: false,
        canManageFranchises: false,
        canViewFinancials: false,
        canViewReports: false,
        canExportData: false,
        canManageSystem: false,
        canViewLogs: false,
        canManageIntegrations: false,
        canManageInventory: false,
        canManageTasks: 'assigned',
        canManageMarketing: false,
        canViewAnalytics: false,
        canCreateMeetings: false,
        canManageExecutiveTasks: false,
        canViewExecutiveDashboard: false,
      },
      config: {
        defaultView: 'dashboard',
        availableViews: ['dashboard'],
        showFinancialMetrics: false,
        showOperationalMetrics: false,
        showUserManagement: false,
        showCenterManagement: false,
        showReports: false,
        allowDataExport: false,
        businessUnitsAccess: ['jungla_workout'],
      },
    },
    // Configuraciones por defecto para el resto de roles
    franchisee: {
      permissions: {
        canManageUsers: false, canViewAllEmployees: false, canCreateEmployees: false, canEditEmployees: false, canDeleteEmployees: false,
        canViewAllCenters: false, canCreateCenters: false, canEditCenters: 'own', canDeleteCenters: false, canManageFranchises: false,
        canViewFinancials: 'own', canViewReports: 'own', canExportData: false, canManageSystem: false, canViewLogs: false, canManageIntegrations: false,
        canManageInventory: 'own', canManageTasks: 'own', canManageMarketing: false, canViewAnalytics: 'own',
        canCreateMeetings: false, canManageExecutiveTasks: false, canViewExecutiveDashboard: false,
      },
      config: {
        defaultView: 'dashboard', availableViews: ['dashboard'], showFinancialMetrics: true, showOperationalMetrics: true,
        showUserManagement: false, showCenterManagement: false, showReports: false, allowDataExport: false, businessUnitsAccess: ['jungla_workout'],
      },
    },
    center_manager: {
      permissions: {
        canManageUsers: false, canViewAllEmployees: false, canCreateEmployees: false, canEditEmployees: false, canDeleteEmployees: false,
        canViewAllCenters: false, canCreateCenters: false, canEditCenters: 'own', canDeleteCenters: false, canManageFranchises: false,
        canViewFinancials: 'own', canViewReports: 'own', canExportData: false, canManageSystem: false, canViewLogs: false, canManageIntegrations: false,
        canManageInventory: 'own', canManageTasks: 'own', canManageMarketing: false, canViewAnalytics: 'own',
        canCreateMeetings: false, canManageExecutiveTasks: false, canViewExecutiveDashboard: false,
      },
      config: {
        defaultView: 'dashboard', availableViews: ['dashboard'], showFinancialMetrics: false, showOperationalMetrics: true,
        showUserManagement: false, showCenterManagement: false, showReports: false, allowDataExport: false, businessUnitsAccess: ['jungla_workout'],
      },
    },
    trainer: {
      permissions: {
        canManageUsers: false, canViewAllEmployees: false, canCreateEmployees: false, canEditEmployees: false, canDeleteEmployees: false,
        canViewAllCenters: false, canCreateCenters: false, canEditCenters: false, canDeleteCenters: false, canManageFranchises: false,
        canViewFinancials: false, canViewReports: false, canExportData: false, canManageSystem: false, canViewLogs: false, canManageIntegrations: false,
        canManageInventory: false, canManageTasks: 'assigned', canManageMarketing: false, canViewAnalytics: false,
        canCreateMeetings: false, canManageExecutiveTasks: false, canViewExecutiveDashboard: false,
      },
      config: {
        defaultView: 'dashboard', availableViews: ['dashboard'], showFinancialMetrics: false, showOperationalMetrics: false,
        showUserManagement: false, showCenterManagement: false, showReports: false, allowDataExport: false, businessUnitsAccess: ['jungla_workout'],
      },
    },
    collaborator: {
      permissions: {
        canManageUsers: false, canViewAllEmployees: false, canCreateEmployees: false, canEditEmployees: false, canDeleteEmployees: false,
        canViewAllCenters: false, canCreateCenters: false, canEditCenters: false, canDeleteCenters: false, canManageFranchises: false,
        canViewFinancials: false, canViewReports: false, canExportData: false, canManageSystem: false, canViewLogs: false, canManageIntegrations: false,
        canManageInventory: false, canManageTasks: 'assigned', canManageMarketing: false, canViewAnalytics: false,
        canCreateMeetings: false, canManageExecutiveTasks: false, canViewExecutiveDashboard: false,
      },
      config: {
        defaultView: 'dashboard', availableViews: ['dashboard'], showFinancialMetrics: false, showOperationalMetrics: false,
        showUserManagement: false, showCenterManagement: false, showReports: false, allowDataExport: false, businessUnitsAccess: ['jungla_workout'],
      },
    },
    employee: {
      permissions: {
        canManageUsers: false, canViewAllEmployees: false, canCreateEmployees: false, canEditEmployees: false, canDeleteEmployees: false,
        canViewAllCenters: false, canCreateCenters: false, canEditCenters: false, canDeleteCenters: false, canManageFranchises: false,
        canViewFinancials: false, canViewReports: false, canExportData: false, canManageSystem: false, canViewLogs: false, canManageIntegrations: false,
        canManageInventory: false, canManageTasks: 'assigned', canManageMarketing: false, canViewAnalytics: false,
        canCreateMeetings: false, canManageExecutiveTasks: false, canViewExecutiveDashboard: false,
      },
      config: {
        defaultView: 'dashboard', availableViews: ['dashboard'], showFinancialMetrics: false, showOperationalMetrics: false,
        showUserManagement: false, showCenterManagement: false, showReports: false, allowDataExport: false, businessUnitsAccess: ['jungla_workout'],
      },
    },
  };

  return configs[role] || configs.employee;
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  const { permissions } = getRoleConfig(role);
  const permissionValue = permissions[permission];
  return permissionValue === true;
}

export function hasBusinessUnitAccess(role: UserRole, businessUnit: BusinessUnit): boolean {
  const { config } = getRoleConfig(role);
  return config.businessUnitsAccess.includes('all') || config.businessUnitsAccess.includes(businessUnit);
}

// ===== INTERFACES EXISTENTES (sin cambios) =====

export interface Center {
  id: string;
  name: string;
  type: 'Propio' | 'Franquicia';
  location: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  cif: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  manager: string;
  managerId?: string;
  openingDate: string;
  status: 'Activo' | 'En Construcción' | 'Cerrado' | 'Suspendido';

  // Datos específicos de franquicia
  franchisee?: string;
  franchiseeId?: string;
  monthlyFee?: number;
  contractStartDate?: string;
  contractEndDate?: string;

  // Datos financieros
  bankAccount?: string;
  bankName?: string;
  billingEmail?: string;

  // Configuración
  maxCapacity?: number;
  openingHours?: string;
  services?: string[];

  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  kpi: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

export interface CenterInventory {
  id: string;
  centerId: string;
  items: CenterInventoryItem[];
  lastUpdated: string;
}

export interface CenterInventoryItem {
  id: string;
  article: string;
  category: 'Equipamiento Cardio' | 'Equipamiento Fuerza' | 'Accesorios' | 'Textil Empleados' | 'Material Limpieza' | 'Mobiliario';
  quantity: number;
  minStock: number;
  status: 'critical' | 'warning' | 'good';
  unit: string;
  acquisitionDate?: string;
  condition: 'Nuevo' | 'Bueno' | 'Regular' | 'Necesita Reparación' | 'Fuera de Servicio';
  notes?: string;
  cost?: number;
  supplier?: string;
}

export interface CenterTask {
  id: string;
  centerId: string;
  department: 'logistics' | 'maintenance' | 'hr' | 'marketing';
  title: string;
  description: string;
  priority: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  status: 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';
  assignedTo: string;
  assignedToId?: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  estimatedCost?: number;
  actualCost?: number;
  category: 'Mantenimiento' | 'Reparación' | 'Pedido Material' | 'Vestuario' | 'Instalaciones' | 'Marketing' | 'RRHH';
  createdBy: string;
  createdById: string;
}

export interface MaintenanceTask {
  id: string;
  center: string;
  type: 'Preventivo' | 'Correctivo';
  description: string;
  priority: 'Crítica' | 'Alta' | 'Media';
  status: 'Pendiente' | 'En Proceso' | 'Resuelta';
  cost: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  frequency?: 'Semanal' | 'Quincenal' | 'Mensual' | 'Trimestral';
  notes?: string;
}

export interface MonthlyTask {
  id: string;
  task: string;
  center: string;
  frequency: 'Semanal' | 'Quincenal' | 'Mensual' | 'Trimestral';
  dueDate: string;
  status: 'Realizado' | 'No Realizado';
  notes?: string;
  month: string;
}

export interface InventoryControl {
  id: string;
  task: string;
  dueDate: string;
  status: 'Realizado' | 'No Realizado';
  orderNeeded: boolean;
  orderPlaced: boolean;
  month: string;
}

export interface Incident {
  id: string;
  center: string;
  description: string;
  reportDate: string;
  status: 'Pendiente' | 'En Proceso' | 'Resuelta';
  priority: 'Crítica' | 'Alta' | 'Media';
  finalCost: number;
  closeDate?: string;
  month: string;
  category: 'Rotura de Material' | 'Mantenimiento' | 'Otro';
}

export interface KPIData {
  id: string;
  date: string;
  incidentsGenerated: number;
  incidentsOpen: number;
  materialBreaks: number;
  maintenanceCompleted: number;
  totalCost: number;
  nextMonthTasks: number;
}

export interface InventoryItem {
  id: string;
  article: string;
  category: string;
  minStock: number;
  stockSevilla: number;
  stockJerez: number;
  status: 'critical' | 'warning' | 'good';
  unit: string;
  lastUpdated: string;
  notes?: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  center: 'Sevilla Centro' | 'Jerez';
  type: 'Entrada' | 'Salida' | 'Deterioro' | 'Ajuste';
  quantity: number;
  reason: string;
  date: string;
  reportedBy: string;
  quarter?: string;
}

export interface BuildProject {
  id: string;
  name: string;
  documentLink: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
}

export interface SalesPipeline {
  id: string;
  candidate: string;
  phase: 'Lead' | 'Reunión' | 'Oferta' | 'Cierre';
  estimatedValue: number;
  createdAt: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  roi: number;
}