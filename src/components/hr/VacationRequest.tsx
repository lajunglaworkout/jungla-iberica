// src/components/hr/VacationRequest.tsx - Sistema de Solicitud de Vacaciones
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VacationRequestProps {
  onBack: () => void;
  currentEmployee: any;
}

const VacationRequest: React.FC<VacationRequestProps> = ({ onBack, currentEmployee }) => {
  console.log('🚨 VacationRequest COMPONENT CARGADO - SI VES ESTO, EL COMPONENTE FUNCIONA');
  
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [balance, setBalance] = useState({ total: 22, used: 0, available: 22 });
  const [formData, setFormData] = useState({ start_date: '', end_date: '', reason: '' });

  useEffect(() => {
    loadVacationData();
  }, []);

  // Modal state effect removed to fix CSS conflicts

  const loadVacationData = async () => {
    if (!currentEmployee?.id) return;
    
    const { data } = await supabase
      .from('vacation_requests')
      .select('*')
      .eq('employee_id', currentEmployee.id);
    
    if (data) {
      setRequests(data);
      const used = data.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.days_requested, 0);
      setBalance({ total: 22, used, available: 22 - used });
    }
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async () => {
    if (!currentEmployee?.id || !formData.start_date || !formData.end_date || !formData.reason.trim()) {
      alert('Por favor, completa todos los campos');
      return;
    }

    const daysRequested = calculateDays(formData.start_date, formData.end_date);
    
    if (daysRequested > balance.available) {
      alert(`No tienes suficientes días disponibles. Solicitas: ${daysRequested}, Disponibles: ${balance.available}`);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vacation_requests')
        .insert([
          {
            employee_id: currentEmployee.id,
            employee_name: currentEmployee.nombre || 'Empleado',
            start_date: formData.start_date,
            end_date: formData.end_date,
            days_requested: daysRequested,
            reason: formData.reason.trim(),
            status: 'pending'
          }
        ]);

      if (error) {
        console.error('Error al enviar solicitud:', error);
        alert('Error al enviar la solicitud. Inténtalo de nuevo.');
        return;
      }

      // Éxito
      alert(`¡Solicitud enviada correctamente!\n\nDías solicitados: ${daysRequested}\nFechas: ${formData.start_date} al ${formData.end_date}\n\nTu solicitud será revisada por RRHH.`);
      
      // Limpiar formulario y cerrar modal
      setFormData({ start_date: '', end_date: '', reason: '' });
      setShowModal(false);
      
      // Recargar datos
      loadVacationData();
      
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error inesperado. Inténtalo de nuevo.');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: { bg: '#fef3c7', color: '#92400e', icon: <Clock size={14} /> },
      approved: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={14} /> },
      rejected: { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={14} /> }
    };
    const style = colors[status as keyof typeof colors];
    
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '4px 8px', backgroundColor: style.bg, color: style.color,
        borderRadius: '12px', fontSize: '12px', fontWeight: '500'
      }}>
        {style.icon} {status === 'pending' ? 'Pendiente' : status === 'approved' ? 'Aprobada' : 'Rechazada'}
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Indicador de estado del modal */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: showModal ? '#10b981' : '#ef4444',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 10000
      }}>
        Modal: {showModal ? 'ABIERTO' : 'CERRADO'}
      </div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px' }}>
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>🏖️ Solicitar Vacaciones</h1>
        </div>
        <button
          onClick={() => {
            console.log('🔍 BOTÓN CLICKEADO - Estado actual:', showModal);
            setShowModal(true);
            console.log('🔍 BOTÓN CLICKEADO - Nuevo estado:', true);
          }}
          style={{ 
            padding: '12px 20px', 
            backgroundColor: '#059669', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} /> Nueva Solicitud
        </button>
      </div>

      {/* Balance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>{balance.total}</div>
          <div style={{ color: '#6b7280' }}>Días Anuales</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{balance.used}</div>
          <div style={{ color: '#6b7280' }}>Días Usados</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{balance.available}</div>
          <div style={{ color: '#6b7280' }}>Días Disponibles</div>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Mis Solicitudes</h2>
        {requests.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No tienes solicitudes de vacaciones</p>
        ) : (
          requests.map((request, index) => (
            <div key={index} style={{ 
              padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', 
              marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}>
              <div>
                <div style={{ fontWeight: '500' }}>
                  {new Date(request.start_date).toLocaleDateString('es-ES')} - {new Date(request.end_date).toLocaleDateString('es-ES')}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  {request.days_requested} días • {request.reason}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Solicitud de Vacaciones */}
      {showModal && (() => { console.log('🔍 RENDERIZANDO MODAL'); return true; })() && (
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
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Fecha de Inicio:</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
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
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Motivo:</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Describe el motivo de tu solicitud..."
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
            
            {formData.start_date && formData.end_date && (
              <div style={{
                padding: '16px',
                backgroundColor: '#ecfdf5',
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '18px' }}>
                  Días solicitados: {calculateDays(formData.start_date, formData.end_date)}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                  Disponibles: {balance.available} días
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ start_date: '', end_date: '', reason: '' });
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
                onClick={handleSubmit}
                disabled={!formData.start_date || !formData.end_date || !formData.reason.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (!formData.start_date || !formData.end_date || !formData.reason.trim()) ? '#9ca3af' : '#059669',
                  color: 'white',
                  borderWidth: '0',
                  borderRadius: '8px',
                  cursor: (!formData.start_date || !formData.end_date || !formData.reason.trim()) ? 'not-allowed' : 'pointer',
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

export default VacationRequest;
