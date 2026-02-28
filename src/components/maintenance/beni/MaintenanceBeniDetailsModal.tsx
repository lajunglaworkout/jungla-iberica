// src/components/maintenance/beni/MaintenanceBeniDetailsModal.tsx
import React from 'react';
import { MaintenanceReview } from './MaintenanceBeniTypes';

interface Props {
  review: MaintenanceReview;
  onClose: () => void;
}

export const MaintenanceBeniDetailsModal: React.FC<Props> = ({ review, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto', width: '90%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          📋 Detalles de Revisión - {review.center_name}
        </h3>
        <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <strong>Estado:</strong> {review.status}
        </div>
        <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <strong>Encargado:</strong> {review.assigned_to}
        </div>
        <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <strong>Items:</strong> {review.items?.length || 0}
        </div>
      </div>

      {review.items && review.items.length > 0 ? (
        <div>
          <h4 style={{ marginBottom: '16px', color: '#374151' }}>Items de Inspección:</h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            {review.items.map((item, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px',
                  backgroundColor: item.status === 'mal' ? '#fef2f2' : item.status === 'regular' ? '#fef3c7' : '#f0f9ff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{String(item.zone_name)}</strong> - {String(item.concept_name)}
                    {item.observations && (
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                        📝 {String(item.observations)}
                      </p>
                    )}
                    {item.task_to_perform && (
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#dc2626' }}>
                        🔧 Tarea: {String(item.task_to_perform)} (Prioridad: {String(item.task_priority)})
                      </p>
                    )}
                  </div>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: 'white',
                    backgroundColor: item.status === 'bien' ? '#10b981' : item.status === 'regular' ? '#f59e0b' : '#ef4444',
                  }}>
                    {String(item.status).toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>No hay items de inspección disponibles</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button
          onClick={onClose}
          style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
);
