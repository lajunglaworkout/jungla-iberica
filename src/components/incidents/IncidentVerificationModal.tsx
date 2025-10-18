import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ChecklistIncident, checklistIncidentService } from '../../services/checklistIncidentService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  incident: ChecklistIncident;
  employeeName: string;
  onComplete: () => void;
}

export const IncidentVerificationModal: React.FC<Props> = ({
  isOpen, onClose, incident, employeeName, onComplete
}) => {
  const [notes, setNotes] = useState('');
  const [rejection, setRejection] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (approved: boolean) => {
    if (!notes.trim()) {
      alert('Proporciona comentarios sobre la resolución.');
      return;
    }
    if (!approved && !rejection.trim()) {
      alert('Explica por qué no estás satisfecho.');
      return;
    }

    setSubmitting(true);
    try {
      await checklistIncidentService.verifyIncidentResolution(
        incident.id!, approved, notes, employeeName, approved ? undefined : rejection
      );
      alert(approved ? '✅ Incidencia verificada correctamente' : '❌ Incidencia reabierta');
      onComplete();
      onClose();
    } catch (error) {
      alert('Error al verificar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '500px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{
          background: 'linear-gradient(to right, #f59e0b, #d97706)',
          padding: '20px', color: 'white', borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>🔍 Verificar Resolución</h2>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none',
              borderRadius: '8px', padding: '8px', color: 'white', cursor: 'pointer'
            }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{
            backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px'
          }}>
            <h3 style={{ margin: '0 0 8px 0' }}>📋 {incident.title}</h3>
            <p style={{ margin: '0 0 12px 0', color: '#64748b' }}>{incident.description}</p>
            <div style={{ backgroundColor: '#dcfce7', padding: '12px', borderRadius: '6px' }}>
              <strong>Solución:</strong> {incident.resolution_notes}
            </div>
          </div>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="¿Se resolvió correctamente? Comparte tu experiencia..."
            style={{
              width: '100%', padding: '12px', border: '2px solid #e5e7eb',
              borderRadius: '8px', minHeight: '80px', marginBottom: '12px'
            }}
          />

          <textarea
            value={rejection}
            onChange={e => setRejection(e.target.value)}
            placeholder="Si NO estás satisfecho, explica qué falta..."
            style={{
              width: '100%', padding: '12px', border: '2px solid #e5e7eb',
              borderRadius: '8px', minHeight: '60px', marginBottom: '20px'
            }}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleVerify(true)}
              disabled={submitting}
              style={{
                flex: 1, padding: '12px', background: 'linear-gradient(to right, #22c55e, #16a34a)',
                color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              ✅ Resuelto
            </button>
            <button
              onClick={() => handleVerify(false)}
              disabled={submitting}
              style={{
                flex: 1, padding: '12px', background: 'linear-gradient(to right, #ef4444, #dc2626)',
                color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              ❌ No resuelto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
