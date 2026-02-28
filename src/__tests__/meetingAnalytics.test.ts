/**
 * Tests para src/services/meetingAnalyticsService.ts
 * Cobertura de funciones de guardado de métricas de reuniones
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveMeetingMetrics,
  saveMeetingObjectives,
  saveMeetingBottlenecks,
} from '../services/meetingAnalyticsService';

// Mock completo del cliente Supabase — evita llamadas reales a BD
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

import { supabase } from '../lib/supabase';

/** Devuelve un mock de la cadena from().insert() / from().select()... */
function buildChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain = {
    insert: vi.fn().mockResolvedValue(resolvedValue),
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn().mockResolvedValue(resolvedValue),
    in: vi.fn().mockResolvedValue(resolvedValue),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  vi.mocked(supabase.from).mockReturnValue(chain as ReturnType<typeof supabase.from>);
  return chain;
}

const validMetrics = {
  meeting_id: 'meeting-123',
  departamento: 'marketing',
  tipo_reunion: 'FISICA' as const,
  tareas_recurrentes_total: 5,
  tareas_recurrentes_completadas: 3,
  porcentaje_cumplimiento: 60,
  tareas_anteriores_total: 4,
  tareas_anteriores_completadas: 2,
  tareas_anteriores_pendientes: 2,
};

// ===== saveMeetingObjectives =====
describe('saveMeetingObjectives()', () => {
  it('devuelve { success: true } inmediatamente con array vacío — sin llamar Supabase', async () => {
    const result = await saveMeetingObjectives([]);
    expect(result).toEqual({ success: true });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('devuelve { success: true } cuando Supabase no devuelve error', async () => {
    buildChain({ data: null, error: null });

    const result = await saveMeetingObjectives([{
      meeting_id: 'mtg-1',
      departamento: 'ventas',
      nombre: 'Objetivo test',
      valor_objetivo: 100,
      tipo_objetivo: 'numero',
    }]);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('devuelve { success: false, error } cuando Supabase devuelve error', async () => {
    buildChain({ data: null, error: { message: 'connection refused' } });

    const result = await saveMeetingObjectives([{
      meeting_id: 'mtg-1',
      departamento: 'ventas',
      nombre: 'Objetivo test',
      valor_objetivo: 100,
      tipo_objetivo: 'numero',
    }]);

    expect(result.success).toBe(false);
    expect(result.error).toBe('connection refused');
  });
});

// ===== saveMeetingBottlenecks =====
describe('saveMeetingBottlenecks()', () => {
  it('devuelve { success: true } inmediatamente con array vacío — sin llamar Supabase', async () => {
    vi.mocked(supabase.from).mockClear();
    const result = await saveMeetingBottlenecks([]);
    expect(result).toEqual({ success: true });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('devuelve { success: true } cuando Supabase no devuelve error', async () => {
    buildChain({ data: null, error: null });
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as never);

    const result = await saveMeetingBottlenecks([{
      meeting_id: 'mtg-1',
      departamento: 'logistica',
      tarea_titulo: 'Tarea pendiente',
      motivo: 'Sin tiempo',
    }]);

    expect(result.success).toBe(true);
  });

  it('devuelve { success: false, error } cuando Supabase devuelve error', async () => {
    buildChain({ data: null, error: { message: 'tabla no existe' } });

    const result = await saveMeetingBottlenecks([{
      meeting_id: 'mtg-1',
      departamento: 'logistica',
      tarea_titulo: 'Tarea',
      motivo: 'Sin recursos',
    }]);

    expect(result.success).toBe(false);
    expect(result.error).toBe('tabla no existe');
  });
});

// ===== saveMeetingMetrics =====
describe('saveMeetingMetrics()', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockClear();
  });

  it('devuelve { success: true } cuando Supabase no devuelve error', async () => {
    buildChain({ data: null, error: null });

    const result = await saveMeetingMetrics(validMetrics);
    expect(result.success).toBe(true);
  });

  it('devuelve { success: false, error } cuando Supabase devuelve error', async () => {
    buildChain({ data: null, error: { message: 'permiso denegado' } });

    const result = await saveMeetingMetrics(validMetrics);
    expect(result.success).toBe(false);
    expect(result.error).toBe('permiso denegado');
  });

  it('llama a supabase.from("meeting_metrics")', async () => {
    buildChain({ data: null, error: null });

    await saveMeetingMetrics(validMetrics);
    expect(supabase.from).toHaveBeenCalledWith('meeting_metrics');
  });

  it('devuelve { success: false, error } cuando lanza excepción inesperada', async () => {
    vi.mocked(supabase.from).mockImplementation(() => {
      throw new Error('Error de red');
    });

    const result = await saveMeetingMetrics(validMetrics);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al guardar métricas');
  });
});
