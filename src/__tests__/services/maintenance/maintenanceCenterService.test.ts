/**
 * maintenanceCenterService.test.ts
 *
 * Centros, comparativas de salud, reparaciones frecuentes y sin gestionar.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase ───────────────────────────────────────────────────────────
const fromMock = vi.hoisted(() => vi.fn());

vi.mock('../../../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

// ─── Helper ──────────────────────────────────────────────────────────────────
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
  getCenters,
  getFrequentRepairs,
  getUnmanagedRepairs,
  setQuarterlyDeadline,
  getCenterComparison,
  getZonesAndConcepts,
} from '../../../services/maintenance/maintenanceCenterService';

// ─── getCenters() ────────────────────────────────────────────────────────────

describe('getCenters()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve lista de centros', async () => {
    const mockCenters = [
      { id: 'c1', name: 'Centro Sevilla' },
      { id: 'c2', name: 'Centro Jerez' },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockCenters, error: null }));

    const result = await getCenters();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Centro Sevilla');
    expect(fromMock).toHaveBeenCalledWith('centers');
  });

  it('error de Supabase — devuelve array vacío', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'Network error' } }));

    const result = await getCenters();

    expect(result).toEqual([]);
  });

  it('excepción inesperada — devuelve array vacío', async () => {
    fromMock.mockImplementationOnce(() => { throw new Error('Connection failed'); });

    const result = await getCenters();

    expect(result).toEqual([]);
  });
});

// ─── getFrequentRepairs() ────────────────────────────────────────────────────

describe('getFrequentRepairs()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('agrupa por concepto y ordena por frecuencia descendente', async () => {
    const mockItems = [
      { concept_name: 'Grifo', created_at: '2026-01-10' },
      { concept_name: 'Grifo', created_at: '2026-01-15' },
      { concept_name: 'Espejo', created_at: '2026-01-20' },
      { concept_name: 'Grifo', created_at: '2026-02-01' },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockItems, error: null }));

    const result = await getFrequentRepairs();

    expect(result[0].conceptName).toBe('Grifo');
    expect(result[0].count).toBe(3);
    expect(result[0].trend).toBe('stable');
    expect(result[1].conceptName).toBe('Espejo');
    expect(result[1].count).toBe(1);
  });

  it('sin items — devuelve array vacío', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const result = await getFrequentRepairs();

    expect(result).toEqual([]);
  });

  it('error — devuelve array vacío', async () => {
    fromMock.mockImplementationOnce(() => { throw new Error('DB error'); });

    const result = await getFrequentRepairs();

    expect(result).toEqual([]);
  });

  it('limita a top 5 resultados', async () => {
    const mockItems = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(n => ({
      concept_name: n, created_at: '2026-01-10'
    }));
    fromMock.mockReturnValueOnce(makeChain({ data: mockItems, error: null }));

    const result = await getFrequentRepairs();

    expect(result.length).toBeLessThanOrEqual(5);
  });
});

// ─── getUnmanagedRepairs() ───────────────────────────────────────────────────

describe('getUnmanagedRepairs()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve reparaciones no gestionadas con daysOpen calculado', async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 10); // 10 días atrás

    const mockItems = [
      {
        id: 'item-1',
        concept_name: 'Bomba de agua',
        created_at: sevenDaysAgo.toISOString(),
        status: 'regular',
        maintenance_inspections: { center_name: 'Centro Sevilla' },
      },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockItems, error: null }));

    const result = await getUnmanagedRepairs();

    expect(result).toHaveLength(1);
    expect(result[0].centerName).toBe('Centro Sevilla');
    expect(result[0].conceptName).toBe('Bomba de agua');
    expect(result[0].daysOpen).toBeGreaterThanOrEqual(10);
  });

  it('item sin centro asociado — muestra "Desconocido"', async () => {
    const mockItems = [
      {
        id: 'item-2',
        concept_name: 'Luz fundida',
        created_at: new Date().toISOString(),
        status: 'mal',
        maintenance_inspections: null,
      },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockItems, error: null }));

    const result = await getUnmanagedRepairs();

    expect(result[0].centerName).toBe('Desconocido');
  });

  it('error — devuelve array vacío', async () => {
    fromMock.mockImplementationOnce(() => { throw new Error('DB error'); });

    const result = await getUnmanagedRepairs();

    expect(result).toEqual([]);
  });
});

// ─── setQuarterlyDeadline() ──────────────────────────────────────────────────

describe('setQuarterlyDeadline()', () => {
  it('guarda la fecha límite en localStorage con la clave correcta', () => {
    const today = new Date();
    const currentQuarter = Math.floor(today.getMonth() / 3) + 1;
    const expectedKey = `maintenance_deadline_Q${currentQuarter}_${today.getFullYear()}`;
    const deadline = new Date('2026-03-31');

    setQuarterlyDeadline(deadline);

    expect(localStorage.getItem(expectedKey)).toBe(deadline.toISOString());
  });
});

// ─── getCenterComparison() ───────────────────────────────────────────────────

describe('getCenterComparison()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('calcula healthScore y pendingTickets por centro', async () => {
    const mockCenters = [{ id: 'c1', name: 'Sevilla' }];
    const mockIncidents = [
      { center_id: 'c1', center_name: 'Sevilla', status: 'abierta' },
      { center_id: 'c1', center_name: 'Sevilla', status: 'en_progreso' },
    ];
    const mockInspections = [
      { center_id: 'c1', center_name: 'Sevilla', overall_score: 85, inspection_date: '2026-02-15' },
    ];

    fromMock
      .mockReturnValueOnce(makeChain({ data: mockCenters, error: null }))      // getCenters()
      .mockReturnValueOnce(makeChain({ data: mockIncidents, error: null }))    // incidents
      .mockReturnValueOnce(makeChain({ data: mockInspections, error: null })); // inspections

    const result = await getCenterComparison();

    expect(result).toHaveLength(1);
    expect(result[0].centerName).toBe('Sevilla');
    expect(result[0].healthScore).toBe(85);
    expect(result[0].pendingTickets).toBe(2);
    expect(result[0].lastInspectionDate).toBe('2026-02-15');
  });

  it('sin centros — devuelve array vacío', async () => {
    fromMock
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }));

    const result = await getCenterComparison();

    expect(result).toEqual([]);
  });

  it('excepción inesperada — devuelve array vacío', async () => {
    fromMock.mockImplementationOnce(() => { throw new Error('Connection failed'); });

    const result = await getCenterComparison();

    expect(result).toEqual([]);
  });
});

// ─── getZonesAndConcepts() ───────────────────────────────────────────────────

describe('getZonesAndConcepts()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve zonas y conceptos desde Supabase', async () => {
    const mockZones = [{ id: 1, name: 'Zona Cardio' }, { id: 2, name: 'Vestuarios' }];
    const mockConcepts = [{ id: 1, zone_id: 1, name: 'Cintas' }];

    // Promise.all → dos queries simultáneas
    fromMock
      .mockReturnValueOnce(makeChain({ data: mockZones, error: null }))
      .mockReturnValueOnce(makeChain({ data: mockConcepts, error: null }));

    const result = await getZonesAndConcepts();

    expect(result.zones).toHaveLength(2);
    expect(result.concepts).toHaveLength(1);
  });

  it('error en Supabase — hace fallback a MAINTENANCE_ZONES/CONCEPTS estáticos', async () => {
    fromMock.mockImplementationOnce(() => { throw new Error('DB down'); });

    const result = await getZonesAndConcepts();

    // Debe devolver algo (las zonas estáticas, no null/undefined)
    expect(result.zones).toBeDefined();
    expect(result.concepts).toBeDefined();
    expect(Array.isArray(result.zones)).toBe(true);
  });
});
