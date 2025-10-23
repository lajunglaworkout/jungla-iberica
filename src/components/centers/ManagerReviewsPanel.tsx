import React, { useState, useEffect } from 'react';
import { Package, Wrench, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import quarterlyInventoryService from '../../services/quarterlyInventoryService';
import { useSession } from '../../contexts/SessionContext';

interface PendingReview {
  id: number;
  type: 'inventory' | 'maintenance';
  title: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  itemCount: number;
  centerName: string;
}

interface ManagerReviewsPanelProps {
  onStartInventoryReview: () => void;
  onStartMaintenanceReview: () => void;
}

const ManagerReviewsPanel: React.FC<ManagerReviewsPanelProps> = ({
  onStartInventoryReview,
  onStartMaintenanceReview
}) => {
  const { employee } = useSession();
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingReviews();
  }, [employee?.center_id]);

  const loadPendingReviews = async () => {
    if (!employee?.center_id) return;

    setLoading(true);
    
    // Cargar asignaciones de inventario pendientes
    const inventoryResult = await quarterlyInventoryService.getAssignments(
      Number(employee.center_id),
      'pending'
    );

    const reviews: PendingReview[] = [];

    if (inventoryResult.success && inventoryResult.assignments) {
      inventoryResult.assignments.forEach((assignment: any) => {
        if (assignment.review && assignment.review.status === 'active') {
          reviews.push({
            id: assignment.id,
            type: 'inventory',
            title: `Revisión de Inventario ${assignment.review.quarter}`,
            deadline: assignment.review.deadline_date,
            status: assignment.status,
            itemCount: assignment.review.total_items,
            centerName: assignment.center_name
          });
        }
      });
    }

    // TODO: Cargar asignaciones de mantenimiento pendientes
    // const maintenanceResult = await quarterlyMaintenanceService.getAssignments(...)

    setPendingReviews(reviews);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En Progreso';
      default: return 'Pendiente';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleStartReview = (review: PendingReview) => {
    if (review.type === 'inventory') {
      onStartInventoryReview();
    } else {
      onStartMaintenanceReview();
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <p style={{ color: '#6b7280', textAlign: 'center' }}>Cargando revisiones...</p>
      </div>
    );
  }

  if (pendingReviews.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <CheckCircle size={24} color="#10b981" />
          <h3 style={{ margin: 0 }}>Revisiones Trimestrales</h3>
        </div>
        <p style={{ color: '#6b7280', margin: '8px 0 0 36px' }}>
          No tienes revisiones pendientes en este momento
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '2px solid #f59e0b',
      boxShadow: '0 4px 6px rgba(245, 158, 11, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
        <AlertCircle size={24} color="#f59e0b" />
        <h3 style={{ margin: 0, color: '#f59e0b' }}>
          ⚠️ Tienes {pendingReviews.length} revisión{pendingReviews.length > 1 ? 'es' : ''} pendiente{pendingReviews.length > 1 ? 's' : ''}
        </h3>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {pendingReviews.map(review => {
          const daysLeft = getDaysUntilDeadline(review.deadline);
          const isUrgent = daysLeft !== null && daysLeft <= 3;

          return (
            <div
              key={review.id}
              style={{
                backgroundColor: isUrgent ? '#fef3c7' : '#f9fafb',
                border: `2px solid ${isUrgent ? '#f59e0b' : '#e5e7eb'}`,
                borderRadius: '8px',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {review.type === 'inventory' ? (
                    <Package size={20} color="#059669" />
                  ) : (
                    <Wrench size={20} color="#0284c7" />
                  )}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                      {review.title}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                      {review.centerName} • {review.itemCount} items
                    </p>
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: getStatusColor(review.status),
                  color: 'white'
                }}>
                  {getStatusText(review.status)}
                </span>
              </div>

              {review.deadline && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  padding: '8px',
                  backgroundColor: isUrgent ? '#fed7aa' : 'white',
                  borderRadius: '6px'
                }}>
                  <Calendar size={16} color={isUrgent ? '#ea580c' : '#6b7280'} />
                  <span style={{
                    fontSize: '14px',
                    color: isUrgent ? '#ea580c' : '#374151',
                    fontWeight: isUrgent ? '600' : '400'
                  }}>
                    Fecha límite: {new Date(review.deadline).toLocaleDateString('es-ES')}
                    {daysLeft !== null && (
                      <span style={{ marginLeft: '8px' }}>
                        ({daysLeft > 0 ? `${daysLeft} días restantes` : daysLeft === 0 ? '¡Hoy!' : '¡Vencida!'})
                      </span>
                    )}
                  </span>
                </div>
              )}

              <button
                onClick={() => handleStartReview(review)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: review.status === 'in_progress' ? '#3b82f6' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {review.status === 'in_progress' ? (
                  <>
                    <Clock size={16} />
                    Continuar Revisión
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Iniciar Revisión
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '12px',
        backgroundColor: '#fef3c7',
        borderRadius: '6px',
        border: '1px solid #fbbf24'
      }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <strong>Importante:</strong> Completa las revisiones antes de la fecha límite para evitar retrasos.
        </p>
      </div>
    </div>
  );
};

export default ManagerReviewsPanel;
