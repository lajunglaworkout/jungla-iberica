/**
 * Tests para src/services/taskService.ts
 * CRUD de tareas y estadísticas
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  completeTask,
  getTasksByUser,
  getPendingTasks,
  getCompletedTasks,
  getTaskStats,
  deleteTasksByMeetingId,
  filterTasks,
} from '../services/taskService';

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}));

vi.mock('../services/notificationService', () => ({
  deleteTaskNotifications: vi.fn().mockResolvedValue(undefined),
}));

import { supabase } from '../lib/supabase';

function buildChain(resolved: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'or', 'ilike', 'gte', 'lte', 'in']) {
    (chain as Record<string, unknown>)[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockResolvedValue(resolved);
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

// ─── completeTask ─────────────────────────────────────────────────────────────

describe('completeTask()', () => {
  it('devuelve success:true y llama a deleteTaskNotifications en éxito', async () => {
    buildChain({ data: null, error: null });
    const { deleteTaskNotifications } = await import('../services/notificationService');

    const result = await completeTask('task-1', 'carlos@example.com', 'todo listo', [], []);
    expect(result.success).toBe(true);
    expect(deleteTaskNotifications).toHaveBeenCalledWith('task-1');
  });

  it('devuelve success:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'DB constraint' } });
    const result = await completeTask('task-1', 'carlos@example.com', 'notas', [], []);
    expect(result.success).toBe(false);
    expect(result.error).toBe('DB constraint');
  });

  it('envía attachments y links a Supabase', async () => {
    const chain = buildChain({ data: null, error: null });
    const attachments = [{ url: 'https://example.com/file.pdf', name: 'Informe' }];
    const links = ['https://drive.google.com/doc1'];

    await completeTask('task-5', 'user@test.com', 'adjuntos', attachments, links);

    // update fue llamado
    expect(supabase.from).toHaveBeenCalledWith('tareas');
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: 'completada',
        attachments,
        links,
      })
    );
  });
});

// ─── getTasksByUser ──────────────────────────────────────────────────────────

describe('getTasksByUser()', () => {
  it('devuelve tareas del usuario especificado', async () => {
    const tasks = [{ id: 1, estado: 'pendiente', prioridad: 'alta' }];
    buildChain({ data: tasks, error: null });

    const result = await getTasksByUser('carlos@example.com');
    expect(result.success).toBe(true);
    expect(result.tasks).toEqual(tasks);
  });

  it('devuelve array vacío cuando data es null', async () => {
    buildChain({ data: null, error: null });
    const result = await getTasksByUser('carlos@example.com');
    expect(result.success).toBe(true);
    expect(result.tasks).toEqual([]);
  });

  it('aplica filtro de estado cuando se proporciona', async () => {
    const chain = buildChain({ data: [], error: null });
    await getTasksByUser('carlos@example.com', 'pendiente');
    // eq fue llamado al menos 2 veces (asignado_a + estado)
    expect(chain.eq).toHaveBeenCalledWith('estado', 'pendiente');
  });

  it('devuelve success:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'Network error' } });
    const result = await getTasksByUser('carlos@example.com');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });
});

// ─── getPendingTasks ─────────────────────────────────────────────────────────

describe('getPendingTasks()', () => {
  it('devuelve tareas pendientes', async () => {
    const tasks = [{ id: 1, estado: 'pendiente', prioridad: 'critica' }];
    buildChain({ data: tasks, error: null });

    const result = await getPendingTasks();
    expect(result.success).toBe(true);
    expect(result.tasks).toEqual(tasks);
  });

  it('devuelve success:false en caso de error', async () => {
    buildChain({ data: null, error: { message: 'Timeout' } });
    const result = await getPendingTasks();
    expect(result.success).toBe(false);
  });
});

// ─── getCompletedTasks ───────────────────────────────────────────────────────

describe('getCompletedTasks()', () => {
  it('devuelve tareas completadas', async () => {
    const tasks = [{ id: 2, estado: 'completada', prioridad: 'alta' }];
    buildChain({ data: tasks, error: null });

    const result = await getCompletedTasks();
    expect(result.success).toBe(true);
    expect(result.tasks).toEqual(tasks);
  });

  it('devuelve array vacío cuando data es null', async () => {
    buildChain({ data: null, error: null });
    const result = await getCompletedTasks();
    expect(result.tasks).toEqual([]);
  });
});

// ─── getTaskStats (cómputo en memoria) ──────────────────────────────────────

describe('getTaskStats()', () => {
  it('cuenta correctamente totales y estados', async () => {
    buildChain({
      data: [
        { estado: 'pendiente', prioridad: 'critica' },
        { estado: 'pendiente', prioridad: 'alta' },
        { estado: 'completada', prioridad: 'media' },
        { estado: 'pendiente', prioridad: 'critica' },
      ],
      error: null,
    });

    const result = await getTaskStats();
    expect(result.success).toBe(true);
    expect(result.stats?.total).toBe(4);
    expect(result.stats?.pendientes).toBe(3);
    expect(result.stats?.completadas).toBe(1);
    expect(result.stats?.criticas).toBe(2);
    expect(result.stats?.altas).toBe(1);
  });

  it('devuelve todo en cero cuando no hay tareas', async () => {
    buildChain({ data: [], error: null });
    const result = await getTaskStats();
    expect(result.stats?.total).toBe(0);
    expect(result.stats?.pendientes).toBe(0);
    expect(result.stats?.completadas).toBe(0);
    expect(result.stats?.criticas).toBe(0);
    expect(result.stats?.altas).toBe(0);
  });

  it('devuelve success:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'Stats error' } });
    const result = await getTaskStats();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Stats error');
  });
});

// ─── deleteTasksByMeetingId ──────────────────────────────────────────────────

describe('deleteTasksByMeetingId()', () => {
  it('devuelve success:true cuando elimina correctamente', async () => {
    buildChain({ data: null, error: null });
    const result = await deleteTasksByMeetingId(42);
    expect(result.success).toBe(true);
  });

  it('llama a Supabase con el meetingId correcto', async () => {
    const chain = buildChain({ data: null, error: null });
    await deleteTasksByMeetingId(99);
    expect(supabase.from).toHaveBeenCalledWith('tareas');
    expect(chain.eq).toHaveBeenCalledWith('reunion_origen', 99);
  });

  it('devuelve success:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'FK violation' } });
    const result = await deleteTasksByMeetingId(1);
    expect(result.success).toBe(false);
    expect(result.error).toBe('FK violation');
  });
});

// ─── filterTasks ─────────────────────────────────────────────────────────────

describe('filterTasks()', () => {
  it('devuelve tareas filtradas sin filtros (trae todo)', async () => {
    const tasks = [{ id: 1, estado: 'pendiente', prioridad: 'alta' }];
    buildChain({ data: tasks, error: null });

    const result = await filterTasks({});
    expect(result.success).toBe(true);
    expect(result.tasks).toEqual(tasks);
  });

  it('aplica filtro de estado', async () => {
    const chain = buildChain({ data: [], error: null });
    await filterTasks({ estado: 'completada' });
    expect(chain.eq).toHaveBeenCalledWith('estado', 'completada');
  });

  it('aplica filtro de prioridad', async () => {
    const chain = buildChain({ data: [], error: null });
    await filterTasks({ prioridad: 'critica' });
    expect(chain.eq).toHaveBeenCalledWith('prioridad', 'critica');
  });

  it('aplica filtro de fecha_desde', async () => {
    const chain = buildChain({ data: [], error: null });
    await filterTasks({ fecha_desde: '2026-01-01' });
    expect(chain.gte).toHaveBeenCalledWith('fecha_limite', '2026-01-01');
  });

  it('devuelve success:false en error de Supabase', async () => {
    buildChain({ data: null, error: { message: 'Filter error' } });
    const result = await filterTasks({ estado: 'pendiente' });
    expect(result.success).toBe(false);
  });
});
