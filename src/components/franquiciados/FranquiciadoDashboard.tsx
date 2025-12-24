import React, { useState, useEffect, useMemo } from 'react';
import {
    Building2, DollarSign, Users, TrendingUp, TrendingDown, Calendar,
    AlertTriangle, CheckCircle, Wrench, Package, Send, Clock,
    MessageCircle, FileText, ChevronRight, Star, Loader2, RefreshCw,
    ArrowLeft, BarChart2, PieChart, Activity, Plus, Filter, Search,
    UserPlus, ArrowRightCircle, UserMinus, Heart, ChevronDown, ChevronUp, Target
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';
import SmartIncidentModal from '../incidents/SmartIncidentModal';

// Interfaces
interface FinancialMetrics {
    ingresos: number;
    gastos: number;
    balance: number;
    ingresosAnterior?: number;
}

interface ClientMetrics {
    activos: number;
    altasMes: number;
    bajasMes: number;
    retencion: number;
}

interface IncidenciasMetrics {
    abiertas: number;
    cerradas: number;
    logistica: number;
    mantenimiento: number;
}

interface EventosMetrics {
    realizados: number;
    pendientes: number;
    participantes: number;
    satisfaccion: number;
}

interface Mensaje {
    id: number;
    categoria: string;
    asunto: string;
    mensaje: string;
    prioridad: string;
    estado: string;
    respuesta?: string;
    created_at: string;
}

interface Reunion {
    id: number;
    titulo: string;
    fecha: string;
    tipo: string;
    acta?: string;
    acta_pdf_url?: string;
}

// Interfaces for Historical Data
interface MonthlyFinancial {
    mes: number;
    año: number;
    ingresos: number;
    gastos: number;
    balance: number;
}

interface MonthlyClients {
    mes: number;
    año: number;
    activos: number;
    altas: number;
    bajas: number;
}

// Interface for Incidents
interface Incident {
    id: number;
    title: string;
    description: string;
    status: 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada';
    priority: 'baja' | 'media' | 'alta' | 'critica';
    incident_type: 'maintenance' | 'logistics' | 'hr' | 'security';
    created_at: string;
    department: string;
    responsible: string;
}

// KPI Card Component
const KPICard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
    trend?: number;
    onClick?: () => void;
}> = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white border border-gray-200 rounded-xl p-5 transition-colors ${onClick ? 'cursor-pointer hover:border-gray-300' : ''}`}
    >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon size={16} color={color} />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
            </div>
            {onClick && <ChevronRight size={16} className="text-gray-400" />}
        </div>
        <div className="flex items-end justify-between">
            <div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
            </div>
            {trend !== undefined && (
                <span className={`text-xs font-semibold flex items-center gap-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(trend)}%
                </span>
            )}
        </div>
    </div>
);

// Section Header Component
const SectionHeader: React.FC<{ title: string; icon: React.ElementType; color: string }> = ({ title, icon: Icon, color }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: `2px solid ${color}`
    }}>
        <div style={{ padding: '8px', backgroundColor: `${color}15`, borderRadius: '10px' }}>
            <Icon size={20} color={color} />
        </div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>{title}</h3>
    </div>
);

// --- REUSABLE CHART COMPONENTS ---

