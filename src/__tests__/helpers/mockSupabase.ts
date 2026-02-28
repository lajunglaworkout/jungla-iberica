/**
 * mockSupabase.ts — Utilidad central de mocking para tests de servicios
 *
 * Simula el cliente Supabase sin necesitar una BD real.
 * El patrón encadenado replica: .from().select().eq().order().single() etc.
 *
 * Uso:
 *   import { createChainMock, mockSupabaseModule } from '../helpers/mockSupabase';
 *   vi.mock('../../lib/supabase', () => mockSupabaseModule({ data: [...], error: null }));
 */
import { vi } from 'vitest';

/** Resultado estándar de Supabase: { data, error } */
export interface MockResult<T = unknown> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

/**
 * Crea un mock encadenado que devuelve `result` al final de cualquier cadena.
 * Soporta: .from().select().eq().neq().order().limit().single().maybeSingle()
 *          .insert().update().delete().upsert()
 */
export function createChainMock<T = unknown>(result: MockResult<T>) {
  const resolved = Promise.resolve(result);

  // El proxy intercepta cualquier método y devuelve el mismo objeto
  // excepto los métodos terminales que devuelven la Promise
  const terminalMethods = new Set([
    'single', 'maybeSingle',
    // insert/update/upsert/delete sin .select() también terminan
  ]);

  const chain: Record<string, unknown> = {};

  const handler: ProxyHandler<typeof chain> = {
    get(_target, prop: string) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        // Es una promesa — devolver directamente el resultado
        return (resolved as unknown as Record<string, unknown>)[prop]?.bind(resolved);
      }
      if (terminalMethods.has(prop)) {
        return () => resolved;
      }
      // Método encadenado — devolver proxy de nuevo
      return (..._args: unknown[]) => new Proxy(chain, handler);
    },
  };

  return new Proxy(chain, handler);
}

/**
 * Versión simplificada que siempre resuelve con data y sin error.
 */
export function mockOk<T>(data: T) {
  return createChainMock<T>({ data, error: null });
}

/**
 * Versión que simula un error de Supabase.
 */
export function mockError(message: string, code = 'MOCK_ERROR') {
  return createChainMock({ data: null, error: { message, code } });
}

/**
 * Crea el módulo completo para vi.mock('../../lib/supabase', ...).
 * Acepta un map de tabla→resultado para simular respuestas diferentes por tabla.
 *
 * Ejemplo:
 *   vi.mock('../../lib/supabase', () => mockSupabaseModule({
 *     meetings: { data: [{ id: 1, title: 'Test' }], error: null },
 *     financial_data: { data: { id: 'fd-1', mes: 1 }, error: null },
 *   }));
 */
export function mockSupabaseModule(
  tableResults: Record<string, MockResult> = {},
  defaultResult: MockResult = { data: [], error: null }
) {
  return {
    supabase: {
      from: vi.fn((table: string) => {
        const result = tableResults[table] ?? defaultResult;
        return createChainMock(result);
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
        signIn: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/file' } }),
          remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
        })),
      },
    },
  };
}

/**
 * Mock de supabase para tests donde solo necesitas el from() básico.
 * Devuelve siempre un array vacío sin error.
 */
export const supabaseEmptyMock = mockSupabaseModule({}, { data: [], error: null });
