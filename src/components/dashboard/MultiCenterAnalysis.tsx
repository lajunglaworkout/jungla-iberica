import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Send, Activity, Info } from 'lucide-react';

const mockHistoricalData = [
    { month: 'Ago', sevilla: 2450, jerez: 1800, puerto: 1200 },
    { month: 'Sep', sevilla: 2600, jerez: 1950, puerto: 1300 },
    { month: 'Oct', sevilla: 2750, jerez: 2100, puerto: 1450 },
    { month: 'Nov', sevilla: 2800, jerez: 2200, puerto: 1480 },
    { month: 'Dic', sevilla: 2700, jerez: 2150, puerto: 1510 }, // Slight dip in Dec
    { month: 'Ene', sevilla: 2978, jerez: 2357, puerto: 1595 }, // Current bounce back
];

const COLORS = {
    sevilla: '#16a34a', // Green
    jerez: '#2563eb',   // Blue
    puerto: '#d97706'   // Orange
};

export const MultiCenterAnalysis: React.FC = () => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Left Column: Charts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Main Trend Chart */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Evolución de Socios Activos</h3>
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Últimos 6 meses • Comparativa de Centros</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.sevilla }} /> Sevilla
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.jerez }} /> Jerez
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.puerto }} /> Puerto
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '350px', width: '100%', minHeight: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockHistoricalData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fontSize: '12px', fill: '#9ca3af' }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fontSize: '12px', fill: '#9ca3af' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Line type="monotone" dataKey="sevilla" stroke={COLORS.sevilla} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="jerez" stroke={COLORS.jerez} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="puerto" stroke={COLORS.puerto} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                        { label: 'Crecimiento Sevilla', value: '+5.2%', trend: 'up', color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Crecimiento Jerez', value: '+8.1%', trend: 'up', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Crecimiento Puerto', value: '+12.4%', trend: 'up', color: 'text-orange-600', bg: 'bg-orange-50' }
                    ].map((metric, idx) => (
                        <div key={idx} style={{
                            backgroundColor: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{metric.label}</p>
                                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }} className={metric.color}>{metric.value}</p>
                            </div>
                            <div className={`${metric.bg} p-2 rounded-lg`}>
                                <TrendingUp size={20} className={metric.color} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: AI Analysis & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* AI Interpretation */}
                <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Activity className="text-indigo-600" size={20} />
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#334155' }}>Análisis Inteligente</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                            <p style={{ margin: '0 0 12px 0' }}>
                                <strong>Puerto destaca:</strong> Es el centro con mayor crecimiento porcentual (+12.4%) en el último trimestre. La estrategia de captación allí está funcionando muy bien.
                            </p>
                            <p style={{ margin: '0 0 12px 0' }}>
                                <strong>Recuperación Enero:</strong> Los tres centros muestran un rebote fuerte (efecto propósitos de año nuevo) superando la caída estacional de diciembre.
                            </p>
                            <p style={{ margin: 0 }}>
                                <strong>Oportunidad:</strong> Jerez tiene capacidad para crecer un 15% más antes de saturar clases. Es el momento ideal para una campaña.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Suggested Actions */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #fcd34d'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <AlertTriangle className="text-amber-600" size={20} />
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#b45309' }}>Acciones Sugeridas</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { title: 'Campaña Reactivación Jerez', desc: 'Enviar email a 45 ex-socios recientes', risk: 'high' },
                            { title: 'Encuesta Satisfacción Puerto', desc: 'Validar causas del éxito reciente via App', risk: 'low' },
                            { title: 'Refuerzo Horarios Sevilla', desc: 'Clases de 19:00 están al 95% capacidad', risk: 'medium' }
                        ].map((action, idx) => (
                            <div key={idx} style={{
                                padding: '12px',
                                backgroundColor: '#fffbeb',
                                borderRadius: '8px',
                                border: '1px solid #fde68a'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>{action.title}</span>
                                    {action.risk === 'high' && <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px' }}>Alta Prio</span>}
                                </div>
                                <p style={{ fontSize: '12px', color: '#b45309', margin: '0 0 8px 0' }}>{action.desc}</p>
                                <button style={{
                                    width: '100%',
                                    padding: '6px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: '#ffffff',
                                    color: '#d97706',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                    <Send size={12} /> Ejecutar Acción
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
