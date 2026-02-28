import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { eventService } from '../services/eventService';
import { ui } from '../utils/ui';
import {
    Evento,
    Gasto,
    Informe,
    EncuestaResumen,
    Participante,
    Encuesta,
    ChecklistItem
} from '../components/events/template/EventTemplateTypes';

export const useEventTemplate = (eventId: number) => {
    const [evento, setEvento] = useState<Evento | null>(null);
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [informe, setInforme] = useState<Informe>({});
    const [encuestaResumen, setEncuestaResumen] = useState<EncuestaResumen>({
        total: 0,
        media_general: 0,
        media_organizacion: 0,
        media_contenido: 0,
        recomendaria_pct: 0
    });
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

    useEffect(() => {
        loadEventData();
    }, [eventId]);

    const loadEventData = async () => {
        setLoading(true);
        try {
            // Load evento
            const eventoData = await eventService.eventos.getById(eventId);
            if (eventoData) setEvento(eventoData);

            // Load gastos
            const gastosData = await eventService.gastos.getByEventId(eventId);
            setGastos(gastosData);

            // Load informe
            const informeData = await eventService.informes.getByEventId(eventId);
            if (informeData) setInforme(informeData);

            // Load participantes
            const participantesData = await eventService.participantes.getByEventId(eventId);
            setParticipantes(participantesData);
            setParticipantesCount(participantesData.length);

            // Load encuestas resumen
            const encuestasData = await eventService.encuestas.getByEventId(eventId);
            if (encuestasData) {
                setEncuestas(encuestasData);
                if (encuestasData.length > 0) {
                    const total = encuestasData.length;
                    const media_general = encuestasData.reduce((sum: number, e: Encuesta) => sum + (e.puntuacion_general || 0), 0) / total;
                    const media_organizacion = encuestasData.reduce((sum: number, e: Encuesta) => sum + (e.puntuacion_organizacion || 0), 0) / total;
                    const media_contenido = encuestasData.reduce((sum: number, e: Encuesta) => sum + (e.puntuacion_contenido || 0), 0) / total;
                    const recomendaria_count = encuestasData.filter((e: Encuesta) => e.recomendaria).length;
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
            const checklistData = await eventService.checklist.getByEventId(eventId);
            setChecklist(checklistData);

        } catch (error) {
            console.error('Error loading event data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle checklist item
    const toggleChecklistItem = async (itemId: number, completed: boolean) => {
        try {
            await eventService.checklist.toggleCompleted(itemId, completed);

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
            await eventService.eventos.update(eventId, {
                ...evento,
                updated_at: new Date().toISOString()
            });
            ui.success('✅ Evento guardado correctamente');
        } catch (error) {
            console.error('Error saving evento:', error);
            ui.error('❌ Error al guardar');
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
            await eventService.gastos.delete(gasto.id);
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

            ui.success('✅ Factura subida correctamente');
        } catch (error) {
            console.error('Error uploading factura:', error);
            ui.error('❌ Error al subir la factura. Asegúrate de que existe el bucket "eventos" en Supabase Storage.');
        } finally {
            setUploadingFactura(null);
        }
    };

    const saveGastos = async () => {
        setSaving(true);
        try {
            // 🔧 REFACTORIZADO: Usar UPSERT para evitar pérdida de gastos al editar concurrentemente
            const gastosToUpsert = gastos.map(g => {
                const gastoDB: { evento_id: number; partida: string; fecha: string; coste: number; enlace_factura: string; id?: string | number } = {
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
                const data = await eventService.gastos.upsert(gastosToUpsert);

                if (data) {
                    // Actualizar estado local con IDs generados
                    const updatedGastos = (data as Record<string, unknown>[]).map((g) => ({
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

            ui.success('✅ Gastos guardados correctamente');
        } catch (error) {
            console.error('Error saving gastos:', error);
            ui.error('❌ Error al guardar gastos');
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
            await eventService.participantes.delete(participante.id);
        }
        const newList = participantes.filter((_, i) => i !== index);
        setParticipantes(newList);
        setParticipantesCount(newList.length);
    };

    const updateParticipante = (index: number, field: keyof Participante, value: Participante[keyof Participante]) => {
        const newParticipantes = [...participantes];
        (newParticipantes[index] as Record<string, unknown>)[field as string] = value;
        setParticipantes(newParticipantes);
    };

    const toggleAsistencia = async (index: number) => {
        const participante = participantes[index];
        const newValue = !participante.asistio;
        const newParticipantes = [...participantes];
        newParticipantes[index].asistio = newValue;
        setParticipantes(newParticipantes);

        if (participante.id) {
            await eventService.participantes.update(participante.id, { asistio: newValue });
        }
    };

    const saveParticipantes = async () => {
        setSaving(true);
        try {
            // 🔧 REFACTORIZADO: Usar UPSERT en lugar de DELETE+INSERT para evitar pérdida de datos
            // Preparar datos para upsert
            const participantesToUpsert = participantes.map(p => {
                // Base del objeto
                const participanteDB: { evento_id: number; nombre: string; email: string; telefono: string; modalidad: string; nombre_equipo: string; asistio: boolean; id?: string | number } = {
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
                const data = await eventService.participantes.upsert(participantesToUpsert);

                // Actualizar estado local con los nuevos datos (especialmente IDs)
                if (data) {
                    // Mapear respuesta de vuelta al formato local
                    const updatedParticipantes = (data as Record<string, unknown>[]).map((p) => ({
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
                await eventService.eventos.update(eventId, {
                    plazas_reales: asistieron,
                    updated_at: new Date().toISOString()
                });

                setEvento({ ...evento, plazas_reales: asistieron });
            }

            ui.success('✅ Asistentes guardados correctamente');
        } catch (error) {
            console.error('Error saving participantes:', error);
            ui.error('❌ Error al guardar asistentes');
        } finally {
            setSaving(false);
        }
    };

    // Quick add participante (saves immediately)
    const quickAddParticipante = async (forceAdd = false) => {
        if (!quickAddName.trim()) {
            ui.info('Por favor, introduce el nombre del asistente');
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

            const data = await eventService.participantes.create(newParticipante as Record<string, unknown>);

            // If paid event and has paid, register the income
            if (evento?.modelo_economico === 'pago' && quickAddHaPagado && evento?.precio) {
                await eventService.ingresos.create({
                    evento_id: eventId,
                    concepto: `Inscripción: ${quickAddName.trim()}`,
                    importe: evento.precio,
                    fecha: new Date().toISOString().split('T')[0],
                    pagado: true
                } as Record<string, unknown>);
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
            ui.error('❌ Error al añadir asistente');
        } finally {
            setAddingParticipante(false);
        }
    };

    const confirmExpandCapacity = async () => {
        if (!evento) return;
        const newMax = (evento.plazas_max || 0) + 10;
        await eventService.eventos.update(eventId, { plazas_max: newMax });
        setEvento({ ...evento, plazas_max: newMax });
        setShowCapacityWarning(false);
        quickAddParticipante(true);
    };

    const saveInforme = async () => {
        setSaving(true);
        try {
            const existingInforme = await eventService.informes.exists(eventId);
            if (existingInforme) {
                await eventService.informes.update(eventId, informe);
            } else {
                await eventService.informes.create({ ...informe, evento_id: eventId } as Record<string, unknown>);
            }
            ui.success('✅ Informe guardado');
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
            const participanteIdx = participantes.findIndex(p => p.id === participanteId);
            if (!participante.asistio && participanteIdx !== -1) {
                toggleAsistencia(participanteIdx);
            }
        }
    };

    const saveEncuesta = async () => {
        if (!selectedParticipanteId || !encuestaForm.participante_nombre) {
            ui.info('Selecciona un asistente');
            return;
        }

        // Check if already has survey
        const existingSurvey = encuestas.find(e => e.participante_id === selectedParticipanteId);
        if (existingSurvey) {
            ui.success('Este asistente ya tiene una encuesta registrada');
            return;
        }

        setSavingEncuesta(true);
        try {
            await eventService.encuestas.create({
                evento_id: eventId,
                participante_id: selectedParticipanteId,
                participante_nombre: encuestaForm.participante_nombre,
                origen: 'crm',
                puntuacion_general: encuestaForm.puntuacion_general || 0,
                puntuacion_organizacion: encuestaForm.puntuacion_organizacion || 0,
                puntuacion_contenido: encuestaForm.puntuacion_contenido || 0,
                recomendaria: encuestaForm.recomendaria,
                comentarios: encuestaForm.comentarios || ''
            } as Record<string, unknown>);

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
            ui.success('✅ Encuesta guardada');
        } catch (error) {
            console.error('Error saving encuesta:', error);
            ui.error('❌ Error al guardar encuesta');
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

    return {
        // State
        evento,
        setEvento,
        gastos,
        setGastos,
        informe,
        setInforme,
        encuestaResumen,
        participantes,
        participantesCount,
        loading,
        saving,
        uploadingFactura,
        fileInputRefs,
        showParticipantesModal,
        setShowParticipantesModal,
        quickAddName,
        setQuickAddName,
        quickAddEmail,
        setQuickAddEmail,
        quickAddTelefono,
        setQuickAddTelefono,
        showCapacityWarning,
        setShowCapacityWarning,
        addingParticipante,
        quickAddHaPagado,
        setQuickAddHaPagado,
        encuestas,
        showEncuestaForm,
        setShowEncuestaForm,
        selectedParticipanteId,
        encuestaForm,
        setEncuestaForm,
        savingEncuesta,
        checklist,
        participantesSinEncuesta,
        totalGastos,
        totalIngresos,
        balance,
        // Handlers
        loadEventData,
        toggleChecklistItem,
        handleSaveEvento,
        addGasto,
        removeGasto,
        handleUploadFactura,
        saveGastos,
        addParticipante,
        removeParticipante,
        updateParticipante,
        toggleAsistencia,
        saveParticipantes,
        quickAddParticipante,
        confirmExpandCapacity,
        saveInforme,
        handleParticipanteSelectForEncuesta,
        saveEncuesta,
    };
};
