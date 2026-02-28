import React, { useState } from 'react';
import { AlertTriangle, Package, RefreshCw } from 'lucide-react';
import { LocationType } from '../../types/logistics';
import { useInventoryIntegration } from '../../hooks/useInventoryIntegration';
import { ui } from '../../utils/ui';


interface Props {
  userLocation: LocationType;
  userEmail: string;
}

export const InventoryChecklistIntegration: React.FC<Props> = ({
  userLocation,
  userEmail
}) => {
  const { stats, handleChecklistIncident, refreshData } = useInventoryIntegration(userLocation, userEmail);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ itemName: '', quantity: 1, reason: '' });

  const availableItems = ['Goma Elástica 3cm', 'Mancuerna 5kg', 'Desinfectante Multiusos'];

  const handleSubmit = async () => {
    if (!form.itemName || !form.reason) return;
    
    const result = await handleChecklistIncident({
      itemName: form.itemName,
      quantity: form.quantity,
      reason: form.reason,
      reportedBy: userEmail
    });

    if (result.success) {
      ui.success('✅ Inventario actualizado automáticamente');
      setForm({ itemName: '', quantity: 1, reason: '' });
      setShowForm(false);
    } else {
      ui.error(`❌ Error: ${result.message}`);
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Check-list Integrado</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={refreshData} style={{ padding: '0.75rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px' }}>
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowForm(true)} style={{ padding: '0.75rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px' }}>
            <AlertTriangle size={16} /> Reportar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <Package size={20} style={{ color: '#059669' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalItems}</div>
          <div>Total Artículos</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <AlertTriangle size={20} style={{ color: '#d97706' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.lowStockItems}</div>
          <div>Stock Bajo</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.outOfStockItems}</div>
          <div>Sin Stock</div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Nueva Incidencia</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '1rem' }}>
            <select value={form.itemName} onChange={(e) => setForm(prev => ({ ...prev, itemName: e.target.value }))}>
              <option value="">Seleccionar artículo</option>
              {availableItems.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <input type="number" value={form.quantity} onChange={(e) => setForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} />
            <button onClick={handleSubmit} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '0.75rem' }}>
              Reportar
            </button>
          </div>
          <textarea 
            value={form.reason} 
            onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Describe la incidencia..."
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </div>
      )}
    </div>
  );
};
