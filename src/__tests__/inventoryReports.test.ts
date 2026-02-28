/**
 * Tests para src/services/inventoryReportsService.ts
 * Cobertura de la lógica de cálculo de KPIs — métodos privados testeados
 * via getInventoryKPIs() con Supabase mockeado
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryReportsService } from '../services/inventoryReportsService';
import type { CenterStats, ProblematicItem } from '../services/inventoryReportsService';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../lib/supabase';

function mockSupabaseFrom(data: unknown[] | null, error: unknown = null) {
  const chain = {
    select: vi.fn(),
    in: vi.fn().mockResolvedValue({ data, error }),
  };
  chain.select.mockReturnValue(chain);
  vi.mocked(supabase.from).mockReturnValue(chain as ReturnType<typeof supabase.from>);
}

const sampleData = [
  // Centro Sevilla (9): 2 items
  { center_id: 9, nombre_item: 'Goma 3CM', categoria: 'Gomas', roturas: 5, cantidad_inicial: 20, quantity: 10, precio_compra: 2 },
  { center_id: 9, nombre_item: 'Barra', categoria: 'Accesorios', roturas: 2, cantidad_inicial: 10, quantity: 3, precio_compra: 15 },
  // Centro Jerez (10): 1 item
  { center_id: 10, nombre_item: 'Goma 3CM', categoria: 'Gomas', roturas: 8, cantidad_inicial: 15, quantity: 2, precio_compra: 2 },
  // Centro Puerto (11): 1 item
  { center_id: 11, nombre_item: 'Step', categoria: 'Cardio', roturas: 0, cantidad_inicial: 5, quantity: 6, precio_compra: 30 },
];

describe('getInventoryKPIs()', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockClear();
  });

  it('devuelve KPIs vacíos cuando Supabase devuelve error', async () => {
    mockSupabaseFrom(null, { message: 'error de conexión' });

    const result = await inventoryReportsService.getInventoryKPIs();

    expect(result.totalItems).toBe(0);
    expect(result.totalValue).toBe(0);
    expect(result.criticalItems).toBe(0);
    expect(result.roturaRate).toBe(0);
    expect(result.centerComparison).toEqual([]);
    expect(result.topProblematicItems).toEqual([]);
  });

  it('devuelve KPIs vacíos cuando no hay datos', async () => {
    mockSupabaseFrom([]);

    const result = await inventoryReportsService.getInventoryKPIs();

    expect(result.totalItems).toBe(0);
    expect(result.centerComparison).toEqual([]);
  });

  it('calcula totalItems correctamente', async () => {
    mockSupabaseFrom(sampleData);

    const result = await inventoryReportsService.getInventoryKPIs();

    expect(result.totalItems).toBe(4);
  });

  it('calcula totalValue correctamente (precio_compra × quantity)', async () => {
    mockSupabaseFrom(sampleData);

    const result = await inventoryReportsService.getInventoryKPIs();
    // (2×10) + (15×3) + (2×2) + (30×6) = 20 + 45 + 4 + 180 = 249
    expect(result.totalValue).toBe(249);
  });

  it('calcula criticalItems (quantity <= 5) correctamente', async () => {
    mockSupabaseFrom(sampleData);

    const result = await inventoryReportsService.getInventoryKPIs();
    // quantity <= 5: Barra(3), Goma Jerez(2) → 2 items
    expect(result.criticalItems).toBe(2);
  });

  it('calcula roturaRate como porcentaje sobre cantidad_inicial', async () => {
    mockSupabaseFrom(sampleData);

    const result = await inventoryReportsService.getInventoryKPIs();
    // totalRoturas = 5+2+8+0 = 15, totalInicial = 20+10+15+5 = 50
    // roturaRate = (15/50)*100 = 30
    expect(result.roturaRate).toBeCloseTo(30, 1);
  });

  it('devuelve centerComparison con 3 centros', async () => {
    mockSupabaseFrom(sampleData);

    const result = await inventoryReportsService.getInventoryKPIs();

    expect(result.centerComparison).toHaveLength(3);
    const names = result.centerComparison.map((c: CenterStats) => c.centerName);
    expect(names).toContain('Sevilla');
    expect(names).toContain('Jerez');
    expect(names).toContain('Puerto');
  });

  it('healthScore de Sevilla es menor que el de Puerto (más roturas)', async () => {
    mockSupabaseFrom(sampleData);

    const result = await inventoryReportsService.getInventoryKPIs();
    const sevilla = result.centerComparison.find((c: CenterStats) => c.centerName === 'Sevilla')!;
    const puerto = result.centerComparison.find((c: CenterStats) => c.centerName === 'Puerto')!;

    expect(sevilla.healthScore).toBeLessThan(puerto.healthScore);
  });

  it('topProblematicItems solo incluye items con roturas > 0', async () => {
    mockSupabaseFrom(sampleData);

    const result = await inventoryReportsService.getInventoryKPIs();

    // Step tiene 0 roturas — no debe aparecer
    const names = result.topProblematicItems.map((i: ProblematicItem) => i.nombre_item);
    expect(names).not.toContain('Step');
  });

  it('topProblematicItems está ordenado por totalRoturas descendente', async () => {
    mockSupabaseFrom(sampleData);

    const result = await inventoryReportsService.getInventoryKPIs();
    const items = result.topProblematicItems;

    for (let i = 0; i < items.length - 1; i++) {
      expect(items[i].totalRoturas).toBeGreaterThanOrEqual(items[i + 1].totalRoturas);
    }
  });

  it('agrupa roturas del mismo item de distintos centros', async () => {
    mockSupabaseFrom(sampleData);

    const result = await inventoryReportsService.getInventoryKPIs();
    // Goma 3CM: Sevilla(5) + Jerez(8) = 13 roturas, 2 centros afectados
    const goma = result.topProblematicItems.find((i: ProblematicItem) => i.nombre_item === 'Goma 3CM')!;

    expect(goma.totalRoturas).toBe(13);
    expect(goma.centrosAfectados).toBe(2);
  });

  it('devuelve KPIs vacíos cuando Supabase lanza excepción', async () => {
    vi.mocked(supabase.from).mockImplementation(() => {
      throw new Error('Error de red');
    });

    const result = await inventoryReportsService.getInventoryKPIs();

    expect(result.totalItems).toBe(0);
    expect(result.roturaRate).toBe(0);
  });
});
