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
  onStartInspection
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
  const [showInspectionDetails, setShowInspectionDetails] = useState<string | null>(null);

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
      <div
        className="rounded-xl p-6 border-l-4 mb-6"
        style={{
          backgroundColor: `${alertColor}10`,
          borderLeftColor: alertColor
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: `${alertColor}20` }}
            >
              <div className="w-5 h-5" style={{ color: alertColor }}>
                {alertIcon}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {isOverdue
                  ? '🚨 Inspección Atrasada'
                  : needsInspection
                    ? '📅 Inspección Pendiente'
                    : '⏰ Recordatorio de Inspección'
                }
              </h3>
              <p className="text-gray-600 mb-3">
                {isOverdue
                  ? `La inspección mensual está atrasada ${Math.abs(nextInspection.daysUntil)} días`
                  : needsInspection
                    ? `Es necesario realizar la inspección mensual de ${centerName}`
                    : `Recuerda que la próxima inspección es en ${nextInspection.daysUntil} días`
                }
              </p>
              <div className="text-sm text-gray-500">
                📍 Centro: {centerName} | 👤 Inspector: {userName} | 📅 Fecha programada: {nextInspection.date.toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
          {needsInspection && (
            <button
              onClick={onStartInspection}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
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
      <div key={inspection.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">{inspection.center_name}</h4>
            <p className="text-sm text-gray-600">
              {new Date(inspection.inspection_date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-bold"
              style={{ color: scoreColor }}
            >
              {inspection.overall_score}
            </div>
            <div className="text-xs text-gray-500">de 100</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{inspection.items_ok}</div>
            <div className="text-xs text-gray-500">Bien</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-600">{inspection.items_regular}</div>
            <div className="text-xs text-gray-500">Regular</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">{inspection.items_bad}</div>
            <div className="text-xs text-gray-500">Crítico</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-1" />
            {inspection.inspector_name}
          </div>
          <button
            onClick={() => setShowInspectionDetails(inspection.id)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver detalles
          </button>
        </div>

        {inspection.items_bad > 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg">
            <div className="flex items-center text-sm text-red-800">
              <AlertTriangle className="w-4 h-4 mr-2" />
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

        {/* Información del calendario */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
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
              marginBottom: '16px'
            }}>
              <Calendar style={{ width: '24px', height: '24px', color: '#059669', marginRight: '12px' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>Próxima Inspección</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Fecha programada:</span>
                <span style={{ fontWeight: '500' }}>
                  {nextInspection.date.toLocaleDateString('es-ES')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Días restantes:</span>
                <span style={{
                  fontWeight: '500',
                  color: nextInspection.isOverdue ? '#dc2626' : '#059669'
                }}>
                  {nextInspection.isOverdue ? 'Atrasada' : `${nextInspection.daysUntil} días`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Recordatorio:</span>
                <span style={{ fontWeight: '500' }}>
                  Día {MAINTENANCE_CALENDAR.inspection_day - MAINTENANCE_CALENDAR.reminder_days_before}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-gray-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Día de inspección:</span>
                <span className="font-medium">{MAINTENANCE_CALENDAR.inspection_day}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fotos obligatorias:</span>
                <span className="font-medium">MAL/REGULAR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Notificaciones:</span>
                <span className="font-medium">Automáticas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-list:</span>
                <span className="font-medium">Integrado</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Zonas de Inspección</h3>
            </div>
            <div className="text-sm text-gray-600">
              <div className="mb-2">9 zonas configuradas:</div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div>💪 Entrenamiento</div>
                <div>🚿 Duchas</div>
                <div>🚻 Aseos</div>
                <div>🌿 Exterior</div>
                <div>🎨 Paredes</div>
                <div>💡 Iluminación</div>
                <div>🚪 Accesos</div>
                <div>🏪 Recepción</div>
                <div>🏥 Servicios</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inspecciones recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Inspecciones Recientes</h3>
            <p className="text-gray-600 text-sm mt-1">Últimas 5 inspecciones realizadas</p>
          </div>
          <div className="p-6">
            {recentInspections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentInspections.map(renderInspectionCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay inspecciones registradas</p>
                <button
                  onClick={onStartInspection}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Realizar Primera Inspección
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Sistema de Fotos Obligatorias</h3>
              <p className="text-blue-800 text-sm mb-3">
                Para estados MAL y REGULAR es obligatorio subir fotos del deterioro.
                Las tareas no se pueden cerrar sin foto de reparación.
              </p>
              <div className="flex items-center text-sm text-blue-700">
                <Bell className="w-4 h-4 mr-2" />
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
