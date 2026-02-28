/**
 * Tests para src/services/userService.ts
 * CRUD de empleados/usuarios y verificación de permisos
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  checkUserPermissions,
  createUserWithAuth,
} from '../services/userService';
import type { UserProfile, CreateUserData } from '../services/userService';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn(),
        updateUserById: vi.fn(),
      },
    },
  },
}));

import { supabase } from '../lib/supabase';

function buildChain(resolved: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'or', 'ilike', 'gte', 'lte', 'in']) {
    (chain as Record<string, unknown>)[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockResolvedValue(resolved);
  (chain as Record<string, unknown>).then = (
    onFulfilled: (v: unknown) => unknown,
    onRejected?: (e: unknown) => unknown
  ) => Promise.resolve(resolved).then(onFulfilled, onRejected);
  vi.mocked(supabase.from).mockReturnValue(chain as ReturnType<typeof supabase.from>);
  return chain;
}

const sampleUser: UserProfile = {
  id: '1',
  user_id: 'uuid-abc-123',
  name: 'Carlos Suárez',
  email: 'carlos@lajungla.com',
  role: 'Director',
  is_active: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── loadUsers ───────────────────────────────────────────────────────────────

describe('loadUsers()', () => {
  it('devuelve lista de usuarios activos', async () => {
    buildChain({ data: [sampleUser], error: null });
    const result = await loadUsers();
    expect(result.success).toBe(true);
    expect(result.users).toHaveLength(1);
    expect(result.users[0].name).toBe('Carlos Suárez');
  });

  it('devuelve array vacío cuando data es null', async () => {
    buildChain({ data: null, error: null });
    const result = await loadUsers();
    expect(result.success).toBe(true);
    expect(result.users).toEqual([]);
  });

  it('devuelve success:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'Connection refused' } });
    const result = await loadUsers();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection refused');
  });

  it('filtra solo empleados activos (eq is_active:true)', async () => {
    const chain = buildChain({ data: [sampleUser], error: null });
    await loadUsers();
    expect(chain.eq).toHaveBeenCalledWith('is_active', true);
  });
});

// ─── createUser ──────────────────────────────────────────────────────────────

describe('createUser()', () => {
  const newUser: CreateUserData = {
    name: 'Ana García',
    email: 'ana@lajungla.com',
    base_role: 'center_manager',
  };

  it('crea usuario y devuelve el nuevo registro', async () => {
    buildChain({ data: { ...sampleUser, name: 'Ana García' }, error: null });
    const result = await createUser(newUser);
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  it('asigna base_role employee por defecto cuando no se especifica', async () => {
    const chain = buildChain({ data: sampleUser, error: null });
    await createUser({ name: 'Test', email: 'test@test.com' });
    expect(chain.insert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ base_role: 'employee' })])
    );
  });

  it('devuelve success:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'Unique constraint' } });
    const result = await createUser(newUser);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unique constraint');
    expect(result.user).toBeNull();
  });

  it('is_active se establece en true por defecto', async () => {
    const chain = buildChain({ data: sampleUser, error: null });
    await createUser({ name: 'Test2', email: 'test2@test.com' });
    expect(chain.insert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ is_active: true })])
    );
  });
});

// ─── updateUser ──────────────────────────────────────────────────────────────

describe('updateUser()', () => {
  it('devuelve usuario actualizado en éxito', async () => {
    const updatedUser = { ...sampleUser, phone: '+34 600 000 000' };
    buildChain({ data: updatedUser, error: null });

    const result = await updateUser('1', { phone: '+34 600 000 000' });
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  it('devuelve success:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'Not found' } });
    const result = await updateUser('999', { name: 'Nuevo nombre' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Not found');
  });
});

// ─── deleteUser (soft delete) ─────────────────────────────────────────────────

describe('deleteUser()', () => {
  it('desactiva el usuario (is_active: false)', async () => {
    const chain = buildChain({ data: { ...sampleUser, is_active: false }, error: null });
    const result = await deleteUser('1');
    expect(result.success).toBe(true);
    expect(chain.update).toHaveBeenCalledWith({ is_active: false });
  });

  it('devuelve success:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'Delete error' } });
    const result = await deleteUser('1');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Delete error');
  });
});

// ─── getUserByEmail ──────────────────────────────────────────────────────────

describe('getUserByEmail()', () => {
  it('devuelve el usuario cuando existe', async () => {
    buildChain({ data: sampleUser, error: null });
    const result = await getUserByEmail('carlos@lajungla.com');
    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('carlos@lajungla.com');
  });

  it('devuelve success:false cuando no se encuentra el usuario', async () => {
    buildChain({ data: null, error: { message: 'No rows returned' } });
    const result = await getUserByEmail('noexiste@test.com');
    expect(result.success).toBe(false);
    expect(result.user).toBeNull();
  });
});

// ─── checkUserPermissions ────────────────────────────────────────────────────

describe('checkUserPermissions()', () => {
  it('CEO tiene permiso a cualquier módulo', async () => {
    buildChain({ data: { base_role: 'ceo', assigned_modules: [] }, error: null });
    const result = await checkUserPermissions('ceo@lajungla.com', 'modulo_finanzas');
    expect(result.hasPermission).toBe(true);
  });

  it('devuelve hasPermission:true cuando el módulo está asignado', async () => {
    buildChain({
      data: { base_role: 'employee', assigned_modules: ['modulo_marketing', 'modulo_ventas'] },
      error: null,
    });
    const result = await checkUserPermissions('empleado@lajungla.com', 'modulo_marketing');
    expect(result.hasPermission).toBe(true);
  });

  it('devuelve hasPermission:false cuando el módulo NO está asignado', async () => {
    buildChain({
      data: { base_role: 'employee', assigned_modules: ['modulo_ventas'] },
      error: null,
    });
    const result = await checkUserPermissions('empleado@lajungla.com', 'modulo_finanzas');
    expect(result.hasPermission).toBe(false);
  });

  it('devuelve hasPermission:false cuando Supabase falla', async () => {
    buildChain({ data: null, error: { message: 'Auth error' } });
    const result = await checkUserPermissions('unknown@test.com', 'cualquier_modulo');
    expect(result.hasPermission).toBe(false);
  });

  it('devuelve hasPermission:false cuando assigned_modules es null o vacío', async () => {
    buildChain({
      data: { base_role: 'trainer', assigned_modules: null },
      error: null,
    });
    const result = await checkUserPermissions('trainer@lajungla.com', 'modulo_ventas');
    expect(result.hasPermission).toBe(false);
  });
});

// ─── createUserWithAuth ───────────────────────────────────────────────────────

describe('createUserWithAuth()', () => {
  const userData = {
    name: 'Nuevo Empleado',
    email: 'nuevo@lajungla.com',
    password: 'SecurePass123!',
    base_role: 'employee' as const,
  };

  it('crea usuario en Auth y en BD correctamente', async () => {
    vi.mocked(supabase.auth.admin.createUser).mockResolvedValue({
      data: { user: { id: 'auth-uuid-123', email: 'nuevo@lajungla.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } },
      error: null,
    });
    buildChain({ data: { id: 'emp-1', name: 'Nuevo Empleado', email: 'nuevo@lajungla.com' }, error: null });

    const result = await createUserWithAuth(userData);

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(supabase.auth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: userData.email, email_confirm: true })
    );
  });

  it('error en Auth — devuelve success:false sin tocar la BD', async () => {
    vi.mocked(supabase.auth.admin.createUser).mockResolvedValue({
      data: { user: null },
      error: { message: 'Email already registered', name: 'AuthApiError', status: 422 },
    });

    const result = await createUserWithAuth(userData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email already registered');
    expect(result.user).toBeNull();
    // No debe haberse llamado a supabase.from (no tocar BD)
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('error al insertar empleado — hace rollback (deleteUser de Auth)', async () => {
    vi.mocked(supabase.auth.admin.createUser).mockResolvedValue({
      data: { user: { id: 'auth-to-delete', email: 'nuevo@lajungla.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } },
      error: null,
    });
    vi.mocked(supabase.auth.admin.deleteUser).mockResolvedValue({ data: {}, error: null });
    buildChain({ data: null, error: { message: 'Duplicate key violation' } });

    const result = await createUserWithAuth(userData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Duplicate key violation');
    // Debe intentar borrar el usuario de Auth como rollback
    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith('auth-to-delete');
  });
});

// ─── Helper para mocks secuenciales (una llamada por vez) ────────────────────
function buildChainOnce(resolved: { data?: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'or', 'ilike', 'gte', 'lte', 'in', 'not']) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockResolvedValue(resolved);
  (chain as Record<string, unknown>).then = (
    onFulfilled: (v: unknown) => unknown,
    onRejected?: (e: unknown) => unknown
  ) => Promise.resolve(resolved).then(onFulfilled, onRejected);
  vi.mocked(supabase.from).mockReturnValueOnce(chain as ReturnType<typeof supabase.from>);
  return chain;
}

// ─── changeUserPassword ───────────────────────────────────────────────────────

describe('changeUserPassword()', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consoleSpy.mockRestore());

  it('con ID numérico — busca por id y actualiza', async () => {
    const { changeUserPassword } = await import('../services/userService');
    buildChainOnce({ data: { id: 1, user_id: null, email: 'test@test.com', name: 'Test' }, error: null });
    buildChainOnce({ data: { id: 1, updated_at: '2026-02-27' }, error: null });

    const result = await changeUserPassword('1', 'NuevaPass123!');

    expect(result.success).toBe(true);
  });

  it('con UUID — busca por user_id', async () => {
    const { changeUserPassword } = await import('../services/userService');
    buildChainOnce({ data: { id: 1, user_id: 'uuid-abc', email: 'test@test.com', name: 'Test' }, error: null });
    buildChainOnce({ data: { id: 1 }, error: null });

    const result = await changeUserPassword('uuid-abc-123-def', 'NuevaPass!');

    expect(result.success).toBe(true);
  });

  it('usuario no encontrado — devuelve success:false', async () => {
    const { changeUserPassword } = await import('../services/userService');
    buildChainOnce({ data: null, error: { message: 'No rows' } });

    const result = await changeUserPassword('999', 'NuevaPass!');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Usuario no encontrado');
  });
});

// ─── updateUserEmail ──────────────────────────────────────────────────────────

describe('updateUserEmail()', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consoleSpy.mockRestore());

  it('actualiza email y devuelve success:true', async () => {
    const { updateUserEmail } = await import('../services/userService');
    buildChainOnce({ data: { id: 1, user_id: null, email: 'old@test.com', name: 'Test' }, error: null });
    buildChainOnce({ data: { id: 1, email: 'new@test.com' }, error: null });

    const result = await updateUserEmail('1', 'new@test.com');

    expect(result.success).toBe(true);
  });

  it('usuario no encontrado — devuelve success:false', async () => {
    const { updateUserEmail } = await import('../services/userService');
    buildChainOnce({ data: null, error: { message: 'Not found' } });

    const result = await updateUserEmail('999', 'new@test.com');

    expect(result.success).toBe(false);
  });

  it('error al actualizar employees — devuelve success:false', async () => {
    const { updateUserEmail } = await import('../services/userService');
    buildChainOnce({ data: { id: 1, user_id: null }, error: null }); // find user OK
    buildChainOnce({ data: null, error: { message: 'Unique constraint' } }); // update fails

    const result = await updateUserEmail('1', 'duplicate@test.com');

    expect(result.success).toBe(false);
  });
});

// ─── deactivateUser ───────────────────────────────────────────────────────────

describe('deactivateUser()', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consoleSpy.mockRestore());

  it('desactiva usuario correctamente', async () => {
    const { deactivateUser } = await import('../services/userService');
    buildChainOnce({ data: { id: 1, is_active: true }, error: null });
    buildChainOnce({ data: { id: 1, is_active: false }, error: null });

    const result = await deactivateUser('1');

    expect(result.success).toBe(true);
  });

  it('usuario no encontrado — devuelve success:false', async () => {
    const { deactivateUser } = await import('../services/userService');
    buildChainOnce({ data: null, error: { message: 'Not found' } });

    const result = await deactivateUser('999');

    expect(result.success).toBe(false);
  });
});

// ─── reactivateUser ───────────────────────────────────────────────────────────

describe('reactivateUser()', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consoleSpy.mockRestore());

  it('reactiva usuario y devuelve success:true con user', async () => {
    const { reactivateUser } = await import('../services/userService');
    buildChainOnce({ data: { id: 1, user_id: null, is_active: false }, error: null });
    buildChainOnce({ data: { id: 1, is_active: true }, error: null });

    const result = await reactivateUser('1');

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  it('usuario no encontrado — devuelve success:false', async () => {
    const { reactivateUser } = await import('../services/userService');
    buildChainOnce({ data: null, error: { message: 'Not found' } });

    const result = await reactivateUser('999');

    expect(result.success).toBe(false);
  });
});

// ─── reactivateEmailAccess ────────────────────────────────────────────────────

describe('reactivateEmailAccess()', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consoleSpy.mockRestore());

  it('reactiva acceso y devuelve mensaje de confirmación', async () => {
    const { reactivateEmailAccess } = await import('../services/userService');
    buildChainOnce({ data: { id: 1, user_id: 'uid', email: 'ana@test.com', name: 'Ana', is_active: true }, error: null });
    buildChainOnce({ data: null, error: null }); // update timestamp

    const result = await reactivateEmailAccess('ana@test.com');

    expect(result.success).toBe(true);
    expect(result.message).toContain('Ana');
  });

  it('email no encontrado — devuelve success:false', async () => {
    const { reactivateEmailAccess } = await import('../services/userService');
    buildChainOnce({ data: null, error: { message: 'No rows' } });

    const result = await reactivateEmailAccess('noexiste@test.com');

    expect(result.success).toBe(false);
  });
});
