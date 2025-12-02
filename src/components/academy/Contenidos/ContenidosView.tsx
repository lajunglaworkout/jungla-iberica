import React, { useState, useEffect } from 'react';
import {
    BookOpen, Plus, Search, Filter, MoreVertical,
    FileText, Video, Link as LinkIcon, ChevronDown,
    ChevronRight, Clock, CheckCircle, AlertCircle, ArrowLeft,
    Edit3, Save, X, Upload, Download, HelpCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AcademyModule, AcademyLesson } from '../../../types/academy';

interface ContenidosViewProps {
    onBack: () => void;
}

interface LessonBlock {
    id: string;
    lesson_id: string;
    block_number: number;
    title: string;
    content?: string;
    file_url?: string;
    duration?: number;
}

export const ContenidosView: React.FC<ContenidosViewProps> = ({ onBack }) => {
    const [modules, setModules] = useState<AcademyModule[]>([]);
    const [lessons, setLessons] = useState<Record<string, AcademyLesson[]>>({});
    const [blocks, setBlocks] = useState<Record<string, LessonBlock[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    // Editor State
    const [editingBlock, setEditingBlock] = useState<LessonBlock | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [editorTitle, setEditorTitle] = useState('');
    const [editorFileUrl, setEditorFileUrl] = useState('');

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('academy_modules')
                .select('*')
                .order('order', { ascending: true }); // Note: 'order' column might need quoting in SQL but Supabase JS handles it usually. If fails, check schema.

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
        try {
            const { data, error } = await supabase
                .from('academy_lessons')
                .select('*')
                .eq('module_id', moduleId)
                .order('order', { ascending: true });

            if (error) throw error;
            setLessons(prev => ({ ...prev, [moduleId]: data || [] }));

            // Load blocks for these lessons
            if (data) {
                data.forEach(lesson => loadBlocks(lesson.id));
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
        }
    };

    const loadBlocks = async (lessonId: string) => {
        try {
            const { data, error } = await supabase
                .from('academy_lesson_blocks')
                .select('*')
                .eq('lesson_id', lessonId)
                .order('block_number', { ascending: true });

            if (error) throw error;
            setBlocks(prev => ({ ...prev, [lessonId]: data || [] }));
        } catch (error) {
            console.error('Error loading blocks:', error);
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

    const handleAddLesson = async (moduleId: string) => {
        const title = prompt('Título de la nueva lección:');
        if (!title) return;

        try {
            // 1. Create Lesson
            const { data: lesson, error: lessonError } = await supabase
                .from('academy_lessons')
                .insert([{
                    module_id: moduleId,
                    title,
                    order: (lessons[moduleId]?.length || 0) + 1,
                    status: 'planned'
                }])
                .select()
                .single();

            if (lessonError) throw lessonError;

            // 2. Create 3 Default Blocks
            const defaultBlocks = [
                { lesson_id: lesson.id, block_number: 1, title: 'Bloque 1: Concepto' },
                { lesson_id: lesson.id, block_number: 2, title: 'Bloque 2: Valor' },
                { lesson_id: lesson.id, block_number: 3, title: 'Bloque 3: Acción' }
            ];

            const { error: blocksError } = await supabase
                .from('academy_lesson_blocks')
                .insert(defaultBlocks);

            if (blocksError) throw blocksError;

            // Refresh
            loadLessons(moduleId);
        } catch (error) {
            console.error('Error creating lesson:', error);
            alert('Error al crear la lección');
        }
    };

    const openBlockEditor = (block: LessonBlock) => {
        setEditingBlock(block);
        setEditorTitle(block.title || '');
        setEditorContent(block.content || '');
        setEditorFileUrl(block.file_url || '');
    };

    const saveBlock = async () => {
        if (!editingBlock) return;

        try {
            const { error } = await supabase
                .from('academy_lesson_blocks')
                .update({
                    title: editorTitle,
                    content: editorContent,
                    file_url: editorFileUrl
                })
                .eq('id', editingBlock.id);

            if (error) throw error;

            // Update local state
            setBlocks(prev => ({
                ...prev,
                [editingBlock.lesson_id]: prev[editingBlock.lesson_id].map(b =>
                    b.id === editingBlock.id
                        ? { ...b, title: editorTitle, content: editorContent, file_url: editorFileUrl }
                        : b
                )
            }));

            setEditingBlock(null);
        } catch (error) {
            console.error('Error saving block:', error);
            alert('Error al guardar el bloque');
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
                        <h2 className="text-2xl font-bold text-gray-900">Mapa de Contenidos</h2>
                        <p className="text-gray-500">Desarrollo del curso: Módulos, Lecciones y Bloques</p>
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando mapa del curso...</p>
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No hay módulos</h3>
                        <p className="text-gray-500">Ejecuta el script de inicialización para crear los módulos base.</p>
                    </div>
                ) : (
                    modules.map((module) => (
                        <div
                            key={module.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            <div
                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                                onClick={() => toggleModule(module.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${expandedModule === module.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {expandedModule === module.id ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                                        <p className="text-sm text-gray-500">{module.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500 font-medium">
                                        {lessons[module.id]?.length || 0} Lecciones
                                    </span>
                                </div>
                            </div>

                            {/* Lessons & Blocks */}
                            {expandedModule === module.id && (
                                <div className="bg-gray-50/50 p-6 space-y-6">
                                    {lessons[module.id]?.map((lesson) => (
                                        <div key={lesson.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                                                        {lesson.order}
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900">{lesson.title}</h4>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${lesson.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {lesson.status === 'completed' ? 'Completado' : 'En Desarrollo'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Blocks Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {blocks[lesson.id]?.map((block) => {
                                                    const hasContent = block.content && block.content.length > 0;
                                                    return (
                                                        <div
                                                            key={block.id}
                                                            onClick={() => openBlockEditor(block)}
                                                            className={`
                                relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                                ${hasContent
                                                                    ? 'bg-green-50 border-green-200 hover:border-green-300'
                                                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300 border-dashed'}
                              `}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className={`
                                  text-xs font-bold px-2 py-1 rounded uppercase
                                  ${hasContent ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}
                                `}>
                                                                    Bloque {block.block_number}
                                                                </span>
                                                                {hasContent ? (
                                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                                ) : (
                                                                    <Edit3 className="h-5 w-5 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <h5 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                                                {block.title || `Bloque ${block.block_number}`}
                                                            </h5>
                                                            <p className="text-xs text-gray-500 line-clamp-3">
                                                                {block.content || 'Haz clic para añadir contenido...'}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                                {(!blocks[lesson.id] || blocks[lesson.id].length === 0) && (
                                                    <div className="col-span-3 text-center py-4 text-gray-400 text-sm italic">
                                                        No hay bloques generados. (Error de sincronización)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => handleAddLesson(module.id)}
                                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Añadir Nueva Lección
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Block Editor Modal */}
            {editingBlock && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Editar Bloque {editingBlock.block_number}</h3>
                                <p className="text-sm text-gray-500">Lección: {lessons[editingBlock.lesson_id]?.find(l => l.id === editingBlock.lesson_id)?.title}</p>
                            </div>
                            <button
                                onClick={() => setEditingBlock(null)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Strategic Guide */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold">
                                    <HelpCircle className="h-5 w-5" />
                                    <span>Guía Estratégica</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                                        <strong className="block text-blue-800 mb-1">1. Concepto</strong>
                                        <span className="text-blue-600">¿Qué quiero transmitir?</span>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                                        <strong className="block text-blue-800 mb-1">2. Valor</strong>
                                        <span className="text-blue-600">¿Qué valor práctico aporto?</span>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                                        <strong className="block text-blue-800 mb-1">3. Acción</strong>
                                        <span className="text-blue-600">¿Cómo se lleva a la práctica?</span>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título del Bloque</label>
                                    <input
                                        type="text"
                                        value={editorTitle}
                                        onChange={(e) => setEditorTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Ej: Concepto Clave: El CV Visual"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                                    <textarea
                                        value={editorContent}
                                        onChange={(e) => setEditorContent(e.target.value)}
                                        rows={8}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                        placeholder="Escribe aquí el contenido del bloque..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Recurso Adjunto (URL)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editorFileUrl}
                                            onChange={(e) => setEditorFileUrl(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="https://..."
                                        />
                                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                            <Upload className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Enlace a PDF, PPT o vídeo en Supabase Storage.</p>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setEditingBlock(null)}
                                className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveBlock}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Save className="h-5 w-5" />
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
