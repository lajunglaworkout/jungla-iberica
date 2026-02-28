import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Wrench,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Play,
  Trash2,
  Building,
  X
} from 'lucide-react';
import quarterlyMaintenanceService from '../../services/quarterlyMaintenanceService';
import { useSession } from '../../contexts/SessionContext';
import { ui } from '../../utils/ui';


interface QuarterlyMaintenanceSystemProps {
  onClose?: () => void;
}

const QuarterlyMaintenanceSystemWithSupabase: React.FC<QuarterlyMaintenanceSystemProps> = ({ onClose }) => {
  const { employee } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState('');

  // Obtener quarter actual
  const getCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let quarter = '';
    if (month >= 1 && month <= 3) quarter = 'Q1';
    else if (month >= 4 && month <= 6) quarter = 'Q2';
    else if (month >= 7 && month <= 9) quarter = 'Q3';
    else quarter = 'Q4';

    return { quarter: `${quarter}-${year}`, year };
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const result = await quarterlyMaintenanceService.getReviews();
      if (result.success) {
        setReviews(result.reviews || []);
        console.log('✅ Revisiones cargadas:', result.reviews?.length);
      } else {
        console.error('❌ Error cargando revisiones:', result.error);
        setReviews([]);
      }
    } catch (error) {
      console.error('❌ Error cargando revisiones de mantenimiento:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // CONVOCAR NUEVA REVISIÓN TRIMESTRAL DE MANTENIMIENTO
  const handleCreateReview = async () => {
    if (!deadlineDate) {
      ui.warning('⚠️ Por favor establece una fecha límite');
      return;
    }

    setLoading(true);
    console.log('🔧 Convocando revisión trimestral de mantenimiento...');

    const centers = [
      { id: 9, name: 'Sevilla' },
      { id: 10, name: 'Jerez' },
      { id: 11, name: 'Puerto' }
    ];

    const { quarter, year } = getCurrentQuarter();

    const result = await quarterlyMaintenanceService.createReview({
      quarter,
      year,
      deadline_date: deadlineDate,
      created_by: employee?.email || 'beni.jungla@gmail.com',
      centers
    });

    if (result.success) {
      ui.success(`✅ Revisión Trimestral de Mantenimiento ${quarter} convocada\n\n` +
        `Se han creado revisiones para:\n` +
        centers.map(c => `🏪 ${c.name}: Mantenimiento completo`).join('\n') +
        `\n\n⏰ Fecha límite: ${new Date(deadlineDate).toLocaleDateString('es-ES')}\n\n` +
        `📌 Ahora debes ACTIVAR cada revisión para notificar a los encargados.`);
      setShowCreateModal(false);
      setDeadlineDate('');
      loadReviews();
    } else {
      ui.error('❌ Error convocando revisión de mantenimiento');
    }

    setLoading(false);
  };

  // ACTIVAR REVISIÓN Y NOTIFICAR A ENCARGADOS
  const handleActivateReview = async (reviewId: number) => {
    const confirm = await ui.confirm('¿Activar esta revisión y notificar a los encargados de los centros?');
    if (!confirm) return;

    setLoading(true);
    console.log('🚀 Activando revisión:', reviewId);

    // Mapeo de encargados por centro
    const encargadosEmails: Record<number, string> = {
      9: 'franciscogiraldezmorales@gmail.com', // Sevilla
      10: 'ivan.jerez@lajungla.es',            // Jerez
      11: 'guillermo.puerto@lajungla.es'       // Puerto
    };

    const centers = [
      { id: 9, name: 'Sevilla' },
      { id: 10, name: 'Jerez' },
      { id: 11, name: 'Puerto' }
    ];

    const result = await quarterlyMaintenanceService.activateReview(reviewId, centers, encargadosEmails);

    if (result.success) {
      ui.success('✅ Revisión activada y notificaciones enviadas a los encargados');
      loadReviews();
    } else {
      ui.error('❌ Error activando la revisión');
      console.error('Error:', result.error);
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'active': return '#3b82f6';
      case 'draft': return '#6b7280';
      default: return '#ef4444';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} />;
      case 'active': return <Clock size={20} />;
      case 'draft': return <AlertCircle size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'active': return 'Activa';
      case 'draft': return 'Borrador';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'spin 1s linear infinite'
          }}>🔧</div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando revisiones de mantenimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: '#f59e0b',
              borderRadius: '8px',
              padding: '8px',
              color: 'white'
            }}>
              <Wrench size={24} />
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Revisiones Trimestrales de Mantenimiento
            </h1>
          </div>

          <button
            onClick={async () => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Convocar Revisión {getCurrentQuarter().quarter}
          </button>
        </div>

        <p style={{ color: '#6b7280', margin: 0 }}>
          Sistema de convocatoria y seguimiento de revisiones trimestrales de mantenimiento
        </p>
      </div>

      {/* Lista de Revisiones */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6b7280'
          }}>
            <Wrench size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No hay revisiones de mantenimiento
            </h3>
            <p style={{ marginBottom: '24px' }}>
              Convoca la primera revisión trimestral de mantenimiento para comenzar
            </p>
            <button
              onClick={async () => setShowCreateModal(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Convocar Revisión {getCurrentQuarter().quarter}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Building size={20} />
                      {review.center_name} - {review.quarter}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <span>📋 {review.total_zones} zonas</span>
                      <span>🔧 {review.total_concepts} conceptos</span>
                      <span>📅 Fecha límite: {review.deadline_date || 'Sin definir'}</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: getStatusColor(review.status)
                  }}>
                    {getStatusIcon(review.status)}
                    <span style={{ fontWeight: '600' }}>
                      {getStatusText(review.status)}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '16px'
                }}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={14} />
                    Ver Detalles
                  </button>

                  {review.status === 'draft' && (
                    <button
                      onClick={async () => handleActivateReview(review.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <Play size={14} />
                      Activar y Notificar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Creación */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Wrench size={24} style={{ color: '#f59e0b' }} />
                Convocar Revisión {getCurrentQuarter().quarter}
              </h2>

              <button
                onClick={async () => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Se creará una revisión trimestral de mantenimiento para todos los centros
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Fecha límite
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={async (e) => setDeadlineDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 8px 0'
              }}>
                Centros incluidos:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                <li>🏪 Sevilla - Mantenimiento completo</li>
                <li>🏪 Jerez - Mantenimiento completo</li>
                <li>🏪 Puerto - Mantenimiento completo</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={async () => setShowCreateModal(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              <button
                onClick={handleCreateReview}
                disabled={!deadlineDate || loading}
                style={{
                  padding: '12px 20px',
                  backgroundColor: deadlineDate ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: deadlineDate ? 'pointer' : 'not-allowed'
                }}
              >
                {loading ? 'Creando...' : 'Crear Revisión'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuarterlyMaintenanceSystemWithSupabase;
