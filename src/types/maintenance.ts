// =====================================================
// TIPOS TYPESCRIPT PARA SISTEMA DE MANTENIMIENTO
// La Jungla CRM - Inspecciones Mensuales
// =====================================================

export interface MaintenanceZone {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface MaintenanceConcept {
  id: string;
  zone_id: string;
  name: string;
  description: string;
  inspection_frequency: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MaintenanceInspection {
  id: string;
  center_id: string;
  center_name: string;
  inspector_name: string;
  inspector_email: string;
  inspection_date: string;
  inspection_month: string; // "2025-02"
  inspection_year: number;
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed';
  total_items: number;
  items_ok: number;
  items_regular: number;
  items_bad: number;
  overall_score: number; // 0-100
  notes: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface MaintenanceInspectionItem {
  id: string;
  inspection_id: string;
  zone_id: string;
  zone_name: string;
  concept_id: string;
  concept_name: string;
  status: 'bien' | 'regular' | 'mal';
  observations: string;
  task_to_perform: string;
  task_status: 'pendiente' | 'en_progreso' | 'completada';
  task_priority: 'baja' | 'media' | 'alta' | 'critica';
  estimated_cost?: number;
  assigned_to?: string;
  due_date?: string;
  completed_date?: string;
  // SISTEMA DE FOTOS OBLIGATORIAS
  photos_deterioro: string[]; // URLs fotos del deterioro (OBLIGATORIAS para MAL/REGULAR)
  photos_reparacion?: string[]; // URLs fotos de reparación (OBLIGATORIAS para cerrar tarea)
  photos_required: boolean; // Si requiere fotos obligatorias
  can_close_task: boolean; // Si se puede cerrar (requiere foto reparación)
  // NOTIFICACIONES A BENI
  beni_notified: boolean; // Si se notificó a Beni
  beni_notification_sent_at?: string; // Cuándo se envió notificación
  is_critical_for_checklist: boolean; // Si debe aparecer en check-list
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTask {
  id: string;
  inspection_item_id: string;
  center_id: string;
  center_name: string;
  zone_name: string;
  concept_name: string;
  title: string;
  description: string;
  priority: 'baja' | 'media' | 'alta' | 'critica';
  status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  assigned_to?: string;
  assigned_by: string;
  estimated_cost?: number;
  actual_cost?: number;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  started_date?: string;
  completed_date?: string;
  notes: string;
  photos_before?: string[];
  photos_after?: string[];
  created_at: string;
  updated_at: string;
}

export interface MaintenanceAlert {
  id: string;
  type: 'overdue_inspection' | 'critical_issue' | 'overdue_task' | 'budget_exceeded';
  center_id: string;
  center_name: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  related_id?: string; // inspection_id o task_id
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface MaintenanceReport {
  id: string;
  center_id: string;
  center_name: string;
  report_type: 'monthly' | 'quarterly' | 'annual';
  period_start: string;
  period_end: string;
  total_inspections: number;
  total_issues: number;
  issues_resolved: number;
  issues_pending: number;
  total_cost: number;
  average_score: number;
  trends: {
    score_trend: 'improving' | 'stable' | 'declining';
    cost_trend: 'increasing' | 'stable' | 'decreasing';
    issues_trend: 'increasing' | 'stable' | 'decreasing';
  };
  generated_by: string;
  generated_at: string;
}

// Configuración de zonas predefinidas - ESPECIFICACIONES LA JUNGLA
export const MAINTENANCE_ZONES: MaintenanceZone[] = [
  {
    id: 'entrenamiento',
    name: 'ZONA DE ENTRENAMIENTO',
    description: 'Área principal de entrenamiento y actividades',
    color: '#f59e0b',
    icon: '💪'
  },
  {
    id: 'exterior',
    name: 'ZONA EXTERIOR',
    description: 'Instalaciones exteriores (si las hay)',
    color: '#10b981',
    icon: '🌿'
  },
  {
    id: 'paredes',
    name: 'PAREDES',
    description: 'Estado de pintura de paredes interiores',
    color: '#8b5cf6',
    icon: '🎨'
  },
  {
    id: 'iluminacion',
    name: 'ILUMINACIÓN',
    description: 'Sistema de iluminación general y LED',
    color: '#fbbf24',
    icon: '💡'
  },
  {
    id: 'accesos',
    name: 'PUERTAS Y ACCESOS',
    description: 'Puertas, cristales y ventanas',
    color: '#06b6d4',
    icon: '🚪'
  },
  {
    id: 'duchas',
    name: 'DUCHAS',
    description: 'Sistema de duchas (especificar número)',
    color: '#3b82f6',
    icon: '🚿'
  },
  {
    id: 'aseos',
    name: 'ASEOS',
    description: 'Aseos diferenciados por género',
    color: '#6366f1',
    icon: '🚻'
  },
  {
    id: 'recepcion',
    name: 'RECEPCIÓN',
    description: 'Área de recepción y atención al cliente',
    color: '#ec4899',
    icon: '🏪'
  },
  {
    id: 'servicios',
    name: 'SALAS DE SERVICIO',
    description: 'Nutrición y fisioterapia',
    color: '#10b981',
    icon: '🏥'
  }
];

// Conceptos predefinidos por zona - ESPECIFICACIONES LA JUNGLA
export const MAINTENANCE_CONCEPTS: MaintenanceConcept[] = [
  // ZONA DE ENTRENAMIENTO
  {
    id: 'ent_suelo',
    zone_id: 'entrenamiento',
    name: 'Suelo',
    description: 'Estado del suelo de entrenamiento',
    inspection_frequency: 'monthly',
    priority: 'high'
  },
  {
    id: 'ent_soldaduras',
    zone_id: 'entrenamiento',
    name: 'Revisión de soldaduras',
    description: 'Estado de soldaduras en estructura de entrenamiento',
    inspection_frequency: 'monthly',
    priority: 'high'
  },
  {
    id: 'ent_pintura_estructura',
    zone_id: 'entrenamiento',
    name: 'Pintura de estructura',
    description: 'Estado de pintura en estructura de entrenamiento',
    inspection_frequency: 'monthly',
    priority: 'medium'
  },
  {
    id: 'ent_ventilacion',
    zone_id: 'entrenamiento',
    name: 'Sistema de ventilación',
    description: 'Funcionamiento del sistema de ventilación',
    inspection_frequency: 'monthly',
    priority: 'high'
  },

  // ZONA EXTERIOR
  {
    id: 'ext_cesped',
    zone_id: 'exterior',
    name: 'Césped',
    description: 'Estado del césped exterior',
    inspection_frequency: 'monthly',
    priority: 'medium'
  },
  {
    id: 'ext_estructura',
    zone_id: 'exterior',
    name: 'Estructura de entrenamiento',
    description: 'Estado de estructura exterior de entrenamiento',
    inspection_frequency: 'monthly',
    priority: 'high'
  },

  // PAREDES
  {
    id: 'par_pintura',
    zone_id: 'paredes',
    name: 'Estado de pintura',
    description: 'Estado de pintura de paredes interiores',
    inspection_frequency: 'monthly',
    priority: 'medium'
  },

  // ILUMINACIÓN
  {
    id: 'ilu_sala',
    zone_id: 'iluminacion',
    name: 'Iluminación sala',
    description: 'Sistema de iluminación general de la sala',
    inspection_frequency: 'monthly',
    priority: 'medium'
  },
  {
    id: 'ilu_led',
    zone_id: 'iluminacion',
    name: 'Iluminación LED',
    description: 'Sistema de iluminación LED específico',
    inspection_frequency: 'monthly',
    priority: 'medium'
  },

  // PUERTAS Y ACCESOS
  {
    id: 'acc_puertas',
    zone_id: 'accesos',
    name: 'Puertas',
    description: 'Estado de puertas y mecanismos',
    inspection_frequency: 'monthly',
    priority: 'medium'
  },
  {
    id: 'acc_cristales',
    zone_id: 'accesos',
    name: 'Cristales y ventanas',
    description: 'Estado de cristales y ventanas',
    inspection_frequency: 'monthly',
    priority: 'medium'
  },

  // DUCHAS
  {
    id: 'duc_ducha_1',
    zone_id: 'duchas',
    name: 'Ducha 1',
    description: 'Estado específico de la ducha número 1',
    inspection_frequency: 'monthly',
    priority: 'high'
  },
  {
    id: 'duc_ducha_2',
    zone_id: 'duchas',
    name: 'Ducha 2',
    description: 'Estado específico de la ducha número 2',
    inspection_frequency: 'monthly',
    priority: 'high'
  },
  {
    id: 'duc_ducha_3',
    zone_id: 'duchas',
    name: 'Ducha 3',
    description: 'Estado específico de la ducha número 3',
    inspection_frequency: 'monthly',
    priority: 'high'
  },
  {
    id: 'duc_ducha_4',
    zone_id: 'duchas',
    name: 'Ducha 4',
    description: 'Estado específico de la ducha número 4',
    inspection_frequency: 'monthly',
    priority: 'high'
  },
  {
    id: 'duc_general',
    zone_id: 'duchas',
    name: 'Estado general duchas',
    description: 'Deterioro común en todas las duchas',
    inspection_frequency: 'monthly',
    priority: 'high'
  },

  // ASEOS
  {
    id: 'ase_hombre',
    zone_id: 'aseos',
    name: 'Aseo hombre',
    description: 'Estado del aseo masculino',
    inspection_frequency: 'monthly',
    priority: 'high'
  },
  {
    id: 'ase_mujer',
    zone_id: 'aseos',
    name: 'Aseo mujer',
    description: 'Estado del aseo femenino',
    inspection_frequency: 'monthly',
    priority: 'high'
  },

  // RECEPCIÓN
  {
    id: 'rec_general',
    zone_id: 'recepcion',
    name: 'Estado general recepción',
    description: 'Estado general del área de recepción',
    inspection_frequency: 'monthly',
    priority: 'medium'
  },

  // SALAS DE SERVICIO
  {
    id: 'ser_nutricion',
    zone_id: 'servicios',
    name: 'Sala de nutrición',
    description: 'Estado de la sala de servicio de nutrición',
    inspection_frequency: 'monthly',
    priority: 'medium'
  },
  {
    id: 'ser_fisioterapia',
    zone_id: 'servicios',
    name: 'Sala de fisioterapia',
    description: 'Estado de la sala de fisioterapia',
    inspection_frequency: 'monthly',
    priority: 'medium'
  }
];

// Estados de mantenimiento
export const MAINTENANCE_STATUS = {
  bien: {
    label: 'BIEN',
    description: 'Perfecto estado',
    color: '#10b981',
    icon: '✅',
    score: 100
  },
  regular: {
    label: 'REGULAR',
    description: 'No afecta al funcionamiento del centro pero no está en perfecto estado',
    color: '#f59e0b',
    icon: '⚠️',
    score: 60
  },
  mal: {
    label: 'MAL',
    description: 'Afecta al funcionamiento del centro o no afecta pero está en un estado pésimo',
    color: '#ef4444',
    icon: '❌',
    score: 20
  }
} as const;

// Estados de tareas
export const TASK_STATUS = {
  pendiente: {
    label: 'PENDIENTE',
    color: '#6b7280',
    icon: '⏳'
  },
  en_progreso: {
    label: 'EN PROGRESO',
    color: '#3b82f6',
    icon: '🔧'
  },
  completada: {
    label: 'COMPLETADA',
    color: '#10b981',
    icon: '✅'
  }
} as const;

// Prioridades de tareas
export const TASK_PRIORITY = {
  baja: {
    label: 'BAJA',
    color: '#10b981',
    icon: '🟢'
  },
  media: {
    label: 'MEDIA',
    color: '#f59e0b',
    icon: '🟡'
  },
  alta: {
    label: 'ALTA',
    color: '#ef4444',
    icon: '🔴'
  },
  critica: {
    label: 'CRÍTICA',
    color: '#dc2626',
    icon: '🚨'
  }
} as const;

// CONFIGURACIÓN DE CALENDARIO DE MANTENIMIENTOS
export const MAINTENANCE_CALENDAR = {
  // Inspecciones programadas a medio mes (día 15)
  inspection_day: 15,
  // Recordatorio 5 días antes
  reminder_days_before: 5,
  // Notificación a Beni para incidencias críticas
  beni_email: 'beni.jungla@gmail.com',
  // Integración con check-list para críticos
  checklist_integration: true,
  // Fotos obligatorias para estados MAL y REGULAR
  photos_required_for_status: ['mal', 'regular'],
  // No se puede cerrar tarea sin foto de reparación
  repair_photo_required_to_close: true
};

// FUNCIONES DE UTILIDAD PARA CALENDARIO
export const getNextInspectionDate = (currentDate: Date = new Date()): Date => {
  const nextDate = new Date(currentDate);
  nextDate.setDate(MAINTENANCE_CALENDAR.inspection_day);
  
  // Si ya pasó el día 15 de este mes, ir al siguiente mes
  if (currentDate.getDate() > MAINTENANCE_CALENDAR.inspection_day) {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
};

export const getReminderDate = (inspectionDate: Date): Date => {
  const reminderDate = new Date(inspectionDate);
  reminderDate.setDate(reminderDate.getDate() - MAINTENANCE_CALENDAR.reminder_days_before);
  return reminderDate;
};

export const shouldSendReminder = (currentDate: Date = new Date()): boolean => {
  const nextInspection = getNextInspectionDate(currentDate);
  const reminderDate = getReminderDate(nextInspection);
  
  return currentDate >= reminderDate && currentDate < nextInspection;
};

export const requiresPhotos = (status: string): boolean => {
  return MAINTENANCE_CALENDAR.photos_required_for_status.includes(status);
};

export const canCloseTask = (hasRepairPhoto: boolean): boolean => {
  return !MAINTENANCE_CALENDAR.repair_photo_required_to_close || hasRepairPhoto;
};
