import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UniformRequest {
  id: number;
  employee_name: string;
  location: string;
  reason: string;
  status: string;
  items: any[];
  requested_at: string;
}

const UniformRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<UniformRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('uniform_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (!error && data) {
        setRequests(data);
        console.log('✅ Solicitudes cargadas:', data.length);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      // Primero obtener los detalles de la solicitud
      const { data: request } = await supabase
        .from('uniform_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (!request) {
        alert('Error: No se encontró la solicitud');
        return;
      }

      // Actualizar estado de la solicitud
      await supabase
        .from('uniform_requests')
        .update({ 
          status, 
          approved_by: 'Logística',
          approved_at: new Date().toISOString()
        })
        .eq('id', id);
      
      // Si se aprueba, actualizar el inventario
      if (status === 'approved' && request.items) {
        console.log('📦 Actualizando inventario para items aprobados:', request.items);
        
        for (const item of request.items) {
          // Verificar si es un ID numérico válido (items de Supabase)
          const itemId = parseInt(item.itemId);
          if (isNaN(itemId) || itemId > 9000) {
            console.log(`⚠️ Saltando item empresarial: ${item.itemName} (ID: ${item.itemId})`);
            continue;
          }

          // Buscar el item en el inventario
          const { data: inventoryItem } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('id', itemId)
            .single();

          if (inventoryItem) {
            const newQuantity = Math.max(0, inventoryItem.cantidad_actual - item.quantity);
            
            // Actualizar cantidad en Supabase
            await supabase
              .from('inventory_items')
              .update({ 
                cantidad_actual: newQuantity,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.itemId);
            
            console.log(`✅ Actualizado ${item.itemName}: ${inventoryItem.cantidad_actual} → ${newQuantity}`);
          }
        }
      }
      
      await loadRequests();
      alert(`Solicitud ${status === 'approved' ? 'aprobada y stock actualizado' : 'rechazada'}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    }
  };

  if (loading) return <div>Cargando solicitudes...</div>;

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white'
      }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Package size={24} />
          Solicitudes de Uniformes ({pendingRequests.length} pendientes)
        </h2>
      </div>

      {pendingRequests.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px' }}>
          <p>No hay solicitudes pendientes</p>
        </div>
      ) : (
        pendingRequests.map(request => (
          <div key={request.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <User size={16} />
                  <strong>{request.employee_name}</strong>
                  <span style={{ color: '#6b7280' }}>({request.location})</span>
                </div>
                <div style={{ margin: '8px 0', fontSize: '14px' }}>
                  <strong>Artículos solicitados:</strong>
                  {request.items && request.items.length > 0 ? (
                    <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                      {request.items.map((item: any, idx: number) => (
                        <li key={idx} style={{ fontSize: '13px', color: '#374151' }}>
                          {item.quantity}x {item.itemName}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: '#6b7280' }}> Sin items</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  {new Date(request.requested_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => updateStatus(request.id, 'approved')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <CheckCircle size={14} />
                  Aprobar
                </button>
                <button
                  onClick={() => updateStatus(request.id, 'rejected')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <XCircle size={14} />
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UniformRequestsPanel;
