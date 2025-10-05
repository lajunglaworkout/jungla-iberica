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
      icon: <DollarSign className="w-8 h-8" />,
      color: 'bg-green-500',
      items: ['Ingresos y Gastos', 'Gestión de Pedidos', 'Facturas', 'Reportes']
    },
    {
      id: 'sales',
      title: '🎯 Ventas y Leads',
      description: 'Gestión de leads, inversores y análisis de zona',
      icon: <Target className="w-8 h-8" />,
      color: 'bg-blue-500',
      items: ['Directorio de Leads', 'Pipeline de Ventas', 'Análisis de Zona', 'Participaciones']
    },
    {
      id: 'partnerships',
      title: '🤝 Colaboraciones',
      description: 'Acuerdos comerciales e influencers',
      icon: <Handshake className="w-8 h-8" />,
      color: 'bg-purple-500',
      items: ['Acuerdos Comerciales', 'Influencers', 'Campañas', 'ROI']
    },
    {
      id: 'openings',
      title: '🏗️ Seguimiento de Aperturas',
      description: 'Gestión de proyectos y nuevas ubicaciones',
      icon: <Building2 className="w-8 h-8" />,
      color: 'bg-orange-500',
      items: ['Proyectos Activos', 'Timeline', 'Documentación', 'Estados']
    },
    {
      id: 'analytics',
      title: '📊 Analytics y Reportes',
      description: 'Métricas, estimaciones y análisis',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'bg-indigo-500',
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

      <div className="p-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* KPIs rápidos */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingresos del Mes</p>
                  <p className="text-2xl font-bold text-green-600">€45,230</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Leads Activos</p>
                  <p className="text-2xl font-bold text-blue-600">127</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Colaboraciones</p>
                  <p className="text-2xl font-bold text-purple-600">23</p>
                </div>
                <Handshake className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Proyectos Activos</p>
                  <p className="text-2xl font-bold text-orange-600">8</p>
                </div>
                <Building2 className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Módulos principales */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <div 
                key={module.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
                onClick={() => setActiveModule(module.id)}
              >
                <div className={`${module.color} p-4 text-white`}>
                  <div className="flex items-center gap-3">
                    {module.icon}
                    <div>
                      <h3 className="text-lg font-bold">{module.title}</h3>
                      <p className="text-sm opacity-90">{module.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <ul className="space-y-2">
                    {module.items.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <button className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                    Acceder al Módulo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setActiveModule('income')}
              className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Calculator className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-green-700">Nueva Factura</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Nuevo Lead</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Handshake className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Nueva Colaboración</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <PieChart className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Ver Reportes</span>
            </button>
          </div>
        </div>

        {/* Próximamente */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">🚀 Próximamente</h3>
          <p className="text-gray-600 mb-4">
            Estamos desarrollando nuevas funcionalidades para mejorar tu experiencia de gestión.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Dashboard de métricas en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Automatización de procesos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Integración con APIs externas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAccountingModule;
