// Tipos para el sistema de objetivos y permisos

export interface CenterObjective {
  id: string;
  centerId: string;
  name: string;
  description?: string;
  category: 'revenue' | 'members' | 'retention' | 'costs' | 'satisfaction' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string; // 'euros', 'members', 'percentage', 'units'
  periodType: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  alertAtPercentage: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CenterPermissions {
  id: string;
  centerId: string;
  
  // Permisos financieros
  canViewRevenue: boolean;
  canViewCosts: boolean;
  canViewProfit: boolean;
  canViewBudget: boolean;
  
  // Permisos operacionales
  canManageInventory: boolean;
  canManageStaff: boolean;
  canApproveExpenses: boolean;
  canViewMemberData: boolean;
  
  // Límites
  expenseApprovalLimit: number;
  
  // Configuración de objetivos
  canViewObjectives: boolean;
  canEditObjectives: boolean;
  
  updatedBy?: string;
  updatedAt: string;
}

export interface ObjectiveTracking {
  id: string;
  objectiveId: string;
  recordedValue: number;
  recordedDate: string;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export const CategoryLabels = {
  revenue: 'Ingresos',
  members: 'Socios',
  retention: 'Retención',
  costs: 'Costes',
  satisfaction: 'Satisfacción',
  custom: 'Personalizado'
};

export const PeriodTypeLabels = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  annual: 'Anual'
};

export const StatusLabels = {
  active: 'Activo',
  completed: 'Completado',
  paused: 'Pausado',
  cancelled: 'Cancelado'
};

export const PriorityLabels = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja'
};

export const UnitLabels = {
  euros: '€',
  members: 'socios',
  percentage: '%',
  units: 'unidades'
};