/**
 * maintenanceService.test.ts
 *
 * Tests del módulo de mantenimiento.
 * Foco en la lógica de calendario y reglas de negocio (sin BD real).
 * Las inspecciones tienen consecuencias legales — crítico testear bien.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase ──────────────────────────────────────────────────────────
// vi.mock es hoisted — fromMock debe declararse con vi.hoisted()
const fromMock = vi.hoisted(() => vi.fn());

vi.mock('../../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

// ─── Import funciones puras del módulo de tipos (sin BD) ────────────────────
import {
  MAINTENANCE_CALENDAR,
  getNextInspectionDate,
  getReminderDate,
  shouldSendReminder,
  requiresPhotos,
  canCloseTask,
} from '../../types/maintenance';

// ─── Tests de calendario ─────────────────────────────────────────────────────

describe('MAINTENANCE_CALENDAR — configuración', () => {
  it('el día de inspección es el 15 de cada mes', () => {
    expect(MAINTENANCE_CALENDAR.inspection_day).toBe(15);
  });

  it('el recordatorio se envía 5 días antes', () => {
    expect(MAINTENANCE_CALENDAR.reminder_days_before).toBe(5);
  });

  it('se requieren fotos para estados "mal" y "regular"', () => {
    expect(MAINTENANCE_CALENDAR.photos_required_for_status).toContain('mal');
    expect(MAINTENANCE_CALENDAR.photos_required_for_status).toContain('regular');
  });

  it('NO se requieren fotos para estado "bien"', () => {
    expect(MAINTENANCE_CALENDAR.photos_required_for_status).not.toContain('bien');
  });
});

describe('getNextInspectionDate()', () => {
  it('si hoy es antes del 15, la próxima inspección es el 15 de este mes', () => {
    const hoy = new Date('2026-02-10'); // día 10 → antes del 15
    const next = getNextInspectionDate(hoy);

    expect(next.getDate()).toBe(15);
    expect(next.getMonth()).toBe(1); // Febrero
    expect(next.getFullYear()).toBe(2026);
  });

  it('si hoy es el 15, la próxima inspección es el 15 de este mes (no siguiente)', () => {
    const hoy = new Date('2026-02-15'); // exactamente el día 15
    const next = getNextInspectionDate(hoy);

    expect(next.getDate()).toBe(15);
    expect(next.getMonth()).toBe(1); // Sigue siendo febrero
  });

  it('si hoy es después del 15, la próxima inspección es el 15 del mes siguiente', () => {
    const hoy = new Date('2026-02-20'); // día 20 → ya pasó el 15
    const next = getNextInspectionDate(hoy);

    expect(next.getDate()).toBe(15);
    expect(next.getMonth()).toBe(2); // Marzo
    expect(next.getFullYear()).toBe(2026);
  });

  it('funciona correctamente en diciembre (pasa a enero del año siguiente)', () => {
    const hoy = new Date('2026-12-20'); // después del 15 de diciembre
    const next = getNextInspectionDate(hoy);

    expect(next.getDate()).toBe(15);
    expect(next.getMonth()).toBe(0); // Enero
    expect(next.getFullYear()).toBe(2027);
  });
});

describe('getReminderDate()', () => {
  it('el recordatorio es 5 días antes de la inspección', () => {
    const inspeccion = new Date('2026-03-15');
    const reminder = getReminderDate(inspeccion);

    expect(reminder.getDate()).toBe(10); // 15 - 5 = 10 de marzo
    expect(reminder.getMonth()).toBe(2); // Marzo
  });

  it('el recordatorio en enero no cae en diciembre del año anterior', () => {
    const inspeccion = new Date('2026-01-15');
    const reminder = getReminderDate(inspeccion);

    expect(reminder.getDate()).toBe(10); // 15 - 5 = 10 de enero
    expect(reminder.getMonth()).toBe(0); // Enero
  });
});

describe('shouldSendReminder()', () => {
  it('devuelve true cuando hoy está entre recordatorio e inspección', () => {
    // Hoy = 11 marzo → recordatorio es 10, inspección es 15
    const hoy = new Date('2026-03-11');
    expect(shouldSendReminder(hoy)).toBe(true);
  });

  it('devuelve true el día exacto del recordatorio', () => {
    const hoy = new Date('2026-03-10'); // Día del recordatorio (15-5=10)
    expect(shouldSendReminder(hoy)).toBe(true);
  });

  it('devuelve false cuando todavía queda mucho tiempo', () => {
    // Hoy = 1 de marzo → faltan 14 días para la inspección
    const hoy = new Date('2026-03-01');
    expect(shouldSendReminder(hoy)).toBe(false);
  });

  it('devuelve false el día de la inspección o después', () => {
    const hoy = new Date('2026-03-15'); // Día de inspección
    expect(shouldSendReminder(hoy)).toBe(false);
  });
});

// ─── Tests de reglas de fotos ────────────────────────────────────────────────

describe('requiresPhotos()', () => {
  it('el estado "mal" requiere fotos', () => {
    expect(requiresPhotos('mal')).toBe(true);
  });

  it('el estado "regular" requiere fotos', () => {
    expect(requiresPhotos('regular')).toBe(true);
  });

  it('el estado "bien" NO requiere fotos', () => {
    expect(requiresPhotos('bien')).toBe(false);
  });

  it('estados desconocidos NO requieren fotos por defecto', () => {
    expect(requiresPhotos('pendiente')).toBe(false);
    expect(requiresPhotos('')).toBe(false);
  });
});

describe('canCloseTask()', () => {
  it('se puede cerrar una tarea si se ha aportado foto de reparación', () => {
    expect(canCloseTask(true)).toBe(true);
  });

  it('NO se puede cerrar una tarea sin foto de reparación', () => {
    expect(canCloseTask(false)).toBe(false);
  });
});

// ─── Tests del servicio con mock de Supabase ────────────────────────────────

import maintenanceService from '../../services/maintenanceService';

describe('maintenanceService.getInspectionsByCenter()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta la tabla maintenance_inspections por centerId', async () => {
    const mockInspections = [
      { id: 'ins-001', center_id: 'center-sev', status: 'completada', inspection_date: '2026-02-15' },
    ];

    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockInspections, error: null }),
    });

    const result = await maintenanceService.getInspectionsByCenter('center-sev', 10);

    expect(fromMock).toHaveBeenCalledWith('maintenance_inspections');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('devuelve success=false si Supabase retorna error', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'Permiso denegado' } }),
    });

    const result = await maintenanceService.getInspectionsByCenter('center-err');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
