import React from 'react';
import {
    CheckSquare,
    Plus,
    Filter,
    ChevronDown,
    Calendar,
    User,
    AlertCircle,
    MoreVertical,
    ArrowRight
} from 'lucide-react';
import { AcademyTask } from '../../../types/academy';

// Mock Data
const MOCK_TASKS: AcademyTask[] = [
    {
        id: '1',
        title: 'Grabar Lección 2.1 - Buyer Persona',
        status: 'pending',
        priority: 'urgent',
        assigned_to: 'Daniel Valverde',
        due_date: '2024-11-30',
        progress: 0,
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Validar guion Lección 2.2',
        status: 'pending',
        priority: 'normal',
        assigned_to: 'Carlos Suárez',
        due_date: '2024-12-02',
        progress: 0,
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Editar video Lección 1.3',
        status: 'in_progress',
        priority: 'normal',
        assigned_to: 'Diego Montilla',
        due_date: '2024-11-28',
        progress: 80,
        created_at: new Date().toISOString()
    }
];

export const TareasView: React.FC = () => {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-700';
            case 'high': return 'bg-orange-100 text-orange-700';
            case 'normal': return 'bg-blue-100 text-blue-700';
            case 'low': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'Urgente';
            case 'high': return 'Alta';
            case 'normal': return 'Normal';
            case 'low': return 'Baja';
            default: return priority;
        }
    };

    const pendingTasks = MOCK_TASKS.filter(t => t.status === 'pending');
    const inProgressTasks = MOCK_TASKS.filter(t => t.status === 'in_progress');
    const completedTasks = MOCK_TASKS.filter(t => t.status === 'completed');

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h1>
                    <p className="text-gray-500 mt-1">Control de tareas y asignaciones del equipo</p>
                </div>
                <button className="px-4 py-2 bg-[#CDDC39] text-black rounded-lg font-medium hover:bg-[#c0ce35] flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva Tarea
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
                <button className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-100">
                    <Filter className="w-4 h-4" />
                    Asignado a
                    <ChevronDown className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-100">
                    <Filter className="w-4 h-4" />
                    Estado
                    <ChevronDown className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-100">
                    <Filter className="w-4 h-4" />
                    Prioridad
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Task Lists */}
            <div className="space-y-8">

                {/* Pending */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        PENDIENTES ({pendingTasks.length})
                    </h3>
                    <div className="grid gap-4">
                        {pendingTasks.map(task => (
                            <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{task.title}</h4>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {task.assigned_to}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Vence: {task.due_date}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                {getPriorityLabel(task.priority)}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                    <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                                        Ver detalles
                                    </button>
                                    <button className="text-sm text-[#2E7D32] hover:text-[#1b4d1e] font-medium ml-auto flex items-center gap-1">
                                        Completar
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* In Progress */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        EN PROGRESO ({inProgressTasks.length})
                    </h3>
                    <div className="grid gap-4">
                        {inProgressTasks.map(task => (
                            <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="w-full">
                                        <h4 className="font-bold text-gray-900 text-lg">{task.title}</h4>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {task.assigned_to}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Vence: {task.due_date}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-gray-700">Progreso</span>
                                                <span className="text-gray-500">{task.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${task.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 ml-4">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Completed Section Placeholder */}
                <div className="pt-4 border-t border-gray-200">
                    <button className="text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        Ver tareas completadas recientemente
                    </button>
                </div>

            </div>
        </div>
    );
};
