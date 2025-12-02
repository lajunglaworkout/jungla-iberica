import React, { useState, useEffect } from 'react';
import {
    BookOpen, Plus, Search, Filter, MoreVertical,
    FileText, Video, Link as LinkIcon, ChevronDown,
    ChevronRight, Clock, CheckCircle, AlertCircle, ArrowLeft,
    Edit3, Save, X, Upload, Download, HelpCircle, Eye, Trash2,
    Layout, Type, Image as ImageIcon, Sparkles, Zap, Maximize2, Minimize2
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
    const [isPreviewMode, setIsPreviewMode] = useState(false);

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
        setIsPreviewMode(false);
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

            {/* Add Lesson Modal - ESTILO CRM */}
            {showAddLessonModal && (
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
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Nueva Lección</h2>
                            <button
                                onClick={() => setShowAddLessonModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Content with colored background like CRM */}
                        <div style={{
                            padding: '16px 24px',
                            backgroundColor: '#f9fafb',
                            borderBottom: '1px solid #e5e7eb'
                        }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Título de la Lección
                            </label>
                            <input
                                type="text"
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                                placeholder="Ej: Introducción a RRHH"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && confirmAddLesson()}
                            />
                        </div>

                        {/* Footer with buttons */}
                        <div style={{
                            padding: '16px 24px',
                            backgroundColor: '#f9fafb',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => setShowAddLessonModal(false)}
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
                                onClick={confirmAddLesson}
                                disabled={!newLessonTitle.trim()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: newLessonTitle.trim() ? 'pointer' : 'not-allowed',
                                    opacity: newLessonTitle.trim() ? 1 : 0.5
                                }}
                            >
                                ✓ Crear Lección
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lesson Detail Modal - ESTILO CRM MEJORADO */}
            {selectedLesson && (
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
                    zIndex: 50,
                    padding: '24px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '1200px',
                        maxHeight: '95vh',
                        overflow: 'hidden',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                    {selectedLesson.title}
                                </h2>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                                    Gestiona los 3 bloques de contenido estratégico de esta lección
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedLesson(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Blocks Grid with proper spacing */}
                        <div style={{
                            padding: '24px',
                            overflowY: 'auto',
                            flex: 1,
                            backgroundColor: '#f9fafb'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '24px'
                            }}>
                                {blocks[selectedLesson.id]?.map((block) => {
                                    const hasContent = block.content && block.content.length > 0;
                                    return (
                                        <div
                                            key={block.id}
                                            style={{
                                                backgroundColor: 'white',
                                                borderRadius: '8px',
                                                border: `1px solid ${hasContent ? '#d1fae5' : '#e5e7eb'}`,
                                                overflow: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            {/* Block Header with colored background */}
                                            <div style={{
                                                padding: '16px',
                                                backgroundColor: hasContent ? '#d1fae5' : '#f9fafb',
                                                borderBottom: `1px solid ${hasContent ? '#a7f3d0' : '#e5e7eb'}`
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '8px'
                                                }}>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: hasContent ? '#047857' : '#6b7280',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        Bloque {block.block_number}
                                                    </span>
                                                    {hasContent && (
                                                        <div style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            backgroundColor: '#10b981',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '12px'
                                                        }}>
                                                            ✓
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 style={{
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    color: '#111827',
                                                    margin: 0
                                                }}>
                                                    {block.title || `Bloque ${block.block_number}`}
                                                </h3>
                                            </div>

                                            {/* Block Content */}
                                            <div style={{ padding: '16px', flex: 1 }}>
                                                <p style={{
                                                    fontSize: '14px',
                                                    color: hasContent ? '#374151' : '#9ca3af',
                                                    fontStyle: hasContent ? 'normal' : 'italic',
                                                    margin: 0,
                                                    lineHeight: '1.5',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 4,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {block.content || 'Este bloque aún no tiene contenido. Haz clic en el botón inferior para comenzar a redactar.'}
                                                </p>

                                                {block.file_url && (
                                                    <div style={{
                                                        marginTop: '12px',
                                                        padding: '8px 12px',
                                                        backgroundColor: '#d1fae5',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        color: '#047857',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        🔗 Recurso adjunto disponible
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
                                                <button
                                                    onClick={() => openBlockEditor(block)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px',
                                                        backgroundColor: hasContent ? 'white' : '#10b981',
                                                        color: hasContent ? '#374151' : 'white',
                                                        border: hasContent ? '1px solid #d1d5db' : 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    ✏️ {hasContent ? 'Editar Contenido' : 'Añadir Contenido'}
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

            {/* FULL SCREEN BLOCK EDITOR */}
            {editingBlock && (
                <div className="fixed inset-0 bg-gray-100 z-[100] flex flex-col animate-in slide-in-from-bottom-10 duration-300">

                    {/* Editor Header */}
                    <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm z-20">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setEditingBlock(null)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    Bloque {editingBlock.block_number}
                                    <span className="text-gray-300">|</span>
                                    <span className="text-emerald-600">{editingBlock.title || 'Sin Título'}</span>
                                </h2>
                                <p className="text-sm text-gray-500">Editando contenido</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                className={`
                  px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors
                  ${isPreviewMode ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
                            >
                                {isPreviewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {isPreviewMode ? 'Volver a Editar' : 'Vista Previa'}
                            </button>
                            <div className="h-8 w-px bg-gray-200 mx-2"></div>
                            <button
                                onClick={() => setEditingBlock(null)}
                                className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveBlock}
                                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                                <Save className="h-4 w-4" />
                                Guardar
                            </button>
                        </div>
                    </div>

                    {/* Editor Body */}
                    <div className="flex-1 overflow-hidden flex">

                        {/* LEFT SIDEBAR: GUIDE (Hidden in Preview) */}
                        {!isPreviewMode && (
                            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 hidden lg:block">
                                <div className="mb-8">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-emerald-500" />
                                        Guía Estratégica
                                    </h3>
                                    <div className="space-y-4">
                                        <div className={`p-4 rounded-xl border transition-all ${editingBlock.block_number === 1 ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                            <strong className="block text-gray-900 mb-1">1. Concepto</strong>
                                            <p className="text-sm text-gray-600">Define la idea central. ¿Qué deben aprender?</p>
                                        </div>
                                        <div className={`p-4 rounded-xl border transition-all ${editingBlock.block_number === 2 ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                            <strong className="block text-gray-900 mb-1">2. Valor</strong>
                                            <p className="text-sm text-gray-600">¿Por qué es útil? Beneficio práctico.</p>
                                        </div>
                                        <div className={`p-4 rounded-xl border transition-all ${editingBlock.block_number === 3 ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                            <strong className="block text-gray-900 mb-1">3. Acción</strong>
                                            <p className="text-sm text-gray-600">Pasos concretos para aplicar lo aprendido.</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4 text-blue-500" />
                                        Recursos
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">URL del Recurso</label>
                                        <input
                                            type="text"
                                            value={editorFileUrl}
                                            onChange={(e) => setEditorFileUrl(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                            placeholder="https://..."
                                        />
                                        <button className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
                                            Probar Enlace
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MAIN CONTENT AREA */}
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center">
                            <div className={`
                bg-white shadow-xl transition-all duration-500 flex flex-col
                ${isPreviewMode ? 'w-full max-w-4xl rounded-none min-h-screen p-12' : 'w-full max-w-3xl rounded-xl min-h-[1100px] p-12 my-4'}
              `}>
                                {isPreviewMode ? (
                                    <div className="prose prose-lg max-w-none">
                                        <h1 className="text-4xl font-bold text-gray-900 mb-8">{editorTitle}</h1>
                                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                            {editorContent || <span className="text-gray-400 italic">Sin contenido...</span>}
                                        </div>
                                        {editorFileUrl && (
                                            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                                    <LinkIcon className="h-6 w-6 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">Recurso Adjunto</h4>
                                                    <a href={editorFileUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline break-all">
                                                        {editorFileUrl}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-8 h-full flex flex-col">
                                        <input
                                            type="text"
                                            value={editorTitle}
                                            onChange={(e) => setEditorTitle(e.target.value)}
                                            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent"
                                            placeholder="Título del Bloque"
                                        />
                                        <div className="h-px bg-gray-100 w-full"></div>
                                        <textarea
                                            value={editorContent}
                                            onChange={(e) => setEditorContent(e.target.value)}
                                            className="w-full flex-1 resize-none border-none focus:ring-0 p-0 text-lg leading-relaxed text-gray-700 placeholder-gray-300 bg-transparent"
                                            placeholder="Escribe aquí el contenido..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