const SimpleBarChart: React.FC<{
    data: { label: string; v1: number; v2: number; v3?: number }[];
    colors: [string, string, string?];
    height?: number;
}> = ({ data, colors, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.v1, d.v2, d.v3 || 0)));
    const barWidth = 20;
    const gap = 10;
    const groupGap = 30;

    return (
        <div style={{ height: `${height}px`, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: '20px' }}>
            {data.map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100%' }}>
                        {/* Bar 1 */}
                        <div style={{
                            width: '12px',
                            height: `${(d.v1 / maxValue) * 100}%`,
                            backgroundColor: colors[0],
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.5s ease'
                        }} title={`Ingresos: ${d.v1}`} />
                        {/* Bar 2 */}
                        <div style={{
                            width: '12px',
                            height: `${(d.v2 / maxValue) * 100}%`,
                            backgroundColor: colors[1],
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.5s ease'
                        }} title={`Gastos: ${d.v2}`} />
                        {/* Bar 3 (Optional) */}
                        {d.v3 !== undefined && colors[2] && (
                            <div style={{
                                width: '12px',
                                height: `${Math.abs(d.v3) / maxValue * 100}%`,
                                backgroundColor: d.v3 >= 0 ? colors[2] : '#ef4444',
                                borderRadius: '4px 4px 0 0',
                                opacity: 0.5,
                                transition: 'height 0.5s ease'
                            }} title={`Balance: ${d.v3}`} />
                        )}
                    </div>
                    <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '8px' }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

const SimpleLineChart: React.FC<{
    data: { label: string; value: number }[];
    color: string;
    height?: number;
    area?: boolean;
}> = ({ data, color, height = 200, area = false }) => {
    if (data.length < 2) return null;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const minValue = Math.min(...data.map(d => d.value)) * 0.9;
    const range = maxValue - minValue;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value - minValue) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                ))}

                {/* Area */}
                {area && (
                    <path
                        d={`M0,100 L0,${100 - ((data[0].value - minValue) / range) * 100} ${points.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`}
                        fill={color}
                        fillOpacity="0.1"
                    />
                )}

                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((d.value - minValue) / range) * 100;
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="1.5"
                            fill="white"
                            stroke={color}
                            strokeWidth="1"
                        />
                    );
                })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {data.map((d, i) => (
                    (i % 2 === 0 || i === data.length - 1) && (
                        <span key={i} style={{ fontSize: '10px', color: '#9ca3af', position: 'absolute', left: `${(i / (data.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}>
                            {d.label}
                        </span>
                    )
                ))}
            </div>
        </div>
    );
};


export const FranquiciadoDashboard: React.FC = () => {
    const { employee } = useSession();
    const [loading, setLoading] = useState(true);
    const [centerName, setCenterName] = useState('');
    const [centerId, setCenterId] = useState<number | null>(null);
    const [activeView, setActiveView] = useState<'dashboard' | 'finance' | 'clients' | 'incidents'>('dashboard');

    // Metrics state
    const [financial, setFinancial] = useState<FinancialMetrics>({ ingresos: 0, gastos: 0, balance: 0 });
    const [clients, setClients] = useState<ClientMetrics>({ activos: 0, altasMes: 0, bajasMes: 0, retencion: 0 });
    const [incidenciasMetrics, setIncidenciasMetrics] = useState<IncidenciasMetrics>({ abiertas: 0, cerradas: 0, logistica: 0, mantenimiento: 0 });
    const [eventos, setEventos] = useState<EventosMetrics>({ realizados: 0, pendientes: 0, participantes: 0, satisfaccion: 0 });

    // Historical Data
    const [historicalFinance, setHistoricalFinance] = useState<MonthlyFinancial[]>([]);
    const [historicalClients, setHistoricalClients] = useState<MonthlyClients[]>([]);
    const [detailedIncidents, setDetailedIncidents] = useState<Incident[]>([]);

    // Messages state
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [reuniones, setReuniones] = useState<Reunion[]>([]);
    const [showMessageForm, setShowMessageForm] = useState(false);
    const [newMessage, setNewMessage] = useState({
        categoria: 'informacion',
        asunto: '',
        mensaje: '',
        prioridad: 'normal'
    });
    const [sendingMessage, setSendingMessage] = useState(false);

    // Filter selectors state
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Modal state
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [isHealthExpanded, setIsHealthExpanded] = useState(false);

    // Business Health Objectives (configurable targets)
    const OBJECTIVES = {
        ingresos: 15000,
        clientes: 150,
        incidenciasMax: 5,
        eventosMin: 2
    };

    useEffect(() => {
        if (employee?.center_id) {
            loadCenterData();
        }
    }, [employee, selectedMonth, selectedYear]);

    const loadCenterData = async () => {
        if (!employee?.center_id) return;
        setLoading(true);

        try {
            const cId = parseInt(employee.center_id);
            setCenterId(cId);

            // Load center info
            const { data: center } = await supabase
                .from('centers')
                .select('name')
                .eq('id', cId)
                .single();
            setCenterName(center?.name || 'Mi Centro');

            const now = new Date();

            // --- FINANCIAL DATA ---
            // Metrics for Selected Month/Year
            const { data: financialData } = await supabase
                .from('center_monthly_financials')
                .select('*')
                .eq('center_id', cId)
                .eq('mes', selectedMonth)
                .eq('año', selectedYear)
                .single();

            if (financialData) {
                const totalGastos = (financialData.alquiler || 0) + (financialData.suministros || 0) +
                    (financialData.nominas || 0) + (financialData.marketing || 0) +
                    (financialData.mantenimiento || 0) + (financialData.royalty || 0);
                setFinancial({
                    ingresos: financialData.ingresos_sin_iva || 0,
                    gastos: totalGastos,
                    balance: (financialData.ingresos_sin_iva || 0) - totalGastos
                });
            } else {
                setFinancial({ ingresos: 0, gastos: 0, balance: 0 });
            }

            // Historical Financials (Last 12 months)
            const { data: histFin } = await supabase
                .from('center_monthly_financials')
                .select('*')
                .eq('center_id', cId)
                .order('año', { ascending: true })
                .order('mes', { ascending: true })
                .limit(12);

            if (histFin && histFin.length > 0) {
                const formattedFin = histFin.map(f => ({
                    mes: f.mes,
                    año: f.año,
                    ingresos: f.ingresos_sin_iva || 0,
                    gastos: (f.alquiler || 0) + (f.suministros || 0) + (f.nominas || 0) + (f.marketing || 0) + (f.mantenimiento || 0) + (f.royalty || 0),
                    balance: (f.ingresos_sin_iva || 0) - ((f.alquiler || 0) + (f.suministros || 0) + (f.nominas || 0) + (f.marketing || 0))
                }));
                formattedFin.sort((a, b) => (a.año * 100 + a.mes) - (b.año * 100 + b.mes));
                setHistoricalFinance(formattedFin);
            }

            // --- CLIENT DATA ---
            // Metrics for Selected Month/Year
            const { data: clientData } = await supabase
                .from('client_metrics')
                .select('*')
                .eq('center_id', cId)
                .eq('mes', selectedMonth)
                .eq('año', selectedYear)
                .single();

            if (clientData) {
                setClients({
                    activos: clientData.clientes_activos || 0,
                    altasMes: clientData.altas_mes || 0,
                    bajasMes: clientData.bajas_mes || 0,
                    retencion: clientData.clientes_activos > 0
                        ? Math.round(((clientData.clientes_activos - clientData.bajas_mes) / clientData.clientes_activos) * 100)
                        : 0
                });
            } else {
                setClients({ activos: 0, altasMes: 0, bajasMes: 0, retencion: 0 });
            }

            // Historical Clients (Last 12 months)
            const { data: histClients } = await supabase
                .from('client_metrics')
                .select('*')
                .eq('center_id', cId)
                .order('año', { ascending: true })
                .order('mes', { ascending: true })
                .limit(12);

            if (histClients && histClients.length > 0) {
                const formattedClients = histClients.map(c => ({
                    mes: c.mes,
                    año: c.año,
                    activos: c.clientes_activos || 0,
                    altas: c.altas_mes || 0,
                    bajas: c.bajas_mes || 0
                }));
                formattedClients.sort((a, b) => (a.año * 100 + a.mes) - (b.año * 100 + b.mes));
                setHistoricalClients(formattedClients);
            }

            // Load incidents from checklist_incidents
            const { data: incidentsData } = await supabase
                .from('checklist_incidents')
                .select('*')
                .eq('center_id', cId);

            if (incidentsData) {
                setDetailedIncidents(incidentsData as Incident[]);
                const abiertas = incidentsData.filter(i => i.status === 'abierta' || i.status === 'en_proceso').length;
                const cerradas = incidentsData.filter(i => i.status === 'resuelta' || i.status === 'cerrada').length;
                const logistica = incidentsData.filter(i => i.incident_type === 'logistics').length;
                const mantenimiento = incidentsData.filter(i => i.incident_type === 'maintenance').length;
                setIncidenciasMetrics({ abiertas, cerradas, logistica, mantenimiento });
            }

            // Load events
            const { data: eventosData } = await supabase
                .from('eventos')
                .select('id, estado, fecha_evento')
                .eq('center_id', cId);

            if (eventosData) {
                const realizados = eventosData.filter(e => e.estado === 'finalizado').length;
                const pendientes = eventosData.filter(e => e.estado !== 'finalizado' && e.estado !== 'cancelado').length;
                const eventIds = eventosData.map(e => e.id);
                // Simple placeholder logic for complex relation
                setEventos({
                    realizados,
                    pendientes,
                    participantes: 0,
                    satisfaccion: 0
                });
            }

            // Load messages
            const { data: mensajesData } = await supabase
                .from('franquiciado_mensajes')
                .select('*')
                .eq('center_id', cId)
                .order('created_at', { ascending: false })
                .limit(10);
            setMensajes(mensajesData || []);

            // Load reuniones
            const { data: reunionesData } = await supabase
                .from('reuniones_accionistas')
                .select('*')
                .eq('center_id', cId)
                .order('fecha', { ascending: false })
                .limit(10);
            setReuniones(reunionesData || []);

        } catch (error) {
            console.error('Error loading center data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.asunto.trim() || !newMessage.mensaje.trim() || !centerId) return;
        setSendingMessage(true);
        try {
            await supabase.from('franquiciado_mensajes').insert([{
                franquiciado_id: employee?.id ? parseInt(employee.id) : null,
                center_id: centerId,
                categoria: newMessage.categoria,
                asunto: newMessage.asunto.trim(),
                mensaje: newMessage.mensaje.trim(),
                prioridad: newMessage.prioridad,
                estado: 'pendiente'
            }]);
            const { data: mensajesData } = await supabase
                .from('franquiciado_mensajes')
                .select('*')
                .eq('center_id', centerId).order('created_at', { ascending: false }).limit(10);
            setMensajes(mensajesData || []);
            setNewMessage({ categoria: 'informacion', asunto: '', mensaje: '', prioridad: 'normal' });
            setShowMessageForm(false);
            alert('✅ Mensaje enviado correctamente');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('❌ Error al enviar el mensaje');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleIncidentCreated = (newIncident: any) => {
        // Refresh incidents
        const updatedIncidents = [newIncident, ...detailedIncidents];
        setDetailedIncidents(updatedIncidents);
        // Update metrics
        const abiertas = updatedIncidents.filter(i => i.status === 'abierta' || i.status === 'en_proceso').length;
        const cerradas = updatedIncidents.filter(i => i.status === 'resuelta' || i.status === 'cerrada').length;
        setIncidenciasMetrics(prev => ({ ...prev, abiertas, cerradas }));
        // Close modal
        setShowIncidentModal(false);
    };

    const getCategoriaIcon = (cat: string) => {
        switch (cat) {
            case 'incidencia': return '🔴';
            case 'propuesta': return '💡';
            case 'informacion': return 'ℹ️';
            default: return '📩';
        }
    };

    const getEstadoStyle = (estado: string) => {
        switch (estado) {
            case 'abierta': return { bg: '#fef2f2', color: '#dc2626', text: '🔴 Abierta' };
            case 'en_proceso': return { bg: '#fff7ed', color: '#ea580c', text: '🟠 En Proceso' };
            case 'resuelta': return { bg: '#f0fdf4', color: '#16a34a', text: '🟢 Resuelta' };
            case 'cerrada': return { bg: '#f3f4f6', color: '#6b7280', text: '🔒 Cerrada' };
            // Message states
            case 'pendiente': return { bg: '#fef3c7', color: '#92400e', text: '⏳ Pendiente' };
            case 'leido': return { bg: '#dbeafe', color: '#1e40af', text: '👁️ Leído' };
            case 'respondido': return { bg: '#dcfce7', color: '#166534', text: '✅ Respondido' };
            default: return { bg: '#f3f4f6', color: '#6b7280', text: estado };
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'baja': return <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">Baja</span>;
            case 'media': return <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full border border-yellow-200">Media</span>;
            case 'alta': return <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200">Alta</span>;
            case 'critica': return <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">Crítica</span>;
            default: return null;
        }
    };


    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: '12px',
                color: '#10b981'
            }}>
                <Loader2 className="animate-spin" size={32} />
                <span style={{ fontSize: '18px', fontWeight: 500 }}>Cargando dashboard...</span>
            </div>
        );
    }

    // --- RENDER FUNCTIONS FOR DETAILED VIEWS ---

    const renderFinanceView = () => (
        <div className="animate-in fade-in duration-300">
            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveView('dashboard')}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </button>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                        <DollarSign size={14} />
                        Finanzas Detalladas
                    </span>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-gray-400" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                        {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((name, i) => (
                            <option key={i} value={i + 1}>{name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                        {[2024, 2025].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Financial Summary Cards - Clean Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* Revenue Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <DollarSign size={16} className="text-emerald-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingresos</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {financial.ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <Activity size={16} className="text-red-500" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gastos</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {financial.gastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </div>
                </div>

                {/* Balance Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${financial.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                            <BarChart2 size={16} className={financial.balance >= 0 ? 'text-blue-600' : 'text-orange-500'} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Balance Neto</span>
                    </div>
                    <div className={`text-2xl font-bold ${financial.balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {financial.balance >= 0 ? '+' : ''}{financial.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white border border-gray-200 rounded-xl mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Evolución Anual</h3>
                            <p className="text-sm text-gray-500">Análisis de rendimiento últimos 12 meses</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                Ingresos
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                Gastos
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    {historicalFinance.length > 0 ? (
                        <SimpleBarChart
                            height={280}
                            colors={['#10b981', '#ef4444', '#3b82f6']}
                            data={historicalFinance.map(f => ({
                                label: `${f.mes}/${f.año}`,
                                v1: f.ingresos,
                                v2: f.gastos,
                                v3: f.balance
                            }))}
                        />
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-gray-400">
                            <BarChart2 size={32} className="mb-3 opacity-40" />
                            <p className="text-sm font-medium">No hay datos suficientes para generar la gráfica</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FileText size={16} className="text-gray-600" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Desglose Mensual</h3>
                    </div>
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5">
                        <FileText size={14} />
                        Descargar Informe
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Periodo</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingresos</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Gastos</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Balance</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {historicalFinance.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Calendar size={24} className="mb-2 opacity-50" />
                                            <p className="text-sm font-medium">No hay registros históricos disponibles</p>
                                            <p className="text-xs text-gray-400 mt-1">Los datos aparecerán aquí mes a mes</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                historicalFinance.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(row.año, row.mes - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-medium text-emerald-600">
                                                {row.ingresos.toLocaleString('es-ES')} €
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-medium text-red-500">
                                                {row.gastos.toLocaleString('es-ES')} €
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-sm font-semibold ${row.balance >= 0 ? 'text-gray-900' : 'text-orange-500'}`}>
                                                {row.balance >= 0 ? '+' : ''}{row.balance.toLocaleString('es-ES')} €
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.balance >= 0
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                }`}>
                                                {row.balance >= 0 ? 'Positivo' : 'Negativo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderClientView = () => (
        <div className="animate-in fade-in duration-300">
            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveView('dashboard')}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </button>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-semibold text-purple-600 flex items-center gap-1.5">
                        <Users size={14} />
                        Clientes Detallados
                    </span>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-gray-400" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                        {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((name, i) => (
                            <option key={i} value={i + 1}>{name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                        {[2024, 2025].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Client Metrics Cards - Clean Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Users size={16} className="text-purple-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activos</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{clients.activos}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <TrendingUp size={16} className="text-emerald-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Altas</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">+{clients.altasMes}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <TrendingDown size={16} className="text-red-500" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bajas</span>
                    </div>
                    <div className="text-2xl font-bold text-red-500">-{clients.bajasMes}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Activity size={16} className="text-blue-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Retención</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{clients.retencion}%</div>
                </div>
            </div>

            {/* Growth Chart */}
            <div className="bg-white border border-gray-200 rounded-xl mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900">Crecimiento de Clientes</h3>
                    <p className="text-sm text-gray-500">Evolución del número de socios activos</p>
                </div>
                <div className="p-6">
                    {historicalClients.length > 0 ? (
                        <SimpleLineChart
                            height={280}
                            color="#8b5cf6"
                            area={true}
                            data={historicalClients.map(c => ({
                                label: `${c.mes}/${c.año}`,
                                value: c.activos
                            }))}
                        />
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-gray-400">
                            <TrendingUp size={32} className="mb-3 opacity-40" />
                            <p className="text-sm font-medium">No hay histórico de clientes suficiente</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Users size={16} className="text-gray-600" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Detalle Mensual</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mes</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Activos</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-emerald-600 uppercase tracking-wide">Altas</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-red-500 uppercase tracking-wide">Bajas</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Crecimiento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {historicalClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <UserPlus size={24} className="mb-2 opacity-50" />
                                            <p className="text-sm font-medium">No hay datos de clientes registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                historicalClients.map((row, idx) => {
                                    const netGrowth = row.altas - row.bajas;
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {new Date(row.año, row.mes - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-semibold text-gray-900">{row.activos}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                    +{row.altas}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
                                                    -{row.bajas}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-sm font-semibold ${netGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {netGrowth > 0 ? '+' : ''}{netGrowth}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderIncidentsView = () => (
        <div className="animate-in fade-in duration-300">
            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveView('dashboard')}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </button>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-semibold text-orange-600 flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        Gestión de Incidencias
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <Filter size={14} />
                        Filtrar
                    </button>
                    <button
                        onClick={() => setShowIncidentModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Plus size={16} />
                        Nueva Incidencia
                    </button>
                </div>
            </div>

            {/* Metrics Cards - Clean Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <AlertTriangle size={16} className="text-gray-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{detailedIncidents.length}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <Clock size={16} className="text-red-500" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Abiertas</span>
                    </div>
                    <div className="text-2xl font-bold text-red-500">{detailedIncidents.filter(i => i.status === 'abierta').length}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                            <Wrench size={16} className="text-orange-500" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">En Proceso</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-500">{detailedIncidents.filter(i => i.status === 'en_proceso').length}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <CheckCircle size={16} className="text-emerald-500" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resueltas</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-500">{detailedIncidents.filter(i => i.status === 'resuelta' || i.status === 'cerrada').length}</div>
                </div>
            </div>

            {/* Incidents Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FileText size={16} className="text-gray-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Listado de Incidencias</h3>
                            <p className="text-sm text-gray-500">Registro histórico completo</p>
                        </div>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Incidencia</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Prioridad</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Responsable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {detailedIncidents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <CheckCircle size={32} className="mb-3 opacity-40" />
                                            <p className="text-sm font-medium text-gray-600">¡Todo en orden!</p>
                                            <p className="text-xs text-gray-400 mt-1">No hay incidencias activas</p>
                                            <button
                                                onClick={() => setShowIncidentModal(true)}
                                                className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                                            >
                                                Reportar un problema
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                detailedIncidents.map((incident) => (
                                    <tr key={incident.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(incident.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-1">
                                                {new Date(incident.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm font-medium text-gray-900 truncate">{incident.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{incident.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${incident.incident_type === 'maintenance' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                incident.incident_type === 'logistics' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                                                    incident.incident_type === 'security' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' :
                                                        'bg-purple-50 text-purple-700 ring-purple-600/20'
                                                }`}>
                                                {incident.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getPriorityBadge(incident.priority)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${incident.status === 'abierta' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                incident.status === 'en_proceso' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                                                    'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${incident.status === 'abierta' ? 'bg-red-500' :
                                                    incident.status === 'en_proceso' ? 'bg-orange-500' : 'bg-emerald-500'
                                                    }`} />
                                                {incident.status === 'abierta' ? 'Abierta' :
                                                    incident.status === 'en_proceso' ? 'En Proceso' :
                                                        incident.status === 'resuelta' ? 'Resuelta' : 'Cerrada'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-medium text-gray-700">{incident.responsible}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{
            padding: 'clamp(12px, 4vw, 32px)',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #10b981 50%, #34d399 100%)',
                borderRadius: '16px',
                padding: 'clamp(20px, 4vw, 32px)',
                color: 'white',
                marginBottom: '24px',
                boxShadow: '0 10px 30px -10px rgba(4, 120, 87, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '60%',
                    height: '140%',
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    transform: 'rotate(-15deg)'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <Building2 size={32} />
                            <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700 }}>
                                {centerName}
                            </h1>
                        </div>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                            Panel de Franquiciado · {
                                activeView === 'dashboard' ? 'Vista General' :
                                    activeView === 'finance' ? 'Finanzas Detalladas' :
                                        activeView === 'clients' ? 'Gestión de Clientes' : 'Gestión de Incidencias'}
                        </p>
                    </div>
                    <button
                        onClick={loadCenterData}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '10px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}
                    >
                        <RefreshCw size={16} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* CONTENT SWITCHER */}
            {activeView === 'dashboard' ? (
                <>
                    {/* Business Health Module - Expandable */}
                    {(() => {
                        // Calculate KPI scores
                        const kpis = [
                            {
                                id: 'facturacion',
                                label: 'Facturación',
                                current: financial.ingresos,
                                target: OBJECTIVES.ingresos,
                                format: (v: number) => `${v.toLocaleString()}€`,
                                isInverse: false,
                                icon: DollarSign
                            },
                            {
                                id: 'clientes',
                                label: 'Clientes Activos',
                                current: clients.activos,
                                target: OBJECTIVES.clientes,
                                format: (v: number) => v.toString(),
                                isInverse: false,
                                icon: Users
                            },
                            {
                                id: 'incidencias',
                                label: 'Incidencias Abiertas',
                                current: incidenciasMetrics.abiertas,
                                target: OBJECTIVES.incidenciasMax,
                                format: (v: number) => v.toString(),
                                isInverse: true, // lower is better
                                icon: AlertTriangle
                            },
                            {
                                id: 'eventos',
                                label: 'Eventos Realizados',
                                current: eventos.realizados,
                                target: OBJECTIVES.eventosMin,
                                format: (v: number) => v.toString(),
                                isInverse: false,
                                icon: Star
                            }
                        ];

                        const getKpiStatus = (kpi: typeof kpis[0]) => {
                            const percent = kpi.isInverse
                                ? (kpi.current <= kpi.target ? 100 : Math.max(0, 100 - ((kpi.current - kpi.target) / kpi.target) * 100))
                                : kpi.target > 0 ? (kpi.current / kpi.target) * 100 : 0;

                            if (kpi.isInverse) {
                                if (kpi.current <= kpi.target) return { status: 'green', percent: 100 };
                                if (kpi.current <= kpi.target * 1.5) return { status: 'amber', percent: 70 };
                                return { status: 'red', percent: 30 };
                            }

                            if (percent >= 90) return { status: 'green', percent };
                            if (percent >= 70) return { status: 'amber', percent };
                            return { status: 'red', percent };
                        };

                        const kpiStatuses = kpis.map(kpi => ({ ...kpi, ...getKpiStatus(kpi) }));
                        const greenCount = kpiStatuses.filter(k => k.status === 'green').length;
                        const amberCount = kpiStatuses.filter(k => k.status === 'amber').length;
                        const redCount = kpiStatuses.filter(k => k.status === 'red').length;
                        const overallScore = Math.round(kpiStatuses.reduce((acc, k) => acc + k.percent, 0) / kpis.length);

                        // Personnel alerts - filter for staff-related incidents
                        const personnelIncidents = detailedIncidents.filter(
                            inc => inc.incident_type === 'personal' || inc.department?.toLowerCase().includes('personal')
                        );

                        return (
                            <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden transition-all duration-300">
                                {/* Collapsed Header - Always Visible */}
                                <div
                                    className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsHealthExpanded(!isHealthExpanded)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <Target size={16} className="text-blue-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">Estado del Negocio</span>
                                        </div>

                                        {/* Score Badge */}
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${overallScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                            overallScore >= 60 ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {overallScore}%
                                        </div>

                                        {/* Progress Bar - Collapsed Only */}
                                        {!isHealthExpanded && (
                                            <div className="hidden sm:flex items-center gap-3">
                                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${overallScore >= 80 ? 'bg-emerald-500' :
                                                            overallScore >= 60 ? 'bg-amber-500' :
                                                                'bg-red-500'
                                                            }`}
                                                        style={{ width: `${overallScore}%` }}
                                                    />
                                                </div>

                                                {/* Status Summary */}
                                                <div className="flex items-center gap-2 text-xs font-medium">
                                                    {greenCount > 0 && <span className="text-emerald-600">✅{greenCount}</span>}
                                                    {amberCount > 0 && <span className="text-amber-600">⚠️{amberCount}</span>}
                                                    {redCount > 0 && <span className="text-red-600">❌{redCount}</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                                        {isHealthExpanded ? (
                                            <>Ocultar <ChevronUp size={14} /></>
                                        ) : (
                                            <>Ver Detalles <ChevronDown size={14} /></>
                                        )}
                                    </button>
                                </div>

                                {/* Expanded Content */}
                                {isHealthExpanded && (
                                    <div className="border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* KPI Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100">
                                            {kpiStatuses.map((kpi) => (
                                                <div key={kpi.id} className="bg-white p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-lg ${kpi.status === 'green' ? '' : kpi.status === 'amber' ? '' : ''
                                                            }`}>
                                                            {kpi.status === 'green' ? '✅' : kpi.status === 'amber' ? '⚠️' : '❌'}
                                                        </span>
                                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{kpi.label}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xl font-bold text-gray-900">{kpi.format(kpi.current)}</span>
                                                        <span className="text-sm text-gray-400">/ {kpi.format(kpi.target)}</span>
                                                    </div>
                                                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${kpi.status === 'green' ? 'bg-emerald-500' :
                                                                kpi.status === 'amber' ? 'bg-amber-500' :
                                                                    'bg-red-500'
                                                                }`}
                                                            style={{ width: `${Math.min(100, kpi.isInverse ? (kpi.current <= kpi.target ? 100 : Math.max(20, 100 - ((kpi.current - kpi.target) / kpi.target) * 50)) : (kpi.current / kpi.target) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Personnel Alerts - Only show if there are any */}
                                        {personnelIncidents.length > 0 && (
                                            <div className="border-t border-gray-100 px-5 py-4 bg-red-50/50">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-lg">🚨</span>
                                                    <span className="text-sm font-semibold text-red-700">
                                                        Alertas de Personal ({personnelIncidents.length})
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {personnelIncidents.slice(0, 3).map((inc) => (
                                                        <div key={inc.id} className="flex items-center gap-2 text-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                            <span className="text-gray-700">{inc.title}</span>
                                                            <span className="text-gray-400">
                                                                - {new Date(inc.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Financial & Clients Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        {/* Facturación */}
                        <div
                            onClick={() => setActiveView('finance')}
                            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-emerald-200/40 hover:-translate-y-1 relative group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="text-emerald-500" />
                            </div>
                            <SectionHeader title="Facturación del Mes" icon={DollarSign} color="#10b981" />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl">
                                    <div className="text-lg sm:text-2xl font-bold text-green-600">{financial.ingresos.toLocaleString()} €</div>
                                    <div className="text-xs text-gray-500">Ingresos</div>
                                </div>
                                <div className="text-center p-3 sm:p-4 bg-red-50 rounded-xl">
                                    <div className="text-lg sm:text-2xl font-bold text-red-600">{financial.gastos.toLocaleString()} €</div>
                                    <div className="text-xs text-gray-500">Gastos</div>
                                </div>
                                <div className={`text-center p-3 sm:p-4 rounded-xl border-2 ${financial.balance >= 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                                    }`}>
                                    <div className={`text-lg sm:text-2xl font-bold ${financial.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {financial.balance >= 0 ? '+' : ''}{financial.balance.toLocaleString()} €
                                    </div>
                                    <div className="text-xs text-gray-500">Balance</div>
                                </div>
                            </div>
                        </div>

                        {/* Clientes */}
                        <div
                            onClick={() => setActiveView('clients')}
                            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-fuchsia-200/40 hover:-translate-y-1 relative group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="text-violet-500" />
                            </div>
                            <SectionHeader title="Clientes" icon={Users} color="#8b5cf6" />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                <div className="text-center p-2 sm:p-3 bg-violet-50 rounded-lg">
                                    <div className="text-lg sm:text-xl font-bold text-violet-600">{clients.activos}</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">Activos</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                                    <div className="text-lg sm:text-xl font-bold text-green-600">+{clients.altasMes}</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">Altas</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
                                    <div className="text-lg sm:text-xl font-bold text-red-600">-{clients.bajasMes}</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">Bajas</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                                    <div className="text-lg sm:text-xl font-bold text-blue-600">{clients.retencion}%</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">Retención</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Incidencias & Eventos Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        {/* Incidencias */}
                        <div
                            onClick={() => setActiveView('incidents')}
                            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-200/40 hover:-translate-y-1 relative group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="text-orange-500" />
                            </div>
                            <SectionHeader title="Incidencias" icon={AlertTriangle} color="#f59e0b" />
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className={`text-center p-3 sm:p-5 rounded-xl border-2 ${incidenciasMetrics.abiertas > 0 ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
                                    }`}>
                                    <div className={`text-2xl sm:text-4xl font-bold ${incidenciasMetrics.abiertas > 0 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        {incidenciasMetrics.abiertas}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500 font-medium">🔴 Abiertas</div>
                                </div>
                                <div className="text-center p-3 sm:p-5 bg-green-50 rounded-xl">
                                    <div className="text-2xl sm:text-4xl font-bold text-green-600">{incidenciasMetrics.cerradas}</div>
                                    <div className="text-xs sm:text-sm text-gray-500 font-medium">🟢 Cerradas</div>
                                </div>
                            </div>
                            <div className="mt-4 text-xs text-center text-orange-600 font-medium">Ver detalles y reportar &rarr;</div>
                        </div>

                        {/* Eventos */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
                            <SectionHeader title="Eventos" icon={Calendar} color="#3b82f6" />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                                    <div className="text-lg sm:text-xl font-bold text-blue-600">{eventos.realizados}</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">Realizados</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 bg-amber-50 rounded-lg">
                                    <div className="text-lg sm:text-xl font-bold text-amber-600">{eventos.pendientes}</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">Pendientes</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 bg-violet-50 rounded-lg">
                                    <div className="text-lg sm:text-xl font-bold text-violet-600">{eventos.participantes}</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">Particip.</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 bg-amber-50 rounded-lg">
                                    <div className="text-lg sm:text-xl font-bold text-amber-500 flex items-center justify-center gap-1">
                                        <Star size={14} className="fill-amber-500" />
                                        {eventos.satisfaccion}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">Media</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reuniones & Comms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        {/* Reuniones */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
                            <SectionHeader title="Juntas" icon={FileText} color="#6366f1" />
                            {reuniones.length === 0 ? (
                                <div className="text-center py-6 sm:py-8 text-gray-500">
                                    <p className="text-sm">No hay reuniones recientes</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {reuniones.slice(0, 3).map(reunion => (
                                        <div key={reunion.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm">{reunion.titulo}</div>
                                                <div className="text-xs text-blue-600">
                                                    {new Date(reunion.fecha).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {reunion.acta_pdf_url && (
                                                <a href={reunion.acta_pdf_url} target="_blank" className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition-colors">
                                                    Acta
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mensajeria */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <MessageCircle size={16} className="text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">Mensajes</span>
                                </div>
                                <button
                                    onClick={() => setShowMessageForm(!showMessageForm)}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${showMessageForm
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        }`}
                                >
                                    {showMessageForm ? 'Cancelar' : '+ Nuevo Mensaje'}
                                </button>
                            </div>

                            {showMessageForm ? (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Category Selection */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Tipo de mensaje
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'informacion', label: 'Información', icon: '💬', color: 'blue' },
                                                { id: 'propuesta', label: 'Propuesta', icon: '💡', color: 'amber' },
                                                { id: 'incidencia', label: 'Incidencia', icon: '🚨', color: 'red' }
                                            ].map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setNewMessage({ ...newMessage, categoria: cat.id })}
                                                    className={`p-3 rounded-lg border-2 text-center transition-all ${newMessage.categoria === cat.id
                                                        ? cat.color === 'blue' ? 'border-blue-500 bg-blue-50'
                                                            : cat.color === 'amber' ? 'border-amber-500 bg-amber-50'
                                                                : 'border-red-500 bg-red-50'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                        }`}
                                                >
                                                    <span className="text-xl mb-1 block">{cat.icon}</span>
                                                    <span className={`text-xs font-semibold ${newMessage.categoria === cat.id
                                                        ? cat.color === 'blue' ? 'text-blue-700'
                                                            : cat.color === 'amber' ? 'text-amber-700'
                                                                : 'text-red-700'
                                                        : 'text-gray-600'
                                                        }`}>{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Priority Selection */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Prioridad
                                        </label>
                                        <div className="flex gap-2">
                                            {[
                                                { id: 'baja', label: 'Baja', color: 'gray' },
                                                { id: 'normal', label: 'Normal', color: 'blue' },
                                                { id: 'alta', label: 'Alta', color: 'red' }
                                            ].map((pri) => (
                                                <button
                                                    key={pri.id}
                                                    onClick={() => setNewMessage({ ...newMessage, prioridad: pri.id })}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${newMessage.prioridad === pri.id
                                                        ? pri.color === 'gray' ? 'bg-gray-600 text-white'
                                                            : pri.color === 'blue' ? 'bg-blue-600 text-white'
                                                                : 'bg-red-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {pri.id === 'alta' && '🔥 '}{pri.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Asunto
                                        </label>
                                        <input
                                            type="text"
                                            value={newMessage.asunto}
                                            onChange={(e) => setNewMessage({ ...newMessage, asunto: e.target.value })}
                                            placeholder="Escribe un asunto breve..."
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Mensaje
                                        </label>
                                        <textarea
                                            value={newMessage.mensaje}
                                            onChange={(e) => setNewMessage({ ...newMessage, mensaje: e.target.value })}
                                            placeholder="Describe tu mensaje en detalle..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                                        />
                                    </div>

                                    {/* Send Button */}
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={sendingMessage || !newMessage.asunto.trim() || !newMessage.mensaje.trim()}
                                        className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {sendingMessage ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Enviar Mensaje
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {mensajes.slice(0, 3).map(msg => (
                                        <div key={msg.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{getCategoriaIcon(msg.categoria)}</span>
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">{msg.asunto}</div>
                                                    <div className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</div>
                                                </div>
                                            </div>
                                            <span
                                                className="text-xs px-2 py-1 rounded-full font-medium"
                                                style={{
                                                    backgroundColor: getEstadoStyle(msg.estado).bg,
                                                    color: getEstadoStyle(msg.estado).color
                                                }}
                                            >
                                                {getEstadoStyle(msg.estado).text}
                                            </span>
                                        </div>
                                    ))}
                                    {mensajes.length === 0 && (
                                        <div className="text-center py-6">
                                            <MessageCircle size={24} className="mx-auto text-gray-300 mb-2" />
                                            <p className="text-sm text-gray-400">Sin mensajes</p>
                                            <button
                                                onClick={() => setShowMessageForm(true)}
                                                className="text-xs text-emerald-600 font-medium mt-2 hover:underline"
                                            >
                                                Enviar tu primer mensaje
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : activeView === 'finance' ? (
                renderFinanceView()
            ) : activeView === 'clients' ? (
                renderClientView()
            ) : (
                renderIncidentsView()
            )}

            {/* Smart Incident Modal */}
            <SmartIncidentModal
                isOpen={showIncidentModal}
                onClose={() => setShowIncidentModal(false)}
                centerName={centerName}
                centerId={centerId?.toString() || ''}
                onIncidentCreated={handleIncidentCreated}
            />
        </div>
    );
};

export default FranquiciadoDashboard;
