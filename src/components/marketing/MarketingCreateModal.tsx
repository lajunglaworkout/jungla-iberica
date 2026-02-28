import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import {
  Publication, CATEGORIAS, CENTROS_DISPONIBLES, FILMMAKERS, CONTACT_PERSONS
} from './MarketingConfig';

interface Props {
  isOpen: boolean;
  currentUserEmail: string;
  onClose: () => void;
  onCreated: (pub: Publication) => void;
}

const EMPTY_FORM: Partial<Publication> = {
  titulo: '', categoria: 'entrenamiento', perfil_ig: 'comun',
  fecha_limite: '', categoria_publicacion: 'feed',
  personas_contacto: [], guion: '', enlace_drive: '',
  filmmaker_asignado: '', estado: 'pendiente', prioridad: 'media'
};

const MarketingCreateModal: React.FC<Props> = ({ isOpen, currentUserEmail, onClose, onCreated }) => {
  const [formData, setFormData] = useState<Partial<Publication>>(EMPTY_FORM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPublication: Publication = {
      ...formData,
      id: Date.now().toString(),
      creado_por: currentUserEmail,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    } as Publication;
    onCreated(newPublication);
    setFormData(EMPTY_FORM);
  };

  if (!isOpen) return null;

  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Crear Nueva Publicación</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ height: '24px', width: '24px', color: '#6b7280' }} />
          </button>
        </div>

        <div>
          {/* Título */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Título de la Publicación *</label>
            <input type="text" required value={formData.titulo || ''} onChange={(e) => setFormData(p => ({ ...p, titulo: e.target.value }))}
              style={inputStyle} placeholder="Ej: Tutorial Press Banca Técnica Correcta" />
          </div>

          {/* Categoría y Perfil IG */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Categoría *</label>
              <select value={formData.categoria || 'entrenamiento'} onChange={(e) => setFormData(p => ({ ...p, categoria: e.target.value as Publication['categoria'] }))} style={inputStyle}>
                {CATEGORIAS.map(cat => <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Perfil IG *</label>
              <select value={formData.perfil_ig || 'comun'} onChange={(e) => setFormData(p => ({ ...p, perfil_ig: e.target.value as Publication['perfil_ig'] }))} style={inputStyle}>
                <option value="comun">Común (Todos los centros)</option>
                <option value="centro_especifico">Centro Específico</option>
              </select>
            </div>
          </div>

          {/* Centro específico */}
          {formData.perfil_ig === 'centro_especifico' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Centro Específico *</label>
              <select value={formData.centro_especifico || ''} onChange={(e) => setFormData(p => ({ ...p, centro_especifico: e.target.value }))} style={inputStyle}>
                <option value="">Seleccionar centro...</option>
                {CENTROS_DISPONIBLES.map((centro: string) => <option key={centro} value={centro}>{centro}</option>)}
              </select>
            </div>
          )}

          {/* Fecha límite y categoría publicación */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Fecha Límite de Publicación *</label>
              <input type="date" required value={formData.fecha_limite || ''}
                onChange={(e) => setFormData(p => ({ ...p, fecha_limite: e.target.value }))}
                style={inputStyle} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label style={labelStyle}>Categoría Publicación *</label>
              <select value={formData.categoria_publicacion || 'feed'} onChange={(e) => setFormData(p => ({ ...p, categoria_publicacion: e.target.value as Publication['categoria_publicacion'] }))} style={inputStyle}>
                <option value="feed">Feed</option>
                <option value="historie">Historie</option>
              </select>
            </div>
          </div>

          {/* Personas de contacto */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Personas de Contacto para Grabar *</label>
            <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', maxHeight: '120px', overflowY: 'auto' }}>
              {CONTACT_PERSONS.map(person => (
                <label key={person.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.personas_contacto?.includes(person.id) || false}
                    onChange={(e) => {
                      const current = formData.personas_contacto || [];
                      setFormData(p => ({
                        ...p,
                        personas_contacto: e.target.checked ? [...current, person.id] : current.filter(id => id !== person.id)
                      }));
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{person.name} ({person.role} - {person.centro})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Guión */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Guión de la Publicación *</label>
            <textarea required value={formData.guion || ''} onChange={(e) => setFormData(p => ({ ...p, guion: e.target.value }))}
              rows={4} style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Describe detalladamente el contenido, mensaje y estilo de la publicación..." />
          </div>

          {/* Drive y Filmmaker */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Enlace a Google Drive *</label>
              <input type="url" required value={formData.enlace_drive || ''} onChange={(e) => setFormData(p => ({ ...p, enlace_drive: e.target.value }))}
                style={inputStyle} placeholder="https://drive.google.com/folder/..." />
            </div>
            <div>
              <label style={labelStyle}>Filmmaker Asignado *</label>
              <select required value={formData.filmmaker_asignado || ''} onChange={(e) => setFormData(p => ({ ...p, filmmaker_asignado: e.target.value }))} style={inputStyle}>
                <option value="">Seleccionar filmmaker...</option>
                {FILMMAKERS.map(f => <option key={f.id} value={f.id}>{f.name} ({f.especialidad})</option>)}
              </select>
            </div>
          </div>

          {/* Prioridad */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Prioridad</label>
            <select value={formData.prioridad || 'media'} onChange={(e) => setFormData(p => ({ ...p, prioridad: e.target.value as Publication['prioridad'] }))}
              style={{ width: '200px', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}>
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🟠 Alta</option>
              <option value="urgente">🔴 Urgente</option>
            </select>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '12px 24px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontSize: '14px' }}>
              Cancelar
            </button>
            <button onClick={handleSubmit}
              style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save style={{ height: '16px', width: '16px' }} />
              Crear Publicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingCreateModal;
