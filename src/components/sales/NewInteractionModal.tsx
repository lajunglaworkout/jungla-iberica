import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Mail, Phone, MessageSquare, FileText, Calendar, AlertCircle } from 'lucide-react';

interface NewInteractionModalProps {
  leadId: string;
  leadName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const NewInteractionModal: React.FC<NewInteractionModalProps> = ({ leadId, leadName, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    tipo: 'email',
    direccion: 'saliente',
    asunto: '',
    contenido: '',
    resultado: '',
    duracion_minutos: '',
    fecha_seguimiento: '',
    crear_tarea: false
  });

  const tipos = [
    { id: 'email', nombre: 'Email', icon: Mail, color: '#3b82f6' },
    { id: 'llamada', nombre: 'Llamada', icon: Phone, color: '#10b981' },
    { id: 'whatsapp', nombre: 'WhatsApp', icon: MessageSquare, color: '#25d366' },
    { id: 'nota', nombre: 'Nota', icon: FileText, color: '#6b7280' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.asunto.trim()) {
      setError('El asunto es obligatorio');
      return;
    }

    if (!formData.contenido.trim()) {
      setError('El contenido es obligatorio');
      return;
    }

    setLoading(true);

    try {
      // Guardar interacción
      const interactionData = {
        lead_id: leadId,
        tipo: formData.tipo,
        direccion: formData.direccion,
        asunto: formData.asunto,
        contenido: formData.contenido,
        resultado: formData.resultado || null,
        duracion_minutos: formData.duracion_minutos ? parseInt(formData.duracion_minutos) : null,
        fecha: new Date().toISOString(),
        fecha_seguimiento: formData.fecha_seguimiento || null,
        created_by: 'carlossuarezparra@gmail.com' // TODO: Obtener del contexto
      };

      const { data: interaction, error: interactionError } = await supabase
        .from('lead_interactions')
        .insert([interactionData])
        .select()
        .single();

      if (interactionError) throw interactionError;

      console.log('✅ Interacción creada:', interaction);

      // Si hay fecha de seguimiento y se marcó crear tarea, crear tarea
      if (formData.fecha_seguimiento && formData.crear_tarea) {
        const taskData = {
          titulo: `Seguimiento: ${formData.asunto}`,
          descripcion: `Lead: ${leadName}\n\n${formData.contenido}`,
          asignado_a: 'carlossuarezparra@gmail.com', // TODO: Obtener del contexto
          fecha_limite: formData.fecha_seguimiento,
          prioridad: 'media',
          estado: 'pendiente',
          departamento: 'ventas',
          categoria: 'seguimiento_lead'
        };

        const { data: task, error: taskError } = await supabase
          .from('tareas')
          .insert([taskData])
          .select()
          .single();

        if (taskError) {
          console.error('⚠️ Error creando tarea:', taskError);
        } else {
          console.log('✅ Tarea de seguimiento creada:', task);
          
          // Actualizar interacción con tarea_id
          await supabase
            .from('lead_interactions')
            .update({ tarea_id: task.id, tarea_creada: true })
            .eq('id', interaction.id);
        }
      }

      // Actualizar fecha_ultimo_contacto del lead
      await supabase
        .from('leads')
        .update({ fecha_ultimo_contacto: new Date().toISOString() })
        .eq('id', leadId);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error creando interacción:', error);
      setError(error.message || 'Error al crear la interacción');
    } finally {
      setLoading(false);
    }
  };

  const tipoSeleccionado = tipos.find(t => t.id === formData.tipo);
  const IconoTipo = tipoSeleccionado?.icon || FileText;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
              📝 Nueva Interacción
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Lead: <strong>{leadName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle style={{ width: '16px', height: '16px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Tipo de Interacción */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Tipo de Interacción *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {tipos.map(tipo => {
                const Icon = tipo.icon;
                const isSelected = formData.tipo === tipo.id;
                return (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo: tipo.id }))}
                    style={{
                      padding: '12px',
                      backgroundColor: isSelected ? tipo.color + '20' : 'white',
                      border: `2px solid ${isSelected ? tipo.color : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px', color: isSelected ? tipo.color : '#6b7280' }} />
                    <span style={{ fontSize: '11px', color: isSelected ? tipo.color : '#6b7280', fontWeight: isSelected ? '600' : '400' }}>
                      {tipo.nombre}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dirección (solo para email, llamada, whatsapp) */}
          {formData.tipo !== 'nota' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Dirección
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, direccion: 'saliente' }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: formData.direccion === 'saliente' ? '#3b82f6' : 'white',
                    color: formData.direccion === 'saliente' ? 'white' : '#6b7280',
                    border: `1px solid ${formData.direccion === 'saliente' ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ↗️ Saliente (yo contacté)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, direccion: 'entrante' }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: formData.direccion === 'entrante' ? '#3b82f6' : 'white',
                    color: formData.direccion === 'entrante' ? 'white' : '#6b7280',
                    border: `1px solid ${formData.direccion === 'entrante' ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ↙️ Entrante (me contactaron)
                </button>
              </div>
            </div>
          )}

          {/* Asunto */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Asunto *
            </label>
            <input
              type="text"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              placeholder="Ej: Envío de propuesta económica"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Contenido */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Contenido / Notas *
            </label>
            <textarea
              name="contenido"
              value={formData.contenido}
              onChange={handleChange}
              placeholder="Describe la interacción, acuerdos, próximos pasos..."
              required
              rows={5}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Duración (solo para llamadas) */}
          {formData.tipo === 'llamada' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Duración (minutos)
              </label>
              <input
                type="number"
                name="duracion_minutos"
                value={formData.duracion_minutos}
                onChange={handleChange}
                placeholder="15"
                min="1"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}

          {/* Resultado */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Resultado
            </label>
            <select
              name="resultado"
              value={formData.resultado}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">-- Seleccionar --</option>
              <option value="positivo">✅ Positivo</option>
              <option value="neutral">➖ Neutral</option>
              <option value="negativo">❌ Negativo</option>
            </select>
          </div>

          {/* Fecha de Seguimiento */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar style={{ width: '16px', height: '16px' }} />
              Fecha de Seguimiento (opcional)
            </label>
            <input
              type="datetime-local"
              name="fecha_seguimiento"
              value={formData.fecha_seguimiento}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {formData.fecha_seguimiento && (
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="crear_tarea"
                    checked={formData.crear_tarea}
                    onChange={handleChange}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: '#374151' }}>
                    Crear tarea automática en mi calendario
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: loading ? '#9ca3af' : tipoSeleccionado?.color,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                'Guardando...'
              ) : (
                <>
                  <IconoTipo style={{ width: '16px', height: '16px' }} />
                  Registrar Interacción
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewInteractionModal;
