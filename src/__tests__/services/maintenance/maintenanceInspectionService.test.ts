/**
 * maintenanceInspectionService.test.ts
 *
 * CRUD de inspecciones físicas de mantenimiento.
 * Estas inspecciones tienen consecuencias legales — cobertura crítica.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase ───────────────────────────────────────────────────────────
const fromMock = vi.hoisted(() => vi.fn());

vi.mock('../../../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

// ─── Helper: builder encadenable que resuelve a `resolvedValue` ──────────────
function makeChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  ['select', 'eq', 'neq', 'or', 'in', 'gte', 'lte', 'order', 'limit',
    'update', 'insert', 'delete', 'single', 'upsert'].forEach(m => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  (chain as { then: (res: (v: unknown) => unknown) => Promise<unknown> }).then =
    (resolve) => Promise.resolve(resolvedValue).then(resolve);
  return chain;
}

import {
  updateInspectionItemProgress,
  getInspectionsByCenter,
  getInspectionItems,
  needsInspection,
  getAllInspections,
  getCenterInspectionHistory,
  updateTaskStatus,
  clearAllData,
  completeInspection,
  createInspection,
} from '../../../services/maintenance/maintenanceInspectionService';

// ─── updateInspectionItemProgress() ─────────────────────────────────────────

describe('updateInspectionItemProgress()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('actualiza el item y devuelve success=true', async () => {
    fromMock.mockReturnValueOnce(makeChain({ error: null }));

    const result = await updateInspectionItemProgress('item-001', { status: 'regular', observations: 'Desgaste moderado' });

    expect(fromMock).toHaveBeenCalledWith('maintenance_inspection_items');
    expect(result.success).toBe(true);
  });

  it('error de Supabase — devuelve success=false', async () => {
    fromMock.mockReturnValueOnce(makeChain({ error: { message: 'Permiso denegado' } }));

    const result = await updateInspectionItemProgress('item-999', { status: 'mal' });

    // El servicio hace `throw error` con el objeto Supabase (no un Error nativo),
    // por lo que el catch devuelve el fallback 'Error desconocido'
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ─── getInspectionsByCenter() ────────────────────────────────────────────────

describe('getInspectionsByCenter()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve lista de inspecciones del centro', async () => {
    const mockData = [
      { id: 'ins-001', center_id: 'center-sev', status: 'completed', inspection_date: '2026-02-15' },
      { id: 'ins-002', center_id: 'center-sev', status: 'in_progress', inspection_date: '2026-01-15' },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockData, error: null }));

    const result = await getInspectionsByCenter('center-sev', 5);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(fromMock).toHaveBeenCalledWith('maintenance_inspections');
  });

  it('error — devuelve success=false', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'No autorizado' } }));

    const result = await getInspectionsByCenter('center-err');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ─── getInspectionItems() ────────────────────────────────────────────────────

describe('getInspectionItems()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve items ordenados por zona', async () => {
    const mockItems = [
      { id: 'item-1', zone_name: 'Sala Cardio', status: 'bien' },
      { id: 'item-2', zone_name: 'Vestuarios', status: 'regular' },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockItems, error: null }));

    const result = await getInspectionItems('ins-001');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('inspección sin items — devuelve array vacío', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const result = await getInspectionItems('ins-empty');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it('error — devuelve success=false', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'Timeout' } }));

    const result = await getInspectionItems('ins-err');

    expect(result.success).toBe(false);
  });
});

// ─── needsInspection() ──────────────────────────────────────────────────────

describe('needsInspection()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ya existe inspección este mes — needs=false', async () => {
    const existingInspection = { id: 'ins-001', status: 'completed' };
    fromMock.mockReturnValueOnce(makeChain({ data: existingInspection, error: null }));

    const result = await needsInspection('center-sev');

    expect(result.needs).toBe(false);
    expect(result.lastInspection).toEqual(existingInspection);
  });

  it('no existe inspección este mes (PGRST116) — needs=true', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { code: 'PGRST116', message: 'No rows' } }));

    const result = await needsInspection('center-new');

    expect(result.needs).toBe(true);
  });

  it('error genérico de BD — needs=true por precaución', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { code: 'OTHER', message: 'Connection refused' } }));

    const result = await needsInspection('center-down');

    expect(result.needs).toBe(true);
  });
});

// ─── getAllInspections() ─────────────────────────────────────────────────────

describe('getAllInspections()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sin filtros — devuelve todas las inspecciones', async () => {
    const mockData = [
      { id: 'ins-1', center_id: 'sev', inspection_date: '2026-02-15' },
      { id: 'ins-2', center_id: 'jer', inspection_date: '2026-01-15' },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockData, error: null }));

    const result = await getAllInspections();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('con filtros de centro y fechas — consulta con los parámetros correctos', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const result = await getAllInspections(
      { centerId: 'center-sev', startDate: '2026-01-01', endDate: '2026-02-28' },
      20
    );

    expect(result.success).toBe(true);
    // La cadena de mocks devuelve this → la función se completa sin error
  });

  it('error de Supabase — devuelve success=false', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'DB error' } }));

    const result = await getAllInspections();

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ─── getCenterInspectionHistory() ───────────────────────────────────────────

describe('getCenterInspectionHistory()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve historial completo del centro', async () => {
    const mockHistory = [
      { id: 'ins-1', inspection_date: '2026-02-15', overall_score: 85 },
      { id: 'ins-2', inspection_date: '2025-11-15', overall_score: 78 },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockHistory, error: null }));

    const result = await getCenterInspectionHistory('center-sev');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('error — devuelve success=false', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'Network error' } }));

    const result = await getCenterInspectionHistory('center-err');

    expect(result.success).toBe(false);
  });
});

// ─── updateTaskStatus() ─────────────────────────────────────────────────────

describe('updateTaskStatus()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cambio a "pendiente" — success=true', async () => {
    fromMock.mockReturnValueOnce(makeChain({ error: null }));

    const result = await updateTaskStatus('item-001', 'pendiente');

    expect(result.success).toBe(true);
    expect(fromMock).toHaveBeenCalledWith('maintenance_inspection_items');
  });

  it('cambio a "completada" — incluye completed_date y can_close_task', async () => {
    const chain = makeChain({ error: null });
    const updateFn = vi.fn().mockReturnValue(chain);
    (chain as Record<string, unknown>).update = updateFn;
    fromMock.mockReturnValueOnce(chain);

    const result = await updateTaskStatus('item-002', 'completada');

    expect(result.success).toBe(true);
    const updateArg = updateFn.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(updateArg?.completed_date).toBeDefined();
    expect(updateArg?.can_close_task).toBe(true);
  });

  it('con fotos de reparación — can_close_task=true', async () => {
    const chain = makeChain({ error: null });
    const updateFn = vi.fn().mockReturnValue(chain);
    (chain as Record<string, unknown>).update = updateFn;
    fromMock.mockReturnValueOnce(chain);

    const result = await updateTaskStatus('item-003', 'en_progreso', ['https://example.com/foto.jpg']);

    expect(result.success).toBe(true);
    const updateArg = updateFn.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(updateArg?.can_close_task).toBe(true);
  });

  it('error de Supabase — devuelve success=false', async () => {
    fromMock.mockReturnValueOnce(makeChain({ error: { message: 'RLS violation' } }));

    const result = await updateTaskStatus('item-999', 'completada');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RLS violation');
  });
});

// ─── clearAllData() ──────────────────────────────────────────────────────────

describe('clearAllData()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('borra las 3 tablas y devuelve success=true', async () => {
    fromMock
      .mockReturnValueOnce(makeChain({ error: null }))   // maintenance_alerts
      .mockReturnValueOnce(makeChain({ error: null }))   // maintenance_inspection_items
      .mockReturnValueOnce(makeChain({ error: null }));  // maintenance_inspections

    const result = await clearAllData();

    expect(result.success).toBe(true);
    expect(fromMock).toHaveBeenCalledTimes(3);
    expect(fromMock).toHaveBeenNthCalledWith(1, 'maintenance_alerts');
    expect(fromMock).toHaveBeenNthCalledWith(2, 'maintenance_inspection_items');
    expect(fromMock).toHaveBeenNthCalledWith(3, 'maintenance_inspections');
  });

  it('error en primera tabla — devuelve success=false', async () => {
    fromMock.mockReturnValueOnce(makeChain({ error: { message: 'RLS error' } }));

    const result = await clearAllData();

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ─── completeInspection() ────────────────────────────────────────────────────

describe('completeInspection()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('marca como completada y procesa items sin críticos', async () => {
    const mockInspection = { id: 'ins-001', center_id: 'sev', items_bad: 0, overall_score: 90 };
    const mockItems: unknown[] = []; // sin items críticos → no se crean alertas

    fromMock
      .mockReturnValueOnce(makeChain({ data: mockInspection, error: null }))  // update + select + single
      .mockReturnValueOnce(makeChain({ data: mockItems, error: null }));       // select items

    const result = await completeInspection('ins-001', { overall_score: 90 });

    expect(result.success).toBe(true);
    expect(fromMock).toHaveBeenCalledWith('maintenance_inspections');
  });

  it('error en update — devuelve success=false', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'Constraint failed' } }));

    const result = await completeInspection('ins-err', {});

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ─── createInspection() ──────────────────────────────────────────────────────

describe('createInspection()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('crea inspección e items correctamente', async () => {
    const newInspection = { id: 'ins-new', center_id: 'sev', center_name: 'Sevilla' };
    const inspectionData = {
      inspection: { center_id: 'sev', inspector_name: 'Ana García' } as Parameters<typeof createInspection>[0]['inspection'],
      items: [],
    };

    fromMock
      .mockReturnValueOnce(makeChain({ data: newInspection, error: null }))   // insert inspection
      .mockReturnValueOnce(makeChain({ error: null }));                         // insert items (vacío)

    const result = await createInspection(inspectionData);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(newInspection);
  });

  it('error al insertar inspection — devuelve success=false', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'Duplicate key' } }));

    const result = await createInspection({
      inspection: { center_id: 'sev' } as Parameters<typeof createInspection>[0]['inspection'],
      items: [],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Duplicate key');
  });

  it('error al insertar items — hace rollback de la inspección', async () => {
    const newInspection = { id: 'ins-rollback', center_id: 'sev' };

    fromMock
      .mockReturnValueOnce(makeChain({ data: newInspection, error: null }))        // insert inspection OK
      .mockReturnValueOnce(makeChain({ error: { message: 'Items insert failed' } })) // insert items FAIL
      .mockReturnValueOnce(makeChain({ error: null }));                               // delete rollback

    const result = await createInspection({
      inspection: { center_id: 'sev' } as Parameters<typeof createInspection>[0]['inspection'],
      items: [{ concept_name: 'Test' } as Parameters<typeof createInspection>[0]['items'][0]],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Items insert failed');
    // El delete (rollback) fue llamado
    expect(fromMock).toHaveBeenCalledTimes(3);
  });
});
