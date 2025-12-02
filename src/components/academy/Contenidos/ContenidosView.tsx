import React, { useState, useEffect } from 'react';
import {
    BookOpen, Plus, Search, Filter, MoreVertical,
    FileText, Video, Link as LinkIcon, ChevronDown,
    ChevronRight, Clock, CheckCircle, AlertCircle, ArrowLeft
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AcademyModule, AcademyLesson } from '../../../types/academy';

interface ContenidosViewProps {
    onBack: () => void;
}

export const ContenidosView: React.FC<ContenidosViewProps> = ({ onBack }) => {
    const [modules, setModules] = useState<AcademyModule[]>([]);
    const [lessons, setLessons] = useState<Record<string, AcademyLesson[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('academy_modules')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setModules(data || []);

            // Load lessons for the first module if exists
            if (data && data.length > 0) {
                loadLessons(data[0].id);
                setExpandedModule(data[0].id);
            }
        } catch (error) {
            console.error('Error loading modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLessons = async (moduleId: string) => {
        if (lessons[moduleId]) return; // Already loaded

        try {
            const { data, error } = await supabase
                .from('academy_lessons')
                .select('*')
                .eq('module_id', moduleId)
                .order('order_index', { ascending: true });

            if (error) throw error;
            setLessons(prev => ({ ...prev, [moduleId]: data || [] }));
        } catch (error) {
            console.error('Error loading lessons:', error);
        }
    };

    const toggleModule = (moduleId: string) => {
        if (expandedModule === moduleId) {
            setExpandedModule(null);
        } else {
            setExpandedModule(moduleId);
            loadLessons(moduleId);
        }
    };

    const handleAddModule = async () => {
        const title = prompt('Nombre del nuevo módulo:');
        if (!title) return;

        try {
            const { data, error } = await supabase
                .from('academy_modules')
                .insert([{
                    title,
                    description: 'Nueva descripción',
                    status: 'draft',
                    order_index: modules.length + 1
                }])
                .select()
                .single();

            if (error) throw error;
            setModules([...modules, data]);
        } catch (error) {
            console.error('Error creating module:', error);
            alert('Error al crear el módulo');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'text-green-600 bg-green-50';
            case 'draft': return 'text-gray-600 bg-gray-50';
            case 'archived': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'published': return 'Publicado';
            case 'draft': return 'Borrador';
            case 'archived': return 'Archivado';
            default: return status;
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
                        <h2 className="text-2xl font-bold text-gray-900">Gestión de Contenidos</h2>
                        <p className="text-gray-500">Administra los módulos y lecciones de la academia</p>
                    </div>
                </div>
                <button
                    onClick={handleAddModule}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Módulo
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar lecciones o módulos..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
                    <Filter className="h-5 w-5" />
                    Filtros
                </button>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando contenidos...</p>
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No hay módulos creados</h3>
                        <p className="text-gray-500 mb-4">Comienza creando el primer módulo del curso</p>
                        <button
                            onClick={handleAddModule}
                            className="text-blue-600 font-medium hover:text-blue-700"
                        >
                            Crear Módulo
                        </button>
                    </div>
                ) : (
                    modules.map((module) => (
                        <div
                            key={module.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                        >
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleModule(module.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${expandedModule === module.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {expandedModule === module.id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{module.title}</h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span>{lessons[module.id]?.length || 0} lecciones</span>
                                            <span>•</span>
                                            <span>{module.duration_minutes || 0} min</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                                        {getStatusLabel(module.status)}
                                    </span>
                                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Lessons List */}
                            {expandedModule === module.id && (
                                <div className="border-t border-gray-100 bg-gray-50/50">
                                    {lessons[module.id]?.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="p-4 pl-16 flex items-center justify-between hover:bg-white border-b border-gray-100 last:border-0 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-white rounded-lg border border-gray-200 text-blue-600">
                                                    {lesson.type === 'video' && <Video className="h-4 w-4" />}
                                                    {lesson.type === 'document' && <FileText className="h-4 w-4" />}
                                                    {lesson.type === 'quiz' && <CheckCircle className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{lesson.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{lesson.duration_minutes} min</span>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lesson.status)}`}>
                                                    {getStatusLabel(lesson.status)}
                                                </span>
                                                <button className="text-gray-400 hover:text-blue-600">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-3 pl-16">
                                        <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors w-full">
                                            <Plus className="h-4 w-4" />
                                            Añadir Lección
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
