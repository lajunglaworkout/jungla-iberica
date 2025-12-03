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

    // Edit/Delete Lesson State
    const [showEditLessonModal, setShowEditLessonModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState<AcademyLesson | null>(null);
    const [editLessonTitle, setEditLessonTitle] = useState('');

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

    const initiateEditLesson = (lesson: AcademyLesson, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the lesson editor
        setEditingLesson(lesson);
        setEditLessonTitle(lesson.title);
        setShowEditLessonModal(true);
    };

    const confirmEditLesson = async () => {
        if (!editingLesson || !editLessonTitle.trim()) return;

        try {
            const { error } = await supabase
                .from('academy_lessons')
                .update({ title: editLessonTitle })
                .eq('id', editingLesson.id);

            if (error) throw error;

            // Update local state
            setLessons(prev => ({
                ...prev,
                [editingLesson.module_id]: prev[editingLesson.module_id].map(l =>
                    l.id === editingLesson.id ? { ...l, title: editLessonTitle } : l
                )
            }));

            setShowEditLessonModal(false);
            setEditingLesson(null);
            setEditLessonTitle('');
        } catch (error) {
            console.error('Error updating lesson:', error);
            alert('Error al actualizar la lección');
        }
    };

    const deleteLesson = async (lesson: AcademyLesson, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the lesson editor

        if (!confirm(`¿Estás seguro de que deseas eliminar la lección "${lesson.title}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            // First delete all blocks
            const { error: blocksError } = await supabase
                .from('academy_lesson_blocks')
                .delete()
                .eq('lesson_id', lesson.id);

            if (blocksError) throw blocksError;

            // Then delete the lesson
            const { error: lessonError } = await supabase
                .from('academy_lessons')
                .delete()
                .eq('id', lesson.id);

            if (lessonError) throw lessonError;

            // Update local state
            setLessons(prev => ({
                ...prev,
                [lesson.module_id]: prev[lesson.module_id].filter(l => l.id !== lesson.id)
            }));

            // Remove blocks from state
            setBlocks(prev => {
                const newBlocks = { ...prev };
                delete newBlocks[lesson.id];
                return newBlocks;
            });
        } catch (error) {
            console.error('Error deleting lesson:', error);
            alert('Error al eliminar la lección');
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

                                                <div className="flex items-center gap-3">
                                                    {/* Edit and Delete buttons */}
                                                    <button
                                                        onClick={(e) => initiateEditLesson(lesson, e)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        title="Editar lección"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => deleteLesson(lesson, e)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        title="Eliminar lección"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>

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

            {/* Edit Lesson Modal - ESTILO CRM */}
            {showEditLessonModal && (
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
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Editar Lección</h2>
                            <button
                                onClick={() => setShowEditLessonModal(false)}
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
                                value={editLessonTitle}
                                onChange={(e) => setEditLessonTitle(e.target.value)}
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
                                onKeyDown={(e) => e.key === 'Enter' && confirmEditLesson()}
                            />
                        </div>

                        <div style={{
                            padding: '16px 24px',
                            backgroundColor: '#f9fafb',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => setShowEditLessonModal(false)}
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
                                onClick={confirmEditLesson}
                                disabled={!editLessonTitle.trim()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: editLessonTitle.trim() ? 'pointer' : 'not-allowed',
                                    opacity: editLessonTitle.trim() ? 1 : 0.5
                                }}
                            >
                                ✓ Guardar Cambios
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

            {/* FULL SCREEN BLOCK EDITOR - ESTILO CRM CON 3 COLUMNAS */}
            {editingBlock && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#f9fafb',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <div style={{
                        backgroundColor: 'white',
                        borderBottom: '1px solid #e5e7eb',
                        padding: '16px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={() => setEditingBlock(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '6px'
                                }}
                            >
                                <ArrowLeft style={{ height: '20px', width: '20px' }} />
                            </button>
                            <div>
                                <h1 style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#111827',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    Bloque {editingBlock.block_number}
                                    <span style={{ color: '#d1d5db' }}>|</span>
                                    <span style={{ color: '#10b981' }}>{editingBlock.title || 'Sin Título'}</span>
                                </h1>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                                    Editando contenido del bloque
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: isPreviewMode ? '#d1fae5' : '#f3f4f6',
                                    color: isPreviewMode ? '#047857' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {isPreviewMode ? '✏️ Editar' : '👁 Vista Previa'}
                            </button>
                            <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d5db' }}></div>
                            <button
                                onClick={() => setEditingBlock(null)}
                                style={{
                                    padding: '8px 16px',
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
                                onClick={saveBlock}
                                style={{
                                    padding: '8px 20px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Save style={{ height: '16px', width: '16px' }} />
                                Guardar
                            </button>
                        </div>
                    </div>

                    {/* Body con 3 columnas - ESTILO CRM */}
                    {isPreviewMode ? (
                        // PREVIEW MODE
                        <div style={{
                            flex: 1,
                            overflow: 'auto',
                            padding: '24px',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '48px',
                                borderRadius: '8px',
                                maxWidth: '900px',
                                width: '100%',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                            }}>
                                <h1 style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: '#111827',
                                    marginBottom: '24px'
                                }}>
                                    {editorTitle || 'Sin título'}
                                </h1>
                                <div style={{
                                    fontSize: '16px',
                                    color: '#374151',
                                    lineHeight: '1.75',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {editorContent || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Sin contenido...</span>}
                                </div>
                                {editorFileUrl && (
                                    <div style={{
                                        marginTop: '32px',
                                        padding: '16px',
                                        backgroundColor: '#f0fdf4',
                                        border: '1px solid #86efac',
                                        borderRadius: '8px'
                                    }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#047857', margin: '0 0 8px 0' }}>
                                            🔗 Recurso Adjunto
                                        </h4>
                                        <a
                                            href={editorFileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ fontSize: '14px', color: '#10b981', wordBreak: 'break-all' }}
                                        >
                                            {editorFileUrl}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // EDIT MODE - 3 COLUMNAS
                        <div style={{
                            flex: 1,
                            overflow: 'hidden',
                            display: 'grid',
                            gridTemplateColumns: '280px 1fr 300px',
                            gap: 0
                        }}>
                            {/* COLUMNA IZQUIERDA: Guía Estratégica (3 preguntas) */}
                            <div style={{
                                backgroundColor: '#f0fdf4',
                                borderRight: '1px solid #e5e7eb',
                                overflow: 'auto',
                                padding: '24px'
                            }}>
                                <h3 style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#047857',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <Sparkles style={{ height: '14px', width: '14px' }} />
                                    Guía Estratégica
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: editingBlock.block_number === 1 ? 'white' : '#f0fdf4',
                                        border: editingBlock.block_number === 1 ? '2px solid #10b981' : '1px solid #d1fae5',
                                        borderRadius: '8px'
                                    }}>
                                        <h4 style={{
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            color: '#111827',
                                            marginBottom: '6px'
                                        }}>
                                            1. Concepto
                                        </h4>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            margin: 0,
                                            lineHeight: '1.5'
                                        }}>
                                            ¿Qué quiero transmitir exactamente? Define la idea central. ¿Qué deben aprender?
                                        </p>
                                    </div>

                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: editingBlock.block_number === 2 ? 'white' : '#f0fdf4',
                                        border: editingBlock.block_number === 2 ? '2px solid #10b981' : '1px solid #d1fae5',
                                        borderRadius: '8px'
                                    }}>
                                        <h4 style={{
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            color: '#111827',
                                            marginBottom: '6px'
                                        }}>
                                            2. Valor
                                        </h4>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            margin: 0,
                                            lineHeight: '1.5'
                                        }}>
                                            ¿Por qué es útil? ¿Qué es lo que aporta? Beneficio práctico.
                                        </p>
                                    </div>

                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: editingBlock.block_number === 3 ? 'white' : '#f0fdf4',
                                        border: editingBlock.block_number === 3 ? '2px solid #10b981' : '1px solid #d1fae5',
                                        borderRadius: '8px'
                                    }}>
                                        <h4 style={{
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            color: '#111827',
                                            marginBottom: '6px'
                                        }}>
                                            3. Acción
                                        </h4>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            margin: 0,
                                            lineHeight: '1.5'
                                        }}>
                                            ¿Cómo se lleva a la práctica? Pasos concretos para aplicar lo aprendido.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA CENTRAL: Contenido Principal */}
                            <div style={{
                                backgroundColor: 'white',
                                overflow: 'auto',
                                padding: '24px'
                            }}>
                                {/* Título del Bloque */}
                                <div style={{
                                    padding: '16px 24px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '8px'
                                    }}>
                                        Título del Bloque
                                    </label>
                                    <input
                                        type="text"
                                        value={editorTitle}
                                        onChange={(e) => setEditorTitle(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            backgroundColor: 'white'
                                        }}
                                        placeholder="Ej: Introducción al concepto..."
                                    />
                                </div>

                                {/* Ideas Principales */}
                                <div style={{
                                    padding: '16px 24px',
                                    backgroundColor: '#fffbeb',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    border: '1px solid #fde68a'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#92400e',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '8px'
                                    }}>
                                        💡 Ideas Principales
                                    </label>
                                    <textarea
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #fbbf24',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            backgroundColor: 'white',
                                            resize: 'vertical'
                                        }}
                                        placeholder="• Idea 1&#10;• Idea 2&#10;• Idea 3"
                                    />
                                </div>

                                {/* Puntos Clave */}
                                <div style={{
                                    padding: '16px 24px',
                                    backgroundColor: '#eff6ff',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    border: '1px solid #93c5fd'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#1e40af',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '8px'
                                    }}>
                                        ⭐ Puntos Más Importantes
                                    </label>
                                    <textarea
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #3b82f6',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            backgroundColor: 'white',
                                            resize: 'vertical'
                                        }}
                                        placeholder="• Punto clave 1&#10;• Punto clave 2&#10;• Punto clave 3"
                                    />
                                </div>

                                {/* Contenido Completo */}
                                <div style={{
                                    padding: '16px 24px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '8px'
                                    }}>
                                        📝 Contenido Completo
                                    </label>
                                    <textarea
                                        value={editorContent}
                                        onChange={(e) => setEditorContent(e.target.value)}
                                        rows={15}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            lineHeight: '1.75',
                                            backgroundColor: 'white',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                        placeholder="Escribe aquí el contenido completo del bloque...&#10;&#10;Puedes desarrollar las ideas principales y puntos clave que definiste arriba."
                                    />
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: Archivos y Enlaces */}
                            <div style={{
                                backgroundColor: '#fef3c7',
                                borderLeft: '1px solid #e5e7eb',
                                overflow: 'auto',
                                padding: '24px'
                            }}>
                                <h3 style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#92400e',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <LinkIcon style={{ height: '14px', width: '14px' }} />
                                    Recursos
                                </h3>

                                {/* URL del Recurso */}
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    border: '1px solid #fbbf24'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#92400e',
                                        marginBottom: '8px'
                                    }}>
                                        🔗 URL del Recurso
                                    </label>
                                    <input
                                        type="text"
                                        value={editorFileUrl}
                                        onChange={(e) => setEditorFileUrl(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            marginBottom: '8px'
                                        }}
                                        placeholder="https://..."
                                    />
                                    <button style={{
                                        width: '100%',
                                        padding: '8px',
                                        backgroundColor: '#fbbf24',
                                        color: '#78350f',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}>
                                        Probar Enlace
                                    </button>
                                </div>

                                {/* Subir Archivos */}
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #fbbf24'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#92400e',
                                        marginBottom: '8px'
                                    }}>
                                        📎 Subir Archivo
                                    </label>
                                    <div style={{
                                        padding: '24px',
                                        border: '2px dashed #fbbf24',
                                        borderRadius: '6px',
                                        textAlign: 'center',
                                        backgroundColor: '#fffbeb',
                                        cursor: 'pointer'
                                    }}>
                                        <Upload style={{
                                            height: '32px',
                                            width: '32px',
                                            color: '#f59e0b',
                                            margin: '0 auto 8px'
                                        }} />
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#92400e',
                                            margin: 0
                                        }}>
                                            Click para subir<br />
                                            <span style={{ fontSize: '11px', color: '#a16207' }}>
                                                PDF, DOC, IMG...
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Ayuda */}
                                <div style={{
                                    marginTop: '24px',
                                    padding: '12px',
                                    backgroundColor: '#fef3c7',
                                    borderRadius: '6px',
                                    border: '1px solid #fbbf24'
                                }}>
                                    <p style={{
                                        fontSize: '11px',
                                        color: '#92400e',
                                        margin: 0,
                                        lineHeight: '1.5'
                                    }}>
                                        💡 <strong>Tip:</strong> Los archivos se subirán a Supabase Storage y los enlaces se validarán automáticamente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
