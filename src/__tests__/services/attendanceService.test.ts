/**
 * attendanceService.test.ts
 *
 * Detección automática de incidencias de asistencia: ausencias, retrasos
 * y salidas anticipadas basándose en turnos asignados y fichajes.
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
  ['select', 'eq', 'neq', 'or', 'in', 'gte', 'lte', 'order', 'limit',
    'update', 'insert', 'delete', 'maybeSingle'].forEach(m => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  chain.single = vi.fn().mockReturnValue(chain);
  (chain as { then: (res: (v: unknown) => unknown) => Promise<unknown> }).then =
    (resolve) => Promise.resolve(resolvedValue).then(resolve);
  return chain;
}

import {
  detectDailyAttendanceIncidents,
  processAttendanceForDateRange,
  getProcessingLog,
  wasProcessedToday,
  autoProcessIfNeeded,
} from '../../services/attendanceService';

const TEST_DATE = '2026-02-27';

// Turno de mañana (9:00 - 17:00)
const mockShift = {
  employee_id: 1,
  shifts: { id: 1, name: 'Turno Mañana', start_time: '09:00', end_time: '17:00' }
};

// ─── detectDailyAttendanceIncidents() ────────────────────────────────────────

describe('detectDailyAttendanceIncidents()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sin turnos asignados — devuelve array vacío', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const incidents = await detectDailyAttendanceIncidents(TEST_DATE);

    expect(incidents).toEqual([]);
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it('turno asignado sin fichaje — detecta AUSENCIA', async () => {
    fromMock
      .mockReturnValueOnce(makeChain({ data: [mockShift], error: null }))    // shifts
      .mockReturnValueOnce(makeChain({ data: [], error: null }))             // timeclock (vacío = no fichaje)
      .mockReturnValueOnce(makeChain({ data: null, error: null }))           // check existing absence (null = no existe)
      .mockReturnValueOnce(makeChain({ error: null }));                       // insert incidents

    const incidents = await detectDailyAttendanceIncidents(TEST_DATE);

    expect(incidents).toHaveLength(1);
    expect(incidents[0].type).toBe('absence');
    expect(incidents[0].employee_id).toBe(1);
    expect(incidents[0].created_by).toBe('Sistema Automático');
  });

  it('ausencia ya registrada — NO crea duplicado', async () => {
    const existingIncident = { id: 99 }; // ya existe en BD

    fromMock
      .mockReturnValueOnce(makeChain({ data: [mockShift], error: null }))    // shifts
      .mockReturnValueOnce(makeChain({ data: [], error: null }))             // timeclock vacío
      .mockReturnValueOnce(makeChain({ data: existingIncident, error: null })); // check existing (ya existe)

    const incidents = await detectDailyAttendanceIncidents(TEST_DATE);

    expect(incidents).toHaveLength(0); // No crea nuevo
  });

  it('fichó 30 minutos tarde — detecta RETRASO (lateMinutes > 5)', async () => {
    const lateClockin = [{ employee_id: 1, clock_in: `${TEST_DATE}T09:30:00Z`, clock_out: null, date: TEST_DATE }];

    fromMock
      .mockReturnValueOnce(makeChain({ data: [mockShift], error: null }))    // shifts
      .mockReturnValueOnce(makeChain({ data: lateClockin, error: null }))    // timeclock (30 min tarde)
      .mockReturnValueOnce(makeChain({ data: null, error: null }))           // check existing late
      .mockReturnValueOnce(makeChain({ error: null }));                       // insert

    const incidents = await detectDailyAttendanceIncidents(TEST_DATE);

    expect(incidents).toHaveLength(1);
    expect(incidents[0].type).toBe('late');
    expect(incidents[0].hours_late).toBeCloseTo(0.5, 1); // 30 min = 0.5h
    expect(incidents[0].reason).toContain('09:30');
  });

  it('fichó 3 minutos tarde — NO detecta retraso (tolerancia 5 min)', async () => {
    const slightlyLateClockin = [{ employee_id: 1, clock_in: `${TEST_DATE}T09:03:00Z`, clock_out: null, date: TEST_DATE }];

    fromMock
      .mockReturnValueOnce(makeChain({ data: [mockShift], error: null }))
      .mockReturnValueOnce(makeChain({ data: slightlyLateClockin, error: null }));
    // No más calls — no hay incidents que insertar

    const incidents = await detectDailyAttendanceIncidents(TEST_DATE);

    expect(incidents).toHaveLength(0);
  });

  it('salió 15 minutos antes — detecta SALIDA TEMPRANA', async () => {
    const earlyExitClock = [{
      employee_id: 1,
      clock_in: `${TEST_DATE}T09:00:00Z`,   // en hora
      clock_out: `${TEST_DATE}T16:45:00Z`,   // 15 min antes
      date: TEST_DATE
    }];

    fromMock
      .mockReturnValueOnce(makeChain({ data: [mockShift], error: null }))    // shifts
      .mockReturnValueOnce(makeChain({ data: earlyExitClock, error: null })) // timeclock
      .mockReturnValueOnce(makeChain({ data: null, error: null }))           // check existing early_departure
      .mockReturnValueOnce(makeChain({ error: null }));                       // insert

    const incidents = await detectDailyAttendanceIncidents(TEST_DATE);

    expect(incidents).toHaveLength(1);
    expect(incidents[0].type).toBe('early_departure');
    expect(incidents[0].reason).toContain('16:45');
  });

  it('salió 3 minutos antes — NO detecta salida temprana (tolerancia)', async () => {
    const slightlyEarlyExit = [{
      employee_id: 1,
      clock_in: `${TEST_DATE}T09:00:00Z`,
      clock_out: `${TEST_DATE}T16:57:00Z`,  // 3 min antes
      date: TEST_DATE
    }];

    fromMock
      .mockReturnValueOnce(makeChain({ data: [mockShift], error: null }))
      .mockReturnValueOnce(makeChain({ data: slightlyEarlyExit, error: null }));

    const incidents = await detectDailyAttendanceIncidents(TEST_DATE);

    expect(incidents).toHaveLength(0);
  });

  it('con centerId — hace query a employees para filtrar por centro', async () => {
    const centerEmployees = [{ id: 1 }, { id: 2 }];

    fromMock
      .mockReturnValueOnce(makeChain({ data: centerEmployees, error: null }))  // employees por centro
      .mockReturnValueOnce(makeChain({ data: [], error: null }))               // shifts (vacío = sin turnos)

    const incidents = await detectDailyAttendanceIncidents(TEST_DATE, 42);

    expect(incidents).toHaveLength(0);
    expect(fromMock).toHaveBeenCalledWith('employees');
  });

  it('error inesperado — devuelve array vacío sin lanzar excepción', async () => {
    fromMock.mockImplementationOnce(() => { throw new Error('DB connection failed'); });

    const incidents = await detectDailyAttendanceIncidents(TEST_DATE);

    expect(incidents).toEqual([]);
  });
});

// ─── processAttendanceForDateRange() ─────────────────────────────────────────

describe('processAttendanceForDateRange()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rango de 1 día — procesa solo esa fecha y devuelve cuenta total', async () => {
    // Sin turnos → 0 incidencias
    fromMock.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const total = await processAttendanceForDateRange('2026-02-27', '2026-02-27');

    expect(total).toBe(0);
    expect(typeof total).toBe('number');
  });

  it('rango de 3 días — llama detectDailyAttendanceIncidents 3 veces', async () => {
    // 3 días, sin turnos en cada uno
    fromMock
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }));

    const total = await processAttendanceForDateRange('2026-02-01', '2026-02-03');

    expect(total).toBe(0);
    expect(fromMock).toHaveBeenCalledTimes(3);
  });
});

// ─── getProcessingLog() ──────────────────────────────────────────────────────

describe('getProcessingLog()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sin filtros — devuelve todos los registros del log', async () => {
    const mockLog = [
      { id: 1, process_date: '2026-02-27', incidents_detected: 3, status: 'completed' },
      { id: 2, process_date: '2026-02-26', incidents_detected: 0, status: 'completed' },
    ];
    fromMock.mockReturnValueOnce(makeChain({ data: mockLog, error: null }));

    const result = await getProcessingLog();

    expect(result).toHaveLength(2);
    expect(fromMock).toHaveBeenCalledWith('attendance_processing_log');
  });

  it('con filtros de fecha y centro — hace la query correcta', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const result = await getProcessingLog('2026-02-01', '2026-02-28', 1);

    expect(result).toEqual([]);
    // Verificar que se llamó con la tabla correcta
    expect(fromMock).toHaveBeenCalledWith('attendance_processing_log');
  });

  it('error inesperado — devuelve array vacío', async () => {
    fromMock.mockImplementationOnce(() => { throw new Error('DB error'); });

    const result = await getProcessingLog();

    expect(result).toEqual([]);
  });
});

// ─── wasProcessedToday() ─────────────────────────────────────────────────────

describe('wasProcessedToday()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve true cuando existe registro completed para hoy', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: { id: 1 }, error: null }));

    const result = await wasProcessedToday();

    expect(result).toBe(true);
  });

  it('devuelve false cuando no existe registro (data=null)', async () => {
    fromMock.mockReturnValueOnce(makeChain({ data: null, error: null }));

    const result = await wasProcessedToday();

    expect(result).toBe(false);
  });

  it('error inesperado — devuelve false', async () => {
    fromMock.mockImplementationOnce(() => { throw new Error('DB error'); });

    const result = await wasProcessedToday();

    expect(result).toBe(false);
  });
});

// ─── autoProcessIfNeeded() ───────────────────────────────────────────────────

describe('autoProcessIfNeeded()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ya procesado hoy — devuelve {processed:false, count:0} sin procesar de nuevo', async () => {
    // wasProcessedToday → true
    fromMock.mockReturnValueOnce(makeChain({ data: { id: 1 }, error: null }));

    const result = await autoProcessIfNeeded();

    expect(result.processed).toBe(false);
    expect(result.count).toBe(0);
  });

  it('no procesado hoy — procesa y devuelve processed:true', async () => {
    // wasProcessedToday → false
    fromMock
      .mockReturnValueOnce(makeChain({ data: null, error: null }))       // wasProcessedToday → false
      .mockReturnValueOnce(makeChain({ data: [], error: null }))         // detectDaily: shifts vacíos
      .mockReturnValueOnce(makeChain({ data: null, error: null }))       // logAttendanceProcessing: check existing
      .mockReturnValueOnce(makeChain({ error: null }));                   // logAttendanceProcessing: insert

    const result = await autoProcessIfNeeded();

    expect(result.processed).toBe(true);
    expect(typeof result.count).toBe('number');
  });
});
