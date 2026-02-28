import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CollapsibleSection, FormField, inputStyle, selectStyle } from './SharedComponents';
import { Informe, EncuestaResumen } from './EventTemplateTypes';

interface InformeFinalSectionProps {
    informe: Informe;
    setInforme: (informe: Informe) => void;
    participantesCount: number;
    balance: number;
    encuestaResumen: EncuestaResumen;
    saving: boolean;
    saveInforme: () => void;
}

export const InformeFinalSection: React.FC<InformeFinalSectionProps> = ({
    informe,
    setInforme,
    participantesCount,
    balance,
    encuestaResumen,
    saving,
    saveInforme,
}) => {
    return (
        <CollapsibleSection title="INFORME FINAL" icon={CheckCircle2} color="#22c55e" defaultOpen={false}>
            {/* Resumen rápido arriba */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '12px',
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{participantesCount}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Asistentes</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: balance >= 0 ? '#16a34a' : '#dc2626' }}>
                        {balance >= 0 ? '+' : ''}{balance.toFixed(0)}€
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Balance</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#f59e0b' }}>
                        {informe.valoracion_encargado || '-'}/5
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Val. Encargado</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#3b82f6' }}>
                        {encuestaResumen.total > 0 ? `${encuestaResumen.media_general}/5` : '-'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Val. Usuarios</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#6b7280' }}>{encuestaResumen.total}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Encuestas</div>
                </div>
            </div>

            <h4 style={{ margin: '0 0 16px', color: '#374151', fontWeight: 600 }}>Evaluación de Objetivos</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { key: 'objetivo_comunidad', label: 'Comunidad' },
                    { key: 'objetivo_ventas', label: 'Ventas' },
                    { key: 'objetivo_organizacion', label: 'Organización' },
                    { key: 'objetivo_participacion', label: 'Participación' }
                ].map(obj => (
                    <div key={obj.key} style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: '#047857' }}>{obj.label}</label>
                        <select
                            value={informe[obj.key as keyof Informe] || ''}
                            onChange={(e) => setInforme({ ...informe, [obj.key]: e.target.value })}
                            style={selectStyle}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="no_cumplido">❌ No Cumplido</option>
                            <option value="parcial">⚠️ Parcial</option>
                            <option value="cumplido">✅ Cumplido</option>
                            <option value="superado">🏆 Superado</option>
                        </select>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <FormField label="Conclusiones">
                    <textarea
                        value={informe.conclusiones || ''}
                        onChange={(e) => setInforme({ ...informe, conclusiones: e.target.value })}
                        style={{ ...inputStyle, minHeight: '100px' }}
                        placeholder="Resumen y conclusiones del evento..."
                    />
                </FormField>
                <FormField label="Aprendizajes">
                    <textarea
                        value={informe.aprendizajes || ''}
                        onChange={(e) => setInforme({ ...informe, aprendizajes: e.target.value })}
                        style={{ ...inputStyle, minHeight: '100px' }}
                        placeholder="Qué hemos aprendido..."
                    />
                </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <FormField label="✅ Pros">
                    <textarea
                        value={informe.pros || ''}
                        onChange={(e) => setInforme({ ...informe, pros: e.target.value })}
                        style={{ ...inputStyle, minHeight: '80px', borderColor: '#86efac' }}
                        placeholder="Aspectos positivos..."
                    />
                </FormField>
                <FormField label="❌ Contras">
                    <textarea
                        value={informe.contras || ''}
                        onChange={(e) => setInforme({ ...informe, contras: e.target.value })}
                        style={{ ...inputStyle, minHeight: '80px', borderColor: '#fca5a5' }}
                        placeholder="Aspectos a mejorar..."
                    />
                </FormField>
            </div>

            <button
                onClick={saveInforme}
                style={{
                    marginTop: '24px',
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
            >
                Guardar Informe
            </button>
        </CollapsibleSection>
    );
};
