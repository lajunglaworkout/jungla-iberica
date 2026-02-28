import React from 'react';
import { X, Link, User } from 'lucide-react';
import { Publication, CATEGORIAS, FILMMAKERS, CONTACT_PERSONS } from './MarketingConfig';

interface Props {
  publication: Publication | null;
  onClose: () => void;
}

const MarketingDetailModal: React.FC<Props> = ({ publication, onClose }) => {
  if (!publication) return null;

  const categoria = CATEGORIAS.find(c => c.value === publication.categoria);
  const filmmaker = FILMMAKERS.find(f => f.id === publication.filmmaker_asignado);
  const contacts = publication.personas_contacto.map(id => CONTACT_PERSONS.find(p => p.id === id)).filter(Boolean);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Detalle de Publicación</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ height: '24px', width: '24px', color: '#6b7280' }} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Título y categoría */}
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{publication.titulo}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>{categoria?.icon}</span>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>{categoria?.label}</span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>•</span>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {publication.categoria_publicacion === 'feed' ? '📱 Feed' : '📸 Historie'}
              </span>
            </div>
          </div>

          {/* Detalles básicos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Fecha Límite</label>
              <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>
                {new Date(publication.fecha_limite).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Perfil IG</label>
              <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>
                {publication.perfil_ig === 'comun' ? 'Común' : publication.centro_especifico}
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
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>{filmmaker?.name}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{filmmaker?.especialidad}</p>
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
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.5' }}>{publication.guion}</p>
            </div>
          </div>

          {/* Enlace Drive */}
          <div>
            <a href={publication.enlace_drive} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}>
              <Link style={{ height: '16px', width: '16px' }} />
              Ver en Google Drive
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDetailModal;
