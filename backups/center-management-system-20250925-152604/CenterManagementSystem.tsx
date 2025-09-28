import React, { useState } from 'react';
import { ArrowLeft, Calculator, ClipboardList, UserCheck, Settings, Euro, Users, TrendingUp, ArrowUp, BarChart3, DollarSign } from 'lucide-react';
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

  const centersData = {
    'sevilla': { 
      name: 'Centro Sevilla', 
      revenue: 22607.50, 
      expenses: 13978.72, 
      clients: 438, 
      target: 450, 
      margin: 38.2, 
      growth: 12.5,
      depreciation: 850.00,
      amortization: 320.00,
      cashInflow: 21800.00,
      cashOutflow: 13200.00
    },
    'jerez': { 
      name: 'Centro Jerez', 
      revenue: 18500.00, 
      expenses: 12200.00, 
      clients: 365, 
      target: 380, 
      margin: 34.1, 
      growth: 8.3,
      depreciation: 720.00,
      amortization: 280.00,
      cashInflow: 17950.00,
      cashOutflow: 11800.00
    },
    'puerto': { 
      name: 'Centro Puerto', 
      revenue: 15800.00, 
      expenses: 10500.00, 
      clients: 298, 
      target: 320, 
      margin: 33.5, 
      growth: 15.2,
      depreciation: 650.00,
      amortization: 250.00,
      cashInflow: 15200.00,
      cashOutflow: 10100.00
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
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
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
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: totalEBITDA >= 0 ? '#10b981' : '#ef4444' }}>
              €{totalEBITDA.toLocaleString('es-ES')}
            </p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <DollarSign style={{ width: '24px', height: '24px', color: '#f59e0b', marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Flujo de Caja</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: totalCashFlow >= 0 ? '#10b981' : '#ef4444' }}>
              €{totalCashFlow.toLocaleString('es-ES')}
            </p>
          </div>
        </div>

        {/* Centros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
          {Object.entries(centersData).map(([centerId, center]) => (
            <div key={centerId} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>{center.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>FACTURACIÓN</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>€{center.revenue.toLocaleString('es-ES')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>CLIENTES</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{center.clients} / {center.target}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={() => handleModuleClick(centerId, 'accounting')} style={{ padding: '12px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <Calculator style={{ width: '16px', height: '16px' }} />
                  Contabilidad
                </button>
                <button onClick={() => handleModuleClick(centerId, 'checklist')} style={{ padding: '12px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <ClipboardList style={{ width: '16px', height: '16px' }} />
                  Informes
                </button>
                <button onClick={() => handleModuleClick(centerId, 'clients')} style={{ padding: '12px 16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <UserCheck style={{ width: '16px', height: '16px' }} />
                  Clientes
                </button>
                <button onClick={() => handleModuleClick(centerId, 'config')} style={{ padding: '12px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <Settings style={{ width: '16px', height: '16px' }} />
                  Configuración
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CenterManagementSystem;
