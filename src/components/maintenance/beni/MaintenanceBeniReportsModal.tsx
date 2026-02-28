// src/components/maintenance/beni/MaintenanceBeniReportsModal.tsx
import React from 'react';
import { ReportSummary } from './MaintenanceBeniTypes';

interface Props {
  reportData: ReportSummary;
  onClose: () => void;
}

export const MaintenanceBeniReportsModal: React.FC<Props> = ({ reportData, onClose }) => {
  const stats = reportData.overallStats;
  const centers = reportData.centers ?? [];
  const criticalIssues = reportData.criticalIssues ?? [];
  const recommendations = reportData.recommendations ?? [];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto', width: '95%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            📊 Reporte de Mantenimiento Trimestral
          </h2>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        {/* Resumen ejecutivo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Score General</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: (reportData.overallScore ?? 0) >= 80 ? '#10b981' : (reportData.overallScore ?? 0) >= 60 ? '#f59e0b' : '#ef4444' }}>
              {reportData.overallScore}%
            </div>
          </div>
          <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#166534' }}>Items OK</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats?.itemsOk}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>de {stats?.totalItems} total</div>
          </div>
          <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Items Regulares</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats?.itemsRegular}</div>
          </div>
          <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#991b1b' }}>Items Críticos</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stats?.itemsBad}</div>
          </div>
        </div>

        {/* Rendimiento por centro */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#374151' }}>📍 Rendimiento por Centro</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {centers.map((center, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px',
                  backgroundColor: center === reportData.bestCenter ? '#f0fdf4' : center === reportData.worstCenter ? '#fef2f2' : '#f9fafb',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                      🏪 {center.centerName}
                      {center === reportData.bestCenter && ' 🏆'}
                      {center === reportData.worstCenter && ' ⚠️'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Encargado: {center.assignedTo}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: (center.score ?? 0) >= 80 ? '#10b981' : (center.score ?? 0) >= 60 ? '#f59e0b' : '#ef4444' }}>
                      {center.score}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {center.itemsOk}✅ {center.itemsRegular}⚠️ {center.itemsBad}❌
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues críticos */}
        {criticalIssues.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: '#dc2626' }}>🚨 Issues Críticos</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {criticalIssues.slice(0, 5).map((issue, index) => (
                <div key={index} style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px' }}>
                  <strong>{issue.center}</strong> - {issue.zone}: {issue.concept}
                  {issue.observations && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>{issue.observations}</p>
                  )}
                </div>
              ))}
              {criticalIssues.length > 5 && (
                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  ... y {criticalIssues.length - 5} issues más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        {recommendations.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: '#374151' }}>💡 Recomendaciones</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {recommendations.map((rec, index) => (
                <div key={index} style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '12px', fontSize: '14px' }}>
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Reporte generado el {new Date().toLocaleDateString('es-ES')}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ padding: '12px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              Cerrar
            </button>
            <button onClick={() => window.print()} style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              Imprimir/PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
