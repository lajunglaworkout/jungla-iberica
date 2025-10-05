import React, { useState, useEffect } from 'react';
import { 
  Video, Calendar, Clock, Users, Building2, Camera, FileText, 
  Link, Eye, Plus, Save, Edit, Trash2, Filter, Search, RefreshCw,
  AlertTriangle, CheckCircle, XCircle, User, MessageSquare, Flag,
  BarChart3, TrendingUp, TrendingDown, Download, Send, X, Play
} from 'lucide-react';

// ============ INTERFACES ============
interface Publication {
  id?: string;
  titulo: string;
  categoria: 'entrenamiento' | 'cliente_comunidad' | 'cliente_postureo' | 'branding' | 'online' | 'viral' | 'humor' | 'servicios_extra' | 'colaboraciones';
  perfil_ig: 'comun' | 'centro_especifico';
  centro_especifico?: string;
  fecha_limite: string;
  categoria_publicacion: 'feed' | 'historie';
  personas_contacto: string[];
  guion: string;
  enlace_drive: string;
  filmmaker_asignado: string;
  estado: 'pendiente' | 'en_grabacion' | 'grabado' | 'editado' | 'programado' | 'publicado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  creado_por: string;
  creado_en: string;
  actualizado_en: string;
  notas_adicionales?: string;
  fecha_publicacion_real?: string;
  metricas_objetivo?: {
    alcance_esperado: number;
    engagement_esperado: number;
  };
}

interface Filmmaker {
  id: string;
  name: string;
  especialidad: string;
  email: string;
}

interface ContactPerson {
  id: string;
  name: string;
  role: string;
  centro: string;
  phone: string;
}

// ============ CONFIGURACIONES ============
const CATEGORIAS = [
  { value: 'entrenamiento', label: 'Entrenamiento', icon: '💪', color: '#10b981' },
  { value: 'cliente_comunidad', label: 'Cliente Comunidad', icon: '👥', color: '#3b82f6' },
  { value: 'cliente_postureo', label: 'Cliente Postureo', icon: '⭐', color: '#f59e0b' },
  { value: 'branding', label: 'Branding', icon: '🏢', color: '#8b5cf6' },
  { value: 'online', label: 'Online', icon: '🌐', color: '#06b6d4' },
  { value: 'viral', label: 'Viral', icon: '🔥', color: '#ef4444' },
  { value: 'humor', label: 'Humor', icon: '😄', color: '#f97316' },
  { value: 'servicios_extra', label: 'Servicios Extra', icon: '➕', color: '#84cc16' },
  { value: 'colaboraciones', label: 'Colaboraciones', icon: '🤝', color: '#ec4899' }
];

const CENTROS_DISPONIBLES = [
  'Sevilla',
  'Jerez',
  'Puerto'
];

const FILMMAKERS: Filmmaker[] = [
  { id: 'filmmaker1', name: 'María García', especialidad: 'Content Creator', email: 'maria@jungla.com' },
  { id: 'filmmaker2', name: 'Luis Rodríguez', especialidad: 'Video Producer', email: 'luis@jungla.com' },
  { id: 'filmmaker3', name: 'Ana Martín', especialidad: 'Community Manager', email: 'ana@jungla.com' },
  { id: 'diego_montilla', name: 'Diego Montilla', especialidad: 'Marketing Manager', email: 'lajunglaworkoutmk@gmail.com' }
];

const CONTACT_PERSONS: ContactPerson[] = [
  { id: 'contact1', name: 'Carlos Suárez', role: 'CEO', centro: 'Marca', phone: '+34 600 000 001' },
  { id: 'contact2', name: 'Benito Morales', role: 'Director', centro: 'Marca', phone: '+34 600 000 002' },
  { id: 'contact3', name: 'Vicente Benítez', role: 'Director', centro: 'Marca', phone: '+34 600 000 003' },
  { id: 'contact4', name: 'Manager Sevilla', role: 'Manager', centro: 'Sevilla', phone: '+34 600 000 004' },
  { id: 'contact5', name: 'Manager Jerez', role: 'Manager', centro: 'Jerez', phone: '+34 600 000 005' },
  { id: 'contact6', name: 'Manager Puerto', role: 'Manager', centro: 'Puerto', phone: '+34 600 000 006' }
];

