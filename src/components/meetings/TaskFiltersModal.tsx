import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { filterTasks } from '../../services/taskService';

interface TaskFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (tasks: any[]) => void;
}

export const TaskFiltersModal: React.FC<TaskFiltersModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters
}) => {
  const [filters, setFilters] = useState({
    estado: '',
    prioridad: '',
    asignado_a: '',
    reunion_titulo: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [loading, setLoading] = useState(false);

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const result = await filterTasks(filters);
      if (result.success && result.tasks) {
        onApplyFilters(result.tasks);
        onClose();
      }
    } catch (error) {
      console.error('Error aplicando filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      estado: '',
      prioridad: '',
      asignado_a: '',
      reunion_titulo: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
  };

  if (!isOpen) return null;

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
      zIndex: 1001
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '95%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            🔍 Filtros Avanzados
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          display: 'grid',
          gap: '16px'
        }}>
          {/* Estado */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              display: 'block',
              marginBottom: '8px'
            }}>
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          {/* Prioridad */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              display: 'block',
              marginBottom: '8px'
            }}>
              Prioridad
            </label>
            <select
              value={filters.prioridad}
              onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Todas</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          {/* Asignado a */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              display: 'block',
              marginBottom: '8px'
            }}>
              Asignado a (email)
            </label>
            <input
              type="email"
              placeholder="Ej: usuario@example.com"
              value={filters.asignado_a}
              onChange={(e) => setFilters({ ...filters, asignado_a: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Reunión */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              display: 'block',
              marginBottom: '8px'
            }}>
              Título de Reunión
            </label>
            <input
              type="text"
              placeholder="Buscar por título de reunión"
              value={filters.reunion_titulo}
              onChange={(e) => setFilters({ ...filters, reunion_titulo: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Fecha Desde */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              display: 'block',
              marginBottom: '8px'
            }}>
              Fecha Límite Desde
            </label>
            <input
              type="date"
              value={filters.fecha_desde}
              onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              display: 'block',
              marginBottom: '8px'
            }}>
              Fecha Límite Hasta
            </label>
            <input
              type="date"
              value={filters.fecha_hasta}
              onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={handleReset}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Limpiar
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleApplyFilters}
            disabled={loading}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Aplicando...' : 'Aplicar Filtros'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFiltersModal;
