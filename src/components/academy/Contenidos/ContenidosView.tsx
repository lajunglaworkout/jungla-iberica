import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Plus,
    Video,
    FileText,
    Download,
    CheckCircle,
    Clock,
    AlertCircle,
    MoreVertical,
    Filter
} from 'lucide-react';
import { AcademyModule, AcademyLesson } from '../../../types/academy';

// Mock Data
const MOCK_MODULES: AcademyModule[] = [
    {
        id: '1',
        title: 'MÓDULO 1: Recursos Humanos y Empleabilidad',
        order: 1,
        status: 'completed',
        responsible_id: 'Carlos Suárez',
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        title: 'MÓDULO 2: Experiencia Cliente y Retención',
        order: 2,
        status: 'in_progress',
        responsible_id: 'Daniel Valverde',
        created_at: new Date().toISOString()
    }
];

const MOCK_LESSONS: Record<string, AcademyLesson[]> = {
    '1': [
        {
            id: '1.1',
            module_id: '1',
            title: 'CV Específico',
            order: 1.1,
            duration: 10,
            has_test: true,
            status: 'completed',
            created_at: new Date().toISOString()
        },
        {
            id: '1.2',
            module_id: '1',
            title: 'Portfolio Digital',
            order: 1.2,
            duration: 12,
            has_test: true,
            status: 'completed',
            created_at: new Date().toISOString()
        }
    ],
    '2': [
        {
            id: '2.1',
            module_id: '2',
            title: 'Buyer Persona',
            order: 2.1,
            duration: 12,
            has_test: false,
            status: 'scripted',
            created_at: new Date().toISOString()
        },
        {
            id: '2.2',
            module_id: '2',
            title: 'Comunicación',
            order: 2.2,
            duration: 12,
            has_test: false,
            status: 'planned',
            created_at: new Date().toISOString()
        }
    ]
};

export const ContenidosView: React.FC = () => {
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ '1': true, '2': true });

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            case 'planned': return 'bg-gray-100 text-gray-700';
            case 'scripted': return 'bg-yellow-100 text-yellow-700';
            case 'recorded': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Completo';
            case 'in_progress': return 'En Desarrollo';
            case 'planned': return 'Planificado';
            case 'scripted': return 'Guionizado';
            case 'recorded': return 'Grabado';
            default: return status;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Contenidos</h1>
                    <p className="text-gray-500 mt-1">Administra los módulos y lecciones de la academia</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nueva Lección
                    </button>
                    <button className="px-4 py-2 bg-[#CDDC39] text-black rounded-lg font-medium hover:bg-[#c0ce35] flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Módulo
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
                <button className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-100">
                    <Filter className="w-4 h-4" />
                    Filtrar por Estado
                    <ChevronDown className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-100">
                    <Filter className="w-4 h-4" />
                    Filtrar por Responsable
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Modules List */}
            <div className="space-y-6">
                {MOCK_MODULES.map(module => (
                    <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Module Header */}
                        <div
                            className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleModule(module.id)}
                        >
                            <div className="flex items-center gap-4">
                                <button className="p-1 hover:bg-gray-200 rounded-full">
                                    {expandedModules[module.id] ? (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {module.responsible_id}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                                            {getStatusLabel(module.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Lessons List */}
                        {expandedModules[module.id] && (
                            <div className="divide-y divide-gray-100">
                                {MOCK_LESSONS[module.id]?.map(lesson => (
                                    <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className="mt-1">
                                                    {lesson.status === 'completed' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : lesson.status === 'in_progress' || lesson.status === 'scripted' ? (
                                                        <Clock className="w-5 h-5 text-yellow-500" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        Lección {lesson.order}: {lesson.title}
                                                    </h4>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {lesson.duration} min
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}>
                                                            {getStatusLabel(lesson.status)}
                                                        </span>
                                                    </div>

                                                    {/* Resources */}
                                                    <div className="flex gap-4 mt-3">
                                                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${lesson.status === 'completed' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                                            <Video className="w-3 h-3" />
                                                            Video
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded border bg-gray-50 border-gray-200 text-gray-600">
                                                            <FileText className="w-3 h-3" />
                                                            Guion
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded border bg-gray-50 border-gray-200 text-gray-600">
                                                            <Download className="w-3 h-3" />
                                                            Recursos
                                                        </div>
                                                        {lesson.has_test && (
                                                            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded border bg-blue-50 border-blue-200 text-blue-700">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Test
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                                    Editar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-3 bg-gray-50 text-center">
                                    <button className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center justify-center gap-2 w-full">
                                        <Plus className="w-4 h-4" />
                                        Añadir Lección al Módulo {module.order}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
