import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Supplier } from './types';
import { ui } from '../../utils/ui';

interface SuppliersTabProps {
  filteredSuppliers: Supplier[];
  onDeleteSupplier: (supplierId: number) => void;
  onSupplierClick: (supplier: Supplier) => void;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({
  filteredSuppliers,
  onDeleteSupplier,
  onSupplierClick,
}) => {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Directorio de Proveedores</h2>
        <button
          onClick={() => ui.info('Funcionalidad próximamente')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          <Plus size={16} />
          Nuevo Proveedor
        </button>
      </div>

      {/* Tabla de Proveedores */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 80px', backgroundColor: '#f9fafb', padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
          <div>Proveedor</div>
          <div>Tipo</div>
          <div>Contacto</div>
          <div>Rating</div>
          <div>Total Pedidos</div>
          <div>Acciones</div>
        </div>

        {filteredSuppliers.map((supplier: Supplier) => (
          <div
            key={supplier.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 80px',
              padding: '1rem',
              borderBottom: '1px solid #f3f4f6',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div>
              <div style={{ fontWeight: '600' }}>{supplier.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {supplier.category.slice(0, 2).join(', ')}
                {supplier.category.length > 2 && ` +${supplier.category.length - 2}`}
              </div>
            </div>
            <div>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                backgroundColor: supplier.type === 'local' ? '#dcfce7' : supplier.type === 'nacional' ? '#dbeafe' : '#f3e8ff',
                color: supplier.type === 'local' ? '#166534' : supplier.type === 'nacional' ? '#1e40af' : '#7c3aed'
              }}>
                {supplier.type === 'local' ? '🏠 Local' : supplier.type === 'nacional' ? '🇪🇸 Nacional' : '🌍 Internacional'}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem' }}>{supplier.contact_person}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{supplier.city}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: '#f59e0b' }}>⭐</span>
                <span style={{ fontWeight: '600' }}>{supplier.rating}</span>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>{supplier.total_orders}</div>
              <div style={{ fontSize: '0.75rem', color: '#059669' }}>€{supplier.total_amount.toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const confirmDelete = await ui.confirm(
                    `¿Estás seguro de que quieres eliminar el proveedor "${supplier.name}"?\n\nEsta acción no se puede deshacer.`
                  );
                  if (confirmDelete) {
                    onDeleteSupplier(supplier.id);
                  }
                }}
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
                title="Eliminar proveedor"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuppliersTab;
