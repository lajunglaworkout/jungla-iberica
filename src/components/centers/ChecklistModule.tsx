import React, { useState } from 'react';
import { ArrowLeft, ClipboardList, AlertTriangle, CheckCircle, XCircle, Calendar, Filter, Plus } from 'lucide-react';
import SmartIncidentModal from '../incidents/SmartIncidentModal';

interface ChecklistModuleProps {
  centerName: string;
  centerId: string;
  onBack: () => void;
}

interface ChecklistItem {
  id: string;
  fecha: string;
  categoria: 'limpieza' | 'mantenimiento' | 'equipamiento' | 'seguridad' | 'otros';
  descripcion: string;
  estado: 'pendiente' | 'en_proceso' | 'resuelto' | 'no_aplica';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  responsable: string;
  observaciones: string;
  fechaResolucion?: string;
}

const ChecklistModule: React.FC<ChecklistModuleProps> = ({ centerName, centerId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'reportes' | 'nuevo'>('reportes');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentDescription, setIncidentDescription] = useState('');
  
  // Mock data de reportes
  const [reportes, setReportes] = useState<ChecklistItem[]>([
    {
      id: '1',
      fecha: '2025-09-24',
      categoria: 'equipamiento',
      descripcion: 'Goma elástica rota en zona de funcional',
      estado: 'resuelto',
      prioridad: 'media',
      responsable: 'Carlos López',
      observaciones: 'Sustituida por nueva goma. Stock actualizado.',
      fechaResolucion: '2025-09-24'
    },
    {
      id: '2',
      fecha: '2025-09-23',
      categoria: 'limpieza',
      descripcion: 'Falta papel higiénico en vestuarios masculinos',
      estado: 'resuelto',
      prioridad: 'alta',
      responsable: 'María García',
      observaciones: 'Repuesto inmediatamente',
      fechaResolucion: '2025-09-23'
    },
    {
      id: '3',
      fecha: '2025-09-22',
      categoria: 'mantenimiento',
      descripcion: 'Aire acondicionado hace ruido extraño',
      estado: 'en_proceso',
      prioridad: 'alta',
      responsable: 'David Martín',
      observaciones: 'Técnico programado para mañana'
    },
    {
      id: '4',
      fecha: '2025-09-21',
      categoria: 'seguridad',
      descripcion: 'Luz de emergencia parpadeando',
      estado: 'pendiente',
      prioridad: 'critica',
      responsable: 'Ana Rodríguez',
      observaciones: 'Requiere electricista certificado'
    }
  ]);

  const [nuevoReporte, setNuevoReporte] = useState<Partial<ChecklistItem>>({
    categoria: 'otros',
    descripcion: '',
    prioridad: 'media',
    responsable: '',
    observaciones: ''
  });

  const categorias = [
    { value: 'limpieza', label: '🧽 Limpieza', color: '#3b82f6' },
    { value: 'mantenimiento', label: '🔧 Mantenimiento', color: '#f59e0b' },
    { value: 'equipamiento', label: '💪 Equipamiento', color: '#10b981' },
    { value: 'seguridad', label: '🛡️ Seguridad', color: '#ef4444' },
    { value: 'otros', label: '📋 Otros', color: '#6b7280' }
  ];

  const estados = [
    { value: 'pendiente', label: '⏳ Pendiente', color: '#f59e0b' },
    { value: 'en_proceso', label: '🔄 En Proceso', color: '#3b82f6' },
    { value: 'resuelto', label: '✅ Resuelto', color: '#10b981' },
    { value: 'no_aplica', label: '❌ No Aplica', color: '#6b7280' }
  ];

  const prioridades = [
    { value: 'baja', label: '🟢 Baja', color: '#10b981' },
    { value: 'media', label: '🟡 Media', color: '#f59e0b' },
    { value: 'alta', label: '🟠 Alta', color: '#f97316' },
    { value: 'critica', label: '🔴 Crítica', color: '#ef4444' }
  ];

  const reportesFiltrados = reportes.filter(reporte => {
    const categoriaMatch = filtroCategoria === 'todas' || reporte.categoria === filtroCategoria;
    const estadoMatch = filtroEstado === 'todos' || reporte.estado === filtroEstado;
    return categoriaMatch && estadoMatch;
  });

  const handleNuevoReporte = () => {
    if (!nuevoReporte.descripcion || !nuevoReporte.responsable) {
      alert('Por favor completa la descripción y responsable');
      return;
    }

    const reporte: ChecklistItem = {
      id: Date.now().toString(),
      fecha: new Date().toISOString().split('T')[0],
      categoria: nuevoReporte.categoria as any,
      descripcion: nuevoReporte.descripcion,
      estado: 'pendiente',
      prioridad: nuevoReporte.prioridad as any,
      responsable: nuevoReporte.responsable,
      observaciones: nuevoReporte.observaciones || ''
    };

    setReportes([reporte, ...reportes]);
    setNuevoReporte({
      categoria: 'otros',
      descripcion: '',
      prioridad: 'media',
      responsable: '',
      observaciones: ''
    });
    setActiveTab('reportes');
    alert('Reporte creado correctamente');
  };

  const getEstadoColor = (estado: string) => {
    return estados.find(e => e.value === estado)?.color || '#6b7280';
  };

  const getPrioridadColor = (prioridad: string) => {
    return prioridades.find(p => p.value === prioridad)?.color || '#6b7280';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onBack} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>📋 Informes Checklist - {centerName}</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Gestión de incidencias y mantenimiento</p>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <button onClick={() => setActiveTab('reportes')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'reportes' ? '#3b82f6' : '#f3f4f6', color: activeTab === 'reportes' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            📊 Ver Reportes
          </button>
          <button onClick={() => setActiveTab('nuevo')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'nuevo' ? '#3b82f6' : '#f3f4f6', color: activeTab === 'nuevo' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            ➕ Nuevo Reporte
          </button>
        </div>

        {activeTab === 'reportes' && (
          <div>
            {/* Filtros */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Filter style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Categoría</label>
                  <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                    <option value="todas">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Estado</label>
                  <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                    <option value="todos">Todos los estados</option>
                    {estados.map(est => (
                      <option key={est.value} value={est.value}>{est.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginLeft: 'auto', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Total: {reportesFiltrados.length} reportes</span>
                </div>
              </div>
            </div>

            {/* Lista de Reportes */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {reportesFiltrados.map(reporte => (
                <div key={reporte.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `2px solid ${getEstadoColor(reporte.estado)}15` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ padding: '4px 8px', backgroundColor: `${getEstadoColor(reporte.estado)}15`, color: getEstadoColor(reporte.estado), borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                          {estados.find(e => e.value === reporte.estado)?.label}
                        </span>
                        <span style={{ padding: '4px 8px', backgroundColor: `${getPrioridadColor(reporte.prioridad)}15`, color: getPrioridadColor(reporte.prioridad), borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                          {prioridades.find(p => p.value === reporte.prioridad)?.label}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {categorias.find(c => c.value === reporte.categoria)?.label}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>{reporte.descripcion}</h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                        <strong>Responsable:</strong> {reporte.responsable}
                      </p>
                      {reporte.observaciones && (
                        <p style={{ fontSize: '14px', color: '#374151', margin: 0, fontStyle: 'italic' }}>
                          "{reporte.observaciones}"
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Reportado</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{new Date(reporte.fecha).toLocaleDateString('es-ES')}</p>
                      {reporte.fechaResolucion && (
                        <>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 4px 0' }}>Resuelto</p>
                          <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: '#10b981' }}>{new Date(reporte.fechaResolucion).toLocaleDateString('es-ES')}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nuevo' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>➕ Crear Nuevo Reporte</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Categoría *</label>
                  <select value={nuevoReporte.categoria} onChange={(e) => setNuevoReporte({...nuevoReporte, categoria: e.target.value as any})} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Prioridad *</label>
                  <select value={nuevoReporte.prioridad} onChange={(e) => setNuevoReporte({...nuevoReporte, prioridad: e.target.value as any})} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                    {prioridades.map(pri => (
                      <option key={pri.value} value={pri.value}>{pri.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Responsable *</label>
                  <input type="text" value={nuevoReporte.responsable} onChange={(e) => setNuevoReporte({...nuevoReporte, responsable: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} placeholder="Nombre del responsable" />
                </div>
              </div>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Descripción *</label>
                  <textarea value={nuevoReporte.descripcion} onChange={(e) => setNuevoReporte({...nuevoReporte, descripcion: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }} placeholder="Describe la incidencia o tarea..." />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Observaciones</label>
                  <textarea value={nuevoReporte.observaciones} onChange={(e) => setNuevoReporte({...nuevoReporte, observaciones: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', resize: 'vertical' }} placeholder="Información adicional (opcional)" />
                </div>
                
                <button onClick={handleNuevoReporte} style={{ padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Crear Reporte
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón flotante para reportar incidencia rápida */}
      <button
        onClick={() => {
          setIncidentDescription('');
          setShowIncidentModal(true);
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          zIndex: 1000
        }}
        title="Reportar Incidencia"
      >
        <AlertTriangle size={24} />
      </button>

      {/* Modal de Incidencias Inteligente */}
      <SmartIncidentModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        centerName={centerName}
        centerId={centerId}
        initialDescription={incidentDescription}
        onIncidentCreated={(incident) => {
          console.log('Incidencia creada desde checklist:', incident);
          // Aquí puedes añadir la incidencia a la lista de reportes si quieres
        }}
      />
    </div>
  );
};

export default ChecklistModule;
