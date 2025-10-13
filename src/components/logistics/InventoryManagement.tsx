import React, { useEffect, useMemo, useState } from 'react';
import { Package, Plus, Search, AlertTriangle } from 'lucide-react';
import { InventoryItem, LocationType, ItemCategory } from '../../types/logistics';
import { INVENTORY_CATEGORIES, getCategoryIcon } from '../../config/logistics';

interface InventoryManagementProps {
  userLocation?: LocationType;
  canEdit?: boolean;
  visibleCategories?: ItemCategory[];
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  userLocation = 'central',
  canEdit = true,
  visibleCategories
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');

  const allowedCategories = useMemo<ItemCategory[]>(() => {
    return visibleCategories ?? (INVENTORY_CATEGORIES.map(cat => cat.id as ItemCategory));
  }, [visibleCategories]);

  useEffect(() => {
    if (selectedCategory !== 'all' && !allowedCategories.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [allowedCategories, selectedCategory]);

  // Datos de ejemplo simplificados
  const mockItems = [
    {
      id: 'item-001',
      name: 'Goma Elástica 3cm',
      category: 'material_deportivo' as ItemCategory,
      sku: 'GE-3CM-001',
      purchasePrice: 8.50,
      salePrice: 15.00,
      centralStock: 50,
      sevillaStock: 3,
      minStock: 5,
      isLowStock: true
    },
    {
      id: 'item-002',
      name: 'Mancuerna 5kg',
      category: 'material_deportivo' as ItemCategory,
      sku: 'MAN-5KG-001',
      purchasePrice: 12.00,
      salePrice: 25.00,
      centralStock: 30,
      sevillaStock: 12,
      minStock: 8,
      isLowStock: false
    },
    {
      id: 'item-101',
      name: 'Camiseta Oficial La Jungla',
      category: 'vestuario' as ItemCategory,
      sku: 'VEST-CAM-001',
      purchasePrice: 9.50,
      salePrice: 19.90,
      centralStock: 120,
      sevillaStock: 24,
      minStock: 15,
      isLowStock: false
    },
    {
      id: 'item-102',
      name: 'Pantalón Técnico',
      category: 'vestuario' as ItemCategory,
      sku: 'VEST-PAN-002',
      purchasePrice: 14.00,
      salePrice: 28.00,
      centralStock: 80,
      sevillaStock: 10,
      minStock: 12,
      isLowStock: true
    },
    {
      id: 'item-103',
      name: 'Chaqueta Corta Viento',
      category: 'vestuario' as ItemCategory,
      sku: 'VEST-CHA-003',
      purchasePrice: 22.00,
      salePrice: 45.00,
      centralStock: 50,
      sevillaStock: 8,
      minStock: 6,
      isLowStock: false
    }
  ];

  const filteredItems = mockItems
    .filter(item => allowedCategories.includes(item.category))
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold' }}>
          Gestión de Inventario
        </h1>
        {canEdit && (
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            <Plus size={16} />
            Nuevo Artículo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', minWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ItemCategory | 'all')}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Todas las categorías</option>
          {allowedCategories.map(categoryId => {
            const categoryConfig = INVENTORY_CATEGORIES.find(cat => cat.id === categoryId);
            if (!categoryConfig) return null;
            return (
              <option key={categoryConfig.id} value={categoryConfig.id}>
                {categoryConfig.icon} {categoryConfig.name}
              </option>
            );
          })}
        </select>
      </div>

      {/* Lista de artículos */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>
            <div>Artículo</div>
            <div>Categoría</div>
            <div>Stock Central</div>
            <div>Stock Sevilla</div>
            <div>Precio</div>
          </div>
        </div>

        {filteredItems.map(item => (
          <div key={item.id} style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>SKU: {item.sku}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{getCategoryIcon(item.category)}</span>
                <span style={{ fontSize: '0.875rem' }}>
                  {INVENTORY_CATEGORIES.find(cat => cat.id === item.category)?.name}
                </span>
              </div>

              <div>
                <div style={{ fontWeight: '600' }}>{item.centralStock}</div>
                <div style={{ fontSize: '0.75rem', color: '#059669' }}>Stock OK</div>
              </div>

              <div>
                <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.sevillaStock}
                  {item.isLowStock && <AlertTriangle size={14} style={{ color: '#d97706' }} />}
                </div>
                <div style={{ fontSize: '0.75rem', color: item.isLowStock ? '#d97706' : '#059669' }}>
                  {item.isLowStock ? 'Stock bajo' : 'Stock OK'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>€{item.salePrice}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Compra: €{item.purchasePrice}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
