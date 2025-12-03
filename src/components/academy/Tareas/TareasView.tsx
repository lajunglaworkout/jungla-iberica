import React, { useState, useEffect } from 'react';
import {
    CheckSquare, Plus, ArrowLeft, Calendar, Clock, AlertCircle,
    CheckCircle, Edit3, Trash2, X
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AcademyTask } from '../../../types/academy';
import { useSession } from '../../../contexts/SessionContext';

interface TareasViewProps {
    onBack: () => void;
}

export const TareasView: React.FC<TareasViewProps> = ({ onBack }) => {
    const { user } = useSession();
    const [tasks, setTasks] = useState<AcademyTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState<AcademyTask | null>(null);

    // Form states
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [formDueDate, setFormDueDate] = useState('');
    const [formStatus, setFormStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');

    useEffect(() => {
        loadTasks();
    }, [filterStatus]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('academy_tasks')
                .select('*')
                .order('due_date', { ascending: true });

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            const { data, error } = await query;

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormTitle('');
        setFormDescription('');
        setFormPriority('medium');
        setFormDueDate('');
        setFormStatus('pending');
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (task: AcademyTask) => {
        setEditingTask(task);
        setFormTitle(task.title);
        setFormDescription(task.description || '');
        setFormPriority(task.priority as any);
        setFormDueDate(task.due_date.split('T')[0]);
        setFormStatus(task.status as any);
        setShowEditModal(true);
    };

    const handleAddTask = async () => {
        if (!formTitle.trim() || !formDueDate) return;

        try {
            const { data, error } = await supabase
                .from('academy_tasks')
                .insert([{
                    title: formTitle,
                    description: formDescription,
                    status: formStatus,
                    priority: formPriority,
                    assigned_to: user?.id,
                    due_date: new Date(formDueDate).toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            setTasks([...tasks, data]);
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Error al crear la tarea');
        }
    };

    const handleEditTask = async () => {
        if (!editingTask || !formTitle.trim() || !formDueDate) return;

        try {
            const { error } = await supabase
                .from('academy_tasks')
                .update({
                    title: formTitle,
                    description: formDescription,
                    priority: formPriority,
                    due_date: new Date(formDueDate).toISOString(),
                    status: formStatus
                })
                .eq('id', editingTask.id);

            if (error) throw error;

            setTasks(tasks.map(t => t.id === editingTask.id ? {
                ...t,
                title: formTitle,
                description: formDescription,
                priority: formPriority,
                due_date: new Date(formDueDate).toISOString(),
                status: formStatus
            } : t));

            setShowEditModal(false);
            setEditingTask(null);
            resetForm();
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Error al actualizar la tarea');
        }
    };

    const handleDeleteTask = async (task: AcademyTask) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('academy_tasks')
                .delete()
                .eq('id', task.id);

            if (error) throw error;
            setTasks(tasks.filter(t => t.id !== task.id));
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error al eliminar la tarea');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
            case 'medium': return { bg: '#fed7aa', border: '#f97316', text: '#9a3412' };
            case 'low': return { bg: '#d1fae5', border: '#10b981', text: '#065f46' };
            default: return { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return { bg: '#d1fae5', border: '#10b981', text: '#065f46' };
            case 'in_progress': return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
            case 'pending': return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' };
            default: return { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-5 w-5" />;
            case 'in_progress': return <Clock className="h-5 w-5" />;
            case 'pending': return <AlertCircle className="h-5 w-5" />;
            default: return <AlertCircle className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section - CRM Style */}
            <div style={{
                background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
                borderRadius: '16px',
                padding: '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <CheckSquare className="h-8 w-8" />
                            <h1 className="text-3xl font-bold">Gestión de Tareas</h1>
                        </div>
                    </div>
                    <p className="text-emerald-100 text-lg pl-16">Control de actividades y pendientes</p>
                </div>

                <button
                    onClick={openAddModal}
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <Plus className="h-5 w-5" />
                    Nueva Tarea
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                {['all', 'pending', 'in_progress', 'completed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status as any)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: '2px solid',
                            borderColor: filterStatus === status ? '#10b981' : '#e5e7eb',
                            backgroundColor: filterStatus === status ? '#d1fae5' : 'white',
                            color: filterStatus === status ? '#065f46' : '#6b7280',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {status === 'all' && 'Todas'}
                        {status === 'pending' && 'Pendientes'}
                        {status === 'in_progress' && 'En Progreso'}
                        {status === 'completed' && 'Completadas'}
                    </button>
                ))}
            </div>

            {/* Tasks Grid - CRM Style Cards */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando tareas...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay tareas</h3>
                    <p className="text-gray-500 mb-6">No hay tareas con el filtro seleccionado</p>
                    <button
                        onClick={openAddModal}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                    >
                        Crear Primera Tarea
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task) => {
                        const priorityColors = getPriorityColor(task.priority);
                        const statusColors = getStatusColor(task.status);
                        const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';

                        return (
                            <div
                                key={task.id}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    border: `3px solid ${isOverdue ? '#ef4444' : statusColors.border}`,
                                    position: 'relative',
                                    transition: 'all 0.2s'
                                }}
                                className="hover:shadow-lg group"
                            >
                                {/* Priority Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    backgroundColor: priorityColors.bg,
                                    color: priorityColors.text,
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    border: `1px solid ${priorityColors.border}`
                                }}>
                                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                                </div>

                                {/* Action Buttons */}
                                <div style={{
                                    position: 'absolute',
                                    top: '52px',
                                    right: '16px',
                                    display: 'flex',
                                    gap: '6px',
                                    opacity: 0,
                                    transition: 'opacity 0.2s'
                                }}
                                    className="group-hover:opacity-100"
                                >
                                    <button
                                        onClick={() => openEditModal(task)}
                                        style={{
                                            padding: '6px',
                                            backgroundColor: '#eff6ff',
                                            color: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task)}
                                        style={{
                                            padding: '6px',
                                            backgroundColor: '#fef2f2',
                                            color: '#ef4444',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Task Content */}
                                <h3 className="font-bold text-gray-900 mb-2 pr-16 text-lg">{task.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{task.description}</p>

                                {/* Footer */}
                                <div style={{
                                    paddingTop: '16px',
                                    borderTop: '1px solid #f3f4f6',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div className="flex items-center gap-2 text-sm" style={{
                                        color: isOverdue ? '#ef4444' : '#6b7280'
                                    }}>
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium">
                                            {new Date(task.due_date).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'short'
                                            })}
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: statusColors.text
                                    }}>
                                        {getStatusIcon(task.status)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Task Modal - CRM Style */}
            {showAddModal && (
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
                        width: '90%',
                        maxWidth: '600px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                    Nueva Tarea
                                </h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: '#6b7280'
                                    }}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Title */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                    placeholder="Ej: Preparar material del módulo 1"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Descripción
                                </label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Descripción de la tarea..."
                                />
                            </div>

                            {/* Priority and Due Date */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {/* Priority */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        Prioridad *
                                    </label>
                                    <select
                                        value={formPriority}
                                        onChange={(e) => setFormPriority(e.target.value as any)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                    </select>
                                </div>

                                {/* Due Date */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        Fecha Límite *
                                    </label>
                                    <input
                                        type="date"
                                        value={formDueDate}
                                        onChange={(e) => setFormDueDate(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Estado *
                                </label>
                                <select
                                    value={formStatus}
                                    onChange={(e) => setFormStatus(e.target.value as any)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="pending">Pendiente</option>
                                    <option value="in_progress">En Progreso</option>
                                    <option value="completed">Completada</option>
                                </select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px',
                            backgroundColor: '#f9fafb',
                            borderTop: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'white',
                                    color: '#374151',
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
                                onClick={handleAddTask}
                                disabled={!formTitle.trim() || !formDueDate}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: formTitle.trim() && formDueDate ? 'pointer' : 'not-allowed',
                                    opacity: formTitle.trim() && formDueDate ? 1 : 0.5
                                }}
                            >
                                ✓ Crear Tarea
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Task Modal - Same as Add but for editing */}
            {showEditModal && (
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
                        width: '90%',
                        maxWidth: '600px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                    Editar Tarea
                                </h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: '#6b7280'
                                    }}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Descripción
                                </label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        Prioridad *
                                    </label>
                                    <select
                                        value={formPriority}
                                        onChange={(e) => setFormPriority(e.target.value as any)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        Fecha Límite *
                                    </label>
                                    <input
                                        type="date"
                                        value={formDueDate}
                                        onChange={(e) => setFormDueDate(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Estado *
                                </label>
                                <select
                                    value={formStatus}
                                    onChange={(e) => setFormStatus(e.target.value as any)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="pending">Pendiente</option>
                                    <option value="in_progress">En Progreso</option>
                                    <option value="completed">Completada</option>
                                </select>
                            </div>
                        </div>

                        <div style={{
                            padding: '16px 24px',
                            backgroundColor: '#f9fafb',
                            borderTop: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => setShowEditModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'white',
                                    color: '#374151',
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
                                onClick={handleEditTask}
                                disabled={!formTitle.trim() || !formDueDate}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: formTitle.trim() && formDueDate ? 'pointer' : 'not-allowed',
                                    opacity: formTitle.trim() && formDueDate ? 1 : 0.5
                                }}
                            >
                                ✓ Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
