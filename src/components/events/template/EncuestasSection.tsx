import React from 'react';
import { MessageSquare, Plus, Star } from 'lucide-react';
import { CollapsibleSection, StarRating } from './SharedComponents';
import { Encuesta, EncuestaResumen, Participante } from './EventTemplateTypes';

interface EncuestasSectionProps {
    encuestas: Encuesta[];
    encuestaResumen: EncuestaResumen;
    participantes: Participante[];
    participantesSinEncuesta: Participante[];
    showEncuestaForm: boolean;
    setShowEncuestaForm: (v: boolean) => void;
    selectedParticipanteId: number | null;
    setSelectedParticipanteId: (v: number | null) => void;
    encuestaForm: Partial<Encuesta>;
    setEncuestaForm: (v: Partial<Encuesta>) => void;
    savingEncuesta: boolean;
    handleParticipanteSelectForEncuesta: (participanteId: number) => void;
    saveEncuesta: () => void;
}

export const EncuestasSection: React.FC<EncuestasSectionProps> = ({
    encuestas,
    encuestaResumen,
    participantes,
    participantesSinEncuesta,
    showEncuestaForm,
    setShowEncuestaForm,
    selectedParticipanteId,
    setSelectedParticipanteId,
    encuestaForm,
    setEncuestaForm,
    savingEncuesta,
    handleParticipanteSelectForEncuesta,
    saveEncuesta,
}) => {
    return (
        <CollapsibleSection title={`ENCUESTAS (${encuestas.length})`} icon={MessageSquare} color="#f59e0b" defaultOpen={false}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706' }}>{encuestaResumen.media_general || 0}</div>
                    <div style={{ fontSize: '11px', color: '#92400e' }}>Media General</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>{encuestaResumen.recomendaria_pct || 0}%</div>
                    <div style={{ fontSize: '11px', color: '#047857' }}>Recomendarían</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb' }}>{encuestas.length}</div>
                    <div style={{ fontSize: '11px', color: '#1e40af' }}>Encuestas</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#6b7280' }}>{participantesSinEncuesta.length}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Pendientes</div>
                </div>
            </div>

            {/* Add Survey Form */}
            {!showEncuestaForm ? (
                <button
                    onClick={() => setShowEncuestaForm(true)}
                    disabled={participantesSinEncuesta.length === 0}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: participantesSinEncuesta.length > 0 ? '#fef3c7' : '#f3f4f6',
                        border: '2px dashed #fbbf24',
                        borderRadius: '12px',
                        cursor: participantesSinEncuesta.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: participantesSinEncuesta.length > 0 ? '#92400e' : '#9ca3af',
                        fontWeight: 600,
                        marginBottom: '20px'
                    }}
                >
                    <Plus size={20} />
                    {participantesSinEncuesta.length > 0
                        ? `Registrar Encuesta (${participantesSinEncuesta.length} asistentes pendientes)`
                        : 'Todos los asistentes tienen encuesta'}
                </button>
            ) : (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#fffbeb',
                    borderRadius: '12px',
                    border: '1px solid #fde68a',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, color: '#92400e', fontWeight: 600 }}>📋 Nueva Encuesta de Satisfacción</h4>
                        <button
                            onClick={() => { setShowEncuestaForm(false); setSelectedParticipanteId(null); }}
                            style={{ padding: '6px 12px', backgroundColor: '#fef3c7', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                        >
                            Cancelar
                        </button>
                    </div>

                    {/* Participant Selection */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#78350f' }}>
                            Seleccionar Asistente *
                        </label>
                        <select
                            value={selectedParticipanteId || ''}
                            onChange={(e) => handleParticipanteSelectForEncuesta(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #fde68a',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">-- Selecciona un asistente --</option>
                            {participantesSinEncuesta.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre} {p.asistio ? '✅' : '❓'}
                                </option>
                            ))}
                        </select>
                        <p style={{ fontSize: '11px', color: '#92400e', marginTop: '4px' }}>
                            Al seleccionar se marcará automáticamente como "asistió"
                        </p>
                    </div>

                    {selectedParticipanteId && (
                        <>
                            {/* Ratings */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                {[
                                    { key: 'puntuacion_general', label: 'General' },
                                    { key: 'puntuacion_organizacion', label: 'Organización' },
                                    { key: 'puntuacion_contenido', label: 'Contenido' }
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#78350f', marginBottom: '6px' }}>{label}</label>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setEncuestaForm({ ...encuestaForm, [key]: star })}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                                                >
                                                    <Star
                                                        size={24}
                                                        fill={((encuestaForm as Record<string, number>)[key] || 0) >= star ? '#f59e0b' : 'transparent'}
                                                        color={((encuestaForm as Record<string, number>)[key] || 0) >= star ? '#f59e0b' : '#d1d5db'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recommend */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#78350f', marginBottom: '6px' }}>¿Recomendaría?</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setEncuestaForm({ ...encuestaForm, recomendaria: true })}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            border: `2px solid ${encuestaForm.recomendaria ? '#16a34a' : '#e5e7eb'}`,
                                            borderRadius: '8px',
                                            backgroundColor: encuestaForm.recomendaria ? '#dcfce7' : 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            fontWeight: 500
                                        }}
                                    >
                                        👍 Sí
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEncuestaForm({ ...encuestaForm, recomendaria: false })}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            border: `2px solid ${encuestaForm.recomendaria === false ? '#dc2626' : '#e5e7eb'}`,
                                            borderRadius: '8px',
                                            backgroundColor: encuestaForm.recomendaria === false ? '#fee2e2' : 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            fontWeight: 500
                                        }}
                                    >
                                        👎 No
                                    </button>
                                </div>
                            </div>

                            {/* Comments */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#78350f', marginBottom: '6px' }}>Comentarios</label>
                                <textarea
                                    value={encuestaForm.comentarios || ''}
                                    onChange={(e) => setEncuestaForm({ ...encuestaForm, comentarios: e.target.value })}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #fde68a', borderRadius: '8px', minHeight: '60px', fontSize: '14px' }}
                                    placeholder="Opinión del asistente..."
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={saveEncuesta}
                                disabled={savingEncuesta}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: savingEncuesta ? '#9ca3af' : '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: savingEncuesta ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {savingEncuesta ? 'Guardando...' : '✅ Guardar Encuesta'}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Recent Surveys List */}
            {encuestas.length > 0 && (
                <div>
                    <h4 style={{ margin: '0 0 12px', color: '#92400e', fontSize: '13px', fontWeight: 500 }}>
                        ENCUESTAS REGISTRADAS
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {encuestas.slice(0, 5).map(e => (
                            <div key={e.id} style={{
                                padding: '12px 16px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 500, color: '#111827' }}>{e.participante_nombre}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <StarRating value={e.puntuacion_general || 0} size={14} readOnly />
                                        {e.recomendaria ? (
                                            <span style={{ fontSize: '12px', color: '#16a34a' }}>👍 Recomienda</span>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#dc2626' }}>👎 No recomienda</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {encuestas.length > 5 && (
                            <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', padding: '8px' }}>
                                +{encuestas.length - 5} encuestas más
                            </div>
                        )}
                    </div>
                </div>
            )}
        </CollapsibleSection>
    );
};
