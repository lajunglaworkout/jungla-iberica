import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Calendar, Users, Star, Award, Target, Filter, ChevronDown, CheckCircle, XCircle, Clock } from 'lucide-react';
import { eventService } from '../../services/eventService';

interface Evento {
    id: number;
    nombre: string;
    fecha_evento: string;
    estado: string;
    tipo: string;
    plazas_max?: number;
    plazas_reales?: number;
    precio?: number;
}

interface EventoFinanciero {
    eventoId: number;
    eventoNombre: string;
    fechaEvento: string;
    tipo: string;
    estado: string;
    ingresos: number;
    gastos: number;
    balance: number;
    participantes: number;
    asistentes: number;
    encuestas: number;
    valoracionMedia: number;
}

interface FinancialSummaryProps {
    onBack: () => void;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ onBack }) => {
    const [loading, setLoading] = useState(true);
    const [financials, setFinancials] = useState<EventoFinanciero[]>([]);
    const [filterPeriod, setFilterPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
    const [filterEstado, setFilterEstado] = useState<'all' | 'completado' | 'activo' | 'pendiente'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'balance' | 'participantes'>('date');

    // Calculated totals
    const [totals, setTotals] = useState({
        ingresos: 0,
        gastos: 0,
        balance: 0,
        eventos: 0,
        participantes: 0,
        asistentes: 0,
        encuestas: 0,
        valoracionMedia: 0,
        eventosRentables: 0,
        tasaAsistencia: 0
    });

    useEffect(() => {
        loadFinancials();
    }, []);

    const loadFinancials = async () => {
        setLoading(true);
        try {
            // Load eventos with more details
            const eventosData = await eventService.eventos.getAll();

            // Load all gastos
            const gastosData = await eventService.gastos.getAll('evento_id, coste');

            // Load participantes
            const participantesData = await eventService.participantes.getAll('evento_id, asistio');

            // Load encuestas
            const encuestasData = await eventService.encuestas.getAll('evento_id, puntuacion_general');

            // Calculate per evento
            const financialsByEvento: EventoFinanciero[] = (eventosData || []).map(evento => {
                const eventGastos = (gastosData || []).filter(g => g.evento_id === evento.id).reduce((sum, g) => sum + (g.coste || 0), 0);
                const eventIngresos = (evento.plazas_reales || 0) * (evento.precio || 0);
                const eventParticipantes = (participantesData || []).filter(p => p.evento_id === evento.id);
                const eventAsistentes = eventParticipantes.filter(p => p.asistio).length;
                const eventEncuestas = (encuestasData || []).filter(e => e.evento_id === evento.id);
                const valoracionMedia = eventEncuestas.length > 0
                    ? eventEncuestas.reduce((sum, e) => sum + (e.puntuacion_general || 0), 0) / eventEncuestas.length
                    : 0;

                return {
                    eventoId: evento.id,
                    eventoNombre: evento.nombre,
                    fechaEvento: evento.fecha_evento,
                    tipo: evento.tipo || 'general',
                    estado: evento.estado || 'pendiente',
                    ingresos: eventIngresos,
                    gastos: eventGastos,
                    balance: eventIngresos - eventGastos,
                    participantes: eventParticipantes.length,
                    asistentes: eventAsistentes,
                    encuestas: eventEncuestas.length,
                    valoracionMedia: Math.round(valoracionMedia * 10) / 10
                };
            });

            setFinancials(financialsByEvento);
            calculateTotals(financialsByEvento);

        } catch (error) {
            console.error('Error loading financials:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (data: EventoFinanciero[]) => {
        const totalIngresos = data.reduce((sum, f) => sum + f.ingresos, 0);
        const totalGastos = data.reduce((sum, f) => sum + f.gastos, 0);
        const totalParticipantes = data.reduce((sum, f) => sum + f.participantes, 0);
        const totalAsistentes = data.reduce((sum, f) => sum + f.asistentes, 0);
        const totalEncuestas = data.reduce((sum, f) => sum + f.encuestas, 0);
        const eventosConValoracion = data.filter(f => f.valoracionMedia > 0);
        const valoracionMedia = eventosConValoracion.length > 0
            ? eventosConValoracion.reduce((sum, f) => sum + f.valoracionMedia, 0) / eventosConValoracion.length
            : 0;

        setTotals({
            ingresos: totalIngresos,
            gastos: totalGastos,
            balance: totalIngresos - totalGastos,
            eventos: data.length,
            participantes: totalParticipantes,
            asistentes: totalAsistentes,
            encuestas: totalEncuestas,
            valoracionMedia: Math.round(valoracionMedia * 10) / 10,
            eventosRentables: data.filter(f => f.balance > 0).length,
            tasaAsistencia: totalParticipantes > 0 ? Math.round((totalAsistentes / totalParticipantes) * 100) : 0
        });
    };

    // Filter and sort
    const getFilteredData = () => {
        let filtered = [...financials];

        // Period filter
        const now = new Date();
        if (filterPeriod === 'month') {
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            filtered = filtered.filter(f => new Date(f.fechaEvento) >= monthAgo);
        } else if (filterPeriod === 'quarter') {
            const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            filtered = filtered.filter(f => new Date(f.fechaEvento) >= quarterAgo);
        } else if (filterPeriod === 'year') {
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            filtered = filtered.filter(f => new Date(f.fechaEvento) >= yearAgo);
        }

        // Estado filter
        if (filterEstado !== 'all') {
            filtered = filtered.filter(f => f.estado.toLowerCase().includes(filterEstado));
        }

        // Sort
        if (sortBy === 'balance') {
            filtered.sort((a, b) => b.balance - a.balance);
        } else if (sortBy === 'participantes') {
            filtered.sort((a, b) => b.participantes - a.participantes);
        }

        return filtered;
    };

    const filteredData = getFilteredData();

    // Get top 3 events by balance
    const topEventos = [...financials].sort((a, b) => b.balance - a.balance).slice(0, 3);

    // Get by tipo
    const eventosPorTipo = financials.reduce((acc, f) => {
        const tipo = f.tipo || 'general';
        if (!acc[tipo]) acc[tipo] = { count: 0, ingresos: 0, gastos: 0, balance: 0 };
        acc[tipo].count++;
        acc[tipo].ingresos += f.ingresos;
        acc[tipo].gastos += f.gastos;
        acc[tipo].balance += f.balance;
        return acc;
    }, {} as Record<string, { count: number; ingresos: number; gastos: number; balance: number }>);

    const formatCurrency = (amount: number) => `${amount >= 0 ? '' : '-'}${Math.abs(amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

    const getEstadoIcon = (estado: string) => {
        if (estado.toLowerCase().includes('complet')) return <CheckCircle size={14} color="#16a34a" />;
        if (estado.toLowerCase().includes('cancel')) return <XCircle size={14} color="#dc2626" />;
        return <Clock size={14} color="#f59e0b" />;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="animate-spin" style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #059669', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0 }}>📊 Panel de Reportes</h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Análisis completo de {totals.eventos} eventos</p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <select
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value as 'all' | 'month' | 'quarter' | 'year')}
                        style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white', fontSize: '14px' }}
                    >
                        <option value="all">Todo el tiempo</option>
                        <option value="month">Último mes</option>
                        <option value="quarter">Último trimestre</option>
                        <option value="year">Último año</option>
                    </select>
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value as 'all' | 'completado' | 'activo' | 'pendiente')}
                        style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white', fontSize: '14px' }}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="completado">Completados</option>
                        <option value="activo">Activos</option>
                        <option value="pendiente">Pendientes</option>
                    </select>
                </div>
            </div>

            {/* Main KPIs Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {/* Balance */}
                <div style={{
                    backgroundColor: totals.balance >= 0 ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '16px',
                    padding: '20px',
                    border: `2px solid ${totals.balance >= 0 ? '#16a34a' : '#dc2626'}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <DollarSign size={20} color={totals.balance >= 0 ? '#16a34a' : '#dc2626'} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>BALANCE</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: totals.balance >= 0 ? '#16a34a' : '#dc2626' }}>
                        {totals.balance >= 0 ? '+' : ''}{formatCurrency(totals.balance)}
                    </div>
                </div>

                {/* Ingresos */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <TrendingUp size={20} color="#16a34a" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>INGRESOS</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(totals.ingresos)}</div>
                </div>

                {/* Gastos */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <TrendingDown size={20} color="#dc2626" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>GASTOS</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(totals.gastos)}</div>
                </div>

                {/* Eventos */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Calendar size={20} color="#3b82f6" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>EVENTOS</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{totals.eventos}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{totals.eventosRentables} rentables</div>
                </div>

                {/* Participantes */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Users size={20} color="#8b5cf6" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>PARTICIPANTES</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>{totals.participantes}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{totals.tasaAsistencia}% asistencia</div>
                </div>

                {/* Valoración */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Star size={20} color="#f59e0b" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>VALORACIÓN</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{totals.valoracionMedia}/5</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{totals.encuestas} encuestas</div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px', marginBottom: '24px' }}>
                {/* Top Events */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '20px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={20} color="#f59e0b" /> Top Eventos por Rentabilidad
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {topEventos.map((evento, idx) => (
                            <div key={evento.eventoId} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                backgroundColor: idx === 0 ? '#fef3c7' : '#f9fafb',
                                borderRadius: '10px',
                                border: idx === 0 ? '2px solid #f59e0b' : '1px solid #e5e7eb'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: idx === 0 ? '#f59e0b' : idx === 1 ? '#9ca3af' : '#d97706',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '14px'
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>{evento.eventoNombre}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(evento.fechaEvento)}</div>
                                </div>
                                <div style={{
                                    padding: '6px 12px',
                                    backgroundColor: evento.balance >= 0 ? '#dcfce7' : '#fee2e2',
                                    color: evento.balance >= 0 ? '#16a34a' : '#dc2626',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    fontWeight: 600
                                }}>
                                    {evento.balance >= 0 ? '+' : ''}{formatCurrency(evento.balance)}
                                </div>
                            </div>
                        ))}
                        {topEventos.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No hay datos</div>
                        )}
                    </div>
                </div>

                {/* By Type */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '20px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={20} color="#3b82f6" /> Desglose por Tipo
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {Object.entries(eventosPorTipo).map(([tipo, data]) => (
                            <div key={tipo} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 500, color: '#111827', fontSize: '14px', textTransform: 'capitalize' }}>{tipo}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{data.count} eventos</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: data.balance >= 0 ? '#16a34a' : '#dc2626' }}>
                                        {data.balance >= 0 ? '+' : ''}{formatCurrency(data.balance)}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                        {formatCurrency(data.ingresos)} ing. / {formatCurrency(data.gastos)} gast.
                                    </div>
                                </div>
                            </div>
                        ))}
                        {Object.keys(eventosPorTipo).length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No hay datos</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        Desglose Detallado ({filteredData.length} eventos)
                    </h3>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'balance' | 'participantes')}
                        style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}
                    >
                        <option value="date">Por fecha</option>
                        <option value="balance">Por rentabilidad</option>
                        <option value="participantes">Por participantes</option>
                    </select>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th style={{ padding: '14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>EVENTO</th>
                                <th style={{ padding: '14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>FECHA</th>
                                <th style={{ padding: '14px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>ESTADO</th>
                                <th style={{ padding: '14px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>INGRESOS</th>
                                <th style={{ padding: '14px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#dc2626' }}>GASTOS</th>
                                <th style={{ padding: '14px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>BALANCE</th>
                                <th style={{ padding: '14px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#8b5cf6' }}>ASIST.</th>
                                <th style={{ padding: '14px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#f59e0b' }}>⭐</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(f => (
                                <tr key={f.eventoId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '14px' }}>
                                        <div style={{ fontWeight: 500, color: '#111827' }}>{f.eventoNombre}</div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'capitalize' }}>{f.tipo}</div>
                                    </td>
                                    <td style={{ padding: '14px', fontSize: '14px', color: '#6b7280' }}>{formatDate(f.fechaEvento)}</td>
                                    <td style={{ padding: '14px', textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            {getEstadoIcon(f.estado)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px', textAlign: 'right', fontSize: '14px', color: '#16a34a', fontWeight: 500 }}>
                                        {formatCurrency(f.ingresos)}
                                    </td>
                                    <td style={{ padding: '14px', textAlign: 'right', fontSize: '14px', color: '#dc2626', fontWeight: 500 }}>
                                        {formatCurrency(f.gastos)}
                                    </td>
                                    <td style={{ padding: '14px', textAlign: 'right' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            backgroundColor: f.balance >= 0 ? '#dcfce7' : '#fee2e2',
                                            color: f.balance >= 0 ? '#16a34a' : '#dc2626'
                                        }}>
                                            {f.balance >= 0 ? '+' : ''}{formatCurrency(f.balance)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px', textAlign: 'center', fontSize: '14px', color: '#8b5cf6', fontWeight: 500 }}>
                                        {f.asistentes}/{f.participantes}
                                    </td>
                                    <td style={{ padding: '14px', textAlign: 'center', fontSize: '14px', color: '#f59e0b', fontWeight: 500 }}>
                                        {f.valoracionMedia > 0 ? `${f.valoracionMedia}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <BarChart3 size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
                        <p style={{ color: '#6b7280' }}>No hay datos para mostrar</p>
                    </div>
                )}

                {/* Table Footer with Totals */}
                {filteredData.length > 0 && (
                    <div style={{ padding: '16px 20px', backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '32px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Ingresos</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(filteredData.reduce((s, f) => s + f.ingresos, 0))}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Gastos</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(filteredData.reduce((s, f) => s + f.gastos, 0))}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Balance Total</div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: filteredData.reduce((s, f) => s + f.balance, 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                                {formatCurrency(filteredData.reduce((s, f) => s + f.balance, 0))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialSummary;
