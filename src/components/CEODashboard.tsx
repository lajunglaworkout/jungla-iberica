import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Clock, CheckCircle, TrendingUp, TrendingDown,
  Users, DollarSign, Target, Calendar, Bell, Eye, ArrowRight,
  Building2, Globe, Briefcase, Award, Zap, Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UrgentAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  department: string;
  message: string;
  kpi: string;
  value: number;
  target: number;
  created_at: string;
}

interface PendingTask {
  id: number;
  title: string;
  assignedTo: string;
  department: string;
  priority: string;
  deadline: string;
  status: string;
  daysOverdue: number;
}

interface DepartmentKPI {
  department: string;
  kpi: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

const CEODashboard: React.FC = () => {
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [criticalKPIs, setCriticalKPIs] = useState<DepartmentKPI[]>([]);
  const [loading, setLoading] = useState(true);

  const departmentIcons: Record<string, React.ComponentType<any>> = {
    'direccion': Building2,
    'rrhh_procedimientos': Users,
    'logistica': Briefcase,
    'contabilidad_ventas': DollarSign,
    'marketing': Globe,
    'eventos': Award,
    'online': Zap,
    'investigacion': Activity
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000); // Actualizar cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUrgentAlerts(),
        loadPendingTasks(),
        loadCriticalKPIs()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUrgentAlerts = async () => {
    // Simulación de alertas urgentes - reemplazar con datos reales de Supabase
    const mockAlerts: UrgentAlert[] = [
      {
        id: '1',
        type: 'critical',
        department: 'contabilidad_ventas',
        message: 'Ventas semanales 40% por debajo del objetivo',
        kpi: 'Ventas Semanales',
        value: 7200,
        target: 12000,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        type: 'warning',
        department: 'logistica',
        message: 'Inventario bajo en 5 productos críticos',
        kpi: 'Stock Crítico',
        value: 5,
        target: 0,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        type: 'critical',
        department: 'rrhh_procedimientos',
        message: 'Satisfacción empleados por debajo del mínimo',
        kpi: 'Satisfacción Empleados',
        value: 3.8,
        target: 4.5,
        created_at: new Date().toISOString()
      }
    ];
    setUrgentAlerts(mockAlerts);
  };

  const loadPendingTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .in('estado', ['pendiente', 'en_progreso'])
        .order('fecha_limite', { ascending: true });

      if (error) throw error;

      const tasks: PendingTask[] = data?.map(task => {
        const deadline = new Date(task.fecha_limite);
        const today = new Date();
        const daysOverdue = Math.floor((today.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: task.id,
          title: task.titulo,
          assignedTo: task.asignado_a,
          department: task.departamento_responsable || 'general',
          priority: task.prioridad,
          deadline: task.fecha_limite,
          status: task.estado,
          daysOverdue: daysOverdue > 0 ? daysOverdue : 0
        };
      }) || [];

      setPendingTasks(tasks);
    } catch (error) {
      console.error('Error loading pending tasks:', error);
    }
  };

  const loadCriticalKPIs = async () => {
    // Simulación de KPIs críticos - reemplazar con datos reales
    const mockKPIs: DepartmentKPI[] = [
      {
        department: 'direccion',
        kpi: 'Facturación Semanal',
        value: 13500,
        target: 15000,
        trend: 'down',
        status: 'warning'
      },
      {
        department: 'marketing',
        kpi: 'Leads Generados',
        value: 65,
        target: 50,
        trend: 'up',
        status: 'good'
      },
      {
        department: 'eventos',
        kpi: 'Satisfacción Eventos',
        value: 4.9,
        target: 4.7,
        trend: 'up',
        status: 'good'
      }
    ];
    setCriticalKPIs(mockKPIs);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critica': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#059669]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard CEO</h1>
        <p className="text-gray-600">Resumen ejecutivo de alertas urgentes y KPIs críticos</p>
      </div>

      {/* Alertas Urgentes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alertas Urgentes ({urgentAlerts.length})
          </h2>
          <button className="text-[#059669] hover:text-[#047857] flex items-center gap-1">
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {urgentAlerts.map(alert => {
            const DeptIcon = departmentIcons[alert.department] || Building2;
            return (
              <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DeptIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {alert.department.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {alert.kpi}: {alert.value} / {alert.target}
                      </span>
                      <button className="text-[#059669] hover:text-[#047857] flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPIs Críticos */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#059669]" />
            KPIs Críticos
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {criticalKPIs.map((kpi, index) => {
            const DeptIcon = departmentIcons[kpi.department] || Building2;
            const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Target;
            
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DeptIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {kpi.department.replace('_', ' ')}
                    </span>
                  </div>
                  <TrendIcon className={`w-5 h-5 ${getKPIStatusColor(kpi.status)}`} />
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{kpi.kpi}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-2xl font-bold ${getKPIStatusColor(kpi.status)}`}>
                    {kpi.value}
                  </span>
                  <span className="text-sm text-gray-500">/ {kpi.target}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      kpi.status === 'good' ? 'bg-green-500' :
                      kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tareas Pendientes Críticas */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#059669]" />
            Tareas Pendientes Críticas ({pendingTasks.filter(t => t.priority === 'critica' || t.daysOverdue > 0).length})
          </h2>
          <button className="text-[#059669] hover:text-[#047857] flex items-center gap-1">
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {pendingTasks
              .filter(task => task.priority === 'critica' || task.daysOverdue > 0)
              .slice(0, 10)
              .map(task => {
                const DeptIcon = departmentIcons[task.department] || Building2;
                return (
                  <div key={task.id} className="border-b border-gray-100 p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <DeptIcon className="w-4 h-4 text-gray-600" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>Asignado a: {task.assignedTo}</span>
                            <span>Vence: {new Date(task.deadline).toLocaleDateString('es-ES')}</span>
                            {task.daysOverdue > 0 && (
                              <span className="text-red-600 font-medium">
                                {task.daysOverdue} días de retraso
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <button className="text-[#059669] hover:text-[#047857]">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Resumen Semanal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-[#059669]" />
            <div>
              <h3 className="font-semibold text-gray-900">Reuniones</h3>
              <p className="text-sm text-gray-600">Esta semana</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#059669]">8</div>
          <p className="text-sm text-gray-600">Departamentos programados</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Tareas</h3>
              <p className="text-sm text-gray-600">Completadas</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-500">24</div>
          <p className="text-sm text-gray-600">De 45 totales</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Objetivos</h3>
              <p className="text-sm text-gray-600">En progreso</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-500">12</div>
          <p className="text-sm text-gray-600">Estratégicos activos</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Alertas</h3>
              <p className="text-sm text-gray-600">Requieren atención</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-red-500">{urgentAlerts.length}</div>
          <p className="text-sm text-gray-600">Críticas y warnings</p>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;
