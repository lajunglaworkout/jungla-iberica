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

// Resto de interfaces existentes...
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