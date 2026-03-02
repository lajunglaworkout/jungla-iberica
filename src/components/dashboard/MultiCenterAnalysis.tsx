import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign, Activity, RefreshCw, Info } from 'lucide-react';
import { wodbusterService, WodbusterMetrics, CombinedMetrics } from '../../services/wodbusterService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number, decimals = 0) => n.toFixed(decimals);
const eur = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;

const KpiCell: React.FC<{
    label: string;
    value: string;
    sub?: string;
    alert?: boolean;
    good?: boolean;
}> = ({ label, value, sub, alert, good }) => (
    <div style={{
        padding: '12px 16px',
        backgroundColor: alert ? '#fef2f2' : good ? '#f0fdf4' : '#f9fafb',
        borderRadius: '8px',
        borderLeft: `3px solid ${alert ? '#dc2626' : good ? '#16a34a' : '#d1d5db'}`,
        minWidth: 0,
    }}>
        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {label}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: alert ? '#dc2626' : good ? '#16a34a' : '#111827' }}>
            {value}
        </div>
        {sub && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{sub}</div>}
    </div>
);

const CenterCard: React.FC<{
    name: string;
    color: string;
    metrics: WodbusterMetrics;
}> = ({ name, color, metrics }) => {
    const churnAlert = metrics.churnRate > 5;
    const riesgoAlert = metrics.atletasEnRiesgo > 20;

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
        }}>
            {/* Header del centro */}
            <div style={{
                backgroundColor: color,
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{ fontWeight: '700', color: 'white', fontSize: '16px' }}>{name}</span>
                <span style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                }}>
                    {metrics.atletasActivos} activos
                </span>
            </div>

            {/* KPIs grid */}
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <KpiCell label="MRR" value={eur(metrics.ingresosRecurrentes)} />
                <KpiCell label="Total socios" value={String(metrics.totalAtletas)} />
                <KpiCell
                    label="Nuevos este mes"
                    value={`+${metrics.nuevosEsteMes}`}
                    good={metrics.nuevosEsteMes > 5}
                />
                <KpiCell
                    label="Bajas este mes"
                    value={String(metrics.bajasEsteMes)}
                    alert={metrics.bajasEsteMes > 10}
                />
                <KpiCell
                    label="Churn rate"
                    value={`${fmt(metrics.churnRate, 1)}%`}
                    alert={churnAlert}
                    good={!churnAlert && metrics.churnRate < 3}
                />
                <KpiCell
                    label="En riesgo (7d)"
                    value={String(metrics.atletasEnRiesgo)}
                    alert={riesgoAlert}
                    sub={`${fmt(metrics.diasPromedioSinEntrenar, 1)} días prom.`}
                />
                <KpiCell
                    label="LTV promedio"
                    value={eur(metrics.ltvPromedio)}
                />
                <KpiCell
                    label="Con tarifa"
                    value={String(metrics.atletasConTarifa)}
                    sub={`${metrics.sociosFundadores} fundadores`}
                />
            </div>
        </div>
    );
};

// ── Insights derivados de datos reales ────────────────────────────────────────

function buildInsights(combined: CombinedMetrics['combined']): string[] {
    const insights: string[] = [];

    const churnRate = combined.churnRate;
    const enRiesgo = combined.atletasEnRiesgo;
    const nuevos = combined.nuevosEsteMes;
    const bajas = combined.bajasEsteMes;
    const net = nuevos - bajas;

    if (net > 0) {
        insights.push(`Crecimiento neto: +${net} socios este mes (${nuevos} altas, ${bajas} bajas).`);
    } else if (net < 0) {
        insights.push(`Pérdida neta de ${Math.abs(net)} socios este mes. Revisar estrategia de retención.`);
    } else {
        insights.push(`Balance neutro: igual número de altas que bajas este mes.`);
    }

    if (churnRate > 5) {
        insights.push(`Churn rate elevado (${fmt(churnRate, 1)}%). Lanzar campaña de reactivación.`);
    } else if (churnRate < 2) {
        insights.push(`Excelente retención: churn en ${fmt(churnRate, 1)}%, por debajo del umbral saludable.`);
    } else {
        insights.push(`Churn en ${fmt(churnRate, 1)}%: dentro del rango aceptable (objetivo <5%).`);
    }

    if (enRiesgo > 30) {
        insights.push(`${enRiesgo} socios sin entrenar 7+ días. Activar seguimiento personalizado.`);
    } else if (enRiesgo > 0) {
        insights.push(`${enRiesgo} socios llevan 7+ días sin entrenar. Oportunidad de engagement.`);
    }

    return insights;
}

