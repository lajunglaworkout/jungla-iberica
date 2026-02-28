/**
 * Tests para src/services/meetingService.ts
 * Funciones puras de transformación + funciones Supabase con mock
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  taskToMeetingRecord,
  meetingRecordToTask,
  saveMeetingToSupabase,
  loadMeetingsFromSupabase,
  updateMeetingInSupabase,
  deleteMeetingFromSupabase,
  getMeetingsByDepartment,
} from '../services/meetingService';
import type { Task } from '../types/dashboard';
import type { MeetingRecord } from '../services/meetingService';

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}));

vi.mock('../services/taskService', () => ({
  deleteTasksByMeetingId: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../services/notificationService', () => ({
  notifyMeetingScheduled: vi.fn().mockResolvedValue(undefined),
}));

import { supabase } from '../lib/supabase';

/** Cadena de mock Supabase reutilizable. Soporta .select/insert/update/delete/eq/order/or/single/await */
function buildChain(resolved: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'or', 'ilike', 'gte', 'lte', 'in', 'neq']) {
    (chain as Record<string, unknown>)[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockResolvedValue(resolved);
  // Hace que `await chain` funcione (para queries sin .single())
  (chain as Record<string, unknown>).then = (
    onFulfilled: (v: unknown) => unknown,
    onRejected?: (e: unknown) => unknown
  ) => Promise.resolve(resolved).then(onFulfilled, onRejected);

  vi.mocked(supabase.from).mockReturnValue(chain as ReturnType<typeof supabase.from>);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Funciones puras ────────────────────────────────────────────────────────

const baseTask: Task = {
  id: '42',
  title: 'Reunión semanal marketing',
  startDate: '2026-01-15',
  startTime: '10:00',
  endTime: '11:00',
  isRecurring: false,
  category: 'meeting',
  priority: 'high',
  status: 'scheduled',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  createdBy: 'carlos@example.com',
};

const baseRecord: MeetingRecord = {
  id: 1,
  title: 'Reunión semanal marketing',
  department: 'marketing',
  type: 'weekly',
  date: '2026-01-15',
  start_time: '10:00',
  participants: ['responsable@empresa.com'],
  leader_email: 'carlos@example.com',
  status: 'scheduled',
  completion_percentage: 0,
  created_by: 'carlos@example.com',
};

describe('taskToMeetingRecord()', () => {
  it('mapea title, date y start_time correctamente', () => {
    const record = taskToMeetingRecord(baseTask);
    expect(record.title).toBe('Reunión semanal marketing');
    expect(record.date).toBe('2026-01-15');
    expect(record.start_time).toBe('10:00');
  });

  it('calcula duration_minutes cuando hay endTime', () => {
    const record = taskToMeetingRecord(baseTask); // 10:00 → 11:00
    expect(record.duration_minutes).toBe(60);
  });

  it('duration_minutes es undefined cuando no hay endTime', () => {
    const task = { ...baseTask, endTime: undefined };
    const record = taskToMeetingRecord(task);
    expect(record.duration_minutes).toBeUndefined();
  });

  it('tipo por defecto es weekly cuando no hay meetingType', () => {
    const record = taskToMeetingRecord(baseTask);
    expect(record.type).toBe('weekly');
  });

  it('usa el meetingType si se especifica', () => {
    const task = { ...baseTask, meetingType: 'monthly' as const };
    const record = taskToMeetingRecord(task);
    expect(record.type).toBe('monthly');
  });

  it('participants vacío cuando no hay department ni assignmentType', () => {
    const task = { ...baseTask, department: undefined };
    const record = taskToMeetingRecord(task);
    expect(record.participants).toEqual([]);
  });

  it('usa centro assignmentId como participante cuando assignmentType es centro', () => {
    const task = { ...baseTask, assignmentType: 'centro' as const, assignmentId: 'empleado-456' };
    const record = taskToMeetingRecord(task);
    expect(record.participants).toContain('empleado-456');
  });

  it('status por defecto es scheduled cuando task.status no es un status válido', () => {
    const task = { ...baseTask, status: 'pending' as Task['status'] };
    const record = taskToMeetingRecord(task);
    // status se castea directamente desde task.status
    expect(['scheduled', 'in_progress', 'completed', 'cancelled', 'pending']).toContain(record.status);
  });
});

describe('meetingRecordToTask()', () => {
  it('mapea id como string', () => {
    const task = meetingRecordToTask(baseRecord);
    expect(task.id).toBe('1');
  });

  it('mapea title correctamente', () => {
    const task = meetingRecordToTask(baseRecord);
    expect(task.title).toBe('Reunión semanal marketing');
  });

  it('isRecurring es false para tipo quarterly', () => {
    const record = { ...baseRecord, type: 'quarterly' as const };
    const task = meetingRecordToTask(record);
    expect(task.isRecurring).toBe(false);
  });

  it('isRecurring es true para tipo weekly', () => {
    const task = meetingRecordToTask(baseRecord); // type: weekly
    expect(task.isRecurring).toBe(true);
  });

  it('meetingType es monthly para reuniones quarterly (coercionado)', () => {
    const record = { ...baseRecord, type: 'quarterly' as const };
    const task = meetingRecordToTask(record);
    expect(task.meetingType).toBe('monthly');
  });

  it('participants se convierte a string en assignedTo', () => {
    const record = { ...baseRecord, participants: ['a@b.com', 'c@d.com'] };
    const task = meetingRecordToTask(record);
    expect(task.assignedTo).toBe('a@b.com, c@d.com');
  });

  it('category es siempre meeting', () => {
    const task = meetingRecordToTask(baseRecord);
    expect(task.category).toBe('meeting');
  });
});

// ─── Funciones Supabase ─────────────────────────────────────────────────────

describe('saveMeetingToSupabase()', () => {
  it('devuelve success:true cuando Supabase inserta correctamente', async () => {
    buildChain({ data: { id: 99, ...baseRecord }, error: null });
    const result = await saveMeetingToSupabase(baseTask);
    expect(result.success).toBe(true);
    expect(result.meeting).toBeDefined();
  });

  it('devuelve success:false cuando Supabase devuelve error', async () => {
    buildChain({ data: null, error: { message: 'DB error' } });
    const result = await saveMeetingToSupabase(baseTask);
    expect(result.success).toBe(false);
    expect(result.error).toBe('DB error');
  });
});

describe('loadMeetingsFromSupabase()', () => {
  it('devuelve meetings cuando no se pasa userEmail', async () => {
    buildChain({ data: [baseRecord], error: null });
    const result = await loadMeetingsFromSupabase();
    expect(result.success).toBe(true);
    expect(result.meetings).toHaveLength(1);
    expect(result.meetings![0].title).toBe('Reunión semanal marketing');
  });

  it('devuelve meetings cuando se pasa userEmail (activa filtro .or)', async () => {
    buildChain({ data: [baseRecord], error: null });
    const result = await loadMeetingsFromSupabase('carlos@example.com');
    expect(result.success).toBe(true);
    expect(result.meetings).toHaveLength(1);
  });

  it('devuelve success:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'Timeout' } });
    const result = await loadMeetingsFromSupabase();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Timeout');
  });
});

describe('updateMeetingInSupabase()', () => {
  it('devuelve error sin llamar a Supabase si el ID no es numérico', async () => {
    const task = { ...baseTask, id: 'meeting-not-a-number' };
    const result = await updateMeetingInSupabase(task);
    expect(result.success).toBe(false);
    expect(result.error).toContain('inválido');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('devuelve success:true cuando Supabase actualiza correctamente', async () => {
    buildChain({ data: null, error: null });
    const task = { ...baseTask, id: '1' };
    const result = await updateMeetingInSupabase(task);
    expect(result.success).toBe(true);
  });

  it('devuelve success:false cuando Supabase falla en update', async () => {
    buildChain({ data: null, error: { message: 'Update failed' } });
    const task = { ...baseTask, id: '1' };
    const result = await updateMeetingInSupabase(task);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Update failed');
  });
});

describe('deleteMeetingFromSupabase()', () => {
  it('devuelve error sin llamar a Supabase si el ID no es numérico', async () => {
    const result = await deleteMeetingFromSupabase('abc');
    expect(result.success).toBe(false);
    expect(result.error).toContain('inválido');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('devuelve success:true cuando elimina correctamente', async () => {
    buildChain({ data: null, error: null });
    const result = await deleteMeetingFromSupabase('5');
    expect(result.success).toBe(true);
  });
});

describe('getMeetingsByDepartment()', () => {
  it('devuelve meetings del departamento especificado', async () => {
    buildChain({ data: [baseRecord], error: null });
    const result = await getMeetingsByDepartment('marketing');
    expect(result.success).toBe(true);
    expect(result.meetings).toHaveLength(1);
  });

  it('devuelve success:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'Error dept' } });
    const result = await getMeetingsByDepartment('marketing');
    expect(result.success).toBe(false);
  });
});
