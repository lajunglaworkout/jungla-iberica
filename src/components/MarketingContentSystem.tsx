import React, { useState, useEffect } from 'react';
import {
  Video, Image, Play, Calendar,
  Users, Plus, Save, X, Link,
  BarChart3, Target, Shield, LayoutDashboard
} from 'lucide-react';
import MarketingAnalyticsDashboard from './marketing/MarketingAnalyticsDashboard';
import StrategyHub from './marketing/StrategyHub';
import CompetitorWatch from './marketing/CompetitorWatch';

// ============ INTERFACES ============
interface ContentItem {
  id?: string;
  titulo: string;
  tipo_contenido: 'video' | 'carrusel' | 'reel';
  categoria: 'clientes' | 'educativo' | 'humor' | 'viral' | 'postureo';
  alcance: 'comun' | 'centro_especifico';
  centro_especifico?: string;
  enlace_drive: string;
  estado_grabacion: 'pendiente' | 'grabado' | 'editado';
  estado_publicacion: 'pendiente' | 'programado' | 'publicado';
  fecha_limite: string;
  creado_por: string;
  asignado_grabacion: string;
  asignado_publicacion: string;
}

interface MarketingSystemProps {
  userEmail?: string;
  userName?: string;
  onBack?: () => void;
}

interface ContentTypeConfig {
  value: 'video' | 'carrusel' | 'reel';
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  color: string;
}

