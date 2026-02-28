import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  User,
  Camera,
  FileText,
  Plus,
  Eye,
  Bell,
  Calendar,
  Wrench
} from 'lucide-react';
import {
  getNextInspectionDate,
  shouldSendReminder,
  MAINTENANCE_CALENDAR
} from '../../types/maintenance';
import type { MaintenanceInspection } from '../../types/maintenance';
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

  useEffect(() => {
    loadDashboardData();
  }, [centerId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await maintenanceService.getMaintenanceStats(centerId);
      setStats(statsData);

      const inspectionsResult = await maintenanceService.getInspectionsByCenter(centerId, 5);
      if (inspectionsResult.success && inspectionsResult.data) {
        setRecentInspections(inspectionsResult.data);
      }

      const inspectionCheck = await maintenanceService.needsInspection(centerId);
      setNeedsInspection(inspectionCheck.needs);
      setLastInspection(inspectionCheck.lastInspection || null);
    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextInspectionInfo = () => {
    const nextDate = getNextInspectionDate();
    const shouldRemind = shouldSendReminder();
    const daysUntil = Math.ceil((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return { date: nextDate, daysUntil, shouldRemind, isOverdue: daysUntil < 0 };
  };

  const nextInspection = getNextInspectionInfo();

  if (loading) {
    return (
      <div style={{ minHeight: '100%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '44px', height: '44px',
            border: '3px solid #e5e7eb', borderTop: '3px solid #059669',
            borderRadius: '50%', margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6b7280', margin: 0 }}>Cargando mantenimiento...</p>
        </div>
      </div>
    );
  }

  const scoreColor = stats.averageScore >= 80 ? '#059669' : stats.averageScore >= 60 ? '#d97706' : '#dc2626';
  const inspectionAlert = needsInspection || nextInspection.shouldRemind;
  const isOverdue = nextInspection.isOverdue;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>

      {/* Header con gradiente */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)',
        padding: '24px 24px 32px'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <Wrench size={22} color="rgba(255,255,255,0.8)" />
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Mantenimiento
                </span>
              </div>
              <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '700', margin: '0 0 4px' }}>
                {centerName}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>
                Inspecciones mensuales · {userName}
              </p>
            </div>
            <button
              onClick={onStartInspection}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'white', color: '#065f46',
                border: 'none', borderRadius: '10px',
                padding: '10px 20px', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                flexShrink: 0
              }}
            >
              <Plus size={18} />
              Nueva Inspección
            </button>
          </div>

          {/* KPI chips en el header */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Inspecciones', value: stats.totalInspections, icon: '📋' },
              { label: 'Puntuación media', value: `${stats.averageScore}/100`, icon: '⭐' },
              { label: 'Issues críticos', value: stats.criticalIssues, icon: '🔴' },
            ].map(chip => (
              <div key={chip.label} style={{
                backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '8px', padding: '8px 14px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>{chip.icon}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: '700', fontSize: '16px', lineHeight: 1 }}>{chip.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '2px' }}>{chip.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>

        {/* Alerta de inspección */}
        {inspectionAlert && (
          <div style={{
            backgroundColor: isOverdue ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${isOverdue ? '#fecaca' : '#fde68a'}`,
            borderLeft: `4px solid ${isOverdue ? '#dc2626' : '#f59e0b'}`,
            borderRadius: '10px', padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: '16px', marginBottom: '24px', flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                backgroundColor: isOverdue ? '#fee2e2' : '#fef3c7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {isOverdue
                  ? <AlertTriangle size={20} color="#dc2626" />
                  : <Bell size={20} color="#f59e0b" />
                }
              </div>
              <div>
                <div style={{ fontWeight: '600', color: isOverdue ? '#991b1b' : '#92400e', fontSize: '15px' }}>
                  {isOverdue ? '🚨 Inspección atrasada' : '⏰ Inspección pendiente'}
                </div>
                <div style={{ color: isOverdue ? '#b91c1c' : '#a16207', fontSize: '13px', marginTop: '2px' }}>
                  {isOverdue
                    ? `Llevas ${Math.abs(nextInspection.daysUntil)} días sin inspeccionar · ${centerName}`
                    : `Próxima inspección: ${nextInspection.date.toLocaleDateString('es-ES')} · ${nextInspection.daysUntil} días restantes`
                  }
                </div>
              </div>
            </div>
            {needsInspection && (
              <button
                onClick={onStartInspection}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  backgroundColor: isOverdue ? '#dc2626' : '#f59e0b',
                  color: 'white', border: 'none', borderRadius: '8px',
                  padding: '8px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Plus size={16} />
                Iniciar ahora
              </button>
            )}
          </div>
        )}

        {/* Estado general */}
        {stats.averageScore > 0 && (
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
            padding: '20px 24px', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Puntuación general del centro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '40px', fontWeight: '800', color: scoreColor, lineHeight: 1 }}>
                  {stats.averageScore}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '18px' }}>/100</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Inspecciones', value: stats.totalInspections, color: '#3b82f6' },
                { label: 'Issues críticos', value: stats.criticalIssues, color: '#dc2626' },
                { label: 'Tareas pend.', value: stats.pendingTasks, color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspecciones recientes */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>Inspecciones Recientes</h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>Últimas 5 inspecciones realizadas</p>
            </div>
          </div>

          <div style={{ padding: '16px 24px' }}>
            {recentInspections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <FileText size={44} color="#d1d5db" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>No hay inspecciones registradas</p>
                <button
                  onClick={onStartInspection}
                  style={{
                    backgroundColor: '#059669', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '10px 20px', fontSize: '14px',
                    fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Realizar primera inspección
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentInspections.map(inspection => {
                  const sc = inspection.overall_score >= 80 ? '#059669' :
                    inspection.overall_score >= 60 ? '#d97706' : '#dc2626';
                  return (
                    <div key={inspection.id} style={{
                      border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      gap: '12px', flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '2px' }}>
                          {new Date(inspection.inspection_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={13} /> {inspection.inspector_name}
                          </span>
                          <span style={{ color: '#10b981', fontSize: '13px' }}>✓ {inspection.items_ok} bien</span>
                          {inspection.items_regular > 0 && (
                            <span style={{ color: '#f59e0b', fontSize: '13px' }}>⚠ {inspection.items_regular} regular</span>
                          )}
                          {inspection.items_bad > 0 && (
                            <span style={{ color: '#dc2626', fontSize: '13px' }}>✗ {inspection.items_bad} crítico</span>
                          )}
                        </div>
                        {inspection.items_bad > 0 && (
                          <div style={{
                            marginTop: '8px', padding: '6px 10px',
                            backgroundColor: '#fef2f2', borderRadius: '6px',
                            fontSize: '12px', color: '#991b1b',
                            display: 'flex', alignItems: 'center', gap: '6px'
                          }}>
                            <AlertTriangle size={12} />
                            {inspection.items_bad} problema(s) crítico(s) detectado(s)
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: sc, lineHeight: 1 }}>
                          {inspection.overall_score}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>/ 100</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Info fotos obligatorias */}
        <div style={{
          marginTop: '20px', backgroundColor: '#eff6ff',
          borderRadius: '10px', padding: '16px 20px',
          border: '1px solid #dbeafe',
          display: 'flex', alignItems: 'flex-start', gap: '12px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Camera size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '4px', fontSize: '14px' }}>
              Fotos obligatorias en incidencias
            </div>
            <p style={{ color: '#1e40af', fontSize: '13px', margin: '0 0 6px' }}>
              Estados MAL y REGULAR requieren foto del deterioro. Las tareas no cierran sin foto de reparación.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1d4ed8' }}>
              <Bell size={12} />
              Problemas críticos notifican automáticamente a Beni ({MAINTENANCE_CALENDAR.beni_email})
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MaintenanceDashboard;
