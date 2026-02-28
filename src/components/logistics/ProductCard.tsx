import React, { useState } from 'react';
import { InventoryItem } from './types';

interface ProductCardProps {
  product: InventoryItem;
  onAddToOrder: (product: InventoryItem, quantity: number, unitPrice: number) => void;
  isAlreadyAdded: boolean;
  userRole: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToOrder, isAlreadyAdded, userRole }) => {
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(product.sale_price || product.purchase_price || 0);

  const canEditPrice = userRole === 'ceo' || userRole === 'logistics_director' || userRole === 'admin';

  const getStockStatusColor = () => {
    if (product.status === 'out_of_stock') return '#dc2626';
    if (product.status === 'low_stock') return '#d97706';
    return '#059669';
  };

  const getStockStatusText = () => {
    if (product.status === 'out_of_stock') return '❌ Sin Stock';
    if (product.status === 'low_stock') return '⚠️ Stock Bajo';
    return '✅ En Stock';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '1.5rem',
      position: 'relative'
    }}>
      {isAlreadyAdded && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          backgroundColor: '#059669',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          ✓ Añadido
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
          {product.name}
        </h4>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          {product.category} • {product.size} • {product.supplier}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: getStockStatusColor(),
          fontWeight: '600',
          marginBottom: '0.5rem'
        }}>
          {getStockStatusText()} ({product.quantity} disponibles)
        </div>
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          Precio: €{product.sale_price?.toFixed(2) || product.purchase_price?.toFixed(2) || '0.00'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            max={product.quantity}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            Precio € {!canEditPrice && <span style={{ color: '#6b7280' }}>(Fijo)</span>}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={unitPrice}
            onChange={(e) => canEditPrice && setUnitPrice(parseFloat(e.target.value) || 0)}
            readOnly={!canEditPrice}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: canEditPrice ? 'white' : '#f9fafb',
              color: canEditPrice ? '#374151' : '#6b7280',
              cursor: canEditPrice ? 'text' : 'not-allowed'
            }}
          />
          {!canEditPrice && (
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '0.25rem',
              fontStyle: 'italic'
            }}>
              💼 Solo directivos pueden modificar precios
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onAddToOrder(product, quantity, unitPrice)}
        disabled={isAlreadyAdded || product.quantity === 0 || quantity > product.quantity}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: isAlreadyAdded || product.quantity === 0 || quantity > product.quantity ? '#9ca3af' : '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isAlreadyAdded || product.quantity === 0 || quantity > product.quantity ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '0.875rem'
        }}
      >
        {isAlreadyAdded ? 'Ya Añadido' :
          product.quantity === 0 ? 'Sin Stock' :
            quantity > product.quantity ? 'Cantidad Excesiva' :
              `Añadir (€${(quantity * unitPrice).toFixed(2)})`}
      </button>
    </div>
  );
};

export default ProductCard;
