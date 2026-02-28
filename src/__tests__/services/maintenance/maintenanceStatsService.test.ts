/**
 * maintenanceStatsService.test.ts
 *
 * Estadísticas de mantenimiento: totales, director y globales.
 * Foco en cálculos de promedios, agregaciones y manejo de errores.
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
  ['select', 'eq', 'neq', 'or', 'in', 'gte', 'lte', 'order', 'limit', 'update', 'insert', 'delete', 'single', 'upsert'].forEach(m => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  (chain as { then: (res: (v: unknown) => unknown) => Promise<unknown> }).then =
    (resolve) => Promise.resolve(resolvedValue).then(resolve);
  return chain;
}

import {
  getMaintenanceStats,
  getDirectorStats,
  getGlobalMaintenanceStats,
} from '../../../services/maintenance/maintenanceStatsService';

// ─── getMaintenanceStats() ───────────────────────────────────────────────────

describe('getMaintenanceStats() — sin centerId', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calcula totalInspections, averageScore y criticalIssues correctamente', async () => {
    const mockInspections = [
      { overall_score: 80, items_bad: 2, items_regular: 1 },
      { overall_score: 90, items_bad: 1, items_regular: 2 },
    ];
    const mockTasks = [{ id: 1 }, { id: 2 }, { id: 3 }];

    fromMock
      .mockReturnValueOnce(makeChain({ data: mockInspections, error: null }))
      .mockReturnValueOnce(makeChain({ data: mockTasks, error: null }));

    const result = await getMaintenanceStats();

    expect(result.totalInspections).toBe(2);
    expect(result.averageScore).toBe(85);      // (80+90)/2 = 85
    expect(result.criticalIssues).toBe(3);     // items_bad: 2+1
    expect(result.pendingTasks).toBe(3);        // de la tabla items
  });

  it('sin inspecciones — averageScore y criticalIssues son 0', async () => {
    fromMock
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }));

    const result = await getMaintenanceStats();

    expect(result.totalInspections).toBe(0);
    expect(result.averageScore).toBe(0);
    expect(result.criticalIssues).toBe(0);
    expect(result.pendingTasks).toBe(0);
  });

  it('error de Supabase — devuelve ceros', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'DB error' } }));

    const result = await getMaintenanceStats();

    expect(result.totalInspections).toBe(0);
    expect(result.averageScore).toBe(0);
    expect(result.criticalIssues).toBe(0);
    expect(result.pendingTasks).toBe(0);
  });
});

describe('getMaintenanceStats() — con centerId', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calcula pendingTasks desde inspecciones (items_regular + items_bad)', async () => {
    const mockInspections = [
      { overall_score: 70, items_bad: 1, items_regular: 2 },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockInspections, error: null }));

    const result = await getMaintenanceStats('center-sev');

    expect(result.totalInspections).toBe(1);
    expect(result.averageScore).toBe(70);
    expect(result.pendingTasks).toBe(3);       // items_regular(2) + items_bad(1)
    expect(fromMock).toHaveBeenCalledTimes(1); // no segunda query a items table
  });

  it('con múltiples inspecciones — promedia correctamente', async () => {
    const mockInspections = [
      { overall_score: 60, items_bad: 3, items_regular: 1 },
      { overall_score: 80, items_bad: 1, items_regular: 0 },
      { overall_score: 100, items_bad: 0, items_regular: 0 },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockInspections, error: null }));

    const result = await getMaintenanceStats('center-jerez');

    expect(result.totalInspections).toBe(3);
    expect(result.averageScore).toBe(80);      // (60+80+100)/3 = 80
    expect(result.criticalIssues).toBe(4);    // items_bad: 3+1+0
  });
});

// ─── getDirectorStats() ──────────────────────────────────────────────────────

describe('getDirectorStats()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('suma tickets de inspecciones y checklist para totalActiveTickets', async () => {
    fromMock
      .mockReturnValueOnce(makeChain({ count: 5, error: null }))     // inspection items activos
      .mockReturnValueOnce(makeChain({ count: 3, error: null }))     // checklist incidents activos
      .mockReturnValueOnce(makeChain({ data: [], error: null }))     // tickets completados (vacío)
      .mockReturnValueOnce(makeChain({ count: 2, error: null }))     // críticos inspecciones
      .mockReturnValueOnce(makeChain({ count: 1, error: null }))     // críticos checklist
      .mockReturnValueOnce(makeChain({ count: 4, error: null }));    // inspecciones este mes

    const result = await getDirectorStats();

    expect(result.totalActiveTickets).toBe(8);          // 5+3
    expect(result.avgResolutionTime).toBe(0);            // sin tickets completados
    expect(result.criticalIssuesCount).toBe(3);         // 2+1
    expect(result.totalInspectionsThisMonth).toBe(4);
  });

  it('calcula avgResolutionTime correctamente con tickets completados', async () => {
    const completedTickets = [
      { created_at: '2026-02-01T00:00:00Z', completed_date: '2026-02-04T00:00:00Z' }, // 3 días
      { created_at: '2026-02-01T00:00:00Z', completed_date: '2026-02-06T00:00:00Z' }, // 5 días
    ];

    fromMock
      .mockReturnValueOnce(makeChain({ count: 0, error: null }))
      .mockReturnValueOnce(makeChain({ count: 0, error: null }))
      .mockReturnValueOnce(makeChain({ data: completedTickets, error: null }))
      .mockReturnValueOnce(makeChain({ count: 0, error: null }))
      .mockReturnValueOnce(makeChain({ count: 0, error: null }))
      .mockReturnValueOnce(makeChain({ count: 0, error: null }));

    const result = await getDirectorStats();

    expect(result.avgResolutionTime).toBe(4);            // (3+5)/2 = 4 días
  });

  it('error en primer query — devuelve ceros', async () => {
    fromMock.mockImplementationOnce(() => { throw new Error('DB down'); });

    const result = await getDirectorStats();

    expect(result.totalActiveTickets).toBe(0);
    expect(result.avgResolutionTime).toBe(0);
    expect(result.criticalIssuesCount).toBe(0);
    expect(result.totalInspectionsThisMonth).toBe(0);
  });
});

// ─── getGlobalMaintenanceStats() ────────────────────────────────────────────

describe('getGlobalMaintenanceStats()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('agrupa por mes y calcula promedio de puntuación', async () => {
    const mockInspections = [
      { inspection_date: '2026-01-15', overall_score: 80, center_name: 'Sevilla' },
      { inspection_date: '2026-01-20', overall_score: 90, center_name: 'Jerez' },
      { inspection_date: '2026-02-10', overall_score: 70, center_name: 'Puerto' },
    ];

    fromMock.mockReturnValueOnce(makeChain({ data: mockInspections, error: null }));

    const result = await getGlobalMaintenanceStats();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);

    const jan = result.data?.find(d => d.month === '2026-01');
    const feb = result.data?.find(d => d.month === '2026-02');

    expect(jan?.averageScore).toBe(85);   // (80+90)/2
    expect(jan?.count).toBe(2);
    expect(feb?.averageScore).toBe(70);
    expect(feb?.count).toBe(1);
  });

  it('sin inspecciones — devuelve array vacío con success=true', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const result = await getGlobalMaintenanceStats();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it('error de Supabase — devuelve success=false con mensaje de error', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'Timeout' } }));

    const result = await getGlobalMaintenanceStats();

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('una sola inspección — count=1 y score correcto', async () => {
    fromMock.mockReturnValueOnce(makeChain({
      data: [{ inspection_date: '2026-03-15', overall_score: 95, center_name: 'Sevilla' }],
      error: null,
    }));

    const result = await getGlobalMaintenanceStats();

    expect(result.success).toBe(true);
    expect(result.data?.[0]?.averageScore).toBe(95);
    expect(result.data?.[0]?.count).toBe(1);
  });
});
