// src/components/hr/EmployeeOperations.tsx
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Calendar, ClipboardCheck, History, QrCode } from 'lucide-react';
import { Employee } from '../../types/employee';
import { useSession } from '../../contexts/SessionContext';
import { supabase } from '../../lib/supabase';
import TimeclockModal from './TimeclockModal';
import ChecklistModal from './ChecklistModal';

interface EmployeeOperationsProps {
  employee: Employee;
}

const EmployeeOperations: React.FC<EmployeeOperationsProps> = ({ employee }) => {
  const { employee: currentUser } = useSession();
  const [activeTab, setActiveTab] = useState('today');
  const [todayData, setTodayData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showTimeclockModal, setShowTimeclockModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  const isOwnProfile = currentUser?.id === employee.id;
  const today = new Date().toISOString().split('T')[0];

  const tabs = [
    { id: 'today', name: 'Hoy', icon: Calendar },
    { id: 'timeclock', name: 'Fichajes', icon: Clock },
    { id: 'checklist', name: 'Check-lists', icon: ClipboardCheck }
  ];

  useEffect(() => {
    loadTodayData();
  }, [employee.id]);

  const loadTodayData = async () => {
    try {
      // Primero obtener el ID numérico del empleado desde la tabla employees
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('email', employee.email)
        .single();

      if (employeeError || !employeeData) {
        console.log('No se encontró empleado en la base de datos:', employeeError);
        setTodayData({ timeclock: null });
        return;
      }

      const numericEmployeeId = employeeData.id;
      console.log('ID numérico del empleado:', numericEmployeeId);

      // Intentar cargar datos de fichaje - la tabla puede no existir aún
      try {
        const { data: timeclockData, error } = await supabase
          .from('timeclock_records')
          .select('*')
          .eq('employee_id', numericEmployeeId)
          .eq('date', today)
          .maybeSingle();
        
        if (error) {
          console.log('Tabla timeclock_records no disponible o sin datos:', error.message);
          setTodayData({ timeclock: null });
        } else {
          setTodayData({ timeclock: timeclockData });
        }
      } catch (timeclockError) {
        console.log('Error accediendo a timeclock_records (tabla puede no existir):', timeclockError);
        setTodayData({ timeclock: null });
      }
    } catch (error) {
      console.error('Error general en loadTodayData:', error);
      setTodayData({ timeclock: null });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const renderTodayTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
          Operativa de Hoy - {new Date().toLocaleDateString('es-ES')}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Fichaje */}
          <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Clock size={20} color="#3b82f6" />
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Fichaje</h4>
            </div>
            
            {todayData.timeclock ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Entrada:</span>
                  <span style={{ fontWeight: '500', color: '#111827' }}>
                    {formatTime(todayData.timeclock.clock_in)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Salida:</span>
                  <span style={{ fontWeight: '500', color: '#111827' }}>
                    {formatTime(todayData.timeclock.clock_out)}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Sin fichaje registrado hoy</p>
            )}
            
            {isOwnProfile && (
              <button 
                onClick={() => setShowTimeclockModal(true)}
                style={{
                  marginTop: '12px', width: '100%', padding: '8px 16px', backgroundColor: '#3b82f6',
                  color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px',
                  fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px'
                }}>
                <QrCode size={16} />
                Fichar
              </button>
            )}
          </div>

          {/* Check-list */}
          <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <ClipboardCheck size={20} color="#10b981" />
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Check-list</h4>
            </div>
            
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Sin check-list registrado hoy</p>
            
            {isOwnProfile && (
              <button 
                onClick={() => setShowChecklistModal(true)}
                style={{
                  marginTop: '12px', width: '100%', padding: '8px 16px', backgroundColor: '#10b981',
                  color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px',
                  fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px'
                }}>
                <ClipboardCheck size={16} />
                Iniciar Check-list
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <nav style={{ display: 'flex', gap: '32px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 0', borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
                  fontWeight: isActive ? '600' : '500', fontSize: '14px', display: 'flex',
                  alignItems: 'center', gap: '8px', color: isActive ? '#059669' : '#6b7280',
                  backgroundColor: 'transparent', border: 'none', cursor: 'pointer'
                }}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'today' && renderTodayTab()}
      {activeTab === 'timeclock' && <div>Historial de fichajes próximamente</div>}
      {activeTab === 'checklist' && <div>Historial de check-lists próximamente</div>}
      
      {/* Modales */}
      <TimeclockModal 
        isOpen={showTimeclockModal}
        onClose={() => setShowTimeclockModal(false)}
        employeeName={`${employee.nombre} ${employee.apellidos}`}
      />
      
      <ChecklistModal 
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        employeeName={`${employee.nombre} ${employee.apellidos}`}
        centerId={employee.center_id?.toString()}
        centerName={employee.centro_nombre}
      />
    </div>
  );
};

export default EmployeeOperations;
