import React, { useState, useEffect } from 'react';
import {
    Building2, DollarSign, Users, TrendingUp, TrendingDown, Calendar,
    AlertTriangle, CheckCircle, Star, Loader2, RefreshCw,
    MessageCircle, FileText, ChevronRight, ChevronDown, ChevronUp, Target
} from 'lucide-react';
import { getCenterName, getFinancialData, getHistoricalFinancials, getClientMetrics, getHistoricalClients, getChecklistIncidents, getEventosByCenterId, getFranquiciadoMensajes, getReunionesAccionistas, sendFranquiciadoMessage } from '../../services/franquiciadoService';
import { useSession } from '../../contexts/SessionContext';
import IncidentCreationModal from '../incidents/IncidentCreationModal';
import { notifyFranchiseeMessage } from '../../services/notificationService';
import { ui } from '../../utils/ui';
import FranquiciadoFinanceView from './FranquiciadoFinanceView';
import FranquiciadoClientView from './FranquiciadoClientView';
import FranquiciadoIncidentsView from './FranquiciadoIncidentsView';
import FranquiciadoMessaging from './FranquiciadoMessaging';
import type {
    FinancialMetrics, ClientMetrics, IncidenciasMetrics, EventosMetrics,
    Mensaje, Reunion, MonthlyFinancial, MonthlyClients, Incident
} from './FranquiciadoTypes';

// ─── Shared Micro-components ─────────────────────────────────────────────────

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
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
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

const SectionHeader: React.FC<{ title: string; icon: React.ElementType; color: string }> = ({ title, icon: Icon, color }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '16px', paddingBottom: '12px', borderBottom: `2px solid ${color}`
    }}>
        <div style={{ padding: '8px', backgroundColor: `${color}15`, borderRadius: '10px' }}>
            <Icon size={20} color={color} />
        </div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>{title}</h3>
    </div>
);

