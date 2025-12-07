import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Plus, Search, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Encuesta {
    id: number;
    evento_id: number;
    participante_nombre: string;
    origen: string;
    puntuacion_general?: number;
    puntuacion_organizacion?: number;
    puntuacion_contenido?: number;
    recomendaria?: boolean;
    comentarios?: string;
    created_at: string;
}

interface Evento {
    id: number;
    nombre: string;
}

interface SurveysListProps {
    onBack: () => void;
}

export const SurveysList: React.FC<SurveysListProps> = ({ onBack }) => {
    const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterEvento, setFilterEvento] = useState<number | 'todos'>('todos');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Encuesta>>({ origen: 'crm' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: eventosData } = await supabase.from('eventos').select('id, nombre').order('fecha_evento', { ascending: false });
            setEventos(eventosData || []);

            const { data: encuestasData } = await supabase.from('evento_encuestas').select('*').order('created_at', { ascending: false });
            setEncuestas(encuestasData || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.evento_id || !formData.participante_nombre) {
            alert('Evento y nombre del participante son obligatorios');
            return;
        }
        try {
            await supabase.from('evento_encuestas').insert([formData]);
            loadData();
            setShowModal(false);
            setFormData({ origen: 'crm' });
        } catch (error) {
            console.error('Error saving encuesta:', error);
        }
    };

    const filtered = encuestas.filter(e => filterEvento === 'todos' || e.evento_id === filterEvento);
    const getEventoNombre = (eventoId: number) => eventos.find(e => e.id === eventoId)?.nombre || 'Evento';

    // Calculate stats
    const avgGeneral = filtered.length > 0
        ? (filtered.reduce((sum, e) => sum + (e.puntuacion_general || 0), 0) / filtered.filter(e => e.puntuacion_general).length)
        : 0;
    const pctRecomendaria = filtered.length > 0
        ? (filtered.filter(e => e.recomendaria).length / filtered.length * 100)
        : 0;

    const renderStars = (rating?: number, size = 16) => (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={size} fill={(rating || 0) >= star ? '#f59e0b' : 'none'} color={(rating || 0) >= star ? '#f59e0b' : '#d1d5db'} />
            ))}
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="animate-spin" style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #f59e0b', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>Encuestas de Satisfacción</h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0' }}>{filtered.length} encuestas recibidas</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                    <Plus size={20} /> Nueva Encuesta
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>{renderStars(Math.round(avgGeneral), 20)}</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>{avgGeneral.toFixed(1)}/5</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>Puntuación Media</div>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>{pctRecomendaria.toFixed(0)}%</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>Recomendarían</div>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>{filtered.length}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Encuestas</div>
                </div>
            </div>

            {/* Filter */}
            <div style={{ marginBottom: '24px' }}>
                <select
                    value={filterEvento}
                    onChange={(e) => setFilterEvento(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                    style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: 'white', minWidth: '250px' }}
                >
                    <option value="todos">Todos los eventos</option>
                    {eventos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
            </div>

            {/* Encuestas Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: '20px' }}>
                {filtered.map(encuesta => (
                    <div key={encuesta.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                                <div style={{ fontWeight: 600, color: '#111827' }}>{encuesta.participante_nombre}</div>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>{getEventoNombre(encuesta.evento_id)}</div>
                            </div>
                            <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 500,
                                backgroundColor: encuesta.origen === 'movil' ? '#dbeafe' : '#f3f4f6',
                                color: encuesta.origen === 'movil' ? '#2563eb' : '#6b7280'
                            }}>
                                {encuesta.origen === 'movil' ? '📱 Móvil' : '💻 CRM'}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>General</div>
                                {renderStars(encuesta.puntuacion_general, 14)}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Organización</div>
                                {renderStars(encuesta.puntuacion_organizacion, 14)}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Contenido</div>
                                {renderStars(encuesta.puntuacion_contenido, 14)}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            {encuesta.recomendaria ? (
                                <><ThumbsUp size={16} color="#16a34a" /><span style={{ fontSize: '13px', color: '#16a34a' }}>Recomendaría</span></>
                            ) : (
                                <><ThumbsDown size={16} color="#dc2626" /><span style={{ fontSize: '13px', color: '#dc2626' }}>No recomendaría</span></>
                            )}
                        </div>

                        {encuesta.comentarios && (
                            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontStyle: 'italic', lineHeight: 1.5 }}>
                                "{encuesta.comentarios}"
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <MessageSquare size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: '#374151', margin: '0 0 8px' }}>No hay encuestas</h3>
                    <p style={{ color: '#6b7280' }}>Añade la primera encuesta de satisfacción</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 600 }}>Nueva Encuesta de Satisfacción</h2>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Evento *</label>
                                <select value={formData.evento_id || ''} onChange={(e) => setFormData({ ...formData, evento_id: Number(e.target.value) })} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                    <option value="">Seleccionar...</option>
                                    {eventos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Nombre del Participante *</label>
                                <input type="text" value={formData.participante_nombre || ''} onChange={(e) => setFormData({ ...formData, participante_nombre: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                            </div>
                            {['puntuacion_general', 'puntuacion_organizacion', 'puntuacion_contenido'].map((field, idx) => (
                                <div key={field}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                                        {idx === 0 ? 'Puntuación General' : idx === 1 ? 'Organización' : 'Contenido'}
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button key={star} type="button" onClick={() => setFormData({ ...formData, [field]: star })} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Star size={28} fill={((formData as any)[field] || 0) >= star ? '#f59e0b' : 'none'} color={((formData as any)[field] || 0) >= star ? '#f59e0b' : '#d1d5db'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>¿Recomendaría?</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setFormData({ ...formData, recomendaria: true })} style={{ flex: 1, padding: '12px', border: `2px solid ${formData.recomendaria === true ? '#16a34a' : '#e5e7eb'}`, borderRadius: '8px', backgroundColor: formData.recomendaria === true ? '#dcfce7' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <ThumbsUp size={18} color={formData.recomendaria === true ? '#16a34a' : '#9ca3af'} /> Sí
                                    </button>
                                    <button type="button" onClick={() => setFormData({ ...formData, recomendaria: false })} style={{ flex: 1, padding: '12px', border: `2px solid ${formData.recomendaria === false ? '#dc2626' : '#e5e7eb'}`, borderRadius: '8px', backgroundColor: formData.recomendaria === false ? '#fee2e2' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <ThumbsDown size={18} color={formData.recomendaria === false ? '#dc2626' : '#9ca3af'} /> No
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Comentarios</label>
                                <textarea value={formData.comentarios || ''} onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', minHeight: '80px' }} placeholder="Opinión del participante..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => { setShowModal(false); setFormData({ origen: 'crm' }); }} style={{ padding: '12px 20px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleSave} style={{ padding: '12px 20px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SurveysList;
