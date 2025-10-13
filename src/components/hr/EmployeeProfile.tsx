// src/components/hr/EmployeeProfile.tsx - Perfil del Empleado
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, Edit3, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmployeeProfileProps {
  onBack: () => void;
  currentEmployee: any;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ onBack, currentEmployee }) => {
  const [employee, setEmployee] = useState<any>(currentEmployee || null);
  const [loading, setLoading] = useState(!currentEmployee);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    if (!currentEmployee?.id) {
      setLoading(false);
      return;
    }

    // Evitar peticiones si el ID no es numérico (perfiles simulados desde SessionContext)
    if (isNaN(Number(currentEmployee.id))) {
      setEmployee(currentEmployee);
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('id', Number(currentEmployee.id))
        .single();
      
      setEmployee(data);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={onBack} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px' }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>👤 Mi Perfil</h1>
      </div>

      {/* Perfil Card */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          <User size={20} style={{ display: 'inline', marginRight: '8px' }} />
          Información Personal
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>Nombre</label>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              {employee?.nombre || 'No disponible'}
            </div>
          </div>
          
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>DNI</label>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              {employee?.dni || 'No disponible'}
            </div>
          </div>
          
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
              <Phone size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Teléfono
            </label>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              {employee?.telefono || 'No especificado'}
            </div>
          </div>
          
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
              <Mail size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Email
            </label>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              {employee?.email || 'No especificado'}
            </div>
          </div>
          
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>Cargo</label>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              {employee?.cargo || 'No especificado'}
            </div>
          </div>
          
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>Departamento</label>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              {employee?.departamento || 'No especificado'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onClick={() => alert('Funcionalidad de edición próximamente')}
          >
            <Edit3 size={16} style={{ marginRight: '8px' }} />
            Editar Información
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