// ─── FranquiciadoDashboard ────────────────────────────────────────────────────

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

    // Historical & Detail data
    const [historicalFinance, setHistoricalFinance] = useState<MonthlyFinancial[]>([]);
    const [historicalClients, setHistoricalClients] = useState<MonthlyClients[]>([]);
    const [detailedIncidents, setDetailedIncidents] = useState<Incident[]>([]);

    // Messages state
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [reuniones, setReuniones] = useState<Reunion[]>([]);
    const [showMessageForm, setShowMessageForm] = useState(false);
    const [newMessage, setNewMessage] = useState({ categoria: 'informacion', asunto: '', mensaje: '', prioridad: 'normal' });
    const [sendingMessage, setSendingMessage] = useState(false);

    // Filter state
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // UI state
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [isHealthExpanded, setIsHealthExpanded] = useState(false);

    const OBJECTIVES = { ingresos: 15000, clientes: 150, incidenciasMax: 5, eventosMin: 2 };

    useEffect(() => {
        if (employee?.center_id) loadCenterData();
    }, [employee, selectedMonth, selectedYear]);

    const loadCenterData = async () => {
        if (!employee?.center_id) return;
        setLoading(true);
        try {
            const cId = parseInt(employee.center_id);
            setCenterId(cId);

            const centerNameResult = await getCenterName(cId);
            setCenterName(centerNameResult || 'Mi Centro');

            // Financial data
            const financialData = await getFinancialData(cId, selectedMonth, selectedYear);

            if (financialData) {
                const fd = financialData as any;
                const totalIngresos = (fd.nutricion || 0) + (fd.fisioterapia || 0) +
                    (fd.entrenamiento_personal || 0) + (fd.entrenamientos_grupales || 0) + (fd.otros || 0);
                const totalGastos = (fd.alquiler || 0) + (fd.suministros || 0) +
                    (fd.nominas || 0) + (fd.marketing || 0) +
                    (fd.mantenimiento || 0) + (fd.royalty || 0);
                setFinancial({ ingresos: totalIngresos, gastos: totalGastos, balance: totalIngresos - totalGastos });
            } else {
                setFinancial({ ingresos: 0, gastos: 0, balance: 0 });
            }

            // Historical financials
            const histFin = await getHistoricalFinancials(cId);
            if (histFin.length) {
                const formatted = histFin.map((f: any) => {
                    const ing = (f.nutricion || 0) + (f.fisioterapia || 0) + (f.entrenamiento_personal || 0) +
                        (f.entrenamientos_grupales || 0) + (f.otros || 0);
                    const gas = (f.alquiler || 0) + (f.suministros || 0) + (f.nominas || 0) +
                        (f.marketing || 0) + (f.mantenimiento || 0) + (f.royalty || 0);
                    return { mes: f.mes, año: f.año, ingresos: ing, gastos: gas, balance: ing - gas };
                });
                formatted.sort((a: any, b: any) => (a.año * 100 + a.mes) - (b.año * 100 + b.mes));
                setHistoricalFinance(formatted);
            }

            // Client data
            const clientData = await getClientMetrics(cId, selectedMonth, selectedYear);
            if (clientData) {
                const cd = clientData as any;
                setClients({
                    activos: cd.clientes_activos || 0,
                    altasMes: cd.altas_mes || 0,
                    bajasMes: cd.bajas_mes || 0,
                    retencion: cd.clientes_activos > 0
                        ? Math.round(((cd.clientes_activos - cd.bajas_mes) / cd.clientes_activos) * 100)
                        : 0
                });
            } else {
                setClients({ activos: 0, altasMes: 0, bajasMes: 0, retencion: 0 });
            }

            // Historical clients
            const histClients = await getHistoricalClients(cId);
            if (histClients.length) {
                const formatted = histClients.map((c: any) => ({
                    mes: c.mes, año: c.año,
                    activos: c.clientes_activos || 0, altas: c.altas_mes || 0, bajas: c.bajas_mes || 0
                }));
                formatted.sort((a: any, b: any) => (a.año * 100 + a.mes) - (b.año * 100 + b.mes));
                setHistoricalClients(formatted);
            }

            // Incidents
            const incidentsData = await getChecklistIncidents(cId);
            if (incidentsData.length >= 0) {
                setDetailedIncidents(incidentsData as unknown as Incident[]);
                const abiertas = incidentsData.filter((i: any) => i.status === 'abierta' || i.status === 'en_proceso').length;
                const cerradas = incidentsData.filter((i: any) => i.status === 'resuelta' || i.status === 'cerrada').length;
                const logistica = incidentsData.filter((i: any) => i.incident_type === 'logistics').length;
                const mantenimiento = incidentsData.filter((i: any) => i.incident_type === 'maintenance').length;
                setIncidenciasMetrics({ abiertas, cerradas, logistica, mantenimiento });
            }

            // Events
            const eventosData = await getEventosByCenterId(cId);
            if (eventosData.length >= 0) {
                setEventos({
                    realizados: eventosData.filter((e: any) => e.estado === 'finalizado').length,
                    pendientes: eventosData.filter((e: any) => e.estado !== 'finalizado' && e.estado !== 'cancelado').length,
                    participantes: 0,
                    satisfaccion: 0
                });
            }

            // Messages
            const mensajesData = await getFranquiciadoMensajes(cId);
            setMensajes(mensajesData as any[]);

            // Reuniones
            const reunionesData = await getReunionesAccionistas(cId);
            setReuniones(reunionesData as any[]);

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
            const sendResult = await sendFranquiciadoMessage({
                franquiciado_id: employee?.id ? parseInt(employee.id) : null,
                center_id: centerId,
                categoria: newMessage.categoria,
                asunto: newMessage.asunto.trim(),
                mensaje: newMessage.mensaje.trim(),
                prioridad: newMessage.prioridad,
                estado: 'pendiente'
            });
            if (!sendResult.success) throw new Error(sendResult.error);
            setMensajes((sendResult.messages || []) as any[]);
            try {
                await notifyFranchiseeMessage({
                    franchiseeId: employee?.id ? parseInt(employee.id) : 0,
                    centerId,
                    subject: newMessage.asunto.trim(),
                    franchiseeName: employee ? `${employee.first_name} ${employee.last_name || ''}` : 'Franquiciado'
                });
            } catch (notifyErr) {
                console.error('Error sending franchisee message notification:', notifyErr);
            }
            setNewMessage({ categoria: 'informacion', asunto: '', mensaje: '', prioridad: 'normal' });
            setShowMessageForm(false);
            ui.success('✅ Mensaje enviado correctamente');
        } catch (error) {
            console.error('Error sending message:', error);
            ui.error('❌ Error al enviar el mensaje');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleIncidentCreated = (newIncident: Incident) => {
        const updated = [newIncident, ...detailedIncidents];
        setDetailedIncidents(updated);
        setIncidenciasMetrics(prev => ({
            ...prev,
            abiertas: updated.filter(i => i.status === 'abierta' || i.status === 'en_proceso').length,
            cerradas: updated.filter(i => i.status === 'resuelta' || i.status === 'cerrada').length
        }));
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '12px', color: '#10b981' }}>
                <Loader2 className="animate-spin" size={32} />
                <span style={{ fontSize: '18px', fontWeight: 500 }}>Cargando dashboard...</span>
            </div>
        );
    }

    return (
        <div style={{ padding: 'clamp(12px, 4vw, 32px)', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #10b981 50%, #34d399 100%)',
                borderRadius: '16px', padding: 'clamp(20px, 4vw, 32px)', color: 'white',
                marginBottom: '24px', boxShadow: '0 10px 30px -10px rgba(4, 120, 87, 0.3)',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '140%',
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
                    filter: 'blur(40px)', transform: 'rotate(-15deg)'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <Building2 size={32} />
                            <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700 }}>{centerName}</h1>
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
                            padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px',
                            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
                        }}
                    >
                        <RefreshCw size={16} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* View Switcher */}
            {activeView === 'finance' ? (
                <FranquiciadoFinanceView
                    financial={financial}
                    historicalFinance={historicalFinance}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={setSelectedMonth}
                    onYearChange={setSelectedYear}
                    onBack={() => setActiveView('dashboard')}
                />
            ) : activeView === 'clients' ? (
                <FranquiciadoClientView
                    clients={clients}
                    historicalClients={historicalClients}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={setSelectedMonth}
                    onYearChange={setSelectedYear}
                    onBack={() => setActiveView('dashboard')}
                />
            ) : activeView === 'incidents' ? (
                <FranquiciadoIncidentsView
                    detailedIncidents={detailedIncidents}
                    onBack={() => setActiveView('dashboard')}
                    onNewIncident={() => setShowIncidentModal(true)}
                    getPriorityBadge={getPriorityBadge}
                />
            ) : (
                // ─── Dashboard Overview ───────────────────────────────────
                <>
                    {/* Business Health Module */}
                    {(() => {
                        const kpis = [
                            { id: 'facturacion', label: 'Facturación', current: financial.ingresos, target: OBJECTIVES.ingresos, format: (v: number) => `${v.toLocaleString()}€`, isInverse: false, icon: DollarSign },
                            { id: 'clientes', label: 'Clientes Activos', current: clients.activos, target: OBJECTIVES.clientes, format: (v: number) => v.toString(), isInverse: false, icon: Users },
                            { id: 'incidencias', label: 'Incidencias Abiertas', current: incidenciasMetrics.abiertas, target: OBJECTIVES.incidenciasMax, format: (v: number) => v.toString(), isInverse: true, icon: AlertTriangle },
                            { id: 'eventos', label: 'Eventos Realizados', current: eventos.realizados, target: OBJECTIVES.eventosMin, format: (v: number) => v.toString(), isInverse: false, icon: Star }
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
                        const personnelIncidents = detailedIncidents.filter(
                            inc => inc.incident_type === 'hr' || inc.department?.toLowerCase().includes('personal')
                        );

                        return (
                            <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden transition-all duration-300">
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
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${overallScore >= 80 ? 'bg-emerald-100 text-emerald-700' : overallScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                            {overallScore}%
                                        </div>
                                        {!isHealthExpanded && (
                                            <div className="hidden sm:flex items-center gap-3">
                                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all ${overallScore >= 80 ? 'bg-emerald-500' : overallScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${overallScore}%` }} />
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium">
                                                    {greenCount > 0 && <span className="text-emerald-600">✅{greenCount}</span>}
                                                    {amberCount > 0 && <span className="text-amber-600">⚠️{amberCount}</span>}
                                                    {redCount > 0 && <span className="text-red-600">❌{redCount}</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                                        {isHealthExpanded ? (<>Ocultar <ChevronUp size={14} /></>) : (<>Ver Detalles <ChevronDown size={14} /></>)}
                                    </button>
                                </div>

                                {isHealthExpanded && (
                                    <div className="border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100">
                                            {kpiStatuses.map((kpi) => (
                                                <div key={kpi.id} className="bg-white p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg">{kpi.status === 'green' ? '✅' : kpi.status === 'amber' ? '⚠️' : '❌'}</span>
                                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{kpi.label}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xl font-bold text-gray-900">{kpi.format(kpi.current)}</span>
                                                        <span className="text-sm text-gray-400">/ {kpi.format(kpi.target)}</span>
                                                    </div>
                                                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${kpi.status === 'green' ? 'bg-emerald-500' : kpi.status === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${Math.min(100, kpi.isInverse ? (kpi.current <= kpi.target ? 100 : Math.max(20, 100 - ((kpi.current - kpi.target) / kpi.target) * 50)) : (kpi.current / kpi.target) * 100)}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {personnelIncidents.length > 0 && (
                                            <div className="border-t border-gray-100 px-5 py-4 bg-red-50/50">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-lg">🚨</span>
                                                    <span className="text-sm font-semibold text-red-700">Alertas de Personal ({personnelIncidents.length})</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {personnelIncidents.slice(0, 3).map((inc) => (
                                                        <div key={inc.id} className="flex items-center gap-2 text-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                            <span className="text-gray-700">{inc.title}</span>
                                                            <span className="text-gray-400">- {new Date(inc.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
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
                        <div onClick={() => setActiveView('finance')} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-emerald-200/40 hover:-translate-y-1 relative group overflow-hidden">
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
                                <div className={`text-center p-3 sm:p-4 rounded-xl border-2 ${financial.balance >= 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                                    <div className={`text-lg sm:text-2xl font-bold ${financial.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {financial.balance >= 0 ? '+' : ''}{financial.balance.toLocaleString()} €
                                    </div>
                                    <div className="text-xs text-gray-500">Balance</div>
                                </div>
                            </div>
                        </div>

                        <div onClick={() => setActiveView('clients')} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-fuchsia-200/40 hover:-translate-y-1 relative group overflow-hidden">
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
                        <div onClick={() => setActiveView('incidents')} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-200/40 hover:-translate-y-1 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="text-orange-500" />
                            </div>
                            <SectionHeader title="Incidencias" icon={AlertTriangle} color="#f59e0b" />
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className={`text-center p-3 sm:p-5 rounded-xl border-2 ${incidenciasMetrics.abiertas > 0 ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                                    <div className={`text-2xl sm:text-4xl font-bold ${incidenciasMetrics.abiertas > 0 ? 'text-red-600' : 'text-green-600'}`}>
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

                    {/* Reuniones & Mensajería Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
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
                                                <div className="text-xs text-blue-600">{new Date(reunion.fecha).toLocaleDateString()}</div>
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

                        <FranquiciadoMessaging
                            mensajes={mensajes}
                            showMessageForm={showMessageForm}
                            newMessage={newMessage}
                            sendingMessage={sendingMessage}
                            onToggleForm={() => setShowMessageForm(!showMessageForm)}
                            onMessageChange={(update) => setNewMessage(prev => ({ ...prev, ...update }))}
                            onSendMessage={handleSendMessage}
                            getCategoriaIcon={getCategoriaIcon}
                            getEstadoStyle={getEstadoStyle}
                        />
                    </div>
                </>
            )}

            <IncidentCreationModal
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
