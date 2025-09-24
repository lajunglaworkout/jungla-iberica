import React, { useState } from 'react';
import { Package, AlertTriangle, Edit, Save, X, RefreshCw, Trash2 } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';

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
        console.log('🔄 Eliminación de items reales de Supabase - Por implementar');
        alert('Eliminación de items reales pendiente de implementar con Supabase.');
      }
    }
  };
  
  // Filtrar items por todos los criterios y ordenar según criterio seleccionado
  const filteredItems = inventoryItems
    .filter(item => {
      // Filtro por centro
      if (selectedCenter !== 'all') {
        const centerMap: Record<string, number> = { central: 12, sevilla: 9, jerez: 10, puerto: 11 };
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
    
    const editData = {
      cantidad_actual: Number(item.quantity) || 0,
      precio_compra: Number(item.purchase_price) || 0,
      precio_venta: Number(item.sale_price) || 0,
      min_stock: Number(item.min_stock) || 0
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

      {/* Header de tabla */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 80px', 
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
        <div>P. Compra</div>
        <div>P. Venta</div>
        <div>Estado</div>
        <div>Acciones</div>
      </div>

      {/* Fila de totales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 80px', 
        backgroundColor: '#059669', 
        color: 'white',
        padding: '0.75rem 1rem', 
        fontWeight: '600', 
        borderBottom: '2px solid #047857',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊 TOTALES</span>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>
            ({inventoryTotals.totalProducts} productos)
          </span>
        </div>
        <div>-</div>
        <div>-</div>
        <div style={{ fontWeight: '700', fontSize: '15px' }}>
          {inventoryTotals.totalItems.toLocaleString()}
        </div>
        <div>-</div>
        <div style={{ fontWeight: '700', fontSize: '15px' }}>
          €{inventoryTotals.totalPurchaseValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontWeight: '700', fontSize: '15px' }}>
          €{inventoryTotals.totalSaleValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px' }}>
            💰 {inventoryTotals.totalSaleValue > 0 ? 
              Math.round(((inventoryTotals.totalSaleValue - inventoryTotals.totalPurchaseValue) / inventoryTotals.totalSaleValue) * 100) 
              : 0}%
          </span>
        </div>
        <div>-</div>
      </div>
      
      {/* Rows */}
      {filteredItems.map((item) => {
        const isEditing = editingItem === item.id;
        return (
        <div 
          key={item.id} 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 80px', 
            padding: '1rem', 
            borderBottom: '1px solid #f3f4f6',
            fontSize: '14px',
            backgroundColor: isEditing ? '#f0f9ff' : 'transparent'
          }}
        >
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {item.supplier} • {item.location}
            </div>
          </div>
          <div>
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: item.center === 'central' ? '#f3e8ff' : 
                             item.center === 'sevilla' ? '#fef3c7' :
                             item.center === 'jerez' ? '#dbeafe' : '#dcfce7',
              color: item.center === 'central' ? '#7c3aed' : 
                     item.center === 'sevilla' ? '#f59e0b' :
                     item.center === 'jerez' ? '#3b82f6' : '#059669'
            }}>
              {item.center === 'sevilla' ? '🏪 Sevilla' :
               item.center === 'jerez' ? '🏪 Jerez' :
               item.center === 'puerto' ? '🏪 Puerto' : '🏢 Central'}
            </span>
          </div>
          <div style={{ color: '#374151' }}>{item.category}</div>
          <div>
            {isEditing ? (
              <input
                type="number"
                value={editValues.cantidad_actual || ''}
                onChange={(e) => setEditValues((prev: any) => ({ ...prev, cantidad_actual: Number(e.target.value) || 0 }))}
                style={{
                  width: '60px',
                  padding: '4px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <span style={{ fontWeight: '600', color: item.quantity === 0 ? '#dc2626' : '#374151' }}>
                {item.quantity}
              </span>
            )}
          </div>
          <div>
            {isEditing ? (
              <input
                type="number"
                value={editValues.min_stock || ''}
                onChange={(e) => {
                  const newValue = Number(e.target.value) || 0;
                  console.log('📝 Cambiando min_stock:', e.target.value, '→', newValue);
                  setEditValues((prev: any) => ({ ...prev, min_stock: newValue }));
                }}
                style={{
                  width: '50px',
                  padding: '4px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <span style={{ color: '#6b7280' }}>{item.min_stock}</span>
            )}
          </div>
          <div>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={editValues.precio_compra || ''}
                onChange={(e) => setEditValues((prev: any) => ({ ...prev, precio_compra: Number(e.target.value) || 0 }))}
                style={{
                  width: '70px',
                  padding: '4px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <span style={{ color: '#dc2626', fontWeight: '600' }}>€{item.purchase_price.toFixed(2)}</span>
            )}
          </div>
          <div>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={editValues.precio_venta || ''}
                onChange={(e) => setEditValues((prev: any) => ({ ...prev, precio_venta: Number(e.target.value) || 0 }))}
                style={{
                  width: '70px',
                  padding: '4px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <span style={{ color: '#059669', fontWeight: '600' }}>€{item.sale_price.toFixed(2)}</span>
            )}
          </div>
          <div>
            <span style={{ 
              padding: '4px 8px', 
              borderRadius: '6px', 
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: item.status === 'in_stock' ? '#dcfce7' : 
                             item.status === 'low_stock' ? '#fef3c7' : '#fee2e2',
              color: item.status === 'in_stock' ? '#166534' : 
                     item.status === 'low_stock' ? '#92400e' : '#dc2626'
            }}>
              {item.status === 'in_stock' ? '✅ Stock' : 
               item.status === 'low_stock' ? '⚠️ Bajo' : '❌ Agotado'}
            </span>
          </div>
          
          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {isEditing ? (
              <>
                <button
                  onClick={() => saveChanges(item.id)}
                  style={{
                    padding: '4px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Guardar"
                >
                  <Save size={14} />
                </button>
                <button
                  onClick={cancelEditing}
                  style={{
                    padding: '4px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Cancelar"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => startEditing(item)}
                  style={{
                    padding: '4px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Editar"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => deleteItem(item.id, item.name)}
                  style={{
                    padding: '4px',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
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
