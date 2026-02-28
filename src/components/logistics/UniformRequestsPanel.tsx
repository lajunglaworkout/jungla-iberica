import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, User, Truck, AlertTriangle, Clock, Search } from 'lucide-react';
import { getUniformRequests, processUniformRequestUpdate } from '../../services/hrService';
import { useSession } from '../../contexts/SessionContext';
import { ui } from '../../utils/ui';


interface UniformItem {
  name?: string;
  quantity?: number;
  size?: string;
  [key: string]: unknown;
}
interface UniformRequest {
  id: number;
  employee_name: string;
  location: string;
  reason: string;
  status: 'pending' | 'approved' | 'shipped' | 'awaiting_confirmation' | 'confirmed' | 'disputed' | 'rejected';
  items: UniformItem[];
  requested_at: string;
  shipped_at?: string;
  confirmed_at?: string;
  dispute_reason?: string;
  notes?: string;
}

const STATUS_FILTERS = [
  { key: 'pending', label: 'Pendientes', icon: '🟡', color: '#f59e0b' },
  { key: 'approved', label: 'Aprobados', icon: '🔵', color: '#3b82f6' },
  { key: 'shipped', label: 'Envíos', icon: '🟣', color: '#8b5cf6' },
  { key: 'problem', label: 'Incidencias', icon: '🔴', color: '#ef4444' },
  { key: 'history', label: 'Historial', icon: '⚫', color: '#6b7280' },
];

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }> = {
  pending: { bg: '#fef3c7', color: '#92400e', label: 'Pendiente', Icon: Clock },
  approved: { bg: '#dbeafe', color: '#1e40af', label: 'Aprobado', Icon: CheckCircle },
  shipped: { bg: '#ede9fe', color: '#6d28d9', label: 'Enviado', Icon: Truck },
  awaiting_confirmation: { bg: '#ffedd5', color: '#9a3412', label: 'Esperando Conf.', Icon: Clock },
  confirmed: { bg: '#dcfce7', color: '#166534', label: 'Entregado', Icon: CheckCircle },
  disputed: { bg: '#fee2e2', color: '#991b1b', label: 'Incidencia', Icon: AlertTriangle },
  rejected: { bg: '#f3f4f6', color: '#374151', label: 'Rechazado', Icon: XCircle },
};

