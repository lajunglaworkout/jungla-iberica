import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Package, Handshake, Users, Briefcase, FileText, 
  Settings, ArrowLeft, Plus, Trash2, Save, Search, Filter, 
  ChevronDown, ChevronUp, Calendar, Download, Upload, BarChart2,
  PieChart, CreditCard, Clock, Tag, Home, Bell, User, LogOut,
  ChevronRight, MoreVertical, Check, X, AlertCircle, Info, ExternalLink,
  TrendingUp, TrendingDown, Menu, Building2, MapPin, Target,
  Zap, Handshake as Partnership, BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BrandIncomeModule from './BrandIncomeModule';

// Theme colors - Actualizado para coincidir con el CRM
const theme = {
  primary: '#059669',         // Verde principal del CRM
  secondary: '#047857',       // Verde oscuro
  accent: '#10b981',          // Verde claro
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  light: '#f9fafb',           // Fondo gris claro
  dark: '#111827',            // Texto oscuro
  border: '#e5e7eb',          // Bordes grises
  cardBg: '#ffffff',          // Fondo de tarjetas
  sidebarBg: '#064e3b',       // Fondo de barra lateral
  sidebarText: '#f0fdf4',     // Texto barra lateral
  sidebarHover: '#065f46',    // Hover barra lateral
  headerBg: '#ffffff',        // Fondo del encabezado
  headerText: '#111827',      // Texto del encabezado
};

interface IngresoMarca {
  id?: string;
  concepto: string;
  tipo: 'royalty' | 'merchandising' | 'arreglos' | 'acuerdo_colaboracion' | 'venta_franquicia' | 'otro';
  importe: number;
  iva: boolean;
  fecha: string;
  notas?: string;
}

interface GastoMarca {
  id?: string;
  concepto: string;
  tipo: 'personal' | 'software' | 'gestoria' | 'autonomo' | 'auditoria' | 'mantenimiento_web' | 'financiacion' | 'otro';
  importe: number;
  iva: boolean;
  fecha: string;
  notas?: string;
}

interface PeriodoContable {
  mes: number;
  año: number;
}

const TIPOS_INGRESO = [
  { value: 'royalty', label: 'Royalty de Centros' },
  { value: 'merchandising', label: 'Venta de Merchandising' },
  { value: 'arreglos', label: 'Arreglos y Mantenimientos' },
  { value: 'acuerdo_colaboracion', label: 'Acuerdos de Colaboración' },
  { value: 'venta_franquicia', label: 'Venta de Franquicias' },
  { value: 'otro', label: 'Otros Ingresos' },
];

const TIPOS_GASTO = [
  { value: 'personal', label: 'Personal' },
  { value: 'software', label: 'Herramientas de Software' },
  { value: 'gestoria', label: 'Gestoría' },
  { value: 'autonomo', label: 'Autónomos' },
  { value: 'auditoria', label: 'Auditorías' },
  { value: 'financiacion', label: 'Financiación' },
  { value: 'otro', label: 'Otros Gastos' },
];

const BrandAccountingModule: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  
  const handleBack = () => {
    setActiveModule('dashboard');
  };

  // Si estamos en el módulo de ingresos, mostrar ese componente
  if (activeModule === 'income') {
    return <BrandIncomeModule onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Marca</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => {/* Lógica de notificaciones */}}
                >
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notificaciones</span>
                </button>
                {/* Indicador de notificaciones sin leer */}
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">Administrador</p>
                  <p className="text-xs text-gray-500">Rol: Administrador</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pestañas de navegación */}
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resumen'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('ingresos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ingresos'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setActiveTab('gastos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gastos'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gastos
            </button>
            <button
              onClick={() => setActiveTab('informes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'informes'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Informes
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4">
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('resumen')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'resumen' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart2 className="h-5 w-5" />
                <span>Resumen Financiero</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('ingresos')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'ingresos' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span>Ingresos</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('gastos')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'gastos' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingDown className="h-5 w-5" />
                <span>Gastos</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('informes')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'informes' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-5 w-5" />
                <span>Informes</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('configuracion')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'configuracion' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'resumen' && 'Resumen Financiero'}
              {activeTab === 'ingresos' && 'Gestión de Ingresos'}
              {activeTab === 'gastos' && 'Gestión de Gastos'}
              {activeTab === 'informes' && 'Informes y Análisis'}
              {activeTab === 'configuracion' && 'Configuración'}
            </h2>
            
            <div className="mt-4">
              {activeTab === 'resumen' && (
                <div>
                  <p>Resumen financiero aquí</p>
                </div>
              )}
              
              {activeTab === 'ingresos' && (
                <div>
                  <p>Gestión de ingresos aquí</p>
                </div>
              )}
              
              {activeTab === 'gastos' && (
                <div>
                  <p>Gestión de gastos aquí</p>
                </div>
              )}
              
              {activeTab === 'informes' && (
                <div>
                  <p>Informes y análisis aquí</p>
                </div>
              )}
              
              {activeTab === 'configuracion' && (
                <div>
                  <p>Configuración aquí</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Modal Nuevo Ingreso */}
      {showModalNuevoIngreso && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Nuevo Ingreso</h3>
                <button 
                  onClick={() => setShowModalNuevoIngreso(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Concepto</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Descripción del ingreso"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Importe</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="aplicar-iva"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="aplicar-iva" className="ml-2 block text-sm text-gray-700">
                    Aplicar IVA (21%)
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModalNuevoIngreso(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Nuevo Gasto */}
      {showModalNuevoGasto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Nuevo Gasto</h3>
                <button 
                  onClick={() => setShowModalNuevoGasto(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Concepto</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Descripción del gasto"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Importe</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="incluir-iva"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="incluir-iva" className="ml-2 block text-sm text-gray-700">
                    Incluye IVA (21%)
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModalNuevoGasto(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandAccountingModule;
