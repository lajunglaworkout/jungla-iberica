// src/components/maintenance/beni/MaintenanceBeniKpiPanel.tsx
import React from 'react';
import { KpiSummary } from './MaintenanceBeniTypes';

interface Props {
  kpiData: KpiSummary;
  loadingKpis: boolean;
}

export const MaintenanceBeniKpiPanel: React.FC<Props> = ({ kpiData, loadingKpis }) => {
  if (!kpiData.hasData) {
    return (
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '48px 24px',
        marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
          Dashboard de KPIs de Mantenimiento
        </h2>
        <div style={{ color: '#6b7280', fontSize: '16px', marginBottom: '8px' }}>{kpiData.message}</div>
        <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
          Una vez que los encargados completen las revisiones trimestrales, aquí verás métricas en tiempo real,
          rankings por centro, issues críticos y tendencias de rendimiento.
        </p>
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
            💡 <strong>Próximos KPIs disponibles:</strong> Score General, Ranking de Centros, Issues Críticos, Tendencias
          </p>
        </div>
      </div>
    );
  }

  const stats = kpiData.overallStats;
  const centers = kpiData.centers ?? [];
  const criticalIssues = kpiData.criticalIssues ?? [];
  const trends = kpiData.trends;

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '12px', padding: '24px',
      marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📊 KPIs de Mantenimiento en Tiempo Real
        {loadingKpis ? (
          <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>(Actualizando...)</span>
        ) : (
          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'normal' }}>
            • Actualizado {new Date().toLocaleTimeString('es-ES')}
          </span>
        )}
      </h2>

      {/* Métricas principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '2px solid #bfdbfe' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '14px' }}>Score General</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: (kpiData.overallScore ?? 0) >= 80 ? '#10b981' : (kpiData.overallScore ?? 0) >= 60 ? '#f59e0b' : '#ef4444' }}>
            {kpiData.overallScore}%
          </div>
          {trends && (
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {trends.improvement > 0 ? '📈' : '📉'} {Math.abs(trends.improvement)}% vs anterior
            </div>
          )}
        </div>
        <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '14px' }}>Items OK</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{stats?.itemsOk}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>de {stats?.totalItems} total</div>
        </div>
        <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '14px' }}>Items Regulares</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{stats?.itemsRegular}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Requieren atención</div>
        </div>
        <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '14px' }}>Items Críticos</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{stats?.itemsBad}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Acción inmediata</div>
        </div>
        <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>Centros Completados</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6b7280' }}>{stats?.completedCenters}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>En esta revisión</div>
        </div>
      </div>

      {/* Ranking de centros */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px', color: '#374151', fontSize: '16px' }}>🏆 Ranking por Centro</h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {[...centers].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3).map((center, index) => (
            <div key={index} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderRadius: '6px',
              backgroundColor: index === 0 ? '#f0fdf4' : '#f9fafb',
              border: index === 0 ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{center.centerName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {center.itemsOk}✅ {center.itemsRegular}⚠️ {center.itemsBad}❌
                </span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: (center.score ?? 0) >= 80 ? '#10b981' : (center.score ?? 0) >= 60 ? '#f59e0b' : '#ef4444' }}>
                  {center.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues críticos */}
      {criticalIssues.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '12px', color: '#dc2626', fontSize: '16px' }}>🚨 Issues Críticos Activos</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {criticalIssues.slice(0, 3).map((issue, index) => (
              <div key={index} style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', fontSize: '14px' }}>
                <strong>{issue.center}</strong> - {issue.zone}: {issue.concept}
                <span style={{
                  marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600',
                  backgroundColor: issue.priority === 'alta' ? '#dc2626' : '#f59e0b', color: 'white',
                }}>
                  {issue.priority?.toUpperCase()}
                </span>
              </div>
            ))}
            {criticalIssues.length > 3 && (
              <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', margin: '8px 0 0 0' }}>
                ... y {criticalIssues.length - 3} issues más
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
