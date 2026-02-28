import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Search, UserPlus, Check, X, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { ui } from '../../utils/ui';


interface Participante {
    id: number;
    evento_id: number;
    nombre: string;
    email?: string;
    telefono?: string;
    modalidad: string;
    equipo_nombre?: string;
    fecha_inscripcion: string;
    asistio?: boolean;
}

interface Evento {
    id: number;
    nombre: string;
    fecha_evento: string;
    plazas_esperadas?: number;
    plazas_max?: number;
    estado: string;
}

interface EventoConParticipantes extends Evento {
    participantes: Participante[];
}

interface ParticipantsListProps {
    onBack: () => void;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ onBack }) => {
    const [eventosConParticipantes, setEventosConParticipantes] = useState<EventoConParticipantes[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEventos, setExpandedEventos] = useState<Set<number>>(new Set());
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Participante>>({ modalidad: 'individual' });
    const [totalParticipantes, setTotalParticipantes] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load eventos
            const eventosData = await eventService.eventos.getWithFields(
                'id, nombre, fecha_evento, plazas_esperadas, plazas_max, estado',
                { orderBy: 'fecha_evento', ascending: false }
            );

            // Load participantes
            const participantesData = await eventService.participantes.getAllOrdered();

            // Group participantes by evento
            const eventosMap = new Map<number, EventoConParticipantes>();
            eventosData.forEach(ev => {
                eventosMap.set(ev.id, { ...ev, participantes: [] });
            });

            participantesData.forEach(p => {
                const evento = eventosMap.get(p.evento_id);
                if (evento) {
                    evento.participantes.push(p);
                }
            });

            setEventosConParticipantes(Array.from(eventosMap.values()).filter(e => e.participantes.length > 0 || e.estado !== 'finalizado'));
            setTotalParticipantes(participantesData.length);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpanded = (eventoId: number) => {
        const newExpanded = new Set(expandedEventos);
        if (newExpanded.has(eventoId)) {
            newExpanded.delete(eventoId);
        } else {
            newExpanded.add(eventoId);
        }
        setExpandedEventos(newExpanded);
    };

    const handleSave = async () => {
        if (!formData.nombre || !formData.evento_id) {
            ui.error('Nombre y evento son obligatorios');
            return;
        }
        try {
            await eventService.participantes.insertRaw(formData);
            loadData();
            setShowModal(false);
            setFormData({ modalidad: 'individual' });
        } catch (error) {
            console.error('Error saving participante:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!await ui.confirm('¿Eliminar este participante?')) return;
        try {
            await eventService.participantes.delete(id);
            loadData();
        } catch (error) {
            console.error('Error deleting participante:', error);
        }
    };

    const handleToggleAsistio = async (id: number, asistio?: boolean) => {
        try {
            await eventService.participantes.update(id, { asistio: !asistio });
            loadData();
        } catch (error) {
            console.error('Error updating asistencia:', error);
        }
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'planificacion': return { bg: '#fef3c7', color: '#92400e' };
            case 'confirmado': return { bg: '#dbeafe', color: '#1e40af' };
            case 'en_ejecucion': return { bg: '#dcfce7', color: '#166534' };
            case 'finalizado': return { bg: '#f3f4f6', color: '#6b7280' };
            default: return { bg: '#f3f4f6', color: '#6b7280' };
        }
    };

    // Filter eventos by search term (event name or participant name)
    const filteredEventos = eventosConParticipantes.filter(ev => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        if (ev.nombre.toLowerCase().includes(term)) return true;
        return ev.participantes.some(p =>
            p.nombre.toLowerCase().includes(term) ||
            p.email?.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="animate-spin" style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #10b981', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>Participantes por Evento</h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0' }}>{totalParticipantes} participantes en {eventosConParticipantes.length} eventos</p>
                </div>
                <button
                    onClick={async () => setShowModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                    <UserPlus size={20} /> Inscribir Participante
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Buscar eventos o participantes..."
                        value={searchTerm}
                        onChange={async (e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px' }}
                    />
                </div>
            </div>

            {/* Eventos List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredEventos.map(evento => {
                    const isExpanded = expandedEventos.has(evento.id);
                    const estadoStyle = getEstadoColor(evento.estado);
                    const asistieron = evento.participantes.filter(p => p.asistio).length;

                    return (
                        <div key={evento.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            overflow: 'hidden'
                        }}>
                            {/* Event Row Header */}
                            <button
                                onClick={async () => toggleExpanded(evento.id)}
                                style={{
                                    width: '100%',
                                    display: 'grid',
                                    gridTemplateColumns: '40px 1fr 150px 150px 120px',
                                    alignItems: 'center',
                                    padding: '16px 20px',
                                    backgroundColor: isExpanded ? '#f9fafb' : 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <div>
                                    {isExpanded ? <ChevronDown size={20} color="#6b7280" /> : <ChevronRight size={20} color="#6b7280" />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '15px', marginBottom: '4px' }}>
                                        {evento.nombre}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                                        <Calendar size={14} />
                                        {formatDate(evento.fecha_evento)}
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: 500,
                                            backgroundColor: estadoStyle.bg,
                                            color: estadoStyle.color
                                        }}>
                                            {evento.estado.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#6b7280' }}>
                                        {evento.plazas_esperadas || '-'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Esperados</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981' }}>
                                        {evento.participantes.length}
                                        {evento.plazas_max && <span style={{ fontSize: '13px', color: '#9ca3af' }}>/{evento.plazas_max}</span>}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Inscritos</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '22px', fontWeight: 700, color: asistieron > 0 ? '#16a34a' : '#9ca3af' }}>
                                        {asistieron}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Asistieron</div>
                                </div>
                            </button>

                            {/* Expanded Participants List */}
                            {isExpanded && (
                                <div style={{ borderTop: '1px solid #e5e7eb' }}>
                                    {evento.participantes.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>#</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Nombre</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Email</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Teléfono</th>
                                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Modalidad</th>
                                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Asistió</th>
                                                    <th style={{ padding: '12px', width: '50px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {evento.participantes.map((p, idx) => (
                                                    <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={{ padding: '12px 20px', color: '#9ca3af', fontSize: '13px' }}>{idx + 1}</td>
                                                        <td style={{ padding: '12px' }}>
                                                            <div style={{ fontWeight: 500, color: '#111827' }}>{p.nombre}</div>
                                                            {p.equipo_nombre && <div style={{ fontSize: '12px', color: '#6b7280' }}>Equipo: {p.equipo_nombre}</div>}
                                                        </td>
                                                        <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>{p.email || '-'}</td>
                                                        <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>{p.telefono || '-'}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                fontWeight: 500,
                                                                backgroundColor: p.modalidad === 'individual' ? '#f3f4f6' : '#dbeafe',
                                                                color: p.modalidad === 'individual' ? '#6b7280' : '#2563eb'
                                                            }}>
                                                                {p.modalidad}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <button
                                                                onClick={async () => handleToggleAsistio(p.id, p.asistio)}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '50%',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    backgroundColor: p.asistio ? '#dcfce7' : '#f3f4f6',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    margin: '0 auto'
                                                                }}
                                                            >
                                                                {p.asistio ? <Check size={16} color="#16a34a" /> : <X size={16} color="#9ca3af" />}
                                                            </button>
                                                        </td>
                                                        <td style={{ padding: '12px' }}>
                                                            <button
                                                                onClick={async () => handleDelete(p.id)}
                                                                style={{ padding: '6px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                                            >
                                                                <Trash2 size={14} color="#dc2626" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                                            <Users size={32} style={{ marginBottom: '8px' }} />
                                            <p>No hay participantes inscritos en este evento</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredEventos.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <Users size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
                        <p style={{ color: '#6b7280', margin: 0 }}>No hay eventos con participantes</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }}>
                        <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 600 }}>Inscribir Participante</h2>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Evento *</label>
                                <select
                                    value={formData.evento_id || ''}
                                    onChange={async (e) => setFormData({ ...formData, evento_id: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                >
                                    <option value="">Seleccionar evento...</option>
                                    {eventosConParticipantes.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.nombre || ''}
                                    onChange={async (e) => setFormData({ ...formData, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Email</label>
                                    <input type="email" value={formData.email || ''} onChange={async (e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Teléfono</label>
                                    <input type="tel" value={formData.telefono || ''} onChange={async (e) => setFormData({ ...formData, telefono: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Modalidad</label>
                                <select value={formData.modalidad} onChange={async (e) => setFormData({ ...formData, modalidad: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                    <option value="individual">Individual</option>
                                    <option value="grupal">Grupal</option>
                                    <option value="equipo">Equipo</option>
                                </select>
                            </div>
                            {(formData.modalidad === 'grupal' || formData.modalidad === 'equipo') && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Nombre del Equipo</label>
                                    <input type="text" value={formData.equipo_nombre || ''} onChange={async (e) => setFormData({ ...formData, equipo_nombre: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button onClick={async () => { setShowModal(false); setFormData({ modalidad: 'individual' }); }} style={{ padding: '12px 20px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleSave} style={{ padding: '12px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Inscribir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantsList;
