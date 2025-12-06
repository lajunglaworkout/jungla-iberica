// En: src/components/CreateCenterModal.tsx

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CenterType, CenterStatus } from '../types/center';

interface CreateCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCenterModal: React.FC<CreateCenterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Estado unificado para todos los campos del formulario
  const [formData, setFormData] = useState({
    // Campos actuales (mantener)
    name: '',
    city: '',
    type: 'Propio' as CenterType,
    status: 'Activo' as CenterStatus,

    // NUEVOS CAMPOS AÑADIDOS:
    address: '',           // Dirección completa
    responsable: '',       // Gerente/Responsable del centro
    phone: '',            // Teléfono del centro
    email: '',            // Email del centro
    capacity: 0,          // Capacidad máxima de socios
    opening_time: '06:00', // Hora apertura
    closing_time: '22:00', // Hora cierre
    monthly_target: 0,     // Objetivo mensual facturación
    coordinates: {        // Para futura integración mapas
      lat: null as number | null,
      lng: null as number | null
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para actualizar cualquier campo del formulario
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validaciones
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+34|0034|34)?[6-9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones antes de enviar
    if (!formData.name.trim()) {
      setError('El nombre del centro es obligatorio');
      setLoading(false);
      return;
    }

    if (!formData.city.trim()) {
      setError('La ciudad es obligatoria');
      setLoading(false);
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      setError('El email no tiene un formato válido');
      setLoading(false);
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      setError('El teléfono debe tener formato español válido');
      setLoading(false);
      return;
    }

    if (formData.capacity < 0) {
      setError('La capacidad no puede ser negativa');
      setLoading(false);
      return;
    }

    if (formData.monthly_target < 0) {
      setError('El objetivo mensual no puede ser negativo');
      setLoading(false);
      return;
    }

    console.log('🏢 Creando nuevo centro:', formData.name);

    try {
      // Preparar datos para insertar en Supabase
      const centerData = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        type: formData.type,
        status: formData.status,
        responsable: formData.responsable.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        capacity: formData.capacity,
        opening_time: formData.opening_time,
        closing_time: formData.closing_time,
        monthly_target: formData.monthly_target,
        coordinates: formData.coordinates.lat && formData.coordinates.lng ? formData.coordinates : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('centers')
        .insert([centerData]);

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Centro creado exitosamente:', formData.name);

      // Resetear formulario
      setFormData({
        name: '',
        city: '',
        type: 'Propio' as CenterType,
        status: 'Activo' as CenterStatus,
        address: '',
        responsable: '',
        phone: '',
        email: '',
        capacity: 0,
        opening_time: '06:00',
        closing_time: '22:00',
        monthly_target: 0,
        coordinates: { lat: null, lng: null }
      });

      setLoading(false);
      onSuccess(); // Avisar al panel principal para que refresque la lista
      onClose(); // Cerrar el modal
    } catch (err) {
      console.error('❌ Error al crear el centro:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al crear el centro');
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  // Estilos mejorados para el modal con diseño en 2 columnas
  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const contentStyle: React.CSSProperties = {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    width: '800px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    marginTop: '6px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  };

  const buttonPrimaryStyle: React.CSSProperties = {
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s'
  };

  const buttonSecondaryStyle: React.CSSProperties = {
    backgroundColor: 'white',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s'
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
            marginBottom: '8px'
          }}>
            🏢 Crear Nuevo Centro
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            Completa la información del nuevo centro deportivo
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Layout en 2 columnas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Columna izquierda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Nombre del Centro *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => updateFormData('name', e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Ej: La Jungla Sevilla Centro"
                />
              </div>

              <div>
                <label style={labelStyle}>Ciudad *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => updateFormData('city', e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Ej: Sevilla"
                />
              </div>

              <div>
                <label style={labelStyle}>Dirección Completa</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => updateFormData('address', e.target.value)}
                  style={inputStyle}
                  placeholder="Ej: Calle Ejemplo 123, 41001 Sevilla"
                />
              </div>

              <div>
                <label style={labelStyle}>Responsable/Gerente</label>
                <input
                  type="text"
                  value={formData.responsable}
                  onChange={e => updateFormData('responsable', e.target.value)}
                  style={inputStyle}
                  placeholder="Ej: Juan Pérez García"
                />
              </div>

              <div>
                <label style={labelStyle}>Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => updateFormData('phone', e.target.value)}
                  style={inputStyle}
                  placeholder="Ej: +34 600 123 456"
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => updateFormData('email', e.target.value)}
                  style={inputStyle}
                  placeholder="Ej: sevilla@lajungla.com"
                />
              </div>
            </div>

            {/* Columna derecha */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Tipo de Centro *</label>
                <select
                  value={formData.type}
                  onChange={e => updateFormData('type', e.target.value as CenterType)}
                  style={inputStyle}
                >
                  <option value="Propio">🏢 Propio</option>
                  <option value="Franquicia">🏪 Franquicia</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Estado Operativo *</label>
                <select
                  value={formData.status}
                  onChange={e => updateFormData('status', e.target.value as CenterStatus)}
                  style={inputStyle}
                >
                  <option value="Activo">✅ Activo</option>
                  <option value="En Construcción">🚧 En Construcción</option>
                  <option value="Suspendido">⏸️ Suspendido</option>
                  <option value="Cerrado">❌ Cerrado</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Capacidad Máxima (socios)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={e => updateFormData('capacity', parseInt(e.target.value) || 0)}
                  style={inputStyle}
                  placeholder="Ej: 500"
                  min="0"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Hora Apertura</label>
                  <input
                    type="time"
                    value={formData.opening_time}
                    onChange={e => updateFormData('opening_time', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Hora Cierre</label>
                  <input
                    type="time"
                    value={formData.closing_time}
                    onChange={e => updateFormData('closing_time', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Objetivo Mensual (€)</label>
                <input
                  type="number"
                  value={formData.monthly_target}
                  onChange={e => updateFormData('monthly_target', parseFloat(e.target.value) || 0)}
                  style={inputStyle}
                  placeholder="Ej: 25000"
                  min="0"
                  step="100"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px'
            }}>
              <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>
                ❌ {error}
              </p>
            </div>
          )}

          {/* Botones */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={buttonSecondaryStyle}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={buttonPrimaryStyle}
            >
              {loading ? '⏳ Creando...' : '✅ Crear Centro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};