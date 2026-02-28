import React from 'react';
import { Search } from 'lucide-react';
import { Tool, ToolLocation, InventoryItem, LogisticsUser } from './types';
import { ui } from '../../utils/ui';
import ProductCard from './ProductCard';

// ==================== NEW TOOL MODAL ====================

interface NewToolModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newTool: {
    name: string;
    category: Tool['category'];
    brand: string;
    model: string;
    serial_number: string;
    purchase_date: string;
    purchase_price: number;
    current_location: string;
    status: Tool['status'];
    condition: Tool['condition'];
    assigned_to: string;
    notes: string;
  };
  setNewTool: (tool: NewToolModalProps["newTool"]) => void;
  toolLocations: ToolLocation[];
}

export const NewToolModal: React.FC<NewToolModalProps> = ({
  show, onClose, onSubmit, newTool, setNewTool, toolLocations
}) => {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '700' }}>🔧 Nueva Herramienta</h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre *</label>
          <input type="text" value={newTool.name} onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} placeholder="Ej: Aspiradora Industrial" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Marca *</label>
            <input type="text" value={newTool.brand} onChange={(e) => setNewTool({ ...newTool, brand: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} placeholder="Ej: Kärcher" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Modelo *</label>
            <input type="text" value={newTool.model} onChange={(e) => setNewTool({ ...newTool, model: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} placeholder="Ej: NT 70/2" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Categoría</label>
            <select value={newTool.category} onChange={(e) => setNewTool({ ...newTool, category: e.target.value as Tool['category'] })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
              <option value="Limpieza">🧽 Limpieza</option>
              <option value="Mantenimiento">🔧 Mantenimiento</option>
              <option value="Seguridad">🛡️ Seguridad</option>
              <option value="Deportivo">🏋️ Deportivo</option>
              <option value="Oficina">💻 Oficina</option>
              <option value="Electrónico">⚡ Electrónico</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Ubicación Inicial *</label>
            <select value={newTool.current_location} onChange={(e) => setNewTool({ ...newTool, current_location: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
              {toolLocations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.type === 'permanent' ? '🏢' : location.type === 'center' ? '🏪' : location.type === 'temporary' ? '🔧' : '📦'} {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Precio de Compra (€)</label>
            <input type="number" step="0.01" min="0" value={newTool.purchase_price}
              onChange={(e) => setNewTool({ ...newTool, purchase_price: parseFloat(e.target.value) || 0 })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} placeholder="0.00" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Número de Serie</label>
            <input type="text" value={newTool.serial_number} onChange={(e) => setNewTool({ ...newTool, serial_number: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} placeholder="Opcional" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={onSubmit} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Crear</button>
        </div>
      </div>
    </div>
  );
};

// ==================== MOVE TOOL MODAL ====================

interface MoveToolModalProps {
  show: boolean;
  selectedTool: Tool | null;
  toolLocations: ToolLocation[];
  onClose: () => void;
  onMove: () => void;
}

export const MoveToolModal: React.FC<MoveToolModalProps> = ({
  show, selectedTool, toolLocations, onClose, onMove
}) => {
  if (!show || !selectedTool) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '700' }}>📍 Mover {selectedTool.name}</h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nueva Ubicación</label>
          <select id="new-location" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
            <option value="">Seleccionar...</option>
            {toolLocations.filter(loc => loc.id !== selectedTool.current_location).map(location => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Motivo</label>
          <select id="move-reason" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
            <option value="">Seleccionar...</option>
            <option value="transfer">Transferencia</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="loan">Préstamo</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={onMove} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Mover</button>
        </div>
      </div>
    </div>
  );
};

// ==================== PRODUCT SELECTOR MODAL ====================

interface ProductSelectorModalProps {
  show: boolean;
  onClose: () => void;
  inventoryItems: InventoryItem[];
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  productSearchTerm: string;
  setProductSearchTerm: (v: string) => void;
  newOrderItems: Array<{ product_id: number; product_name: string; quantity: number; unit_price: number }>;
  onAddToOrder: (product: InventoryItem, quantity: number, unitPrice: number) => void;
  currentUser: LogisticsUser;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  show, onClose, inventoryItems, selectedCategory, setSelectedCategory, productSearchTerm, setProductSearchTerm, newOrderItems, onAddToOrder, currentUser
}) => {
  if (!show) return null;

  const getUniqueCategories = () => [...new Set(inventoryItems.map(item => item.category))].sort();

  const getFilteredProducts = () => {
    let filtered = inventoryItems;
    if (selectedCategory !== 'all') filtered = filtered.filter(item => item.category === selectedCategory);
    if (productSearchTerm.trim()) {
      const searchLower = productSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(item =>
        (item.nombre_item || item.name || '').toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.supplier.toLowerCase().includes(searchLower) ||
        item.size.toLowerCase().includes(searchLower) ||
        (item.location && item.location.toLowerCase().includes(searchLower))
      );
    }
    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>📦 Seleccionar Productos</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        {/* Buscador */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Buscar Productos</label>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input type="text" placeholder="Buscar por nombre, categoría, proveedor, talla..."
              value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem' }} />
            {productSearchTerm && (
              <button onClick={() => setProductSearchTerm('')}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            )}
          </div>
          {productSearchTerm && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{filteredProducts.length} producto(s) encontrado(s)</div>}
        </div>

        {/* Filtro por categorías */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>Filtrar por Categoría</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => { setSelectedCategory('all'); setProductSearchTerm(''); }}
              style={{ padding: '0.5rem 1rem', backgroundColor: selectedCategory === 'all' && !productSearchTerm ? '#059669' : '#f3f4f6', color: selectedCategory === 'all' && !productSearchTerm ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
              🔍 Todos
            </button>
            {getUniqueCategories().map(category => (
              <button key={category} onClick={() => { setSelectedCategory(category); setProductSearchTerm(''); }}
                style={{ padding: '0.5rem 1rem', backgroundColor: selectedCategory === category && !productSearchTerm ? '#059669' : '#f3f4f6', color: selectedCategory === category && !productSearchTerm ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
                {category === 'Vestuario' ? '👕' : category === 'Material Deportivo' ? '🏋️' : category === 'Merchandising' ? '🎁' : category === 'Consumibles' ? '🧽' : '📦'} {category}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de productos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToOrder={onAddToOrder}
              isAlreadyAdded={newOrderItems.some(item => item.product_id === product.id)} userRole={currentUser.role} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <p style={{ margin: 0, fontSize: '1rem' }}>
              {productSearchTerm ? `No se encontraron productos para "${productSearchTerm}"` : `No hay productos en esta categoría`}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
