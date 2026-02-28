import React from 'react';
import { Star, Users, TrendingUp, TrendingDown, Euro, Award } from 'lucide-react';
import { CollapsibleSection, StarRating } from './SharedComponents';
import { Informe, EncuestaResumen } from './EventTemplateTypes';

interface ResultadoFinalSectionProps {
    participantesCount: number;
    totalIngresos: number;
    totalGastos: number;
    balance: number;
    informe: Informe;
    setInforme: (informe: Informe) => void;
    encuestaResumen: EncuestaResumen;
}

export const ResultadoFinalSection: React.FC<ResultadoFinalSectionProps> = ({
    participantesCount,
    totalIngresos,
    totalGastos,
    balance,
    informe,
    setInforme,
    encuestaResumen,
}) => {
    return (
        <CollapsibleSection title="RESULTADO FINAL" icon={Star} color="#f59e0b" defaultOpen={false}>
            {/* KPIs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    <Users size={28} color="#16a34a" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#16a34a' }}>{participantesCount}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Asistentes</div>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    <TrendingUp size={28} color="#16a34a" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#16a34a' }}>{totalIngresos.toFixed(0)} €</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Ingresos</div>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                    <TrendingDown size={28} color="#dc2626" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#dc2626' }}>{totalGastos.toFixed(0)} €</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Gastos</div>
                </div>
                <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    backgroundColor: balance >= 0 ? '#dcfce7' : '#fee2e2',
                    borderRadius: '12px',
                    border: `2px solid ${balance >= 0 ? '#16a34a' : '#dc2626'}`
                }}>
                    <Euro size={28} color={balance >= 0 ? '#16a34a' : '#dc2626'} style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: balance >= 0 ? '#16a34a' : '#dc2626' }}>
                        {balance >= 0 ? '+' : ''}{balance.toFixed(0)} €
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Balance</div>
                </div>
            </div>

            {/* Valoraciones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                {/* Valoración Encargado */}
                <div style={{ padding: '24px', backgroundColor: '#fef3c7', borderRadius: '12px', border: '1px solid #fcd34d' }}>
                    <h4 style={{ margin: '0 0 16px', color: '#92400e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={20} /> Valoración del Encargado
                    </h4>
                    <StarRating
                        value={informe.valoracion_encargado || 0}
                        onChange={(value) => setInforme({ ...informe, valoracion_encargado: value })}
                        size={32}
                    />
                    <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#92400e' }}>
                        Valoración personal del organizador del evento
                    </p>
                </div>

                {/* Valoración Usuarios (Encuestas) */}
                <div style={{ padding: '24px', backgroundColor: '#dbeafe', borderRadius: '12px', border: '1px solid #93c5fd' }}>
                    <h4 style={{ margin: '0 0 16px', color: '#1e40af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} /> Valoración de Usuarios
                    </h4>
                    {encuestaResumen.total > 0 ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <StarRating value={Math.round(encuestaResumen.media_general)} readOnly size={28} />
                                <span style={{ fontSize: '24px', fontWeight: 700, color: '#1e40af' }}>
                                    {encuestaResumen.media_general}/5
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#1e40af' }}>
                                Basado en {encuestaResumen.total} encuestas • {encuestaResumen.recomendaria_pct}% recomendaría
                            </p>
                        </>
                    ) : (
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                            No hay encuestas registradas aún
                        </p>
                    )}
                </div>
            </div>
        </CollapsibleSection>
    );
};
