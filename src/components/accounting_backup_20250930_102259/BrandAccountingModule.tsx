import React, { useState } from 'react';
import { 
  DollarSign, Users, Target, Building2, BarChart3, ArrowLeft,
  TrendingUp, FileText, Handshake, MapPin, Calculator, PieChart
} from 'lucide-react';
import BrandIncomeModule from './BrandIncomeModule';

interface BrandAccountingModuleProps {
  onBack?: () => void;
}

const BrandAccountingModule: React.FC<BrandAccountingModuleProps> = ({ onBack }) => {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setActiveModule('dashboard');
    }
  };

  // Si estamos en el módulo de ingresos, mostrar ese componente
  if (activeModule === 'income') {
    return <BrandIncomeModule onBack={() => setActiveModule('dashboard')} />;
  }

  // Módulos disponibles basados en la estructura definida
  const modules = [
    {
      id: 'income',
      title: '💰 Contabilidad y Finanzas',
      description: 'Gestión de ingresos, gastos y reportes financieros',
      icon: <DollarSign style={{ width: '32px', height: '32px' }} />,
      color: '#10b981',
      items: ['Ingresos y Gastos', 'Gestión de Pedidos', 'Facturas', 'Reportes']
    },
    {
      id: 'sales',
      title: '🎯 Ventas y Leads',
      description: 'Gestión de leads, inversores y análisis de zona',
      icon: <Target style={{ width: '32px', height: '32px' }} />,
      color: '#3b82f6',
      items: ['Directorio de Leads', 'Pipeline de Ventas', 'Análisis de Zona', 'Participaciones']
    },
    {
      id: 'partnerships',
      title: '🤝 Colaboraciones',
      description: 'Acuerdos comerciales e influencers',
      icon: <Handshake style={{ width: '32px', height: '32px' }} />,
      color: '#8b5cf6',
      items: ['Acuerdos Comerciales', 'Influencers', 'Campañas', 'ROI']
    },
    {
      id: 'openings',
      title: '🏗️ Seguimiento de Aperturas',
      description: 'Gestión de proyectos y nuevas ubicaciones',
      icon: <Building2 style={{ width: '32px', height: '32px' }} />,
      color: '#f59e0b',
      items: ['Proyectos Activos', 'Timeline', 'Documentación', 'Estados']
    },
    {
      id: 'analytics',
      title: '📊 Analytics y Reportes',
      description: 'Métricas, estimaciones y análisis',
      icon: <BarChart3 style={{ width: '32px', height: '32px' }} />,
      color: '#6366f1',
      items: ['Estimaciones', 'Métricas', 'Reportes Ejecutivos', 'Tendencias']
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderBottom: '1px solid #e5e7eb', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px' 
      }}>
        {onBack && (
          <button 
            onClick={handleBack} 
            style={{ 
              padding: '8px', 
              backgroundColor: '#f3f4f6', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
          >
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: 0 }}>🏢 Gestión de Marca</h1>
          <p style={{ color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>Sistema integral de gestión para La Jungla</p>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Dashboard Overview */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            {/* KPIs rápidos */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
              borderLeft: '4px solid #10b981' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Ingresos del Mes</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: '4px 0 0 0' }}>€45,230</p>
                </div>
                <TrendingUp style={{ width: '32px', height: '32px', color: '#10b981' }} />
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
              borderLeft: '4px solid #3b82f6' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Leads Activos</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', margin: '4px 0 0 0' }}>127</p>
                </div>
                <Users style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
              borderLeft: '4px solid #8b5cf6' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Colaboraciones</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', margin: '4px 0 0 0' }}>23</p>
                </div>
                <Handshake style={{ width: '32px', height: '32px', color: '#8b5cf6' }} />
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
              borderLeft: '4px solid #f59e0b' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Proyectos Activos</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', margin: '4px 0 0 0' }}>8</p>
                </div>
                <Building2 style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Módulos principales */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>Módulos del Sistema</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '24px' 
          }}>
            {modules.map((module) => (
              <div 
                key={module.id}
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                  cursor: 'pointer', 
                  border: '1px solid #e5e7eb', 
                  overflow: 'hidden',
                  transition: 'box-shadow 0.3s ease'
                }}
                onClick={() => setActiveModule(module.id)}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ backgroundColor: module.color, padding: '16px', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {module.icon}
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{module.title}</h3>
                      <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0 0' }}>{module.description}</p>
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '16px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {module.items.map((item, index) => (
                      <li key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontSize: '14px', 
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}>
                        <div style={{ 
                          width: '6px', 
                          height: '6px', 
                          backgroundColor: '#9ca3af', 
                          borderRadius: '50%' 
                        }}></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <button style={{ 
                    marginTop: '16px', 
                    width: '100%', 
                    backgroundColor: '#f3f4f6', 
                    color: '#374151', 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    border: 'none',
                    fontSize: '14px', 
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                  >
                    Acceder al Módulo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          padding: '24px' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Accesos Rápidos</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '16px' 
          }}>
            <button 
              onClick={() => setActiveModule('income')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '16px', 
                backgroundColor: '#ecfdf5', 
                borderRadius: '8px', 
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#d1fae5'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ecfdf5'}
            >
              <Calculator style={{ width: '24px', height: '24px', color: '#059669' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#047857' }}>Nueva Factura</span>
            </button>
            
            <button style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '16px', 
              backgroundColor: '#eff6ff', 
              borderRadius: '8px', 
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dbeafe'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#eff6ff'}
            >
              <Users style={{ width: '24px', height: '24px', color: '#2563eb' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#1d4ed8' }}>Nuevo Lead</span>
            </button>
            
            <button style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '16px', 
              backgroundColor: '#faf5ff', 
              borderRadius: '8px', 
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3e8ff'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#faf5ff'}
            >
              <Handshake style={{ width: '24px', height: '24px', color: '#7c3aed' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6d28d9' }}>Nueva Colaboración</span>
            </button>
            
            <button style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '16px', 
              backgroundColor: '#eef2ff', 
              borderRadius: '8px', 
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e0e7ff'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#eef2ff'}
            >
              <PieChart style={{ width: '24px', height: '24px', color: '#4f46e5' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#4338ca' }}>Ver Reportes</span>
            </button>
          </div>
        </div>

        {/* Próximamente */}
        <div style={{ 
          marginTop: '32px', 
          background: 'linear-gradient(to right, #eff6ff, #faf5ff)', 
          borderRadius: '12px', 
          padding: '24px', 
          border: '1px solid #dbeafe' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>🚀 Próximamente</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px', margin: '0 0 16px 0' }}>
            Estamos desarrollando nuevas funcionalidades para mejorar tu experiencia de gestión.
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px', 
            fontSize: '14px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
              <span>Dashboard de métricas en tiempo real</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#8b5cf6', borderRadius: '50%' }}></div>
              <span>Automatización de procesos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span>Integración con APIs externas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAccountingModule;
