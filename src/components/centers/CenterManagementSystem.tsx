import React, { useState } from 'react';
import { ArrowLeft, Calculator, ClipboardList, UserCheck, Settings, Euro, Users, TrendingUp, ArrowUp, BarChart3, DollarSign, Building2 } from 'lucide-react';
import AccountingModule from './AccountingModule';
import ClientsModule from './ClientsModule';
import ConfigModule from './ConfigModule';
import ChecklistModule from './ChecklistModule';

interface CenterManagementSystemProps {
  userEmail: string;
  userName: string;
  onBack: () => void;
}

type ModuleType = 'accounting' | 'checklist' | 'clients' | 'config';

const CenterManagementSystem: React.FC<CenterManagementSystemProps> = ({ userEmail, userName, onBack }) => {
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);

  // 🧹 DATOS RESETEADOS - Listos para datos reales
  const centersData = {
    'sevilla': { 
      name: 'Centro Sevilla', 
      revenue: 0, 
      expenses: 0, 
      clients: 0, 
      target: 0, 
      margin: 0, 
      growth: 0,
      depreciation: 0,
      amortization: 0,
      cashInflow: 0,
      cashOutflow: 0
    },
    'jerez': { 
      name: 'Centro Jerez', 
      revenue: 0, 
      expenses: 0, 
      clients: 0, 
      target: 0, 
      margin: 0, 
      growth: 0,
      depreciation: 0,
      amortization: 0,
      cashInflow: 0,
      cashOutflow: 0
    },
    'puerto': { 
      name: 'Centro Puerto', 
      revenue: 0, 
      expenses: 0, 
      clients: 0, 
      target: 0, 
      margin: 0, 
      growth: 0,
      depreciation: 0,
      amortization: 0,
      cashInflow: 0,
      cashOutflow: 0
    }
  };

  const totalRevenue = Object.values(centersData).reduce((sum, center) => sum + center.revenue, 0);
  const totalExpenses = Object.values(centersData).reduce((sum, center) => sum + center.expenses, 0);
  const totalClients = Object.values(centersData).reduce((sum, center) => sum + center.clients, 0);
  const totalTarget = Object.values(centersData).reduce((sum, center) => sum + center.target, 0);
  
  // Cálculo del EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization)
  const totalDepreciation = Object.values(centersData).reduce((sum, center) => sum + center.depreciation, 0);
  const totalAmortization = Object.values(centersData).reduce((sum, center) => sum + center.amortization, 0);
  const totalEBITDA = (totalRevenue - totalExpenses) + totalDepreciation + totalAmortization;
  
  // Cálculo del Flujo de Caja
  const totalCashInflow = Object.values(centersData).reduce((sum, center) => sum + center.cashInflow, 0);
  const totalCashOutflow = Object.values(centersData).reduce((sum, center) => sum + center.cashOutflow, 0);
  const totalCashFlow = totalCashInflow - totalCashOutflow;

  const handleModuleClick = (centerId: string, module: ModuleType) => {
    setSelectedCenter(centerId);
    setSelectedModule(module);
  };

  if (selectedCenter && selectedModule) {
    const centerData = centersData[selectedCenter as keyof typeof centersData];
    
    if (selectedModule === 'accounting') {
      return (
        <AccountingModule
          centerName={centerData.name}
          centerId={selectedCenter}
          onBack={() => { setSelectedCenter(null); setSelectedModule(null); }}
        />
      );
    }
    
    if (selectedModule === 'clients') {
      return (
        <ClientsModule
          centerName={centerData.name}
          centerId={selectedCenter}
          onBack={() => { setSelectedCenter(null); setSelectedModule(null); }}
        />
      );
    }
    
    
    if (selectedModule === 'config') {
      return (
        <ConfigModule
          centerName={centerData.name}
          centerId={selectedCenter}
          onBack={() => { setSelectedCenter(null); setSelectedModule(null); }}
        />
      );
    }
    
    if (selectedModule === 'checklist') {
      return (
        <ChecklistModule
          centerName={centerData.name}
          centerId={selectedCenter}
          onBack={() => { setSelectedCenter(null); setSelectedModule(null); }}
        />
      );
    }
    
    // Este return nunca debería ejecutarse ya que todos los módulos están implementados
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onBack} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>🏢 Gestión de Centros</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Panel de control financiero y operativo</p>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* KPIs Consolidados */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <Euro style={{ width: '24px', height: '24px', color: '#10b981', marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Facturación Total</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>€{totalRevenue.toLocaleString('es-ES')}</p>
          </div>
          
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <Users style={{ width: '24px', height: '24px', color: '#3b82f6', marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Clientes Totales</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{totalClients} / {totalTarget}</p>
          </div>
          
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <BarChart3 style={{ width: '24px', height: '24px', color: '#8b5cf6', marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>EBITDA</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: totalEBITDA >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
              €{totalEBITDA.toLocaleString('es-ES')}
            </p>
          </div>
          
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <DollarSign style={{ width: '24px', height: '24px', color: '#f59e0b', marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Flujo de Caja</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: totalCashFlow >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
              €{totalCashFlow.toLocaleString('es-ES')}
            </p>
          </div>
        </div>

        {/* Centros con Módulos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {Object.entries(centersData).map(([centerId, center]) => (
            <div key={centerId} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
                {center.name}
              </h3>
              
              {/* Métricas del Centro */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Facturación</p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>€{center.revenue.toLocaleString('es-ES')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Clientes</p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{center.clients}/{center.target}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Margen</p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#8b5cf6', margin: 0 }}>{center.margin}%</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Crecimiento</p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: center.growth >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
                    {center.growth >= 0 ? '+' : ''}{center.growth}%
                  </p>
                </div>
              </div>
              
              {/* Botones de Módulos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => handleModuleClick(centerId, 'accounting')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                >
                  <Calculator style={{ width: '16px', height: '16px' }} />
                  Contabilidad
                </button>
                
                <button
                  onClick={() => handleModuleClick(centerId, 'checklist')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  <ClipboardList style={{ width: '16px', height: '16px' }} />
                  Informes Checklist
                </button>
                
                <button
                  onClick={() => handleModuleClick(centerId, 'clients')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    marginTop: '12px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
                >
                  <Users style={{ width: '16px', height: '16px' }} />
                  Clientes
                </button>
                
                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={() => handleModuleClick(centerId, 'config')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      width: '100%',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                  >
                    <Settings style={{ width: '16px', height: '16px' }} />
                    Configuración
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CenterManagementSystem;
