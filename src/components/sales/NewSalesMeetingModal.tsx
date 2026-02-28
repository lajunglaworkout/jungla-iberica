import React, { useState, useEffect } from 'react';
import { leadService } from '../../services/leadService';
import { X, Video, Users, Calendar } from 'lucide-react';

interface NewSalesMeetingModalProps {
  onClose: () => void;
  onStartMeeting: (leadId: string, leadName: string) => void;
}

interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  proyecto_nombre?: string;
}

const NewSalesMeetingModal: React.FC<NewSalesMeetingModalProps> = ({ onClose, onStartMeeting }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarLeads();
  }, []);

  const cargarLeads = async () => {
    try {
      const data = await leadService.getLeadsForMeeting();

      console.log('✅ Leads cargados para reunion:', data);
      setLeads(data || []);
    } catch (error) {
      console.error('❌ Error cargando leads:', error);
      setError('Error al cargar los leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMeeting = () => {
    if (!selectedLeadId) {
      setError('Por favor selecciona un lead');
      return;
    }

    const selectedLead = leads.find(l => l.id === selectedLeadId);
    if (selectedLead) {
      onStartMeeting(selectedLeadId, selectedLead.nombre);
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
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Video style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
            Nueva Reunión de Ventas
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Cargando leads...
          </div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <Users style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
            <p>No hay leads disponibles</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              Crea un lead primero antes de iniciar una reunión
            </p>
          </div>
        ) : (
          <div>
            {/* Selector de Lead */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Seleccionar Lead *
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  setSelectedLeadId(e.target.value);
                  setError(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Selecciona un lead --</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.nombre} {lead.empresa ? `(${lead.empresa})` : ''} - {lead.proyecto_nombre || 'Sin proyecto'}
                  </option>
                ))}
              </select>
            </div>

            {/* Información del Lead Seleccionado */}
            {selectedLeadId && (
              <div style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                marginBottom: '24px'
              }}>
                {(() => {
                  const lead = leads.find(l => l.id === selectedLeadId);
                  return (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', margin: '0 0 8px 0' }}>
                        📋 Información del Lead
                      </h4>
                      <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.6' }}>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Nombre:</strong> {lead?.nombre}
                        </p>
                        {lead?.email && (
                          <p style={{ margin: '4px 0' }}>
                            <strong>Email:</strong> {lead.email}
                          </p>
                        )}
                        {lead?.telefono && (
                          <p style={{ margin: '4px 0' }}>
                            <strong>Teléfono:</strong> {lead.telefono}
                          </p>
                        )}
                        {lead?.proyecto_nombre && (
                          <p style={{ margin: '4px 0' }}>
                            <strong>Proyecto:</strong> {lead.proyecto_nombre}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleStartMeeting}
                disabled={!selectedLeadId}
                style={{
                  padding: '12px 24px',
                  backgroundColor: selectedLeadId ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: selectedLeadId ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Calendar style={{ width: '16px', height: '16px' }} />
                Iniciar Reunión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewSalesMeetingModal;
