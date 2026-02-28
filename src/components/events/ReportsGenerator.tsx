import React, { useState, useEffect } from 'react';
import { BarChart3, FileSpreadsheet, FileText, Calendar, Users, DollarSign, CheckCircle2, Loader2, Building2, TrendingUp, TrendingDown, Star, Award, Target, ArrowRight, Trophy, ChevronDown } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { ui } from '../../utils/ui';


interface Center {
    id: number;
    name: string;
}

interface Evento {
    id: number;
    nombre: string;
    fecha_evento: string;
    estado: string;
    tipo: string;
    plazas_reales?: number;
    localizacion?: string;
    center_id?: number;
    precio?: number;
}

interface ReportData {
    evento: Evento;
    centerId?: number;
    centerName?: string;
    participantes: number;
    asistentes: number;
    ingresos: number;
    gastos: number;
    balance: number;
    satisfaccion: number;
    encuestas: number;
}

interface CenterStats {
    centerId: number;
    centerName: string;
    eventos: number;
    participantes: number;
    asistentes: number;
    ingresos: number;
    gastos: number;
    balance: number;
    satisfaccion: number;
    encuestas: number;
    tasaAsistencia: number;
}

interface ReportsGeneratorProps {
    onBack: () => void;
}

export const ReportsGenerator: React.FC<ReportsGeneratorProps> = ({ onBack }) => {
    const [centers, setCenters] = useState<Center[]>([]);
    const [reportData, setReportData] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedEventos, setSelectedEventos] = useState<number[]>([]);
    const [reportType, setReportType] = useState<'resumen' | 'financiero' | 'participacion' | 'comparativa'>('resumen');
    const [selectedCenter, setSelectedCenter] = useState<'all' | number>('all');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'generator'>('dashboard');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const centersData = await eventService.centers.getAll();
            setCenters(centersData);

            const eventosData = await eventService.eventos.getAll();

            const participantesData = await eventService.participantes.getAll('evento_id, asistio');
            const gastosData = await eventService.gastos.getAll('evento_id, coste');
            const encuestasData = await eventService.encuestas.getAll('evento_id, puntuacion_general');

            const reports: ReportData[] = (eventosData || []).map(evento => {
                const eventParticipantes = (participantesData || []).filter(p => p.evento_id === evento.id);
                const eventAsistentes = eventParticipantes.filter(p => p.asistio).length;
                const eventGastos = (gastosData || []).filter(g => g.evento_id === evento.id).reduce((sum, g) => sum + (g.coste || 0), 0);
                const eventIngresos = (evento.plazas_reales || 0) * (evento.precio || 0);
                const eventEncuestas = (encuestasData || []).filter(e => e.evento_id === evento.id);
                const satisfaccion = eventEncuestas.length > 0
                    ? eventEncuestas.reduce((sum, e) => sum + (e.puntuacion_general || 0), 0) / eventEncuestas.length
                    : 0;

                const center = centersData?.find(c => c.id === evento.center_id);

                return {
                    evento,
                    centerId: evento.center_id,
                    centerName: center?.name || 'Sin asignar',
                    participantes: eventParticipantes.length,
                    asistentes: eventAsistentes,
                    ingresos: eventIngresos,
                    gastos: eventGastos,
                    balance: eventIngresos - eventGastos,
                    satisfaccion: Math.round(satisfaccion * 10) / 10,
                    encuestas: eventEncuestas.length
                };
            });

            setReportData(reports);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get filtered data by selected center
    const getFilteredData = () => {
        if (selectedCenter === 'all') return reportData;
        return reportData.filter(r => r.centerId === selectedCenter);
    };

    // Calculate KPIs for filtered data
    const getKPIs = (data: ReportData[]) => {
        const participantes = data.reduce((s, r) => s + r.participantes, 0);
        const asistentes = data.reduce((s, r) => s + r.asistentes, 0);
        const conValoracion = data.filter(r => r.satisfaccion > 0);

        return {
            eventos: data.length,
            participantes,
            asistentes,
            ingresos: data.reduce((s, r) => s + r.ingresos, 0),
            gastos: data.reduce((s, r) => s + r.gastos, 0),
            balance: data.reduce((s, r) => s + r.balance, 0),
            encuestas: data.reduce((s, r) => s + r.encuestas, 0),
            satisfaccionMedia: conValoracion.length > 0
                ? Math.round((conValoracion.reduce((s, r) => s + r.satisfaccion, 0) / conValoracion.length) * 10) / 10
                : 0,
            tasaAsistencia: participantes > 0 ? Math.round((asistentes / participantes) * 100) : 0
        };
    };

    const filteredData = getFilteredData();
    const kpis = getKPIs(filteredData);

    // Get stats by center for comparison
    const getCenterStats = (): CenterStats[] => {
        const stats: Record<number, CenterStats> = {};

        reportData.forEach(r => {
            const centerId = r.centerId || 0;
            if (!stats[centerId]) {
                stats[centerId] = {
                    centerId,
                    centerName: r.centerName || 'Sin asignar',
                    eventos: 0,
                    participantes: 0,
                    asistentes: 0,
                    ingresos: 0,
                    gastos: 0,
                    balance: 0,
                    satisfaccion: 0,
                    encuestas: 0,
                    tasaAsistencia: 0
                };
            }
            stats[centerId].eventos++;
            stats[centerId].participantes += r.participantes;
            stats[centerId].asistentes += r.asistentes;
            stats[centerId].ingresos += r.ingresos;
            stats[centerId].gastos += r.gastos;
            stats[centerId].balance += r.balance;
            stats[centerId].satisfaccion += r.satisfaccion;
            stats[centerId].encuestas += r.encuestas;
        });

        Object.values(stats).forEach(s => {
            if (s.eventos > 0) {
                s.satisfaccion = Math.round((s.satisfaccion / s.eventos) * 10) / 10;
            }
            s.tasaAsistencia = s.participantes > 0 ? Math.round((s.asistentes / s.participantes) * 100) : 0;
        });

        return Object.values(stats).sort((a, b) => b.balance - a.balance);
    };

    const centerStats = getCenterStats();

    // Calculate monthly trends for last 6 months
    const getMonthlyTrends = () => {
        const months: { mes: string; eventos: number; participantes: number; ingresos: number; gastos: number; balance: number }[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const mesLabel = date.toLocaleDateString('es-ES', { month: 'short' });

            const monthData = filteredData.filter(r => {
                const eventDate = new Date(r.evento.fecha_evento);
                return eventDate.getFullYear() === date.getFullYear() && eventDate.getMonth() === date.getMonth();
            });

            months.push({
                mes: mesLabel,
                eventos: monthData.length,
                participantes: monthData.reduce((s, r) => s + r.participantes, 0),
                ingresos: monthData.reduce((s, r) => s + r.ingresos, 0),
                gastos: monthData.reduce((s, r) => s + r.gastos, 0),
                balance: monthData.reduce((s, r) => s + r.balance, 0)
            });
        }

        return months;
    };

    const monthlyTrends = getMonthlyTrends();

    // Find best center for each KPI
    const getBestCenter = (metric: keyof CenterStats): number | null => {
        if (centerStats.length === 0) return null;
        const best = centerStats.reduce((a, b) => (b[metric] as number) > (a[metric] as number) ? b : a);
        return best.centerId;
    };

    const bestByBalance = getBestCenter('balance');
    const bestByParticipantes = getBestCenter('participantes');
    const bestByIngresos = getBestCenter('ingresos');
    const bestBySatisfaccion = getBestCenter('satisfaccion');
    const bestByAsistencia = getBestCenter('tasaAsistencia');

    const toggleEvento = (id: number) => {
        setSelectedEventos(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const selectAll = () => setSelectedEventos(filteredData.map(r => r.evento.id));
    const deselectAll = () => setSelectedEventos([]);

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatCurrency = (amount: number) => `${amount >= 0 ? '' : '-'}${Math.abs(amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;

    const generateCSV = () => {
        if (reportType === 'comparativa') {
            let csvContent = 'Centro,Eventos,Participantes,Tasa Asistencia,Ingresos,Gastos,Balance,Satisfacción\n';
            centerStats.forEach(c => {
                csvContent += `"${c.centerName}",${c.eventos},${c.participantes},${c.tasaAsistencia}%,${c.ingresos},${c.gastos},${c.balance},${c.satisfaccion}\n`;
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `comparativa_centros_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            return;
        }

        const selectedData = reportData.filter(r => selectedEventos.includes(r.evento.id));
        if (selectedData.length === 0) {
            ui.info('Selecciona al menos un evento');
            return;
        }

        setGenerating(true);
        let csvContent = 'Evento,Centro,Fecha,Participantes,Ingresos,Gastos,Balance,Satisfacción\n';
        selectedData.forEach(r => {
            csvContent += `"${r.evento.nombre}","${r.centerName}",${r.evento.fecha_evento},${r.participantes},${r.ingresos},${r.gastos},${r.balance},${r.satisfaccion}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_eventos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        setTimeout(() => setGenerating(false), 1000);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="animate-spin" style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #10b981', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0 }}>📊 Panel de Reportes</h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Análisis de {reportData.length} eventos</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Center Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                        <Building2 size={18} color="#10b981" />
                        <select
                            value={selectedCenter}
                            onChange={(e) => setSelectedCenter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            style={{ border: 'none', backgroundColor: 'transparent', fontSize: '14px', fontWeight: 500, cursor: 'pointer', minWidth: '150px' }}
                        >
                            <option value="all">Todos los centros</option>
                            {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '10px', padding: '4px' }}>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: activeTab === 'dashboard' ? 'white' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                color: activeTab === 'dashboard' ? '#10b981' : '#6b7280'
                            }}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('generator')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: activeTab === 'generator' ? 'white' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                color: activeTab === 'generator' ? '#10b981' : '#6b7280'
                            }}
                        >
                            Comparativa
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
                <>
                    {/* KPIs - Change based on selected center */}
                    <div style={{ marginBottom: '8px', fontSize: '13px', color: '#6b7280' }}>
                        {selectedCenter === 'all' ? '📊 KPIs de todos los centros' : `📊 KPIs de: ${centers.find(c => c.id === selectedCenter)?.name}`}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <Calendar size={24} color="#3b82f6" style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>{kpis.eventos}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Eventos</div>
                        </div>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <Users size={24} color="#8b5cf6" style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#8b5cf6' }}>{kpis.participantes}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Participantes</div>
                        </div>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <TrendingUp size={24} color="#16a34a" style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(kpis.ingresos)}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Ingresos</div>
                        </div>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <TrendingDown size={24} color="#dc2626" style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(kpis.gastos)}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Gastos</div>
                        </div>
                        <div style={{
                            backgroundColor: kpis.balance >= 0 ? '#f0fdf4' : '#fef2f2',
                            borderRadius: '16px',
                            padding: '20px',
                            border: `2px solid ${kpis.balance >= 0 ? '#16a34a' : '#dc2626'}`,
                            textAlign: 'center'
                        }}>
                            <DollarSign size={24} color={kpis.balance >= 0 ? '#16a34a' : '#dc2626'} style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '22px', fontWeight: 700, color: kpis.balance >= 0 ? '#16a34a' : '#dc2626' }}>
                                {kpis.balance >= 0 ? '+' : ''}{formatCurrency(kpis.balance)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Balance</div>
                        </div>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <Star size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>{kpis.satisfaccionMedia}/5</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{kpis.encuestas} encuestas</div>
                        </div>
                    </div>

                    {/* Monthly Trends */}
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '24px' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BarChart3 size={20} color="#3b82f6" />
                            Tendencias Mensuales (Últimos 6 meses)
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            {/* Eventos Trend */}
                            <div>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>📅 Eventos</div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
                                    {monthlyTrends.map((m, i) => (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{
                                                width: '100%',
                                                height: `${Math.max(10, (m.eventos / Math.max(...monthlyTrends.map(t => t.eventos || 1))) * 60)}px`,
                                                backgroundColor: i === monthlyTrends.length - 1 ? '#3b82f6' : '#93c5fd',
                                                borderRadius: '4px 4px 0 0'
                                            }} />
                                            <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>{m.mes}</span>
                                        </div>
                                    ))}
                                </div>
                                {monthlyTrends.length >= 2 && (() => {
                                    const curr = monthlyTrends[monthlyTrends.length - 1]?.eventos || 0;
                                    const prev = monthlyTrends[monthlyTrends.length - 2]?.eventos || 1;
                                    const diff = Math.round(((curr - prev) / prev) * 100);
                                    return (
                                        <div style={{ marginTop: '8px', fontSize: '12px', color: diff >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                            {diff >= 0 ? '↑' : '↓'} {Math.abs(diff)}% vs mes anterior
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Participantes Trend */}
                            <div>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>👥 Participantes</div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
                                    {monthlyTrends.map((m, i) => (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{
                                                width: '100%',
                                                height: `${Math.max(10, (m.participantes / Math.max(...monthlyTrends.map(t => t.participantes || 1))) * 60)}px`,
                                                backgroundColor: i === monthlyTrends.length - 1 ? '#8b5cf6' : '#c4b5fd',
                                                borderRadius: '4px 4px 0 0'
                                            }} />
                                            <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>{m.mes}</span>
                                        </div>
                                    ))}
                                </div>
                                {monthlyTrends.length >= 2 && (() => {
                                    const curr = monthlyTrends[monthlyTrends.length - 1]?.participantes || 0;
                                    const prev = monthlyTrends[monthlyTrends.length - 2]?.participantes || 1;
                                    const diff = Math.round(((curr - prev) / prev) * 100);
                                    return (
                                        <div style={{ marginTop: '8px', fontSize: '12px', color: diff >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                            {diff >= 0 ? '↑' : '↓'} {Math.abs(diff)}% vs mes anterior
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Balance Trend */}
                            <div>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>💰 Balance</div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
                                    {monthlyTrends.map((m, i) => (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{
                                                width: '100%',
                                                height: `${Math.max(10, Math.abs(m.balance) / Math.max(...monthlyTrends.map(t => Math.abs(t.balance) || 1)) * 60)}px`,
                                                backgroundColor: m.balance >= 0
                                                    ? (i === monthlyTrends.length - 1 ? '#16a34a' : '#86efac')
                                                    : (i === monthlyTrends.length - 1 ? '#dc2626' : '#fca5a5'),
                                                borderRadius: '4px 4px 0 0'
                                            }} />
                                            <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>{m.mes}</span>
                                        </div>
                                    ))}
                                </div>
                                {monthlyTrends.length >= 2 && (() => {
                                    const curr = monthlyTrends[monthlyTrends.length - 1]?.balance || 0;
                                    const prev = monthlyTrends[monthlyTrends.length - 2]?.balance || 1;
                                    const diff = prev !== 0 ? Math.round(((curr - prev) / Math.abs(prev)) * 100) : 0;
                                    return (
                                        <div style={{ marginTop: '8px', fontSize: '12px', color: diff >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                            {diff >= 0 ? '↑' : '↓'} {Math.abs(diff)}% vs mes anterior
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Events List */}
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                                Listado de Eventos ({filteredData.length})
                            </h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>EVENTO</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>CENTRO</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>FECHA</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>ASIST.</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>INGRESOS</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>GASTOS</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>BALANCE</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#f59e0b' }}>⭐</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map(r => (
                                        <tr key={r.evento.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 500, color: '#111827' }}>{r.evento.nombre}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{r.centerName}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{formatDate(r.evento.fecha_evento)}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: '#8b5cf6' }}>
                                                {r.asistentes}/{r.participantes}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#16a34a' }}>{formatCurrency(r.ingresos)}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#dc2626' }}>{formatCurrency(r.gastos)}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    backgroundColor: r.balance >= 0 ? '#dcfce7' : '#fee2e2',
                                                    color: r.balance >= 0 ? '#16a34a' : '#dc2626'
                                                }}>
                                                    {r.balance >= 0 ? '+' : ''}{formatCurrency(r.balance)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: '#f59e0b' }}>
                                                {r.satisfaccion > 0 ? r.satisfaccion : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredData.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No hay eventos</div>
                        )}
                    </div>
                </>
            )}

            {/* Comparativa View */}
            {activeTab === 'generator' && (
                <>
                    {/* Winner Summary */}
                    <div style={{ backgroundColor: '#fef3c7', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '2px solid #f59e0b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Trophy size={28} color="#f59e0b" />
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#92400e' }}>🏆 Mejores Centros por KPI</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                            {[
                                { label: '💰 Balance', best: bestByBalance, metric: 'balance' as keyof CenterStats },
                                { label: '👥 Participantes', best: bestByParticipantes, metric: 'participantes' as keyof CenterStats },
                                { label: '📈 Ingresos', best: bestByIngresos, metric: 'ingresos' as keyof CenterStats },
                                { label: '⭐ Satisfacción', best: bestBySatisfaccion, metric: 'satisfaccion' as keyof CenterStats },
                                { label: '✅ % Asistencia', best: bestByAsistencia, metric: 'tasaAsistencia' as keyof CenterStats }
                            ].map(item => {
                                const winnerStats = centerStats.find(c => c.centerId === item.best);
                                return (
                                    <div key={item.label} style={{
                                        backgroundColor: 'white',
                                        borderRadius: '10px',
                                        padding: '12px 16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</div>
                                        <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '14px' }}>
                                            🥇 {winnerStats?.centerName || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#92400e' }}>
                                            {item.metric === 'balance' || item.metric === 'ingresos'
                                                ? formatCurrency(winnerStats?.[item.metric] as number || 0)
                                                : item.metric === 'tasaAsistencia'
                                                    ? `${winnerStats?.[item.metric]}%`
                                                    : item.metric === 'satisfaccion'
                                                        ? `${winnerStats?.[item.metric]}/5`
                                                        : winnerStats?.[item.metric]
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Full Comparison Table */}
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '24px' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                                <Building2 size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Comparativa Detallada por Centro
                            </h3>
                            <button
                                onClick={generateCSV}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                <FileSpreadsheet size={18} />
                                Exportar CSV
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb' }}>
                                        <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>CENTRO</th>
                                        <th style={{ padding: '14px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#3b82f6' }}>EVENTOS</th>
                                        <th style={{ padding: '14px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>PARTICIPANTES</th>
                                        <th style={{ padding: '14px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>% ASISTENCIA</th>
                                        <th style={{ padding: '14px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>INGRESOS</th>
                                        <th style={{ padding: '14px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>GASTOS</th>
                                        <th style={{ padding: '14px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>BALANCE</th>
                                        <th style={{ padding: '14px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#f59e0b' }}>⭐ MEDIA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {centerStats.map((c, idx) => (
                                        <tr key={c.centerId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {idx === 0 && <span style={{ fontSize: '18px' }}>🥇</span>}
                                                    {idx === 1 && <span style={{ fontSize: '18px' }}>🥈</span>}
                                                    {idx === 2 && <span style={{ fontSize: '18px' }}>🥉</span>}
                                                    {idx > 2 && <span style={{ width: '22px' }}></span>}
                                                    <span style={{ fontWeight: 600, color: '#111827' }}>{c.centerName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px', textAlign: 'center', fontWeight: 600, color: '#3b82f6' }}>{c.eventos}</td>
                                            <td style={{ padding: '14px', textAlign: 'center' }}>
                                                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{c.participantes}</span>
                                                {c.centerId === bestByParticipantes && <span style={{ marginLeft: '6px' }}>🏆</span>}
                                            </td>
                                            <td style={{ padding: '14px', textAlign: 'center', fontSize: '14px' }}>
                                                {c.tasaAsistencia}%
                                                {c.centerId === bestByAsistencia && <span style={{ marginLeft: '6px' }}>🏆</span>}
                                            </td>
                                            <td style={{ padding: '14px', textAlign: 'right' }}>
                                                <span style={{ fontWeight: 500, color: '#16a34a' }}>{formatCurrency(c.ingresos)}</span>
                                                {c.centerId === bestByIngresos && <span style={{ marginLeft: '6px' }}>🏆</span>}
                                            </td>
                                            <td style={{ padding: '14px', textAlign: 'right', fontWeight: 500, color: '#dc2626' }}>{formatCurrency(c.gastos)}</td>
                                            <td style={{ padding: '14px', textAlign: 'right' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    backgroundColor: c.balance >= 0 ? '#dcfce7' : '#fee2e2',
                                                    color: c.balance >= 0 ? '#16a34a' : '#dc2626'
                                                }}>
                                                    {c.balance >= 0 ? '+' : ''}{formatCurrency(c.balance)}
                                                </span>
                                                {c.centerId === bestByBalance && <span style={{ marginLeft: '6px' }}>🏆</span>}
                                            </td>
                                            <td style={{ padding: '14px', textAlign: 'center' }}>
                                                <span style={{ fontWeight: 600, color: '#f59e0b' }}>{c.satisfaccion > 0 ? c.satisfaccion : '-'}</span>
                                                {c.centerId === bestBySatisfaccion && c.satisfaccion > 0 && <span style={{ marginLeft: '6px' }}>🏆</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportsGenerator;
