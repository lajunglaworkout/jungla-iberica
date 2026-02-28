import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CollapsibleSection } from './SharedComponents';
import { ChecklistItem } from './EventTemplateTypes';

interface ChecklistSectionProps {
    checklist: ChecklistItem[];
    toggleChecklistItem: (itemId: number, completed: boolean) => void;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({ checklist, toggleChecklistItem }) => {
    return (
        <CollapsibleSection title="CHECKLIST DE TAREAS" icon={CheckCircle2} color="#8b5cf6" defaultOpen={true}>
            {checklist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <CheckCircle2 size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
                    <p style={{ margin: 0 }}>No hay tareas asignadas a este evento.</p>
                    <p style={{ margin: '8px 0 0', fontSize: '13px' }}>Las tareas se generan automáticamente al crear el evento.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Summary */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>{checklist.filter(c => c.completado).length}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Completadas</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>{checklist.filter(c => !c.completado && new Date(c.fecha_limite) >= new Date()).length}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Pendientes</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>{checklist.filter(c => !c.completado && new Date(c.fecha_limite) < new Date()).length}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Vencidas</div>
                        </div>
                    </div>

                    {/* Task list */}
                    {checklist.map(item => {
                        const isOverdue = !item.completado && new Date(item.fecha_limite) < new Date();
                        const isUpcoming = !item.completado && !isOverdue &&
                            (new Date(item.fecha_limite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 3;

                        return (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    backgroundColor: item.completado ? '#f0fdf4' : isOverdue ? '#fef2f2' : isUpcoming ? '#fffbeb' : 'white',
                                    border: `2px solid ${item.completado ? '#86efac' : isOverdue ? '#fca5a5' : isUpcoming ? '#fcd34d' : '#e5e7eb'}`,
                                    borderRadius: '10px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <button
                                    onClick={() => item.id && toggleChecklistItem(item.id, !item.completado)}
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        border: `2px solid ${item.completado ? '#16a34a' : isOverdue ? '#dc2626' : '#d1d5db'}`,
                                        backgroundColor: item.completado ? '#16a34a' : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                >
                                    {item.completado && <CheckCircle2 size={16} color="white" />}
                                </button>

                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: 600,
                                        color: item.completado ? '#16a34a' : isOverdue ? '#dc2626' : '#111827',
                                        textDecoration: item.completado ? 'line-through' : 'none'
                                    }}>
                                        {item.nombre}
                                    </div>
                                    {item.descripcion && (
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                            {item.descripcion}
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: item.completado ? '#16a34a' : isOverdue ? '#dc2626' : isUpcoming ? '#d97706' : '#6b7280'
                                    }}>
                                        {isOverdue && !item.completado && '⚠️ '}
                                        {new Date(item.fecha_limite).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </div>
                                    {item.completado && item.completado_at && (
                                        <div style={{ fontSize: '10px', color: '#16a34a' }}>
                                            ✓ {new Date(item.completado_at).toLocaleDateString('es-ES')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </CollapsibleSection>
    );
};
