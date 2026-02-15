import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  User,
  MapPin,
  Camera,
  FileText,
  Plus,
  Eye,
  Bell,
  Settings
} from 'lucide-react';
import {
  getNextInspectionDate,
  shouldSendReminder,
  MAINTENANCE_CALENDAR,
  MAINTENANCE_STATUS,
  TASK_PRIORITY
} from '../../types/maintenance';
import type { MaintenanceInspection, MaintenanceInspectionItem } from '../../types/maintenance';
import maintenanceService from '../../services/maintenanceService';

interface MaintenanceDashboardProps {
  userEmail: string;
  userName: string;
  centerName: string;
  centerId: string;
  onStartInspection: () => void;
  onOpenQuarterly?: () => void;
}

interface DashboardStats {
  totalInspections: number;
  averageScore: number;
  criticalIssues: number;
  pendingTasks: number;
}

const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({
  userEmail,
  userName,
  centerName,
  centerId,
  onStartInspection,
  onOpenQuarterly
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalInspections: 0,
    averageScore: 0,
    criticalIssues: 0,
    pendingTasks: 0
  });
  const [recentInspections, setRecentInspections] = useState<MaintenanceInspection[]>([]);
  const [needsInspection, setNeedsInspection] = useState(false);
  const [lastInspection, setLastInspection] = useState<MaintenanceInspection | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del dashboard
  useEffect(() => {
    loadDashboardData();
  }, [centerId]);

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      // Cargar estadísticas
      const statsData = await maintenanceService.getMaintenanceStats(centerId);
      setStats(statsData);

      // Cargar inspecciones recientes
      const inspectionsResult = await maintenanceService.getInspectionsByCenter(centerId, 5);
      if (inspectionsResult.success && inspectionsResult.data) {
        setRecentInspections(inspectionsResult.data);
      }

      // Verificar si necesita inspección
      const inspectionCheck = await maintenanceService.needsInspection(centerId);
      setNeedsInspection(inspectionCheck.needs);
      setLastInspection(inspectionCheck.lastInspection || null);

    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener próxima fecha de inspección
  const getNextInspectionInfo = () => {
    const nextDate = getNextInspectionDate();
    const shouldRemind = shouldSendReminder();
    const daysUntil = Math.ceil((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return {
      date: nextDate,
      daysUntil,
      shouldRemind,
      isOverdue: daysUntil < 0
    };
  };

  const nextInspection = getNextInspectionInfo();

  // Renderizar tarjeta de estadística
  const renderStatCard = (title: string, value: number, icon: React.ReactNode, color: string, suffix?: string) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      padding: '24px',
      border: '1px solid #f3f4f6'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <p style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#6b7280',
            margin: 0
          }}>{title}</p>
          <p style={{
            fontSize: '30px',
            fontWeight: 'bold',
            marginTop: '8px',
            color,
            margin: '8px 0 0 0'
          }}>
            {value}{suffix}
          </p>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${color}20`
        }}>
          <div style={{ width: '24px', height: '24px', color }}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar alerta de inspección
  const renderInspectionAlert = () => {
    if (!needsInspection && !nextInspection.shouldRemind) return null;

    const isOverdue = nextInspection.isOverdue;
    const alertColor = isOverdue ? '#ef4444' : nextInspection.shouldRemind ? '#f59e0b' : '#10b981';
    const alertIcon = isOverdue ? <AlertTriangle /> : nextInspection.shouldRemind ? <Bell /> : <Calendar />;

    return (
      <div style={{
        borderRadius: '12px',
        padding: '24px',
        borderLeft: `4px solid ${alertColor}`,
        marginBottom: '24px',
        backgroundColor: `${alertColor}10`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              backgroundColor: `${alertColor}20`
            }}>
              <div style={{ width: '20px', height: '20px', color: alertColor }}>
                {alertIcon}
              </div>
            </div>
            <div>
              <h3 style={{
                fontWeight: '600',
                color: '#111827',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>
                {isOverdue
                  ? '🚨 Inspección Atrasada'
                  : needsInspection
                    ? '📅 Inspección Pendiente'
                    : '⏰ Recordatorio de Inspección'
                }
              </h3>
              <p style={{
                color: '#6b7280',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>
                {isOverdue
                  ? `La inspección mensual está atrasada ${Math.abs(nextInspection.daysUntil)} días`
                  : needsInspection
                    ? `Es necesario realizar la inspección mensual de ${centerName}`
                    : `Recuerda que la próxima inspección es en ${nextInspection.daysUntil} días`
                }
              </p>
              <div style={{
                fontSize: '14px',
                color: '#9ca3af'
              }}>
                📍 Centro: {centerName} | 👤 Inspector: {userName} | 📅 Fecha programada: {nextInspection.date.toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
          {needsInspection && (
            <button
              onClick={onStartInspection}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#047857';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
            >
              <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Iniciar Inspección
            </button>
          )}
        </div>
      </div>
    );
  };

  // Renderizar inspección reciente
  const renderInspectionCard = (inspection: MaintenanceInspection) => {
    const scoreColor = inspection.overall_score >= 80 ? '#10b981' :
      inspection.overall_score >= 60 ? '#f59e0b' : '#ef4444';

    return (
      <div key={inspection.id} style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '16px',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer'
      }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div>
            <h4 style={{
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>{inspection.center_name}</h4>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>
              {new Date(inspection.inspection_date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: scoreColor
            }}>
              {inspection.overall_score}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af'
            }}>de 100</div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '12px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#10b981'
            }}>{inspection.items_ok}</div>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af'
            }}>Bien</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#f59e0b'
            }}>{inspection.items_regular}</div>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af'
            }}>Regular</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ef4444'
            }}>{inspection.items_bad}</div>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af'
            }}>Crítico</div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <User style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            {inspection.inspector_name}
          </div>
          <button style={{
            color: '#059669',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#047857';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#059669';
            }}>
            <Eye style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            Ver detalles
          </button>
        </div>

        {inspection.items_bad > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#fef2f2',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#991b1b'
            }}>
              <AlertTriangle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              {inspection.items_bad} problema(s) crítico(s) detectado(s)
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando dashboard de mantenimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>Dashboard de Mantenimiento</h1>
            <p style={{
              color: '#6b7280',
              marginTop: '4px',
              margin: 0
            }}>
              {centerName} - Gestión de inspecciones mensuales
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '14px',
                color: '#9ca3af'
              }}>Inspector</div>
              <div style={{
                fontWeight: '500',
                color: '#111827'
              }}>{userName}</div>
            </div>
            <button
              onClick={onStartInspection}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#047857';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
            >
              <Plus style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Nueva Inspección
            </button>
          </div>
        </div>

        {/* Alerta de inspección */}
        {renderInspectionAlert()}

        {/* Estadísticas principales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {renderStatCard(
            'Total Inspecciones',
            stats.totalInspections,
            <FileText />,
            '#3b82f6'
          )}
          {renderStatCard(
            'Puntuación Media',
            stats.averageScore,
            <TrendingUp />,
            stats.averageScore >= 80 ? '#10b981' : stats.averageScore >= 60 ? '#f59e0b' : '#ef4444',
            '/100'
          )}
          {renderStatCard(
            'Issues Críticos',
            stats.criticalIssues,
            <AlertTriangle />,
            '#ef4444'
          )}
          {renderStatCard(
            'Tareas Pendientes',
            stats.pendingTasks,
            <Clock />,
            '#f59e0b'
          )}
        </div>

        {/* Inspecciones recientes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>Inspecciones Recientes</h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>Últimas 5 inspecciones realizadas</p>
          </div>
          <div style={{ padding: '24px' }}>
            {recentInspections.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {recentInspections.map(renderInspectionCard)}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '32px'
              }}>
                <FileText style={{
                  width: '48px',
                  height: '48px',
                  color: '#d1d5db',
                  margin: '0 auto 16px'
                }} />
                <p style={{
                  color: '#6b7280',
                  marginBottom: '16px'
                }}>No hay inspecciones registradas</p>
                <button
                  onClick={onStartInspection}
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '8px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#047857';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }}
                >
                  Realizar Primera Inspección
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div style={{
          marginTop: '32px',
          backgroundColor: '#eff6ff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #dbeafe'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#059669',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <Camera style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h3 style={{
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>Sistema de Fotos Obligatorias</h3>
              <p style={{
                color: '#1e40af',
                fontSize: '14px',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>
                Para estados MAL y REGULAR es obligatorio subir fotos del deterioro.
                Las tareas no se pueden cerrar sin foto de reparación.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#1d4ed8'
              }}>
                <Bell style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Los problemas críticos notifican automáticamente a Beni ({MAINTENANCE_CALENDAR.beni_email})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
