/**
 * Configuración, tipos e interfaces para StrategicMeetingSystem.
 * Extraído de StrategicMeetingSystem.tsx para reducir el tamaño del componente principal.
 */
import React from 'react';
import {
  Clock, Calendar, Users, Target, TrendingUp,
  Building2, Briefcase, Globe, Zap, DollarSign
} from 'lucide-react';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface MeetingObjectiveItem {
  title: string;
  status: string;
  [key: string]: unknown;
}

export interface MeetingTaskItem {
  id?: number;
  title: string;
  assignedTo?: string;
  status?: string;
  deadline?: string;
  priority?: string;
  comments?: string;
  [key: string]: unknown;
}

export interface MeetingData {
  type: string;
  department: string;
  date: string;
  participants: string[];
  metrics: Record<string, string>;
  objectives: Array<{ id: number; title: string; status: string }>;
  tasks: Array<{ id: number; title: string; assignedTo: string; deadline: string; priority: string }>;
  notes: string;
}

export interface HistoricalMeeting extends MeetingData {
  id?: string;
  createdAt?: string;
  createdBy?: string;
  objectives?: MeetingObjectiveItem[];
  tasks?: MeetingTaskItem[];
  [key: string]: unknown;
}

export interface MeetingTypeConfig {
  label: string;
  description: string;
  duration: string;
  frequency: string;
  color: string;
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>;
}

export interface DepartmentConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>;
  color: string;
}

export interface MetricConfig {
  id: string;
  label: string;
  type: 'currency' | 'percentage' | 'number' | 'rating';
  target: number;
}

export interface LeadershipMember {
  id: string;
  name: string;
  role: string;
}

// ─── Constantes ─────────────────────────────────────────────────────────────

export const LEADERSHIP_TEAM: LeadershipMember[] = [
  { id: 'carlossuarezparra@gmail.com', name: 'Carlos Suárez Parra', role: 'CEO' },
  { id: 'beni.jungla@gmail.com', name: 'Benito Morales', role: 'Director' },
  { id: 'lajunglacentral@gmail.com', name: 'Vicente Benítez', role: 'Director' },
  { id: 'antonio.eventos@jungla.com', name: 'Antonio García', role: 'Responsable Eventos' },
  { id: 'maria.rrhh@jungla.com', name: 'María González', role: 'RRHH' },
  { id: 'diego.marketing@jungla.com', name: 'Diego Fernández', role: 'Marketing' },
  { id: 'laura.logistica@jungla.com', name: 'Laura Martín', role: 'Logística' },
  { id: 'pablo.contabilidad@jungla.com', name: 'Pablo Ruiz', role: 'Contabilidad' },
  { id: 'ana.online@jungla.com', name: 'Ana López', role: 'Online' },
  { id: 'javier.id@jungla.com', name: 'Javier Sánchez', role: 'I+D' },
];

export const MEETING_TYPES_CONFIG: Record<string, MeetingTypeConfig> = {
  semanal: {
    label: 'Reunión Semanal',
    description: 'Seguimiento operativo y táctico',
    duration: '1-2 horas',
    frequency: 'Cada lunes',
    color: '#059669',
    icon: Clock,
  },
  mensual: {
    label: 'Reunión Mensual',
    description: 'Revisión estratégica y planificación',
    duration: '2-3 horas',
    frequency: 'Primer lunes del mes',
    color: '#047857',
    icon: Calendar,
  },
};

export const DEPARTMENTS: DepartmentConfig[] = [
  { id: 'direccion', name: 'Dirección', icon: Building2, color: '#059669' },
  { id: 'rrhh_procedimientos', name: 'RRHH y Procedimientos', icon: Users, color: '#047857' },
  { id: 'logistica', name: 'Logística', icon: Briefcase, color: '#059669' },
  { id: 'contabilidad_ventas', name: 'Contabilidad y Ventas', icon: DollarSign, color: '#047857' },
  { id: 'marketing', name: 'Marketing', icon: Globe, color: '#059669' },
  { id: 'eventos', name: 'Eventos', icon: Calendar, color: '#047857' },
  { id: 'online', name: 'Online', icon: Zap, color: '#059669' },
  { id: 'investigacion', name: 'I+D', icon: TrendingUp, color: '#047857' },
];

export const DEPARTMENT_KPIS: Record<string, MetricConfig[]> = {
  direccion: [
    { id: 'tasks_completed_prev_week', label: 'Tareas Completadas Semana Anterior', type: 'number', target: 10 },
    { id: 'tasks_not_completed', label: 'Tareas No Completadas (Principal)', type: 'number', target: 0 },
    { id: 'new_general_tasks', label: 'Tareas Generales Nuevas', type: 'number', target: 5 },
  ],
  rrhh_procedimientos: [
    { id: 'employee_absences', label: 'Ausencias Laborales', type: 'number', target: 2 },
    { id: 'employee_incidents', label: 'Incidencias de Empleados', type: 'number', target: 0 },
    { id: 'new_procedures', label: 'Procedimientos Nuevos Implementados', type: 'number', target: 3 },
    { id: 'training_sessions', label: 'Sesiones de Formación', type: 'number', target: 2 },
  ],
  logistica: [
    { id: 'delivery_delays', label: 'Retrasos en Entregas', type: 'number', target: 0 },
    { id: 'inventory_accuracy', label: 'Precisión de Inventario (%)', type: 'percentage', target: 98 },
    { id: 'supplier_issues', label: 'Problemas con Proveedores', type: 'number', target: 1 },
  ],
  contabilidad_ventas: [
    { id: 'weekly_revenue', label: 'Facturación Semanal', type: 'currency', target: 15000 },
    { id: 'new_clients', label: 'Nuevos Clientes', type: 'number', target: 5 },
    { id: 'payment_delays', label: 'Retrasos en Pagos', type: 'number', target: 2 },
  ],
  marketing: [
    { id: 'campaign_performance', label: 'Rendimiento Campañas (%)', type: 'percentage', target: 85 },
    { id: 'social_engagement', label: 'Engagement Redes Sociales', type: 'number', target: 1000 },
    { id: 'lead_generation', label: 'Leads Generados', type: 'number', target: 50 },
  ],
  eventos: [
    { id: 'events_completed', label: 'Eventos Completados', type: 'number', target: 3 },
    { id: 'client_satisfaction', label: 'Satisfacción Cliente (%)', type: 'percentage', target: 95 },
    { id: 'event_issues', label: 'Incidencias en Eventos', type: 'number', target: 0 },
  ],
  online: [
    { id: 'website_traffic', label: 'Tráfico Web', type: 'number', target: 5000 },
    { id: 'conversion_rate', label: 'Tasa de Conversión (%)', type: 'percentage', target: 3 },
    { id: 'online_bookings', label: 'Reservas Online', type: 'number', target: 100 },
  ],
  investigacion: [
    { id: 'research_projects', label: 'Proyectos de Investigación', type: 'number', target: 2 },
    { id: 'innovation_proposals', label: 'Propuestas de Innovación', type: 'number', target: 5 },
    { id: 'market_analysis', label: 'Análisis de Mercado Completados', type: 'number', target: 1 },
  ],
};
