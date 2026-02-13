import React, { useState } from 'react';
import { Package, AlertTriangle, Edit, Save, X, RefreshCw, Trash2 } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useSession } from '../../contexts/SessionContext';
import inventoryMovementService from '../../services/inventoryMovementService';

interface RealInventoryTableProps {
  selectedCenter?: number | 'all';
  searchTerm?: string;
  statusFilter?: string;
  categoryFilter?: string;
  inventoryItems?: any[];
  onDeleteItem?: (itemId: number) => void;
}

const RealInventoryTable: React.FC<RealInventoryTableProps> = ({
  selectedCenter = 'all',
  searchTerm = '',
  statusFilter = 'all',
  categoryFilter = 'all',
  inventoryItems: propInventoryItems,
  onDeleteItem
}) => {
  const { inventoryItems: hookInventoryItems, loading, error, refetch } = useInventory();
  const { employee } = useSession();

  // Usar items de prop si están disponibles, sino usar los del hook
  const inventoryItems = propInventoryItems || hookInventoryItems;
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'center' | 'category'>('name');

  // Función para eliminar item
  const deleteItem = (itemId: number, itemName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar "${itemName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmDelete) {
      console.log(`🗑️ Eliminando item ID: ${itemId} - "${itemName}"`);

      // Si hay función callback, usarla (para items de prueba)
      if (onDeleteItem) {
        onDeleteItem(itemId);
        console.log(`✅ Item "${itemName}" eliminado del inventario`);
      } else {
        // Para items reales de Supabase, implementar eliminación real
        const deleteFromSupabase = async () => {
          try {
            // 1. Registrar movimiento de eliminación
            const itemToDelete = inventoryItems.find(i => i.id === itemId);
            if (itemToDelete) {
              const centerMap: Record<string, number> = { central: 1, sevilla: 9, jerez: 10, puerto: 11 };
              const centerId = centerMap[itemToDelete.center] || 1;

              await inventoryMovementService.recordMovement({
                inventory_item_id: itemId,
                user_id: employee?.email || 'unknown',
                user_name: employee?.name || 'Usuario',
                center_id: centerId,
                type: 'adjustment',
                quantity_change: -itemToDelete.quantity,
                previous_quantity: itemToDelete.quantity,
                new_quantity: 0,
                reason: 'Eliminación manual de item'
              });
            }

            // 2. Eliminar de Supabase
            const { supabase } = await import('../../lib/supabase');
            const { error } = await supabase
              .from('inventory_items')
              .delete()
              .eq('id', itemId);

            if (error) {
              console.error('❌ Error eliminando item de Supabase:', error);
              alert('Error al eliminar el item. Por favor, inténtalo de nuevo.');
            } else {
              console.log(`✅ Item "${itemName}" eliminado de Supabase`);
              // Recargar datos
              refetch();
            }
          } catch (err) {
            console.error('❌ Error en deleteFromSupabase:', err);
            alert('Error al eliminar el item.');
          }
        };

        deleteFromSupabase();
      }
    }
  };

  // Filtrar items por todos los criterios y ordenar según criterio seleccionado
  const filteredItems = inventoryItems
    .filter(item => {
      // Filtro por centro
      if (selectedCenter !== 'all') {
        const centerMap: Record<string, number> = { central: 1, sevilla: 9, jerez: 10, puerto: 11 };
        const shouldInclude = centerMap[item.center] === selectedCenter;
        console.log(`🔍 Item "${item.name}": center="${item.center}", selectedCenter=${selectedCenter}, centerMap[${item.center}]=${centerMap[item.center]}, include=${shouldInclude}`);
        if (!shouldInclude) return false;
      }

      // Filtro por búsqueda
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por estado
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Filtro por categoría
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
        case 'stock':
          return b.quantity - a.quantity; // Mayor stock primero
        case 'center':
          return a.center.localeCompare(b.center, 'es', { sensitivity: 'base' });
        case 'category':
          return a.category.localeCompare(b.category, 'es', { sensitivity: 'base' });
        default:
          return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      }
    });

  console.log('📊 Total inventory items:', inventoryItems.length);
  console.log('📋 All categories found:', [...new Set(inventoryItems.map(item => item.category))]);
  console.log('🔍 Current category filter:', categoryFilter);
  console.log('🏢 Selected center:', selectedCenter);
  const allCenters = [...new Set(inventoryItems.map(item => item.center))];
  console.log('📍 All centers in inventory:', allCenters);
  console.log('📍 Centers detailed:', allCenters.map(center => `"${center}"`));
  console.log('📦 Filtered items:', filteredItems.length);

  // Debug específico para centro Central
  if (selectedCenter === 12) {
    const centralItems = inventoryItems.filter(item => item.center === 'central');
    console.log('🏢 Items con center="central":', centralItems.length);
    console.log('🎯 Items después del filtro completo:', filteredItems.length);
    if (centralItems.length > 0) {
      console.log('📦 Primeros items centrales:', centralItems.slice(0, 3).map(item => ({ name: item.name, center: item.center })));
    }
    if (filteredItems.length > 0) {
      console.log('✅ Items que se van a mostrar:', filteredItems.slice(0, 3).map(item => ({ name: item.name, center: item.center })));
    } else {
      console.log('❌ NO HAY ITEMS PARA MOSTRAR después del filtrado');
    }
  }

  // Calcular totales del inventario
  const inventoryTotals = filteredItems.reduce((totals, item) => {
    const itemValuePurchase = item.quantity * item.purchase_price;
    const itemValueSale = item.quantity * item.sale_price;

    return {
      totalItems: totals.totalItems + item.quantity,
      totalPurchaseValue: totals.totalPurchaseValue + itemValuePurchase,
      totalSaleValue: totals.totalSaleValue + itemValueSale,
      totalProducts: totals.totalProducts + 1
    };
  }, {
    totalItems: 0,
    totalPurchaseValue: 0,
    totalSaleValue: 0,
    totalProducts: 0
  });

  const startEditing = (item: any) => {
    console.log('🖊️ Iniciando edición del item:', item.id);
    console.log('Datos del item:', item);
    console.log('Min stock del item:', item.min_stock);
    console.log('Max stock del item:', item.max_stock);

    const editData = {
      cantidad_actual: Number(item.quantity) || 0,
      precio_compra: Number(item.purchase_price) || 0,
      precio_venta: Number(item.sale_price) || 0,
      min_stock: Number(item.min_stock) || 0,
      max_stock: Number(item.max_stock) || 0
    };

    console.log('Valores iniciales para edición:', editData);

    setEditingItem(item.id);
    setEditValues(editData);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValues({});
  };

  const saveChanges = async (itemId: number) => {
    try {
      console.log('Guardando cambios para item:', itemId);
      console.log('Valores a guardar:', editValues);

      const { supabase } = await import('../../lib/supabase');

      // Primero verificar qué campos existen en la tabla
      const { data: existingItem, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchError) {
        console.error('Error obteniendo item actual:', fetchError);
        alert(`Error: ${fetchError.message}`);
        return;
      }

      console.log('Item actual en BD:', existingItem);
      console.log('Valores editados antes de mapear:', editValues);

      // Preparar los datos de actualización usando los nombres correctos de campos
      const updateData: any = {};

      // Mapear campos según lo que existe en la base de datos, asegurando que sean números
      if ('cantidad_actual' in existingItem) {
        updateData.cantidad_actual = Number(editValues.cantidad_actual) || 0;
        console.log('Mapeando cantidad_actual:', editValues.cantidad_actual, '→', updateData.cantidad_actual);
      } else if ('quantity' in existingItem) {
        updateData.quantity = Number(editValues.cantidad_actual) || 0;
        console.log('Mapeando quantity:', editValues.cantidad_actual, '→', updateData.quantity);
      }

      if ('precio_compra' in existingItem) {
        updateData.precio_compra = Number(editValues.precio_compra) || 0;
        console.log('Mapeando precio_compra:', editValues.precio_compra, '→', updateData.precio_compra);
      } else if ('cost_per_unit' in existingItem) {
        updateData.cost_per_unit = Number(editValues.precio_compra) || 0;
        console.log('Mapeando cost_per_unit:', editValues.precio_compra, '→', updateData.cost_per_unit);
      }

      if ('precio_venta' in existingItem) {
        updateData.precio_venta = Number(editValues.precio_venta) || 0;
        console.log('Mapeando precio_venta:', editValues.precio_venta, '→', updateData.precio_venta);
      } else if ('selling_price' in existingItem) {
        updateData.selling_price = Number(editValues.precio_venta) || 0;
        console.log('Mapeando selling_price:', editValues.precio_venta, '→', updateData.selling_price);
      }

      // Buscar campo de stock mínimo - la tabla no tiene este campo, necesitamos agregarlo
      if ('min_stock' in existingItem) {
        updateData.min_stock = Number(editValues.min_stock) || 0;
        console.log('Mapeando min_stock:', editValues.min_stock, '→', updateData.min_stock);
      } else if ('minimum_stock' in existingItem) {
        updateData.minimum_stock = Number(editValues.min_stock) || 0;
        console.log('Mapeando minimum_stock:', editValues.min_stock, '→', updateData.minimum_stock);
      } else if ('stock_minimo' in existingItem) {
        updateData.stock_minimo = Number(editValues.min_stock) || 0;
        console.log('Mapeando stock_minimo:', editValues.min_stock, '→', updateData.stock_minimo);
      } else {
        // El campo min_stock no existe en la tabla, vamos a agregarlo
        console.log('⚠️ Campo min_stock no existe en la tabla, agregándolo...');
        updateData.min_stock = Number(editValues.min_stock) || 0;
        console.log('Agregando min_stock:', editValues.min_stock, '→', updateData.min_stock);
      }

      // Agregar max_stock
      updateData.max_stock = Number(editValues.max_stock) || 0;
      console.log('Agregando max_stock:', editValues.max_stock, '→', updateData.max_stock);

      updateData.updated_at = new Date().toISOString();

      console.log('Datos a actualizar:', updateData);

      const { data, error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', itemId)
        .select();

      if (error) {
        console.error('Error de Supabase:', error);
        alert(`Error al guardar: ${error.message}`);
        return;
      }

      console.log('Datos actualizados exitosamente:', data);
      alert('Cambios guardados exitosamente');
      setEditingItem(null);
      setEditValues({});

      // Recargar datos inmediatamente
      try {
        await refetch();
        console.log('Datos recargados después de la actualización');
      } catch (refetchError) {
        console.error('Error recargando datos:', refetchError);
        // Si falla el refetch, al menos recargar la página como fallback
        window.location.reload();
      }
    } catch (error) {
      console.error('Error general:', error);
      alert(`Error al conectar con la base de datos: ${error}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Package size={48} style={{ color: '#059669', marginBottom: '16px' }} />
        <p style={{ color: '#059669', fontSize: '18px' }}>Cargando inventario desde Supabase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
        <p style={{ color: '#ef4444', fontSize: '18px' }}>Error: {error}</p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Package size={48} style={{ color: '#6b7280', marginBottom: '16px' }} />
        <p style={{ color: '#6b7280', fontSize: '18px' }}>No se encontraron datos de inventario</p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Verifica que los scripts SQL se hayan ejecutado correctamente</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {/* Header con controles */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: 0, color: '#374151' }}>
          Inventario ({filteredItems.length} items)
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Selector de ordenamiento */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'stock' | 'center' | 'category')}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="name">📝 Nombre</option>
              <option value="stock">📊 Stock</option>
              <option value="center">🏪 Centro</option>
              <option value="category">📦 Categoría</option>
            </select>
          </div>

          {/* Botón de recarga */}
          <button
            onClick={() => refetch()}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1
            }}
          >
            <RefreshCw size={14} />
            {loading ? 'Cargando...' : 'Recargar'}
          </button>
        </div>
      </div>

      {/* Header de tabla (Desktop) */}
      <div className="hidden md:grid" style={{
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 80px',
        backgroundColor: '#f9fafb',
        padding: '1rem',
        fontWeight: '600',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '14px'
      }}>
        <div>Artículo</div>
        <div>Centro</div>
        <div>Categoría</div>
        <div>Stock</div>
        <div>Mín.</div>
        <div>Máx.</div>
        <div>P. Compra</div>
        <div>P. Venta</div>
        <div>Estado</div>
        <div>Acciones</div>
      </div>

      {/* Fila de totales (Responsive) */}
      <div className="bg-green-600 text-white p-3 md:p-4 text-sm font-semibold border-b-2 border-green-700">
        <div className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 md:gap-0">
          <div className="flex justify-between md:block">
            <span>📊 TOTALES ({inventoryTotals.totalProducts})</span>
            <span className="md:hidden opacity-90">{inventoryTotals.totalItems.toLocaleString()} items</span>
          </div>

          <div className="hidden md:block">-</div>
          <div className="hidden md:block">-</div>
          <div className="hidden md:block font-bold text-[15px]">{inventoryTotals.totalItems.toLocaleString()}</div>
          <div className="hidden md:block">-</div>
          <div className="hidden md:block font-bold text-[15px]">{inventoryTotals.totalItems.toLocaleString()}</div>
          <div className="hidden md:block">-</div>
          <div className="hidden md:block">-</div>
          <div className="flex justify-between md:block mt-2 md:mt-0">
            <span className="md:hidden">Valor Compra:</span>
            <span className="font-bold">€{inventoryTotals.totalPurchaseValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between md:block">
            <span className="md:hidden">Valor Venta:</span>
            <span className="font-bold">€{inventoryTotals.totalSaleValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="hidden md:block text-xs">
            💰 {inventoryTotals.totalSaleValue > 0 ? Math.round(((inventoryTotals.totalSaleValue - inventoryTotals.totalPurchaseValue) / inventoryTotals.totalSaleValue) * 100) : 0}%
          </div>
          <div className="hidden md:block">-</div>
        </div>
      </div>

      {/* Rows */}
      {filteredItems.map((item) => {
        const isEditing = editingItem === item.id;
        return (
          <React.Fragment key={item.id}>
            {/* Desktop View */}
            <div
              className="hidden md:grid hover:bg-gray-50 transition-colors"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 80px',
                padding: '1rem',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '14px',
                backgroundColor: isEditing ? '#f0f9ff' : undefined
              }}
            >
              {/* ... Desktop Columns Content (Keeping existing logic for desktop) ... */}
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {item.supplier} • {item.location}
                </div>
              </div>
              <div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${item.center === 'central' ? 'bg-purple-100 text-purple-600' :
                  item.center === 'sevilla' ? 'bg-amber-100 text-amber-600' :
                    item.center === 'jerez' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                  {item.center === 'sevilla' ? '🏪 Sevilla' :
                    item.center === 'jerez' ? '🏪 Jerez' :
                      item.center === 'puerto' ? '🏪 Puerto' : '🏢 Central'}
                </span>
              </div>
              <div className="text-gray-700">{item.category}</div>
              <div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editValues.cantidad_actual || ''}
                    onChange={(e) => setEditValues((prev: any) => ({ ...prev, cantidad_actual: Number(e.target.value) || 0 }))}
                    className="w-[60px] p-1 border border-gray-300 rounded text-sm"
                  />
                ) : (
                  <span className={`font-semibold ${item.quantity === 0 ? 'text-red-600' : 'text-gray-700'}`}>
                    {item.quantity}
                  </span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editValues.min_stock || ''}
                    onChange={(e) => setEditValues((prev: any) => ({ ...prev, min_stock: Number(e.target.value) || 0 }))}
                    className="w-[50px] p-1 border border-gray-300 rounded text-sm"
                  />
                ) : (
                  <span className="text-gray-500">{item.min_stock}</span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editValues.max_stock || ''}
                    onChange={(e) => setEditValues((prev: any) => ({ ...prev, max_stock: Number(e.target.value) || 0 }))}
                    className="w-[50px] p-1 border border-gray-300 rounded text-sm"
                  />
                ) : (
                  <span className="text-gray-500">{item.max_stock || '-'}</span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editValues.precio_compra || ''}
                    onChange={(e) => setEditValues((prev: any) => ({ ...prev, precio_compra: Number(e.target.value) || 0 }))}
                    className="w-[70px] p-1 border border-gray-300 rounded text-sm"
                  />
                ) : (
                  <span className="text-red-600 font-semibold">€{item.purchase_price.toFixed(2)}</span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editValues.precio_venta || ''}
                    onChange={(e) => setEditValues((prev: any) => ({ ...prev, precio_venta: Number(e.target.value) || 0 }))}
                    className="w-[70px] p-1 border border-gray-300 rounded text-sm"
                  />
                ) : (
                  <span className="text-green-600 font-semibold">€{item.sale_price.toFixed(2)}</span>
                )}
              </div>
              <div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${item.status === 'in_stock' ? 'bg-green-100 text-green-700' :
                  item.status === 'low_stock' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {item.status === 'in_stock' ? '✅ Stock' :
                    item.status === 'low_stock' ? '⚠️ Bajo' : '❌ Agotado'}
                </span>
              </div>
              <div className="flex gap-1">
                {isEditing ? (
                  <>
                    <button onClick={() => saveChanges(item.id)} className="p-1 bg-green-600 text-white rounded hover:bg-green-700"><Save size={14} /></button>
                    <button onClick={cancelEditing} className="p-1 bg-red-600 text-white rounded hover:bg-red-700"><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(item)} className="p-1 bg-gray-100 text-gray-600 border border-gray-300 rounded hover:bg-gray-200"><Edit size={14} /></button>
                    <button onClick={() => deleteItem(item.id, item.name)} className="p-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className={`md:hidden p-4 border-b border-gray-200 ${isEditing ? 'bg-blue-50' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <span className="uppercase text-xs tracking-wide bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.center}</span>
                    <span>•</span>
                    <span>{item.category}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                  item.status === 'low_stock' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {item.status === 'in_stock' ? 'Stock OK' :
                    item.status === 'low_stock' ? 'Bajo' : 'Agotado'}
                </span>
              </div>

              {isEditing ? (
                <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm space-y-3 mb-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 font-semibold uppercase">Stock Actual</label>
                      <input
                        type="number"
                        value={editValues.cantidad_actual || ''}
                        onChange={(e) => setEditValues((prev: any) => ({ ...prev, cantidad_actual: Number(e.target.value) || 0 }))}
                        className="w-full p-2 border border-blue-300 rounded-md font-bold text-lg text-blue-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-semibold uppercase">Mínimo</label>
                      <input
                        type="number"
                        value={editValues.min_stock || ''}
                        onChange={(e) => setEditValues((prev: any) => ({ ...prev, min_stock: Number(e.target.value) || 0 }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 font-semibold uppercase">P. Compra</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.precio_compra || ''}
                        onChange={(e) => setEditValues((prev: any) => ({ ...prev, precio_compra: Number(e.target.value) || 0 }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-semibold uppercase">P. Venta</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.precio_venta || ''}
                        onChange={(e) => setEditValues((prev: any) => ({ ...prev, precio_venta: Number(e.target.value) || 0 }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 p-3 rounded-lg">
                  <div className="text-center p-2 bg-white rounded border border-gray-200 shadow-sm">
                    <span className="block text-xs text-gray-400 uppercase font-bold">Stock</span>
                    <span className={`block text-xl font-bold ${item.quantity === 0 ? 'text-red-600' : 'text-gray-900'}`}>{item.quantity}</span>
                  </div>
                  <div className="text-center p-2 bg-white rounded border border-gray-200 shadow-sm">
                    <span className="block text-xs text-gray-400 uppercase font-bold">Min</span>
                    <span className="block text-lg text-gray-600 font-semibold">{item.min_stock}</span>
                  </div>
                  <div className="text-center p-2 bg-white rounded border border-gray-200 shadow-sm">
                    <span className="block text-xs text-gray-400 uppercase font-bold">Valor</span>
                    <span className="block text-lg text-green-600 font-semibold">€{(item.quantity * item.purchase_price).toFixed(0)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={() => saveChanges(item.id)} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
                      <Save size={18} /> Guardar
                    </button>
                    <button onClick={cancelEditing} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold border border-gray-300 active:bg-gray-200">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(item)} className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 active:bg-blue-100">
                      <Edit size={16} /> Editar / Contar
                    </button>
                    <button onClick={() => deleteItem(item.id, item.name)} className="w-12 flex items-center justify-center bg-red-50 text-red-600 border border-red-200 rounded-lg active:bg-red-100">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Footer con resumen */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        <div style={{ color: '#059669' }}>
          📦 Total: {filteredItems.length} items
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ color: '#059669' }}>
            ✅ En stock: {filteredItems.filter(i => i.status === 'in_stock').length}
          </span>
          <span style={{ color: '#f59e0b' }}>
            ⚠️ Stock bajo: {filteredItems.filter(i => i.status === 'low_stock').length}
          </span>
          <span style={{ color: '#dc2626' }}>
            ❌ Agotado: {filteredItems.filter(i => i.status === 'out_of_stock').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RealInventoryTable;
