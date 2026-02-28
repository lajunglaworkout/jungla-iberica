/**
 * meetingService.test.ts
 *
 * Tests del servicio de reuniones — el módulo más usado del CRM.
 * Verifica transformaciones de datos entre Task (UI) y MeetingRecord (BD).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock de Supabase ────────────────────────────────────────────────────────
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock('../../services/taskService', () => ({
  deleteTasksByMeetingId: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../../services/notificationService', () => ({
  notifyMeetingScheduled: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../config/departments', () => ({
  createMeetingAlert: vi.fn().mockReturnValue(null),
  getDepartmentResponsible: vi.fn().mockReturnValue({ email: 'responsable@jungla.com' }),
}));

// ─── Imports ────────────────────────────────────────────────────────────────
import {
  taskToMeetingRecord,
  meetingRecordToTask,
  type MeetingRecord,
} from '../../services/meetingService';
import type { Task } from '../../types/dashboard';

// ─── Datos de prueba ─────────────────────────────────────────────────────────

/** Task del calendario/UI (tipo Task de dashboard.ts) */
const mockTask: Task = {
  id: 'task-001',
  title: 'Reunión semanal de logística',
  description: 'Agenda de la semana',
  startDate: '2026-02-26',
  startTime: '10:00',
  endTime: '11:00',
  isRecurring: true,
  category: 'meeting',
  meetingType: 'weekly',
  department: 'logistica',
  assignmentType: 'corporativo',
  assignmentId: 'logistica',
  priority: 'high',
  status: 'pending',
  createdAt: '2026-02-26T09:00:00Z',
  updatedAt: '2026-02-26T09:00:00Z',
  createdBy: 'carlos@jungla.com',
  notes: 'Traer informes del trimestre',
};

/** MeetingRecord de la BD */
const mockMeetingRecord: MeetingRecord = {
  id: 1,
  title: 'Reunión semanal de logística',
  department: 'logistica',
  type: 'weekly',
  date: '2026-02-26',
  start_time: '10:00',
  end_time: '11:00',
  duration_minutes: 60,
  participants: ['responsable@jungla.com'],
  leader_email: 'carlos@jungla.com',
  status: 'scheduled',
  completion_percentage: 0,
  created_by: 'carlos@jungla.com',
  objectives: [],
  notes: 'Traer informes del trimestre',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('meetingService — transformaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── taskToMeetingRecord ──────────────────────────────────────────────────

  describe('taskToMeetingRecord()', () => {
    it('convierte el título correctamente', () => {
      const record = taskToMeetingRecord(mockTask);
      expect(record.title).toBe('Reunión semanal de logística');
    });

    it('mapea startDate del Task a date del MeetingRecord', () => {
      const record = taskToMeetingRecord(mockTask);
      expect(record.date).toBe('2026-02-26'); // startDate → date
    });

    it('mapea startTime y endTime correctamente', () => {
      const record = taskToMeetingRecord(mockTask);
      expect(record.start_time).toBe('10:00');
      expect(record.end_time).toBe('11:00');
    });

    it('calcula la duración en minutos (60 min)', () => {
      const record = taskToMeetingRecord(mockTask);
      expect(record.duration_minutes).toBe(60);
    });

    it('asigna el meetingType como type del record', () => {
      const record = taskToMeetingRecord(mockTask);
      expect(record.type).toBe('weekly'); // meetingType → type
    });

    it('asigna el createdBy como leader_email y created_by', () => {
      const record = taskToMeetingRecord(mockTask);
      expect(record.leader_email).toBe('carlos@jungla.com');
      expect(record.created_by).toBe('carlos@jungla.com');
    });

    it('mapea la descripción del Task como agenda del record', () => {
      const record = taskToMeetingRecord(mockTask);
      expect(record.agenda).toBe('Agenda de la semana');
    });

    it('usa "weekly" como fallback si no hay meetingType', () => {
      const taskSinTipo = { ...mockTask, meetingType: undefined };
      const record = taskToMeetingRecord(taskSinTipo);
      expect(record.type).toBe('weekly');
    });
  });

  // ── meetingRecordToTask ──────────────────────────────────────────────────

  describe('meetingRecordToTask()', () => {
    it('convierte el título correctamente', () => {
      const task = meetingRecordToTask(mockMeetingRecord);
      expect(task.title).toBe('Reunión semanal de logística');
    });

    it('mapea date del record a startDate del Task', () => {
      const task = meetingRecordToTask(mockMeetingRecord);
      expect(task.startDate).toBe('2026-02-26'); // date → startDate
    });

    it('mapea start_time y end_time a startTime y endTime', () => {
      const task = meetingRecordToTask(mockMeetingRecord);
      expect(task.startTime).toBe('10:00');
      expect(task.endTime).toBe('11:00');
    });

    it('asigna category = "meeting"', () => {
      const task = meetingRecordToTask(mockMeetingRecord);
      expect(task.category).toBe('meeting');
    });

    it('mapea type del record a meetingType del Task', () => {
      const task = meetingRecordToTask(mockMeetingRecord);
      expect(task.meetingType).toBe('weekly');
    });

    it('asigna los participantes en assignedTo', () => {
      const task = meetingRecordToTask(mockMeetingRecord);
      expect(task.assignedTo).toContain('responsable@jungla.com');
    });
  });

  // ── Round-trip ───────────────────────────────────────────────────────────

  describe('Round-trip: Task → MeetingRecord → Task', () => {
    it('mantiene el título en ambas conversiones', () => {
      const record = taskToMeetingRecord(mockTask);
      const taskBack = meetingRecordToTask(record);
      expect(taskBack.title).toBe(mockTask.title);
    });

    it('mantiene la fecha en ambas conversiones', () => {
      const record = taskToMeetingRecord(mockTask);
      const taskBack = meetingRecordToTask(record);
      expect(taskBack.startDate).toBe(mockTask.startDate);
    });

    it('mantiene los tiempos de inicio y fin', () => {
      const record = taskToMeetingRecord(mockTask);
      const taskBack = meetingRecordToTask(record);
      expect(taskBack.startTime).toBe(mockTask.startTime);
      expect(taskBack.endTime).toBe(mockTask.endTime);
    });
  });

  // ── Cálculo de duración ──────────────────────────────────────────────────

  describe('cálculo de duración en minutos', () => {
    it('60 minutos: 10:00 → 11:00', () => {
      const record = taskToMeetingRecord({ ...mockTask, startTime: '10:00', endTime: '11:00' });
      expect(record.duration_minutes).toBe(60);
    });

    it('90 minutos: 09:00 → 10:30', () => {
      const record = taskToMeetingRecord({ ...mockTask, startTime: '09:00', endTime: '10:30' });
      expect(record.duration_minutes).toBe(90);
    });

    it('30 minutos: 14:00 → 14:30', () => {
      const record = taskToMeetingRecord({ ...mockTask, startTime: '14:00', endTime: '14:30' });
      expect(record.duration_minutes).toBe(30);
    });

    it('sin endTime → duration_minutes es undefined', () => {
      const record = taskToMeetingRecord({ ...mockTask, endTime: undefined });
      expect(record.duration_minutes).toBeUndefined();
    });
  });
});
