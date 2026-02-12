// src/components/hr/VacationApproval.tsx - Aprobación de Vacaciones para RRHH
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Clock, CheckCircle, XCircle, MapPin, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyVacationResponse } from '../../services/notificationService';
import { useData } from '../../contexts/DataContext';

interface VacationApprovalProps {
  onBack: () => void;
  currentEmployee: any;
}

const VacationApproval: React.FC<VacationApprovalProps> = ({ onBack, currentEmployee }) => {
  const { centers, employees } = useData();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadRequests();
  }, [selectedCenter]);

  useEffect(() => {
    if (centers && centers.length > 0 && !selectedCenter) {
      setSelectedCenter(centers[0].id);
    }
  }, [centers]);

  const loadRequests = async () => {
    try {
      // Cargar solicitudes con información del empleado
      const { data: vacationData } = await supabase
        .from('vacation_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (!vacationData) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Obtener IDs de empleados
      const employeeIds = [...new Set(vacationData.map(v => v.employee_id))];

      // Cargar datos de empleados con centro
      const { data: employeesData } = await supabase
        .from('employees')
        .select('id, name, center_id')
        .in('id', employeeIds);

      // Combinar datos
      const enrichedRequests = vacationData.map(request => {
        const employee = employeesData?.find(e => e.id === request.employee_id);
        return {
          ...request,
          employee_name: employee?.name || request.employee_name || 'Desconocido',
          center_id: employee?.center_id || null
        };
      });

      setRequests(enrichedRequests);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
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
      // Enviar notificación al empleado
      const request = requests.find(r => r.id === id);
      if (request) {
        try {
          await notifyVacationResponse({
            employeeId: request.employee_id,
            status: status,
            startDate: request.start_date,
            endDate: request.end_date,
            reviewerName: currentEmployee?.nombre || 'RRHH'
          });
        } catch (notifyErr) {
          console.error('Error sending vacation response notification:', notifyErr);
        }
      }

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

  // Filtrar por centro y estado
  const filteredRequests = requests.filter(r => {
    const centerMatch = !selectedCenter || r.center_id === selectedCenter;
    const statusMatch = selectedStatus === 'all' || r.status === selectedStatus;
    return centerMatch && statusMatch;
  });

  const pending = filteredRequests.filter(r => r.status === 'pending');
  const centerName = centers.find(c => c.id === selectedCenter)?.name || 'Todos';

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={onBack} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>✅ Aprobar Vacaciones</h1>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={20} style={{ color: '#6b7280' }} />
            <span style={{ fontWeight: '600', color: '#374151' }}>Filtros:</span>
          </div>

          {/* Selector de Centro */}
          <div style={{ flex: '1 1 140px', minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Centro
            </label>
            <select
              value={selectedCenter || ''}
              onChange={(e) => setSelectedCenter(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="">Todos los centros</option>
              {centers.map(center => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Estado */}
          <div style={{ flex: '1 1 140px', minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Estado
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>

          {/* Resumen */}
          <div style={{ padding: '12px 20px', backgroundColor: '#f3f4f6', borderRadius: '8px', flexShrink: 0, minWidth: '80px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Total filtrado</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{filteredRequests.length}</div>
          </div>
        </div>
      </div>

      {/* Pendientes */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Solicitudes Pendientes ({pending.length})
        </h2>
        {pending.map(request => (
          <div key={request.id} style={{
            padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px',
            marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            flexWrap: 'wrap', gap: '12px'
          }}>
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {request.employee_name}
                {request.center_id && (
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>
                    • {centers.find(c => c.id === request.center_id)?.name}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                • {request.days_requested} días
              </div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>{request.reason}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => handleAction(request.id, 'approved')}
                style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                <Check size={14} /> Aprobar
              </button>
              <button
                onClick={() => handleAction(request.id, 'rejected')}
                style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                <X size={14} /> Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Historial */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Historial ({filteredRequests.filter(r => r.status !== 'pending').length})</h2>
        {filteredRequests.filter(r => r.status !== 'pending').map(request => (
          <div key={request.id} style={{
            padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px',
            marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {request.employee_name}
                {request.center_id && (
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>
                    • {centers.find(c => c.id === request.center_id)?.name}
                  </span>
                )}
              </div>
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
