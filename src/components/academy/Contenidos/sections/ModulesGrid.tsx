import React from 'react';
import { BookOpen, Plus, Edit3, Trash2, ChevronRight } from 'lucide-react';
import { AcademyModule, AcademyLesson } from '../../../../types/academy';
import { LessonBlock, LessonSortMode } from './ContenidosTypes';

interface ModulesGridProps {
    modules: AcademyModule[];
    lessons: Record<string, AcademyLesson[]>;
    blocks: Record<string, LessonBlock[]>;
    loading: boolean;
    lessonSortMode: LessonSortMode;
    setLessonSortMode: (mode: LessonSortMode) => void;
    getModuleTheme: (title: string) => { primary: string; light: string; border: string };
    openLessonEditor: (lesson: AcademyLesson) => void;
    initiateAddLesson: (moduleId: string) => void;
    initiateEditLesson: (lesson: AcademyLesson, e: React.MouseEvent) => void;
    deleteLesson: (lesson: AcademyLesson, e: React.MouseEvent) => void;
}

export const ModulesGrid: React.FC<ModulesGridProps> = ({
    modules,
    lessons,
    blocks,
    loading,
    lessonSortMode,
    setLessonSortMode,
    getModuleTheme,
    openLessonEditor,
    initiateAddLesson,
    initiateEditLesson,
    deleteLesson,
}) => {
    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-6"></div>
                <p className="text-gray-500 text-lg">Cargando estructura del curso...</p>
            </div>
        );
    }

    if (modules.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm border-dashed">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No hay módulos definidos</h3>
                <p className="text-gray-500">Ejecuta el script de inicialización para comenzar.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {modules.map((module) => {
                const theme = getModuleTheme(module.title);
                return (
                    <div
                        key={module.id}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: `1px solid ${theme.border}`,
                            borderLeft: `6px solid ${theme.primary}`,
                            overflow: 'hidden',
                            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)'
                        }}
                        className="transition-all hover:shadow-md"
                    >
                        {/* Module Header */}
                        <div style={{
                            padding: '16px 24px',
                            borderBottom: `1px solid ${theme.light}`,
                            backgroundColor: theme.light,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '2px' }}>{module.title}</h3>
                                <p style={{ color: '#6b7280', fontSize: '13px' }}>{module.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span style={{
                                    padding: '6px 12px',
                                    backgroundColor: 'white',
                                    border: `1px solid ${theme.primary}`,
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: theme.primary
                                }}>
                                    {lessons[module.id]?.length || 0} Lecciones
                                </span>
                            </div>
                        </div>

                        {/* Lessons List */}
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Sort Selector */}
                            {(lessons[module.id]?.length || 0) > 1 && (
                                <div className="flex justify-end mb-2">
                                    <select
                                        value={lessonSortMode}
                                        onChange={(e) => setLessonSortMode(e.target.value as LessonSortMode)}
                                        className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                                    >
                                        <option value="order">Por orden numérico</option>
                                        <option value="completed">Completadas primero</option>
                                        <option value="pending">Pendientes primero</option>
                                    </select>
                                </div>
                            )}

                            {lessons[module.id]?.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 italic">
                                    No hay lecciones en este módulo.
                                </div>
                            ) : (
                                [...(lessons[module.id] || [])]
                                    .sort((a, b) => {
                                        if (lessonSortMode === 'completed') {
                                            const aCompleted = a.status === 'completed' ? 1 : 0;
                                            const bCompleted = b.status === 'completed' ? 1 : 0;
                                            return bCompleted - aCompleted || a.order - b.order;
                                        } else if (lessonSortMode === 'pending') {
                                            const aCompleted = a.status === 'completed' ? 1 : 0;
                                            const bCompleted = b.status === 'completed' ? 1 : 0;
                                            return aCompleted - bCompleted || a.order - b.order;
                                        }
                                        return a.order - b.order;
                                    })
                                    .map((lesson, lessonIndex) => {
                                        const lessonBlocks = blocks[lesson.id] || [];
                                        const completedBlocks = lessonBlocks.filter(b => b.content).length;
                                        const totalBlocks = 3;
                                        const lessonNumber = `${module.order}.${lessonIndex + 1}`;

                                        return (
                                            <div
                                                key={lesson.id}
                                                style={{
                                                    backgroundColor: 'white',
                                                    border: '2px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    padding: '20px 24px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                                }}
                                                className="hover:shadow-md hover:border-emerald-300 group"
                                                onClick={() => openLessonEditor(lesson)}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                    <div className="flex items-center gap-6">
                                                        <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                            {lessonNumber}
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

                                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${lesson.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {lesson.status === 'completed' ? 'Completado' : 'En Desarrollo'}
                                                        </span>
                                                        <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all">
                                                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500" />
                                                        </div>
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
                );
            })}
        </div>
    );
};