// ── Componente principal ──────────────────────────────────────────────────────

export const MultiCenterAnalysis: React.FC = () => {
    const [metrics, setMetrics] = useState<CombinedMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        const data = await wodbusterService.getAllCentersMetrics();
        setMetrics(data);
        setLastUpdated(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                <Activity size={32} style={{ margin: '0 auto 12px', color: '#d1d5db' }} />
                <p>Cargando métricas de centros...</p>
            </div>
        );
    }

    if (!metrics || (!metrics.sevilla && !metrics.jerez && !metrics.puerto)) {
        return (
            <div style={{
                textAlign: 'center', padding: '60px',
                backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
            }}>
                <Info size={40} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
                <p style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Sin datos de Wodbuster disponibles
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Es necesario ejecutar una sincronización desde el agente de integración para cargar snapshots.
                </p>
            </div>
        );
    }

    const combined = metrics.combined;
    const insights = buildInsights(combined);

    // Determinar qué centros tienen datos reales
    const centersWithData = [
        { key: 'sevilla', name: 'Sevilla', color: '#16a34a', data: metrics.sevilla },
        { key: 'jerez',   name: 'Jerez',   color: '#2563eb', data: metrics.jerez },
        { key: 'puerto',  name: 'Puerto',  color: '#d97706', data: metrics.puerto },
    ].filter(c => c.data !== null) as { key: string; name: string; color: string; data: WodbusterMetrics }[];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

            {/* Header + refresh */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px', color: '#111827' }}>
                        Análisis Multi-Centro
                    </h3>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                        Datos del último snapshot · Actualizado a las {lastUpdated}
                    </p>
                </div>
                <button
                    onClick={load}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        border: '1px solid #e5e7eb', borderRadius: '8px',
                        padding: '8px 14px', cursor: 'pointer',
                        backgroundColor: 'white', color: '#374151', fontSize: '13px',
                    }}
                >
                    <RefreshCw size={13} />
                    Actualizar
                </button>
            </div>

            {/* KPIs combinados */}
            <div style={{
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '20px',
            }}>
                {[
                    { icon: <Users size={18} />, label: 'Socios activos',   value: String(combined.atletasActivos) },
                    { icon: <DollarSign size={18} />, label: 'MRR total',   value: eur(combined.ingresosRecurrentes) },
                    { icon: <TrendingUp size={18} />, label: 'Nuevos mes',   value: `+${combined.nuevosEsteMes}` },
                    { icon: <TrendingDown size={18} />, label: 'Bajas mes',  value: String(combined.bajasEsteMes) },
                    { icon: <AlertTriangle size={18} />, label: 'En riesgo', value: String(combined.atletasEnRiesgo) },
                    { icon: <Activity size={18} />, label: 'Churn',          value: `${fmt(combined.churnRate, 1)}%` },
                ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
                            {item.icon}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: 'white' }}>{item.value}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Nota sobre datos de centros individuales */}
            {centersWithData.length === 1 && (
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '12px 16px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#92400e',
                }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>
                        El snapshot actual es compartido entre centros hasta que el agente de integración etiquete cada uno por separado.
                        Los datos reflejan el total de socios del snapshot más reciente.
                    </span>
                </div>
            )}

            {/* Tarjetas por centro */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {centersWithData.map(center => (
                    <CenterCard
                        key={center.key}
                        name={center.name}
                        color={center.color}
                        metrics={center.data}
                    />
                ))}
            </div>

            {/* Insights derivados de datos reales */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '20px 24px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Activity size={18} color="#6366f1" />
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1e1b4b' }}>
                        Insights del periodo
                    </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {insights.map((insight, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            padding: '10px 14px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.5',
                        }}>
                            <span style={{ color: '#6366f1', fontWeight: '700', flexShrink: 0 }}>·</span>
                            {insight}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
