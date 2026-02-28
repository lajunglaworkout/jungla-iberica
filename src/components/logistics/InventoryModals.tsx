import React from 'react';
import { InventoryItem } from './types';

// ==================== NEW PRODUCT MODAL ====================

interface NewProduct {
  name: string;
  category: string;
  size: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  purchase_price: number;
  sale_price: number;
  supplier: string;
  center: 'central' | 'sevilla' | 'jerez' | 'puerto';
  location: string;
}

interface NewProductModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newProduct: NewProduct;
  setNewProduct: (fn: (prev: NewProduct) => NewProduct) => void;
  productMode: 'predefined' | 'custom';
  setProductMode: (mode: 'predefined' | 'custom') => void;
  selectedProductType: string;
  setSelectedProductType: (v: string) => void;
  productsByCategory: Record<string, Array<{ name: string; sizes: string[]; price: number }>>;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  show, onClose, onSubmit, newProduct, setNewProduct,
  productMode, setProductMode, selectedProductType, setSelectedProductType, productsByCategory,
}) => {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflow: 'auto' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', margin: '2rem', position: 'relative' }}>
        <h2 style={{ margin: '0 0 1.5rem 0' }}>Nuevo Producto</h2>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Selector de Modo */}
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>🎯 Tipo de Producto</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="productMode" value="predefined" checked={productMode === 'predefined'}
                  onChange={() => { setProductMode('predefined'); setNewProduct((prev) => ({ ...prev, name: '', category: 'Vestuario', size: '' })); setSelectedProductType(''); }} />
                <span>📦 Producto Predefinido</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="productMode" value="custom" checked={productMode === 'custom'}
                  onChange={() => { setProductMode('custom'); setNewProduct((prev) => ({ ...prev, name: '', category: '', size: '' })); setSelectedProductType(''); }} />
                <span>✏️ Producto Personalizado</span>
              </label>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              {productMode === 'predefined' ? 'Selecciona de productos conocidos con precios y tallas predefinidas' : 'Crea un producto completamente nuevo con nombre y especificaciones personalizadas'}
            </p>
          </div>

          {productMode === 'custom' && (
            <input type="text" placeholder="Nombre del producto (ej: Camiseta Técnica Personalizada)"
              value={newProduct.name} onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
              style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: productMode === 'predefined' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <select value={newProduct.category}
              onChange={(e) => { const category = e.target.value; setNewProduct((prev) => ({ ...prev, category })); setSelectedProductType(''); }}
              style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
              <option value="">Seleccionar categoría...</option>
              <optgroup label="📦 Material Deportivo">
                <option value="Mancuernas">🏋️ Mancuernas</option>
                <option value="Cardio">🏃 Cardio</option>
                <option value="Discos">💿 Discos</option>
                <option value="Kettlebells">🔔 Kettlebells</option>
                <option value="Gomas">🎯 Gomas</option>
                <option value="Barras">📏 Barras</option>
                <option value="Pelotas">⚽ Pelotas</option>
                <option value="Sacos">🥊 Sacos</option>
                <option value="Funcional">🤸 Funcional</option>
                <option value="Accesorios">🔧 Accesorios</option>
              </optgroup>
              <optgroup label="🏢 Categorías Empresariales">
                <option value="Vestuario">👕 Vestuario</option>
                <option value="Merchandising">🎁 Merchandising</option>
                <option value="Consumibles">🧽 Consumibles</option>
                <option value="Instalaciones">🏢 Instalaciones</option>
                <option value="Limpieza">🧼 Limpieza</option>
              </optgroup>
              {productMode === 'custom' && (
                <optgroup label="🏢 Otras Categorías">
                  <option value="Oficina">📄 Oficina</option>
                  <option value="Tecnología">💻 Tecnología</option>
                  <option value="Otros">📦 Otros</option>
                </optgroup>
              )}
            </select>

            {newProduct.category && productMode === 'predefined' && (
              <select value={selectedProductType}
                onChange={(e) => {
                  const productType = e.target.value;
                  setSelectedProductType(productType);
                  const product = productsByCategory[newProduct.category as keyof typeof productsByCategory]?.find((p) => p.name === productType);
                  if (product) { setNewProduct((prev) => ({ ...prev, name: product.name, purchase_price: product.price, size: '' })); }
                }}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
                <option value="">Seleccionar producto...</option>
                {productsByCategory[newProduct.category as keyof typeof productsByCategory]?.map((product) => (
                  <option key={product.name} value={product.name}>{product.name}</option>
                ))}
              </select>
            )}
          </div>

          {((productMode === 'predefined' && selectedProductType) || productMode === 'custom') && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>📏 Talla/Tamaño</label>
              {productMode === 'predefined' ? (
                <select value={newProduct.size} onChange={(e) => setNewProduct((prev) => ({ ...prev, size: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }}>
                  <option value="">Seleccionar talla/tamaño...</option>
                  {productsByCategory[newProduct.category as keyof typeof productsByCategory]?.find((p) => p.name === selectedProductType)?.sizes.map((size: string) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              ) : (
                <input type="text" placeholder="Ej: M, L, 5kg, 750ml, Pack 10..." value={newProduct.size}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, size: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
              )}
            </div>
          )}

          <select value={newProduct.center} onChange={(e) => setNewProduct((prev) => ({ ...prev, center: e.target.value as NewProduct['center'] }))}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
            <option value="sevilla">🏪 Sevilla</option>
            <option value="jerez">🏪 Jerez</option>
            <option value="puerto">🏪 Puerto</option>
            <option value="central">🏢 Central</option>
          </select>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>🏭 Proveedor</label>
            <input type="text" placeholder="Ej: Textiles Deportivos SL" value={newProduct.supplier}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, supplier: e.target.value }))}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>📍 Ubicación Física</label>
              <input type="text" placeholder="Ej: A1, B2, M1" value={newProduct.location}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, location: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>📦 Cantidad Inicial</label>
              <input type="number" placeholder="0" value={newProduct.quantity}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} min="0" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#f59e0b' }}>⚠️ Stock Mínimo</label>
              <input type="number" placeholder="0" value={newProduct.min_stock}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, min_stock: parseInt(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} min="0" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>📊 Stock Máximo</label>
              <input type="number" placeholder="0" value={newProduct.max_stock}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, max_stock: parseInt(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} min="0" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#dc2626' }}>💰 Precio de Compra (€)</label>
              <input type="number" step="0.01" placeholder="0.00" value={newProduct.purchase_price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#059669' }}>💵 Precio de Venta (€)</label>
              <input type="number" step="0.01" placeholder="0.00" value={newProduct.sale_price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={onSubmit} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Crear Producto
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== EDIT PRODUCT MODAL ====================

interface EditProductModalProps {
  show: boolean;
  editingProduct: InventoryItem | null;
  onClose: () => void;
  onSubmit: () => void;
  setEditingProduct: (fn: (prev: InventoryItem | null) => InventoryItem | null) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  show, editingProduct, onClose, onSubmit, setEditingProduct
}) => {
  if (!show || !editingProduct) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
        <h2 style={{ margin: '0 0 1.5rem 0' }}>✏️ Editar: {editingProduct.name}</h2>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>📦 Cantidad Actual</label>
            <input type="number" placeholder="0" value={editingProduct.quantity}
              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, quantity: parseInt(e.target.value) || 0 } : null)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} min="0" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>📍 Ubicación Física</label>
            <input type="text" placeholder="Ej: A1, B2, M1" value={editingProduct.location}
              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, location: e.target.value } : null)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#dc2626' }}>💰 Precio de Compra (€)</label>
              <input type="number" step="0.01" placeholder="0.00" value={editingProduct.purchase_price}
                onChange={(e) => setEditingProduct(prev => prev ? { ...prev, purchase_price: parseFloat(e.target.value) || 0 } : null)}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#059669' }}>💵 Precio de Venta (€)</label>
              <input type="number" step="0.01" placeholder="0.00" value={editingProduct.sale_price}
                onChange={(e) => setEditingProduct(prev => prev ? { ...prev, sale_price: parseFloat(e.target.value) || 0 } : null)}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={onSubmit} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
