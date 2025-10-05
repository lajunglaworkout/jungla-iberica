// src/components/centers/CenterManagement.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { Building2, Users, Package, ClipboardCheck, AlertTriangle, Calendar, MessageCircle, FileText, DollarSign, Clock, Shirt, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CenterManagementProps {
  centerName?: string;
  centerId?: number;
}

const CenterManagement: React.FC<CenterManagementProps> = ({ 
  centerName = "Centro Sevilla", 
  centerId = 9 
}) => {
  const { employee } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [openIncidents, setOpenIncidents] = useState<any[]>([]);
  
  // Estados para el modal de vacaciones
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationRequests, setVacationRequests] = useState<any[]>([]);
  const [vacationBalance, setVacationBalance] = useState({ total: 22, used: 0, available: 22 });
  const [vacationForm, setVacationForm] = useState({ start_date: '', end_date: '', reason: '' });
  
  // Estados para notificaciones
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingVacationRequests, setPendingVacationRequests] = useState<any[]>([]);

  // Funciones para el sistema de vacaciones
  const loadVacationData = async () => {
    if (!employee?.id) return;
    
    const { data } = await supabase
      .from('vacation_requests')
      .select('*')
      .eq('employee_id', employee.id);
    
    if (data) {
      setVacationRequests(data);
      const used = data.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.days_requested, 0);
      setVacationBalance({ total: 22, used, available: 22 - used });
    }
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleVacationSubmit = async () => {
    if (!employee?.id || !vacationForm.start_date || !vacationForm.end_date) {
      alert('Por favor, completa las fechas de inicio y fin');
      return;
    }

    const daysRequested = calculateDays(vacationForm.start_date, vacationForm.end_date);
    
    if (daysRequested > vacationBalance.available) {
      alert(`No tienes suficientes días disponibles. Solicitas: ${daysRequested}, Disponibles: ${vacationBalance.available}`);
      return;
    }

    try {
      const { error } = await supabase
        .from('vacation_requests')
        .insert([
          {
            employee_id: employee.id,
            employee_name: employee.nombre || 'Empleado',
            start_date: vacationForm.start_date,
            end_date: vacationForm.end_date,
            days_requested: daysRequested,
            reason: vacationForm.reason.trim() || 'Sin motivo especificado',
            status: 'pending'
          }
        ]);

      if (error) {
        console.error('Error al enviar solicitud:', error);
        alert('Error al enviar la solicitud. Inténtalo de nuevo.');
        return;
      }

      alert(`¡Solicitud enviada correctamente!\n\nDías solicitados: ${daysRequested}\nFechas: ${vacationForm.start_date} al ${vacationForm.end_date}\n\nTu solicitud será revisada por RRHH.`);
      
      setVacationForm({ start_date: '', end_date: '', reason: '' });
      setShowVacationModal(false);
      loadVacationData();
      
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error inesperado. Inténtalo de nuevo.');
    }
  };

  // Función para cargar solicitudes pendientes del centro (para notificaciones)
  const loadPendingVacationRequests = async () => {
    if (!centerId) return;
    
    try {
      // Obtener empleados del centro
      const { data: centerEmployees } = await supabase
        .from('employees')
        .select('id, nombre, apellidos')
        .eq('center_id', centerId);
      
      if (centerEmployees && centerEmployees.length > 0) {
        const employeeIds = centerEmployees.map(emp => emp.id);
        
        // Obtener solicitudes pendientes de esos empleados
        const { data: pendingRequests } = await supabase
          .from('vacation_requests')
          .select('*')
          .in('employee_id', employeeIds)
          .eq('status', 'pending')
          .order('requested_at', { ascending: false });
        
        if (pendingRequests) {
          setPendingVacationRequests(pendingRequests);
          
          // Crear notificaciones
          const newNotifications = pendingRequests.map(request => ({
            id: `vacation_${request.id}`,
            type: 'vacation_request',
            title: 'Nueva Solicitud de Vacaciones',
            message: `${request.employee_name} ha solicitado ${request.days_requested} días de vacaciones`,
            date: new Date(request.requested_at),
            read: false,
            data: request
          }));
          
          setNotifications(newNotifications);
        }
      }
    } catch (error) {
      console.error('Error cargando solicitudes pendientes:', error);
    }
  };

  useEffect(() => {
    loadVacationData();
    loadPendingVacationRequests();
  }, [employee?.id, centerId]);

  // Tabs específicos para encargados de centro
  const tabs = [
    { id: 'overview', name: 'Resumen', icon: Building2 },
    { id: 'hr', name: 'RRHH', icon: Users },
    { id: 'inventory', name: 'Inspección Inventario', icon: Package },
    { id: 'checklist', name: 'Check-list Diario', icon: ClipboardCheck },
    { id: 'incidents', name: 'Incidencias', icon: AlertTriangle },
  ];

  useEffect(() => {
    // Cargar incidencias abiertas del centro
    loadOpenIncidents();
  }, [centerId]);

  const loadOpenIncidents = async () => {
    // Simular carga de incidencias abiertas
    const mockIncidents = [
      {
        id: 1,
        type: 'mantenimiento',
        title: 'Aire acondicionado sala principal',
        status: 'abierta',
        priority: 'alta',
        created_at: '2025-09-28'
      },
      {
        id: 2,
        type: 'inventario',
        title: 'Falta reposición toallas',
        status: 'en_proceso',
        priority: 'media',
        created_at: '2025-09-29'
      }
    ];
    setOpenIncidents(mockIncidents);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              📍 Resumen de {centerName}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Vista general del estado actual del centro
            </p>
            
            {/* Métricas adicionales */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px' 
            }}>
              <div style={{ 
                backgroundColor: '#f0f9ff', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #e0f2fe'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>85%</div>
                <div style={{ fontSize: '14px', color: '#0369a1', marginTop: '4px' }}>Ocupación Media</div>
              </div>
              
              <div style={{ 
                backgroundColor: '#f0fdf4', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #dcfce7'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>4.8/5</div>
                <div style={{ fontSize: '14px', color: '#166534', marginTop: '4px' }}>Satisfacción Cliente</div>
              </div>
              
              <div style={{ 
                backgroundColor: '#fefce8', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #fef3c7'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a16207' }}>€2,450</div>
                <div style={{ fontSize: '14px', color: '#a16207', marginTop: '4px' }}>Ingresos Día</div>
              </div>
            </div>
          </div>
        );

      case 'hr':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              👥 Recursos Humanos - {centerName}
            </h3>
            
            {/* Mi Perfil */}
            <div style={{ 
              marginBottom: '24px', 
              padding: '20px', 
              backgroundColor: '#eff6ff', 
              borderRadius: '8px',
              border: '1px solid #dbeafe'
            }}>
              <h4 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '12px' }}>Mi Perfil</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#059669', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white', 
                  fontWeight: '600' 
                }}>
                  F
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{employee?.name || 'Francisco'}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Encargado - {centerName}</div>
                  <button style={{ 
                    color: '#059669', 
                    fontSize: '14px', 
                    textDecoration: 'underline',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    marginTop: '4px'
                  }}>
                    Editar mi perfil
                  </button>
                </div>
              </div>
            </div>

            {/* Acciones RRHH */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              {[
                { icon: Calendar, title: 'Solicitar Vacaciones', desc: 'Gestionar mis vacaciones', color: '#059669' },
                { icon: MessageCircle, title: 'Canal Comunicación', desc: 'Mensajes y avisos', color: '#3b82f6' },
                { icon: FileText, title: 'Ver Contratos', desc: 'Documentos laborales', color: '#6366f1' },
                { icon: DollarSign, title: 'Nóminas', desc: 'Historial de pagos', color: '#10b981' },
                { icon: Clock, title: 'Turnos', desc: 'Horarios y planificación', color: '#f59e0b' },
                { icon: Shirt, title: 'Pedir Vestuario', desc: 'Uniformes y equipación', color: '#8b5cf6' }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      console.log('🚨 BOTÓN CLICKEADO:', action.title);
                      if (action.title === 'Solicitar Vacaciones') {
                        setShowVacationModal(true);
                      } else {
                        alert(`⏳ ${action.title}\n\nEsta funcionalidad estará disponible próximamente.`);
                      }
                    }}
                    style={{
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = action.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Icon size={20} color={action.color} />
                      <div style={{ fontWeight: '600', color: '#111827' }}>{action.title}</div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{action.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Empleados del Centro */}
            <div>
              <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                Empleados de {centerName}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Salva', role: 'Encargado', color: '#10b981', initial: 'S' },
                  { name: 'Entrenador 1', role: 'Entrenador', color: '#3b82f6', initial: 'E1' },
                  { name: 'Entrenador 2', role: 'Entrenador', color: '#8b5cf6', initial: 'E2' }
                ].map((emp, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '8px',
                    border: '1px solid #f3f4f6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        backgroundColor: emp.color, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white', 
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {emp.initial}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>{emp.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{emp.role}</div>
                      </div>
                    </div>
                    <button style={{ 
                      color: '#059669', 
                      fontSize: '14px', 
                      textDecoration: 'underline',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      Ver perfil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              📦 Inspección de Inventario - {centerName}
            </h3>
            
            <div style={{ marginBottom: '24px' }}>
              <button style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                🔍 Realizar Inspección Completa
              </button>
            </div>

            {/* Estado del Inventario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Camisetas La Jungla', stock: 25, status: 'ok', color: '#10b981' },
                { name: 'Toallas', stock: 2, status: 'low', color: '#f59e0b' },
                { name: 'Desinfectante', stock: 0, status: 'empty', color: '#ef4444' }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: item.color,
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontWeight: '500', color: '#111827' }}>{item.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{item.stock} uds</div>
                    <div style={{ fontSize: '12px', color: item.color, marginTop: '2px' }}>
                      {item.status === 'ok' ? 'Stock OK' : item.status === 'low' ? 'Stock Bajo' : 'Sin Stock'}
                    </div>
                    {item.status !== 'ok' && (
                      <button style={{
                        color: '#059669',
                        fontSize: '12px',
                        textDecoration: 'underline',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: '4px'
                      }}>
                        {item.status === 'empty' ? 'Solicitar urgente' : 'Solicitar reposición'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              ✅ Check-list Diario - {centerName}
            </h3>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                Fecha: {new Date().toLocaleDateString('es-ES')}
              </div>
              <button style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                📋 Completar Check-list de Hoy
              </button>
            </div>

            {/* Categorías del Check-list */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {[
                { icon: '🏋️', title: 'Estado de Máquinas', desc: 'Verificar funcionamiento de equipos' },
                { icon: '🧽', title: 'Limpieza e Higiene', desc: 'Control de limpieza y desinfección' },
                { icon: '🚨', title: 'Incidencias del Día', desc: 'Reportar problemas detectados' },
                { icon: '📝', title: 'Observaciones', desc: 'Comentarios y notas generales' }
              ].map((item, index) => (
                <div key={index} style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                    {item.icon} {item.title}
                  </h4>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'incidents':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              🚨 Incidencias Abiertas - {centerName}
            </h3>
            
            {openIncidents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {openIncidents.map((incident) => (
                  <div key={incident.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: incident.type === 'mantenimiento' ? '#fed7aa' : '#dbeafe',
                          color: incident.type === 'mantenimiento' ? '#9a3412' : '#1e40af'
                        }}>
                          {incident.type === 'mantenimiento' ? '🔧 Mantenimiento' : '📦 Inventario'}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: incident.priority === 'alta' ? '#fecaca' : '#fef3c7',
                          color: incident.priority === 'alta' ? '#991b1b' : '#92400e'
                        }}>
                          {incident.priority === 'alta' ? 'Alta' : 'Media'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {incident.created_at}
                      </div>
                    </div>
                    
                    <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                      {incident.title}
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: '14px',
                        color: incident.status === 'abierta' ? '#dc2626' : '#f59e0b'
                      }}>
                        Estado: {incident.status === 'abierta' ? 'Abierta' : 'En Proceso'}
                      </span>
                      <button style={{
                        color: '#059669',
                        fontSize: '14px',
                        textDecoration: 'underline',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        Solicitar actualización
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                ✅ No hay incidencias abiertas
              </div>
            )}
          </div>
        );

      default:
        return <div>Contenido no encontrado</div>;
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header moderno */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            🏪 Gestión de Centro
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>
            Panel de gestión para {centerName}
          </p>
        </div>
        
        {/* Notificaciones */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              padding: '12px',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            <Bell size={20} color="#374151" />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {notifications.length}
              </span>
            )}
          </button>
          
          {/* Panel de Notificaciones */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
              border: '1px solid #e5e7eb',
              width: '400px',
              maxHeight: '500px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', fontWeight: 'bold' }}>
                  🔔 Notificaciones ({notifications.length})
                </h3>
              </div>
              
              {notifications.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                  <Bell size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                  <div>No hay notificaciones</div>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>
                        {notification.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {notification.date.toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ color: '#374151', fontSize: '14px', marginBottom: '8px' }}>
                      {notification.message}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Aprobar
                      </button>
                      <button
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
        
      {/* KPIs Header */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginTop: '16px' 
      }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={24} color="#059669" />
              <div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>12</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Empleados Activos</div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClipboardCheck size={24} color="#10b981" />
              <div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>3</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Tareas Pendientes</div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} color="#f59e0b" />
              <div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>{openIncidents.length}</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Incidencias Abiertas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs modernos */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e5e7eb', marginBottom: '24px' }}>
        <div style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: '#e5e7eb', padding: '0 24px' }}>
          <nav style={{ display: 'flex', gap: '32px' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '16px 0',
                    borderBottomWidth: '2px',
                    borderBottomStyle: 'solid',
                    borderBottomColor: isActive ? '#059669' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: isActive ? '#059669' : '#6b7280',
                    backgroundColor: 'transparent',
                    borderWidth: '0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#6b7280';
                    }
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Content con padding */}
        <div style={{ padding: '24px' }}>
          {renderTabContent()}
        </div>
      </div>

      {/* Modal de Solicitud de Vacaciones */}
      {showVacationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              🏖️ Nueva Solicitud de Vacaciones
            </h3>
            
            {/* Balance de vacaciones */}
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>Balance de Vacaciones</div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>{vacationBalance.total}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{vacationBalance.used}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Usados</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{vacationBalance.available}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Disponibles</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Fecha de Inicio:</label>
              <input
                type="date"
                value={vacationForm.start_date}
                onChange={(e) => setVacationForm({...vacationForm, start_date: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: '#d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Fecha de Fin:</label>
              <input
                type="date"
                value={vacationForm.end_date}
                onChange={(e) => setVacationForm({...vacationForm, end_date: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: '#d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Motivo (opcional):</label>
              <textarea
                value={vacationForm.reason}
                onChange={(e) => setVacationForm({...vacationForm, reason: e.target.value})}
                placeholder="Describe el motivo de tu solicitud (opcional)..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: '#d1d5db',
                  borderRadius: '8px',
                  minHeight: '100px',
                  resize: 'vertical',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            
            {vacationForm.start_date && vacationForm.end_date && (
              <div style={{
                padding: '16px',
                backgroundColor: '#ecfdf5',
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '18px' }}>
                  Días solicitados: {calculateDays(vacationForm.start_date, vacationForm.end_date)}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                  Disponibles: {vacationBalance.available} días
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowVacationModal(false);
                  setVacationForm({ start_date: '', end_date: '', reason: '' });
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  borderWidth: '0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleVacationSubmit}
                disabled={!vacationForm.start_date || !vacationForm.end_date}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (!vacationForm.start_date || !vacationForm.end_date) ? '#9ca3af' : '#059669',
                  color: 'white',
                  borderWidth: '0',
                  borderRadius: '8px',
                  cursor: (!vacationForm.start_date || !vacationForm.end_date) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterManagement;
