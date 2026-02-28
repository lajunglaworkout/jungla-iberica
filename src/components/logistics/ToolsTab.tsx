import React from 'react';
import { AlertTriangle, Clock, Package, Trash2 } from 'lucide-react';
import { Tool, ToolLocation } from './types';
import { ui } from '../../utils/ui';

interface ToolsTabProps {
  tools: Tool[];
  toolLocations: ToolLocation[];
  toolSearchTerm: string;
  toolStatusFilter: string;
  toolLocationFilter: string;
  setToolSearchTerm: (v: string) => void;
  setToolStatusFilter: (v: string) => void;
  setToolLocationFilter: (v: string) => void;
  setSelectedTool: (tool: Tool | null) => void;
  setShowMoveToolModal: (v: boolean) => void;
  onDeleteTool: (toolId: number) => void;
}

const ToolsTab: React.FC<ToolsTabProps> = ({
  tools,
  toolLocations,
  toolSearchTerm,
  toolStatusFilter,
  toolLocationFilter,
  setToolSearchTerm,
  setToolStatusFilter,
  setToolLocationFilter,
  setSelectedTool,
  setShowMoveToolModal,
  onDeleteTool,
}) => {
  const getFilteredTools = () => {
    return tools.filter(tool => {
      const locationName = toolLocations.find(loc => loc.id === tool.current_location)?.name || '';
      const matchesSearch = toolSearchTerm === '' ||
        tool.name.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        tool.brand.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        tool.model.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        locationName.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        (tool.serial_number && tool.serial_number.toLowerCase().includes(toolSearchTerm.toLowerCase())) ||
        (tool.assigned_to && tool.assigned_to.toLowerCase().includes(toolSearchTerm.toLowerCase()));

      const matchesStatus = toolStatusFilter === 'all' || tool.status === toolStatusFilter;
      const matchesLocation = toolLocationFilter === 'all' || tool.current_location === toolLocationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  };

  const getToolsNeedingMaintenance = () => {
    const today = new Date();
    return tools.filter(tool => {
      if (!tool.next_maintenance) return false;
      const maintenanceDate = new Date(tool.next_maintenance);
      const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilMaintenance <= 30 && daysUntilMaintenance >= 0;
    });
  };

  const getOverdueMaintenanceTools = () => {
    const today = new Date();
    return tools.filter(tool => {
      if (!tool.next_maintenance) return false;
      const maintenanceDate = new Date(tool.next_maintenance);
      return maintenanceDate < today;
    });
  };

  const filteredTools = getFilteredTools();
  const overdueTools = getOverdueMaintenanceTools();
  const maintenanceSoonTools = getToolsNeedingMaintenance();

  return (
    <div>
      {/* Alertas de Mantenimiento */}
      {(overdueTools.length > 0 || maintenanceSoonTools.length > 0) && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          {overdueTools.length > 0 && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              flex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={20} style={{ color: '#dc2626' }} />
                <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1rem', fontWeight: '600' }}>
                  Mantenimiento Vencido
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f1d1d' }}>
                {overdueTools.length} herramienta(s) con mantenimiento vencido
              </p>
            </div>
          )}

          {maintenanceSoonTools.length > 0 && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fed7aa',
              borderRadius: '8px',
              padding: '1rem',
              flex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock size={20} style={{ color: '#d97706' }} />
                <h3 style={{ margin: 0, color: '#d97706', fontSize: '1rem', fontWeight: '600' }}>
                  Mantenimiento Próximo
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
                {maintenanceSoonTools.length} herramienta(s) necesitan mantenimiento en 30 días
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {/* Contador de herramientas */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Mostrando {filteredTools.length} de {tools.length} herramientas
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {(toolSearchTerm || toolStatusFilter !== 'all' || toolLocationFilter !== 'all') && (
                <button
                  onClick={() => {
                    setToolSearchTerm('');
                    setToolStatusFilter('all');
                    setToolLocationFilter('all');
                  }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}
                >
                  🔄 Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr', backgroundColor: '#f9fafb', padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
          <div>Herramienta</div>
          <div>Categoría</div>
          <div>Ubicación</div>
          <div>Estado</div>
          <div>Asignado a</div>
          <div>Precio</div>
          <div>Acciones</div>
        </div>

        {filteredTools.map((tool: Tool) => (
          <div key={tool.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr', padding: '1rem', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '600' }}>{tool.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{tool.brand} {tool.model}</div>
            </div>
            <div>{tool.category}</div>
            <div>{toolLocations.find(loc => loc.id === tool.current_location)?.name}</div>
            <div style={{ color: tool.status === 'available' ? '#059669' : tool.status === 'lost' ? '#dc2626' : '#6b7280' }}>
              {tool.status === 'available' ? '✅ Disponible' :
                tool.status === 'in_use' ? '🔧 En Uso' :
                  tool.status === 'maintenance' ? '⚙️ Mantenimiento' :
                    tool.status === 'lost' ? '❌ Perdida' : '🔴 Dañada'}
            </div>
            <div>{tool.assigned_to || '-'}</div>
            <div>€{tool.purchase_price.toFixed(2)}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setSelectedTool(tool);
                  setShowMoveToolModal(true);
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
                title="Mover herramienta"
              >
                📍 Mover
              </button>
              <button
                onClick={() => {
                  setSelectedTool(tool);
                  ui.info(`Historial de ${tool.name} - Funcionalidad próximamente`);
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
                title="Ver historial"
              >
                📋 Historial
              </button>
              <button
                onClick={async () => {
                  const confirmDelete = await ui.confirm(
                    `¿Estás seguro de que quieres eliminar la herramienta "${tool.name}"?\n\nEsta acción no se puede deshacer.`
                  );
                  if (confirmDelete) {
                    onDeleteTool(tool.id);
                  }
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Eliminar herramienta"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {filteredTools.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <Package size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '1rem', marginBottom: '0.5rem' }}>
              {toolSearchTerm ?
                `No se encontraron herramientas para "${toolSearchTerm}"` :
                `No hay herramientas con los filtros seleccionados`
              }
            </p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
              Prueba a cambiar los filtros o crear una nueva herramienta
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsTab;
