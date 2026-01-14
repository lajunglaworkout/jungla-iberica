import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  MessageCircle,
  Package,
  Heart,
  Briefcase
} from 'lucide-react';
import { notifyIncident, notifyIncidentStatusChange } from '../../services/notificationService';

interface IncidentCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface IncidentType {
  id: number;
  category_id: number;
  name: string;
  description: string;
  approver_role: string;
  requires_dates: boolean;
  requires_clothing_details: boolean;
}

interface Incident {
  id: number;
  employee_id: number;
  incident_type_id: number;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  days_requested: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  clothing_type: string | null;
  clothing_size: string | null;
  quantity: number;
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Campos de la vista
  employee_name: string;
  employee_email: string;
  employee_position: string;
  incident_type_name: string;
  incident_type_description: string;
  approver_role: string;
  approved_by_name: string | null;
  center_name: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  center_id: number;
}

const IncidentManagementSystem: React.FC = () => {
  const { employee, userRole } = useSession();
  const [activeTab, setActiveTab] = useState('my-incidents');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentCategories, setIncidentCategories] = useState<IncidentCategory[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Estados del formulario
  const [formData, setFormData] = useState({
    category_id: '',
    incident_type_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    clothing_type: '',
    clothing_size: '',
    quantity: 1
  });

  // userRole ya viene de useSession()
  const isHR = userRole === 'hr' || userRole === 'manager' || userRole === 'admin';
  const isLogistics = userRole === 'logistics' || userRole === 'manager' || userRole === 'admin';

  const loadIncidentCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('incident_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) {
        console.log('Loaded incident categories:', data);
        setIncidentCategories(data);
      }
    } catch (error) {
      console.error('Error loading incident categories:', error);
    }
  };

  const loadIncidentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('incident_types')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) {
        console.log('Loaded incident types:', data);
        setIncidentTypes(data);
      }
    } catch (error) {
      console.error('Error loading incident types:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar categorías
      await loadIncidentCategories();

      // Cargar tipos de incidencias
      await loadIncidentTypes();

      // Cargar empleados si es HR/Manager
      if (isHR || isLogistics) {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('id, name, email, position, center_id')
          .eq('is_active', true)
          .order('name');

        if (employeeData) setEmployees(employeeData);
      }

      // Cargar incidencias
      await loadIncidents();

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIncidents = async () => {
    try {
      // Primero cargar incidencias básicas desde la tabla principal
      let query = supabase
        .from('incidents')
        .select(`
          *,
          incident_types(name, description, approver_role, requires_dates, requires_clothing_details),
          employees!incidents_employee_id_fkey(name, email, position)
        `)
        .order('created_at', { ascending: false });

      // Filtrar según el rol y pestaña activa
      if (activeTab === 'my-incidents' && !isHR && !isLogistics) {
        // Empleados normales solo ven sus incidencias
        if (employee?.id) {
          query = query.eq('employee_id', parseInt(employee.id.replace(/\D/g, '')));
        }
      } else if (activeTab === 'pending-approval' && (isHR || isLogistics)) {
        // HR ve pendientes de aprobación de su área
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error in incidents query:', error);
        // Si falla la vista, usar datos básicos
        setIncidents([]);
        return;
      }

      if (data) setIncidents(data);

    } catch (error) {
      console.error('Error loading incidents:', error);
      setIncidents([]);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [activeTab]);

  const createIncident = async () => {
    try {
      if (!employee?.id) {
        alert('Error: No se pudo identificar el empleado');
        return;
      }

      const incidentData = {
        employee_id: employee.id,
        incident_type_id: parseInt(formData.incident_type_id),
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        priority: formData.priority,
        clothing_type: formData.clothing_type || null,
        clothing_size: formData.clothing_size || null,
        quantity: formData.quantity || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('incidents')
        .insert([incidentData])
        .select();

      if (error) throw error;

      // Enviar notificación a los encargados
      if (data && data[0]) {
        const typeName = incidentTypes.find(t => t.id === incidentData.incident_type_id)?.name || 'Incidencia';
        await notifyIncident({
          incidentId: data[0].id,
          centerId: employee.center_id,
          category: typeName,
          description: incidentData.description,
          priority: incidentData.priority,
          reporterName: `${employee.first_name} ${employee.last_name || ''}`
        });
      }

      alert('Incidencia creada correctamente');
      setShowCreateForm(false);
      setSelectedCategory('');
      setFormData({
        category_id: '',
        incident_type_id: '',
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        priority: 'normal',
        clothing_type: '',
        clothing_size: '',
        quantity: 1
      });
      loadIncidents();

    } catch (error) {
      console.error('Error creating incident:', error);
      alert('Error al crear la incidencia');
    }
  };

  const updateIncidentStatus = async (incidentId: number, status: string, rejectionReason?: string) => {
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
        .eq('id', incidentId);

      if (error) throw error;

      // Enviar notificación al reportador
      const incident = incidents.find(i => i.id === incidentId);
      if (incident) {
        await notifyIncidentStatusChange({
          incidentId: incidentId,
          reporterId: incident.employee_id,
          newStatus: status,
          resolverName: employee?.first_name
        });
      }

      await loadIncidents();
      alert(`Incidencia ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`);

    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Error al actualizar la incidencia');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
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

  const getIncidentIcon = (typeName: string) => {
    if (typeName.toLowerCase().includes('vacaciones')) return <Calendar className="w-5 h-5" />;
    if (typeName.toLowerCase().includes('vestuario')) return <Package className="w-5 h-5" />;
    if (typeName.toLowerCase().includes('médica')) return <Heart className="w-5 h-5" />;
    return <Briefcase className="w-5 h-5" />;
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incident_type_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesType = typeFilter === 'all' || incident.incident_type_id.toString() === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#059669]"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header del módulo */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0, marginBottom: '8px' }}>
            📋 Incidencias y Peticiones
          </h2>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
            Gestión de ausencias, vacaciones y solicitudes de vestuario
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#047857';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Plus style={{ height: '18px', width: '18px' }} />
          Nueva Incidencia
        </button>
      </div>

      {/* Pestañas de navegación estilo CRM */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('my-incidents')}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'my-incidents' ? '#059669' : 'white',
              color: activeTab === 'my-incidents' ? 'white' : '#6b7280',
              border: activeTab === 'my-incidents' ? 'none' : '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <User style={{ width: '16px', height: '16px' }} />
            Mis Incidencias
          </button>

          {(isHR || isLogistics) && (
            <button
              onClick={() => setActiveTab('pending-approval')}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === 'pending-approval' ? '#059669' : 'white',
                color: activeTab === 'pending-approval' ? 'white' : '#6b7280',
                border: activeTab === 'pending-approval' ? 'none' : '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Clock style={{ width: '16px', height: '16px' }} />
              Pendientes de Aprobación
            </button>
          )}

          {(isHR || isLogistics) && (
            <button
              onClick={() => setActiveTab('all-incidents')}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === 'all-incidents' ? '#059669' : 'white',
                color: activeTab === 'all-incidents' ? 'white' : '#6b7280',
                border: activeTab === 'all-incidents' ? 'none' : '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FileText style={{ width: '16px', height: '16px' }} />
              Todas las Incidencias
            </button>
          )}
        </div>
      </div>

      {/* Barra de herramientas estilo CRM */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            width: '16px',
            height: '16px'
          }} />
          <input
            type="text"
            placeholder="Buscar incidencias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              paddingLeft: '40px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              width: '100%',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: 'white',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: 'white',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="all">Todos los tipos</option>
          {incidentTypes.map(type => (
            <option key={type.id} value={type.id.toString()}>{type.name}</option>
          ))}
        </select>
      </div>

      {/* Grid de incidencias estilo CRM */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {filteredIncidents.map(incident => (
          <div
            key={incident.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Header de la incidencia */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {getIncidentIcon(incident.incident_type_name)}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    {incident.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                    {incident.incident_type_name}
                  </p>
                </div>
              </div>

              {/* Badges de estado y prioridad */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: incident.status === 'approved' ? '#dcfce7' :
                    incident.status === 'rejected' ? '#fef2f2' : '#fef3c7',
                  color: incident.status === 'approved' ? '#059669' :
                    incident.status === 'rejected' ? '#dc2626' : '#d97706'
                }}>
                  {incident.status === 'pending' ? '⏳ Pendiente' :
                    incident.status === 'approved' ? '✅ Aprobado' :
                      incident.status === 'rejected' ? '❌ Rechazado' : incident.status}
                </span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: incident.priority === 'urgent' ? '#fef2f2' :
                    incident.priority === 'high' ? '#fff7ed' :
                      incident.priority === 'normal' ? '#eff6ff' : '#f9fafb',
                  color: incident.priority === 'urgent' ? '#dc2626' :
                    incident.priority === 'high' ? '#ea580c' :
                      incident.priority === 'normal' ? '#2563eb' : '#6b7280'
                }}>
                  {incident.priority === 'urgent' ? '🔥 Urgente' :
                    incident.priority === 'high' ? '⚡ Alta' :
                      incident.priority === 'normal' ? '📋 Normal' : '📝 Baja'}
                </span>
              </div>
            </div>

            {/* Información del empleado */}
            {(isHR || isLogistics) && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                  <User style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontWeight: '500' }}>{incident.employee_name}</span>
                  <span>•</span>
                  <span>{incident.center_name}</span>
                </div>
              </div>
            )}

            {/* Descripción */}
            <p style={{ color: '#374151', marginBottom: '16px', fontSize: '14px', lineHeight: '1.5' }}>
              {incident.description}
            </p>

            {/* Fechas */}
            {incident.start_date && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  <span>
                    {new Date(incident.start_date).toLocaleDateString('es-ES')}
                    {incident.end_date && ` - ${new Date(incident.end_date).toLocaleDateString('es-ES')}`}
                  </span>
                  {incident.days_requested && (
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {incident.days_requested} días
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Vestuario */}
            {incident.clothing_type && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                  <Package style={{ width: '16px', height: '16px' }} />
                  <span>{incident.clothing_type}</span>
                  <span>•</span>
                  <span>Talla: {incident.clothing_size}</span>
                  <span>•</span>
                  <span>Cantidad: {incident.quantity}</span>
                </div>
              </div>
            )}

            {/* Footer con fecha y botones */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                <span>Creado: {new Date(incident.created_at).toLocaleDateString('es-ES')}</span>
                {incident.approved_by_name && (
                  <span style={{ marginLeft: '16px' }}>
                    Aprobado por: {incident.approved_by_name}
                  </span>
                )}
              </div>

              {/* Botones de acción */}
              {incident.status === 'pending' &&
                ((isHR && incident.approver_role === 'hr') ||
                  (isLogistics && incident.approver_role === 'logistics')) && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => updateIncidentStatus(incident.id, 'approved')}
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
                        if (reason) updateIncidentStatus(incident.id, 'rejected', reason);
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

            {/* Motivo de rechazo */}
            {incident.rejection_reason && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px'
              }}>
                <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>
                  <strong>Motivo del rechazo:</strong> {incident.rejection_reason}
                </p>
              </div>
            )}
          </div>
        ))}

        {filteredIncidents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay incidencias</h3>
            <p className="text-gray-600">No se encontraron incidencias que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>

      {/* Modal de creación */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ padding: '32px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0
                }}>
                  ✨ Nueva Incidencia
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ❌
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); createIncident(); }} style={{ display: 'grid', gap: '20px' }}>
                {/* Selector de Categoría */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    📋 Categoría *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setFormData({ ...formData, category_id: e.target.value, incident_type_id: '' });
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#059669';
                      e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {incidentCategories
                      .filter((category, index, self) =>
                        index === self.findIndex(c => c.name === category.name)
                      )
                      .map(category => (
                        <option key={`category-${category.id}`} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Selector de Tipo de Incidencia */}
                {selectedCategory && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      📝 Tipo de Incidencia *
                    </label>
                    <select
                      value={formData.incident_type_id}
                      onChange={(e) => setFormData({ ...formData, incident_type_id: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#059669';
                        e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Seleccionar tipo...</option>
                      {incidentTypes
                        .filter(type => {
                          // Encontrar la categoría seleccionada
                          const selectedCategoryData = incidentCategories.find(cat => cat.id.toString() === selectedCategory);
                          if (!selectedCategoryData) return false;

                          // Buscar todas las categorías con el mismo nombre
                          const categoriesWithSameName = incidentCategories.filter(cat => cat.name === selectedCategoryData.name);
                          const categoryIds = categoriesWithSameName.map(cat => cat.id);

                          console.log('Filtering type:', type.name, 'category_id:', type.category_id, 'selectedCategory:', selectedCategory, 'matching categoryIds:', categoryIds);
                          return type.category_id && categoryIds.includes(type.category_id);
                        })
                        .map(type => (
                          <option key={`type-${type.id}`} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    ✏️ Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#059669';
                      e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Ej: Solicitud de vacaciones agosto"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    📝 Descripción *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      transition: 'all 0.2s',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '100px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#059669';
                      e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Describe los detalles de tu solicitud..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      📅 Fecha de inicio
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#059669';
                        e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      📅 Fecha de fin
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#059669';
                        e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    ⚡ Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#059669';
                      e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="low">📝 Baja</option>
                    <option value="normal">📋 Normal</option>
                    <option value="high">⚡ Alta</option>
                    <option value="urgent">🔥 Urgente</option>
                  </select>
                </div>

                {/* Campos específicos para vestuario */}
                {formData.incident_type_id &&
                  incidentTypes.find(t => t.id.toString() === formData.incident_type_id)?.requires_clothing_details && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '12px',
                      border: '2px solid #dcfce7'
                    }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#059669',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        👕 Detalles del Vestuario
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px'
                          }}>
                            👕 Tipo de prenda
                          </label>
                          <select
                            value={formData.clothing_type}
                            onChange={(e) => setFormData({ ...formData, clothing_type: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '12px',
                              fontSize: '14px',
                              backgroundColor: 'white',
                              transition: 'all 0.2s',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#059669';
                              e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e5e7eb';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <option value="">Seleccionar prenda...</option>
                            <option value="Polo">👕 Polo</option>
                            <option value="Camiseta entrenamiento personal">🏃 Camiseta entrenamiento personal</option>
                            <option value="Pantalón corto">🩳 Pantalón corto</option>
                            <option value="Chándal completo">👔 Chándal completo</option>
                            <option value="Sudadera frío">🧥 Sudadera frío</option>
                            <option value="Chaquetón">🧥 Chaquetón</option>
                          </select>
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px'
                          }}>
                            📏 Talla
                          </label>
                          <select
                            value={formData.clothing_size}
                            onChange={(e) => setFormData({ ...formData, clothing_size: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '12px',
                              fontSize: '14px',
                              backgroundColor: 'white',
                              transition: 'all 0.2s',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#059669';
                              e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e5e7eb';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                            <option value="XXXL">XXXL</option>
                          </select>
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px'
                          }}>
                            🔢 Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '12px',
                              fontSize: '14px',
                              backgroundColor: 'white',
                              transition: 'all 0.2s',
                              outline: 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#059669';
                              e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e5e7eb';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  paddingTop: '24px',
                  borderTop: '1px solid #e5e7eb',
                  marginTop: '24px'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    ❌ Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#047857';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    ✨ Crear Incidencia
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManagementSystem;
