// Shared types and interfaces for MeetingModal and its sub-components
import type { MeetingRecord } from '../../services/meetingService';

export interface MeetingModalProps {
  departmentId: string;
  meeting?: MeetingRecord;
  userEmail?: string;
  userName?: string;
  participants?: string[];
  preselectedLeadId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface PreviousTask {
  id: number;
  titulo: string;
  asignado_a: string;
  estado: string;
  fecha_limite: string;
  notas?: string;
  completada?: boolean;
  motivo_no_completada?: string;
}

export interface RecurringTask {
  id?: number;
  titulo: string;
  notas: string;
  tipo?: 'simple' | 'expandible_centros' | 'expandible_departamentos' | 'incidencias' | 'incidencias_personal' | 'checklist_incidencias' | 'propuestas_sanciones' | 'pedidos_logistica' | 'roturas_perdidas' | 'stock_minimo' | 'envios_pendientes' | 'incidencias_mantenimiento' | 'reparaciones_pendientes' | 'coste_reparaciones' | 'datos_centros_contabilidad' | 'pagos_pendientes' | 'transferencias_autorizar' | 'gastos_extra' | 'incidencias_checklist_operaciones' | 'tendencias_clientes' | 'eventos_actividades' | 'sugerencias_peticiones' | 'comunicados_franquiciados';
  datos?: Record<string, unknown>;
}

export interface DepartmentObjective {
  nombre: string;
  tipo: 'numero' | 'texto' | 'porcentaje';
  unidad?: string;
  placeholder?: string;
}

export interface ObjectiveValue {
  nombre: string;
  valor: string | number;
  tipo: 'numero' | 'texto' | 'porcentaje';
}

export type MeetingType = 'FISICA' | 'VIDEOLLAMADA';

export interface NewTask {
  title: string;
  assignedTo: string;
  deadline: string;
  priority: 'baja' | 'media' | 'alta' | 'critica';
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
}
