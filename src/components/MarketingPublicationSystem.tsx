import React, { useState, useEffect } from 'react';
import { Video, Calendar, Plus } from 'lucide-react';
import { Publication } from './marketing/MarketingConfig';
import MarketingPublicationQueue, { QueueFilters } from './marketing/MarketingPublicationQueue';
import MarketingCalendarView from './marketing/MarketingCalendarView';
import MarketingCreateModal from './marketing/MarketingCreateModal';
import MarketingDetailModal from './marketing/MarketingDetailModal';

const MOCK_PUBLICATIONS: Publication[] = [
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
    metricas_objetivo: { alcance_esperado: 5000, engagement_esperado: 300 }
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

const MarketingPublicationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'create' | 'calendar'>('queue');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [filters, setFilters] = useState<QueueFilters>({ estado: '', categoria: '', centro: '', filmmaker: '' });

  const currentUser = {
    email: 'lajunglaworkoutmk@gmail.com',
    role: 'marketing_manager',
    permissions: { canCreate: true, canEdit: false, canDelete: false, canView: true }
  };

  useEffect(() => {
    setPublications(MOCK_PUBLICATIONS);
  }, []);

  const TABS = [
    { id: 'queue', label: 'Cola de Publicaciones', icon: Video },
    { id: 'create', label: 'Crear Publicación', icon: Plus },
    { id: 'calendar', label: 'Calendario', icon: Calendar }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
        borderRadius: '16px', padding: '24px', color: 'white', marginBottom: '32px'
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
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '12px 16px', borderRadius: '8px', textAlign: 'right' }}>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Conectado como:</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>Diego Montilla</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Marketing Manager</div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontSize: '14px', fontWeight: '500'
            }}
          >
            <tab.icon style={{ height: '16px', width: '16px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === 'queue' && (
        <MarketingPublicationQueue
          publications={publications}
          filters={filters}
          canCreate={currentUser.permissions.canCreate}
          canDelete={currentUser.permissions.canDelete}
          onFiltersChange={setFilters}
          onNewPublication={() => setShowCreateModal(true)}
          onViewPublication={setSelectedPublication}
          onDelete={(id) => setPublications(prev => prev.filter(p => p.id !== id))}
        />
      )}
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
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
              cursor: currentUser.permissions.canCreate ? 'pointer' : 'not-allowed'
            }}
          >
            {currentUser.permissions.canCreate ? 'Crear Publicación' : 'Sin permisos para crear'}
          </button>
        </div>
      )}
      {activeTab === 'calendar' && (
        <MarketingCalendarView
          publications={publications}
          onViewPublication={setSelectedPublication}
        />
      )}

      {/* Modales */}
      <MarketingCreateModal
        isOpen={showCreateModal}
        currentUserEmail={currentUser.email}
        onClose={() => setShowCreateModal(false)}
        onCreated={(pub) => {
          setPublications(prev => [...prev, pub]);
          setShowCreateModal(false);
        }}
      />
      <MarketingDetailModal
        publication={selectedPublication}
        onClose={() => setSelectedPublication(null)}
      />
    </div>
  );
};

export default MarketingPublicationSystem;
