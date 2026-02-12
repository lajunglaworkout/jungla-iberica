// src/components/hr/EmployeeProfile.tsx - Perfil del Empleado con Edición
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, Edit3, Save, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmployeeProfileProps {
  onBack: () => void;
  currentEmployee: any;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ onBack, currentEmployee }) => {
  const [employee, setEmployee] = useState<any>(currentEmployee || null);
  const [loading, setLoading] = useState(!currentEmployee);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    dni: ''
  });

  // Mobile detection
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    if (!currentEmployee?.id) {
      setLoading(false);
      return;
    }

    // Si el ID no es numérico (perfiles simulados desde SessionContext)
    if (isNaN(Number(currentEmployee.id))) {
      setEmployee(currentEmployee);
      setFormData({
        first_name: currentEmployee.first_name || currentEmployee.name || '',
        last_name: currentEmployee.last_name || '',
        phone: currentEmployee.phone || '',
        dni: currentEmployee.dni || ''
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', Number(currentEmployee.id))
        .single();

      if (error) throw error;

      setEmployee(data);
      setFormData({
        first_name: data?.first_name || data?.name || '',
        last_name: data?.last_name || '',
        phone: data?.phone || '',
        dni: data?.dni || ''
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate employee ID
    if (!employee?.id || isNaN(Number(employee.id))) {
      setError('No se puede editar este perfil. ID de empleado no válido.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          dni: formData.dni,
          updated_at: new Date().toISOString()
        })
        .eq('id', Number(employee.id));

      if (error) throw error;

      // Update local state
      setEmployee({
        ...employee,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        dni: formData.dni
      });

      setSuccess('¡Perfil actualizado correctamente!');
      setEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error guardando perfil:', error);
      setError(error.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current employee data
    setFormData({
      first_name: employee?.first_name || employee?.name || '',
      last_name: employee?.last_name || '',
      phone: employee?.phone || '',
      dni: employee?.dni || ''
    });
    setEditing(false);
    setError(null);
  };

  // Helper to get display value
  const getDisplayValue = (field: string) => {
    if (field === 'nombre') return `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || employee?.name || 'No disponible';
    if (field === 'telefono') return employee?.phone || 'No especificado';
    if (field === 'dni') return employee?.dni || 'No disponible';
    if (field === 'email') return employee?.email || 'No especificado';
    if (field === 'cargo') return employee?.position || employee?.role || 'No especificado';
    if (field === 'departamento') return employee?.departamento || employee?.department || 'No especificado';
    return 'No disponible';
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', margin: 0 }}>
          👤 Mi Perfil
        </h1>
      </div>

      {/* Success message */}
      {success && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Perfil Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: isMobile ? '20px' : '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} />
            Información Personal
          </h2>
          {editing && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <X size={14} /> Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Responsive grid - 1 column on mobile, 2 on desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '20px'
        }}>
          {/* Nombre - Editable */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>Nombre</label>
            {editing ? (
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px solid #059669',
                  borderRadius: '8px',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            ) : (
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                {getDisplayValue('nombre')}
              </div>
            )}
          </div>

          {/* Apellidos - Editable */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>Apellidos</label>
            {editing ? (
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px solid #059669',
                  borderRadius: '8px',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            ) : (
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                {employee?.last_name || 'No disponible'}
              </div>
            )}
          </div>

          {/* DNI - Editable */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>DNI</label>
            {editing ? (
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px solid #059669',
                  borderRadius: '8px',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            ) : (
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                {getDisplayValue('dni')}
              </div>
            )}
          </div>

          {/* Teléfono - Editable */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={16} />
              Teléfono
            </label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px solid #059669',
                  borderRadius: '8px',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            ) : (
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                {getDisplayValue('telefono')}
              </div>
            )}
          </div>

          {/* Email - Read only */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={16} />
              Email
            </label>
            <div style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              color: editing ? '#9ca3af' : 'inherit'
            }}>
              {getDisplayValue('email')}
              {editing && <span style={{ fontSize: '11px', marginLeft: '8px' }}>(no editable)</span>}
            </div>
          </div>

          {/* Cargo - Read only */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>Cargo</label>
            <div style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              color: editing ? '#9ca3af' : 'inherit'
            }}>
              {getDisplayValue('cargo')}
            </div>
          </div>

          {/* Departamento - Read only */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>Departamento</label>
            <div style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              color: editing ? '#9ca3af' : 'inherit'
            }}>
              {getDisplayValue('departamento')}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          {editing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '12px 24px',
                backgroundColor: saving ? '#9ca3af' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Cambios
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Edit3 size={16} />
              Editar Información
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
