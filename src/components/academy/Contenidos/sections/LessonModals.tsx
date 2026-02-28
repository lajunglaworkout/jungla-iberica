import React from 'react';
import { AcademyLesson } from '../../../../types/academy';
import { LessonBlock } from './ContenidosTypes';

// ---- Add Lesson Modal ----
interface AddLessonModalProps {
    showAddLessonModal: boolean;
    newLessonTitle: string;
    setNewLessonTitle: (v: string) => void;
    setShowAddLessonModal: (v: boolean) => void;
    confirmAddLesson: () => void;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({
    showAddLessonModal,
    newLessonTitle,
    setNewLessonTitle,
    setShowAddLessonModal,
    confirmAddLesson,
}) => {
    if (!showAddLessonModal) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '12px',
                width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{
                    padding: '24px', borderBottom: '1px solid #e5e7eb',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Nueva Lección</h2>
                    <button
                        onClick={() => setShowAddLessonModal(false)}
                        style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Título de la Lección
                    </label>
                    <input
                        type="text"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
                        placeholder="Ej: Introducción a RRHH"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && confirmAddLesson()}
                    />
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={() => setShowAddLessonModal(false)}
                        style={{ padding: '10px 20px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirmAddLesson}
                        disabled={!newLessonTitle.trim()}
                        style={{
                            padding: '10px 20px', backgroundColor: '#10b981', color: 'white',
                            border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600',
                            cursor: newLessonTitle.trim() ? 'pointer' : 'not-allowed',
                            opacity: newLessonTitle.trim() ? 1 : 0.5
                        }}
                    >
                        Crear Lección
                    </button>
                </div>
            </div>
        </div>
    );
};

// ---- Edit Lesson Modal ----
interface EditLessonModalProps {
    showEditLessonModal: boolean;
    editLessonTitle: string;
    setEditLessonTitle: (v: string) => void;
    editLessonOrder: number;
    setEditLessonOrder: (v: number) => void;
    setShowEditLessonModal: (v: boolean) => void;
    confirmEditLesson: () => void;
}

export const EditLessonModal: React.FC<EditLessonModalProps> = ({
    showEditLessonModal,
    editLessonTitle,
    setEditLessonTitle,
    editLessonOrder,
    setEditLessonOrder,
    setShowEditLessonModal,
    confirmEditLesson,
}) => {
    if (!showEditLessonModal) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '12px',
                width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Editar Lección</h2>
                    <button
                        onClick={() => setShowEditLessonModal(false)}
                        style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Título de la Lección
                    </label>
                    <input
                        type="text"
                        value={editLessonTitle}
                        onChange={(e) => setEditLessonTitle(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
                        placeholder="Ej: Introducción a RRHH"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && confirmEditLesson()}
                    />
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Orden de la Lección
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={editLessonOrder}
                        onChange={(e) => setEditLessonOrder(parseInt(e.target.value) || 1)}
                        style={{ width: '100px', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                        Menor número = aparece primero en la lista
                    </p>
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={() => setShowEditLessonModal(false)}
                        style={{ padding: '10px 20px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirmEditLesson}
                        disabled={!editLessonTitle.trim()}
                        style={{
                            padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white',
                            border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600',
                            cursor: editLessonTitle.trim() ? 'pointer' : 'not-allowed',
                            opacity: editLessonTitle.trim() ? 1 : 0.5
                        }}
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

// ---- Lesson Detail Modal ----
interface LessonDetailModalProps {
    selectedLesson: AcademyLesson | null;
    blocks: Record<string, LessonBlock[]>;
    setSelectedLesson: (v: AcademyLesson | null) => void;
    openBlockEditor: (block: LessonBlock) => void;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
    selectedLesson,
    blocks,
    setSelectedLesson,
    openBlockEditor,
}) => {
    if (!selectedLesson) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '24px'
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '12px', width: '100%',
                maxWidth: '1200px', maxHeight: '95vh', overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}
                    >
                        ×
                    </button>
                </div>

                {/* Blocks Grid */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#f9fafb' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
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
                                    {/* Block Header */}
                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: hasContent ? '#d1fae5' : '#f9fafb',
                                        borderBottom: `1px solid ${hasContent ? '#a7f3d0' : '#e5e7eb'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '600', color: hasContent ? '#047857' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Bloque {block.block_number}
                                            </span>
                                            {hasContent && (
                                                <div style={{ width: '20px', height: '20px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
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
                                            <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#d1fae5', borderRadius: '6px', fontSize: '12px', color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                Recurso adjunto disponible
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
                                        <button
                                            onClick={() => openBlockEditor(block)}
                                            style={{
                                                width: '100%', padding: '10px',
                                                backgroundColor: hasContent ? 'white' : '#10b981',
                                                color: hasContent ? '#374151' : 'white',
                                                border: hasContent ? '1px solid #d1d5db' : 'none',
                                                borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                            }}
                                        >
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
    );
};
