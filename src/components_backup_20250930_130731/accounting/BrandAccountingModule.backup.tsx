import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Package, Handshake, Users, Briefcase, FileText, 
  Settings, ArrowLeft, Plus, Trash2, Save, Search, Filter, 
  ChevronDown, ChevronUp, Calendar, Download, Upload, BarChart2,
  PieChart, CreditCard, Clock, Tag, Home, Bell, User, LogOut,
  ChevronRight, MoreVertical, Check, X, AlertCircle, Info, ExternalLink,
  TrendingUp, TrendingDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Theme colors
const theme = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  light: '#f8fafc',
  dark: '#0f172a',
  border: '#e2e8f0',
  cardBg: '#ffffff',
  sidebarBg: '#1e293b',
  sidebarText: '#f8fafc',
  sidebarHover: '#334155',
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
  const [showBackButton] = useState(false);
  const [periodo, setPeriodo] = useState<PeriodoContable>({
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear()
  });
  
  // Estados para la interfaz
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModalNuevoIngreso, setShowModalNuevoIngreso] = useState(false);
  const [showModalNuevoGasto, setShowModalNuevoGasto] = useState(false);
  
  // Datos de ejemplo para el resumen
  const [resumen, setResumen] = useState({
    ingresos: 0,
    gastos: 0,
    balance: 0,
    ivaPagado: 0,
    ivaCobrado: 0
  });

  const [ingresos, setIngresos] = useState<IngresoMarca[]>([]);
  const [gastos, setGastos] = useState<GastoMarca[]>([]);
  const [nuevoIngreso, setNuevoIngreso] = useState<Omit<IngresoMarca, 'id'>>({ 
    concepto: '',
    concepto: '', 
    tipo: 'royalty',
    importe: 0,
    iva: true,
    fecha: new Date().toISOString().split('T')[0],
    notas: ''
  });
  
  const [nuevoGasto, setNuevoGasto] = useState<Omit<GastoMarca, 'id'>>({ 
    concepto: '', 
    tipo: 'personal',
    importe: 0,
    iva: false,
    fecha: new Date().toISOString().split('T')[0],
    notas: ''
  });

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);

  // Cargar datos del período actual
  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      // Cargar ingresos
      const { data: ingresosData, error: errorIngresos } = await supabase
        .from('ingresos_marca')
        .select('*')
        .eq('mes', periodo.mes)
        .eq('año', periodo.año);

      if (errorIngresos) throw errorIngresos;

      // Cargar gastos
      const { data: gastosData, error: errorGastos } = await supabase
        .from('gastos_marca')
        .select('*')
        .eq('mes', periodo.mes)
        .eq('año', periodo.año);

      if (errorGastos) throw errorGastos;

      setIngresos(ingresosData || []);
      setGastos(gastosData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setMensaje({ texto: 'Error al cargar los datos', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const agregarIngreso = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('ingresos_marca')
        .insert([{ ...nuevoIngreso, mes: periodo.mes, año: periodo.año }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setIngresos([...ingresos, data[0]]);
        setNuevoIngreso({ 
          concepto: '', 
          tipo: 'royalty',
          importe: 0,
          iva: true,
          fecha: new Date().toISOString().split('T')[0],
          notas: ''
        });
        setMensaje({ texto: 'Ingreso agregado correctamente', tipo: 'exito' });
      }
    } catch (error) {
      console.error('Error agregando ingreso:', error);
      setMensaje({ texto: 'Error al agregar el ingreso', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const agregarGasto = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('gastos_marca')
        .insert([{ ...nuevoGasto, mes: periodo.mes, año: periodo.año }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setGastos([...gastos, data[0]]);
        setNuevoGasto({ 
          concepto: '', 
          tipo: 'personal',
          importe: 0,
          iva: false,
          fecha: new Date().toISOString().split('T')[0],
          notas: ''
        });
        setMensaje({ texto: 'Gasto agregado correctamente', tipo: 'exito' });
      }
    } catch (error) {
      console.error('Error agregando gasto:', error);
      setMensaje({ texto: 'Error al agregar el gasto', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const eliminarIngreso = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este ingreso?')) return;
    
    try {
      setCargando(true);
      const { error } = await supabase
        .from('ingresos_marca')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIngresos(ingresos.filter(i => i.id !== id));
      setMensaje({ texto: 'Ingreso eliminado correctamente', tipo: 'exito' });
    } catch (error) {
      console.error('Error eliminando ingreso:', error);
      setMensaje({ texto: 'Error al eliminar el ingreso', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const eliminarGasto = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este gasto?')) return;
    
    try {
      setCargando(true);
      const { error } = await supabase
        .from('gastos_marca')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGastos(gastos.filter(g => g.id !== id));
      setMensaje({ texto: 'Gasto eliminado correctamente', tipo: 'exito' });
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      setMensaje({ texto: 'Error al eliminar el gasto', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  // Calcular totales
  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + (ingreso.importe * (ingreso.iva ? 1.21 : 1)), 0);
  const totalGastos = gastos.reduce((sum, gasto) => sum + (gasto.importe * (gasto.iva ? 1.21 : 1)), 0);
  const balance = totalIngresos - totalGastos;

  // Filtrar por tipo para resúmenes
  const ingresosPorTipo = TIPOS_INGRESO.map(tipo => ({
    tipo: tipo.label,
    total: ingresos
      .filter(i => i.tipo === tipo.value)
      .reduce((sum, ingreso) => sum + (ingreso.importe * (ingreso.iva ? 1.21 : 1)), 0)
  }));

  const gastosPorTipo = TIPOS_GASTO.map(tipo => ({
    tipo: tipo.label,
    total: gastos
      .filter(g => g.tipo === tipo.value)
      .reduce((sum, gasto) => sum + (gasto.importe * (gasto.iva ? 1.21 : 1)), 0)
  }));

  // Renderizar la interfaz principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Marca</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
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
          {/* Barra de herramientas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'resumen' && 'Resumen Financiero'}
                {activeTab === 'ingresos' && 'Gestión de Ingresos'}
                {activeTab === 'gastos' && 'Gestión de Gastos'}
                {activeTab === 'informes' && 'Informes y Análisis'}
                {activeTab === 'configuracion' && 'Configuración'}
              </h2>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-1 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={() => {
                    if (activeTab === 'ingresos') setShowModalNuevoIngreso(true);
                    if (activeTab === 'gastos') setShowModalNuevoGasto(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={!['ingresos', 'gastos'].includes(activeTab)}
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    {activeTab === 'ingresos' && 'Nuevo Ingreso'}
                    {activeTab === 'gastos' && 'Nuevo Gasto'}
                    {!['ingresos', 'gastos'].includes(activeTab) && 'Nuevo'}
                  </span>
                </button>
              </div>
            </div>

            {/* Filtros avanzados */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                    <select
                      value={`${periodo.mes}/${periodo.año}`}
                      onChange={(e) => {
                        const [mes, año] = e.target.value.split('/').map(Number);
                        setPeriodo({ mes, año });
                      }}
                      className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const date = new Date();
                        date.setMonth(date.getMonth() - i);
                        const mes = date.getMonth() + 1;
                        const año = date.getFullYear();
                        return (
                          <option key={`${mes}-${año}`} value={`${mes}/${año}`}>
                            {new Date(año, mes - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todas las categorías</option>
                      {activeTab === 'ingresos' && TIPOS_INGRESO.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                      {activeTab === 'gastos' && TIPOS_GASTO.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                    <select className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="fecha_desc">Fecha (más reciente primero)</option>
                      <option value="fecha_asc">Fecha (más antiguo primero)</option>
                      <option value="monto_desc">Monto (mayor a menor)</option>
                      <option value="monto_asc">Monto (menor a mayor)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

      {/* Selector de período */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">Período Contable:</h2>
          <select
            value={periodo.mes}
            onChange={(e) => setPeriodo({...periodo, mes: parseInt(e.target.value)})}
            className="border rounded px-3 py-2"
          >
            {Array.from({length: 12}, (_, i) => i + 1).map((mes) => (
              <option key={mes} value={mes}>
                {new Date(2000, mes - 1, 1).toLocaleString('es-ES', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={periodo.año}
            onChange={(e) => setPeriodo({...periodo, año: parseInt(e.target.value)})}
            className="border rounded px-3 py-2"
          >
            {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map((año) => (
              <option key={año} value={año}>
                {año}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Ingresos Totales</h3>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold mt-2">€{totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Gastos Totales</h3>
            <DollarSign className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold mt-2">€{totalGastos.toFixed(2)}</p>
        </div>
        <div className={`p-4 rounded-lg shadow ${
          balance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Resultado</h3>
            <DollarSign className={`h-5 w-5 ${balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`} />
          </div>
          <p className={`text-2xl font-bold mt-2 ${
            balance >= 0 ? 'text-blue-700' : 'text-yellow-700'
          }`}>
            €{Math.abs(balance).toFixed(2)} {balance >= 0 ? '(Beneficio)' : '(Pérdida)'}
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`p-4 mb-6 rounded-lg ${
          mensaje?.tipo === 'exito' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {mensaje?.texto}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de Ingresos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center">
            <DollarSign className="mr-2 h-5 w-5" /> Ingresos
          </h2>
          
          {/* Formulario para nuevo ingreso */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3 text-gray-700">Nuevo Ingreso</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={nuevoIngreso.tipo}
                  onChange={(e) => setNuevoIngreso({...nuevoIngreso, tipo: e.target.value as any})}
                  className="w-full border rounded px-3 py-2"
                >
                  {TIPOS_INGRESO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                <input
                  type="text"
                  value={nuevoIngreso.concepto}
                  onChange={(e) => setNuevoIngreso({...nuevoIngreso, concepto: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: Royalty centro Sevilla"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={nuevoIngreso.importe || ''}
                    onChange={(e) => setNuevoIngreso({...nuevoIngreso, importe: parseFloat(e.target.value) || 0})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={nuevoIngreso.iva}
                      onChange={(e) => setNuevoIngreso({...nuevoIngreso, iva: e.target.checked})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Incluye IVA (21%)</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={nuevoIngreso.fecha}
                  onChange={(e) => setNuevoIngreso({...nuevoIngreso, fecha: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={nuevoIngreso.notas || ''}
                  onChange={(e) => setNuevoIngreso({...nuevoIngreso, notas: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                  placeholder="Detalles adicionales"
                />
              </div>
              
              <button
                onClick={agregarIngreso}
                disabled={cargando || !nuevoIngreso.concepto || nuevoIngreso.importe <= 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 flex items-center justify-center"
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Ingreso
              </button>
            </div>
          </div>
          
          {/* Lista de ingresos */}
          <div className="mt-6">
            <h3 className="font-medium mb-3 text-gray-700">Ingresos Registrados</h3>
            {ingresos.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No hay ingresos registrados para este período.</p>
            ) : (
              <div className="space-y-3">
                {ingresos.map((ingreso) => {
                  const tipoIngreso = TIPOS_INGRESO.find(t => t.value === ingreso.tipo)?.label || ingreso.tipo;
                  const importeTotal = ingreso.iva ? ingreso.importe * 1.21 : ingreso.importe;
                  
                  return (
                    <div key={ingreso.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{ingreso.concepto}</p>
                          <p className="text-sm text-gray-500">{tipoIngreso} • {new Date(ingreso.fecha).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{importeTotal.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            {ingreso.iva ? 'IVA incluido' : 'Sin IVA'}
                            {ingreso.notas && ' • ' + ingreso.notas}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => eliminarIngreso(ingreso.id!)}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Resumen de ingresos por tipo */}
          <div className="mt-8">
            <h3 className="font-medium mb-3 text-gray-700">Resumen por Tipo</h3>
            <div className="space-y-2">
              {ingresosPorTipo
                .filter(item => item.total > 0)
                .map((item) => (
                  <div key={item.tipo} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.tipo}:</span>
                    <span className="font-medium">€{item.total.toFixed(2)}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Sección de Gastos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-red-700 flex items-center">
            <DollarSign className="mr-2 h-5 w-5" /> Gastos
          </h2>
          
          {/* Formulario para nuevo gasto */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3 text-gray-700">Nuevo Gasto</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={nuevoGasto.tipo}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, tipo: e.target.value as any})}
                  className="w-full border rounded px-3 py-2"
                >
                  {TIPOS_GASTO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                <input
                  type="text"
                  value={nuevoGasto.concepto}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, concepto: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: Factura gestoría trimestral"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={nuevoGasto.importe || ''}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, importe: parseFloat(e.target.value) || 0})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={nuevoGasto.iva}
                      onChange={(e) => setNuevoGasto({...nuevoGasto, iva: e.target.checked})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Incluye IVA (21%)</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={nuevoGasto.fecha}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, fecha: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={nuevoGasto.notas || ''}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, notas: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                  placeholder="Detalles adicionales"
                />
              </div>
              
              <button
                onClick={agregarGasto}
                disabled={cargando || !nuevoGasto.concepto || nuevoGasto.importe <= 0}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 flex items-center justify-center"
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Gasto
              </button>
            </div>
          </div>
          
          {/* Lista de gastos */}
          <div className="mt-6">
            <h3 className="font-medium mb-3 text-gray-700">Gastos Registrados</h3>
            {gastos.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No hay gastos registrados para este período.</p>
            ) : (
              <div className="space-y-3">
                {gastos.map((gasto) => {
                  const tipoGasto = TIPOS_GASTO.find(t => t.value === gasto.tipo)?.label || gasto.tipo;
                  const importeTotal = gasto.iva ? gasto.importe * 1.21 : gasto.importe;
                  
                  return (
                    <div key={gasto.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{gasto.concepto}</p>
                          <p className="text-sm text-gray-500">{tipoGasto} • {new Date(gasto.fecha).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{importeTotal.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            {gasto.iva ? 'IVA incluido' : 'Sin IVA'}
                            {gasto.notas && ' • ' + gasto.notas}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => eliminarGasto(gasto.id!)}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Resumen de gastos por tipo */}
          <div className="mt-8">
            <h3 className="font-medium mb-3 text-gray-700">Resumen por Tipo</h3>
            <div className="space-y-2">
              {gastosPorTipo
                .filter(item => item.total > 0)
                .map((item) => (
                  <div key={item.tipo} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.tipo}:</span>
                    <span className="font-medium">€{item.total.toFixed(2)}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Resumen final */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Resumen del Período</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Ingresos</h3>
            <div className="space-y-1">
              {ingresosPorTipo
                .filter(item => item.total > 0)
                .map((item) => (
                  <div key={item.tipo} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.tipo}:</span>
                    <span className="font-medium">€{item.total.toFixed(2)}</span>
                  </div>
                ))
              }
              <div className="border-t pt-2 mt-2 font-semibold">
                <div className="flex justify-between">
                  <span>Total Ingresos:</span>
                  <span>€{totalIngresos.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Gastos</h3>
            <div className="space-y-1">
              {gastosPorTipo
                .filter(item => item.total > 0)
                .map((item) => (
                  <div key={item.tipo} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.tipo}:</span>
                    <span className="font-medium">€{item.total.toFixed(2)}</span>
                  </div>
                ))
              }
              <div className="border-t pt-2 mt-2 font-semibold">
                <div className="flex justify-between">
                  <span>Total Gastos:</span>
                  <span>€{totalGastos.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-4">Resultado Final</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Ingresos:</span>
                <span className="font-medium">€{totalIngresos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Gastos:</span>
                <span className="font-medium">€{totalGastos.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className={`flex justify-between text-lg font-bold ${
                  balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>{balance >= 0 ? 'Beneficio:' : 'Pérdida:'}</span>
                  <span>€{Math.abs(balance).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center"
              >
                <Save className="mr-2 h-4 w-4" /> Guardar Período
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    {/* Modales */}
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
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del ingreso"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  {TIPOS_INGRESO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="incluir-iva"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="incluir-iva" className="ml-2 block text-sm text-gray-700">
                  Incluir IVA
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
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
      </div>
    )}
    
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
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del gasto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  {TIPOS_GASTO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="incluir-iva-gasto"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="incluir-iva-gasto" className="ml-2 block text-sm text-gray-700">
                  Incluir IVA
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
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
      </div>
    )}
    </div>
  );
};

export default BrandAccountingModule;
