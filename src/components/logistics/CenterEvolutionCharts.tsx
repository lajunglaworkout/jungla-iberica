import React, { useMemo } from 'react';
import { CenterEvolutionStats, DailyBreakage, QuarterlyLoss } from '../../services/evolutionStatsService';
import { TrendingDown, Calendar, AlertTriangle } from 'lucide-react';

interface CenterEvolutionChartsProps {
    stats: CenterEvolutionStats;
    loading?: boolean;
}

const CENTER_COLORS: Record<string, string> = {
    'sevilla': '#10b981', // Emerald 500
    'jerez': '#3b82f6',   // Blue 500
    'puerto': '#f59e0b',  // Amber 500
    'central': '#8b5cf6'  // Violet 500
};

const CENTER_NAMES: Record<string, string> = {
    'sevilla': 'Sevilla',
    'jerez': 'Jerez',
    'puerto': 'Puerto',
    'central': 'Central'
};

const CenterEvolutionCharts: React.FC<CenterEvolutionChartsProps> = ({ stats, loading }) => {

    // Procesar datos para el gráfico diario (últimos 14 días para legibilidad)
    const dailyChartData = useMemo(() => {
        if (!stats.dailyBreakages.length) return [];

        const last14Days = new Date();
        last14Days.setDate(last14Days.getDate() - 14);

        // Filtrar últimos 14 días
        const filtered = stats.dailyBreakages.filter(d => new Date(d.date) >= last14Days);

        // Agrupar por fecha
        const byDate: Record<string, Record<string, number>> = {};
        const allDates = new Set<string>();

        filtered.forEach(d => {
            if (!byDate[d.date]) byDate[d.date] = {};
            byDate[d.date][d.center_name.toLowerCase()] = d.items_affected;
            allDates.add(d.date);
        });

        // Rellenar huecos de fechas
        const sortedDates = Array.from(allDates).sort();

        return sortedDates.map(date => ({
            date,
            values: byDate[date] || {}
        }));
    }, [stats.dailyBreakages]);

    // Procesar datos para el gráfico trimestral
    const quarterlyChartData = useMemo(() => {
        if (!stats.quarterlyLosses.length) return [];

        // Agrupar por trimestre
        const byQuarter: Record<string, Record<string, number>> = {};
        const allQuarters = new Set<string>();

        stats.quarterlyLosses.forEach(q => {
            const key = `${q.quarter} ${q.year}`;
            if (!byQuarter[key]) byQuarter[key] = {};
            // Normalizar nombre del centro
            const centerKey = q.center_name.toLowerCase().includes('sevilla') ? 'sevilla' :
                q.center_name.toLowerCase().includes('jerez') ? 'jerez' :
                    q.center_name.toLowerCase().includes('puerto') ? 'puerto' : 'central';

            byQuarter[key][centerKey] = q.total_items_removed;
            allQuarters.add(key);
        });

        return Array.from(allQuarters).sort().map(quarter => ({
            quarter,
            values: byQuarter[quarter] || {}
        }));
    }, [stats.quarterlyLosses]);

    // Calcular máximo para escala Y (Diario)
    const maxDailyValue = useMemo(() => {
        if (!dailyChartData.length) return 10;
        let max = 0;
        dailyChartData.forEach(d => {
            const total = Object.values(d.values).reduce((a, b) => a + b, 0);
            if (total > max) max = total;
        });
        return Math.max(max, 5); // Mínimo 5 para que no se vea vacío
    }, [dailyChartData]);

    // Calcular máximo para escala Y (Trimestral)
    const maxQuarterlyValue = useMemo(() => {
        if (!quarterlyChartData.length) return 10;
        let max = 0;
        quarterlyChartData.forEach(q => {
            const total = Object.values(q.values).reduce((a, b) => a + b, 0);
            if (total > max) max = total;
        });
        return Math.max(max, 10);
    }, [quarterlyChartData]);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando datos de evolución...</div>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>

            {/* Gráfico de Roturas Diarias */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                        <TrendingDown size={20} color="#ef4444" />
                        Evolución de Roturas (Últimos 14 días)
                    </h3>
                </div>

                {dailyChartData.length === 0 ? (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
                        No hay datos de roturas recientes
                    </div>
                ) : (
                    <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
                        {/* Líneas de guía */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                            {[1, 0.5, 0].map(ratio => (
                                <div key={ratio} style={{ borderTop: '1px dashed #f3f4f6', width: '100%', height: '1px', position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '-20px', top: '-8px', fontSize: '10px', color: '#9ca3af' }}>
                                        {Math.round(maxDailyValue * ratio)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {dailyChartData.map((data, idx) => {
                            const totalHeight = Object.values(data.values).reduce((a, b) => a + b, 0);
                            const heightPercent = (totalHeight / maxDailyValue) * 100;

                            return (
                                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', zIndex: 1 }}>
                                    <div style={{ width: '100%', maxWidth: '30px', height: `${heightPercent}%`, display: 'flex', flexDirection: 'column-reverse', borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
                                        {Object.entries(data.values).map(([center, value]) => (
                                            <div
                                                key={center}
                                                style={{
                                                    height: `${(value / totalHeight) * 100}%`,
                                                    backgroundColor: CENTER_COLORS[center] || '#9ca3af',
                                                    width: '100%'
                                                }}
                                                title={`${CENTER_NAMES[center] || center}: ${value} items`}
                                            />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '8px', transform: 'rotate(-45deg)', transformOrigin: 'left top', whiteSpace: 'nowrap' }}>
                                        {new Date(data.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Leyenda */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {Object.entries(CENTER_NAMES).map(([key, name]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4b5563' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CENTER_COLORS[key] }} />
                            {name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Gráfico de Pérdidas Trimestrales */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                        <AlertTriangle size={20} color="#f59e0b" />
                        Pérdidas Trimestrales (Items)
                    </h3>
                </div>

                {quarterlyChartData.length === 0 ? (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
                        No hay datos de revisiones trimestrales
                    </div>
                ) : (
                    <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
                        {/* Líneas de guía */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                            {[1, 0.5, 0].map(ratio => (
                                <div key={ratio} style={{ borderTop: '1px dashed #f3f4f6', width: '100%', height: '1px', position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '-20px', top: '-8px', fontSize: '10px', color: '#9ca3af' }}>
                                        {Math.round(maxQuarterlyValue * ratio)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {quarterlyChartData.map((data, idx) => {
                            const totalHeight = Object.values(data.values).reduce((a, b) => a + b, 0);
                            const heightPercent = (totalHeight / maxQuarterlyValue) * 100;

                            return (
                                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', zIndex: 1 }}>
                                    <div style={{ width: '100%', maxWidth: '50px', height: `${heightPercent}%`, display: 'flex', flexDirection: 'column-reverse', borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
                                        {Object.entries(data.values).map(([center, value]) => (
                                            <div
                                                key={center}
                                                style={{
                                                    height: `${(value / totalHeight) * 100}%`,
                                                    backgroundColor: CENTER_COLORS[center] || '#9ca3af',
                                                    width: '100%'
                                                }}
                                                title={`${CENTER_NAMES[center] || center}: ${value} items perdidos`}
                                            />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginTop: '8px' }}>
                                        {data.quarter}
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#6b7280' }}>
                                        {totalHeight} items
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                    Items eliminados del inventario por deterioro o pérdida en revisiones.
                </div>
            </div>
        </div>
    );
};

export default CenterEvolutionCharts;
