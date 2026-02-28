// src/components/hr/EmployeeProfile.tsx - Perfil del Empleado con Edición
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, Edit3, Save, X, Loader2 } from 'lucide-react';
import { getEmployeeById, updateEmployeeProfile } from '../../services/userService';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { Employee } from '../../types/employee';

interface EmployeeProfileProps {
  onBack: () => void;
  currentEmployee: Employee;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ onBack, currentEmployee }) => {
  const [employee, setEmployee] = useState<Employee | null>(currentEmployee || null);
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

  // Mobile detection hook
  const isMobile = useIsMobile();

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
      const data = await getEmployeeById(Number(currentEmployee.id));
      if (data) {
        setEmployee(data as unknown as Employee);
        setFormData({
          first_name: String(data.first_name || data.name || ''),
          last_name: String(data.last_name || ''),
          phone: String(data.phone || ''),
          dni: String(data.dni || '')
        });
      }
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
      const { success, error: updateError } = await updateEmployeeProfile(Number(employee.id), {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        dni: formData.dni
      });

      if (!success) throw new Error(updateError);

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
    } catch (error: unknown) {
      console.error('Error guardando perfil:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar los cambios');
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

  // Helper to get display value - Simplified placeholders
  const getDisplayValue = (field: string) => {
    if (field === 'nombre') return `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || employee?.name || '-';
    if (field === 'telefono') return employee?.phone || '-';
    if (field === 'dni') return employee?.dni || '-';
    if (field === 'email') return employee?.email || '-';
    if (field === 'cargo') return employee?.position || employee?.role || '-';
    if (field === 'departamento') return employee?.departamento || employee?.department || '-';
    return '-';
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
    <div style={{ padding: isMobile ? '12px' : '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
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
            gap: '8px',
            fontSize: isMobile ? '14px' : '16px'
          }}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 'bold', margin: 0 }}>
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
        padding: isMobile ? '16px' : '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '16px' : '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} />
            Información Personal
          </h2>
          {editing && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
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
          gap: isMobile ? '16px' : '24px'
        }}>
          {/* Nombre - Editable */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '6px', fontSize: '14px', color: '#374151', display: 'block' }}>Nombre</label>
            {editing ? (
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Nombre"
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  width: '100%',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              />
            ) : (
              <div style={{ padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '15px', color: '#111827', width: '100%', boxSizing: 'border-box' }}>
                {getDisplayValue('nombre')}
              </div>
            )}
          </div>

          {/* Apellidos - Editable */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '6px', fontSize: '14px', color: '#374151', display: 'block' }}>Apellidos</label>
            {editing ? (
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Apellidos"
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  width: '100%',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              />
            ) : (
              <div style={{ padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '15px', color: '#111827', width: '100%', boxSizing: 'border-box' }}>
                {employee?.last_name || '-'}
              </div>
            )}
          </div>

          {/* DNI - Editable */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '6px', fontSize: '14px', color: '#374151', display: 'block' }}>DNI</label>
            {editing ? (
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="DNI / NIE"
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  width: '100%',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              />
            ) : (
              <div style={{ padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '15px', color: '#111827', width: '100%', boxSizing: 'border-box' }}>
                {getDisplayValue('dni')}
              </div>
            )}
          </div>

          {/* Teléfono - Editable */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '6px', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={14} />
              Teléfono
            </label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Teléfono"
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  width: '100%',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              />
            ) : (
              <div style={{ padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '15px', color: '#111827', width: '100%', boxSizing: 'border-box' }}>
                {getDisplayValue('telefono')}
              </div>
            )}
          </div>

          {/* Email - Read only */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '6px', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={14} />
              Email
            </label>
            <div style={{
              padding: '10px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              color: editing ? '#6b7280' : '#111827',
              fontSize: '15px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {getDisplayValue('email')}
              {editing && <span style={{ fontSize: '11px', marginLeft: '8px', color: '#9ca3af' }}>(no editable)</span>}
            </div>
          </div>

          {/* Cargo - Read only */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '6px', fontSize: '14px', color: '#374151', display: 'block' }}>Cargo</label>
            <div style={{
              padding: '10px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              color: editing ? '#6b7280' : '#111827',
              fontSize: '15px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {getDisplayValue('cargo')}
            </div>
          </div>

          {/* Departamento - Read only - Hide if empty unless editing */}
          {(editing || getDisplayValue('departamento') !== '-') && (
            <div>
              <label style={{ fontWeight: '500', marginBottom: '6px', fontSize: '14px', color: '#374151', display: 'block' }}>Departamento</label>
              <div style={{
                padding: '10px 12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                color: editing ? '#6b7280' : '#111827',
                fontSize: '15px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {getDisplayValue('departamento')}
              </div>
            </div>
          )}
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
                gap: '8px',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
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
                gap: '8px',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
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
