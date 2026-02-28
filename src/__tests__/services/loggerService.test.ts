/**
 * loggerService.test.ts
 *
 * Singleton de logging con buffer. Testea que los métodos de log
 * añaden entradas al buffer y que el flush envía a Supabase.
 */
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';

// ─── Mock Supabase ───────────────────────────────────────────────────────────
const insertMock = vi.fn().mockResolvedValue({ error: null });
const fromMock = vi.hoisted(() => vi.fn());
const getSessionMock = vi.hoisted(() => vi.fn().mockResolvedValue({ data: { session: null } }));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: fromMock,
    auth: { getSession: getSessionMock },
  },
}));

// Usar fake timers para controlar setInterval del flush automático
beforeAll(() => {
  vi.useFakeTimers();
  fromMock.mockReturnValue({ insert: insertMock });
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  vi.clearAllMocks();
  fromMock.mockReturnValue({ insert: insertMock });
});

import { logger } from '../../services/loggerService';

// ─── Logging básico ──────────────────────────────────────────────────────────

describe('logger.info()', () => {
  it('no lanza excepciones al registrar info', () => {
    expect(() => logger.info('TestModule', 'Mensaje informativo')).not.toThrow();
  });

  it('acepta metadatos opcionales', () => {
    expect(() => logger.info('TestModule', 'Con meta', { userId: '123', action: 'login' })).not.toThrow();
  });
});

describe('logger.warn()', () => {
  it('no lanza excepciones al registrar warning', () => {
    expect(() => logger.warn('TestModule', 'Advertencia de prueba')).not.toThrow();
  });
});

describe('logger.error()', () => {
  it('llama a console.error además de añadir al buffer', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('TestModule', 'Error de prueba', { code: 500 });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('TestModule'),
      expect.anything()
    );
    consoleSpy.mockRestore();
  });

  it('no lanza excepciones', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => logger.error('TestModule', 'Error')).not.toThrow();
    consoleSpy.mockRestore();
  });
});

describe('logger.critical()', () => {
  it('dispara flush inmediato (llama a supabase.from)', async () => {
    // Limpiar el buffer primero añadiendo items y flusheando
    // Critical triggers flush immediately
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.critical('Auth', 'Acceso no autorizado', { ip: '1.2.3.4' });

    // El flush es async — avanzar microtasks
    await Promise.resolve();
    await Promise.resolve();

    // Debe haber intentado insertar en system_logs
    expect(fromMock).toHaveBeenCalledWith('system_logs');
    consoleSpy.mockRestore();
  });
});

// ─── Flush por lote (BATCH_SIZE = 10) ────────────────────────────────────────

describe('flush automático por tamaño de lote', () => {
  it('inserta en DB cuando el buffer llega a 10 entradas', async () => {
    vi.clearAllMocks();
    fromMock.mockReturnValue({ insert: insertMock });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Añadir exactamente BATCH_SIZE (10) entradas de tipo info
    for (let i = 0; i < 10; i++) {
      logger.info('BatchTest', `Mensaje ${i}`);
    }

    // Esperar que se resuelvan las promesas del flush
    await Promise.resolve();
    await Promise.resolve();

    expect(fromMock).toHaveBeenCalledWith('system_logs');
    expect(insertMock).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// ─── Singleton ───────────────────────────────────────────────────────────────

describe('LoggerService — singleton', () => {
  it('devuelve la misma instancia siempre', async () => {
    const { logger: logger2 } = await import('../../services/loggerService');
    expect(logger).toBe(logger2);
  });
});
