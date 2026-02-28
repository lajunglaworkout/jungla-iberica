/**
 * brandService.test.ts
 *
 * CRUD de ingresos y gastos de la marca, cálculo de resúmenes
 * mensuales (IVA incluido) y estadísticas anuales.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase ───────────────────────────────────────────────────────────
const fromMock = vi.hoisted(() => vi.fn());

vi.mock('../../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  ['select', 'eq', 'neq', 'not', 'order', 'limit', 'insert', 'update', 'delete', 'upsert', 'in'].forEach(m => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  chain.single = vi.fn().mockReturnValue(chain);
  (chain as { then: (res: (v: unknown) => unknown) => Promise<unknown> }).then =
    (resolve) => Promise.resolve(resolvedValue).then(resolve);
  return chain;
}

import { brandService } from '../../services/brandService';

// ─── getIngresosByMonth() ────────────────────────────────────────────────────

describe('brandService.getIngresosByMonth()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve ingresos del mes especificado', async () => {
    const mockData = [
      { id: 'i1', concepto: 'Royalties Sevilla', importe: 3000, iva: true, mes: 2, año: 2026 },
      { id: 'i2', concepto: 'Cuota Jerez', importe: 1500, iva: false, mes: 2, año: 2026 },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockData, error: null }));

    const result = await brandService.getIngresosByMonth(2, 2026);

    expect(result).toHaveLength(2);
    expect(result[0].concepto).toBe('Royalties Sevilla');
    expect(fromMock).toHaveBeenCalledWith('ingresos_marca');
  });

  it('devuelve array vacío cuando no hay datos', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: null }));

    const result = await brandService.getIngresosByMonth(1, 2026);

    expect(result).toEqual([]);
  });

  it('lanza error si Supabase falla', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'Connection refused' } }));

    await expect(brandService.getIngresosByMonth(2, 2026)).rejects.toBeDefined();
  });
});

// ─── getGastosByMonth() ──────────────────────────────────────────────────────

describe('brandService.getGastosByMonth()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve gastos del mes especificado', async () => {
    const mockData = [{ id: 'g1', concepto: 'Marketing', importe: 800, iva: true, mes: 2, año: 2026 }];
    fromMock.mockReturnValueOnce(makeChain({ data: mockData, error: null }));

    const result = await brandService.getGastosByMonth(2, 2026);

    expect(result).toHaveLength(1);
    expect(fromMock).toHaveBeenCalledWith('gastos_marca');
  });

  it('lanza error si Supabase falla', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'DB error' } }));

    await expect(brandService.getGastosByMonth(1, 2026)).rejects.toBeDefined();
  });
});

// ─── createIngreso() ─────────────────────────────────────────────────────────

describe('brandService.createIngreso()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('crea ingreso y devuelve el registro creado', async () => {
    const newIngreso = { id: 'i-new', concepto: 'Nuevo royalty', importe: 2000, iva: true, mes: 2, año: 2026 };
    fromMock.mockReturnValueOnce(makeChain({ data: newIngreso, error: null }));

    const result = await brandService.createIngreso({
      concepto: 'Nuevo royalty', importe: 2000, iva: true, mes: 2, año: 2026,
      tipo: 'Royalties', fecha: '2026-02-01', user_id: 'uuid-1'
    });

    expect(result.concepto).toBe('Nuevo royalty');
    expect(fromMock).toHaveBeenCalledWith('ingresos_marca');
  });

  it('lanza error si Supabase falla', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'Unique violation' } }));

    await expect(brandService.createIngreso({
      concepto: 'Test', importe: 100, iva: false, mes: 1, año: 2026,
      tipo: 'Test', fecha: '2026-01-01', user_id: 'uid'
    })).rejects.toBeDefined();
  });
});

// ─── deleteIngreso() ─────────────────────────────────────────────────────────

describe('brandService.deleteIngreso()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('elimina ingreso sin lanzar error', async () => {
    fromMock.mockReturnValueOnce(makeChain({ error: null }));

    await expect(brandService.deleteIngreso('i-1')).resolves.toBeUndefined();
    expect(fromMock).toHaveBeenCalledWith('ingresos_marca');
  });

  it('lanza error si Supabase falla', async () => {
    fromMock.mockReturnValueOnce(makeChain({ error: { message: 'RLS violation' } }));

    await expect(brandService.deleteIngreso('i-1')).rejects.toBeDefined();
  });
});

// ─── deleteGasto() ───────────────────────────────────────────────────────────

describe('brandService.deleteGasto()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('elimina gasto sin error', async () => {
    fromMock.mockReturnValueOnce(makeChain({ error: null }));

    await expect(brandService.deleteGasto('g-1')).resolves.toBeUndefined();
    expect(fromMock).toHaveBeenCalledWith('gastos_marca');
  });
});

// ─── getResumenMensual() ─────────────────────────────────────────────────────

describe('brandService.getResumenMensual()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve resumen si existe', async () => {
    const mockResumen = { mes: 2, año: 2026, total_ingresos: 5000, beneficio_neto: 2000 };
    fromMock.mockReturnValueOnce(makeChain({ data: mockResumen, error: null }));

    const result = await brandService.getResumenMensual(2, 2026);

    expect(result).toEqual(mockResumen);
  });

  it('devuelve null cuando no existe (PGRST116)', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { code: 'PGRST116', message: 'No rows' } }));

    const result = await brandService.getResumenMensual(1, 2020);

    expect(result).toBeNull();
  });

  it('lanza error para errores distintos de PGRST116', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { code: 'OTHER', message: 'DB error' } }));

    await expect(brandService.getResumenMensual(1, 2026)).rejects.toBeDefined();
  });
});

// ─── calculateAndSaveResumen() ───────────────────────────────────────────────

describe('brandService.calculateAndSaveResumen()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calcula IVA correctamente (21% sobre importes con iva=true)', async () => {
    const ingresos = [
      { id: 'i1', importe: 1000, iva: true, mes: 2, año: 2026 },   // IVA: 210
      { id: 'i2', importe: 500, iva: false, mes: 2, año: 2026 },   // IVA: 0
    ];
    const gastos = [
      { id: 'g1', importe: 300, iva: true, mes: 2, año: 2026 },    // IVA: 63
    ];
    const savedResumen = { mes: 2, año: 2026, total_ingresos: 1210, iva_ingresos: 210, total_gastos: 363, iva_gastos: 63, beneficio_neto: 847 };

    fromMock
      .mockReturnValueOnce(makeChain({ data: ingresos, error: null }))   // getIngresosByMonth
      .mockReturnValueOnce(makeChain({ data: gastos, error: null }))     // getGastosByMonth
      .mockReturnValueOnce(makeChain({ data: savedResumen, error: null })); // upsert resumen

    const result = await brandService.calculateAndSaveResumen(2, 2026);

    // Verificar cálculos de IVA
    expect(result.iva_ingresos).toBeCloseTo(210, 1);     // 1000 * 0.21
    expect(result.total_ingresos).toBeCloseTo(1210, 1);  // 1000 + 500 + 210
    expect(result.iva_gastos).toBeCloseTo(63, 1);        // 300 * 0.21
    expect(result.beneficio_neto).toBeCloseTo(847, 0);   // 1210 - 363
  });

  it('mes sin ingresos ni gastos — beneficio_neto = 0', async () => {
    const savedResumen = { mes: 1, año: 2026, total_ingresos: 0, iva_ingresos: 0, total_gastos: 0, iva_gastos: 0, beneficio_neto: 0 };

    fromMock
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(makeChain({ data: savedResumen, error: null }));

    const result = await brandService.calculateAndSaveResumen(1, 2026);

    expect(result.beneficio_neto).toBe(0);
    expect(result.total_ingresos).toBe(0);
  });
});

// ─── getYearlyStats() ────────────────────────────────────────────────────────

describe('brandService.getYearlyStats()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calcula totales anuales y detecta mejor/peor mes', async () => {
    const mockMonths = [
      { mes: 1, beneficio_neto: 2000, total_ingresos: 5000, total_gastos: 3000 },
      { mes: 2, beneficio_neto: -500, total_ingresos: 2000, total_gastos: 2500 },
      { mes: 3, beneficio_neto: 1500, total_ingresos: 4000, total_gastos: 2500 },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockMonths, error: null }));

    const result = await brandService.getYearlyStats(2026);

    expect(result.totalIngresos).toBe(11000);   // 5000+2000+4000
    expect(result.totalGastos).toBe(8000);      // 3000+2500+2500
    expect(result.beneficioAnual).toBe(3000);   // 11000-8000
    expect(result.mejorMes.mes).toBe(1);        // beneficio_neto más alto
    expect(result.peorMes.mes).toBe(2);         // beneficio_neto más bajo
  });

  it('sin datos — devuelve ceros y mes 1 por defecto', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const result = await brandService.getYearlyStats(2020);

    expect(result.totalIngresos).toBe(0);
    expect(result.beneficioAnual).toBe(0);
    expect(result.mejorMes.mes).toBe(1);
  });

  it('lanza error si Supabase falla', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: { message: 'DB error' } }));

    await expect(brandService.getYearlyStats(2026)).rejects.toBeDefined();
  });
});

// ─── getCategoriasIngresos() ─────────────────────────────────────────────────

describe('brandService.getCategoriasIngresos()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve categorías únicas de la BD', async () => {
    const mockData = [{ tipo: 'Royalties' }, { tipo: 'Cuotas' }, { tipo: 'Royalties' }];
    fromMock.mockReturnValueOnce(makeChain({ data: mockData, error: null }));

    const result = await brandService.getCategoriasIngresos();

    expect(result).toContain('Royalties');
    expect(result).toContain('Cuotas');
    // Sin duplicados
    expect(result.filter(c => c === 'Royalties')).toHaveLength(1);
  });

  it('sin datos en BD — devuelve categorías por defecto', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const result = await brandService.getCategoriasIngresos();

    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Royalties de Centros');
  });
});

// ─── getCategoriasGastos() ───────────────────────────────────────────────────

describe('brandService.getCategoriasGastos()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sin datos — devuelve categorías por defecto de gastos', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const result = await brandService.getCategoriasGastos();

    expect(result).toContain('Marketing y Publicidad');
    expect(result).toContain('Personal Corporativo');
  });
});
