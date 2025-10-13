// =====================================================
// TIPOS TYPESCRIPT PARA SISTEMA CONTABLE
// La Jungla CRM - Gestión de Centros
// =====================================================

export interface Center {
  id: 'sevilla' | 'jerez' | 'puerto';
  name: string;
  manager: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
}

export interface AccountingEntry {
  id: string;
  center_id: string;
  date: string;
  category: AccountingCategory;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  receipt_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type AccountingCategory = 
  | 'cuotas'
  | 'entrenamiento_personal'
  | 'fisioterapia'
  | 'nutricion'
  | 'vending'
  | 'servicios_extras'
  | 'alquiler'
  | 'suministros'
  | 'nominas'
  | 'marketing'
  | 'mantenimiento'
  | 'seguros'
  | 'impuestos'
  | 'otros_gastos';

export interface ClientMetrics {
  id: string;
  center_id: string;
  center_name: string;
  mes: number;
  año: number;
  objetivo_mensual: number;
  altas_reales: number;
  // 🆕 Nuevos campos desglosados de altas
  altas_fundador: number;
  altas_normal: number;
  altas_bonos: number;
  bajas_reales: number;
  clientes_activos: number;
  leads: number;
  clientes_contabilidad: number;
  facturacion_total: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceRevenue {
  id: string;
  center_id: string;
  date: string;
  service_type: 'entrenamiento_personal' | 'fisioterapia' | 'nutricion' | 'vending';
  revenue: number;
  sessions: number;
  average_price: number;
  created_at: string;
  updated_at: string;
}

export interface MonthlyBalance {
  center_id: string;
  year: number;
  month: number;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  income_breakdown: Record<AccountingCategory, number>;
  expense_breakdown: Record<AccountingCategory, number>;
  client_metrics: {
    leads: number;
    altas: number;
    bajas: number;
    total_clients: number;
    fluctuation: number;
  };
  services_revenue: Record<string, number>;
}

export interface CenterObjectives {
  id: string;
  center_id: string;
  year: number;
  month: number;
  revenue_target: number;
  clients_target: number;
  services_target: Record<string, number>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CenterComparison {
  period: string;
  centers: {
    [key: string]: {
      revenue: number;
      expenses: number;
      balance: number;
      clients: number;
      growth_percentage: number;
      vs_objective: number;
    };
  };
  brand_totals: {
    revenue: number;
    expenses: number;
    balance: number;
    clients: number;
  };
}

export interface HistoricalData {
  id: string;
  center_id: string;
  year: number;
  data: MonthlyBalance[];
  imported_by: string;
  imported_at: string;
}

// Configuración de centros
export const CENTERS: Center[] = [
  {
    id: 'sevilla',
    name: 'Centro Sevilla',
    manager: 'Francisco/Salva',
    email: 'sevilla@lajungla.es',
    phone: '+34 954 123 456',
    address: 'Calle Ejemplo, 123, Sevilla',
    active: true
  },
  {
    id: 'jerez',
    name: 'Centro Jerez',
    manager: 'Iván/Pablo',
    email: 'jerez@lajungla.es',
    phone: '+34 956 123 456',
    address: 'Calle Ejemplo, 456, Jerez',
    active: true
  },
  {
    id: 'puerto',
    name: 'Centro Puerto',
    manager: 'Adrián/Guillermo',
    email: 'puerto@lajungla.es',
    phone: '+34 956 789 123',
    address: 'Calle Ejemplo, 789, El Puerto',
    active: true
  }
];

// Categorías de contabilidad con configuración
export const ACCOUNTING_CATEGORIES = {
  // INGRESOS
  cuotas: {
    label: 'Cuotas de Socios',
    type: 'income' as const,
    color: '#10b981',
    icon: '💳'
  },
  entrenamiento_personal: {
    label: 'Entrenamiento Personal',
    type: 'income' as const,
    color: '#3b82f6',
    icon: '🏋️'
  },
  fisioterapia: {
    label: 'Fisioterapia',
    type: 'income' as const,
    color: '#8b5cf6',
    icon: '🩺'
  },
  nutricion: {
    label: 'Nutrición',
    type: 'income' as const,
    color: '#f59e0b',
    icon: '🥗'
  },
  vending: {
    label: 'Vending',
    type: 'income' as const,
    color: '#06b6d4',
    icon: '🥤'
  },
  servicios_extras: {
    label: 'Otros Servicios',
    type: 'income' as const,
    color: '#84cc16',
    icon: '⭐'
  },
  
  // GASTOS
  alquiler: {
    label: 'Alquiler',
    type: 'expense' as const,
    color: '#ef4444',
    icon: '🏢'
  },
  suministros: {
    label: 'Suministros (Luz, Agua, Gas)',
    type: 'expense' as const,
    color: '#f97316',
    icon: '⚡'
  },
  nominas: {
    label: 'Nóminas',
    type: 'expense' as const,
    color: '#ec4899',
    icon: '👥'
  },
  marketing: {
    label: 'Marketing',
    type: 'expense' as const,
    color: '#6366f1',
    icon: '📢'
  },
  mantenimiento: {
    label: 'Mantenimiento',
    type: 'expense' as const,
    color: '#8b5cf6',
    icon: '🔧'
  },
  seguros: {
    label: 'Seguros',
    type: 'expense' as const,
    color: '#0891b2',
    icon: '🛡️'
  },
  impuestos: {
    label: 'Impuestos',
    type: 'expense' as const,
    color: '#dc2626',
    icon: '📋'
  },
  otros_gastos: {
    label: 'Otros Gastos',
    type: 'expense' as const,
    color: '#6b7280',
    icon: '📄'
  }
} as const;

// Utilidades
export const getCenterById = (id: string): Center | undefined => {
  return CENTERS.find(center => center.id === id);
};

export const getCategoryConfig = (category: AccountingCategory) => {
  return ACCOUNTING_CATEGORIES[category];
};

export const getIncomeCategories = (): AccountingCategory[] => {
  return Object.keys(ACCOUNTING_CATEGORIES).filter(
    key => ACCOUNTING_CATEGORIES[key as AccountingCategory].type === 'income'
  ) as AccountingCategory[];
};

export const getExpenseCategories = (): AccountingCategory[] => {
  return Object.keys(ACCOUNTING_CATEGORIES).filter(
    key => ACCOUNTING_CATEGORIES[key as AccountingCategory].type === 'expense'
  ) as AccountingCategory[];
};
