import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, ChevronDown, Calendar, User, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Tarea {
    id: number;
    evento_id: number;
    descripcion: string;
    fecha_limite?: string;
    prioridad: string;
    persona_designada_id?: number;
    persona_nombre?: string;
    realizado: boolean;
    observaciones?: string;
    enlaces?: string;
}

interface Evento {
    id: number;
    nombre: string;
}

interface Employee {
    id: number;
    name: string;
}

interface EventTasksBoardProps {
    onBack: () => void;
}

const prioridadColors: { [key: string]: { bg: string; text: string } } = {
    alta: { bg: '#fee2e2', text: '#dc2626' },
    media: { bg: '#fef3c7', text: '#d97706' },
    baja: { bg: '#dcfce7', text: '#16a34a' }
};

export const EventTasksBoard: React.FC<EventTasksBoardProps> = ({ onBack }) => {
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterEvento, setFilterEvento] = useState<number | 'todos'>('todos');
    const [filterRealizado, setFilterRealizado] = useState<'todos' | 'pendientes' | 'completadas'>('pendientes');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load eventos
            const { data: eventosData } = await supabase
                .from('eventos')
                .select('id, nombre')
                .not('estado', 'in', '("finalizado","cancelado")')
                .order('fecha_evento', { ascending: false });
            setEventos(eventosData || []);

            // Load employees for assignment
            const { data: employeesData } = await supabase
                .from('employees')
                .select('id, name')
                .order('name');
            setEmployees(employeesData || []);

            // Load tareas with evento info
            const { data: tareasData } = await supabase
                .from('evento_tareas')
                .select(`
          *,
          eventos!inner(id, nombre),
          employees(name)
        `)
                .order('fecha_limite', { ascending: true });

            const formattedTareas = (tareasData || []).map((t: any) => ({
                ...t,
                persona_nombre: t.employees?.name
            }));
            setTareas(formattedTareas);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRealizado = async (tareaId: number, realizado: boolean) => {
        try {
            await supabase
                .from('evento_tareas')
                .update({
                    realizado: !realizado,
                    completado_at: !realizado ? new Date().toISOString() : null
                })
                .eq('id', tareaId);

            setTareas(tareas.map(t =>
                t.id === tareaId ? { ...t, realizado: !realizado } : t
            ));
        } catch (error) {
            console.error('Error updating tarea:', error);
        }
    };

    const handleDelete = async (tareaId: number) => {
        if (!confirm('¿Eliminar esta tarea?')) return;
        try {
            await supabase.from('evento_tareas').delete().eq('id', tareaId);
            setTareas(tareas.filter(t => t.id !== tareaId));
        } catch (error) {
            console.error('Error deleting tarea:', error);
        }
    };

    const handleUpdateTarea = async (tareaId: number, field: string, value: any) => {
        try {
            await supabase
                .from('evento_tareas')
                .update({ [field]: value })
                .eq('id', tareaId);

            setTareas(tareas.map(t =>
                t.id === tareaId ? { ...t, [field]: value } : t
            ));
        } catch (error) {
            console.error('Error updating tarea:', error);
        }
    };

    const addTarea = async (eventoId: number) => {
        try {
            const { data, error } = await supabase
                .from('evento_tareas')
                .insert([{
                    evento_id: eventoId,
                    descripcion: 'Nueva tarea',
                    prioridad: 'media',
                    realizado: false
                }])
                .select()
                .single();

            if (error) throw error;
            loadData();
        } catch (error) {
            console.error('Error adding tarea:', error);
        }
    };

    const filteredTareas = tareas.filter(t => {
        const matchEvento = filterEvento === 'todos' || t.evento_id === filterEvento;
        const matchRealizado = filterRealizado === 'todos' ||
            (filterRealizado === 'pendientes' && !t.realizado) ||
            (filterRealizado === 'completadas' && t.realizado);
        return matchEvento && matchRealizado;
    });

    // Group by evento
    const groupedTareas = filteredTareas.reduce((acc, tarea) => {
        const eventoId = tarea.evento_id;
        if (!acc[eventoId]) {
            const evento = eventos.find(e => e.id === eventoId);
            acc[eventoId] = { nombre: evento?.nombre || 'Evento', tareas: [] };
        }
        acc[eventoId].tareas.push(tarea);
        return acc;
    }, {} as { [key: number]: { nombre: string; tareas: Tarea[] } });

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    };

    const isOverdue = (dateStr?: string) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date() && new Date(dateStr).toDateString() !== new Date().toDateString();
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
                        Listado de Tareas
                    </h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0' }}>
                        {filteredTareas.filter(t => !t.realizado).length} pendientes / {filteredTareas.length} total
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <select
                    value={filterEvento}
                    onChange={(e) => setFilterEvento(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                    style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white', minWidth: '200px' }}
                >
                    <option value="todos">Todos los eventos</option>
                    {eventos.map(e => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                </select>
                <select
                    value={filterRealizado}
                    onChange={(e) => setFilterRealizado(e.target.value as any)}
                    style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}
                >
                    <option value="pendientes">Pendientes</option>
                    <option value="completadas">Completadas</option>
                    <option value="todos">Todas</option>
                </select>
            </div>

            {/* Tasks grouped by event */}
            {Object.entries(groupedTareas).map(([eventoId, group]) => (
                <div key={eventoId} style={{ marginBottom: '24px', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    {/* Event Header */}
                    <div style={{
                        padding: '16px 20px',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, fontWeight: 600 }}>{group.nombre}</h3>
                        <button
                            onClick={() => addTarea(Number(eventoId))}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            <Plus size={16} /> Añadir Tarea
                        </button>
                    </div>

                    {/* Tasks Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '40px' }}></th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>DESCRIPCIÓN</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '120px' }}>FECHA LÍMITE</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '100px' }}>PRIORIDAD</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '150px' }}>ASIGNADO</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>OBSERVACIONES</th>
                                    <th style={{ padding: '12px', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.tareas.map(tarea => (
                                    <tr key={tarea.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: tarea.realizado ? '#f9fafb' : 'white' }}>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="checkbox"
                                                checked={tarea.realizado}
                                                onChange={() => handleToggleRealizado(tarea.id, tarea.realizado)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16a34a' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="text"
                                                value={tarea.descripcion}
                                                onChange={(e) => handleUpdateTarea(tarea.id, 'descripcion', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: '1px solid transparent',
                                                    borderRadius: '4px',
                                                    fontSize: '14px',
                                                    textDecoration: tarea.realizado ? 'line-through' : 'none',
                                                    color: tarea.realizado ? '#9ca3af' : '#374151',
                                                    backgroundColor: 'transparent'
                                                }}
                                                onFocus={(e) => e.target.style.border = '1px solid #e5e7eb'}
                                                onBlur={(e) => e.target.style.border = '1px solid transparent'}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {isOverdue(tarea.fecha_limite) && !tarea.realizado && (
                                                    <AlertCircle size={14} color="#dc2626" />
                                                )}
                                                <input
                                                    type="date"
                                                    value={tarea.fecha_limite || ''}
                                                    onChange={(e) => handleUpdateTarea(tarea.id, 'fecha_limite', e.target.value)}
                                                    style={{
                                                        padding: '6px',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '4px',
                                                        fontSize: '13px',
                                                        color: isOverdue(tarea.fecha_limite) && !tarea.realizado ? '#dc2626' : '#374151'
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <select
                                                value={tarea.prioridad}
                                                onChange={(e) => handleUpdateTarea(tarea.id, 'prioridad', e.target.value)}
                                                style={{
                                                    padding: '6px 10px',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    backgroundColor: prioridadColors[tarea.prioridad]?.bg || '#f3f4f6',
                                                    color: prioridadColors[tarea.prioridad]?.text || '#6b7280',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="alta">Alta</option>
                                                <option value="media">Media</option>
                                                <option value="baja">Baja</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <select
                                                value={tarea.persona_designada_id || ''}
                                                onChange={(e) => handleUpdateTarea(tarea.id, 'persona_designada_id', e.target.value ? Number(e.target.value) : null)}
                                                style={{
                                                    padding: '6px 10px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    backgroundColor: 'white',
                                                    width: '100%'
                                                }}
                                            >
                                                <option value="">Sin asignar</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="text"
                                                value={tarea.observaciones || ''}
                                                onChange={(e) => handleUpdateTarea(tarea.id, 'observaciones', e.target.value)}
                                                placeholder="Notas..."
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: '1px solid transparent',
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    backgroundColor: 'transparent'
                                                }}
                                                onFocus={(e) => e.target.style.border = '1px solid #e5e7eb'}
                                                onBlur={(e) => e.target.style.border = '1px solid transparent'}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => handleDelete(tarea.id)}
                                                style={{ padding: '6px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={14} color="#dc2626" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {Object.keys(groupedTareas).length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <CheckSquare size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: '#374151', margin: '0 0 8px' }}>No hay tareas</h3>
                    <p style={{ color: '#6b7280' }}>Selecciona un evento y añade tareas</p>
                </div>
            )}
        </div>
    );
};

export default EventTasksBoard;
