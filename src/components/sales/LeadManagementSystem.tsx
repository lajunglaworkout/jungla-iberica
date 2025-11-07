import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, Plus, Search, Filter, Phone, Mail, Calendar, MessageSquare,
  FileText, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle,
  Edit, Trash2, Eye, Send, Download, Upload, MoreVertical, Video
} from 'lucide-react';
import NewLeadModal from './NewLeadModal';
import NewSalesMeetingModal from './NewSalesMeetingModal';

interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  cargo?: string;
  proyecto_nombre: string;
  valoracion_proyecto: number;
  porcentaje_interes: number;
  estado: string;
  prioridad: string;
  probabilidad_cierre: number;
  fecha_primer_contacto?: string;
  fecha_ultimo_contacto?: string;
  proxima_accion?: string;
  fecha_proxima_accion?: string;
  asignado_a?: string;
  notas?: string;
  created_at: string;
}

interface Interaction {
  id: string;
  lead_id: string;
  tipo: string;
  direccion?: string;
  asunto?: string;
  contenido?: string;
  respondido: boolean;
  fecha: string;
  duracion_minutos?: number;
  resultado?: string;
  proximos_pasos?: string;
  created_by?: string;
}

const LeadManagementSystem: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Estados del pipeline
  const estados = [
    { id: 'prospecto', nombre: 'Prospecto', color: '#94a3b8', icon: Users },
    { id: 'contactado', nombre: 'Contactado', color: '#3b82f6', icon: Phone },
    { id: 'reunion', nombre: 'Reunión', color: '#8b5cf6', icon: Calendar },
    { id: 'propuesta', nombre: 'Propuesta', color: '#f59e0b', icon: FileText },
    { id: 'negociacion', nombre: 'Negociación', color: '#10b981', icon: TrendingUp },
    { id: 'cerrado', nombre: 'Cerrado', color: '#059669', icon: CheckCircle },
    { id: 'perdido', nombre: 'Perdido', color: '#ef4444', icon: XCircle }
  ];

  // Cargar leads
  useEffect(() => {
    cargarLeads();
  }, [filtroEstado]);

  const cargarLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtroEstado !== 'todos') {
        query = query.eq('estado', filtroEstado);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error cargando leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar interacciones de un lead
  const cargarInteracciones = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('lead_id', leadId)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setInteractions(data || []);
    } catch (error) {
      console.error('Error cargando interacciones:', error);
    }
  };

  // Seleccionar lead y cargar su timeline
  const seleccionarLead = (lead: Lead) => {
    setSelectedLead(lead);
    cargarInteracciones(lead.id);
  };

  // Filtrar leads por búsqueda
  const leadsFiltrados = leads.filter(lead =>
    lead.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    lead.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    lead.proyecto_nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Contar leads por estado
  const contarPorEstado = (estado: string) => {
    return leads.filter(l => l.estado === estado).length;
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          🎯 Gestión de Leads
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Seguimiento completo de inversores y oportunidades de venta
        </p>
      </div>

      {/* Pipeline Visual */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '12px',
        marginBottom: '32px'
      }}>
        {estados.map(estado => {
          const Icon = estado.icon;
          const count = contarPorEstado(estado.id);
          return (
            <div
              key={estado.id}
              onClick={() => setFiltroEstado(estado.id)}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                borderLeft: `4px solid ${estado.color}`,
                transition: 'transform 0.2s',
                opacity: filtroEstado === 'todos' || filtroEstado === estado.id ? 1 : 0.5
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Icon style={{ width: '20px', height: '20px', color: estado.color }} />
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: estado.color }}>
                  {count}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{estado.nombre}</p>
            </div>
          );
        })}
      </div>

      {/* Barra de acciones */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o proyecto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px'
            }}
          />
        </div>
        
        <button
          onClick={() => setShowNewLeadModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          Nuevo Lead
        </button>

        <button
          onClick={() => setShowNewMeetingModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          <Video style={{ width: '20px', height: '20px' }} />
          Nueva Reunión
        </button>

        {filtroEstado !== 'todos' && (
          <button
            onClick={() => setFiltroEstado('todos')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Ver Todos
          </button>
        )}
      </div>

      {/* Layout principal: Lista + Detalle */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 1.5fr' : '1fr', gap: '24px' }}>
        {/* Lista de Leads */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
            Leads ({leadsFiltrados.length})
          </h2>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Cargando...</p>
          ) : leadsFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <Users style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
              <p>No hay leads</p>
              <button
                onClick={() => setShowNewLeadModal(true)}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Crear primer lead
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leadsFiltrados.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => seleccionarLead(lead)}
                  style={{
                    padding: '16px',
                    backgroundColor: selectedLead?.id === lead.id ? '#eff6ff' : '#f8fafc',
                    borderRadius: '8px',
                    border: selectedLead?.id === lead.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {lead.nombre}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                        {lead.proyecto_nombre}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: estados.find(e => e.id === lead.estado)?.color + '20',
                      color: estados.find(e => e.id === lead.estado)?.color,
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {estados.find(e => e.id === lead.estado)?.nombre}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                    <span>💰 €{lead.valoracion_proyecto?.toLocaleString()}</span>
                    <span>📊 {lead.porcentaje_interes}% interés</span>
                    <span>🎯 {lead.probabilidad_cierre}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Detalle del Lead */}
        {selectedLead && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {selectedLead.nombre}
                </h2>
                <p style={{ color: '#6b7280', marginTop: '4px' }}>{selectedLead.empresa || 'Sin empresa'}</p>
              </div>
              <button
                onClick={() => setShowInteractionModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Registrar Interacción
              </button>
            </div>

            {/* Info del Lead */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '16px',
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Email</p>
                <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500', margin: '4px 0 0 0' }}>
                  {selectedLead.email || '-'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Teléfono</p>
                <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500', margin: '4px 0 0 0' }}>
                  {selectedLead.telefono || '-'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Proyecto</p>
                <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500', margin: '4px 0 0 0' }}>
                  {selectedLead.proyecto_nombre}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Valoración</p>
                <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500', margin: '4px 0 0 0' }}>
                  €{selectedLead.valoracion_proyecto?.toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>% Interés</p>
                <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500', margin: '4px 0 0 0' }}>
                  {selectedLead.porcentaje_interes}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Probabilidad Cierre</p>
                <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500', margin: '4px 0 0 0' }}>
                  {selectedLead.probabilidad_cierre}%
                </p>
              </div>
            </div>

            {/* Timeline de Interacciones */}
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
              📋 Timeline de Interacciones
            </h3>

            {interactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <MessageSquare style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                <p>No hay interacciones registradas</p>
                <button
                  onClick={() => setShowInteractionModal(true)}
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Registrar primera interacción
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {interactions.map(interaction => {
                  const iconMap: any = {
                    email: Mail,
                    llamada: Phone,
                    reunion: Calendar,
                    whatsapp: MessageSquare,
                    nota: FileText
                  };
                  const Icon = iconMap[interaction.tipo] || MessageSquare;

                  return (
                    <div
                      key={interaction.id}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        borderLeft: '4px solid #3b82f6'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                        <Icon style={{ width: '20px', height: '20px', color: '#3b82f6', marginTop: '2px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
                              {interaction.tipo}
                              {interaction.direccion && ` - ${interaction.direccion}`}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {new Date(interaction.fecha).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {interaction.asunto && (
                            <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', margin: '4px 0' }}>
                              {interaction.asunto}
                            </p>
                          )}
                          {interaction.contenido && (
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
                              {interaction.contenido}
                            </p>
                          )}
                          {interaction.respondido && (
                            <span style={{
                              display: 'inline-block',
                              marginTop: '8px',
                              padding: '4px 8px',
                              backgroundColor: '#d1fae5',
                              color: '#065f46',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              ✓ Respondido
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Nuevo Lead */}
      {showNewLeadModal && (
        <NewLeadModal
          onClose={() => setShowNewLeadModal(false)}
          onSuccess={() => {
            cargarLeads();
            setShowNewLeadModal(false);
          }}
        />
      )}

      {/* Modal Nueva Interacción - Placeholder */}
      {showInteractionModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '16px' }}>Registrar Interacción</h2>
            <p style={{ color: '#6b7280' }}>Formulario en desarrollo...</p>
            <button
              onClick={() => setShowInteractionModal(false)}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Nueva Reunión de Ventas */}
      {showNewMeetingModal && (
        <NewSalesMeetingModal
          onClose={() => setShowNewMeetingModal(false)}
          onStartMeeting={(leadId, leadName) => {
            console.log('✅ Iniciando reunión con lead:', leadName);
            // Aquí se abrirá el módulo de reuniones con el lead preseleccionado
            // Por ahora guardamos en localStorage para que el módulo de reuniones lo lea
            localStorage.setItem('selectedLeadForMeeting', JSON.stringify({ id: leadId, nombre: leadName }));
            setShowNewMeetingModal(false);
            // TODO: Navegar al módulo de reuniones o abrir modal de reunión
          }}
        />
      )}
    </div>
  );
};

export default LeadManagementSystem;
