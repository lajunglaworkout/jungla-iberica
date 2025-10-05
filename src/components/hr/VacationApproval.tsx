// src/components/hr/VacationApproval.tsx - Aprobación de Vacaciones para RRHH
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VacationApprovalProps {
  onBack: () => void;
  currentEmployee: any;
}

const VacationApproval: React.FC<VacationApprovalProps> = ({ onBack, currentEmployee }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const { data } = await supabase
      .from('vacation_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    
    setRequests(data || []);
    setLoading(false);
  };

  const handleAction = async (id: number, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('vacation_requests')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentEmployee?.nombre || 'RRHH'
      })
      .eq('id', id);

    if (!error) {
      loadRequests();
      alert(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: { bg: '#fef3c7', color: '#92400e', icon: <Clock size={14} /> },
      approved: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={14} /> },
      rejected: { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={14} /> }
    };
    const style = colors[status as keyof typeof colors];
    
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '4px 8px', backgroundColor: style.bg, color: style.color,
        borderRadius: '12px', fontSize: '12px', fontWeight: '500'
      }}>
        {style.icon} {status === 'pending' ? 'Pendiente' : status === 'approved' ? 'Aprobada' : 'Rechazada'}
      </div>
    );
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;

  const pending = requests.filter(r => r.status === 'pending');

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={onBack} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px' }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>✅ Aprobar Vacaciones</h1>
      </div>

      {/* Pendientes */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Solicitudes Pendientes ({pending.length})
        </h2>
        {pending.map(request => (
          <div key={request.id} style={{ 
            padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', 
            marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{request.employee_name}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                • {request.days_requested} días
              </div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>{request.reason}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleAction(request.id, 'approved')}
                style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px' }}
              >
                <Check size={14} /> Aprobar
              </button>
              <button
                onClick={() => handleAction(request.id, 'rejected')}
                style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px' }}
              >
                <X size={14} /> Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Historial */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Historial</h2>
        {requests.filter(r => r.status !== 'pending').map(request => (
          <div key={request.id} style={{ 
            padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', 
            marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{request.employee_name}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                • {request.days_requested} días
              </div>
            </div>
            {getStatusBadge(request.status)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VacationApproval;
