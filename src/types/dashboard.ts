export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface RecurrenceRule {
  pattern: RecurrencePattern;
  interval: number; // Cada cuántos días/semanas/meses
  daysOfWeek?: number[]; // 0 = domingo, 1 = lunes, etc.
  endDate?: string; // Fecha ISO cuando termina la recurrencia
  occurrences?: number; // Número de ocurrencias
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: string; // Fecha ISO
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  category: 'task' | 'meeting' | 'review' | 'audit';
  meetingType?: 'weekly' | 'monthly'; // Para reuniones
  department?: string; // Departamento asignado (para reuniones) - DEPRECATED
  assignmentType?: 'corporativo' | 'centro'; // Tipo de asignación
  assignmentId?: string; // ID del departamento o empleado
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'urgent' | 'warning' | 'info';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  isRead: boolean;
  actionRequired?: boolean;
  dueDate?: string;
}

export interface DashboardState {
  tasks: Task[];
  alerts: Alert[];
  currentView: 'week' | 'month';
  selectedDate: string; // Fecha ISO
  showTaskModal: boolean;
  showRecurrenceModal: boolean;
  editingTask: Task | null;
}
