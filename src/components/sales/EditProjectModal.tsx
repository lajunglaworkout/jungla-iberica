import React, { useState } from 'react';
import { projectService } from '../../services/leadService';
import { X, Building2, DollarSign, TrendingUp, MapPin, FileText, Trash2 } from 'lucide-react';

interface EditProjectModalProps {
  project: Record<string, unknown>;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: project.name || '',
    tipo: project.tipo || 'vertical',
    ubicacion: project.ubicacion || '',
    status: project.status || 'planificacion',
    capital_esperado: project.capital_esperado || '',
    ticket_disponible: project.ticket_disponible || '',
    ticket_minimo: project.ticket_minimo || '',
    valor_proyecto: project.valor_proyecto || '',
    ebitda_actual: project.ebitda_actual || '',
    ebitda_proyectado: project.ebitda_proyectado || '',
    roi_proyectado: project.roi_proyectado || '',
    descripcion: project.descripcion || '',
    fecha_inicio: project.fecha_inicio || '',
    fecha_fin: project.fecha_fin || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('El nombre del proyecto es obligatorio');
      return;
    }

    setLoading(true);

    try {
      // Convertir campos numéricos
      const projectData: Record<string, unknown> = {
        name: formData.name,
        tipo: formData.tipo,
        ubicacion: formData.ubicacion || null,
        status: formData.status,
        descripcion: formData.descripcion || null,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
        capital_esperado: formData.capital_esperado ? parseFloat(formData.capital_esperado) : null,
        ticket_disponible: formData.ticket_disponible ? parseFloat(formData.ticket_disponible) : null,
        ticket_minimo: formData.ticket_minimo ? parseFloat(formData.ticket_minimo) : null,
        valor_proyecto: formData.valor_proyecto ? parseFloat(formData.valor_proyecto) : null,
        ebitda_actual: formData.ebitda_actual ? parseFloat(formData.ebitda_actual) : null,
        ebitda_proyectado: formData.ebitda_proyectado ? parseFloat(formData.ebitda_proyectado) : null,
        roi_proyectado: formData.roi_proyectado ? parseFloat(formData.roi_proyectado) : null
      };

      const data = await projectService.update(project.id, projectData);

      console.log('✅ Proyecto actualizado:', data);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('❌ Error actualizando proyecto:', error);
      setError((error instanceof Error ? error.message : String(error)) || 'Error al actualizar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await projectService.delete(project.id);

      console.log('✅ Proyecto eliminado');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('❌ Error eliminando proyecto:', error);
      setError((error instanceof Error ? error.message : String(error)) || 'Error al eliminar el proyecto');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

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
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            ✏️ Editar Proyecto
          </h2>
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
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {showDeleteConfirm ? (
          <div style={{
            padding: '24px',
            backgroundColor: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626', marginBottom: '12px' }}>
              ⚠️ Eliminar Proyecto
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              ¿Estás seguro de que quieres eliminar "{project.name}"? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
                onClick={handleDelete}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: loading ? '#fca5a5' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Eliminando...' : 'Eliminar Proyecto'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Información Básica */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 style={{ width: '18px', height: '18px' }} />
                Información Básica
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Tipo de Proyecto
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
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
                    <option value="vertical">Vertical</option>
                    <option value="franquicia">Franquicia</option>
                    <option value="tech">Tech</option>
                    <option value="financiacion">Financiación</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
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
                    <option value="planificacion">Planificación</option>
                    <option value="active">Activo</option>
                    <option value="en_venta">En Venta</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Información Financiera */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign style={{ width: '18px', height: '18px' }} />
                Información Financiera
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Valor del Proyecto (€)
                  </label>
                  <input
                    type="number"
                    name="valor_proyecto"
                    value={formData.valor_proyecto}
                    onChange={handleChange}
                    step="1000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Capital Esperado a Levantar (€)
                  </label>
                  <input
                    type="number"
                    name="capital_esperado"
                    value={formData.capital_esperado}
                    onChange={handleChange}
                    step="1000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Ticket Disponible (%)
                  </label>
                  <input
                    type="number"
                    name="ticket_disponible"
                    value={formData.ticket_disponible}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Ticket Mínimo (€)
                  </label>
                  <input
                    type="number"
                    name="ticket_minimo"
                    value={formData.ticket_minimo}
                    onChange={handleChange}
                    step="1000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    EBITDA Actual (€)
                  </label>
                  <input
                    type="number"
                    name="ebitda_actual"
                    value={formData.ebitda_actual}
                    onChange={handleChange}
                    step="1000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    EBITDA Proyectado (€)
                  </label>
                  <input
                    type="number"
                    name="ebitda_proyectado"
                    value={formData.ebitda_proyectado}
                    onChange={handleChange}
                    step="1000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    ROI Proyectado (%)
                  </label>
                  <input
                    type="number"
                    name="roi_proyectado"
                    value={formData.roi_proyectado}
                    onChange={handleChange}
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp style={{ width: '18px', height: '18px' }} />
                Fechas
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Fecha de Fin Estimada
                  </label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText style={{ width: '18px', height: '18px' }} />
                Descripción del Proyecto
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
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

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                Eliminar
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
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
                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProjectModal;
