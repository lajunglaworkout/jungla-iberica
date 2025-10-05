import React, { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { Building2, Users, Calendar, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CenterManagement: React.FC = () => {
  const { employee } = useSession();
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationForm, setVacationForm] = useState({ start_date: '', end_date: '', reason: '' });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleVacationSubmit = async () => {
    if (!employee?.id || !vacationForm.start_date || !vacationForm.end_date) {
      alert('Completa las fechas');
      return;
    }

    const daysRequested = calculateDays(vacationForm.start_date, vacationForm.end_date);
    
    console.log('🏖️ ENVIANDO SOLICITUD:', {
      employee_id: employee.id,
      employee_name: employee.nombre,
      start_date: vacationForm.start_date,
      end_date: vacationForm.end_date,
      days_requested: daysRequested,
      reason: vacationForm.reason || 'Sin motivo',
      status: 'pending'
    });
    
    try {
      const { data, error } = await supabase.from('vacation_requests').insert([{
        employee_id: employee.id,
        employee_name: employee.nombre || 'Empleado',
        start_date: vacationForm.start_date,
        end_date: vacationForm.end_date,
        days_requested: daysRequested,
        reason: vacationForm.reason || 'Sin motivo',
        status: 'pending'
      }]);

      console.log('🏖️ RESULTADO INSERT:', { data, error });

      if (error) {
        console.error('🏖️ ERROR AL INSERTAR:', error);
        alert('Error al enviar la solicitud: ' + error.message);
        return;
      }

      alert(`Solicitud enviada: ${daysRequested} días`);
      setVacationForm({ start_date: '', end_date: '', reason: '' });
      setShowVacationModal(false);
      
      // Recargar notificaciones después de enviar
      loadNotifications();
    } catch (error) {
      console.error('🏖️ ERROR INESPERADO:', error);
      alert('Error inesperado al enviar');
    }
  };

  const loadNotifications = async () => {
    console.log('🔍 CARGANDO NOTIFICACIONES - Centro ID:', 9);
    
    try {
      // Primero obtener empleados del centro
      const { data: centerEmployees, error: empError } = await supabase
        .from('employees')
        .select('id, nombre, apellidos')
        .eq('center_id', 9);
      
      console.log('🔍 Empleados del centro:', centerEmployees);
      console.log('🔍 Error empleados:', empError);
      
      if (centerEmployees && centerEmployees.length > 0) {
        const employeeIds = centerEmployees.map(emp => emp.id);
        console.log('🔍 IDs de empleados:', employeeIds);
        
        // Obtener solicitudes pendientes
        const { data: requests, error: reqError } = await supabase
          .from('vacation_requests')
          .select('*')
          .in('employee_id', employeeIds)
          .eq('status', 'pending');
        
        console.log('🔍 Solicitudes encontradas:', requests);
        console.log('🔍 Error solicitudes:', reqError);
        
        if (requests && requests.length > 0) {
          const newNotifications = requests.map(req => ({
            id: req.id,
            message: `${req.employee_name} solicita ${req.days_requested} días`
          }));
          
          console.log('🔍 Notificaciones creadas:', newNotifications);
          setNotifications(newNotifications);
        } else {
          console.log('🔍 No hay solicitudes pendientes');
          setNotifications([]);
        }
      } else {
        console.log('🔍 No se encontraron empleados del centro');
      }
    } catch (error) {
      console.error('🔍 Error cargando notificaciones:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>🏪 Gestión de Centro</h1>
        
        {/* Notificaciones */}
        <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={loadNotifications}
            style={{
              padding: '8px 12px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔄 Recargar
          </button>
          
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              padding: '12px',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={20} />
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {notifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              border: '1px solid #e5e7eb',
              width: '300px',
              zIndex: 1000
            }}>
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 16px 0' }}>🔔 Notificaciones</h3>
                {notifications.length === 0 ? (
                  <div>No hay notificaciones</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                      {notif.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <button
          onClick={() => setShowVacationModal(true)}
          style={{
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: 'white',
            textAlign: 'left',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={20} color="#059669" />
            <div>Solicitar Vacaciones</div>
          </div>
        </button>
      </div>

      {/* Modal */}
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
            maxWidth: '500px'
          }}>
            <h3 style={{ margin: '0 0 24px 0' }}>🏖️ Solicitar Vacaciones</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label>Fecha Inicio:</label>
              <input
                type="date"
                value={vacationForm.start_date}
                onChange={(e) => setVacationForm({...vacationForm, start_date: e.target.value})}
                style={{ width: '100%', padding: '12px', marginTop: '8px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label>Fecha Fin:</label>
              <input
                type="date"
                value={vacationForm.end_date}
                onChange={(e) => setVacationForm({...vacationForm, end_date: e.target.value})}
                style={{ width: '100%', padding: '12px', marginTop: '8px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label>Motivo (opcional):</label>
              <textarea
                value={vacationForm.reason}
                onChange={(e) => setVacationForm({...vacationForm, reason: e.target.value})}
                style={{ width: '100%', padding: '12px', marginTop: '8px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '80px' }}
              />
            </div>
            
            {vacationForm.start_date && vacationForm.end_date && (
              <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px', marginBottom: '24px', textAlign: 'center' }}>
                Días solicitados: {calculateDays(vacationForm.start_date, vacationForm.end_date)}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowVacationModal(false)}
                style={{ padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
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
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (!vacationForm.start_date || !vacationForm.end_date) ? 'not-allowed' : 'pointer'
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterManagement;
