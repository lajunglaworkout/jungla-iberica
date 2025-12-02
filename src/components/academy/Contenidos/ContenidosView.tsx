import React, { useState, useEffect } from 'react';
import {
    BookOpen, Plus, Search, Filter, MoreVertical,
    FileText, Video, Link as LinkIcon, ChevronDown,
    ChevronRight, Clock, CheckCircle, AlertCircle, ArrowLeft,
    Edit3, Save, X, Upload, Download, HelpCircle, Eye, Trash2,
    Layout, Type, Image as ImageIcon, Sparkles, Zap
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

    // UI State
    const [showAddLessonModal, setShowAddLessonModal] = useState(false);
    const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState('');

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

    const initiateAddLesson = (moduleId: string) => {
        setTargetModuleId(moduleId);
        setNewLessonTitle('');
        setShowAddLessonModal(true);
    };

    const confirmAddLesson = async () => {
        if (!targetModuleId || !newLessonTitle.trim()) return;

        try {
            // 1. Create Lesson
            const { data: lesson, error: lessonError } = await supabase
                .from('academy_lessons')
                .insert([{
                    module_id: targetModuleId,
                    title: newLessonTitle,
                    order: (lessons[targetModuleId]?.length || 0) + 1,
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

            // Refresh and Close
            loadLessons(targetModuleId);
            setShowAddLessonModal(false);
            setTargetModuleId(null);
            setNewLessonTitle('');
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
                        className="p-3 hover:bg-white hover:shadow-md rounded-full transition-all text-gray-500 hover:text-emerald-600"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Mapa de Contenidos</h2>
                        <p className="text-gray-500 mt-1">Gestión integral del plan de estudios</p>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 gap-10">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-6"></div>
                        <p className="text-gray-500 text-lg">Cargando estructura del curso...</p>
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm border-dashed">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No hay módulos definidos</h3>
                        <p className="text-gray-500">Ejecuta el script de inicialización para comenzar.</p>
                    </div>
                ) : (
                    modules.map((module) => (
                        <div
                            key={module.id}
                            className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden transition-all hover:shadow-xl hover:shadow-emerald-100/20"
                        >
                            {/* Module Header */}
                            <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{module.title}</h3>
                                    <p className="text-gray-500">{module.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-4 py-2 bg-white border border-gray-100 rounded-full text-sm font-semibold text-gray-600 shadow-sm">
                                        {lessons[module.id]?.length || 0} Lecciones
                                    </span>
                                </div>
                            </div>

                            {/* Lessons List */}
                            <div className="divide-y divide-gray-50">
                                {lessons[module.id]?.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400 italic">
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
                                                className="p-6 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer"
                                                onClick={() => openLessonEditor(lesson)}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                        {lesson.order}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                            {lesson.title}
                                                        </h4>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            {/* Block Indicators */}
                                                            <div className="flex gap-1.5">
                                                                {[1, 2, 3].map(num => {
                                                                    const block = lessonBlocks.find(b => b.block_number === num);
                                                                    const hasContent = block?.content;
                                                                    return (
                                                                        <div
                                                                            key={num}
                                                                            className={`h-2 w-8 rounded-full transition-all ${hasContent ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-gray-200'}`}
                                                                            title={`Bloque ${num}: ${hasContent ? 'Completado' : 'Vacío'}`}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-400 ml-2">
                                                                {completedBlocks}/{totalBlocks} Bloques
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${lesson.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {lesson.status === 'completed' ? 'Completado' : 'En Desarrollo'}
                                                    </span>
                                                    <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all">
                                                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Add Lesson Button */}
                            <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                                <button
                                    onClick={() => initiateAddLesson(module.id)}
                                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-3 font-semibold text-base group"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                        <Plus className="h-5 w-5" />
                                    </div>
                                    Añadir Lección al Módulo {module.title}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Lesson Modal */}
            {showAddLessonModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-md">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="p-8 border-b border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900">Nueva Lección</h3>
                            <p className="text-gray-500 mt-1">Añade una nueva lección al módulo</p>
                        </div>
                        <div className="p-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Título de la Lección</label>
                                <input
                                    type="text"
                                    value={newLessonTitle}
                                    onChange={(e) => setNewLessonTitle(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg font-medium placeholder-gray-400"
                                    placeholder="Ej: Introducción a RRHH"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && confirmAddLesson()}
                                />
                            </div>
                        </div>
                        <div className="p-8 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50 rounded-b-3xl">
                            <button
                                onClick={() => setShowAddLessonModal(false)}
                                className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmAddLesson}
                                disabled={!newLessonTitle.trim()}
                                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5"
                            >
                                Crear Lección
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lesson Detail Modal (The "Editor") */}
            {selectedLesson && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col border border-white/20">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedLesson.title}</h3>
                                <p className="text-gray-500 mt-2 text-lg">Gestiona los 3 bloques de contenido estratégico</p>
                            </div>
                            <button
                                onClick={() => setSelectedLesson(null)}
                                className="p-3 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-8 w-8" />
                            </button>
                        </div>

                        {/* Modal Content - 3 Blocks Grid */}
                        <div className="p-10 overflow-y-auto flex-1 bg-gray-50/50">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full">
                                {blocks[selectedLesson.id]?.map((block) => {
                                    const hasContent = block.content && block.content.length > 0;
                                    return (
                                        <div
                                            key={block.id}
                                            className={`
                        bg-white rounded-3xl border shadow-lg flex flex-col h-full transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl
                        ${hasContent ? 'border-emerald-100 shadow-emerald-100/20' : 'border-gray-100 shadow-gray-100/50'}
                      `}
                                        >
                                            {/* Block Header */}
                                            <div className={`
                        p-8 border-b flex justify-between items-start rounded-t-3xl
                        ${hasContent ? 'bg-gradient-to-br from-emerald-50/80 to-white border-emerald-50' : 'bg-gradient-to-br from-gray-50/80 to-white border-gray-50'}
                      `}>
                                                <div>
                                                    <span className={`
                            px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
                            ${hasContent ? 'bg-white text-emerald-700 ring-1 ring-emerald-100' : 'bg-white text-gray-500 ring-1 ring-gray-100'}
                          `}>
                                                        Bloque {block.block_number}
                                                    </span>
                                                    <h4 className="text-xl font-bold text-gray-900 mt-4 leading-tight">
                                                        {block.title || `Bloque ${block.block_number}`}
                                                    </h4>
                                                </div>
                                                {hasContent ? (
                                                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                                                        <CheckCircle className="h-6 w-6" />
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shadow-sm">
                                                        <Layout className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Block Content Preview */}
                                            <div className="p-8 flex-1 flex flex-col">
                                                <p className={`text-base leading-relaxed flex-1 line-clamp-[8] ${hasContent ? 'text-gray-600' : 'text-gray-400 italic'}`}>
                                                    {block.content || 'Este bloque aún no tiene contenido. Haz clic en el botón inferior para comenzar a redactar.'}
                                                </p>

                                                {block.file_url && (
                                                    <div className="mt-6 flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                                                        <LinkIcon className="h-4 w-4" />
                                                        <span className="truncate font-medium">Recurso adjunto disponible</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <div className="p-6 border-t border-gray-50">
                                                <button
                                                    onClick={() => openBlockEditor(block)}
                                                    className={`
                            w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2
                            ${hasContent
                                                            ? 'bg-white border-2 border-gray-100 text-gray-700 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/30'
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:-translate-y-0.5'}
                          `}
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                    {hasContent ? 'Editar Contenido' : 'Añadir Contenido'}
                                                </button>
                                            </div>
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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-6 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col border border-white/20">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Editar Bloque {editingBlock.block_number}</h3>
                                <p className="text-gray-500 mt-1">Define el contenido estratégico</p>
                            </div>
                            <button
                                onClick={() => setEditingBlock(null)}
                                className="p-3 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50/30">
                            <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

                                {/* Left Column: Guide */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-3xl border border-emerald-100 sticky top-0">
                                        <div className="flex items-center gap-3 mb-6 text-emerald-800 font-bold text-lg">
                                            <Sparkles className="h-6 w-6" />
                                            <span>Guía Estratégica</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-emerald-100/50 backdrop-blur-sm">
                                                <strong className="block text-emerald-900 mb-2 text-lg">1. Concepto</strong>
                                                <span className="text-emerald-700 leading-relaxed block">¿Qué quiero transmitir exactamente? Define la idea central.</span>
                                            </div>
                                            <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-emerald-100/50 backdrop-blur-sm">
                                                <strong className="block text-emerald-900 mb-2 text-lg">2. Valor</strong>
                                                <span className="text-emerald-700 leading-relaxed block">¿Qué valor práctico aporto? ¿Por qué es importante?</span>
                                            </div>
                                            <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-emerald-100/50 backdrop-blur-sm">
                                                <strong className="block text-emerald-900 mb-2 text-lg">3. Acción</strong>
                                                <span className="text-emerald-700 leading-relaxed block">¿Cómo se lleva a la práctica? Pasos concretos.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Form */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="space-y-8">
                                            <div>
                                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                    <Type className="h-4 w-4" />
                                                    Título del Bloque
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editorTitle}
                                                    onChange={(e) => setEditorTitle(e.target.value)}
                                                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-xl font-medium placeholder-gray-400"
                                                    placeholder="Ej: Concepto Clave: El CV Visual"
                                                />
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                    <FileText className="h-4 w-4" />
                                                    Contenido
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        value={editorContent}
                                                        onChange={(e) => setEditorContent(e.target.value)}
                                                        rows={12}
                                                        className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none leading-relaxed text-lg text-gray-700 placeholder-gray-400"
                                                        placeholder="Escribe aquí el contenido del bloque..."
                                                    />
                                                    <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                                                        {editorContent.length} caracteres
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                    <LinkIcon className="h-4 w-4" />
                                                    Recurso Adjunto (URL)
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={editorFileUrl}
                                                        onChange={(e) => setEditorFileUrl(e.target.value)}
                                                        className="flex-1 px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-base"
                                                        placeholder="https://..."
                                                    />
                                                    <button className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors font-semibold">
                                                        Probar
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-3 ml-2">Enlace a PDF, PPT o vídeo en Supabase Storage.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 flex justify-end gap-4 bg-white z-10">
                            <button
                                onClick={() => setEditingBlock(null)}
                                className="px-8 py-4 text-gray-600 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveBlock}
                                className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:-translate-y-0.5 flex items-center gap-2"
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
