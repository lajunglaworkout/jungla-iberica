import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, Activity, BarChart3 } from 'lucide-react';
import { wodbusterService, CombinedMetrics, WodbusterMetrics, CenterKey } from '../../services/wodbusterService';

interface WodbusterMetricsPanelProps {
    initialMetrics?: CombinedMetrics;
}

type ViewMode = 'combined' | 'sevilla' | 'jerez' | 'puerto';

const centerLabels: Record<ViewMode, string> = {
    combined: 'Todos los Centros',
    sevilla: 'Sevilla',
    jerez: 'Jerez',
    puerto: 'Puerto',
};

const WodbusterMetricsPanel: React.FC<WodbusterMetricsPanelProps> = ({ initialMetrics }) => {
    const [metrics, setMetrics] = useState<CombinedMetrics | null>(initialMetrics || null);
    const [viewMode, setViewMode] = useState<ViewMode>('combined');
    const [loading, setLoading] = useState(!initialMetrics);

    useEffect(() => {
        if (!initialMetrics) {
            loadMetrics();
        }
    }, []);

    const loadMetrics = async () => {
        setLoading(true);
        try {
            const data = await wodbusterService.getAllCentersMetrics();
            setMetrics(data);
        } catch (err) {
            console.error('Error loading metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentMetrics = (): WodbusterMetrics | null => {
        if (!metrics) return null;
        if (viewMode === 'combined') {
            return {
                centro: 'sevilla',
                timestamp: new Date().toISOString(),
                totalAtletas: metrics.combined.totalAtletas,
                atletasActivos: metrics.combined.atletasActivos,
                atletasConTarifa: metrics.combined.atletasActivos,
                ingresosRecurrentes: metrics.combined.ingresosRecurrentes,
                sociosFundadores: (metrics.sevilla?.sociosFundadores || 0) +
                    (metrics.jerez?.sociosFundadores || 0) +
                    (metrics.puerto?.sociosFundadores || 0),
                atletasConBono: 0,
                diasPromedioSinEntrenar: 0,
                nuevosEsteMes: metrics.combined.nuevosEsteMes,
                atletasEnRiesgo: metrics.combined.atletasEnRiesgo,
                bajasEsteMes: metrics.combined.bajasEsteMes,
                churnRate: metrics.combined.churnRate,
                ltvPromedio: 0
            };
        }
        return metrics[viewMode];
    };

    const generateInsights = (): string[] => {
        const m = getCurrentMetrics();
        if (!m) return ['Cargando datos...'];

        const insights: string[] = [];

        if (m.ingresosRecurrentes > 50000) {
            insights.push(`💰 MRR saludable de ${m.ingresosRecurrentes.toLocaleString('es-ES')}€. El negocio muestra solidez financiera.`);
        } else {
            insights.push(`💰 MRR de ${m.ingresosRecurrentes.toLocaleString('es-ES')}€. Hay potencial de crecimiento.`);
        }

        if (m.churnRate > 5) {
            insights.push(`⚠️ Churn del ${m.churnRate.toFixed(1)}% es elevado. Recomendar acciones de retención.`);
        } else if (m.churnRate > 0) {
            insights.push(`✅ Churn del ${m.churnRate.toFixed(1)}% bajo control. Mantener estrategia actual.`);
        } else {
            insights.push(`🎯 Sin bajas registradas este mes. Excelente retención.`);
        }

        if (m.atletasEnRiesgo > 20) {
            insights.push(`🚨 ${m.atletasEnRiesgo} socios sin entrenar +7 días. Activar re-engagement.`);
        } else if (m.atletasEnRiesgo > 0) {
            insights.push(`📋 ${m.atletasEnRiesgo} socios en observación. Monitorizar próximos días.`);
        } else {
            insights.push(`💪 Todos los socios entrenando regularmente.`);
        }

        if (m.nuevosEsteMes > 10) {
            insights.push(`📈 ${m.nuevosEsteMes} altas este mes. Crecimiento sostenido.`);
        } else if (m.nuevosEsteMes > 0) {
            insights.push(`📊 ${m.nuevosEsteMes} nuevos socios. Revisar captación.`);
        } else {
            insights.push(`📉 Sin altas nuevas este mes. Priorizar marketing.`);
        }

        return insights.slice(0, 4);
    };

    const getChartData = () => {
        if (!metrics) return [];
        return [
            { name: 'Sevilla', activos: metrics.sevilla?.atletasActivos || 0, color: '#22c55e' },
            { name: 'Jerez', activos: metrics.jerez?.atletasActivos || 0, color: '#3b82f6' },
            { name: 'Puerto', activos: metrics.puerto?.atletasActivos || 0, color: '#f59e0b' },
        ];
    };

    const currentMetrics = getCurrentMetrics();
    const insights = generateInsights();
    const chartData = getChartData();
    const maxActivos = Math.max(...chartData.map(d => d.activos), 1);

    if (loading) {
        return (
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <BarChart3 style={{ height: '20px', width: '20px', color: '#10b981' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                        KPIs Wodbuster
                    </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#6b7280' }}>
                    Cargando datos de los centros...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BarChart3 style={{ height: '20px', width: '20px', color: '#10b981' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                        KPIs Wodbuster
                    </h3>
                </div>

                <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as ViewMode)}
                    style={{
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'white',
                        color: '#374151',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    {Object.entries(centerLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px'
            }}>
                {/* LEFT: KPIs + Chart */}
                <div>
                    {/* KPI Cards Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        marginBottom: '20px'
                    }}>
                        {/* Activos */}
                        <div style={{
                            backgroundColor: '#f0fdf4',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #bbf7d0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Users style={{ height: '16px', width: '16px', color: '#16a34a' }} />
                                <span style={{ fontSize: '12px', fontWeight: '500', color: '#16a34a' }}>Activos</span>
                            </div>
                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#15803d', margin: 0 }}>
                                {currentMetrics?.atletasActivos.toLocaleString('es-ES') || '-'}
                            </p>
                        </div>

                        {/* MRR */}
                        <div style={{
                            backgroundColor: '#eff6ff',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #bfdbfe'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <DollarSign style={{ height: '16px', width: '16px', color: '#2563eb' }} />
                                <span style={{ fontSize: '12px', fontWeight: '500', color: '#2563eb' }}>MRR</span>
                            </div>
                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1d4ed8', margin: 0 }}>
                                {currentMetrics?.ingresosRecurrentes.toLocaleString('es-ES')}€
                            </p>
                        </div>

                        {/* En Riesgo */}
                        <div style={{
                            backgroundColor: '#fefce8',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #fef08a'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <AlertTriangle style={{ height: '16px', width: '16px', color: '#ca8a04' }} />
                                <span style={{ fontSize: '12px', fontWeight: '500', color: '#ca8a04' }}>En Riesgo</span>
                            </div>
                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#a16207', margin: 0 }}>
                                {currentMetrics?.atletasEnRiesgo || 0}
                            </p>
                        </div>

                        {/* Churn */}
                        <div style={{
                            backgroundColor: '#fef2f2',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #fecaca'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <TrendingDown style={{ height: '16px', width: '16px', color: '#dc2626' }} />
                                <span style={{ fontSize: '12px', fontWeight: '500', color: '#dc2626' }}>Churn</span>
                            </div>
                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#b91c1c', margin: 0 }}>
                                {currentMetrics?.churnRate.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    {viewMode === 'combined' && (
                        <div style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
                                Socios Activos por Centro
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {chartData.map((center) => (
                                    <div key={center.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#4b5563', width: '60px' }}>
                                            {center.name}
                                        </span>
                                        <div style={{
                                            flex: 1,
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '6px',
                                            height: '20px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${(center.activos / maxActivos) * 100}%`,
                                                height: '100%',
                                                backgroundColor: center.color,
                                                borderRadius: '6px',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151', width: '50px', textAlign: 'right' }}>
                                            {center.activos}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Individual center stats */}
                    {viewMode !== 'combined' && currentMetrics && (
                        <div style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
                                Detalles {centerLabels[viewMode]}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Total registrados:</span>
                                    <span style={{ fontWeight: '600' }}>{currentMetrics.totalAtletas}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Fundadores:</span>
                                    <span style={{ fontWeight: '600' }}>{currentMetrics.sociosFundadores}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Altas mes:</span>
                                    <span style={{ fontWeight: '600', color: '#16a34a' }}>+{currentMetrics.nuevosEsteMes}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Bajas mes:</span>
                                    <span style={{ fontWeight: '600', color: '#dc2626' }}>-{currentMetrics.bajasEsteMes}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: AI Insights */}
                <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Activity style={{ height: '16px', width: '16px', color: '#475569' }} />
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#334155', margin: 0 }}>
                            Análisis Inteligente
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {insights.map((insight, idx) => (
                            <div
                                key={idx}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    fontSize: '13px',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    lineHeight: '1.5'
                                }}
                            >
                                {insight}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WodbusterMetricsPanel;
