// src/components/maintenance/beni/MaintenanceBeniReviewsSection.tsx
import React from 'react';
import { Wrench, Building, Eye, Play } from 'lucide-react';
import { MaintenanceReview, getStatusColor, getStatusIcon, getStatusText } from './MaintenanceBeniTypes';

interface Props {
  reviews: MaintenanceReview[];
  currentQuarter: string;
  onCreateReview: () => void;
  onViewDetails: (assignmentId: number) => Promise<void>;
  onActivateReview: (reviewId: number) => Promise<void>;
}

export const MaintenanceBeniReviewsSection: React.FC<Props> = ({
  reviews, currentQuarter, onCreateReview, onViewDetails, onActivateReview,
}) => (
  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      🔧 Gestión de Revisiones Trimestrales
    </h2>

    {reviews.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6b7280' }}>
        <Wrench size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No hay revisiones de mantenimiento</h3>
        <p style={{ marginBottom: '24px' }}>Convoca la primera revisión trimestral de mantenimiento para comenzar</p>
        <button
          onClick={onCreateReview}
          style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          Convocar Revisión {currentQuarter}
        </button>
      </div>
    ) : (
      <div style={{ display: 'grid', gap: '16px' }}>
        {reviews.flatMap((review) =>
          review.assignments && review.assignments.length > 0
            ? review.assignments.map((assignment) => (
              <div key={assignment.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building size={20} />
                      {assignment.center_name} - {review.quarter}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                      <span>📋 {review.total_zones || 9} zonas</span>
                      <span>🔧 {review.total_concepts || 30} conceptos</span>
                      <span>📅 Fecha límite: {review.deadline_date || 'Sin definir'}</span>
                      <span>👤 Encargado: {assignment.assigned_to || 'Sin asignar'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getStatusColor(assignment.status ?? '') }}>
                    {getStatusIcon(assignment.status ?? '')}
                    <span style={{ fontWeight: '600' }}>{getStatusText(assignment.status ?? '')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button
                    onClick={() => onViewDetails(assignment.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    <Eye size={14} /> Ver Detalles
                  </button>
                  {review.status === 'draft' && (
                    <button
                      onClick={() => onActivateReview(review.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <Play size={14} /> Activar y Notificar
                    </button>
                  )}
                </div>
              </div>
            ))
            : [(
              <div key={review.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                      {review.quarter} - {review.total_centers} centros
                    </h3>
                    <p style={{ color: '#6b7280', margin: 0 }}>Revisión sin asignaciones aún</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getStatusColor(review.status ?? '') }}>
                    {getStatusIcon(review.status ?? '')}
                    <span style={{ fontWeight: '600' }}>{getStatusText(review.status ?? '')}</span>
                  </div>
                </div>
                {review.status === 'draft' && (
                  <button
                    onClick={() => onActivateReview(review.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginTop: '16px' }}
                  >
                    <Play size={14} /> Activar y Notificar
                  </button>
                )}
              </div>
            )]
        )}
      </div>
    )}
  </div>
);
