// src/components/centers/accounting/AccountingReportesTab.tsx
import React from 'react';
import { TrendingUp, Calculator, Users, DollarSign, Lightbulb, Download, Calendar } from 'lucide-react';

interface Props {
  selectedYear: number;
  ivaAPagar: number;
  ivaRepercutido: number;
  ivaSoportado: number;
  onYearChange: (year: number) => void;
}

export const AccountingReportesTab: React.FC<Props> = ({
  selectedYear, ivaAPagar, ivaRepercutido, ivaSoportado, onYearChange,
}) => (
  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <TrendingUp style={{ width: '24px', height: '24px' }} />
      Análisis Financiero Avanzado
    </h2>
    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>
      Dashboard con análisis predictivo, previsiones fiscales y recomendaciones empresariales
    </p>

    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', alignItems: 'center' }}>
      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Período de análisis:</label>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const year = new Date().getFullYear() - 2 + i;
          return <option key={year} value={year}>{year}</option>;
        })}
      </select>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Evolución de Clientes */}
      <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users style={{ width: '20px', height: '20px' }} />
          Evolución de Clientes
        </h3>
        {[{ mes: 'Ene', clientes: 438, pct: 85 }, { mes: 'Feb', clientes: 445, pct: 87 }, { mes: 'Mar', clientes: 450, pct: 88 }].map(({ mes, clientes, pct }) => (
          <div key={mes} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{mes} {selectedYear}</span>
              <span style={{ fontSize: '12px', fontWeight: '500' }}>{clientes} clientes</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#0ea5e9', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1e40af' }}>📊 Insights de Clientes</h4>
          <ul style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
            <li>✅ Crecimiento estable: +2.8% en el trimestre</li>
            <li>🎯 Meta del trimestre: 450 clientes alcanzada</li>
            <li>📈 Tendencia positiva: 3 meses consecutivos de crecimiento</li>
          </ul>
        </div>
      </div>

      {/* Previsiones Fiscales */}
      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator style={{ width: '20px', height: '20px' }} />
          Previsiones Fiscales Trimestrales
        </h3>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>IVA Trimestral (Modelo 303)</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: ivaAPagar >= 0 ? '#dc2626' : '#059669' }}>€{ivaAPagar.toFixed(2)}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>📅 Próximo vencimiento: 20 de abril {selectedYear + 1}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
              <div style={{ fontWeight: '500', color: '#0ea5e9' }}>IVA Repercutido</div>
              <div>€{ivaRepercutido.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
              <div style={{ fontWeight: '500', color: '#dc2626' }}>IVA Soportado</div>
              <div>€{ivaSoportado.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#991b1b' }}>💰 Impacto Fiscal Trimestral</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div><div style={{ color: '#64748b' }}>Total impuestos</div><div style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '16px' }}>€6.430</div></div>
            <div><div style={{ color: '#64748b' }}>Días hasta vencimiento</div><div style={{ fontWeight: 'bold', color: '#059669', fontSize: '16px' }}>15 días</div></div>
          </div>
        </div>
      </div>

      {/* Flujo de Caja */}
      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign style={{ width: '20px', height: '20px' }} />
          Análisis de Flujo de Caja
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {[{ label: 'INGRESOS', value: '€26.858', bg: '#dcfce7', color: '#15803d' }, { label: 'GASTOS', value: '€18.420', bg: '#fee2e2', color: '#dc2626' }, { label: 'FLUJO NETO', value: '€8.438', bg: '#eff6ff', color: '#2563eb' }].map(({ label, value, bg, color }) => (
            <div key={label} style={{ textAlign: 'center', padding: '12px', backgroundColor: bg, borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#475569' }}>{label}</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#166534' }}>💡 Recomendaciones de Caja</h4>
          <ul style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
            <li>✅ Flujo positivo: +€8.438 este mes</li>
            <li>📈 Tendencia alcista: +8.9% vs mes anterior</li>
            <li>💰 Reserva recomendada: €25.000-€30.000</li>
          </ul>
        </div>
      </div>

      {/* Recomendaciones Estratégicas */}
      <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb style={{ width: '20px', height: '20px' }} />
          Recomendaciones Estratégicas
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[{ label: 'MARGEN', value: '31.4%' }, { label: 'ROI', value: '145%' }, { label: 'CRECIMIENTO', value: '+12.5%' }].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{label}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#7c3aed' }}>🚨 Alertas Importantes</h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>⚠️ IVA trimestral vence en 15 días</div>
            <div style={{ padding: '8px 12px', backgroundColor: '#dcfce7', border: '1px solid #16a34a', borderRadius: '6px', fontSize: '12px', color: '#166534' }}>✅ Todos los indicadores en verde</div>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#7c3aed' }}>🎯 Decisiones Recomendadas</h4>
          <ul style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
            <li><strong>Invertir en marketing:</strong> ROI del 145% justifica incremento del 15%</li>
            <li><strong>Optimizar gastos:</strong> Reducir suministros un 8% sin impactar operaciones</li>
            <li><strong>Preparar provisiones:</strong> Reservar €6.430 para impuestos</li>
          </ul>
        </div>
      </div>
    </div>

    <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
      <button style={{ padding: '12px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Download style={{ width: '16px', height: '16px' }} />
        Exportar Reporte PDF
      </button>
      <button style={{ padding: '12px 24px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar style={{ width: '16px', height: '16px' }} />
        Ver Calendario Fiscal
      </button>
    </div>
  </div>
);
