import React from 'react';
import { Users, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { CollapsibleSection, inputStyle } from './SharedComponents';
import { Evento, Participante } from './EventTemplateTypes';

interface AsistentesSectionProps {
    evento: Evento;
    participantes: Participante[];
    showCapacityWarning: boolean;
    setShowCapacityWarning: (v: boolean) => void;
    showParticipantesModal: boolean;
    setShowParticipantesModal: (v: boolean) => void;
    quickAddName: string;
    setQuickAddName: (v: string) => void;
    quickAddEmail: string;
    setQuickAddEmail: (v: string) => void;
    quickAddTelefono: string;
    setQuickAddTelefono: (v: string) => void;
    quickAddHaPagado: boolean;
    setQuickAddHaPagado: (v: boolean) => void;
    addingParticipante: boolean;
    saving: boolean;
    quickAddParticipante: (forceAdd?: boolean) => void;
    confirmExpandCapacity: () => void;
    toggleAsistencia: (index: number) => void;
    removeParticipante: (index: number) => void;
    saveParticipantes: () => void;
}

export const AsistentesSection: React.FC<AsistentesSectionProps> = ({
    evento,
    participantes,
    showCapacityWarning,
    setShowCapacityWarning,
    showParticipantesModal,
    setShowParticipantesModal,
    quickAddName,
    setQuickAddName,
    quickAddEmail,
    setQuickAddEmail,
    quickAddTelefono,
    setQuickAddTelefono,
    quickAddHaPagado,
    setQuickAddHaPagado,
    addingParticipante,
    saving,
    quickAddParticipante,
    confirmExpandCapacity,
    toggleAsistencia,
    removeParticipante,
    saveParticipantes,
}) => {
    return (
        <CollapsibleSection
            title={`ASISTENTES (${participantes.length}${evento?.plazas_max ? `/${evento.plazas_max}` : ''})`}
            icon={Users}
            color="#84cc16"
            defaultOpen={false}
        >
            {/* Capacity Warning Modal */}
            {showCapacityWarning && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '400px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 12px', color: '#111827' }}>⚠️ Plazas Completas</h3>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                            Se ha alcanzado el máximo de <strong>{evento?.plazas_max}</strong> plazas.
                            ¿Deseas ampliar las plazas para incluir este asistente?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowCapacityWarning(false)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmExpandCapacity}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#84cc16',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Ampliar +10 plazas
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Participantes List Modal */}
            {showParticipantesModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '80vh',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: '#f7fee7'
                        }}>
                            <h3 style={{ margin: 0, color: '#4d7c0f' }}>
                                Lista de Asistentes ({participantes.length}{evento?.plazas_max ? `/${evento.plazas_max}` : ''})
                            </h3>
                            <button
                                onClick={() => setShowParticipantesModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>#</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>NOMBRE</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>EMAIL</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>TELÉFONO</th>
                                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>ASISTIÓ</th>
                                        <th style={{ padding: '12px', width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participantes.map((p, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '12px', color: '#6b7280' }}>{idx + 1}</td>
                                            <td style={{ padding: '12px', fontWeight: 500 }}>{p.nombre || '-'}</td>
                                            <td style={{ padding: '12px', color: '#6b7280' }}>{p.email || '-'}</td>
                                            <td style={{ padding: '12px', color: '#6b7280' }}>{p.telefono || '-'}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => toggleAsistencia(idx)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: p.asistio ? '#dcfce7' : '#f3f4f6',
                                                        color: p.asistio ? '#16a34a' : '#6b7280',
                                                        border: `1px solid ${p.asistio ? '#16a34a' : '#d1d5db'}`,
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {p.asistio ? '✓ Sí' : 'No'}
                                                </button>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button
                                                    onClick={() => removeParticipante(idx)}
                                                    style={{ padding: '6px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={14} color="#dc2626" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {participantes.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                                                No hay asistentes registrados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '16px', color: '#6b7280', fontSize: '14px' }}>
                                <span><strong>{participantes.length}</strong> inscritos</span>
                                <span style={{ color: '#16a34a' }}><strong>{participantes.filter(p => p.asistio).length}</strong> asistieron</span>
                            </div>
                            <button
                                onClick={saveParticipantes}
                                disabled={saving}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#84cc16',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Form + Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '20px',
                alignItems: 'start'
            }}>
                {/* Quick Add Form */}
                <div style={{
                    padding: '20px',
                    backgroundColor: '#f7fee7',
                    borderRadius: '12px',
                    border: '1px solid #d9f99d'
                }}>
                    <h4 style={{ margin: '0 0 16px', color: '#4d7c0f', fontWeight: 600, fontSize: '14px' }}>
                        ➕ AÑADIR ASISTENTE RÁPIDO
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>Nombre *</label>
                            <input
                                type="text"
                                value={quickAddName}
                                onChange={(e) => setQuickAddName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && quickAddParticipante()}
                                style={{ ...inputStyle, padding: '10px 12px', backgroundColor: 'white' }}
                                placeholder="Nombre completo..."
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>Email</label>
                            <input
                                type="email"
                                value={quickAddEmail}
                                onChange={(e) => setQuickAddEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && quickAddParticipante()}
                                style={{ ...inputStyle, padding: '10px 12px', backgroundColor: 'white' }}
                                placeholder="email@ejemplo.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>Teléfono</label>
                            <input
                                type="tel"
                                value={quickAddTelefono}
                                onChange={(e) => setQuickAddTelefono(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && quickAddParticipante()}
                                style={{ ...inputStyle, padding: '10px 12px', backgroundColor: 'white' }}
                                placeholder="600..."
                            />
                        </div>
                        <button
                            onClick={() => quickAddParticipante()}
                            disabled={addingParticipante || !quickAddName.trim()}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: addingParticipante ? '#9ca3af' : '#84cc16',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: addingParticipante ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Plus size={16} />
                            {addingParticipante ? 'Añadiendo...' : 'Añadir'}
                        </button>
                    </div>

                    {/* Payment checkbox for paid events */}
                    {evento?.modelo_economico === 'pago' && (
                        <div style={{
                            marginTop: '12px',
                            padding: '12px 16px',
                            backgroundColor: quickAddHaPagado ? '#dcfce7' : '#fef3c7',
                            borderRadius: '8px',
                            border: `2px solid ${quickAddHaPagado ? '#16a34a' : '#f59e0b'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <input
                                type="checkbox"
                                id="haPagado"
                                checked={quickAddHaPagado}
                                onChange={(e) => setQuickAddHaPagado(e.target.checked)}
                                style={{ width: '20px', height: '20px', accentColor: '#16a34a', cursor: 'pointer' }}
                            />
                            <label htmlFor="haPagado" style={{ cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 500, color: quickAddHaPagado ? '#16a34a' : '#92400e' }}>
                                    {quickAddHaPagado ? '✅ Pago confirmado' : '💰 ¿Ha pagado la inscripción?'}
                                </span>
                                <span style={{
                                    padding: '4px 12px',
                                    backgroundColor: 'white',
                                    borderRadius: '20px',
                                    fontWeight: 700,
                                    color: '#16a34a',
                                    fontSize: '14px'
                                }}>
                                    {evento.precio?.toFixed(2)} €
                                </span>
                            </label>
                        </div>
                    )}

                    {evento?.plazas_max && participantes.length >= evento.plazas_max && (
                        <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            backgroundColor: '#fef3c7',
                            borderRadius: '6px',
                            color: '#92400e',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <AlertTriangle size={16} />
                            Plazas completas ({participantes.length}/{evento.plazas_max})
                        </div>
                    )}
                </div>

                {/* Stats + View List Button */}
                <div style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center',
                    minWidth: '180px'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: 700, color: '#84cc16' }}>
                        {participantes.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                        {evento?.plazas_max ? `de ${evento.plazas_max} plazas` : 'inscritos'}
                    </div>
                    {evento?.plazas_max && (
                        <div style={{
                            height: '6px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${Math.min(100, (participantes.length / evento.plazas_max) * 100)}%`,
                                backgroundColor: participantes.length >= evento.plazas_max ? '#f59e0b' : '#84cc16',
                                borderRadius: '3px',
                                transition: 'width 0.3s'
                            }} />
                        </div>
                    )}
                    <button
                        onClick={() => setShowParticipantesModal(true)}
                        style={{
                            padding: '10px 16px',
                            backgroundColor: '#f7fee7',
                            color: '#4d7c0f',
                            border: '1px solid #d9f99d',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: '13px',
                            width: '100%'
                        }}
                    >
                        Ver Lista Completa
                    </button>
                </div>
            </div>

            {/* Recent Additions Preview */}
            {participantes.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ margin: '0 0 12px', color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>
                        ÚLTIMOS AÑADIDOS
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {participantes.slice(-5).reverse().map((p, idx) => (
                            <span key={idx} style={{
                                padding: '6px 12px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '20px',
                                fontSize: '13px',
                                color: '#374151'
                            }}>
                                {p.nombre}
                            </span>
                        ))}
                        {participantes.length > 5 && (
                            <span style={{
                                padding: '6px 12px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '20px',
                                fontSize: '13px',
                                color: '#6b7280'
                            }}>
                                +{participantes.length - 5} más
                            </span>
                        )}
                    </div>
                </div>
            )}
        </CollapsibleSection>
    );
};
