import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Save, Plus, Trash2, Upload, ExternalLink, Calendar,
    MapPin, Users, Euro, FileText, Star, CheckCircle2, AlertTriangle,
    ChevronDown, ChevronUp, ClipboardList, TrendingUp, TrendingDown, Award,
    MessageSquare, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Evento {
    id: number;
    nombre: string;
    fecha_evento: string;
    empresa_colaboradora?: string;
    tipo: string;
    periodicidad: string;
    modelo_economico: string;
    precio?: number;
    asistencia_no_socios: boolean;
    plazas_max?: number;
    plazas_esperadas?: number;
    plazas_reales?: number;
    descripcion?: string;
    localizacion?: string;
    fecha_limite_inscripcion?: string;
    enlace_multimedia?: string;
    observaciones?: string;
    estado: string;
}

interface Gasto {
    id?: number;
    partida: string;
    fecha?: string;
    coste: number;
    enlace_factura?: string;
}

interface Informe {
    objetivo_comunidad?: string;
    objetivo_ventas?: string;
    objetivo_organizacion?: string;
    objetivo_participacion?: string;
    conclusiones?: string;
    pros?: string;
    contras?: string;
    aprendizajes?: string;
    valoracion_encargado?: number;
}

interface EncuestaResumen {
    total: number;
    media_general: number;
    media_organizacion: number;
    media_contenido: number;
    recomendaria_pct: number;
}

interface Participante {
    id?: number;
    evento_id: number;
    nombre: string;
    email?: string;
    telefono?: string;
    modalidad: 'individual' | 'grupal' | 'equipo';
    nombre_equipo?: string;
    asistio: boolean;
    created_at?: string;
}

interface Encuesta {
    id?: number;
    evento_id: number;
    participante_id?: number;
    participante_nombre: string;
    origen: string;
    puntuacion_general?: number;
    puntuacion_organizacion?: number;
    puntuacion_contenido?: number;
    recomendaria?: boolean;
    comentarios?: string;
}

interface ChecklistItem {
    id?: number;
    evento_id: number;
    plantilla_id?: number;
    nombre: string;
    descripcion?: string;
    fecha_limite: string;
    completado: boolean;
    completado_por?: number;
    completado_at?: string;
    notas?: string;
}

interface EventTemplateProps {
    eventId: number;
    onBack: () => void;
}

// Collapsible Section Component
const CollapsibleSection: React.FC<{
    title: string;
    icon: React.ElementType;
    color: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}> = ({ title, icon: Icon, color, defaultOpen = true, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{
            marginBottom: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    backgroundColor: color,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={20} />
                    <span style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '0.3px' }}>{title}</span>
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <div style={{
                maxHeight: isOpen ? '3000px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out'
            }}>
                <div style={{ padding: '24px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// Form Field Component for consistent styling
const FormField: React.FC<{
    label: string;
    required?: boolean;
    children: React.ReactNode;
    span?: number;
}> = ({ label, required, children, span = 1 }) => (
    <div style={{ gridColumn: `span ${span}` }}>
        <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        {children}
    </div>
);

// Star Rating Component
const StarRating: React.FC<{
    value: number;
    onChange?: (value: number) => void;
    readOnly?: boolean;
    size?: number;
}> = ({ value, onChange, readOnly = false, size = 24 }) => {
    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => !readOnly && onChange?.(star)}
                    disabled={readOnly}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: readOnly ? 'default' : 'pointer',
                        padding: 0
                    }}
                >
                    <Star
                        size={size}
                        fill={star <= value ? '#f59e0b' : 'transparent'}
                        color={star <= value ? '#f59e0b' : '#d1d5db'}
                    />
                </button>
            ))}
        </div>
    );
};

