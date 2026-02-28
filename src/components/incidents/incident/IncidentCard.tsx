// src/components/incidents/incident/IncidentCard.tsx
import React from 'react';
import { Calendar, Package, User } from 'lucide-react';
import { type Incident, getIncidentIcon } from './IncidentTypes';

interface Props {
  incident: Incident;
  isHR: boolean;
  isLogistics: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export const IncidentCard: React.FC<Props> = ({ incident, isHR, isLogistics, onApprove, onReject }) => {
  const statusBg = incident.status === 'approved' ? '#dcfce7' : incident.status === 'rejected' ? '#fef2f2' : '#fef3c7';
  const statusColor = incident.status === 'approved' ? '#059669' : incident.status === 'rejected' ? '#dc2626' : '#d97706';
  const statusLabel = incident.status === 'pending' ? 'Pendiente' : incident.status === 'approved' ? 'Aprobado' : incident.status === 'rejected' ? 'Rechazado' : incident.status;

  const priorityBg = incident.priority === 'urgent' ? '#fef2f2' : incident.priority === 'high' ? '#fff7ed' : incident.priority === 'normal' ? '#eff6ff' : '#f9fafb';
  const priorityColor = incident.priority === 'urgent' ? '#dc2626' : incident.priority === 'high' ? '#ea580c' : incident.priority === 'normal' ? '#2563eb' : '#6b7280';
  const priorityLabel = incident.priority === 'urgent' ? 'Urgente' : incident.priority === 'high' ? 'Alta' : incident.priority === 'normal' ? 'Normal' : 'Baja';

  return (
    <div
      style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer' }}
      onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {getIncidentIcon(incident.incident_type_name)}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>{incident.title}</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{incident.incident_type_name}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
          <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: statusBg, color: statusColor }}>{statusLabel}</span>
          <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: priorityBg, color: priorityColor }}>{priorityLabel}</span>
        </div>
      </div>

      {(isHR || isLogistics) && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
            <User style={{ width: '16px', height: '16px' }} />
            <span style={{ fontWeight: '500' }}>{incident.employee_name}</span>
            <span>•</span>
            <span>{incident.center_name}</span>
          </div>
        </div>
      )}

      <p style={{ color: '#374151', marginBottom: '16px', fontSize: '14px', lineHeight: '1.5' }}>{incident.description}</p>

      {incident.start_date && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
            <Calendar style={{ width: '16px', height: '16px' }} />
            <span>{new Date(incident.start_date).toLocaleDateString('es-ES')}{incident.end_date && ` - ${new Date(incident.end_date).toLocaleDateString('es-ES')}`}</span>
            {incident.days_requested && <span style={{ padding: '2px 6px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>{incident.days_requested} días</span>}
          </div>
        </div>
      )}

      {incident.clothing_type && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
            <Package style={{ width: '16px', height: '16px' }} />
            <span>{incident.clothing_type}</span>
            <span>•</span>
            <span>Talla: {incident.clothing_size}</span>
            <span>•</span>
            <span>Cantidad: {incident.quantity}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          <span>Creado: {new Date(incident.created_at).toLocaleDateString('es-ES')}</span>
          {incident.approved_by_name && <span style={{ marginLeft: '16px' }}>Aprobado por: {incident.approved_by_name}</span>}
        </div>
        {incident.status === 'pending' && ((isHR && incident.approver_role === 'hr') || (isLogistics && incident.approver_role === 'logistics')) && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onApprove(incident.id)}
              style={{ padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
            >
              Aprobar
            </button>
            <button
              onClick={() => onReject(incident.id)}
              style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#b91c1c'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
            >
              Rechazar
            </button>
          </div>
        )}
      </div>

      {incident.rejection_reason && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>
            <strong>Motivo del rechazo:</strong> {incident.rejection_reason}
          </p>
        </div>
      )}
    </div>
  );
};
