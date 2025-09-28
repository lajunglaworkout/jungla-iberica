import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Users, Euro, Target, BarChart3, PieChart, Calendar, AlertTriangle, DollarSign, UserPlus, ArrowUp, ArrowDown } from 'lucide-react';

interface CenterDetailViewProps {
  centerId: string;
  onBack: () => void;
}

const CenterDetailView: React.FC<CenterDetailViewProps> = ({ centerId, onBack }) => {
  const centerData = {
    'sevilla': {
      name: 'Centro Sevilla', revenue: 22607.50, expenses: 13978.72, clients: 438, target: 450,
      avgFee: 42.25, leads: 54, altas: 37, bajas: 18, margin: 38.2, growth: 12.5,
      services: { personal: 2800, fisio: 850, nutricion: 457.50 },
      prevYear: { revenue: 20150, clients: 415 }
    },
    'jerez': {
      name: 'Centro Jerez', revenue: 18500.00, expenses: 12200.00, clients: 365, target: 380,
      avgFee: 41.64, leads: 42, altas: 29, bajas: 15, margin: 34.1, growth: 8.3,
      services: { personal: 2100, fisio: 650, nutricion: 350 },
      prevYear: { revenue: 17100, clients: 340 }
    },
    'puerto': {
      name: 'Centro Puerto', revenue: 15800.00, expenses: 10500.00, clients: 298, target: 320,
      avgFee: 41.95, leads: 35, altas: 22, bajas: 12, margin: 33.5, growth: 15.2,
      services: { personal: 1800, fisio: 900, nutricion: 400 },
      prevYear: { revenue: 13700, clients: 275 }
    }
  };

  const data = centerData[centerId as keyof typeof centerData];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button onClick={onBack} style={{
          padding: '8px',
          backgroundColor: '#f3f4f6',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            {data?.name}
          </h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
            Análisis Completo - Sept 2025 | Cuota Media: €{data?.avgFee} | Objetivo: {data?.clients}/{data?.target} clientes
          </p>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <Euro style={{ width: '24px', height: '24px', color: '#10b981', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#6b7280' }}>Facturación</h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold' }}>
              €{data?.revenue.toLocaleString('es-ES')}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#10b981' }}>
              <ArrowUp style={{ width: '12px', height: '12px', display: 'inline' }} /> +{data?.growth}% vs año anterior
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <Users style={{ width: '24px', height: '24px', color: '#3b82f6', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#6b7280' }}>Clientes</h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold' }}>
              {data?.clients} / {data?.target}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              Objetivo: {((data?.clients / data?.target) * 100).toFixed(1)}% | +{data?.altas} altas | -{data?.bajas} bajas
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <TrendingUp style={{ width: '24px', height: '24px', color: '#059669', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#6b7280' }}>Beneficio Neto</h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
              €{(data?.revenue - data?.expenses).toLocaleString('es-ES')}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              Margen: {data?.margin}% | Gastos: €{data?.expenses.toLocaleString('es-ES')}
            </p>
          </div>

          {/* Más KPIs */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <DollarSign style={{ width: '24px', height: '24px', color: '#8b5cf6', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#6b7280' }}>Cuota Media</h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold' }}>€{data?.avgFee}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Por cliente/mes</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <BarChart3 style={{ width: '24px', height: '24px', color: '#f59e0b', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#6b7280' }}>Servicios Extras</h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold' }}>
              €{(data?.services.personal + data?.services.fisio + data?.services.nutricion).toLocaleString('es-ES')}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              Personal: €{data?.services.personal} | Fisio: €{data?.services.fisio}
            </p>
          </div>
        </div>

        {/* Comparativa Año Anterior */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            📊 Comparativa vs Año Anterior
          </h2>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>Facturación 2024</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>€{data?.prevYear.revenue.toLocaleString('es-ES')}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>Crecimiento</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>+{data?.growth}%</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>Clientes 2024</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{data?.prevYear.clients}</p>
            </div>
          </div>
        </div>

        {/* Desglose de Gastos */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>💸 Desglose de Gastos</h2>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', backgroundColor: '#fef3c7' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#92400e' }}>Alquiler</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>€{(data?.expenses * 0.15).toFixed(0)}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', backgroundColor: '#fecaca' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#991b1b' }}>Nóminas</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>€{(data?.expenses * 0.60).toFixed(0)}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', backgroundColor: '#dbeafe' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#1e40af' }}>Suministros</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>€{(data?.expenses * 0.12).toFixed(0)}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', backgroundColor: '#e0e7ff' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#3730a3' }}>Marketing</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>€{(data?.expenses * 0.08).toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Previsiones */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>🔮 Previsión Octubre</h2>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>Facturación Prevista</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>€{(data?.revenue * 1.05).toFixed(0)}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>Clientes Objetivo</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{data?.target}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>Margen Esperado</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>{(data?.margin + 1).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Ratios Clave */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>📊 Ratios Clave</h2>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>ROI</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                {((data?.revenue - data?.expenses) / data?.expenses * 100).toFixed(1)}%
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Conversión Leads</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {((data?.altas / data?.leads) * 100).toFixed(1)}%
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Retención</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {(((data?.clients - data?.bajas) / data?.clients) * 100).toFixed(1)}%
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Coste/Cliente</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                €{(data?.expenses / data?.clients).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterDetailView;
