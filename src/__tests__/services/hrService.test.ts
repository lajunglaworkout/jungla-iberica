/**
 * hrService.test.ts
 *
 * Tests del sistema de fichaje con QR — lógica crítica de RRHH.
 * Cubre las funciones añadidas en Fase 1 para MobileTimeClock.tsx.
 *
 * Casos críticos:
 *  - Buscar empleado por email (login de fichaje)
 *  - Validar token QR (seguridad del fichaje)
 *  - Crear/actualizar registro de timeclock
 *  - Comportamiento ante errores: devuelve null/vacío, no lanza
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase (hoisted para que esté disponible antes del import) ────────
const fromMock = vi.hoisted(() => vi.fn());

vi.mock('../../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

import {
  getEmployeeByEmail,
  getEmployeeIdOnly,
  getTimeclockRecordToday,
  getValidQRToken,
  getExistingTimeclockEntry,
  createTimeclockRecord,
  updateTimeclockRecord,
  markQRTokenUsed,
} from '../../services/hrService';

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const mockEmployee = {
  id: 42,
  name: 'Fran Giráldez',
  email: 'franciscogiraldezmorales@gmail.com',
  center_id: 9,
  is_active: true,
};

const mockTimeclockRecord = {
  id: 101,
  employee_id: 42,
  date: '2026-02-28',
  clock_in: '09:05',
  clock_out: null,
};

const mockQRToken = {
  id: 7,
  token: 'abc123xyz',
  center_id: 9,
  is_used: false,
  expires_at: '2026-02-28T23:59:59Z',
};

// ─── Helper: construye el chain de supabase para .single() ───────────────────
function buildChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolvedValue),
    maybeSingle: vi.fn().mockResolvedValue(resolvedValue),
  };
  return chain;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('hrService — getEmployeeByEmail()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve el empleado cuando existe', async () => {
    fromMock.mockReturnValue(buildChain({ data: mockEmployee, error: null }));
    const result = await getEmployeeByEmail('franciscogiraldezmorales@gmail.com');
    expect(result).not.toBeNull();
    expect(result?.email).toBe('franciscogiraldezmorales@gmail.com');
  });

  it('consulta la tabla employees con filtro por email', async () => {
    fromMock.mockReturnValue(buildChain({ data: mockEmployee, error: null }));
    await getEmployeeByEmail('test@test.com');
    expect(fromMock).toHaveBeenCalledWith('employees');
  });

  it('devuelve null si el empleado no existe', async () => {
    fromMock.mockReturnValue(buildChain({ data: null, error: { message: 'Row not found' } }));
    const result = await getEmployeeByEmail('noexiste@test.com');
    expect(result).toBeNull();
  });

  it('devuelve null en caso de error de BD (no lanza)', async () => {
    fromMock.mockReturnValue(buildChain({ data: null, error: { message: 'connection error' } }));
    await expect(getEmployeeByEmail('fallo@test.com')).resolves.toBeNull();
  });
});

describe('hrService — getEmployeeIdOnly()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve solo el id del empleado', async () => {
    fromMock.mockReturnValue(buildChain({ data: { id: 42 }, error: null }));
    const result = await getEmployeeIdOnly('fran@jungla.com');
    expect(result).toEqual({ id: 42 });
  });

  it('devuelve null si no encuentra el empleado', async () => {
    fromMock.mockReturnValue(buildChain({ data: null, error: { message: 'not found' } }));
    const result = await getEmployeeIdOnly('fantasma@jungla.com');
    expect(result).toBeNull();
  });
});

describe('hrService — getValidQRToken()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve el token cuando es válido (no usado, no expirado)', async () => {
    fromMock.mockReturnValue(buildChain({ data: mockQRToken, error: null }));
    const result = await getValidQRToken('abc123xyz', '2026-02-28T10:00:00Z');
    expect(result.data).not.toBeNull();
    expect(result.data?.token).toBe('abc123xyz');
    expect(result.error).toBeUndefined();
  });

  it('devuelve { data: null, error } cuando el token no existe o está expirado', async () => {
    fromMock.mockReturnValue(buildChain({ data: null, error: { message: 'No rows returned' } }));
    const result = await getValidQRToken('tokenInvalido', '2026-02-28T10:00:00Z');
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('consulta qr_tokens filtrando is_used=false y expires_at', async () => {
    fromMock.mockReturnValue(buildChain({ data: mockQRToken, error: null }));
    await getValidQRToken('token-test', '2026-02-28T10:00:00Z');
    expect(fromMock).toHaveBeenCalledWith('qr_tokens');
  });
});

describe('hrService — getExistingTimeclockEntry()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve el registro existente de hoy', async () => {
    fromMock.mockReturnValue(buildChain({ data: mockTimeclockRecord, error: null }));
    const result = await getExistingTimeclockEntry(42, '2026-02-28');
    expect(result.data).toEqual(mockTimeclockRecord);
    expect(result.error).toBeUndefined();
  });

  it('devuelve { data: null } cuando no hay fichaje previo (maybeSingle)', async () => {
    fromMock.mockReturnValue(buildChain({ data: null, error: null }));
    const result = await getExistingTimeclockEntry(42, '2026-02-28');
    expect(result.data).toBeNull();
    expect(result.error).toBeUndefined();
  });

  it('devuelve { data: null, error } en caso de error de BD', async () => {
    fromMock.mockReturnValue(buildChain({ data: null, error: { message: 'DB error' } }));
    const result = await getExistingTimeclockEntry(42, '2026-02-28');
    expect(result.data).toBeNull();
    expect(result.error).toBe('DB error');
  });
});

describe('hrService — createTimeclockRecord()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('crea el registro y devuelve los datos insertados', async () => {
    const payload = { employee_id: 42, date: '2026-02-28', clock_in: '09:05', type: 'entrada' };
    const inserted = { id: 101, ...payload };
    fromMock.mockReturnValue(buildChain({ data: inserted, error: null }));

    const result = await createTimeclockRecord(payload);
    expect(result.data).toEqual(inserted);
    expect(result.error).toBeUndefined();
  });

  it('consulta la tabla timeclock_records', async () => {
    fromMock.mockReturnValue(buildChain({ data: { id: 1 }, error: null }));
    await createTimeclockRecord({ employee_id: 1, date: '2026-02-28' });
    expect(fromMock).toHaveBeenCalledWith('timeclock_records');
  });

  it('devuelve { data: null, error } si falla el insert', async () => {
    fromMock.mockReturnValue(buildChain({ data: null, error: { message: 'unique constraint' } }));
    const result = await createTimeclockRecord({ employee_id: 42, date: '2026-02-28' });
    expect(result.data).toBeNull();
    expect(result.error).toBe('unique constraint');
  });
});

describe('hrService — updateTimeclockRecord()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('actualiza el registro y devuelve los datos actualizados', async () => {
    const updated = { ...mockTimeclockRecord, clock_out: '17:30' };
    fromMock.mockReturnValue(buildChain({ data: updated, error: null }));

    const result = await updateTimeclockRecord(101, { clock_out: '17:30' });
    expect(result.data?.clock_out).toBe('17:30');
    expect(result.error).toBeUndefined();
  });

  it('devuelve { data: null, error } si falla el update', async () => {
    fromMock.mockReturnValue(buildChain({ data: null, error: { message: 'row not found' } }));
    const result = await updateTimeclockRecord(999, { clock_out: '17:30' });
    expect(result.data).toBeNull();
    expect(result.error).toBe('row not found');
  });
});

describe('hrService — markQRTokenUsed()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('no lanza aunque falle la BD (silent catch)', async () => {
    fromMock.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockRejectedValue(new Error('network error')),
    });
    await expect(markQRTokenUsed(7)).resolves.toBeUndefined();
  });

  it('llama a qr_tokens con is_used: true', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValue({ update: updateMock });

    await markQRTokenUsed(7);
    expect(fromMock).toHaveBeenCalledWith('qr_tokens');
    expect(updateMock).toHaveBeenCalledWith({ is_used: true });
  });
});

describe('hrService — getTimeclockRecordToday()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve el registro de hoy para un empleado', async () => {
    fromMock.mockReturnValue(buildChain({ data: mockTimeclockRecord, error: null }));
    const result = await getTimeclockRecordToday(42, '2026-02-28');
    expect(result).toEqual(mockTimeclockRecord);
  });

  it('devuelve null si no hay registro hoy', async () => {
    fromMock.mockReturnValue(buildChain({ data: null, error: { message: 'no rows' } }));
    const result = await getTimeclockRecordToday(42, '2026-02-28');
    expect(result).toBeNull();
  });
});
