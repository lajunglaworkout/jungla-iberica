// src/components/dashboards/SuperAdminDashboard.tsx
import React, { useState } from 'react';
import { 
  Crown, Shield, Users, Building2, TrendingUp, TrendingDown, 
  Bell, Search, Settings, LogOut, Menu, X, Home, BarChart3,
  UserCheck, Briefcase, Globe, Zap, DollarSign, Activity,
  MapPin, Calendar, MessageSquare, FileText, Plus, ArrowRight,
  Eye, Edit, Trash2, Download, Filter, RefreshCw
} from 'lucide-react';

// Tipos específicos
interface KPI {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
  description: string;
}

interface Center {
  id: number;
  name: string;
  type: string;
  status: string;
  members: number;
  revenue: string;
}

interface Notification {
  id: number;
  type: 'urgent' | 'info' | 'success';
  message: string;
  time: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface Employee {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Datos mock para el demo
  const employee: Employee = {
    name: 'Carlos Suarez Parra',
    email: 'carlos@lajungla.com',
    role: 'SuperAdmin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  };

  const kpis: KPI[] = [
    { 
      title: 'Ingresos Totales', 
      value: '€847.2K', 
      change: '+12.3%', 
      trend: 'up',
      color: 'emerald',
      description: 'vs mes anterior'
    },
    { 
      title: 'Centros Activos', 
      value: '15', 
      change: '+2', 
      trend: 'up',
      color: 'blue',
      description: '3 propios, 12 franquicias'
    },
    { 
      title: 'Miembros Totales', 
      value: '3.2K', 
      change: '+234', 
      trend: 'up',
      color: 'purple',
      description: 'en toda la red'
    },
    { 
      title: 'Satisfacción', 
      value: '4.8/5', 
      change: '+0.2', 
      trend: 'up',
      color: 'orange',
      description: 'puntuación promedio'
    }
  ];

  const recentCenters: Center[] = [
    { id: 1, name: 'Sevilla Centro', type: 'Propio', status: 'Activo', members: 245, revenue: '€23.4K' },
    { id: 2, name: 'Madrid Norte', type: 'Franquicia', status: 'Activo', members: 189, revenue: '€18.9K' },
    { id: 3, name: 'Barcelona Eixample', type: 'Franquicia', status: 'Construcción', members: 0, revenue: '€0' },
    { id: 4, name: 'Valencia Ciudad', type: 'Franquicia', status: 'Activo', members: 167, revenue: '€16.2K' }
  ];

  const notifications: Notification[] = [
    { id: 1, type: 'urgent', message: 'Centro Madrid Norte requiere atención urgente', time: '2 min' },
    { id: 2, type: 'info', message: 'Nuevo franquiciado interesado en Toledo', time: '15 min' },
    { id: 3, type: 'success', message: 'Centro Sevilla superó objetivo mensual', time: '1h' }
  ];

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'centers', label: 'Centros', icon: Building2 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'franchises', label: 'Franquicias', icon: Globe },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  const StatCard: React.FC<{ kpi: KPI }> = ({ kpi }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${kpi.color}-100 group-hover:bg-${kpi.color}-200 transition-colors`}>
          <TrendingUp className={`h-6 w-6 text-${kpi.color}-600`} />
        </div>
        <div className="flex items-center space-x-1">
          {kpi.trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {kpi.change}
          </span>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</p>
      <p className="text-xs text-gray-500">{kpi.description}</p>
    </div>
  );

  const CenterCard: React.FC<{ center: Center }> = ({ center }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{center.name}</h4>
          <p className="text-sm text-gray-500">{center.type}</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Eye className="h-4 w-4 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Edit className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          center.status === 'Activo' ? 'bg-green-100 text-green-800' :
          center.status === 'Construcción' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {center.status}
        </span>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{center.revenue}</p>
          <p className="text-gray-500">{center.members} miembros</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl transition-all duration-300 flex-shrink-0`}>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Crown className="h-8 w-8 text-emerald-600" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Jungla Ibérica</h1>
                <p className="text-sm text-gray-600">SuperAdmin Panel</p>
              </div>
            )}
          </div>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          {sidebarOpen && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
              <h3 className="font-semibold mb-1">¿Necesitas ayuda?</h3>
              <p className="text-sm text-emerald-100 mb-3">Consulta nuestra documentación</p>
              <button className="text-xs bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-colors">
                Ver Guías
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard SuperAdmin</h1>
                <p className="text-gray-600">Control total del ecosistema Jungla Ibérica</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar centros, usuarios..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                  <p className="text-xs text-gray-600">{employee.role}</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <LogOut className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="relative">
                  <h2 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta, {employee.name}! 👑</h2>
                  <p className="text-emerald-100 text-lg mb-6">Tu imperio La Jungla está creciendo fuerte. Aquí tienes un resumen del rendimiento.</p>
                  <div className="flex space-x-4">
                    <button className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors">
                      Ver Reportes
                    </button>
                    <button className="border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                      Añadir Centro
                    </button>
                  </div>
                </div>
              </div>

              {/* KPIs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, index) => (
                  <StatCard key={index} kpi={kpi} />
                ))}
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Centers Overview */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Centros Recientes</h3>
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Filter className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <RefreshCw className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                        <Plus className="h-4 w-4 inline mr-2" />
                        Nuevo Centro
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {recentCenters.map((center) => (
                      <CenterCard key={center.id} center={center} />
                    ))}
                  </div>
                </div>

                {/* Notifications & Quick Actions */}
                <div className="space-y-6">
                  {/* Notifications */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Notificaciones</h3>
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'urgent' ? 'bg-red-500' :
                            notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-3 hover:bg-emerald-50 rounded-lg transition-colors group">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-900">Gestionar Usuarios</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-colors group">
                        <div className="flex items-center space-x-3">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">Ver Analytics</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 hover:bg-purple-50 rounded-lg transition-colors group">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-gray-900">Reportes Financieros</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content */}
          {activeTab !== 'dashboard' && (
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sección: {menuItems.find(item => item.id === activeTab)?.label}</h2>
              <p className="text-gray-600 mb-6">Esta funcionalidad está en desarrollo. ¿Quieres que la desarrollemos juntos?</p>
              <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                Desarrollar Funcionalidad
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// IMPORTANTE: Export por defecto correcto
export default SuperAdminDashboard;