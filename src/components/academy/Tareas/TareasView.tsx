import React, { useState, useEffect } from 'react';
import {
    CheckSquare, Plus, Search, Filter, MoreVertical,
    Clock, AlertCircle, CheckCircle, ArrowLeft, Calendar
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

    const handleAddTask = async () => {
        const title = prompt('Título de la nueva tarea:');
        if (!title) return;

        try {
            const { data, error } = await supabase
                .from('academy_tasks')
                .insert([{
                    title,
                    description: 'Nueva tarea',
                    status: 'pending',
                    priority: 'medium',
                    assigned_to: user?.id,
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
                }])
                .select()
                .single();

            if (error) throw error;
            setTasks([...tasks, data]);
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Error al crear la tarea');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-100';
            case 'medium': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'low': return 'text-green-600 bg-green-50 border-green-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />;
            case 'pending': return <AlertCircle className="h-5 w-5 text-gray-400" />;
            default: return <AlertCircle className="h-5 w-5 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h2>
                        <p className="text-gray-500">Control de actividades y pendientes</p>
                    </div>
                </div>
                <button
                    onClick={handleAddTask}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Nueva Tarea
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                {['all', 'pending', 'in_progress', 'completed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {status === 'all' && 'Todas'}
                        {status === 'pending' && 'Pendientes'}
                        {status === 'in_progress' && 'En Progreso'}
                        {status === 'completed' && 'Completadas'}
                    </button>
                ))}
            </div>

            {/* Tasks Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando tareas...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No hay tareas</h3>
                    <p className="text-gray-500 mb-4">No hay tareas con el filtro seleccionado</p>
                    <button
                        onClick={handleAddTask}
                        className="text-blue-600 font-medium hover:text-blue-700"
                    >
                        Crear Tarea
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                                </span>
                                <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(task.status)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
