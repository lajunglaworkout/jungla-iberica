// src/components/hr/shiftAdvanced/ShiftAdvancedForm.tsx
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { updateShift, createShift } from '../../../services/hrService';
import { type Shift } from './ShiftAdvancedTypes';

interface Props {
  shift: Shift | null;
  centers: Array<{ id: string | number; name?: string; nombre?: string }>;
  defaultCenterId?: number | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ShiftAdvancedForm: React.FC<Props> = ({ shift, centers, defaultCenterId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: shift?.name || '',
    start_time: shift?.start_time || '09:00',
    end_time: shift?.end_time || '17:00',
    monday: shift?.monday || false,
    tuesday: shift?.tuesday || false,
    wednesday: shift?.wednesday || false,
    thursday: shift?.thursday || false,
    friday: shift?.friday || false,
    saturday: shift?.saturday || false,
    sunday: shift?.sunday || false,
    break_minutes: shift?.break_minutes || 30,
    center_id: shift?.center_id || defaultCenterId || centers[0]?.id || 9,
    max_employees: shift?.max_employees || 1,
    min_employees: shift?.min_employees || 1,
    is_support: shift?.is_support || false,
    description: shift?.description || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result;
      if (shift) {
        result = await updateShift(shift.id, formData as unknown as Record<string, unknown>);
      } else {
        result = await createShift({
          ...formData,
          status: 'draft',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Record<string, unknown>);
      }
      if (!result.success) throw new Error(result.error);
      onSave();
      onCancel();
    } catch (error: unknown) {
      console.error('Error guardando turno:', error);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
          {shift ? 'Editar Turno' : 'Nuevo Turno'}
        </h2>
        <button
          onClick={onCancel}
          style={{ padding: '8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Información Básica */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              Información Básica
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Nombre del Turno *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Apertura, Turno Mañana, Apoyo Tarde..."
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Hora Inicio *</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Hora Fin *</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Empleados Mínimos *</label>
                <input
                  type="number"
                  value={formData.min_employees}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_employees: Number(e.target.value) }))}
                  min="1" max="10" required
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Empleados Máximos *</label>
                <input
                  type="number"
                  value={formData.max_employees}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_employees: Number(e.target.value) }))}
                  min="1" max="10" required
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          {/* Días de la semana */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              Días de la Semana
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {[
                { key: 'monday', label: 'Lunes' },
                { key: 'tuesday', label: 'Martes' },
                { key: 'wednesday', label: 'Miércoles' },
                { key: 'thursday', label: 'Jueves' },
                { key: 'friday', label: 'Viernes' },
                { key: 'saturday', label: 'Sábado' },
                { key: 'sunday', label: 'Domingo' }
              ].map(day => (
                <label
                  key={day.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
                    backgroundColor: formData[day.key as keyof typeof formData] ? '#f0fdf4' : '#f9fafb',
                    border: `1px solid ${formData[day.key as keyof typeof formData] ? '#059669' : '#e5e7eb'}`,
                    borderRadius: '6px', cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData[day.key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData(prev => ({ ...prev, [day.key]: e.target.checked }))}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{day.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '12px 20px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            <Save size={16} />
            {shift ? 'Actualizar' : 'Crear'} Turno
          </button>
        </div>
      </form>
    </div>
  );
};