interface CategoryConfig {
  value: 'clientes' | 'educativo' | 'humor' | 'viral' | 'postureo';
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  color: string;
  description: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

// ============ CONFIGURACIONES ============
const CONTENT_TYPES: ContentTypeConfig[] = [
  { value: 'video', label: 'Video', icon: Video, color: '#dc2626' },
  { value: 'carrusel', label: 'Carrusel', icon: Image, color: '#059669' },
  { value: 'reel', label: 'Reel', icon: Play, color: '#7c3aed' }
];

const CATEGORIES: CategoryConfig[] = [
  { value: 'clientes', label: 'Clientes', icon: Users, color: '#2563eb', description: 'Testimonios y casos de éxito' },
  { value: 'educativo', label: 'Educativo', icon: LayoutDashboard, color: '#059669', description: 'Tips y consejos de fitness' }, // Changed icon to avoid duplicate Users
  { value: 'humor', label: 'Humor', icon: Target, color: '#dc2626', description: 'Contenido divertido y entretenido' }, // Changed icon
  { value: 'viral', label: 'Viral', icon: BarChart3, color: '#7c3aed', description: 'Tendencias y challenges' }, // Changed icon
  { value: 'postureo', label: 'Postureo', icon: Image, color: '#ea580c', description: 'Instalaciones y equipo' } // Changed icon
];

const CENTROS_DISPONIBLES = [
  'Sevilla',
  'Jerez',
  'Puerto'
];

const MARKETING_TEAM: TeamMember[] = [
  { id: 'marketing1@jungla.com', name: 'María García', role: 'Content Creator' },
  { id: 'marketing2@jungla.com', name: 'Luis Rodríguez', role: 'Video Producer' },
  { id: 'marketing3@jungla.com', name: 'Ana Martín', role: 'Community Manager' }
];

// ============ COMPONENTE PRINCIPAL ============
const MarketingContentSystem: React.FC<MarketingSystemProps> = ({ userEmail, userName, onBack }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'strategy' | 'competitors' | 'content' | 'calendar'>('dashboard');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadContentItems();
  }, [selectedMonth]);

  const loadContentItems = async () => {
    setLoading(true);
    try {
      // Simular datos para demo
      await new Promise(resolve => setTimeout(resolve, 500));

      setContentItems([
        {
          id: '1',
          titulo: 'Testimonial Cliente Transformación',
          tipo_contenido: 'video',
          categoria: 'clientes',
          alcance: 'comun',
          enlace_drive: 'https://drive.google.com/example1',
          estado_grabacion: 'grabado',
          estado_publicacion: 'pendiente',
          fecha_limite: `${selectedMonth}-15`,
          creado_por: 'marketing@jungla.com',
          asignado_grabacion: 'marketing1@jungla.com',
          asignado_publicacion: 'diego@jungla.com'
        },
        {
          id: '2',
          titulo: 'Tutorial Press Banca Técnica',
          tipo_contenido: 'reel',
          categoria: 'educativo',
          alcance: 'comun',
          enlace_drive: 'https://drive.google.com/example2',
          estado_grabacion: 'editado',
          estado_publicacion: 'programado',
          fecha_limite: `${selectedMonth}-20`,
          creado_por: 'marketing@jungla.com',
          asignado_grabacion: 'marketing2@jungla.com',
          asignado_publicacion: 'diego@jungla.com'
        }
      ]);
    } catch (error) {
      console.error('Error loading content:', error);
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ VISTA DE CONTENIDOS ============
  const ContentView: React.FC = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Gestión de Contenidos ({contentItems.length})
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus style={{ height: '16px', width: '16px' }} />
          Nuevo Contenido
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#6b7280' }}>Cargando contenidos...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {contentItems.map(item => (
            <div key={item.id} style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Icono del tipo de contenido */}
                  {(() => {
                    const contentType = CONTENT_TYPES.find(type => type.value === item.tipo_contenido);
                    if (contentType) {
                      const IconComponent = contentType.icon;
                      return (
                        <div style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: `${contentType.color}20`
                        }}>
                          <IconComponent style={{ height: '20px', width: '20px', color: contentType.color }} />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      {item.titulo}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      {(() => {
                        const category = CATEGORIES.find(cat => cat.value === item.categoria);
                        return category ? (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: `${category.color}20`,
                            color: category.color
                          }}>
                            {category.label}
                          </span>
                        ) : null;
                      })()}
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {item.alcance === 'comun' ? 'Común' : `Centro: ${item.centro_especifico}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estados */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Grabación</div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: item.estado_grabacion === 'editado' ? '#10b98120' :
                        item.estado_grabacion === 'grabado' ? '#f59e0b20' : '#ef444420',
                      color: item.estado_grabacion === 'editado' ? '#10b981' :
                        item.estado_grabacion === 'grabado' ? '#f59e0b' : '#ef4444'
                    }}>
                      {item.estado_grabacion}
                    </span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Publicación</div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: item.estado_publicacion === 'publicado' ? '#10b98120' :
                        item.estado_publicacion === 'programado' ? '#3b82f620' : '#6b728020',
                      color: item.estado_publicacion === 'publicado' ? '#10b981' :
                        item.estado_publicacion === 'programado' ? '#3b82f6' : '#6b7280'
                    }}>
                      {item.estado_publicacion}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px' }}>
                <div>
                  <span style={{ fontWeight: '500', color: '#6b7280' }}>Fecha límite:</span>
                  <span style={{ marginLeft: '8px', color: '#111827' }}>
                    {new Date(item.fecha_limite).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div>
                  <a
                    href={item.enlace_drive}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#3b82f6',
                      textDecoration: 'none'
                    }}
                  >
                    <Link style={{ height: '14px', width: '14px' }} />
                    Ver en Drive
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============ MODAL CREAR CONTENIDO ============
  const CreateContentModal: React.FC = () => {
    const [formData, setFormData] = useState<Partial<ContentItem>>({
      titulo: '',
      tipo_contenido: 'video',
      categoria: 'educativo',
      alcance: 'comun',
      enlace_drive: '',
      estado_grabacion: 'pendiente',
      estado_publicacion: 'pendiente',
      fecha_limite: '',
      asignado_grabacion: '',
      asignado_publicacion: 'diego@jungla.com'
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const newContent: ContentItem = {
          ...formData,
          id: Date.now().toString(),
          creado_por: 'marketing@jungla.com',
        } as ContentItem;

        setContentItems(prev => [...prev, newContent]);
        setShowCreateModal(false);
        alert('¡Contenido creado exitosamente!');
      } catch (error) {
        console.error('Error creating content:', error);
        alert('Error al crear el contenido');
      }
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
        zIndex: 10000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Crear Nuevo Contenido
            </h3>
            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ height: '24px', width: '24px', color: '#6b7280' }} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Título del Contenido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ej: Tutorial ejercicio press banca"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Tipo de Contenido *
                </label>
                <select
                  value={formData.tipo_contenido || 'video'}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo_contenido: e.target.value as ContentItem['tipo_contenido'] }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  {CONTENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Categoría *
                </label>
                <select
                  value={formData.categoria || 'educativo'}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value as ContentItem['categoria'] }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  {CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Alcance *
                </label>
                <select
                  value={formData.alcance || 'comun'}
                  onChange={(e) => setFormData(prev => ({ ...prev, alcance: e.target.value as ContentItem['alcance'] }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="comun">Común (todos los centros)</option>
                  <option value="centro_especifico">Centro específico</option>
                </select>
              </div>
            </div>

            {formData.alcance === 'centro_especifico' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Centro Específico
                </label>
                <select
                  value={formData.centro_especifico || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, centro_especifico: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Fecha Límite *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_limite || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_limite: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Asignado a Grabación
                </label>
                <select
                  value={formData.asignado_grabacion || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, asignado_grabacion: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {MARKETING_TEAM.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
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
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
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
                Crear Contenido
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ============ RENDERIZADO PRINCIPAL ============
  return (
    <div className="w-full">
      <div style={{
        width: '100%',
        backgroundColor: '#f9fafb',
        borderRadius: '16px',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: 'white',
          marginBottom: '32px',
          position: 'relative'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>
              📱 Smart Marketing
            </h1>
            <p style={{ opacity: 0.9, margin: 0 }}>
              Inteligencia Artificial y Análisis de Datos para tu crecimiento
            </p>
          </div>
        </div>

        {/* Navigation tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflowX: 'auto'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'strategy', label: 'Estrategia IA', icon: Target },
            { id: 'competitors', label: 'Competencia', icon: Shield },
            { id: 'content', label: 'Gestión Contenidos', icon: Video },
            { id: 'calendar', label: 'Calendario', icon: Calendar }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as any)}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: currentView === tab.id ? '#3b82f6' : 'transparent',
                color: currentView === tab.id ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon style={{ height: '16px', width: '16px' }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          minHeight: '500px'
        }}>
          {currentView === 'dashboard' && <MarketingAnalyticsDashboard />}
          {currentView === 'strategy' && <StrategyHub />}
          {currentView === 'competitors' && <CompetitorWatch />}
          {currentView === 'content' && <ContentView />}
          {currentView === 'calendar' && (
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px' }}>
              <Calendar style={{ height: '48px', width: '48px', margin: '0 auto 16px', color: '#6b7280' }} />
              <h3 style={{ color: '#111827', marginBottom: '8px' }}>Vista de Calendario</h3>
              <p style={{ color: '#6b7280' }}>Próximamente - Calendario de publicaciones</p>
            </div>
          )}
        </div>

        {/* Modal crear contenido */}
        <CreateContentModal />
      </div>
    </div>
  );
};

export default MarketingContentSystem;