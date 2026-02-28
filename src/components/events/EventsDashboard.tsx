import React, { useState, useEffect } from 'react';
import {
    Calendar, Users, DollarSign, Star, ClipboardList,
    CheckSquare, Package, FileText, BarChart3, Loader2,
    ArrowLeft, Plus, CalendarDays, MessageSquare
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { useSession } from '../../contexts/SessionContext';

// Import sub-components
import { EventsList } from './EventsList';
import { EventTemplate } from './EventTemplate';
import { EventCalendar } from './EventCalendar';
import { EventTasksBoard } from './EventTasksBoard';
import { ParticipantsList } from './ParticipantsList';
import { ProvidersList } from './ProvidersList';
import { FinancialSummary } from './FinancialSummary';
import { SurveysList } from './SurveysList';
import { MaterialsRepository } from './MaterialsRepository';
import { ReportsGenerator } from './ReportsGenerator';
import { EventAlerts } from './EventAlerts';

// Interfaces
interface DashboardMetrics {
    eventosEsteMes: number;
    participantesTotales: number;
    balanceAcumulado: number;
    satisfaccionMedia: number;
    tareasPendientes: number;
    eventosActivos: number;
}

interface EventsDashboardProps {
    userEmail?: string;
    onBack?: () => void;
}

// KPI Card Component
const KPICard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    trend?: string;
}> = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div
        style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: 'clamp(16px, 3vw, 24px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Icon size={24} color={color} />
            </div>
            {trend && (
                <span style={{
                    fontSize: '12px',
                    color: trend.startsWith('+') ? '#10b981' : '#ef4444',
                    fontWeight: 500
                }}>{trend}</span>
            )}
        </div>
        <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{value}</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{title}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{subtitle}</div>
        </div>
    </div>
);

// Navigation Card Component
const NavigationCard: React.FC<{
    title: string;
    icon: React.ElementType;
    metric: string;
    subtext: string;
    onClick: () => void;
    color: string;
    status?: 'active' | 'warning' | 'inactive';
}> = ({ title, icon: Icon, metric, subtext, onClick, color, status = 'active' }) => (
    <button
        onClick={onClick}
        style={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: 'clamp(16px, 3vw, 24px)',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        {/* Status badge */}
        <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: status === 'active' ? '#dcfce7' : status === 'warning' ? '#fef3c7' : '#f3f4f6',
            color: status === 'active' ? '#16a34a' : status === 'warning' ? '#d97706' : '#6b7280',
            fontSize: '11px',
            fontWeight: 500
        }}>
            {status === 'active' ? 'Activo' : status === 'warning' ? 'Pendiente' : 'Inactivo'}
        </div>

        <div
            style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
            }}
        >
            <Icon size={28} color={color} />
        </div>

        <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px' }}>
            {title}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginTop: '8px' }}>
            {metric}
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            {subtext}
        </div>
    </button>
);

