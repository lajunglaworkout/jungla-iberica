import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Clock, AlertTriangle, User, Calendar,
  Filter, Search, Eye, Edit, Trash2, Plus, ArrowRight,
  Building2, Users, Briefcase, DollarSign, Globe, Award, Zap, Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexts/SessionContext';

interface PendingTask {
  id: number;
  titulo: string;
  descripcion: string;
  asignado_a: string;
  departamento_responsable: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'pendiente' | 'en_progreso' | 'completada';
  fecha_limite: string;
  fecha_creacion: string;
  reunion_origen?: number;
  creado_por: string;
}

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  overdue: number;
  critical: number;
}

const PendingTasksSystem: React.FC = () => {
  const { employee } = useSession();
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    critical: 0
  });

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

  const departments = [
    { id: 'direccion', name: 'Dirección' },
    { id: 'rrhh_procedimientos', name: 'RRHH y Procedimientos' },
    { id: 'logistica', name: 'Logística' },
    { id: 'contabilidad_ventas', name: 'Contabilidad y Ventas' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'eventos', name: 'Eventos' },
    { id: 'online', name: 'Online' },
    { id: 'investigacion', name: 'I+D' }
  ];

  useEffect(() => {
    loadTasks();
  }, [employee]);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchTerm, filterStatus, filterPriority, filterDepartment]);

  const loadTasks = async () => {
    if (!employee) return;

    try {
      setLoading(true);

      // Cargar tareas asignadas al usuario actual (por email o nombre)
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .or(`asignado_a.eq.${employee.email},asignado_a.eq.${employee.name}`)
        .in('estado', ['pendiente', 'en_progreso'])
        .order('fecha_limite', { ascending: true });

      console.log('🔍 Buscando tareas para:', employee.email, 'o', employee.name);
      console.log('📋 Tareas encontradas:', data?.length || 0);

      if (error) throw error;

      const tasksData = data || [];
      setTasks(tasksData);
      calculateStats(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tasksData: PendingTask[]) => {
    const now = new Date();
    const stats: TaskStats = {
      total: tasksData.length,
      pending: tasksData.filter(t => t.estado === 'pendiente').length,
      inProgress: tasksData.filter(t => t.estado === 'en_progreso').length,
      overdue: tasksData.filter(t => new Date(t.fecha_limite) < now).length,
      critical: tasksData.filter(t => t.prioridad === 'critica').length
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de estado
    if (filterStatus !== 'all') {
      if (filterStatus === 'overdue') {
        const now = new Date();
        filtered = filtered.filter(task => new Date(task.fecha_limite) < now);
      } else {
        filtered = filtered.filter(task => task.estado === filterStatus);
      }
    }

    // Filtro de prioridad
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.prioridad === filterPriority);
    }

    // Filtro de departamento
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(task => task.departamento_responsable === filterDepartment);
    }

    setFilteredTasks(filtered);
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ estado: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Actualizar estado local
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, estado: newStatus as any } : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-gray-100 text-gray-800';
      case 'en_progreso': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Tareas Pendientes</h1>
        <p className="text-gray-600">
          Gestiona tus tareas asignadas desde las reuniones estratégicas
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-[#059669]" />
            <div>
              <h3 className="font-semibold text-gray-900">Total</h3>
              <p className="text-2xl font-bold text-[#059669]">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-gray-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Pendientes</h3>
              <p className="text-2xl font-bold text-gray-500">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900">En Progreso</h3>
              <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Vencidas</h3>
              <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Críticas</h3>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="overdue">Vencidas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
            >
              <option value="all">Todas las prioridades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
            >
              <option value="all">Todos los departamentos</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Tareas */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay tareas pendientes
            </h3>
            <p className="text-gray-600">
              {tasks.length === 0
                ? "No tienes tareas asignadas actualmente."
                : "No hay tareas que coincidan con los filtros aplicados."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map(task => {
              const DeptIcon = departmentIcons[task.departamento_responsable] || Building2;
              const daysUntilDeadline = getDaysUntilDeadline(task.fecha_limite);
              const isOverdue = daysUntilDeadline < 0;

              return (
                <div key={task.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <DeptIcon className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">{task.titulo}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.prioridad)}`}>
                          {task.prioridad}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.estado)}`}>
                          {task.estado.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{task.descripcion}</p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Vence: {new Date(task.fecha_limite).toLocaleDateString('es-ES')}
                            {isOverdue && (
                              <span className="text-red-600 font-medium ml-2">
                                ({Math.abs(daysUntilDeadline)} días de retraso)
                              </span>
                            )}
                            {!isOverdue && daysUntilDeadline <= 3 && (
                              <span className="text-yellow-600 font-medium ml-2">
                                ({daysUntilDeadline} días restantes)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span className="capitalize">
                            {departments.find(d => d.id === task.departamento_responsable)?.name || task.departamento_responsable}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {task.estado === 'pendiente' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'en_progreso')}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          Iniciar
                        </button>
                      )}
                      {task.estado === 'en_progreso' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completada')}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          Completar
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingTasksSystem;
