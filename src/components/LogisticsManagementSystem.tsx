import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexts/SessionContext';
import { 
  Package, 
  Truck, 
  ClipboardList, 
  Users, 
  BarChart3,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shirt,
  ShoppingCart,
  FileText
} from 'lucide-react';

interface UniformRequest {
  id: number;
  employee_name: string;
  employee_email: string;
  center_name: string;
  clothing_type: string;
  clothing_size: string;
  quantity: number;
  status: string;
  priority: string;
  created_at: string;
  description: string;
}

interface LogisticsStats {
  pendingRequests: number;
  approvedRequests: number;
  totalRequests: number;
  urgentRequests: number;
}

const LogisticsManagementSystem: React.FC = () => {
  const { employee, userRole } = useSession();
  const [activeTab, setActiveTab] = useState('uniform-requests');
  const [uniformRequests, setUniformRequests] = useState<UniformRequest[]>([]);
  const [stats, setStats] = useState<LogisticsStats>({
    pendingRequests: 0,
    approvedRequests: 0,
    totalRequests: 0,
    urgentRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // userRole ya viene de useSession()
  const isLogistics = userRole === 'logistics' || userRole === 'manager' || userRole === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await loadUniformRequests();
      await loadStats();
    } catch (error) {
      console.error('Error loading logistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUniformRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents_with_details')
        .select('*')
        .eq('approver_role', 'logistics')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setUniformRequests(data);
    } catch (error) {
      console.error('Error loading uniform requests:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('status, priority')
        .eq('incident_type_id', 5); // Assuming uniform requests have type_id 5-8

      if (error) throw error;
      if (data) {
        const pending = data.filter(item => item.status === 'pending').length;
        const approved = data.filter(item => item.status === 'approved').length;
        const urgent = data.filter(item => item.priority === 'urgent').length;
        
        setStats({
          pendingRequests: pending,
          approvedRequests: approved,
          totalRequests: data.length,
          urgentRequests: urgent
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateRequestStatus = async (requestId: number, status: string, rejectionReason?: string) => {
    try {
      const { data: currentEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('email', employee?.email)
        .single();

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updateData.approved_by = currentEmployee?.id;
        updateData.approved_at = new Date().toISOString();
      } else if (status === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      await loadData();
      alert(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`);
      
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Error al actualizar la solicitud');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = uniformRequests.filter(request => {
    const matchesSearch = request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.clothing_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.center_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#059669]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Logística</h1>
        <p className="text-gray-600">Gestión de vestuario, pedidos y distribución</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Solicitudes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgentRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('uniform-requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'uniform-requests'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shirt className="w-4 h-4 inline mr-2" />
            Solicitudes de Vestuario
          </button>
          
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Inventario
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            Pedidos a Proveedores
          </button>
          
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Reportes
          </button>
        </nav>
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'uniform-requests' && (
        <div>
          {/* Barra de herramientas */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar solicitudes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
              >
                <option value="all">Todas las prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="normal">Normal</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>

          {/* Lista de solicitudes */}
          <div style={{ display: 'grid', gap: '24px' }}>
            {filteredRequests.map(request => (
              <div key={request.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                
                {/* Header con título y badges */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      padding: '8px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Shirt style={{ width: '20px', height: '20px', color: '#059669' }} />
                    </div>
                    
                    <div>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#111827', 
                        margin: 0,
                        marginBottom: '4px'
                      }}>
                        {request.clothing_type}
                      </h3>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#6b7280', 
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        Solicitado por: {request.employee_name}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: request.status === 'approved' ? '#dcfce7' :
                                     request.status === 'rejected' ? '#fef2f2' :
                                     request.status === 'pending' ? '#fef3c7' : '#f3f4f6',
                      color: request.status === 'approved' ? '#166534' :
                             request.status === 'rejected' ? '#dc2626' :
                             request.status === 'pending' ? '#d97706' : '#6b7280'
                    }}>
                      {request.status === 'pending' ? '⏳ Pendiente' : 
                       request.status === 'approved' ? '✅ Aprobado' : 
                       request.status === 'rejected' ? '❌ Rechazado' : request.status}
                    </span>
                    
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: request.priority === 'urgent' ? '#fef2f2' :
                                     request.priority === 'high' ? '#fff7ed' :
                                     request.priority === 'normal' ? '#eff6ff' : '#f9fafb',
                      color: request.priority === 'urgent' ? '#dc2626' :
                             request.priority === 'high' ? '#ea580c' :
                             request.priority === 'normal' ? '#2563eb' : '#6b7280'
                    }}>
                      {request.priority === 'urgent' ? '🔥 Urgente' :
                       request.priority === 'high' ? '⚡ Alta' :
                       request.priority === 'normal' ? '📋 Normal' : '📝 Baja'}
                    </span>
                  </div>
                </div>
                
                {/* Información del centro y empleado */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <Users style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontWeight: '500' }}>{request.center_name}</span>
                    <span>•</span>
                    <span>{request.employee_email}</span>
                  </div>
                </div>
                
                {/* Descripción */}
                <p style={{ color: '#374151', marginBottom: '16px', fontSize: '14px', lineHeight: '1.5' }}>
                  {request.description}
                </p>
                
                {/* Detalles del producto */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Package style={{ width: '16px', height: '16px' }} />
                      <span>Talla: <strong>{request.clothing_size}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Cantidad: <strong>{request.quantity}</strong></span>
                    </div>
                  </div>
                </div>
                
                {/* Footer con fecha y botones */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    <span>Solicitado: {new Date(request.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                  
                  {/* Botones de acción */}
                  {request.status === 'pending' && isLogistics && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#047857';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                        }}
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Motivo del rechazo:');
                          if (reason) updateRequestStatus(request.id, 'rejected', reason);
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredRequests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                  padding: '24px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '16px',
                  display: 'inline-block',
                  marginBottom: '16px'
                }}>
                  <Package style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto' }} />
                </div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#111827', 
                  marginBottom: '8px',
                  margin: 0
                }}>
                  No hay solicitudes de vestuario
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  margin: 0
                }}>
                  No se encontraron solicitudes que coincidan con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Otras pestañas - Placeholder */}
      {activeTab !== 'uniform-requests' && (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{
            padding: '32px',
            backgroundColor: '#eff6ff',
            borderRadius: '16px',
            display: 'inline-block',
            marginBottom: '24px'
          }}>
            {activeTab === 'inventory' && <Package style={{ width: '48px', height: '48px', color: '#059669', margin: '0 auto' }} />}
            {activeTab === 'orders' && <ShoppingCart style={{ width: '48px', height: '48px', color: '#059669', margin: '0 auto' }} />}
            {activeTab === 'reports' && <BarChart3 style={{ width: '48px', height: '48px', color: '#059669', margin: '0 auto' }} />}
          </div>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#111827', 
            marginBottom: '8px',
            margin: 0
          }}>
            {activeTab === 'inventory' && 'Gestión de Inventario'}
            {activeTab === 'orders' && 'Pedidos a Proveedores'}
            {activeTab === 'reports' && 'Reportes y Estadísticas'}
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '16px',
            margin: '8px 0 0 0'
          }}>
            Esta funcionalidad estará disponible próximamente.
          </p>
        </div>
      )}
    </div>
  );
};

export default LogisticsManagementSystem;
