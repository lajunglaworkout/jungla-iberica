import React, { useState, useEffect } from 'react';
import {
    BookOpen, Plus, Search, Filter, MoreVertical,
    FileText, Video, Link as LinkIcon, ChevronDown,
    ChevronRight, Clock, CheckCircle, AlertCircle, ArrowLeft,
    Edit3, Save, X, Upload, Download, HelpCircle, Eye, Trash2
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

    // Editor State
    const [selectedLesson, setSelectedLesson] = useState<AcademyLesson | null>(null);
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
                .order('order', { ascending: true });

            if (error) throw error;
            setModules(data || []);

            // Load lessons for all modules
            if (data) {
                data.forEach(module => loadLessons(module.id));
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

    const openLessonEditor = (lesson: AcademyLesson) => {
        setSelectedLesson(lesson);
        // Ensure blocks are loaded
        if (!blocks[lesson.id]) {
            loadBlocks(lesson.id);
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
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
                        <p className="text-gray-500">Gestión del plan de estudios y materiales</p>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 gap-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando estructura del curso...</p>
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No hay módulos definidos</h3>
                        <p className="text-gray-500">Ejecuta el script de inicialización para comenzar.</p>
                    </div>
                ) : (
                    modules.map((module) => (
                        <div
                            key={module.id}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            {/* Module Header */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                                    <p className="text-sm text-gray-500">{module.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                                        {lessons[module.id]?.length || 0} Lecciones
                                    </span>
                                </div>
                            </div>

                            {/* Lessons List */}
                            <div className="divide-y divide-gray-100">
                                {lessons[module.id]?.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 italic">
                                        No hay lecciones en este módulo.
                                    </div>
                                ) : (
                                    lessons[module.id]?.map((lesson) => {
                                        const lessonBlocks = blocks[lesson.id] || [];
                                        const completedBlocks = lessonBlocks.filter(b => b.content).length;
                                        const totalBlocks = 3;
                                        const progress = (completedBlocks / totalBlocks) * 100;

                                        return (
                                            <div
                                                key={lesson.id}
                                                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer"
                                                onClick={() => openLessonEditor(lesson)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                                                        {lesson.order}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {lesson.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {/* Block Indicators */}
                                                            <div className="flex gap-1">
                                                                {[1, 2, 3].map(num => {
                                                                    const block = lessonBlocks.find(b => b.block_number === num);
                                                                    const hasContent = block?.content;
                                                                    return (
                                                                        <div
                                                                            key={num}
                                                                            className={`h-1.5 w-6 rounded-full ${hasContent ? 'bg-green-500' : 'bg-gray-200'}`}
                                                                            title={`Bloque ${num}: ${hasContent ? 'Completado' : 'Vacío'}`}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                            <span className="text-xs text-gray-400 ml-2">
                                                                {completedBlocks}/{totalBlocks} Bloques
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${lesson.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {lesson.status === 'completed' ? 'Completado' : 'En Desarrollo'}
                                                    </span>
                                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500" />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Add Lesson Button */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                                <button
                                    onClick={() => handleAddLesson(module.id)}
                                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Añadir Lección al Módulo {module.title}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Lesson Detail Modal (The "Editor") */}
            {selectedLesson && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h3>
                                <p className="text-sm text-gray-500">Gestiona los 3 bloques de contenido de esta lección</p>
                            </div>
                            <button
                                onClick={() => setSelectedLesson(null)}
                                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content - 3 Blocks Grid */}
                        <div className="p-8 overflow-y-auto flex-1 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {blocks[selectedLesson.id]?.map((block) => {
                                    const hasContent = block.content && block.content.length > 0;
                                    return (
                                        <div
                                            key={block.id}
                                            className={`
                        bg-white rounded-xl border-2 shadow-sm p-6 flex flex-col h-full transition-all hover:shadow-md
                        ${hasContent ? 'border-green-100' : 'border-gray-100'}
                      `}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`
                          px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                          ${hasContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                        `}>
                                                    Bloque {block.block_number}
                                                </span>
                                                {hasContent ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
                                                )}
                                            </div>

                                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                                                {block.title || `Bloque ${block.block_number}`}
                                            </h4>

                                            <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-4">
                                                {block.content || 'Sin contenido definido. Haz clic en editar para comenzar.'}
                                            </p>

                                            <button
                                                onClick={() => openBlockEditor(block)}
                                                className={`
                          w-full py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2
                          ${hasContent
                                                        ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}
                        `}
                                            >
                                                <Edit3 className="h-4 w-4" />
                                                {hasContent ? 'Editar Contenido' : 'Añadir Contenido'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Editor Modal (Nested) */}
            {editingBlock && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Editar Bloque {editingBlock.block_number}</h3>
                                <p className="text-sm text-gray-500">Define el contenido estratégico</p>
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
