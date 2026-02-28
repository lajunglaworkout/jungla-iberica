// src/app/VacationNotificationToast.tsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface VacationRequest {
  id: string;
  employee_id: string;
  requested_at: string;
  type: string;
  start_date: string;
  end_date: string;
}

interface VacationNotificationToastProps {
  notifications: VacationRequest[];
  onClose: () => void;
  onNavigateToIncidents: () => void;
}

export const VacationNotificationToast: React.FC<VacationNotificationToastProps> = ({
  notifications, onClose, onNavigateToIncidents,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 50,
      backgroundColor: 'white', borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb', width: '320px', overflow: 'hidden',
    }}>
      <div style={{ backgroundColor: '#fff7ed', padding: '12px 16px', borderBottom: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="#c2410c" />
          <span style={{ fontWeight: 600, color: '#9a3412', fontSize: '14px' }}>
            Solicitudes Pendientes ({notifications.length})
          </span>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9a3412', padding: 0 }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {notifications.map((req, idx) => (
          <div
            key={req.id}
            onClick={onNavigateToIncidents}
            style={{ padding: '12px 16px', borderBottom: idx < notifications.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer', transition: 'background-color 0.1s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>Empleado #{req.employee_id}</span>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>{new Date(req.requested_at).toLocaleDateString()}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#4b5563', margin: 0 }}>
              Solicita <span style={{ fontWeight: 500 }}>{req.type === 'vacation' ? 'Vacaciones' : 'Día Personal'}</span>
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
            </p>
          </div>
        ))}
        <div style={{ padding: '8px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
          <button
            onClick={onNavigateToIncidents}
            style={{ border: 'none', background: 'transparent', color: '#059669', fontSize: '12px', fontWeight: 500, cursor: 'pointer', width: '100%' }}
          >
            Ver todas las solicitudes →
          </button>
        </div>
      </div>
    </div>
  );
};
