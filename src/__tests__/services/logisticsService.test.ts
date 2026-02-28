/**
 * logisticsService.test.ts
 *
 * Tests del servicio de logística — gestión de inventario, pedidos y proveedores.
 * Cubre las funciones añadidas en Fase 1 para LogisticsManagementSystem.tsx,
 * CriticalAlertsPanel.tsx y RealInventoryTable.tsx.
 *
 * Casos críticos:
 *  - Consulta de inventario por centros (filtro IN)
 *  - Borrado de pedidos/proveedores/items (no lanza en error)
 *  - Creación y actualización de items de inventario
 *  - Comportamiento defensivo: devuelve [] o { success: false }, nunca lanza
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase ─────────────────────────────────────────────────────────────
const fromMock = vi.hoisted(() => vi.fn());

vi.mock('../../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

import {
  getInventoryAlerts,
  getInventoryByCenters,
  getOrders,
  getSuppliersList,
  getToolsList,
  getPendingUniformRequests,
  deleteOrder,
  markOrderSent,
  deleteSupplierById,
  deleteToolById,
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItemById,
  updateInventoryItem,
} from '../../services/logisticsService';

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const mockInventoryItems = [
  { id: 1, nombre_item: 'Camiseta L', quantity: 3, min_stock: 5, center_id: 9 },
  { id: 2, nombre_item: 'Sudadera XL', quantity: 0, min_stock: 5, center_id: 10 },
  { id: 3, nombre_item: 'Pantalón M', quantity: 8, min_stock: 3, center_id: 11 },
];

const mockOrders = [
  { id: 'ord-001', status: 'pending', order_date: '2026-02-01', center_id: 9 },
  { id: 'ord-002', status: 'sent', order_date: '2026-01-15', center_id: 10 },
];

// ─── Helper: chain básico para operaciones select ──────────────────────────────
function buildSelectChain(data: unknown[], error: unknown = null) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue({ data, error }),
    order: vi.fn().mockResolvedValue({ data, error }),
    eq: vi.fn().mockReturnThis(),
  };
}

// ─── Tests: getInventoryAlerts() ─────────────────────────────────────────────

describe('logisticsService — getInventoryAlerts()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve los items de inventario con sus campos de alerta', async () => {
    fromMock.mockReturnValue(buildSelectChain(mockInventoryItems));
    const result = await getInventoryAlerts();
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('nombre_item');
    expect(result[0]).toHaveProperty('quantity');
    expect(result[0]).toHaveProperty('min_stock');
  });

  it('consulta inventory_items ordenado por center_id', async () => {
    fromMock.mockReturnValue(buildSelectChain(mockInventoryItems));
    await getInventoryAlerts();
    expect(fromMock).toHaveBeenCalledWith('inventory_items');
  });

  it('devuelve [] en caso de error (no lanza)', async () => {
    fromMock.mockReturnValue(buildSelectChain([], { message: 'DB error' }));
    const result = await getInventoryAlerts();
    expect(result).toEqual([]);
  });

  it('devuelve [] si data es null', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    const result = await getInventoryAlerts();
    expect(result).toEqual([]);
  });
});

// ─── Tests: getInventoryByCenters() ──────────────────────────────────────────

describe('logisticsService — getInventoryByCenters()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve items de los centros indicados', async () => {
    const centroItems = mockInventoryItems.filter(i => [9, 10].includes(i.center_id));
    fromMock.mockReturnValue(buildSelectChain(centroItems));
    const result = await getInventoryByCenters([9, 10]);
    expect(result).toHaveLength(2);
  });

  it('usa filtro IN para los centerIds', async () => {
    const inMock = vi.fn().mockResolvedValue({ data: mockInventoryItems, error: null });
    fromMock.mockReturnValue({ select: vi.fn().mockReturnValue({ in: inMock }) });

    await getInventoryByCenters([9, 10, 11]);
    expect(inMock).toHaveBeenCalledWith('center_id', [9, 10, 11]);
  });

  it('devuelve [] si error en la consulta', async () => {
    fromMock.mockReturnValue(buildSelectChain([], { message: 'permission denied' }));
    const result = await getInventoryByCenters([9]);
    expect(result).toEqual([]);
  });

  it('devuelve [] para lista de centros vacía sin error', async () => {
    fromMock.mockReturnValue(buildSelectChain([]));
    const result = await getInventoryByCenters([]);
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Tests: deleteOrder() ────────────────────────────────────────────────────

describe('logisticsService — deleteOrder()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve { success: true } al borrar correctamente', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const result = await deleteOrder('ord-001');
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('devuelve { success: false, error } si falla el borrado', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'foreign key constraint' } }),
    });
    const result = await deleteOrder('ord-999');
    expect(result.success).toBe(false);
    expect(result.error).toBe('foreign key constraint');
  });

  it('consulta la tabla orders', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    await deleteOrder('ord-001');
    expect(fromMock).toHaveBeenCalledWith('orders');
  });
});

// ─── Tests: markOrderSent() ──────────────────────────────────────────────────

describe('logisticsService — markOrderSent()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve { success: true } al marcar como enviado', async () => {
    fromMock.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const result = await markOrderSent('ord-001', '2026-02-28');
    expect(result.success).toBe(true);
  });

  it('actualiza status=sent y sent_date', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValue({ update: updateMock });

    await markOrderSent('ord-001', '2026-02-28');
    expect(updateMock).toHaveBeenCalledWith({ status: 'sent', sent_date: '2026-02-28' });
  });

  it('devuelve { success: false, error } si falla', async () => {
    fromMock.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'not found' } }),
    });
    const result = await markOrderSent('ord-999', '2026-02-28');
    expect(result.success).toBe(false);
    expect(result.error).toBe('not found');
  });
});

// ─── Tests: createInventoryItem() ────────────────────────────────────────────

describe('logisticsService — createInventoryItem()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve { data } con el item creado', async () => {
    const newItem = { id: 50, nombre_item: 'Polo Azul', quantity: 10, center_id: 9 };
    fromMock.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: newItem, error: null }),
    });

    const result = await createInventoryItem({ nombre_item: 'Polo Azul', quantity: 10, center_id: 9 });
    expect(result.data).toEqual(newItem);
    expect(result.error).toBeUndefined();
  });

  it('devuelve { data: null, error } si falla el insert', async () => {
    fromMock.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not null violation' } }),
    });

    const result = await createInventoryItem({});
    expect(result.data).toBeNull();
    expect(result.error).toBe('not null violation');
  });
});

// ─── Tests: deleteInventoryItem() ────────────────────────────────────────────

describe('logisticsService — deleteInventoryItem()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve { success: true } al borrar el item', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const result = await deleteInventoryItem(1);
    expect(result.success).toBe(true);
  });

  it('devuelve { success: false, error } si falla', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'record in use' } }),
    });
    const result = await deleteInventoryItem(999);
    expect(result.success).toBe(false);
    expect(result.error).toBe('record in use');
  });
});

// ─── Tests: updateInventoryItem() ────────────────────────────────────────────

describe('logisticsService — updateInventoryItem()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve { data } con el array de items actualizados', async () => {
    const updated = [{ id: 1, nombre_item: 'Camiseta L', quantity: 15, center_id: 9 }];
    fromMock.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: updated, error: null }),
    });

    const result = await updateInventoryItem(1, { quantity: 15 });
    expect(result.data).toEqual(updated);
    expect(result.error).toBeUndefined();
  });

  it('devuelve { data: null, error } si falla el update', async () => {
    fromMock.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: null, error: { message: 'permission denied' } }),
    });

    const result = await updateInventoryItem(999, { quantity: 5 });
    expect(result.data).toBeNull();
    expect(result.error).toBe('permission denied');
  });
});

// ─── Tests: getInventoryItemById() ───────────────────────────────────────────

describe('logisticsService — getInventoryItemById()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve el item por id', async () => {
    const item = mockInventoryItems[0];
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: item, error: null }),
    });

    const result = await getInventoryItemById(1);
    expect(result.data).toEqual(item);
    expect(result.error).toBeUndefined();
  });

  it('devuelve { data: null, error } si no existe', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'no rows' } }),
    });

    const result = await getInventoryItemById(9999);
    expect(result.data).toBeNull();
    expect(result.error).toBe('no rows');
  });
});

// ─── Tests: deleteSupplierById / deleteToolById ───────────────────────────────

describe('logisticsService — deleteSupplierById() y deleteToolById()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deleteSupplierById: devuelve { success: true }', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    expect((await deleteSupplierById(1)).success).toBe(true);
  });

  it('deleteToolById: devuelve { success: true }', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    expect((await deleteToolById(1)).success).toBe(true);
  });

  it('deleteSupplierById: consulta tabla suppliers', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    await deleteSupplierById(5);
    expect(fromMock).toHaveBeenCalledWith('suppliers');
  });

  it('deleteToolById: consulta tabla tools', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    await deleteToolById(3);
    expect(fromMock).toHaveBeenCalledWith('tools');
  });
});

// ─── Tests: getOrders / getSuppliersList / getToolsList ──────────────────────

describe('logisticsService — getters de listas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getOrders: devuelve array de pedidos', async () => {
    fromMock.mockReturnValue(buildSelectChain(mockOrders));
    const result = await getOrders();
    expect(result).toHaveLength(2);
    expect(fromMock).toHaveBeenCalledWith('orders');
  });

  it('getSuppliersList: devuelve [] si no hay proveedores', async () => {
    fromMock.mockReturnValue(buildSelectChain([]));
    const result = await getSuppliersList();
    expect(result).toEqual([]);
    expect(fromMock).toHaveBeenCalledWith('suppliers');
  });

  it('getToolsList: devuelve [] en caso de error', async () => {
    fromMock.mockReturnValue(buildSelectChain([], { message: 'error' }));
    const result = await getToolsList();
    expect(result).toEqual([]);
  });

  it('getPendingUniformRequests: filtra por status pending', async () => {
    const eqMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: eqMock,
      order: orderMock,
    });

    await getPendingUniformRequests();
    expect(eqMock).toHaveBeenCalledWith('status', 'pending');
    expect(fromMock).toHaveBeenCalledWith('uniform_requests');
  });
});
