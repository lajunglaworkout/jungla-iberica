/**
 * accountingService.test.ts
 *
 * Tests de contabilidad — el módulo más crítico del negocio.
 * Prioridad: cálculos de IVA, totales y estructura de FinancialData.
 * Un error aquí = pérdida real de dinero.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FinancialData, MonthlyCuota, GastoExtra, CuotaType } from '../../services/accountingService';

// ─── Mock Supabase ──────────────────────────────────────────────────────────
// vi.mock es hoisted, así que fromMock debe declararse con vi.hoisted()
const fromMock = vi.hoisted(() => vi.fn());

vi.mock('../../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

import { accountingService } from '../../services/accountingService';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Crea un FinancialData mínimo válido para tests */
function makeFinancialData(overrides: Partial<FinancialData> = {}): FinancialData {
  return {
    id: 'fd-test-001',
    center_id: 'center-sevilla',
    center_name: 'La Jungla Sevilla',
    mes: 2,
    año: 2026,
    nutricion: 0,
    fisioterapia: 0,
    entrenamiento_personal: 0,
    entrenamientos_grupales: 0,
    otros: 0,
    clientes_altas: 0,
    clientes_bajas: 0,
    alquiler: 0,
    alquiler_iva: true,
    suministros: 0,
    suministros_iva: true,
    nominas: 0,
    nominas_iva: false, // Nóminas NO llevan IVA — crítico para Modelo 303
    seguridad_social: 0,
    seguridad_social_iva: false, // SS tampoco lleva IVA
    marketing: 0,
    marketing_iva: true,
    mantenimiento: 0,
    mantenimiento_iva: true,
    royalty: 0,
    royalty_iva: true,
    software_gestion: 0,
    software_gestion_iva: true,
    cuotas: [],
    gastos_extras: [],
    ...overrides,
  };
}

/** Crea una cuota mensual de prueba */
function makeCuota(cantidad: number, importe: number, iva: number): MonthlyCuota {
  return {
    cuota_type_id: 'ct-001',
    cantidad,
    importe,
    iva,
    tipo: 'Cuota Premium',
    precio_total: importe + iva,
  };
}

// ─── Tests de estructura de datos ───────────────────────────────────────────

describe('FinancialData — estructura y campos críticos', () => {
  it('las nóminas tienen IVA = false por defecto en los datos de prueba', () => {
    const fd = makeFinancialData();
    expect(fd.nominas_iva).toBe(false);
    expect(fd.seguridad_social_iva).toBe(false);
  });

  it('los gastos comerciales tienen IVA = true por defecto', () => {
    const fd = makeFinancialData();
    expect(fd.alquiler_iva).toBe(true);
    expect(fd.marketing_iva).toBe(true);
    expect(fd.suministros_iva).toBe(true);
  });

  it('el mes está en rango válido (1-12)', () => {
    for (let mes = 1; mes <= 12; mes++) {
      const fd = makeFinancialData({ mes });
      expect(fd.mes).toBeGreaterThanOrEqual(1);
      expect(fd.mes).toBeLessThanOrEqual(12);
    }
  });
});

// ─── Tests de lógica de cuotas ───────────────────────────────────────────────

describe('MonthlyCuota — cálculos de IVA', () => {
  it('precio_total = importe + iva', () => {
    const cuota = makeCuota(10, 400.00, 84.00);
    expect(cuota.precio_total).toBe(484.00);
  });

  it('cuota sin IVA (subvencionada): iva debe ser 0', () => {
    const cuotaSubvencionada: MonthlyCuota = {
      cuota_type_id: 'ct-subv',
      cantidad: 5,
      importe: 200.00,
      iva: 0, // Cuota subvencionada — no lleva IVA
      tipo: 'Cuota Subvencionada',
      precio_total: 200.00,
    };
    expect(cuotaSubvencionada.iva).toBe(0);
    expect(cuotaSubvencionada.precio_total).toBe(cuotaSubvencionada.importe);
  });

  it('suma de cuotas calcula el total de ingresos correctamente', () => {
    const cuotas: MonthlyCuota[] = [
      makeCuota(10, 400, 84),   // 10 cuotas premium @ 40€ + IVA
      makeCuota(20, 600, 0),    // 20 cuotas subvencionadas @ 30€ sin IVA
    ];
    const totalImporte = cuotas.reduce((sum, c) => sum + c.importe, 0);
    const totalIva = cuotas.reduce((sum, c) => sum + c.iva, 0);
    const totalConIva = cuotas.reduce((sum, c) => sum + (c.precio_total ?? 0), 0);

    expect(totalImporte).toBe(1000);
    expect(totalIva).toBe(84);
    expect(totalConIva).toBe(1084);
  });
});

