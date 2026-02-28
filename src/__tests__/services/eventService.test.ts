/**
 * eventService.test.ts
 *
 * Tests del servicio de eventos — creado en Fase 1.
 * Verifica que el servicio llama a Supabase con los parámetros correctos.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseModule } from '../helpers/mockSupabase';

// ─── Mock antes del import ──────────────────────────────────────────────────

const mockEvents = [
  {
    id: 'evt-001',
    title: 'Torneo de Crossfit Sevilla',
    event_date: '2026-03-15',
    location: 'sevilla',
    status: 'activo',
    created_by: 'carlos@jungla.com',
  },
  {
    id: 'evt-002',
    title: 'Carrera popular La Jungla',
    event_date: '2026-04-20',
    location: 'madrid',
    status: 'planificacion',
    created_by: 'carlos@jungla.com',
  },
];

// vi.mock es hoisted — fromMock debe declararse con vi.hoisted()
const fromMock = vi.hoisted(() => vi.fn());

vi.mock('../../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

import { eventosService } from '../../services/eventService';

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('eventosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll()', () => {
    it('consulta la tabla "events" en Supabase', async () => {
      fromMock.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
      });

      const result = await eventosService.getAll();

      expect(fromMock).toHaveBeenCalledWith('eventos');
      expect(result).toHaveLength(2);
    });

    it('devuelve array vacío si no hay datos', async () => {
      fromMock.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await eventosService.getAll();
      expect(result).toEqual([]);
    });

    it('lanza error si Supabase falla', async () => {
      fromMock.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Error de conexión', code: 'PGRST001' },
        }),
      });

      await expect(eventosService.getAll()).rejects.toThrow();
    });
  });

  describe('getById()', () => {
    it('consulta la tabla "events" por id', async () => {
      fromMock.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockEvents[0], error: null }),
      });

      const result = await eventosService.getById('evt-001');

      expect(fromMock).toHaveBeenCalledWith('eventos');
      expect(result?.id).toBe('evt-001');
      expect(result?.title).toBe('Torneo de Crossfit Sevilla');
    });

    it('devuelve null si el evento no existe', async () => {
      fromMock.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await eventosService.getById('evt-999');
      expect(result).toBeNull();
    });
  });
});

// ─── checklistService ───────────────────────────────────────────────────────

import { checklistService } from '../../services/eventService';

describe('checklistService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta la tabla "evento_checklist" al buscar vencidos', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockResolvedValue({
        data: [{ id: 'chk-1', evento_id: 'evt-001', tarea: 'Megáfono', completado: false }],
        error: null,
      }),
    });

    const items = await checklistService.getOverdue('2026-03-01');

    expect(fromMock).toHaveBeenCalledWith('evento_checklist');
    expect(items).toHaveLength(1);
    expect(items[0].tarea).toBe('Megáfono');
  });
});
