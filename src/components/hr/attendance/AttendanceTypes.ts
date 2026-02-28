// src/components/hr/attendance/AttendanceTypes.ts

export interface AttendanceRecord {
  id?: number;
  employee_id: number;
  employee_name?: string;
  center_id?: number;
  center_name?: string;
  date: string;
  type: 'late' | 'sick_leave' | 'absence' | 'personal' | 'other' | 'early_departure';
  hours_late?: number;
  reason: string;
  notes?: string;
  created_at?: string;
  created_by?: string;
}

export interface EmployeeHistory {
  thisMonth: number;
  thisMonthByType: { [key: string]: number };
  last3Months: number;
  totalRecords: AttendanceRecord[];
}

export const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    late: '⏰ Retraso',
    sick_leave: '🤒 Baja médica',
    absence: '❌ Ausencia',
    personal: '👤 Asunto personal',
    early_departure: '🚪 Salida temprana',
    other: '📋 Otro',
  };
  return labels[type] || type;
};

export const getTypeColor = (type: string): { bg: string; color: string } => {
  const colors: Record<string, { bg: string; color: string }> = {
    late: { bg: '#fef3c7', color: '#92400e' },
    sick_leave: { bg: '#fee2e2', color: '#991b1b' },
    absence: { bg: '#fecaca', color: '#7f1d1d' },
    personal: { bg: '#dbeafe', color: '#1e40af' },
    early_departure: { bg: '#fed7aa', color: '#9a3412' },
    other: { bg: '#e5e7eb', color: '#374151' },
  };
  return colors[type] || colors.other;
};