export const EventsDashboard: React.FC<EventsDashboardProps> = ({ userEmail, onBack }) => {
    const { employee } = useSession();
    const [activeView, setActiveView] = useState<string>('dashboard');
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        eventosEsteMes: 0,
        participantesTotales: 0,
        balanceAcumulado: 0,
        satisfaccionMedia: 0,
        tareasPendientes: 0,
        eventosActivos: 0
    });

    useEffect(() => {
        loadDashboardMetrics();
    }, []);

    // Reload metrics when returning to dashboard
    useEffect(() => {
        if (activeView === 'dashboard') {
            loadDashboardMetrics();
        }
    }, [activeView]);

    const loadDashboardMetrics = async () => {
        setLoading(true);
        try {
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                .toISOString().split('T')[0];
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
                .toISOString().split('T')[0];

            // Eventos este mes
            const eventosEsteMes = await eventService.eventos.countByDateRange(firstDayOfMonth, lastDayOfMonth);

            // Eventos activos (no finalizados ni cancelados)
            const eventosActivos = await eventService.eventos.countActive();

            // Participantes totales
            const participantes = await eventService.participantes.countAll();

            // Tareas pendientes
            const tareasPendientes = await eventService.tareas.countPending();

            // Balance acumulado (ingresos - gastos)
            const ingresosData = await eventService.ingresos.getAll('importe');
            const totalIngresos = ingresosData.reduce((sum: number, i: Record<string, unknown>) => sum + ((i.importe as number) || 0), 0);

            const gastosData = await eventService.gastos.getAll('coste');
            const totalGastos = gastosData.reduce((sum: number, g: Record<string, unknown>) => sum + ((g.coste as number) || 0), 0);

            // Satisfaccion media
            const encuestasData = await eventService.encuestas.getAll('puntuacion_general');
            const satisfaccionMedia = encuestasData.length > 0
                ? encuestasData.reduce((sum: number, e: Record<string, unknown>) => sum + ((e.puntuacion_general as number) || 0), 0) / encuestasData.length
                : 0;

            setMetrics({
                eventosEsteMes: eventosEsteMes || 0,
                participantesTotales: participantes || 0,
                balanceAcumulado: totalIngresos - totalGastos,
                satisfaccionMedia: Math.round(satisfaccionMedia * 10) / 10,
                tareasPendientes: tareasPendientes || 0,
                eventosActivos: eventosActivos || 0
            });
        } catch (error) {
            console.error('Error loading eventos metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEvent = (eventId: number) => {
        setSelectedEventId(eventId);
        setActiveView('event-detail');
    };

    const handleBackFromList = () => {
        setActiveView('dashboard');
    };

    const handleBackFromDetail = () => {
        setSelectedEventId(null);
        setActiveView('eventos-list');
    };

    const renderDashboard = () => (
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header Section */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
                    borderRadius: '16px',
                    padding: 'clamp(20px, 4vw, 32px)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(4, 120, 87, 0.3)',
                    marginBottom: '32px'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(4px)'
                }}>
                    <Calendar style={{ height: '16px', width: '16px' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Eventos</span>
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Calendar size={32} />
                        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, margin: 0 }}>
                            Gestión de Eventos
                        </h1>
                    </div>
                    <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', opacity: 0.9, margin: 0 }}>
                        Planificación, organización y seguimiento de eventos La Jungla
                    </p>
                </div>
            </div>

            {/* KPIs Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: 'clamp(12px, 2vw, 20px)',
                marginBottom: '40px'
            }}>
                <KPICard
                    title="Eventos Este Mes"
                    value={metrics.eventosEsteMes}
                    subtitle="Programados"
                    icon={Calendar}
                    color="#10b981"
                />
                <KPICard
                    title="Participantes"
                    value={metrics.participantesTotales}
                    subtitle="Total inscritos"
                    icon={Users}
                    color="#16a34a"
                />
                <KPICard
                    title="Balance"
                    value={`${metrics.balanceAcumulado >= 0 ? '+' : ''}${metrics.balanceAcumulado.toFixed(2)} €`}
                    subtitle="Acumulado"
                    icon={DollarSign}
                    color={metrics.balanceAcumulado >= 0 ? '#16a34a' : '#ef4444'}
                />
                <KPICard
                    title="Satisfacción"
                    value={metrics.satisfaccionMedia > 0 ? `${metrics.satisfaccionMedia}/5` : 'N/A'}
                    subtitle="Media encuestas"
                    icon={Star}
                    color="#f59e0b"
                />
            </div>

            {/* Alerts Section */}
            <div style={{ marginBottom: '24px' }}>
                <EventAlerts onNavigateToEvent={handleSelectEvent} />
            </div>

            {/* Navigation Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: 'clamp(12px, 2vw, 20px)'
            }}>
                <NavigationCard
                    title="EVENTOS"
                    icon={Calendar}
                    metric={`${metrics.eventosActivos} Activos`}
                    subtext="Gestión de eventos"
                    onClick={() => setActiveView('eventos-list')}
                    color="#10b981"
                    status="active"
                />
                <NavigationCard
                    title="CALENDARIO"
                    icon={CalendarDays}
                    metric="Vista Mensual"
                    subtext="Planificación temporal"
                    onClick={() => setActiveView('calendario')}
                    color="#3b82f6"
                    status="active"
                />
                <NavigationCard
                    title="TAREAS"
                    icon={CheckSquare}
                    metric={`${metrics.tareasPendientes} Pendientes`}
                    subtext="Checklist operativo"
                    onClick={() => setActiveView('tareas')}
                    color="#ef4444"
                    status={metrics.tareasPendientes > 0 ? 'warning' : 'active'}
                />
                <NavigationCard
                    title="PARTICIPANTES"
                    icon={Users}
                    metric={`${metrics.participantesTotales} Inscritos`}
                    subtext="Gestión de asistentes"
                    onClick={() => setActiveView('participantes')}
                    color="#16a34a"
                    status="active"
                />
                <NavigationCard
                    title="PROVEEDORES"
                    icon={Package}
                    metric="Directorio"
                    subtext="Contactos y servicios"
                    onClick={() => setActiveView('proveedores')}
                    color="#8b5cf6"
                    status="active"
                />
                <NavigationCard
                    title="MATERIALES"
                    icon={FileText}
                    metric="Recursos"
                    subtext="Cartelería y contenido"
                    onClick={() => setActiveView('materiales')}
                    color="#0891b2"
                    status="active"
                />
                <NavigationCard
                    title="FINANCIERO"
                    icon={DollarSign}
                    metric="Ver Resumen"
                    subtext="Gastos e ingresos"
                    onClick={() => setActiveView('financiero')}
                    color="#059669"
                    status="active"
                />
                <NavigationCard
                    title="ENCUESTAS"
                    icon={MessageSquare}
                    metric="Satisfacción"
                    subtext="Feedback participantes"
                    onClick={() => setActiveView('encuestas')}
                    color="#f59e0b"
                    status="active"
                />
                <NavigationCard
                    title="REPORTES"
                    icon={BarChart3}
                    metric="Generar"
                    subtext="PDF / Excel"
                    onClick={() => setActiveView('reportes')}
                    color="#6366f1"
                    status="active"
                />
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeView) {
            case 'eventos-list':
                return <EventsList onSelectEvent={handleSelectEvent} onBack={handleBackFromList} />;

            case 'event-detail':
                if (selectedEventId) {
                    return <EventTemplate eventId={selectedEventId} onBack={handleBackFromDetail} />;
                }
                return null;

            case 'calendario':
                return <EventCalendar onSelectEvent={handleSelectEvent} onBack={handleBackFromList} />;

            case 'tareas':
                return <EventTasksBoard onBack={handleBackFromList} />;

            case 'participantes':
                return <ParticipantsList onBack={handleBackFromList} />;

            case 'proveedores':
                return <ProvidersList onBack={handleBackFromList} />;

            case 'financiero':
                return <FinancialSummary onBack={handleBackFromList} />;

            case 'encuestas':
                return <SurveysList onBack={handleBackFromList} />;

            case 'materiales':
                return <MaterialsRepository onBack={handleBackFromList} />;

            case 'reportes':
                return <ReportsGenerator onBack={handleBackFromList} />;

            case 'dashboard':
            default:
                return renderDashboard();
        }
    };

    if (loading && activeView === 'dashboard') {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#f9fafb'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: '#6b7280', marginTop: '16px' }}>Cargando Eventos...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            padding: 'clamp(16px, 4vw, 32px)',
            backgroundColor: '#f9fafb',
            minHeight: '100vh'
        }}>
            {activeView !== 'dashboard' && (
                <button
                    onClick={() => setActiveView('dashboard')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginBottom: '24px',
                        color: '#374151',
                        fontWeight: 500
                    }}
                >
                    <ArrowLeft size={18} />
                    Volver al Dashboard
                </button>
            )}
            {renderContent()}
        </div>
    );
};

export default EventsDashboard;