// ============ COMPONENTE PRINCIPAL ============
const MarketingPublicationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'create' | 'calendar'>('queue');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [filters, setFilters] = useState({
    estado: '',
    categoria: '',
    centro: '',
    filmmaker: ''
  });

  // Simulación de usuario actual - en producción esto vendría del contexto de sesión
  const [currentUser] = useState({
    email: 'lajunglaworkoutmk@gmail.com', // Diego Montilla
    role: 'marketing_manager',
    permissions: {
      canCreate: true,
      canEdit: false,
      canDelete: false,
      canView: true
    }
  });

  // Cargar publicaciones (simulado)
  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = () => {
    // Simulamos datos para demo
    const mockPublications: Publication[] = [
      {
        id: '1',
        titulo: 'Tutorial Press Banca Técnica Correcta',
        categoria: 'entrenamiento',
        perfil_ig: 'comun',
        fecha_limite: '2025-08-15',
        categoria_publicacion: 'feed',
        personas_contacto: ['contact1', 'contact4'],
        guion: 'Explicar la técnica correcta del press de banca, mostrando errores comunes y la forma correcta de ejecutarlo. Incluir tips de seguridad.',
        enlace_drive: 'https://drive.google.com/folder/example1',
        filmmaker_asignado: 'filmmaker2',
        estado: 'pendiente',
        prioridad: 'alta',
        creado_por: 'marketing@jungla.com',
        creado_en: '2025-08-10T10:00:00Z',
        actualizado_en: '2025-08-10T10:00:00Z',
        metricas_objetivo: {
          alcance_esperado: 5000,
          engagement_esperado: 300
        }
      },
      {
        id: '2',
        titulo: 'Testimonio Cliente - Transformación 6 meses',
        categoria: 'cliente_comunidad',
        perfil_ig: 'centro_especifico',
        centro_especifico: 'Sevilla',
        fecha_limite: '2025-08-12',
        categoria_publicacion: 'feed',
        personas_contacto: ['contact4'],
        guion: 'Entrevista con cliente que ha logrado una transformación increíble en 6 meses. Mostrar antes/después y su historia personal.',
        enlace_drive: 'https://drive.google.com/folder/example2',
        filmmaker_asignado: 'filmmaker1',
        estado: 'en_grabacion',
        prioridad: 'media',
        creado_por: 'marketing@jungla.com',
        creado_en: '2025-08-09T14:30:00Z',
        actualizado_en: '2025-08-10T09:15:00Z'
      },
      {
        id: '3',
        titulo: 'Challenge Viral - 30 Burpees',
        categoria: 'viral',
        perfil_ig: 'comun',
        fecha_limite: '2025-08-14',
        categoria_publicacion: 'historie',
        personas_contacto: ['contact1', 'contact2'],
        guion: 'Challenge viral donde los entrenadores hacen 30 burpees y retan a los seguidores. Música energética y montaje dinámico.',
        enlace_drive: 'https://drive.google.com/folder/example3',
        filmmaker_asignado: 'diego_montilla',
        estado: 'editado',
        prioridad: 'urgente',
        creado_por: 'marketing@jungla.com',
        creado_en: '2025-08-08T16:00:00Z',
        actualizado_en: '2025-08-10T11:30:00Z'
      }
    ];
    
    setPublications(mockPublications);
  };
  // ============ COLA DE PUBLICACIONES ============
  const PublicationQueue: React.FC = () => {
    const filteredPublications = publications.filter(pub => {
      if (filters.estado && pub.estado !== filters.estado) return false;
      if (filters.categoria && pub.categoria !== filters.categoria) return false;
      if (filters.centro && pub.centro_especifico !== filters.centro) return false;
      if (filters.filmmaker && pub.filmmaker_asignado !== filters.filmmaker) return false;
      return true;
    });

    const sortedPublications = filteredPublications.sort((a, b) => 
      new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime()
    );

    const getStatusColor = (estado: string) => {
      switch (estado) {
        case 'pendiente': return '#6b7280';
        case 'en_grabacion': return '#f59e0b';
        case 'grabado': return '#3b82f6';
        case 'editado': return '#8b5cf6';
        case 'programado': return '#10b981';
        case 'publicado': return '#059669';
        default: return '#6b7280';
      }
    };

    const getDaysUntilDeadline = (fecha: string) => {
      const deadline = new Date(fecha);
      const today = new Date();
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    return (
      <div>
        {/* Filtros */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Filter style={{ height: '20px', width: '20px', color: '#6b7280' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Filtros
            </h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <select
              value={filters.estado}
              onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_grabacion">En Grabación</option>
              <option value="grabado">Grabado</option>
              <option value="editado">Editado</option>
              <option value="programado">Programado</option>
              <option value="publicado">Publicado</option>
            </select>

            <select
              value={filters.categoria}
              onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value }))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={filters.filmmaker}
              onChange={(e) => setFilters(prev => ({ ...prev, filmmaker: e.target.value }))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Todos los filmmakers</option>
              {FILMMAKERS.map(filmmaker => (
                <option key={filmmaker.id} value={filmmaker.id}>{filmmaker.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock style={{ height: '16px', width: '16px', color: '#f59e0b' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Pendientes</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              {publications.filter(p => p.estado === 'pendiente').length}
            </span>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle style={{ height: '16px', width: '16px', color: '#ef4444' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Urgentes</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              {publications.filter(p => p.prioridad === 'urgente').length}
            </span>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle style={{ height: '16px', width: '16px', color: '#10b981' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Esta Semana</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              {publications.filter(p => {
                const days = getDaysUntilDeadline(p.fecha_limite);
                return days >= 0 && days <= 7;
              }).length}
            </span>
          </div>
        </div>

        {/* Lista de publicaciones */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Cola de Publicaciones ({sortedPublications.length})
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!currentUser.permissions.canCreate}
              style={{
                padding: '8px 16px',
                backgroundColor: currentUser.permissions.canCreate ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: currentUser.permissions.canCreate ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
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
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Publicación
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Categoría
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Fecha Límite
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Estado
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Filmmaker
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPublications.map((pub, index) => {
                  const daysLeft = getDaysUntilDeadline(pub.fecha_limite);
                  const isUrgent = daysLeft <= 2;
                  const isOverdue = daysLeft < 0;
                  const categoria = CATEGORIAS.find(c => c.value === pub.categoria);
                  const filmmaker = FILMMAKERS.find(f => f.id === pub.filmmaker_asignado);

                  return (
                    <tr 
                      key={pub.id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: isOverdue ? '#fef2f2' : isUrgent ? '#fff7ed' : 'white'
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                              {pub.titulo}
                            </span>
                            {pub.prioridad === 'urgente' && (
                              <Flag style={{ height: '14px', width: '14px', color: '#ef4444' }} />
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {pub.perfil_ig === 'centro_especifico' ? pub.centro_especifico : 'Común'} • {pub.categoria_publicacion}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{categoria?.icon}</span>
                          <span style={{ fontSize: '14px', color: '#374151' }}>
                            {categoria?.label}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div>
                          <span style={{ 
                            fontSize: '14px', 
                            color: isOverdue ? '#dc2626' : isUrgent ? '#ea580c' : '#374151',
                            fontWeight: isOverdue || isUrgent ? '600' : '400'
                          }}>
                            {new Date(pub.fecha_limite).toLocaleDateString('es-ES')}
                          </span>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {isOverdue 
                              ? `${Math.abs(daysLeft)} días de retraso`
                              : daysLeft === 0 
                                ? 'Hoy'
                                : daysLeft === 1
                                  ? 'Mañana'
                                  : `${daysLeft} días`
                            }
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getStatusColor(pub.estado) + '20',
                          color: getStatusColor(pub.estado)
                        }}>
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
                          <span style={{ fontSize: '14px', color: '#374151' }}>
                            {filmmaker?.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedPublication(pub)}
                            style={{
                              padding: '4px',
                              border: 'none',
                              borderRadius: '4px',
                              backgroundColor: 'transparent',
                              cursor: 'pointer'
                            }}
                            title="Ver detalles"
                          >
                            <Eye style={{ height: '16px', width: '16px', color: '#6b7280' }} />
                          </button>
                          <a 
                            href={pub.enlace_drive} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              padding: '4px',
                              border: 'none',
                              borderRadius: '4px',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              textDecoration: 'none'
                            }}
                            title="Ver en Google Drive"
                          >
                            <Link style={{ height: '16px', width: '16px', color: '#3b82f6' }} />
                          </a>
                          {/* Botón de eliminar solo para usuarios con permisos */}
                          {currentUser.permissions.canDelete && (
                            <button
                              onClick={() => {
                                if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
                                  setPublications(prev => prev.filter(p => p.id !== pub.id));
                                }
                              }}
                              style={{
                                padding: '4px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                cursor: 'pointer'
                              }}
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

          {sortedPublications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
              <Video style={{ height: '48px', width: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No hay publicaciones que coincidan con los filtros</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============ VISTA CALENDARIO ============
  const CalendarView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Generar días del mes
    const generateCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Días vacíos al inicio
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Días del mes
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }
      
      return days;
    };

    // Obtener publicaciones para una fecha específica
    const getPublicationsForDate = (day: number) => {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return publications.filter(pub => pub.fecha_limite === dateStr);
    };

    // Obtener color del día según el estado de las publicaciones
    const getDayColor = (day: number) => {
      const dayPublications = getPublicationsForDate(day);
      if (dayPublications.length === 0) return 'transparent';
      
      const hasUrgent = dayPublications.some(p => p.prioridad === 'urgente');
      const hasHigh = dayPublications.some(p => p.prioridad === 'alta');
      const hasPending = dayPublications.some(p => p.estado === 'pendiente');
      
      if (hasUrgent) return '#fee2e2'; // Rojo claro
      if (hasHigh) return '#fed7aa'; // Naranja claro  
      if (hasPending) return '#fef3c7'; // Amarillo claro
      return '#dcfce7'; // Verde claro
    };

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const days = generateCalendarDays();

    return (
      <div>
        {/* Header del calendario */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              📅 Calendario de Publicaciones
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                ←
              </button>
              <h3 style={{ fontSize: '18px', color: '#111827', margin: 0, minWidth: '200px', textAlign: 'center' }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                →
              </button>
            </div>
          </div>

          {/* Leyenda */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#fee2e2', borderRadius: '3px' }}></div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Urgente</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#fed7aa', borderRadius: '3px' }}></div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Alta</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#fef3c7', borderRadius: '3px' }}></div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Pendiente</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#dcfce7', borderRadius: '3px' }}></div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Completado</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '2fr 1fr' : '1fr', gap: '24px' }}>
          {/* Calendario */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            {/* Días de la semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {dayNames.map(dayName => (
                <div key={dayName} style={{
                  textAlign: 'center',
                  padding: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  {dayName}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={index} style={{ height: '80px' }}></div>;
                }

                const dayPublications = getPublicationsForDate(day);
                const isToday = new Date().getDate() === day && 
                               new Date().getMonth() === currentDate.getMonth() && 
                               new Date().getFullYear() === currentDate.getFullYear();

                return (
                  <div
                    key={day}
                    onClick={() => {
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      setSelectedDate(selectedDate === dateStr ? null : dateStr);
                    }}
                    style={{
                      height: '80px',
                      border: `2px solid ${isToday ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      backgroundColor: getDayColor(day),
                      cursor: 'pointer',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      fontSize: '16px',
                      fontWeight: isToday ? '700' : '500',
                      color: isToday ? '#3b82f6' : '#111827'
                    }}>
                      {day}
                    </span>
                    
                    {dayPublications.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {dayPublications.length}
                      </div>
                    )}

                    {dayPublications.slice(0, 2).map((pub, idx) => (
                      <div key={idx} style={{
                        fontSize: '10px',
                        color: '#6b7280',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {pub.titulo.slice(0, 15)}...
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel lateral de detalles */}
          {selectedDate && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {new Date(selectedDate).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  <X style={{ height: '20px', width: '20px' }} />
                </button>
              </div>

              {(() => {
                const dayPublications = publications.filter(pub => pub.fecha_limite === selectedDate);
                
                if (dayPublications.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      <Calendar style={{ height: '48px', width: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                      <p style={{ margin: 0 }}>No hay publicaciones para este día</p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {dayPublications.map(pub => {
                      const categoria = CATEGORIAS.find(c => c.value === pub.categoria);
                      const filmmaker = FILMMAKERS.find(f => f.id === pub.filmmaker_asignado);
                      
                      return (
                        <div key={pub.id} style={{
                          padding: '16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          backgroundColor: '#f9fafb'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '16px' }}>{categoria?.icon}</span>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                              {pub.titulo}
                            </h4>
                          </div>
                          
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                            {categoria?.label} • {pub.categoria_publicacion}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '500',
                              backgroundColor: pub.prioridad === 'urgente' ? '#fee2e2' : 
                                             pub.prioridad === 'alta' ? '#fed7aa' : 
                                             pub.prioridad === 'media' ? '#fef3c7' : '#f3f4f6',
                              color: pub.prioridad === 'urgente' ? '#dc2626' : 
                                     pub.prioridad === 'alta' ? '#ea580c' : 
                                     pub.prioridad === 'media' ? '#d97706' : '#6b7280'
                            }}>
                              {pub.prioridad}
                            </span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '500',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1'
                            }}>
                              {pub.estado.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            👤 {filmmaker?.name}
                          </div>
                          
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => setSelectedPublication(pub)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                              }}
                            >
                              Ver detalles
                            </button>
                            <a 
                              href={pub.enlace_drive} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{
                                padding: '4px 8px',
                                fontSize: '10px',
                                border: '1px solid #3b82f6',
                                borderRadius: '4px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                textDecoration: 'none'
                              }}
                            >
                              Drive
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };
  // ============ MODAL CREAR PUBLICACIÓN ============
  const CreatePublicationModal: React.FC = () => {
    const [formData, setFormData] = useState<Partial<Publication>>({
      titulo: '',
      categoria: 'entrenamiento',
      perfil_ig: 'comun',
      fecha_limite: '',
      categoria_publicacion: 'feed',
      personas_contacto: [],
      guion: '',
      enlace_drive: '',
      filmmaker_asignado: '',
      estado: 'pendiente',
      prioridad: 'media'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newPublication: Publication = {
        ...formData,
        id: Date.now().toString(),
        creado_por: currentUser.email, // Diego Montilla
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      } as Publication;

      setPublications(prev => [...prev, newPublication]);
      setShowCreateModal(false);
      
      // Reset form
      setFormData({
        titulo: '',
        categoria: 'entrenamiento',
        perfil_ig: 'comun',
        fecha_limite: '',
        categoria_publicacion: 'feed',
        personas_contacto: [],
        guion: '',
        enlace_drive: '',
        filmmaker_asignado: '',
        estado: 'pendiente',
        prioridad: 'media'
      });
    };

    if (!showCreateModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Crear Nueva Publicación
            </h3>
            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ height: '24px', width: '24px', color: '#6b7280' }} />
            </button>
          </div>

          <div>
            {/* Título */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Título de la Publicación *
              </label>
              <input
                type="text"
                required
                value={formData.titulo || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Ej: Tutorial Press Banca Técnica Correcta"
              />
            </div>

            {/* Primera fila: Categoría y Perfil IG */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Categoría *
                </label>
                <select
                  value={formData.categoria || 'entrenamiento'}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value as Publication['categoria'] }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Perfil IG *
                </label>
                <select
                  value={formData.perfil_ig || 'comun'}
                  onChange={(e) => setFormData(prev => ({ ...prev, perfil_ig: e.target.value as Publication['perfil_ig'] }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="comun">Común (Todos los centros)</option>
                  <option value="centro_especifico">Centro Específico</option>
                </select>
              </div>
            </div>

            {/* Centro específico si es necesario */}
            {formData.perfil_ig === 'centro_especifico' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Centro Específico *
                </label>
                <select
                  value={formData.centro_especifico || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, centro_especifico: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Seleccionar centro...</option>
                  {CENTROS_DISPONIBLES.map((centro: string) => (
                    <option key={centro} value={centro}>{centro}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Segunda fila: Fecha límite y Categoría publicación */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Fecha Límite de Publicación *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_limite || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_limite: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Categoría Publicación *
                </label>
                <select
                  value={formData.categoria_publicacion || 'feed'}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria_publicacion: e.target.value as Publication['categoria_publicacion'] }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="feed">Feed</option>
                  <option value="historie">Historie</option>
                </select>
              </div>
            </div>

            {/* Personas de contacto */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Personas de Contacto para Grabar *
              </label>
              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '12px',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {CONTACT_PERSONS.map(person => (
                  <label key={person.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.personas_contacto?.includes(person.id) || false}
                      onChange={(e) => {
                        const currentContacts = formData.personas_contacto || [];
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            personas_contacto: [...currentContacts, person.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            personas_contacto: currentContacts.filter(id => id !== person.id)
                          }));
                        }
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      {person.name} ({person.role} - {person.centro})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Guión */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Guión de la Publicación *
              </label>
              <textarea
                required
                value={formData.guion || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, guion: e.target.value }))}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
                placeholder="Describe detalladamente el contenido, mensaje y estilo de la publicación..."
              />
            </div>

            {/* Tercera fila: Drive y Filmmaker */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Enlace a Google Drive *
                </label>
                <input
                  type="url"
                  required
                  value={formData.enlace_drive || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, enlace_drive: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://drive.google.com/folder/..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Filmmaker Asignado *
                </label>
                <select
                  required
                  value={formData.filmmaker_asignado || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, filmmaker_asignado: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Seleccionar filmmaker...</option>
                  {FILMMAKERS.map(filmmaker => (
                    <option key={filmmaker.id} value={filmmaker.id}>
                      {filmmaker.name} ({filmmaker.especialidad})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cuarta fila: Prioridad */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Prioridad
              </label>
              <select
                value={formData.prioridad || 'media'}
                onChange={(e) => setFormData(prev => ({ ...prev, prioridad: e.target.value as Publication['prioridad'] }))}
                style={{
                  width: '200px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🟠 Alta</option>
                <option value="urgente">🔴 Urgente</option>
              </select>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save style={{ height: '16px', width: '16px' }} />
                Crear Publicación
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============ MODAL DETALLE PUBLICACIÓN ============
  const PublicationDetailModal: React.FC = () => {
    if (!selectedPublication) return null;

    const categoria = CATEGORIAS.find(c => c.value === selectedPublication.categoria);
    const filmmaker = FILMMAKERS.find(f => f.id === selectedPublication.filmmaker_asignado);
    const contacts = selectedPublication.personas_contacto.map(id => 
      CONTACT_PERSONS.find(p => p.id === id)
    ).filter(Boolean);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Detalle de Publicación
            </h3>
            <button onClick={() => setSelectedPublication(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ height: '24px', width: '24px', color: '#6b7280' }} />
            </button>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Título y categoría */}
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                {selectedPublication.titulo}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{categoria?.icon}</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{categoria?.label}</span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>•</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {selectedPublication.categoria_publicacion === 'feed' ? '📱 Feed' : '📸 Historie'}
                </span>
              </div>
            </div>

            {/* Detalles básicos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Fecha Límite
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>
                  {new Date(selectedPublication.fecha_limite).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Perfil IG
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>
                  {selectedPublication.perfil_ig === 'comun' ? 'Común' : selectedPublication.centro_especifico}
                </p>
              </div>
            </div>

            {/* Filmmaker */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Filmmaker Asignado
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(filmmaker?.name || '')}&background=059669&color=fff`}
                  alt={filmmaker?.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                    {filmmaker?.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {filmmaker?.especialidad}
                  </p>
                </div>
              </div>
            </div>

            {/* Personas de contacto */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Personas de Contacto
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {contacts.map(contact => (
                  <div key={contact?.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <User style={{ height: '16px', width: '16px', color: '#6b7280' }} />
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      {contact?.name} ({contact?.role} - {contact?.centro})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guión */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Guión
              </label>
              <div style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                  {selectedPublication.guion}
                </p>
              </div>
            </div>

            {/* Enlaces */}
            <div>
              <a 
                href={selectedPublication.enlace_drive} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                <Link style={{ height: '16px', width: '16px' }} />
                Ver en Google Drive
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============ RENDERIZADO PRINCIPAL ============
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px' }}>
      {/* Header con información del usuario */}
      <div style={{
        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>
              📱 Sistema de Publicaciones Marketing
            </h1>
            <p style={{ opacity: 0.9, margin: 0 }}>
              Gestión completa de contenido para redes sociales - La Jungla Ibérica
            </p>
          </div>
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            padding: '12px 16px', 
            borderRadius: '8px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Conectado como:</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>Diego Montilla</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Marketing Manager</div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        {[
          { id: 'queue', label: 'Cola de Publicaciones', icon: Video },
          { id: 'create', label: 'Crear Publicación', icon: Plus },
          { id: 'calendar', label: 'Calendario', icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <tab.icon style={{ height: '16px', width: '16px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === 'queue' && <PublicationQueue />}
      {activeTab === 'create' && (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
          <Plus style={{ height: '48px', width: '48px', margin: '0 auto 16px', color: '#6b7280' }} />
          <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '8px' }}>Crear Nueva Publicación</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Usa el botón "Nueva Publicación" en la cola para crear contenido</p>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!currentUser.permissions.canCreate}
            style={{
              padding: '12px 24px',
              backgroundColor: currentUser.permissions.canCreate ? '#10b981' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: currentUser.permissions.canCreate ? 'pointer' : 'not-allowed'
            }}
          >
            {currentUser.permissions.canCreate ? 'Crear Publicación' : 'Sin permisos para crear'}
          </button>
        </div>
      )}
      {activeTab === 'calendar' && <CalendarView />}

      {/* Modales */}
      <CreatePublicationModal />
      <PublicationDetailModal />
    </div>
  );
};

export default MarketingPublicationSystem;