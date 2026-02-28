import React from 'react';
import { Filter, Clock, AlertTriangle, CheckCircle, Eye, Link, Trash2, Plus, Video, Flag } from 'lucide-react';
import { ui } from '../../utils/ui';
import {
  Publication, CATEGORIAS, FILMMAKERS,
  getStatusColor, getDaysUntilDeadline
} from './MarketingConfig';

export interface QueueFilters {
  estado: string;
  categoria: string;
  centro: string;
  filmmaker: string;
}

interface Props {
  publications: Publication[];
  filters: QueueFilters;
  canCreate: boolean;
  canDelete: boolean;
  onFiltersChange: (filters: QueueFilters) => void;
  onNewPublication: () => void;
  onViewPublication: (pub: Publication) => void;
  onDelete: (id: string) => void;
}

const MarketingPublicationQueue: React.FC<Props> = ({
  publications, filters, canCreate, canDelete,
  onFiltersChange, onNewPublication, onViewPublication, onDelete
}) => {
  const filteredPublications = publications.filter(pub => {
    if (filters.estado && pub.estado !== filters.estado) return false;
    if (filters.categoria && pub.categoria !== filters.categoria) return false;
    if (filters.centro && pub.centro_especifico !== filters.centro) return false;
    if (filters.filmmaker && pub.filmmaker_asignado !== filters.filmmaker) return false;
    return true;
  }).sort((a, b) => new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime());

  return (
    <div>
      {/* Filtros */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <Filter style={{ height: '20px', width: '20px', color: '#6b7280' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Filtros</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <select value={filters.estado} onChange={(e) => onFiltersChange({ ...filters, estado: e.target.value })}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_grabacion">En Grabación</option>
            <option value="grabado">Grabado</option>
            <option value="editado">Editado</option>
            <option value="programado">Programado</option>
            <option value="publicado">Publicado</option>
          </select>
          <select value={filters.categoria} onChange={(e) => onFiltersChange({ ...filters, categoria: e.target.value })}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
          <select value={filters.filmmaker} onChange={(e) => onFiltersChange({ ...filters, filmmaker: e.target.value })}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
            <option value="">Todos los filmmakers</option>
            {FILMMAKERS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: <Clock style={{ height: '16px', width: '16px', color: '#f59e0b' }} />, label: 'Pendientes', count: publications.filter(p => p.estado === 'pendiente').length },
          { icon: <AlertTriangle style={{ height: '16px', width: '16px', color: '#ef4444' }} />, label: 'Urgentes', count: publications.filter(p => p.prioridad === 'urgente').length },
          { icon: <CheckCircle style={{ height: '16px', width: '16px', color: '#10b981' }} />, label: 'Esta Semana', count: publications.filter(p => { const d = getDaysUntilDeadline(p.fecha_limite); return d >= 0 && d <= 7; }).length }
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {stat.icon}
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>{stat.label}</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Lista de publicaciones */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Cola de Publicaciones ({filteredPublications.length})
          </h3>
          <button
            onClick={onNewPublication}
            disabled={!canCreate}
            style={{
              padding: '8px 16px',
              backgroundColor: canCreate ? '#10b981' : '#9ca3af',
              color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px',
              cursor: canCreate ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Plus style={{ height: '16px', width: '16px' }} />
            Nueva Publicación
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                {['Publicación', 'Categoría', 'Fecha Límite', 'Estado', 'Filmmaker', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPublications.map((pub) => {
                const daysLeft = getDaysUntilDeadline(pub.fecha_limite);
                const isUrgent = daysLeft <= 2;
                const isOverdue = daysLeft < 0;
                const categoria = CATEGORIAS.find(c => c.value === pub.categoria);
                const filmmaker = FILMMAKERS.find(f => f.id === pub.filmmaker_asignado);

                return (
                  <tr key={pub.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: isOverdue ? '#fef2f2' : isUrgent ? '#fff7ed' : 'white' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{pub.titulo}</span>
                        {pub.prioridad === 'urgente' && <Flag style={{ height: '14px', width: '14px', color: '#ef4444' }} />}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {pub.perfil_ig === 'centro_especifico' ? pub.centro_especifico : 'Común'} • {pub.categoria_publicacion}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{categoria?.icon}</span>
                        <span style={{ fontSize: '14px', color: '#374151' }}>{categoria?.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '14px', color: isOverdue ? '#dc2626' : isUrgent ? '#ea580c' : '#374151', fontWeight: isOverdue || isUrgent ? '600' : '400' }}>
                        {new Date(pub.fecha_limite).toLocaleDateString('es-ES')}
                      </span>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {isOverdue ? `${Math.abs(daysLeft)} días de retraso` : daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `${daysLeft} días`}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', backgroundColor: getStatusColor(pub.estado) + '20', color: getStatusColor(pub.estado) }}>
                        {pub.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(filmmaker?.name || 'Unknown')}&background=059669&color=fff`}
                          alt={filmmaker?.name}
                          style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                        />
                        <span style={{ fontSize: '14px', color: '#374151' }}>{filmmaker?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => onViewPublication(pub)} style={{ padding: '4px', border: 'none', borderRadius: '4px', backgroundColor: 'transparent', cursor: 'pointer' }} title="Ver detalles">
                          <Eye style={{ height: '16px', width: '16px', color: '#6b7280' }} />
                        </button>
                        <a href={pub.enlace_drive} target="_blank" rel="noopener noreferrer" style={{ padding: '4px', border: 'none', borderRadius: '4px', backgroundColor: 'transparent', cursor: 'pointer', textDecoration: 'none' }} title="Ver en Google Drive">
                          <Link style={{ height: '16px', width: '16px', color: '#3b82f6' }} />
                        </a>
                        {canDelete && (
                          <button
                            onClick={async () => {
                              if (pub.id && await ui.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
                                onDelete(pub.id);
                              }
                            }}
                            style={{ padding: '4px', border: 'none', borderRadius: '4px', backgroundColor: 'transparent', cursor: 'pointer' }}
                            title="Eliminar publicación"
                          >
                            <Trash2 style={{ height: '16px', width: '16px', color: '#ef4444' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPublications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <Video style={{ height: '48px', width: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: '16px', margin: 0 }}>No hay publicaciones que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingPublicationQueue;