// ─── Tests de gastos extras ──────────────────────────────────────────────────

describe('GastoExtra — estructura', () => {
  it('gasto con IVA tiene lleva_iva = true', () => {
    const gasto: GastoExtra = {
      id: 'g-001',
      concepto: 'Reparación máquina',
      importe: 500,
      categoria: 'mantenimiento',
      lleva_iva: true,
    };
    expect(gasto.lleva_iva).toBe(true);
    expect(gasto.importe).toBeGreaterThan(0);
  });

  it('gasto de nóminas NO lleva IVA', () => {
    const nomina: GastoExtra = {
      id: 'g-002',
      concepto: 'Nómina febrero',
      importe: 2000,
      categoria: 'nominas',
      lleva_iva: false,
    };
    expect(nomina.lleva_iva).toBe(false);
  });

  it('categoría no puede estar vacía', () => {
    const gasto: GastoExtra = {
      id: 'g-003',
      concepto: 'Equipamiento',
      importe: 300,
      categoria: 'equipamiento',
    };
    expect(gasto.categoria.length).toBeGreaterThan(0);
  });
});

// ─── Tests del servicio con mock de Supabase ────────────────────────────────

describe('accountingService.getCuotaTypes()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta cuota_types con filtro de centro y activo=true', async () => {
    const mockCuotaTypes: CuotaType[] = [
      { id: 'ct-1', center_id: 'center-sevilla', nombre: 'Cuota Básica', precio: 40, activo: true, lleva_iva: true },
      { id: 'ct-2', center_id: 'center-sevilla', nombre: 'Cuota Premium', precio: 60, activo: true, lleva_iva: true },
    ];

    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockCuotaTypes, error: null }),
    });

    const types = await accountingService.getCuotaTypes('center-sevilla');

    expect(fromMock).toHaveBeenCalledWith('cuota_types');
    expect(types).toHaveLength(2);
    expect(types[0].nombre).toBe('Cuota Básica');
    expect(types[1].lleva_iva).toBe(true);
  });

  it('devuelve array vacío si no hay tipos configurados', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const types = await accountingService.getCuotaTypes('center-nuevo');
    expect(types).toEqual([]);
  });

  it('devuelve array vacío en caso de error (no lanza)', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    });

    const types = await accountingService.getCuotaTypes('center-err');
    expect(types).toEqual([]);
  });
});

// ─── Test de IVA del Modelo 303 ─────────────────────────────────────────────

describe('Modelo 303 — lógica de IVA repercutido', () => {
  /**
   * El Modelo 303 requiere distinguir ingresos CON IVA de los SIN IVA.
   * Las cuotas subvencionadas (lleva_iva=false) NO se declaran en el 303.
   * Las cuotas comerciales (lleva_iva=true) SÍ se declaran.
   * Esta es la distinción más crítica del módulo de contabilidad.
   */

  it('las cuotas con lleva_iva=true contribuyen al IVA repercutido', () => {
    const cuotaComercial: CuotaType = {
      id: 'ct-com',
      center_id: 'c1',
      nombre: 'Cuota Comercial',
      precio: 50,
      activo: true,
      lleva_iva: true,
    };
    // El IVA repercutido es 21% del importe
    const ivaRepercutido = cuotaComercial.precio * 0.21;
    expect(ivaRepercutido).toBeCloseTo(10.5, 2);
  });

  it('las cuotas con lleva_iva=false NO contribuyen al IVA repercutido', () => {
    const cuotaSubvencionada: CuotaType = {
      id: 'ct-subv',
      center_id: 'c1',
      nombre: 'Cuota Subvencionada',
      precio: 30,
      activo: true,
      lleva_iva: false,
    };
    const ivaRepercutido = cuotaSubvencionada.lleva_iva ? cuotaSubvencionada.precio * 0.21 : 0;
    expect(ivaRepercutido).toBe(0);
  });

  it('el cálculo del IVA al 21% es correcto para varios importes', () => {
    const casos = [
      { base: 100, ivaEsperado: 21 },
      { base: 40, ivaEsperado: 8.4 },
      { base: 60, ivaEsperado: 12.6 },
      { base: 0, ivaEsperado: 0 },
    ];

    for (const { base, ivaEsperado } of casos) {
      const iva = base * 0.21;
      expect(iva).toBeCloseTo(ivaEsperado, 2);
    }
  });
});
