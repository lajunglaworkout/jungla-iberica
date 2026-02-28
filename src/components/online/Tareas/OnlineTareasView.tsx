import React, { useState, useEffect } from 'react';
import {
    CheckSquare, Plus, ArrowLeft, Calendar, Clock, AlertCircle,
    CheckCircle, Edit3, Trash2, X, Filter, Layout, List, RefreshCw
} from 'lucide-react';
import { onlineTaskService } from '../../../services/academyService';
import { OnlineTask, OnlineTaskPriority, OnlineTaskStatus } from '../../../types/online';
import { ui } from '../../../utils/ui';


interface OnlineTareasViewProps {
    onBack: () => void;
}

export const OnlineTareasView: React.FC<OnlineTareasViewProps> = ({ onBack }) => {
    const [tasks, setTasks] = useState<OnlineTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    // Filters
    const [filterStatus, setFilterStatus] = useState<OnlineTaskStatus | 'all'>('all');
    const [filterPriority, setFilterPriority] = useState<OnlineTaskPriority | 'all'>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState<OnlineTask | null>(null);

    // Form states
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPriority, setFormPriority] = useState<OnlineTaskPriority>('normal');
    const [formDueDate, setFormDueDate] = useState('');
    const [formStatus, setFormStatus] = useState<OnlineTaskStatus>('pending');
    const [formAssignees, setFormAssignees] = useState<string[]>([]);

    const TEAM_MEMBERS = ['Carlos', 'Vicente', 'Jesús'];

    useEffect(() => {
        loadTasks();
    }, [filterStatus, filterPriority, filterAssignee]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const filters: { status?: string; priority?: string; assignee?: string } = {};
            if (filterStatus !== 'all') filters.status = filterStatus;
            if (filterPriority !== 'all') filters.priority = filterPriority;
            if (filterAssignee !== 'all') filters.assignee = filterAssignee;

            const data = await onlineTaskService.getAll(filters);
            setTasks(data || []);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async () => {
        if (!formTitle.trim()) return;

        try {
            const data = await onlineTaskService.create({
                title: formTitle,
                description: formDescription,
                status: formStatus,
                priority: formPriority,
                assigned_to: formAssignees,
                due_date: formDueDate ? new Date(formDueDate).toISOString() : null,
                origin: 'Manual'
            });

            setTasks([...tasks, data]);
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Error creating task:', error);
            ui.error('Error al crear la tarea');
        }
    };

    const handleEditTask = async () => {
        if (!editingTask || !formTitle.trim()) return;

        try {
            await onlineTaskService.update(editingTask.id, {
                title: formTitle,
                description: formDescription,
                priority: formPriority,
                due_date: formDueDate ? new Date(formDueDate).toISOString() : null,
                status: formStatus,
                assigned_to: formAssignees
            });

            setTasks(tasks.map(t => t.id === editingTask.id ? {
                ...t,
                title: formTitle,
                description: formDescription,
                priority: formPriority,
                due_date: formDueDate ? new Date(formDueDate).toISOString() : undefined,
                status: formStatus,
                assigned_to: formAssignees
            } : t));

            setShowEditModal(false);
            setEditingTask(null);
            resetForm();
        } catch (error) {
            console.error('Error updating task:', error);
            ui.error('Error al actualizar la tarea');
        }
    };

    const handleDeleteTask = async (task: OnlineTask) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`)) {
            return;
        }

        try {
            await onlineTaskService.delete(task.id);
            setTasks(tasks.filter(t => t.id !== task.id));
        } catch (error) {
            console.error('Error deleting task:', error);
            ui.error('Error al eliminar la tarea');
        }
    };

    const resetForm = () => {
        setFormTitle('');
        setFormDescription('');
        setFormPriority('normal');
        setFormDueDate('');
        setFormStatus('pending');
        setFormAssignees([]);
    };

    const openEditModal = (task: OnlineTask) => {
        setEditingTask(task);
        setFormTitle(task.title);
        setFormDescription(task.description || '');
        setFormPriority(task.priority);
        setFormDueDate(task.due_date ? task.due_date.split('T')[0] : '');
        setFormStatus(task.status);
        setFormAssignees(task.assigned_to || []);
        setShowEditModal(true);
    };

    const toggleAssignee = (name: string) => {
        if (formAssignees.includes(name)) {
            setFormAssignees(formAssignees.filter(a => a !== name));
        } else {
            setFormAssignees([...formAssignees, name]);
        }
    };



    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'critical': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
            case 'high': return { bg: '#ffedd5', border: '#f97316', text: '#9a3412' };
            case 'normal': return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
            case 'low': return { bg: '#d1fae5', border: '#10b981', text: '#065f46' };
            default: return { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return { bg: '#d1fae5', border: '#10b981', text: '#065f46' };
            case 'in_progress': return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
            case 'blocked': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
            case 'pending': return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' };
            default: return { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'in_progress': return <Clock className="h-4 w-4" />;
            case 'blocked': return <AlertCircle className="h-4 w-4" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    const renderKanbanBoard = () => {
        const columns: { id: OnlineTaskStatus; label: string }[] = [
            { id: 'pending', label: 'Pendiente' },
            { id: 'in_progress', label: 'En Proceso' },
            { id: 'blocked', label: 'Bloqueada' },
            { id: 'completed', label: 'Completada' }
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-4">
                {columns.map(col => (
                    <div key={col.id} className="bg-gray-50 rounded-xl p-4 min-w-[280px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">{col.label}</h3>
                            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                                {tasks.filter(t => t.status === col.id).length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {tasks.filter(t => t.status === col.id).map(task => {
                                const priorityStyle = getPriorityStyle(task.priority);
                                const statusStyle = getStatusStyle(task.status);
                                const isOverdue = task.due_date ? new Date(task.due_date) < new Date() && task.status !== 'completed' : false;

                                return (
                                    <div
                                        key={task.id}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            border: `3px solid ${isOverdue ? '#ef4444' : statusStyle.border}`,
                                            position: 'relative',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover:shadow-lg group cursor-pointer"
                                        onClick={() => openEditModal(task)}
                                    >
                                        {/* Priority Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            backgroundColor: priorityStyle.bg,
                                            color: priorityStyle.text,
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            border: `1px solid ${priorityStyle.border}`
                                        }}>
                                            {task.priority === 'critical' ? 'Crítica' :
                                                task.priority === 'high' ? 'Alta' :
                                                    task.priority === 'normal' ? 'Normal' : 'Baja'}
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '40px',
                                            right: '12px',
                                            display: 'flex',
                                            gap: '4px',
                                            opacity: 0,
                                            transition: 'opacity 0.2s'
                                        }}
                                            className="group-hover:opacity-100"
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                                                style={{
                                                    padding: '4px',
                                                    backgroundColor: '#fef2f2',
                                                    color: '#ef4444',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>

                                        {/* Task Content */}
                                        <h4 className="font-bold text-gray-900 mb-2 pr-16 text-base line-clamp-2">{task.title}</h4>
                                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

                                        {/* Footer */}
                                        <div style={{
                                            paddingTop: '12px',
                                            borderTop: '1px solid #f3f4f6',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div className="flex items-center gap-1 text-xs" style={{
                                                color: isOverdue ? '#ef4444' : '#6b7280'
                                            }}>
                                                <Calendar className="h-3 w-3" />
                                                <span className="font-medium">
                                                    {task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short'
                                                    }) : '-'}
                                                </span>
                                            </div>

                                            <div className="flex -space-x-2">
                                                {task.assigned_to?.slice(0, 3).map((person, i) => (
                                                    <div key={i} className="w-5 h-5 rounded-full bg-teal-100 border border-white flex items-center justify-center text-[10px] font-bold text-teal-700" title={person}>
                                                        {person.charAt(0)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section - CRM Style */}
            <div style={{
                background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
                borderRadius: '16px',
                padding: '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                marginBottom: '32px'
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
                            <h1 className="text-3xl font-bold">Gestión de Tareas Online</h1>
                        </div>
                    </div>
                    <p className="text-emerald-100 text-lg pl-16">Organiza y prioriza el contenido y actividades</p>
                </div>

                <div style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    display: 'flex',
                    gap: '12px',
                    zIndex: 20
                }}>
                    <button
                        onClick={() => ui.info('Funcionalidad de sincronización próximamente')}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            color: 'white',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backdropFilter: 'blur(4px)'
                        }}
                        title="Sincronizar"
                    >
                        <RefreshCw size={16} />
                        Sincronizar
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="hover:shadow-lg hover:scale-105 transition-all"
                        style={{
                            backgroundColor: 'white',
                            color: '#059669',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Plus className="h-5 w-5" />
                        Nueva Tarea
                    </button>
                </div>
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex gap-3 items-center overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    {/* Assignee Filter */}
                    <select
                        value={filterAssignee}
                        onChange={(e) => setFilterAssignee(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: '2px solid #e5e7eb',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                            minWidth: '150px'
                        }}
                    >
                        <option value="all">👥 Todo el equipo</option>
                        {TEAM_MEMBERS.map(member => (
                            <option key={member} value={member}>👤 {member}</option>
                        ))}
                    </select>

                    <div style={{ width: '2px', height: '32px', backgroundColor: '#e5e7eb' }}></div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as OnlineTaskStatus | 'all')}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: '2px solid #e5e7eb',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">Estado: Todos</option>
                        <option value="pending">Pendientes</option>
                        <option value="in_progress">En proceso</option>
                        <option value="blocked">Bloqueadas</option>
                        <option value="completed">Completadas</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as OnlineTaskPriority | 'all')}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: '2px solid #e5e7eb',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">Prioridad: Todas</option>
                        <option value="critical">🔴 Crítica</option>
                        <option value="high">🟠 Alta</option>
                        <option value="normal">🔵 Media</option>
                        <option value="low">⚪ Baja</option>
                    </select>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Vista Lista"
                    >
                        <List size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Vista Kanban"
                    >
                        <Layout size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <CheckSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No hay tareas encontradas</h3>
                    <p className="text-gray-500 mt-1">Crea una nueva tarea o ajusta los filtros.</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarea</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Límite</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                        {task.description && (
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex -space-x-2">
                                            {task.assigned_to?.map((person, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-xs font-bold text-teal-700" title={person}>
                                                    {person.charAt(0)}
                                                </div>
                                            ))}
                                            {(!task.assigned_to || task.assigned_to.length === 0) && (
                                                <span className="text-sm text-gray-400 italic">Sin asignar</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border"
                                            style={{
                                                backgroundColor: getPriorityStyle(task.priority).bg,
                                                color: getPriorityStyle(task.priority).text,
                                                borderColor: getPriorityStyle(task.priority).border
                                            }}
                                        >
                                            {task.priority === 'critical' ? 'Crítica' :
                                                task.priority === 'high' ? 'Alta' :
                                                    task.priority === 'normal' ? 'Media' : 'Baja'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border"
                                            style={{
                                                backgroundColor: getStatusStyle(task.status).bg,
                                                color: getStatusStyle(task.status).text,
                                                borderColor: getStatusStyle(task.status).border
                                            }}
                                        >
                                            {task.status === 'pending' ? 'Pendiente' :
                                                task.status === 'in_progress' ? 'En Proceso' :
                                                    task.status === 'blocked' ? 'Bloqueada' : 'Completada'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(task)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task)}
                                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                renderKanbanBoard()
            )}

            {/* Add/Edit Modal - ESTILO CRM ACADEMY */}
            {(showAddModal || showEditModal) && (
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
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }} className="animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                {showAddModal ? 'Nueva Tarea' : 'Editar Tarea'}
                            </h2>
                            <button
                                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px', backgroundColor: '#f9fafb' }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
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
                                        placeholder="Ej: Editar vídeo de YouTube"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
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
                                        placeholder="Detalles de la tarea..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Prioridad</label>
                                        <select
                                            value={formPriority}
                                            onChange={(e) => setFormPriority(e.target.value as OnlineTaskPriority)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="low">⚪ Baja</option>
                                            <option value="normal">🔵 Media</option>
                                            <option value="high">🟠 Alta</option>
                                            <option value="critical">🔴 Crítica</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                                        <select
                                            value={formStatus}
                                            onChange={(e) => setFormStatus(e.target.value as OnlineTaskStatus)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="pending">⏳ Pendiente</option>
                                            <option value="in_progress">🔄 En Proceso</option>
                                            <option value="blocked">❌ Bloqueada</option>
                                            <option value="completed">✅ Completada</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Límite</label>
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

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Asignado a</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TEAM_MEMBERS.map(member => (
                                            <button
                                                key={member}
                                                type="button"
                                                onClick={() => toggleAssignee(member)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${formAssignees.includes(member)
                                                    ? 'bg-teal-100 text-teal-800 border-teal-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {member}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '16px 24px',
                            backgroundColor: '#f9fafb',
                            borderTop: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
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
                                className="hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={showAddModal ? handleAddTask : handleEditTask}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#0d9488', // Teal-600
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                }}
                                className="hover:bg-teal-700"
                            >
                                {showAddModal ? 'Crear Tarea' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
