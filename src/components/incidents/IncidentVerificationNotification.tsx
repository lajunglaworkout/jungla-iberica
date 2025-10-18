import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { ChecklistIncident, checklistIncidentService } from '../../services/checklistIncidentService';
import { IncidentVerificationModal } from './IncidentVerificationModal';

interface Props {
  employeeName: string;
}

export const IncidentVerificationNotification: React.FC<Props> = ({ employeeName }) => {
  const [pendingIncidents, setPendingIncidents] = useState<ChecklistIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<ChecklistIncident | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPendingVerifications();
    // Verificar cada 30 segundos
    const interval = setInterval(loadPendingVerifications, 30000);
    return () => clearInterval(interval);
  }, [employeeName]);

  const loadPendingVerifications = async () => {
    try {
      const incidents = await checklistIncidentService.getIncidentsPendingVerification(employeeName);
      setPendingIncidents(incidents);
    } catch (error) {
      console.error('Error cargando verificaciones pendientes:', error);
    }
  };

  const handleVerificationComplete = () => {
    loadPendingVerifications();
    setSelectedIncident(null);
    setShowModal(false);
  };

  if (pendingIncidents.length === 0) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: '2px solid #f59e0b',
        maxWidth: '350px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(to right, #f59e0b, #d97706)',
          padding: '16px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell style={{ width: '20px', height: '20px' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              🔔 Verificación Requerida
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            {pendingIncidents.length} incidencia{pendingIncidents.length > 1 ? 's' : ''} resuelta{pendingIncidents.length > 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ padding: '16px' }}>
          {pendingIncidents.map((incident) => (
            <div
              key={incident.id}
              style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                setSelectedIncident(incident);
                setShowModal(true);
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#fde68a';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#fef3c7';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <AlertTriangle style={{ width: '16px', height: '16px', color: '#d97706' }} />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                  {incident.title}
                </h4>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#78350f' }}>
                Resuelto por: {incident.resolved_by}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock style={{ width: '12px', height: '12px', color: '#a16207' }} />
                <span style={{ fontSize: '11px', color: '#a16207' }}>
                  {incident.resolved_at ? new Date(incident.resolved_at).toLocaleDateString('es-ES') : ''}
                </span>
              </div>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              👆 Haz clic para verificar si se resolvió correctamente
            </p>
          </div>
        </div>
      </div>

      {selectedIncident && (
        <IncidentVerificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          incident={selectedIncident}
          employeeName={employeeName}
          onComplete={handleVerificationComplete}
        />
      )}
    </>
  );
};
