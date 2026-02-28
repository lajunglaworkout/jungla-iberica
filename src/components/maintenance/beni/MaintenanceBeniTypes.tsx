// src/components/maintenance/beni/MaintenanceBeniTypes.tsx
import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export interface MaintenanceAssignment {
  id: number;
  status?: string;
  center_name?: string;
  assigned_to?: string;
  [key: string]: unknown;
}

export interface MaintenanceReview {
  id: number;
  status?: string;
  created_date?: string;
  deadline_date?: string;
  quarter?: string;
  total_zones?: number;
  total_concepts?: number;
  total_centers?: number;
  assignments?: MaintenanceAssignment[];
  items?: Record<string, unknown>[];
  [key: string]: unknown;
}

export interface KpiCenter {
  centerName?: string;
  assignedTo?: string;
  score?: number;
  itemsOk?: number;
  itemsRegular?: number;
  itemsBad?: number;
  [key: string]: unknown;
}

export interface KpiIssue {
  center?: string;
  zone?: string;
  concept?: string;
  priority?: string;
  [key: string]: unknown;
}

export interface KpiSummary {
  hasData?: boolean;
  message?: string;
  overallScore?: number;
  overallStats?: {
    totalItems: number;
    itemsOk: number;
    itemsRegular: number;
    itemsBad: number;
    criticalTasks: number;
    completedCenters: number;
  };
  centers?: KpiCenter[];
  criticalIssues?: KpiIssue[];
  trends?: { improvement: number };
  [key: string]: unknown;
}

export interface ReportCenter {
  centerName?: string;
  assignedTo?: string;
  score?: number;
  itemsOk?: number;
  itemsRegular?: number;
  itemsBad?: number;
  [key: string]: unknown;
}

export interface ReportIssue {
  center?: string;
  zone?: string;
  concept?: string;
  observations?: string;
  [key: string]: unknown;
}

export interface ReportSummary {
  overallScore?: number;
  overallStats?: {
    totalItems: number;
    itemsOk: number;
    itemsRegular: number;
    itemsBad: number;
  };
  centers?: ReportCenter[];
  criticalIssues?: ReportIssue[];
  recommendations?: string[];
  bestCenter?: ReportCenter;
  worstCenter?: ReportCenter;
  [key: string]: unknown;
}

export const getCurrentQuarter = (): { quarter: string; year: number } => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  let q = 'Q1';
  if (month >= 4 && month <= 6) q = 'Q2';
  else if (month >= 7 && month <= 9) q = 'Q3';
  else if (month >= 10) q = 'Q4';
  return { quarter: `${q}-${year}`, year };
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return '#10b981';
    case 'active': case 'in_progress': return '#3b82f6';
    case 'pending': case 'draft': return '#6b7280';
    case 'overdue': return '#ef4444';
    default: return '#ef4444';
  }
};

export const getStatusIcon = (status: string): React.ReactElement => {
  switch (status) {
    case 'completed': return <CheckCircle size={20} />;
    case 'active': case 'in_progress': return <Clock size={20} />;
    default: return <AlertCircle size={20} />;
  }
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    completed: 'Completada', active: 'Activa', pending: 'Pendiente',
    draft: 'Borrador', in_progress: 'En Progreso', overdue: 'Vencida',
  };
  return map[status] ?? (status || 'Desconocido');
};
