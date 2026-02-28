// src/components/incidents/incident/IncidentCreateModal.tsx
import React from 'react';
import { type IncidentCategory, type IncidentType } from './IncidentTypes';

const fieldStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  fontSize: '14px',
  backgroundColor: 'white',
  transition: 'all 0.2s',
  outline: 'none',
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#059669';
    e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'none';
  },
};

export interface IncidentFormData {
  category_id: string;
  incident_type_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  clothing_type: string;
  clothing_size: string;
  quantity: number;
}

interface Props {
  formData: IncidentFormData;
  selectedCategory: string;
  incidentCategories: IncidentCategory[];
  incidentTypes: IncidentType[];
  onFormChange: (data: IncidentFormData) => void;
  onCategoryChange: (categoryId: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const IncidentCreateModal: React.FC<Props> = ({
  formData, selectedCategory, incidentCategories, incidentTypes,
  onFormChange, onCategoryChange, onSubmit, onClose,
}) => {
  const selectedType = incidentTypes.find(t => t.id.toString() === formData.incident_type_id);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>Nueva Incidencia</h2>
            <button onClick={onClose} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{ display: 'grid', gap: '20px' }}>
            {/* Categoría */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Categoría *</label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                required style={fieldStyle} {...focusHandlers}
              >
                <option value="">Seleccionar categoría...</option>
                {incidentCategories
                  .filter((cat, i, self) => i === self.findIndex(c => c.name === cat.name))
                  .map(cat => <option key={`cat-${cat.id}`} value={cat.id}>{cat.icon} {cat.name}</option>)}
              </select>
            </div>

            {/* Tipo */}
            {selectedCategory && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Tipo de Incidencia *</label>
                <select
                  value={formData.incident_type_id}
                  onChange={(e) => onFormChange({ ...formData, incident_type_id: e.target.value })}
                  required style={fieldStyle} {...focusHandlers}
                >
                  <option value="">Seleccionar tipo...</option>
                  {incidentTypes
                    .filter(type => {
                      const selectedCat = incidentCategories.find(c => c.id.toString() === selectedCategory);
                      if (!selectedCat) return false;
                      const ids = incidentCategories.filter(c => c.name === selectedCat.name).map(c => c.id);
                      return type.category_id && ids.includes(type.category_id);
                    })
                    .map(type => <option key={`type-${type.id}`} value={type.id}>{type.name}</option>)}
                </select>
              </div>
            )}

            {/* Título */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Título *</label>
              <input
                type="text" value={formData.title} required
                onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
                placeholder="Ej: Solicitud de vacaciones agosto"
                style={fieldStyle} {...focusHandlers}
              />
            </div>

            {/* Descripción */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Descripción *</label>
              <textarea
                value={formData.description} required rows={4}
                onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                placeholder="Describe los detalles de tu solicitud..."
                style={{ ...fieldStyle, resize: 'vertical', minHeight: '100px' }}
                {...focusHandlers}
              />
            </div>

            {/* Fechas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Fecha de inicio</label>
                <input type="date" value={formData.start_date} onChange={(e) => onFormChange({ ...formData, start_date: e.target.value })} style={fieldStyle} {...focusHandlers} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Fecha de fin</label>
                <input type="date" value={formData.end_date} onChange={(e) => onFormChange({ ...formData, end_date: e.target.value })} style={fieldStyle} {...focusHandlers} />
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Prioridad</label>
              <select value={formData.priority} onChange={(e) => onFormChange({ ...formData, priority: e.target.value as IncidentFormData['priority'] })} style={fieldStyle} {...focusHandlers}>
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Vestuario */}
            {selectedType?.requires_clothing_details && (
              <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '2px solid #dcfce7' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#059669', marginBottom: '16px' }}>Detalles del Vestuario</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Tipo de prenda</label>
                    <select value={formData.clothing_type} onChange={(e) => onFormChange({ ...formData, clothing_type: e.target.value })} style={fieldStyle} {...focusHandlers}>
                      <option value="">Seleccionar prenda...</option>
                      <option value="Polo">Polo</option>
                      <option value="Camiseta entrenamiento personal">Camiseta entrenamiento personal</option>
                      <option value="Pantalón corto">Pantalón corto</option>
                      <option value="Chándal completo">Chándal completo</option>
                      <option value="Sudadera frío">Sudadera frío</option>
                      <option value="Chaquetón">Chaquetón</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Talla</label>
                    <select value={formData.clothing_size} onChange={(e) => onFormChange({ ...formData, clothing_size: e.target.value })} style={fieldStyle} {...focusHandlers}>
                      <option value="">Seleccionar...</option>
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Cantidad</label>
                    <input type="number" min="1" value={formData.quantity} onChange={(e) => onFormChange({ ...formData, quantity: parseInt(e.target.value) || 1 })} style={fieldStyle} {...focusHandlers} />
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
              <button type="button" onClick={onClose} style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e5e7eb'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}>
                Cancelar
              </button>
              <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#047857'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#059669'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Crear Incidencia
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
