/**
 * Tests para src/types/roles.ts
 * Funciones puras del sistema de roles — sin dependencias externas
 */
import { describe, it, expect } from 'vitest';
import {
  getAdvancedRole,
  hasPermission,
  hasBusinessUnitAccess,
  getRoleConfig,
  UserRole,
  BusinessUnit,
  rolePermissions,
  dashboardConfig,
} from '../types/roles';

describe('getAdvancedRole()', () => {
  it('devuelve SUPERADMIN para el email especial', () => {
    expect(getAdvancedRole('Empleado', { email: 'superadmin@lajungla.com' }))
      .toBe(UserRole.SUPERADMIN);
  });

  it('devuelve FRANCHISEE para Encargado de Franquicia', () => {
    expect(getAdvancedRole('Encargado', { center: { type: 'Franquicia' } }))
      .toBe(UserRole.FRANCHISEE);
  });

  it('devuelve CENTER_MANAGER para Encargado sin franquicia', () => {
    expect(getAdvancedRole('Encargado', {}))
      .toBe(UserRole.CENTER_MANAGER);
  });

  it('devuelve ADMIN para Director', () => {
    expect(getAdvancedRole('Director', {})).toBe(UserRole.ADMIN);
  });

  it('devuelve ADMIN para Administrador', () => {
    expect(getAdvancedRole('Administrador', {})).toBe(UserRole.ADMIN);
  });

  it('devuelve BRAND_EMPLOYEE para Empleado sin email especial', () => {
    expect(getAdvancedRole('Empleado', { email: 'otro@empresa.com' }))
      .toBe(UserRole.BRAND_EMPLOYEE);
  });

  it('devuelve COLLABORATOR para Proveedor', () => {
    expect(getAdvancedRole('Proveedor', {})).toBe(UserRole.COLLABORATOR);
  });

  it('devuelve BRAND_EMPLOYEE para rol desconocido (fallback)', () => {
    expect(getAdvancedRole('RolQueNoExiste', {})).toBe(UserRole.BRAND_EMPLOYEE);
  });

  it('funciona sin pasar employee (undefined)', () => {
    const result = getAdvancedRole('Director');
    expect(result).toBe(UserRole.ADMIN);
  });
});

describe('hasPermission()', () => {
  it('SUPERADMIN tiene canViewAllBusinessUnits = true', () => {
    expect(hasPermission(UserRole.SUPERADMIN, 'canViewAllBusinessUnits')).toBe(true);
  });

  it('SUPERADMIN tiene canManageUsers = true', () => {
    expect(hasPermission(UserRole.SUPERADMIN, 'canManageUsers')).toBe(true);
  });

  it('BRAND_EMPLOYEE NO tiene canViewAllBusinessUnits', () => {
    expect(hasPermission(UserRole.BRAND_EMPLOYEE, 'canViewAllBusinessUnits')).toBe(false);
  });

  it('BRAND_EMPLOYEE NO tiene canManageUsers', () => {
    expect(hasPermission(UserRole.BRAND_EMPLOYEE, 'canManageUsers')).toBe(false);
  });

  it('TRAINER NO tiene canViewAllCenters', () => {
    expect(hasPermission(UserRole.TRAINER, 'canViewAllCenters')).toBe(false);
  });

  it('ADMIN tiene canViewAllBusinessUnits = true', () => {
    expect(hasPermission(UserRole.ADMIN, 'canViewAllBusinessUnits')).toBe(true);
  });
});

describe('hasBusinessUnitAccess()', () => {
  it('SUPERADMIN tiene acceso a jungla_workout', () => {
    expect(hasBusinessUnitAccess(UserRole.SUPERADMIN, BusinessUnit.JUNGLA_WORKOUT)).toBe(true);
  });

  it('SUPERADMIN tiene acceso a jungla_tech', () => {
    expect(hasBusinessUnitAccess(UserRole.SUPERADMIN, BusinessUnit.JUNGLA_TECH)).toBe(true);
  });

  it('ADMIN tiene acceso a jungla_workout', () => {
    expect(hasBusinessUnitAccess(UserRole.ADMIN, BusinessUnit.JUNGLA_WORKOUT)).toBe(true);
  });

  it('ADMIN NO tiene acceso a jungla_tech', () => {
    expect(hasBusinessUnitAccess(UserRole.ADMIN, BusinessUnit.JUNGLA_TECH)).toBe(false);
  });

  it('CENTER_MANAGER NO tiene acceso a jungla_online (array vacío)', () => {
    expect(hasBusinessUnitAccess(UserRole.CENTER_MANAGER, BusinessUnit.JUNGLA_ONLINE)).toBe(false);
  });

  it('TRAINER NO tiene acceso a jungla_academy', () => {
    expect(hasBusinessUnitAccess(UserRole.TRAINER, BusinessUnit.JUNGLA_ACADEMY)).toBe(false);
  });
});

describe('getRoleConfig()', () => {
  it('devuelve config y permissions para SUPERADMIN', () => {
    const result = getRoleConfig(UserRole.SUPERADMIN);
    expect(result.config).toBeDefined();
    expect(result.permissions).toBeDefined();
    expect(result.config.title).toBe('SuperAdmin Dashboard');
  });

  it('devuelve config correcta para CENTER_MANAGER', () => {
    const result = getRoleConfig(UserRole.CENTER_MANAGER);
    expect(result.config.title).toBe('Center Manager Dashboard');
    expect(result.config.color).toBe('green');
  });

  it('config de SUPERADMIN incluye sección global_kpis', () => {
    const result = getRoleConfig(UserRole.SUPERADMIN);
    expect(result.config.sections).toContain('global_kpis');
  });

  it('permissions de ADMIN tiene canViewAllBusinessUnits = true', () => {
    const result = getRoleConfig(UserRole.ADMIN);
    expect(result.permissions.canViewAllBusinessUnits).toBe(true);
  });
});

describe('rolePermissions — estructura completa', () => {
  it('todos los UserRole tienen permisos definidos', () => {
    Object.values(UserRole).forEach(role => {
      expect(rolePermissions[role]).toBeDefined();
    });
  });
});

describe('dashboardConfig — estructura completa', () => {
  it('todos los UserRole tienen dashboardConfig definido', () => {
    Object.values(UserRole).forEach(role => {
      expect(dashboardConfig[role]).toBeDefined();
      expect(dashboardConfig[role].title).toBeTruthy();
      expect(dashboardConfig[role].sections.length).toBeGreaterThan(0);
    });
  });
});
