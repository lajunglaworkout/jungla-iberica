import React, { useState, useEffect } from 'react';
import {
    Calendar, Plus, Search, Filter, Edit2, Trash2, Eye,
    ChevronDown, MapPin, Users, Clock, ArrowLeft, X, Check, Building2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';

interface Evento {
    id: number;
    nombre: string;
    fecha_evento: string;
    empresa_colaboradora?: string;
    tipo: string;
    periodicidad: string;
    modelo_economico: string;
    precio?: number;
    plazas_max?: number;
    plazas_reales?: number;
    localizacion?: string;
    estado: string;
    descripcion?: string;
    center_id?: number;
    alcance?: 'centro' | 'todos' | 'marca';
}

interface EventsListProps {
    onSelectEvent: (eventId: number) => void;
    onBack: () => void;
}

const estadoColors: { [key: string]: { bg: string; text: string } } = {
    planificacion: { bg: '#dbeafe', text: '#1d4ed8' },
    confirmado: { bg: '#dcfce7', text: '#16a34a' },
    en_ejecucion: { bg: '#fef3c7', text: '#d97706' },
    finalizado: { bg: '#f3f4f6', text: '#6b7280' },
    cancelado: { bg: '#fee2e2', text: '#dc2626' }
};

const estadoLabels: { [key: string]: string } = {
    planificacion: 'Planificación',
    confirmado: 'Confirmado',
    en_ejecucion: 'En Ejecución',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado'
};

export const EventsList: React.FC<EventsListProps> = ({ onSelectEvent, onBack }) => {
    const { employee } = useSession();
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState<string>('todos');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEvento, setEditingEvento] = useState<Evento | null>(null);

    useEffect(() => {
        loadEventos();
    }, []);

    const loadEventos = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('eventos')
                .select('*')
                .order('fecha_evento', { ascending: false });

            if (error) throw error;
            setEventos(data || []);
        } catch (error) {
            console.error('Error loading eventos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEventos = eventos.filter(evento => {
        const matchesSearch = evento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            evento.localizacion?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEstado = filterEstado === 'todos' || evento.estado === filterEstado;
        return matchesSearch && matchesEstado;
    });

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este evento?')) return;

        try {
            const { error } = await supabase.from('eventos').delete().eq('id', id);
            if (error) throw error;
            loadEventos();
        } catch (error) {
            console.error('Error deleting evento:', error);
            alert('Error al eliminar el evento');
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="animate-spin" style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #10b981', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
                        Lista de Eventos
                    </h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0' }}>
                        {filteredEventos.length} eventos encontrados
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <Plus size={20} />
                    Nuevo Evento
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Buscar eventos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                </div>

                <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        minWidth: '150px'
                    }}
                >
                    <option value="todos">Todos los estados</option>
                    <option value="planificacion">Planificación</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="en_ejecucion">En Ejecución</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>

            {/* Events Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: '20px' }}>
                {filteredEventos.map(evento => (
                    <div
                        key={evento.id}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            border: '1px solid #e5e7eb',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {/* Card Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <span
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        backgroundColor: estadoColors[evento.estado]?.bg || '#f3f4f6',
                                        color: estadoColors[evento.estado]?.text || '#6b7280'
                                    }}
                                >
                                    {estadoLabels[evento.estado] || evento.estado}
                                </span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => onSelectEvent(evento.id)}
                                        style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                        title="Ver detalle"
                                    >
                                        <Eye size={16} color="#6b7280" />
                                    </button>
                                    <button
                                        onClick={() => setEditingEvento(evento)}
                                        style={{ padding: '8px', backgroundColor: '#dbeafe', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                        title="Editar"
                                    >
                                        <Edit2 size={16} color="#2563eb" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(evento.id)}
                                        style={{ padding: '8px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} color="#dc2626" />
                                    </button>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
                                {evento.nombre}
                            </h3>

                            {evento.descripcion && (
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                                    {evento.descripcion.substring(0, 100)}{evento.descripcion.length > 100 ? '...' : ''}
                                </p>
                            )}
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={16} color="#10b981" />
                                    <span style={{ fontSize: '14px', color: '#374151' }}>{formatDate(evento.fecha_evento)}</span>
                                </div>

                                {evento.localizacion && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={16} color="#6b7280" />
                                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{evento.localizacion}</span>
                                    </div>
                                )}

                                {evento.plazas_max && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Users size={16} color="#6b7280" />
                                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                                            {evento.plazas_reales || 0} / {evento.plazas_max} plazas
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div style={{ padding: '12px 20px', backgroundColor: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: evento.modelo_economico === 'pago' ? '#059669' : '#6b7280',
                                    textTransform: 'uppercase'
                                }}>
                                    {evento.modelo_economico === 'pago' ? `${evento.precio || 0}€` : 'Gratuito'}
                                </span>
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                    {evento.tipo === 'individual' ? 'Individual' : evento.tipo === 'colectivo_centros' ? 'Todos los centros' : 'Colectivo'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredEventos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <Calendar size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: '#374151', margin: '0 0 8px' }}>No hay eventos</h3>
                    <p style={{ color: '#6b7280' }}>
                        {searchTerm || filterEstado !== 'todos'
                            ? 'No se encontraron eventos con los filtros aplicados'
                            : 'Crea tu primer evento para comenzar'}
                    </p>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingEvento) && (
                <EventFormModal
                    evento={editingEvento}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingEvento(null);
                    }}
                    onSave={() => {
                        loadEventos();
                        setShowCreateModal(false);
                        setEditingEvento(null);
                    }}
                    employeeId={employee?.id}
                />
            )}
        </div>
    );
};

// Event Form Modal Component
const EventFormModal: React.FC<{
    evento: Evento | null;
    onClose: () => void;
    onSave: () => void;
    employeeId?: string | number;
}> = ({ evento, onClose, onSave, employeeId }) => {
    const [centers, setCenters] = useState<{ id: number; name: string }[]>([]);
    const [loadingCenters, setLoadingCenters] = useState(true);
    const [formData, setFormData] = useState({
        nombre: evento?.nombre || '',
        fecha_evento: evento?.fecha_evento || new Date().toISOString().split('T')[0],
        empresa_colaboradora: evento?.empresa_colaboradora || '',
        tipo: evento?.tipo || 'individual',
        periodicidad: evento?.periodicidad || 'unico',
        modelo_economico: evento?.modelo_economico || 'gratuito',
        precio: evento?.precio || 0,
        plazas_max: evento?.plazas_max || 50,
        localizacion: evento?.localizacion || '',
        estado: evento?.estado || 'planificacion',
        descripcion: evento?.descripcion || '',
        center_id: evento?.center_id || null as number | null,
        alcance: evento?.alcance || (evento?.center_id ? 'centro' : null) as 'centro' | 'todos' | 'marca' | null
    });
    const [saving, setSaving] = useState(false);
    const [alcanceError, setAlcanceError] = useState(false);

    // Load centers
    useEffect(() => {
        const loadCenters = async () => {
            const { data } = await supabase.from('centers').select('id, name').order('name');
            setCenters(data || []);
            setLoadingCenters(false);
        };
        loadCenters();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre || !formData.fecha_evento) {
            alert('Nombre y fecha son obligatorios');
            return;
        }

        // Validate alcance
        if (!formData.alcance) {
            setAlcanceError(true);
            alert('Debes seleccionar un alcance para el evento');
            return;
        }

        // Validate center if alcance is 'centro'
        if (formData.alcance === 'centro' && !formData.center_id) {
            setAlcanceError(true);
            alert('Debes seleccionar un centro específico');
            return;
        }

        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                precio: formData.modelo_economico === 'pago' ? formData.precio : null,
                center_id: formData.alcance === 'centro' ? formData.center_id : null,
                created_by: evento ? undefined : Number(employeeId) || null,
                updated_at: new Date().toISOString()
            };

            if (evento) {
                const { error } = await supabase
                    .from('eventos')
                    .update(dataToSave)
                    .eq('id', evento.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('eventos')
                    .insert([dataToSave]);
                if (error) throw error;
            }
            onSave();
        } catch (error) {
            console.error('Error saving evento:', error);
            alert('Error al guardar el evento');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                        {evento ? 'Editar Evento' : 'Nuevo Evento'}
                    </h2>
                    <button onClick={onClose} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {/* Nombre */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                                Nombre del evento *
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                placeholder="Ej: Campeonato de Crossfit"
                                required
                            />
                        </div>

                        {/* Fecha y Localización */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                                    Fecha *
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_evento}
                                    onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                                    Localización
                                </label>
                                <input
                                    type="text"
                                    value={formData.localizacion}
                                    onChange={(e) => setFormData({ ...formData, localizacion: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    placeholder="Centro, ciudad..."
                                />
                            </div>
                        </div>

                        {/* Estado */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                                Estado
                            </label>
                            <select
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}
                            >
                                <option value="planificacion">Planificación</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="en_ejecucion">En Ejecución</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>

                        {/* Alcance del evento - OBLIGATORIO */}
                        <div style={{
                            padding: '16px',
                            backgroundColor: alcanceError && !formData.alcance ? '#fef2f2' : '#f0fdf4',
                            borderRadius: '12px',
                            border: alcanceError && !formData.alcance ? '2px solid #dc2626' : '2px solid #10b981'
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
                                <Building2 size={18} color="#10b981" />
                                Alcance del Evento *
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setFormData({ ...formData, alcance: 'centro', center_id: null }); setAlcanceError(false); }}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: formData.alcance === 'centro' ? '#10b981' : 'white',
                                        color: formData.alcance === 'centro' ? 'white' : '#374151',
                                        border: `2px solid ${formData.alcance === 'centro' ? '#10b981' : '#e5e7eb'}`,
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    🏢 Centro Específico
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setFormData({ ...formData, alcance: 'todos', center_id: null }); setAlcanceError(false); }}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: formData.alcance === 'todos' ? '#3b82f6' : 'white',
                                        color: formData.alcance === 'todos' ? 'white' : '#374151',
                                        border: `2px solid ${formData.alcance === 'todos' ? '#3b82f6' : '#e5e7eb'}`,
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    🏟️ Todos los Centros
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setFormData({ ...formData, alcance: 'marca', center_id: null }); setAlcanceError(false); }}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: formData.alcance === 'marca' ? '#f59e0b' : 'white',
                                        color: formData.alcance === 'marca' ? 'white' : '#374151',
                                        border: `2px solid ${formData.alcance === 'marca' ? '#f59e0b' : '#e5e7eb'}`,
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    🎯 Evento de Marca
                                </button>
                            </div>

                            {/* Center selector if alcance is 'centro' */}
                            {formData.alcance === 'centro' && (
                                <select
                                    value={formData.center_id || ''}
                                    onChange={(e) => setFormData({ ...formData, center_id: Number(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: alcanceError && !formData.center_id ? '2px solid #dc2626' : '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                        marginTop: '12px',
                                        fontSize: '14px'
                                    }}
                                    required
                                >
                                    <option value="">Selecciona un centro...</option>
                                    {centers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            )}

                            {!formData.alcance && (
                                <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#dc2626', fontWeight: 500 }}>
                                    ⚠️ Debes seleccionar uno de los tres tipos de alcance
                                </p>
                            )}
                        </div>

                        {/* Modelo económico y precio */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                                    Modelo económico
                                </label>
                                <select
                                    value={formData.modelo_economico}
                                    onChange={(e) => setFormData({ ...formData, modelo_economico: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}
                                >
                                    <option value="gratuito">Gratuito</option>
                                    <option value="pago">De Pago</option>
                                </select>
                            </div>
                            {formData.modelo_economico === 'pago' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                                        Precio (€)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.precio}
                                        onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Plazas */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                                Plazas máximas
                            </label>
                            <input
                                type="number"
                                value={formData.plazas_max}
                                onChange={(e) => setFormData({ ...formData, plazas_max: Number(e.target.value) })}
                                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                min="1"
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                                Descripción
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', minHeight: '100px', resize: 'vertical' }}
                                placeholder="Descripción del evento..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 500,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {saving ? 'Guardando...' : <><Check size={18} /> Guardar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventsList;
