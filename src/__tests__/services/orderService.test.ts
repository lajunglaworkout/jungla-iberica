/**
 * orderService.test.ts
 *
 * Servicio de pedidos automáticos en memoria (no Supabase).
 * Tests de CRUD de pedidos, estados y estadísticas.
 *
 * NOTA: `orders` es un array module-level — los tests son secuenciales.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';

// ─── Mock inventoryService ───────────────────────────────────────────────────
vi.mock('../../services/inventoryService', () => ({
  getItemById: vi.fn(),
  getInventoryData: vi.fn().mockReturnValue([]),
}));

import * as inventoryService from '../../services/inventoryService';
import {
  createAutomaticOrder,
  getOrdersByLocation,
  getPendingOrders,
  processOrder,
  markOrderAsShipped,
  getOrderStats,
  getOrdersData,
} from '../../services/orderService';

// Item de inventario de prueba
const mockItem = {
  id: 'item-camiseta',
  name: 'Camiseta M',
  purchasePrice: 15.00,
  quantity: 50,
  minStock: 10,
};

// Guardamos el estado inicial antes de cualquier test
let initialCount = 0;

beforeAll(() => {
  initialCount = getOrdersData().length;
  // Configurar el mock de getItemById
  vi.mocked(inventoryService.getItemById).mockReturnValue(mockItem as ReturnType<typeof inventoryService.getItemById>);
});

// ─── Estado inicial ──────────────────────────────────────────────────────────

describe('getOrderStats() — estado inicial', () => {
  it('la suite arranca con una estructura de stats válida', () => {
    const stats = getOrderStats();
    expect(stats).toHaveProperty('totalOrders');
    expect(stats).toHaveProperty('pendingOrders');
    expect(stats).toHaveProperty('processingOrders');
    expect(stats).toHaveProperty('completedOrders');
    expect(stats).toHaveProperty('totalValue');
  });
});

// ─── createAutomaticOrder() ──────────────────────────────────────────────────

describe('createAutomaticOrder()', () => {
  it('crea pedido y devuelve success=true con el objeto de pedido', async () => {
    vi.mocked(inventoryService.getItemById).mockReturnValue(mockItem as ReturnType<typeof inventoryService.getItemById>);

    const result = await createAutomaticOrder(
      'item-camiseta',
      'almacen_central',
      'centro_sevilla',
      10,
      'Ana García',
      'Stock bajo en Sevilla'
    );

    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
    expect(result.order?.fromLocation).toBe('almacen_central');
    expect(result.order?.toLocation).toBe('centro_sevilla');
    expect(result.order?.status).toBe('pendiente');
    expect(result.order?.totalAmount).toBe(150); // 15 * 10
    expect(result.order?.orderNumber).toMatch(/^PED-AUTO-/);
  });

  it('el pedido aparece en getOrdersData()', async () => {
    const countBefore = getOrdersData().length;
    vi.mocked(inventoryService.getItemById).mockReturnValue(mockItem as ReturnType<typeof inventoryService.getItemById>);

    await createAutomaticOrder('item-camiseta', 'almacen_central', 'centro_jerez', 5, 'Sistema', 'Auto');

    expect(getOrdersData().length).toBe(countBefore + 1);
  });

  it('artículo no encontrado — devuelve success=false', async () => {
    vi.mocked(inventoryService.getItemById).mockReturnValue(undefined as ReturnType<typeof inventoryService.getItemById>);

    const result = await createAutomaticOrder('item-inexistente', 'almacen_central', 'centro_sevilla', 1, 'Test', 'Test');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Artículo no encontrado');
  });

  it('múltiples pedidos tienen números correlativos', async () => {
    vi.mocked(inventoryService.getItemById).mockReturnValue(mockItem as ReturnType<typeof inventoryService.getItemById>);

    const r1 = await createAutomaticOrder('item-camiseta', 'almacen_central', 'centro_puerto', 2, 'Test', 'T1');
    const r2 = await createAutomaticOrder('item-camiseta', 'almacen_central', 'centro_puerto', 3, 'Test', 'T2');

    // Los orderNumbers deben ser diferentes
    expect(r1.order?.orderNumber).not.toBe(r2.order?.orderNumber);
  });
});

// ─── getOrdersByLocation() ───────────────────────────────────────────────────

describe('getOrdersByLocation()', () => {
  it('devuelve pedidos que tienen esa ubicación como from o to', async () => {
    vi.mocked(inventoryService.getItemById).mockReturnValue(mockItem as ReturnType<typeof inventoryService.getItemById>);

    // Crear pedido específico para esta prueba
    await createAutomaticOrder('item-camiseta', 'almacen_central', 'centro_test_loc', 1, 'Test', 'Test');

    const orders = getOrdersByLocation('centro_test_loc');
    expect(orders.length).toBeGreaterThanOrEqual(1);
    expect(orders.every(o => o.fromLocation === 'centro_test_loc' || o.toLocation === 'centro_test_loc')).toBe(true);
  });

  it('ubicación sin pedidos — devuelve array vacío', () => {
    const orders = getOrdersByLocation('ubicacion_que_no_existe_nunca');
    expect(orders).toEqual([]);
  });
});

// ─── getPendingOrders() ──────────────────────────────────────────────────────

describe('getPendingOrders()', () => {
  it('devuelve solo pedidos en estado pendiente o procesando', () => {
    const pending = getPendingOrders();
    expect(pending.every(o => ['pendiente', 'procesando'].includes(o.status))).toBe(true);
  });
});

// ─── processOrder() ──────────────────────────────────────────────────────────

describe('processOrder()', () => {
  it('cambia estado a "procesando" y devuelve true', async () => {
    vi.mocked(inventoryService.getItemById).mockReturnValue(mockItem as ReturnType<typeof inventoryService.getItemById>);

    const { order } = await createAutomaticOrder('item-camiseta', 'almacen_central', 'centro_sevilla', 1, 'Test', 'Process test');
    expect(order).toBeDefined();

    const ok = processOrder(order!.id, 'Admin');

    expect(ok).toBe(true);
    const updatedOrder = getOrdersData().find(o => o.id === order!.id);
    expect(updatedOrder?.status).toBe('procesando');
    expect(updatedOrder?.processedBy).toBe('Admin');
  });

  it('orderId inexistente — devuelve false', () => {
    const ok = processOrder('id-que-no-existe', 'Admin');
    expect(ok).toBe(false);
  });
});

// ─── markOrderAsShipped() ────────────────────────────────────────────────────

describe('markOrderAsShipped()', () => {
  it('cambia estado a "enviado" y devuelve true', async () => {
    vi.mocked(inventoryService.getItemById).mockReturnValue(mockItem as ReturnType<typeof inventoryService.getItemById>);

    const { order } = await createAutomaticOrder('item-camiseta', 'almacen_central', 'centro_sevilla', 1, 'Test', 'Ship test');
    expect(order).toBeDefined();

    const ok = markOrderAsShipped(order!.id);

    expect(ok).toBe(true);
    const updatedOrder = getOrdersData().find(o => o.id === order!.id);
    expect(updatedOrder?.status).toBe('enviado');
  });

  it('orderId inexistente — devuelve false', () => {
    const ok = markOrderAsShipped('id-que-no-existe');
    expect(ok).toBe(false);
  });
});

// ─── getOrderStats() ─────────────────────────────────────────────────────────

describe('getOrderStats() — con pedidos', () => {
  it('totalOrders incluye todos los pedidos creados', () => {
    const stats = getOrderStats();
    const allOrders = getOrdersData();
    expect(stats.totalOrders).toBe(allOrders.length);
  });

  it('totalValue es la suma de todos los importes', () => {
    const stats = getOrderStats();
    const allOrders = getOrdersData();
    const expectedTotal = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    expect(stats.totalValue).toBeCloseTo(expectedTotal, 2);
  });

  it('completedOrders cuenta solo los entregados', () => {
    const stats = getOrderStats();
    const allOrders = getOrdersData();
    const delivered = allOrders.filter(o => o.status === 'entregado').length;
    expect(stats.completedOrders).toBe(delivered);
  });
});