export const EventTemplate: React.FC<EventTemplateProps> = ({ eventId, onBack }) => {
    const [evento, setEvento] = useState<Evento | null>(null);
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [informe, setInforme] = useState<Informe>({});
    const [encuestaResumen, setEncuestaResumen] = useState<EncuestaResumen>({ total: 0, media_general: 0, media_organizacion: 0, media_contenido: 0, recomendaria_pct: 0 });
    const [participantes, setParticipantes] = useState<Participante[]>([]);
    const [participantesCount, setParticipantesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingFactura, setUploadingFactura] = useState<number | null>(null);
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    // Asistentes quick-add
    const [showParticipantesModal, setShowParticipantesModal] = useState(false);
    const [quickAddName, setQuickAddName] = useState('');
    const [quickAddEmail, setQuickAddEmail] = useState('');
    const [quickAddTelefono, setQuickAddTelefono] = useState('');
    const [showCapacityWarning, setShowCapacityWarning] = useState(false);
    const [addingParticipante, setAddingParticipante] = useState(false);
    const [quickAddHaPagado, setQuickAddHaPagado] = useState(false);

    // Encuestas
    const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
    const [showEncuestaForm, setShowEncuestaForm] = useState(false);
    const [selectedParticipanteId, setSelectedParticipanteId] = useState<number | null>(null);
    const [encuestaForm, setEncuestaForm] = useState<Partial<Encuesta>>({
        origen: 'crm',
        puntuacion_general: 0,
        puntuacion_organizacion: 0,
        puntuacion_contenido: 0,
        recomendaria: true
    });
    const [savingEncuesta, setSavingEncuesta] = useState(false);

    // Checklist
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [loadingChecklist, setLoadingChecklist] = useState(false);

    useEffect(() => {
        loadEventData();
    }, [eventId]);

    const loadEventData = async () => {
        setLoading(true);
        try {
            // Load evento
            const { data: eventoData } = await supabase.from('eventos').select('*').eq('id', eventId).single();
            if (eventoData) setEvento(eventoData);

            // Load gastos
            const { data: gastosData } = await supabase.from('evento_gastos').select('*').eq('evento_id', eventId).order('fecha');
            setGastos(gastosData || []);

            // Load informe
            const { data: informeData } = await supabase.from('evento_informes').select('*').eq('evento_id', eventId).single();
            if (informeData) setInforme(informeData);

            // Load participantes
            const { data: participantesData } = await supabase.from('evento_participantes').select('*').eq('evento_id', eventId).order('created_at');
            setParticipantes(participantesData || []);
            setParticipantesCount(participantesData?.length || 0);

            // Load encuestas resumen
            const { data: encuestasData } = await supabase.from('evento_encuestas').select('*').eq('evento_id', eventId).order('created_at', { ascending: false });
            if (encuestasData) {
                setEncuestas(encuestasData);
                if (encuestasData.length > 0) {
                    const total = encuestasData.length;
                    const media_general = encuestasData.reduce((sum, e) => sum + (e.puntuacion_general || 0), 0) / total;
                    const media_organizacion = encuestasData.reduce((sum, e) => sum + (e.puntuacion_organizacion || 0), 0) / total;
                    const media_contenido = encuestasData.reduce((sum, e) => sum + (e.puntuacion_contenido || 0), 0) / total;
                    const recomendaria_count = encuestasData.filter(e => e.recomendaria).length;
                    setEncuestaResumen({
                        total,
                        media_general: Math.round(media_general * 10) / 10,
                        media_organizacion: Math.round(media_organizacion * 10) / 10,
                        media_contenido: Math.round(media_contenido * 10) / 10,
                        recomendaria_pct: Math.round((recomendaria_count / total) * 100)
                    });
                }
            }

            // Load checklist
            const { data: checklistData } = await supabase
                .from('evento_checklist')
                .select('*')
                .eq('evento_id', eventId)
                .order('fecha_limite');
            setChecklist(checklistData || []);

        } catch (error) {
            console.error('Error loading event data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle checklist item
    const toggleChecklistItem = async (itemId: number, completed: boolean) => {
        try {
            await supabase
                .from('evento_checklist')
                .update({
                    completado: completed,
                    completado_at: completed ? new Date().toISOString() : null
                })
                .eq('id', itemId);

            setChecklist(prev => prev.map(item =>
                item.id === itemId
                    ? { ...item, completado: completed, completado_at: completed ? new Date().toISOString() : undefined }
                    : item
            ));
        } catch (error) {
            console.error('Error updating checklist:', error);
        }
    };

    const handleSaveEvento = async () => {
        if (!evento) return;
        setSaving(true);
        try {
            await supabase.from('eventos').update({
                ...evento,
                updated_at: new Date().toISOString()
            }).eq('id', eventId);
            alert('✅ Evento guardado correctamente');
        } catch (error) {
            console.error('Error saving evento:', error);
            alert('❌ Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const addGasto = () => {
        setGastos([...gastos, { partida: '', coste: 0, fecha: new Date().toISOString().split('T')[0] }]);
    };

    const removeGasto = async (index: number) => {
        const gasto = gastos[index];
        if (gasto.id) {
            await supabase.from('evento_gastos').delete().eq('id', gasto.id);
        }
        setGastos(gastos.filter((_, i) => i !== index));
    };

    const handleUploadFactura = async (index: number, file: File) => {
        setUploadingFactura(index);
        try {
            const fileName = `facturas/${eventId}/${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage.from('eventos').upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('eventos').getPublicUrl(fileName);

            const newGastos = [...gastos];
            newGastos[index].enlace_factura = publicUrl;
            setGastos(newGastos);

            alert('✅ Factura subida correctamente');
        } catch (error) {
            console.error('Error uploading factura:', error);
            alert('❌ Error al subir la factura. Asegúrate de que existe el bucket "eventos" en Supabase Storage.');
        } finally {
            setUploadingFactura(null);
        }
    };

    const saveGastos = async () => {
        setSaving(true);
        try {
            // 🔧 REFACTORIZADO: Usar UPSERT para evitar pérdida de gastos al editar concurrentemente
            const gastosToUpsert = gastos.map(g => {
                const gastoDB: any = {
                    evento_id: eventId,
                    partida: g.partida,
                    fecha: g.fecha,
                    coste: g.coste,
                    enlace_factura: g.enlace_factura
                };
                if (g.id) {
                    gastoDB.id = g.id;
                }
                return gastoDB;
            });

            if (gastosToUpsert.length > 0) {
                const { data, error } = await supabase
                    .from('evento_gastos')
                    .upsert(gastosToUpsert)
                    .select();

                if (error) throw error;

                if (data) {
                    // Actualizar estado local con IDs generados
                    const updatedGastos = data.map((g: any) => ({
                        id: g.id,
                        partida: g.partida,
                        fecha: g.fecha,
                        coste: g.coste,
                        enlace_factura: g.enlace_factura
                    }));
                    setGastos(updatedGastos);
                }
            }

            // Nota: Los gastos borrados en UI se borran individualmente con removeGasto, 
            // así que no necesitamos borrar todo aquí.

            alert('✅ Gastos guardados correctamente');
        } catch (error) {
            console.error('Error saving gastos:', error);
            alert('❌ Error al guardar gastos');
        } finally {
            setSaving(false);
        }
    };

    // Participantes management
    const addParticipante = () => {
        setParticipantes([...participantes, {
            evento_id: eventId,
            nombre: '',
            email: '',
            telefono: '',
            modalidad: 'individual',
            asistio: false
        }]);
    };

    const removeParticipante = async (index: number) => {
        const participante = participantes[index];
        if (participante.id) {
            await supabase.from('evento_participantes').delete().eq('id', participante.id);
        }
        const newList = participantes.filter((_, i) => i !== index);
        setParticipantes(newList);
        setParticipantesCount(newList.length);
    };

    const updateParticipante = (index: number, field: keyof Participante, value: any) => {
        const newParticipantes = [...participantes];
        (newParticipantes[index] as any)[field] = value;
        setParticipantes(newParticipantes);
    };

    const toggleAsistencia = async (index: number) => {
        const participante = participantes[index];
        const newValue = !participante.asistio;
        const newParticipantes = [...participantes];
        newParticipantes[index].asistio = newValue;
        setParticipantes(newParticipantes);

        if (participante.id) {
            await supabase.from('evento_participantes').update({ asistio: newValue }).eq('id', participante.id);
        }
    };

    const saveParticipantes = async () => {
        setSaving(true);
        try {
            // 🔧 REFACTORIZADO: Usar UPSERT en lugar de DELETE+INSERT para evitar pérdida de datos
            // Preparar datos para upsert
            const participantesToUpsert = participantes.map(p => {
                // Base del objeto
                const participanteDB: any = {
                    evento_id: eventId,
                    nombre: p.nombre,
                    email: p.email,
                    telefono: p.telefono,
                    modalidad: p.modalidad,
                    nombre_equipo: p.nombre_equipo,
                    asistio: p.asistio
                };

                // Si tiene ID, lo incluimos para que actualice en lugar de crear
                if (p.id) {
                    participanteDB.id = p.id;
                }

                return participanteDB;
            });

            if (participantesToUpsert.length > 0) {
                const { data, error } = await supabase
                    .from('evento_participantes')
                    .upsert(participantesToUpsert)
                    .select(); // Recuperar IDs generados

                if (error) throw error;

                // Actualizar estado local con los nuevos datos (especialmente IDs)
                if (data) {
                    // Mapear respuesta de vuelta al formato local
                    const updatedParticipantes = data.map((p: any) => ({
                        id: p.id,
                        evento_id: p.evento_id,
                        nombre: p.nombre,
                        email: p.email,
                        telefono: p.telefono,
                        modalidad: p.modalidad,
                        nombre_equipo: p.nombre_equipo,
                        asistio: p.asistio
                    }));
                    setParticipantes(updatedParticipantes);
                    setParticipantesCount(updatedParticipantes.length);
                }
            }

            // Actualizar plazas reales
            if (evento) {
                // Recalcular asistencia basado en estado actual
                const asistieron = participantes.filter(p => p.asistio).length;

                // Actualizar evento sin borrar otros campos
                await supabase.from('eventos').update({
                    plazas_reales: asistieron,
                    updated_at: new Date().toISOString()
                }).eq('id', eventId);

                setEvento({ ...evento, plazas_reales: asistieron });
            }

            alert('✅ Asistentes guardados correctamente');
        } catch (error) {
            console.error('Error saving participantes:', error);
            alert('❌ Error al guardar asistentes');
        } finally {
            setSaving(false);
        }
    };

    // Quick add participante (saves immediately)
    const quickAddParticipante = async (forceAdd = false) => {
        if (!quickAddName.trim()) {
            alert('Por favor, introduce el nombre del asistente');
            return;
        }

        // Check capacity
        const maxPlazas = evento?.plazas_max || 0;
        if (maxPlazas > 0 && participantes.length >= maxPlazas && !forceAdd) {
            setShowCapacityWarning(true);
            return;
        }

        setAddingParticipante(true);
        try {
            const newParticipante = {
                evento_id: eventId,
                nombre: quickAddName.trim(),
                email: quickAddEmail.trim() || null,
                telefono: quickAddTelefono.trim() || null,
                modalidad: 'individual' as const,
                asistio: false
            };

            const { data, error } = await supabase
                .from('evento_participantes')
                .insert([newParticipante])
                .select()
                .single();

            if (error) throw error;

            // If paid event and has paid, register the income
            if (evento?.modelo_economico === 'pago' && quickAddHaPagado && evento?.precio) {
                await supabase.from('evento_ingresos').insert([{
                    evento_id: eventId,
                    concepto: `Inscripción: ${quickAddName.trim()}`,
                    importe: evento.precio,
                    fecha: new Date().toISOString().split('T')[0],
                    pagado: true
                }]);
            }

            // Add to local state
            setParticipantes([...participantes, { ...newParticipante, id: data.id }]);
            setParticipantesCount(participantes.length + 1);

            // Clear form
            setQuickAddName('');
            setQuickAddEmail('');
            setQuickAddTelefono('');
            setQuickAddHaPagado(false);
            setShowCapacityWarning(false);

        } catch (error) {
            console.error('Error adding participante:', error);
            alert('❌ Error al añadir asistente');
        } finally {
            setAddingParticipante(false);
        }
    };

    const confirmExpandCapacity = async () => {
        if (!evento) return;
        const newMax = (evento.plazas_max || 0) + 10;
        await supabase.from('eventos').update({ plazas_max: newMax }).eq('id', eventId);
        setEvento({ ...evento, plazas_max: newMax });
        setShowCapacityWarning(false);
        quickAddParticipante(true);
    };

    const saveInforme = async () => {
        setSaving(true);
        try {
            const { data: existingInforme } = await supabase.from('evento_informes').select('id').eq('evento_id', eventId).single();
            if (existingInforme) {
                await supabase.from('evento_informes').update(informe).eq('evento_id', eventId);
            } else {
                await supabase.from('evento_informes').insert([{ ...informe, evento_id: eventId }]);
            }
            alert('✅ Informe guardado');
        } catch (error) {
            console.error('Error saving informe:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleParticipanteSelectForEncuesta = (participanteId: number) => {
        const participante = participantes.find(p => p.id === participanteId);
        if (participante) {
            setSelectedParticipanteId(participanteId);
            setEncuestaForm({
                ...encuestaForm,
                participante_id: participanteId,
                participante_nombre: participante.nombre
            });
            // Mark as attended
            if (!participante.asistio) {
                toggleAsistencia(participante);
            }
        }
    };

    const saveEncuesta = async () => {
        if (!selectedParticipanteId || !encuestaForm.participante_nombre) {
            alert('Selecciona un asistente');
            return;
        }

        // Check if already has survey
        const existingSurvey = encuestas.find(e => e.participante_id === selectedParticipanteId);
        if (existingSurvey) {
            alert('Este asistente ya tiene una encuesta registrada');
            return;
        }

        setSavingEncuesta(true);
        try {
            const { error } = await supabase.from('evento_encuestas').insert([{
                evento_id: eventId,
                participante_id: selectedParticipanteId,
                participante_nombre: encuestaForm.participante_nombre,
                origen: 'crm',
                puntuacion_general: encuestaForm.puntuacion_general || 0,
                puntuacion_organizacion: encuestaForm.puntuacion_organizacion || 0,
                puntuacion_contenido: encuestaForm.puntuacion_contenido || 0,
                recomendaria: encuestaForm.recomendaria,
                comentarios: encuestaForm.comentarios || ''
            }]);

            if (error) throw error;

            // Reset form
            setSelectedParticipanteId(null);
            setEncuestaForm({
                origen: 'crm',
                puntuacion_general: 0,
                puntuacion_organizacion: 0,
                puntuacion_contenido: 0,
                recomendaria: true
            });
            setShowEncuestaForm(false);

            // Reload data
            loadEventData();
            alert('✅ Encuesta guardada');
        } catch (error) {
            console.error('Error saving encuesta:', error);
            alert('❌ Error al guardar encuesta');
        } finally {
            setSavingEncuesta(false);
        }
    };

    // Get participants without survey for dropdown
    const participantesSinEncuesta = participantes.filter(p =>
        !encuestas.find(e => e.participante_id === p.id)
    );

    const totalGastos = gastos.reduce((sum, g) => sum + (g.coste || 0), 0);
    const totalIngresos = (evento?.plazas_reales || 0) * (evento?.precio || 0);
    const balance = totalIngresos - totalGastos;

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 14px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: '#fafafa',
        transition: 'all 0.2s',
        outline: 'none'
    };

    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        backgroundColor: 'white',
        cursor: 'pointer'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="animate-spin" style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #10b981', borderRadius: '50%', margin: '0 auto' }} />
                    <p style={{ color: '#6b7280', marginTop: '16px' }}>Cargando evento...</p>
                </div>
            </div>
        );
    }

    if (!evento) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Evento no encontrado</div>;
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '10px',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={20} color="#374151" />
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                            {evento.nombre}
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
                            Plantilla del Evento
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSaveEvento}
                    disabled={saving}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.2s'
                    }}
                >
                    <Save size={18} />
                    Guardar Cambios
                </button>
            </div>

            {/* ==================== FICHA TÉCNICA ==================== */}
            <CollapsibleSection title="FICHA TÉCNICA EVENTO" icon={ClipboardList} color="#047857" defaultOpen={true}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    <FormField label="Nombre" required>
                        <input
                            type="text"
                            value={evento.nombre}
                            onChange={(e) => setEvento({ ...evento, nombre: e.target.value })}
                            style={inputStyle}
                        />
                    </FormField>
                    <FormField label="Fecha">
                        <input
                            type="date"
                            value={evento.fecha_evento}
                            onChange={(e) => setEvento({ ...evento, fecha_evento: e.target.value })}
                            style={inputStyle}
                        />
                    </FormField>
                    <FormField label="Empresa Colaboradora">
                        <input
                            type="text"
                            value={evento.empresa_colaboradora || ''}
                            onChange={(e) => setEvento({ ...evento, empresa_colaboradora: e.target.value })}
                            style={inputStyle}
                            placeholder="Empresa..."
                        />
                    </FormField>
                    <FormField label="Tipo">
                        <select
                            value={evento.tipo}
                            onChange={(e) => setEvento({ ...evento, tipo: e.target.value })}
                            style={selectStyle}
                        >
                            <option value="individual">Individual</option>
                            <option value="colectivo_centros">Todos los Centros</option>
                            <option value="colectivo">Colectivo</option>
                        </select>
                    </FormField>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
                    <FormField label="Modelo Económico">
                        <select
                            value={evento.modelo_economico}
                            onChange={(e) => setEvento({ ...evento, modelo_economico: e.target.value })}
                            style={selectStyle}
                        >
                            <option value="gratuito">Gratuito</option>
                            <option value="pago">De Pago</option>
                        </select>
                    </FormField>
                    {evento.modelo_economico === 'pago' && (
                        <FormField label="Precio (€)">
                            <input
                                type="number"
                                value={evento.precio || 0}
                                onChange={(e) => setEvento({ ...evento, precio: Number(e.target.value) })}
                                style={inputStyle}
                            />
                        </FormField>
                    )}
                    <FormField label="Periodicidad">
                        <select
                            value={evento.periodicidad}
                            onChange={(e) => setEvento({ ...evento, periodicidad: e.target.value })}
                            style={selectStyle}
                        >
                            <option value="unico">Único</option>
                            <option value="anual">Anual</option>
                            <option value="trimestral">Trimestral</option>
                            <option value="mensual">Mensual</option>
                        </select>
                    </FormField>
                    <FormField label="Asistencia No Socios">
                        <select
                            value={evento.asistencia_no_socios ? 'si' : 'no'}
                            onChange={(e) => setEvento({ ...evento, asistencia_no_socios: e.target.value === 'si' })}
                            style={selectStyle}
                        >
                            <option value="no">No</option>
                            <option value="si">Sí</option>
                        </select>
                    </FormField>
                </div>

                {/* Plazas Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                    marginTop: '24px',
                    padding: '20px',
                    backgroundColor: '#ecfdf5',
                    borderRadius: '10px',
                    border: '1px solid #a7f3d0'
                }}>
                    <FormField label="Nº Plazas Máximas">
                        <input
                            type="number"
                            value={evento.plazas_max || ''}
                            onChange={(e) => setEvento({ ...evento, plazas_max: Number(e.target.value) })}
                            style={{ ...inputStyle, backgroundColor: 'white' }}
                        />
                    </FormField>
                    <FormField label="Nº Plazas Esperadas">
                        <input
                            type="number"
                            value={evento.plazas_esperadas || ''}
                            onChange={(e) => setEvento({ ...evento, plazas_esperadas: Number(e.target.value) })}
                            style={{ ...inputStyle, backgroundColor: 'white' }}
                        />
                    </FormField>
                    <FormField label="Nº Plazas Reales">
                        <input
                            type="number"
                            value={evento.plazas_reales || ''}
                            onChange={(e) => setEvento({ ...evento, plazas_reales: Number(e.target.value) })}
                            style={{ ...inputStyle, backgroundColor: 'white' }}
                        />
                    </FormField>
                </div>

                {/* Descripción y Localización */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
                    <FormField label="Descripción del Evento" span={1}>
                        <textarea
                            value={evento.descripcion || ''}
                            onChange={(e) => setEvento({ ...evento, descripcion: e.target.value })}
                            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                            placeholder="Descripción detallada del evento..."
                        />
                    </FormField>
                    <div>
                        <FormField label="Localización">
                            <input
                                type="text"
                                value={evento.localizacion || ''}
                                onChange={(e) => setEvento({ ...evento, localizacion: e.target.value })}
                                style={inputStyle}
                                placeholder="Centro, ciudad..."
                            />
                        </FormField>
                        <div style={{ marginTop: '20px' }}>
                            <FormField label="Fecha Límite Inscripción">
                                <input
                                    type="date"
                                    value={evento.fecha_limite_inscripcion || ''}
                                    onChange={(e) => setEvento({ ...evento, fecha_limite_inscripcion: e.target.value })}
                                    style={inputStyle}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* Enlaces y Observaciones */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                    <FormField label="Enlace a Contenido Multimedia">
                        <input
                            type="url"
                            value={evento.enlace_multimedia || ''}
                            onChange={(e) => setEvento({ ...evento, enlace_multimedia: e.target.value })}
                            style={inputStyle}
                            placeholder="https://..."
                        />
                    </FormField>
                    <FormField label="Observaciones">
                        <input
                            type="text"
                            value={evento.observaciones || ''}
                            onChange={(e) => setEvento({ ...evento, observaciones: e.target.value })}
                            style={inputStyle}
                            placeholder="Notas adicionales..."
                        />
                    </FormField>
                </div>
            </CollapsibleSection>

            {/* ==================== SERVICIOS ADICIONALES ==================== */}
            <CollapsibleSection title="SERVICIOS ADICIONALES" icon={MapPin} color="#059669" defaultOpen={false}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Tipo</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Empresa</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Localización</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: '120px' }}>Coste (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {['Alojamiento', 'Restaurante', 'Transporte', 'Otro'].map((tipo, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 500, color: '#374151' }}>{tipo}</td>
                                <td style={{ padding: '8px' }}>
                                    <input type="text" style={{ ...inputStyle, padding: '10px 12px' }} placeholder="Empresa..." />
                                </td>
                                <td style={{ padding: '8px' }}>
                                    <input type="text" style={{ ...inputStyle, padding: '10px 12px' }} placeholder="Localización..." />
                                </td>
                                <td style={{ padding: '8px' }}>
                                    <input type="number" style={{ ...inputStyle, padding: '10px 12px' }} placeholder="0" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CollapsibleSection>

            {/* ==================== ASISTENTES ==================== */}
            <CollapsibleSection title={`ASISTENTES (${participantes.length}${evento?.plazas_max ? `/${evento.plazas_max}` : ''})`} icon={Users} color="#84cc16" defaultOpen={false}>
                {/* Capacity Warning Modal */}
                {showCapacityWarning && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            maxWidth: '400px',
                            textAlign: 'center',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}>
                            <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
                            <h3 style={{ margin: '0 0 12px', color: '#111827' }}>⚠️ Plazas Completas</h3>
                            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                                Se ha alcanzado el máximo de <strong>{evento?.plazas_max}</strong> plazas.
                                ¿Deseas ampliar las plazas para incluir este asistente?
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setShowCapacityWarning(false)}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmExpandCapacity}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#84cc16',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Ampliar +10 plazas
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Participantes List Modal */}
                {showParticipantesModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            width: '90%',
                            maxWidth: '800px',
                            maxHeight: '80vh',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '20px 24px',
                                borderBottom: '1px solid #e5e7eb',
                                backgroundColor: '#f7fee7'
                            }}>
                                <h3 style={{ margin: 0, color: '#4d7c0f' }}>
                                    Lista de Asistentes ({participantes.length}{evento?.plazas_max ? `/${evento.plazas_max}` : ''})
                                </h3>
                                <button
                                    onClick={() => setShowParticipantesModal(false)}
                                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}
                                >
                                    ×
                                </button>
                            </div>
                            <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f9fafb' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>#</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>NOMBRE</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>EMAIL</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>TELÉFONO</th>
                                            <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>ASISTIÓ</th>
                                            <th style={{ padding: '12px', width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participantes.map((p, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '12px', color: '#6b7280' }}>{idx + 1}</td>
                                                <td style={{ padding: '12px', fontWeight: 500 }}>{p.nombre || '-'}</td>
                                                <td style={{ padding: '12px', color: '#6b7280' }}>{p.email || '-'}</td>
                                                <td style={{ padding: '12px', color: '#6b7280' }}>{p.telefono || '-'}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => toggleAsistencia(idx)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: p.asistio ? '#dcfce7' : '#f3f4f6',
                                                            color: p.asistio ? '#16a34a' : '#6b7280',
                                                            border: `1px solid ${p.asistio ? '#16a34a' : '#d1d5db'}`,
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        {p.asistio ? '✓ Sí' : 'No'}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <button
                                                        onClick={() => removeParticipante(idx)}
                                                        style={{ padding: '6px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={14} color="#dc2626" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {participantes.length === 0 && (
                                            <tr>
                                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                                                    No hay asistentes registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '16px', color: '#6b7280', fontSize: '14px' }}>
                                    <span><strong>{participantes.length}</strong> inscritos</span>
                                    <span style={{ color: '#16a34a' }}><strong>{participantes.filter(p => p.asistio).length}</strong> asistieron</span>
                                </div>
                                <button
                                    onClick={saveParticipantes}
                                    disabled={saving}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#84cc16',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Add Form + Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '20px',
                    alignItems: 'start'
                }}>
                    {/* Quick Add Form */}
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f7fee7',
                        borderRadius: '12px',
                        border: '1px solid #d9f99d'
                    }}>
                        <h4 style={{ margin: '0 0 16px', color: '#4d7c0f', fontWeight: 600, fontSize: '14px' }}>
                            ➕ AÑADIR ASISTENTE RÁPIDO
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>Nombre *</label>
                                <input
                                    type="text"
                                    value={quickAddName}
                                    onChange={(e) => setQuickAddName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && quickAddParticipante()}
                                    style={{ ...inputStyle, padding: '10px 12px', backgroundColor: 'white' }}
                                    placeholder="Nombre completo..."
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>Email</label>
                                <input
                                    type="email"
                                    value={quickAddEmail}
                                    onChange={(e) => setQuickAddEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && quickAddParticipante()}
                                    style={{ ...inputStyle, padding: '10px 12px', backgroundColor: 'white' }}
                                    placeholder="email@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>Teléfono</label>
                                <input
                                    type="tel"
                                    value={quickAddTelefono}
                                    onChange={(e) => setQuickAddTelefono(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && quickAddParticipante()}
                                    style={{ ...inputStyle, padding: '10px 12px', backgroundColor: 'white' }}
                                    placeholder="600..."
                                />
                            </div>
                            <button
                                onClick={() => quickAddParticipante()}
                                disabled={addingParticipante || !quickAddName.trim()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: addingParticipante ? '#9ca3af' : '#84cc16',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: addingParticipante ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Plus size={16} />
                                {addingParticipante ? 'Añadiendo...' : 'Añadir'}
                            </button>
                        </div>

                        {/* Payment checkbox for paid events */}
                        {evento?.modelo_economico === 'pago' && (
                            <div style={{
                                marginTop: '12px',
                                padding: '12px 16px',
                                backgroundColor: quickAddHaPagado ? '#dcfce7' : '#fef3c7',
                                borderRadius: '8px',
                                border: `2px solid ${quickAddHaPagado ? '#16a34a' : '#f59e0b'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <input
                                    type="checkbox"
                                    id="haPagado"
                                    checked={quickAddHaPagado}
                                    onChange={(e) => setQuickAddHaPagado(e.target.checked)}
                                    style={{ width: '20px', height: '20px', accentColor: '#16a34a', cursor: 'pointer' }}
                                />
                                <label htmlFor="haPagado" style={{ cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 500, color: quickAddHaPagado ? '#16a34a' : '#92400e' }}>
                                        {quickAddHaPagado ? '✅ Pago confirmado' : '💰 ¿Ha pagado la inscripción?'}
                                    </span>
                                    <span style={{
                                        padding: '4px 12px',
                                        backgroundColor: 'white',
                                        borderRadius: '20px',
                                        fontWeight: 700,
                                        color: '#16a34a',
                                        fontSize: '14px'
                                    }}>
                                        {evento.precio?.toFixed(2)} €
                                    </span>
                                </label>
                            </div>
                        )}

                        {evento?.plazas_max && participantes.length >= evento.plazas_max && (
                            <div style={{
                                marginTop: '12px',
                                padding: '8px 12px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '6px',
                                color: '#92400e',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <AlertTriangle size={16} />
                                Plazas completas ({participantes.length}/{evento.plazas_max})
                            </div>
                        )}
                    </div>

                    {/* Stats + View List Button */}
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        textAlign: 'center',
                        minWidth: '180px'
                    }}>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: '#84cc16' }}>
                            {participantes.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                            {evento?.plazas_max ? `de ${evento.plazas_max} plazas` : 'inscritos'}
                        </div>
                        {evento?.plazas_max && (
                            <div style={{
                                height: '6px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '3px',
                                overflow: 'hidden',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(100, (participantes.length / evento.plazas_max) * 100)}%`,
                                    backgroundColor: participantes.length >= evento.plazas_max ? '#f59e0b' : '#84cc16',
                                    borderRadius: '3px',
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                        )}
                        <button
                            onClick={() => setShowParticipantesModal(true)}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: '#f7fee7',
                                color: '#4d7c0f',
                                border: '1px solid #d9f99d',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '13px',
                                width: '100%'
                            }}
                        >
                            Ver Lista Completa
                        </button>
                    </div>
                </div>

                {/* Recent Additions Preview */}
                {participantes.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h4 style={{ margin: '0 0 12px', color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>
                            ÚLTIMOS AÑADIDOS
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {participantes.slice(-5).reverse().map((p, idx) => (
                                <span key={idx} style={{
                                    padding: '6px 12px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    color: '#374151'
                                }}>
                                    {p.nombre}
                                </span>
                            ))}
                            {participantes.length > 5 && (
                                <span style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    color: '#6b7280'
                                }}>
                                    +{participantes.length - 5} más
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CollapsibleSection>

            {/* ==================== ENCUESTAS ==================== */}
            <CollapsibleSection title={`ENCUESTAS (${encuestas.length})`} icon={MessageSquare} color="#f59e0b" defaultOpen={false}>
                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706' }}>{encuestaResumen.media_general || 0}</div>
                        <div style={{ fontSize: '11px', color: '#92400e' }}>Media General</div>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>{encuestaResumen.recomendaria_pct || 0}%</div>
                        <div style={{ fontSize: '11px', color: '#047857' }}>Recomendarían</div>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb' }}>{encuestas.length}</div>
                        <div style={{ fontSize: '11px', color: '#1e40af' }}>Encuestas</div>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#6b7280' }}>{participantesSinEncuesta.length}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Pendientes</div>
                    </div>
                </div>

                {/* Add Survey Form */}
                {!showEncuestaForm ? (
                    <button
                        onClick={() => setShowEncuestaForm(true)}
                        disabled={participantesSinEncuesta.length === 0}
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: participantesSinEncuesta.length > 0 ? '#fef3c7' : '#f3f4f6',
                            border: '2px dashed #fbbf24',
                            borderRadius: '12px',
                            cursor: participantesSinEncuesta.length > 0 ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: participantesSinEncuesta.length > 0 ? '#92400e' : '#9ca3af',
                            fontWeight: 600,
                            marginBottom: '20px'
                        }}
                    >
                        <Plus size={20} />
                        {participantesSinEncuesta.length > 0
                            ? `Registrar Encuesta (${participantesSinEncuesta.length} asistentes pendientes)`
                            : 'Todos los asistentes tienen encuesta'}
                    </button>
                ) : (
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#fffbeb',
                        borderRadius: '12px',
                        border: '1px solid #fde68a',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ margin: 0, color: '#92400e', fontWeight: 600 }}>📋 Nueva Encuesta de Satisfacción</h4>
                            <button
                                onClick={() => { setShowEncuestaForm(false); setSelectedParticipanteId(null); }}
                                style={{ padding: '6px 12px', backgroundColor: '#fef3c7', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                            >
                                Cancelar
                            </button>
                        </div>

                        {/* Participant Selection */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#78350f' }}>
                                Seleccionar Asistente *
                            </label>
                            <select
                                value={selectedParticipanteId || ''}
                                onChange={(e) => handleParticipanteSelectForEncuesta(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #fde68a',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">-- Selecciona un asistente --</option>
                                {participantesSinEncuesta.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre} {p.asistio ? '✅' : '❓'}
                                    </option>
                                ))}
                            </select>
                            <p style={{ fontSize: '11px', color: '#92400e', marginTop: '4px' }}>
                                Al seleccionar se marcará automáticamente como "asistió"
                            </p>
                        </div>

                        {selectedParticipanteId && (
                            <>
                                {/* Ratings */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    {[
                                        { key: 'puntuacion_general', label: 'General' },
                                        { key: 'puntuacion_organizacion', label: 'Organización' },
                                        { key: 'puntuacion_contenido', label: 'Contenido' }
                                    ].map(({ key, label }) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#78350f', marginBottom: '6px' }}>{label}</label>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setEncuestaForm({ ...encuestaForm, [key]: star })}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                                                    >
                                                        <Star
                                                            size={24}
                                                            fill={((encuestaForm as any)[key] || 0) >= star ? '#f59e0b' : 'transparent'}
                                                            color={((encuestaForm as any)[key] || 0) >= star ? '#f59e0b' : '#d1d5db'}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recommend */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#78350f', marginBottom: '6px' }}>¿Recomendaría?</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setEncuestaForm({ ...encuestaForm, recomendaria: true })}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                border: `2px solid ${encuestaForm.recomendaria ? '#16a34a' : '#e5e7eb'}`,
                                                borderRadius: '8px',
                                                backgroundColor: encuestaForm.recomendaria ? '#dcfce7' : 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                fontWeight: 500
                                            }}
                                        >
                                            <ThumbsUp size={18} color={encuestaForm.recomendaria ? '#16a34a' : '#9ca3af'} /> Sí
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEncuestaForm({ ...encuestaForm, recomendaria: false })}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                border: `2px solid ${encuestaForm.recomendaria === false ? '#dc2626' : '#e5e7eb'}`,
                                                borderRadius: '8px',
                                                backgroundColor: encuestaForm.recomendaria === false ? '#fee2e2' : 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                fontWeight: 500
                                            }}
                                        >
                                            <ThumbsDown size={18} color={encuestaForm.recomendaria === false ? '#dc2626' : '#9ca3af'} /> No
                                        </button>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#78350f', marginBottom: '6px' }}>Comentarios</label>
                                    <textarea
                                        value={encuestaForm.comentarios || ''}
                                        onChange={(e) => setEncuestaForm({ ...encuestaForm, comentarios: e.target.value })}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #fde68a', borderRadius: '8px', minHeight: '60px', fontSize: '14px' }}
                                        placeholder="Opinión del asistente..."
                                    />
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={saveEncuesta}
                                    disabled={savingEncuesta}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: savingEncuesta ? '#9ca3af' : '#f59e0b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: savingEncuesta ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {savingEncuesta ? 'Guardando...' : '✅ Guardar Encuesta'}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Recent Surveys List */}
                {encuestas.length > 0 && (
                    <div>
                        <h4 style={{ margin: '0 0 12px', color: '#92400e', fontSize: '13px', fontWeight: 500 }}>
                            ENCUESTAS REGISTRADAS
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {encuestas.slice(0, 5).map(e => (
                                <div key={e.id} style={{
                                    padding: '12px 16px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 500, color: '#111827' }}>{e.participante_nombre}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <StarRating value={e.puntuacion_general || 0} size={14} readOnly />
                                            {e.recomendaria ? (
                                                <span style={{ fontSize: '12px', color: '#16a34a' }}>👍 Recomienda</span>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#dc2626' }}>👎 No recomienda</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {encuestas.length > 5 && (
                                <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', padding: '8px' }}>
                                    +{encuestas.length - 5} encuestas más
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CollapsibleSection>

            {/* ==================== CHECKLIST de TAREAS ==================== */}
            <CollapsibleSection title="CHECKLIST DE TAREAS" icon={CheckCircle} color="#8b5cf6" defaultOpen={true}>
                {checklist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        <CheckCircle size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
                        <p style={{ margin: 0 }}>No hay tareas asignadas a este evento.</p>
                        <p style={{ margin: '8px 0 0', fontSize: '13px' }}>Las tareas se generan automáticamente al crear el evento.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Summary */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>{checklist.filter(c => c.completado).length}</div>
                                <div style={{ fontSize: '11px', color: '#6b7280' }}>Completadas</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>{checklist.filter(c => !c.completado && new Date(c.fecha_limite) >= new Date()).length}</div>
                                <div style={{ fontSize: '11px', color: '#6b7280' }}>Pendientes</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>{checklist.filter(c => !c.completado && new Date(c.fecha_limite) < new Date()).length}</div>
                                <div style={{ fontSize: '11px', color: '#6b7280' }}>Vencidas</div>
                            </div>
                        </div>

                        {/* Task list */}
                        {checklist.map(item => {
                            const isOverdue = !item.completado && new Date(item.fecha_limite) < new Date();
                            const isUpcoming = !item.completado && !isOverdue &&
                                (new Date(item.fecha_limite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 3;

                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        backgroundColor: item.completado ? '#f0fdf4' : isOverdue ? '#fef2f2' : isUpcoming ? '#fffbeb' : 'white',
                                        border: `2px solid ${item.completado ? '#86efac' : isOverdue ? '#fca5a5' : isUpcoming ? '#fcd34d' : '#e5e7eb'}`,
                                        borderRadius: '10px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <button
                                        onClick={() => item.id && toggleChecklistItem(item.id, !item.completado)}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            border: `2px solid ${item.completado ? '#16a34a' : isOverdue ? '#dc2626' : '#d1d5db'}`,
                                            backgroundColor: item.completado ? '#16a34a' : 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        {item.completado && <CheckCircle size={16} color="white" />}
                                    </button>

                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontWeight: 600,
                                            color: item.completado ? '#16a34a' : isOverdue ? '#dc2626' : '#111827',
                                            textDecoration: item.completado ? 'line-through' : 'none'
                                        }}>
                                            {item.nombre}
                                        </div>
                                        {item.descripcion && (
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                                {item.descripcion}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: item.completado ? '#16a34a' : isOverdue ? '#dc2626' : isUpcoming ? '#d97706' : '#6b7280'
                                        }}>
                                            {isOverdue && !item.completado && '⚠️ '}
                                            {new Date(item.fecha_limite).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                        </div>
                                        {item.completado && item.completado_at && (
                                            <div style={{ fontSize: '10px', color: '#16a34a' }}>
                                                ✓ {new Date(item.completado_at).toLocaleDateString('es-ES')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CollapsibleSection>

            {/* ==================== CONTABILIDAD ==================== */}
            <CollapsibleSection title="CONTABILIDAD EVENTO" icon={Euro} color="#10b981" defaultOpen={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, color: '#047857', fontWeight: 600, fontSize: '15px' }}>GASTOS</h4>
                    <button
                        onClick={addGasto}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            backgroundColor: '#d1fae5',
                            color: '#047857',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: '13px'
                        }}
                    >
                        <Plus size={16} /> Añadir Gasto
                    </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#ecfdf5' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#047857' }}>PARTIDA</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#047857', width: '140px' }}>FECHA</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#047857', width: '120px' }}>COSTE (€)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#047857', width: '160px' }}>FACTURA</th>
                            <th style={{ padding: '12px', width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {gastos.map((gasto, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '8px' }}>
                                    <input
                                        type="text"
                                        value={gasto.partida}
                                        onChange={(e) => {
                                            const newGastos = [...gastos];
                                            newGastos[idx].partida = e.target.value;
                                            setGastos(newGastos);
                                        }}
                                        style={{ ...inputStyle, padding: '10px 12px' }}
                                        placeholder="Descripción del gasto..."
                                    />
                                </td>
                                <td style={{ padding: '8px' }}>
                                    <input
                                        type="date"
                                        value={gasto.fecha || ''}
                                        onChange={(e) => {
                                            const newGastos = [...gastos];
                                            newGastos[idx].fecha = e.target.value;
                                            setGastos(newGastos);
                                        }}
                                        style={{ ...inputStyle, padding: '10px 12px' }}
                                    />
                                </td>
                                <td style={{ padding: '8px' }}>
                                    <input
                                        type="number"
                                        value={gasto.coste}
                                        onChange={(e) => {
                                            const newGastos = [...gastos];
                                            newGastos[idx].coste = Number(e.target.value);
                                            setGastos(newGastos);
                                        }}
                                        style={{ ...inputStyle, padding: '10px 12px' }}
                                    />
                                </td>
                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                    <input
                                        type="file"
                                        ref={el => fileInputRefs.current[idx] = el}
                                        style={{ display: 'none' }}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadFactura(idx, file);
                                        }}
                                    />
                                    {gasto.enlace_factura ? (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <a
                                                href={gasto.enlace_factura}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: '#dbeafe',
                                                    color: '#2563eb',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <ExternalLink size={14} /> Ver
                                            </a>
                                            <button
                                                onClick={() => fileInputRefs.current[idx]?.click()}
                                                style={{
                                                    padding: '8px',
                                                    backgroundColor: '#f3f4f6',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Upload size={14} color="#6b7280" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRefs.current[idx]?.click()}
                                            disabled={uploadingFactura === idx}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '8px 16px',
                                                backgroundColor: '#f3f4f6',
                                                color: '#374151',
                                                border: '1px dashed #d1d5db',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                margin: '0 auto'
                                            }}
                                        >
                                            <Upload size={14} />
                                            {uploadingFactura === idx ? 'Subiendo...' : 'Subir'}
                                        </button>
                                    )}
                                </td>
                                <td style={{ padding: '8px' }}>
                                    <button
                                        onClick={() => removeGasto(idx)}
                                        style={{ padding: '8px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={14} color="#dc2626" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {gastos.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                                    No hay gastos registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '10px' }}>
                    <span style={{ fontWeight: 600, color: '#92400e' }}>TOTAL GASTOS:</span>
                    <span style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626' }}>{totalGastos.toFixed(2)} €</span>
                </div>

                <button
                    onClick={saveGastos}
                    style={{
                        marginTop: '16px',
                        padding: '12px 24px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Guardar Gastos
                </button>
            </CollapsibleSection>

            {/* ==================== RESULTADO FINAL ==================== */}
            <CollapsibleSection title="RESULTADO FINAL" icon={Star} color="#f59e0b" defaultOpen={false}>
                {/* KPIs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                        <Users size={28} color="#16a34a" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '32px', fontWeight: 700, color: '#16a34a' }}>{participantesCount}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Asistentes</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                        <TrendingUp size={28} color="#16a34a" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '32px', fontWeight: 700, color: '#16a34a' }}>{totalIngresos.toFixed(0)} €</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Ingresos</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                        <TrendingDown size={28} color="#dc2626" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '32px', fontWeight: 700, color: '#dc2626' }}>{totalGastos.toFixed(0)} €</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Gastos</div>
                    </div>
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        backgroundColor: balance >= 0 ? '#dcfce7' : '#fee2e2',
                        borderRadius: '12px',
                        border: `2px solid ${balance >= 0 ? '#16a34a' : '#dc2626'}`
                    }}>
                        <Euro size={28} color={balance >= 0 ? '#16a34a' : '#dc2626'} style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '32px', fontWeight: 700, color: balance >= 0 ? '#16a34a' : '#dc2626' }}>
                            {balance >= 0 ? '+' : ''}{balance.toFixed(0)} €
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Balance</div>
                    </div>
                </div>

                {/* Valoraciones */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                    {/* Valoración Encargado */}
                    <div style={{ padding: '24px', backgroundColor: '#fef3c7', borderRadius: '12px', border: '1px solid #fcd34d' }}>
                        <h4 style={{ margin: '0 0 16px', color: '#92400e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={20} /> Valoración del Encargado
                        </h4>
                        <StarRating
                            value={informe.valoracion_encargado || 0}
                            onChange={(value) => setInforme({ ...informe, valoracion_encargado: value })}
                            size={32}
                        />
                        <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#92400e' }}>
                            Valoración personal del organizador del evento
                        </p>
                    </div>

                    {/* Valoración Usuarios (Encuestas) */}
                    <div style={{ padding: '24px', backgroundColor: '#dbeafe', borderRadius: '12px', border: '1px solid #93c5fd' }}>
                        <h4 style={{ margin: '0 0 16px', color: '#1e40af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={20} /> Valoración de Usuarios
                        </h4>
                        {encuestaResumen.total > 0 ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <StarRating value={Math.round(encuestaResumen.media_general)} readOnly size={28} />
                                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#1e40af' }}>
                                        {encuestaResumen.media_general}/5
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '13px', color: '#1e40af' }}>
                                    Basado en {encuestaResumen.total} encuestas • {encuestaResumen.recomendaria_pct}% recomendaría
                                </p>
                            </>
                        ) : (
                            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                                No hay encuestas registradas aún
                            </p>
                        )}
                    </div>
                </div>
            </CollapsibleSection>

            {/* ==================== INFORME FINAL ==================== */}
            <CollapsibleSection title="INFORME FINAL" icon={CheckCircle2} color="#22c55e" defaultOpen={false}>
                {/* Resumen rápido arriba */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px',
                    marginBottom: '24px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{participantesCount}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Asistentes</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: balance >= 0 ? '#16a34a' : '#dc2626' }}>
                            {balance >= 0 ? '+' : ''}{balance.toFixed(0)}€
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Balance</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#f59e0b' }}>
                            {informe.valoracion_encargado || '-'}/5
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Val. Encargado</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#3b82f6' }}>
                            {encuestaResumen.total > 0 ? `${encuestaResumen.media_general}/5` : '-'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Val. Usuarios</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#6b7280' }}>{encuestaResumen.total}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Encuestas</div>
                    </div>
                </div>

                <h4 style={{ margin: '0 0 16px', color: '#374151', fontWeight: 600 }}>Evaluación de Objetivos</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { key: 'objetivo_comunidad', label: 'Comunidad' },
                        { key: 'objetivo_ventas', label: 'Ventas' },
                        { key: 'objetivo_organizacion', label: 'Organización' },
                        { key: 'objetivo_participacion', label: 'Participación' }
                    ].map(obj => (
                        <div key={obj.key} style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: '#047857' }}>{obj.label}</label>
                            <select
                                value={(informe as any)[obj.key] || ''}
                                onChange={(e) => setInforme({ ...informe, [obj.key]: e.target.value })}
                                style={selectStyle}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="no_cumplido">❌ No Cumplido</option>
                                <option value="parcial">⚠️ Parcial</option>
                                <option value="cumplido">✅ Cumplido</option>
                                <option value="superado">🏆 Superado</option>
                            </select>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <FormField label="Conclusiones">
                        <textarea
                            value={informe.conclusiones || ''}
                            onChange={(e) => setInforme({ ...informe, conclusiones: e.target.value })}
                            style={{ ...inputStyle, minHeight: '100px' }}
                            placeholder="Resumen y conclusiones del evento..."
                        />
                    </FormField>
                    <FormField label="Aprendizajes">
                        <textarea
                            value={informe.aprendizajes || ''}
                            onChange={(e) => setInforme({ ...informe, aprendizajes: e.target.value })}
                            style={{ ...inputStyle, minHeight: '100px' }}
                            placeholder="Qué hemos aprendido..."
                        />
                    </FormField>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    <FormField label="✅ Pros">
                        <textarea
                            value={informe.pros || ''}
                            onChange={(e) => setInforme({ ...informe, pros: e.target.value })}
                            style={{ ...inputStyle, minHeight: '80px', borderColor: '#86efac' }}
                            placeholder="Aspectos positivos..."
                        />
                    </FormField>
                    <FormField label="❌ Contras">
                        <textarea
                            value={informe.contras || ''}
                            onChange={(e) => setInforme({ ...informe, contras: e.target.value })}
                            style={{ ...inputStyle, minHeight: '80px', borderColor: '#fca5a5' }}
                            placeholder="Aspectos a mejorar..."
                        />
                    </FormField>
                </div>

                <button
                    onClick={saveInforme}
                    style={{
                        marginTop: '24px',
                        padding: '12px 28px',
                        background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    Guardar Informe
                </button>
            </CollapsibleSection>
        </div>
    );
};

export default EventTemplate;