const UniformRequestsPanel: React.FC = () => {
  const { employee } = useSession();
  const [requests, setRequests] = useState<UniformRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getUniformRequests();
      setRequests(data as UniformRequest[]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string, additionalData: Record<string, unknown> = {}) => {
    try {
      const currentRequest = requests.find(r => r.id === id);
      if (!currentRequest) return;

      const result = await processUniformRequestUpdate(
        id, status, additionalData, currentRequest.items, currentRequest.status
      );
      if (!result.success) throw new Error(result.error);
      await loadRequests();
    } catch (error) {
      console.error(error);
      ui.error('Error actualizando estado');
    }
  };

  const handleMarkAsShipped = async (id: number) => {
    await updateStatus(id, 'shipped', {
      shipped_at: new Date().toISOString(),
      shipped_by: employee?.name || 'Logística'
    });
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'pending') return req.status === 'pending';
    if (filterStatus === 'approved') return req.status === 'approved';
    if (filterStatus === 'shipped') return req.status === 'shipped' || req.status === 'awaiting_confirmation';
    if (filterStatus === 'problem') return req.status === 'disputed';
    if (filterStatus === 'history') return req.status === 'confirmed' || req.status === 'rejected';
    return true;
  });

  // Count by status for badges
  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    shipped: requests.filter(r => r.status === 'shipped' || r.status === 'awaiting_confirmation').length,
    problem: requests.filter(r => r.status === 'disputed').length,
    history: requests.filter(r => r.status === 'confirmed' || r.status === 'rejected').length,
  };

  const getStatusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return null;
    const { bg, color, label, Icon } = cfg;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
        backgroundColor: bg, color: color
      }}>
        <Icon size={12} /> {label}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '12px' }}>
            <Package size={22} style={{ color: '#059669' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#1f2937' }}>
              Solicitudes de Vestuario
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '2px 0 0 0' }}>
              {requests.length} solicitud(es) total · {statusCounts.pending} pendiente(s)
            </p>
          </div>
        </div>
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => {
          const count = statusCounts[f.key as keyof typeof statusCounts] || 0;
          const isActive = filterStatus === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                fontSize: '0.8rem', fontWeight: isActive ? '700' : '500',
                backgroundColor: isActive ? '#059669' : '#f3f4f6',
                color: isActive ? 'white' : '#4b5563',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{f.icon}</span>
              {f.label}
              {count > 0 && (
                <span style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e5e7eb',
                  padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700',
                  color: isActive ? 'white' : '#374151'
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Buscar por empleado o centro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px 10px 36px',
            border: '1px solid #e5e7eb', borderRadius: '10px',
            fontSize: '0.875rem', color: '#374151',
            outline: 'none', boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '0.9rem' }}>
          Cargando solicitudes...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          backgroundColor: '#f9fafb', borderRadius: '12px',
          border: '2px dashed #e5e7eb'
        }}>
          <Package size={40} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.3, color: '#9ca3af' }} />
          <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#6b7280', margin: '0 0 4px 0' }}>Sin solicitudes</p>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>No hay solicitudes en esta sección.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredRequests.map(req => (
            <div
              key={req.id}
              style={{
                border: '1px solid #e5e7eb', borderRadius: '14px',
                overflow: 'hidden', transition: 'box-shadow 0.2s',
                backgroundColor: '#fafbfc'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Request Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 18px',
                backgroundColor: 'white', borderBottom: '1px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    backgroundColor: '#f0fdf4', border: '1px solid #d1fae5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <User size={18} style={{ color: '#059669' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1f2937' }}>
                      {req.employee_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      📍 {req.location} · 📅 {new Date(req.requested_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                {getStatusBadge(req.status)}
              </div>

              {/* Request Body */}
              <div style={{ padding: '14px 18px' }}>
                {/* Items Table */}
                <div style={{ marginBottom: req.notes || req.reason ? '12px' : '0' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Artículos solicitados
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {req.items?.map((item: UniformItem, idx: number) => (
                      <div key={idx} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', backgroundColor: 'white',
                        borderRadius: '8px', border: '1px solid #e5e7eb'
                      }}>
                        <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1f2937' }}>
                          {item.itemName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px',
                            backgroundColor: '#f3f4f6', color: '#374151', fontWeight: '500'
                          }}>
                            Talla: {item.size}
                          </span>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: '700', color: '#059669',
                            backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '6px'
                          }}>
                            ×{item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes & Reason */}
                {req.notes && (
                  <div style={{
                    padding: '8px 12px', backgroundColor: '#fffbeb',
                    borderRadius: '8px', border: '1px solid #fef3c7',
                    fontSize: '0.8rem', color: '#92400e', marginBottom: '6px'
                  }}>
                    📝 <span style={{ fontWeight: '600' }}>Nota:</span> {req.notes}
                  </div>
                )}
                {req.reason && (
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Motivo: {req.reason === 'reposicion' ? 'Reposición' : 'Compra'}
                  </div>
                )}

                {/* Dispute detail */}
                {req.status === 'disputed' && req.dispute_reason && (
                  <div style={{
                    padding: '10px 14px', backgroundColor: '#fef2f2',
                    borderRadius: '8px', border: '1px solid #fecaca',
                    fontSize: '0.85rem', color: '#991b1b', fontWeight: '500',
                    marginTop: '8px'
                  }}>
                    🚨 <strong>Incidencia:</strong> {req.dispute_reason}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(req.id, 'approved', { approved_at: new Date().toISOString() })}
                        style={{
                          flex: 1, padding: '10px 16px', borderRadius: '10px',
                          backgroundColor: '#059669', color: 'white',
                          border: 'none', cursor: 'pointer',
                          fontSize: '0.85rem', fontWeight: '700',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      >
                        <CheckCircle size={16} /> Aprobar
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, 'rejected')}
                        style={{
                          flex: 1, padding: '10px 16px', borderRadius: '10px',
                          backgroundColor: 'white', color: '#dc2626',
                          border: '1px solid #fecaca', cursor: 'pointer',
                          fontSize: '0.85rem', fontWeight: '600',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <XCircle size={16} /> Rechazar
                      </button>
                    </>
                  )}

                  {req.status === 'approved' && (
                    <button
                      onClick={() => handleMarkAsShipped(req.id)}
                      style={{
                        flex: 1, padding: '10px 16px', borderRadius: '10px',
                        backgroundColor: '#7c3aed', color: 'white',
                        border: 'none', cursor: 'pointer',
                        fontSize: '0.85rem', fontWeight: '700',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                    >
                      <Truck size={16} /> Marcar como Enviado
                    </button>
                  )}

                  {req.status === 'disputed' && (
                    <button
                      onClick={() => updateStatus(req.id, 'shipped')}
                      style={{
                        flex: 1, padding: '10px 16px', borderRadius: '10px',
                        backgroundColor: 'white', color: '#374151',
                        border: '1px solid #d1d5db', cursor: 'pointer',
                        fontSize: '0.85rem', fontWeight: '600',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      Re-abrir Envío
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniformRequestsPanel;
