import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    MapPin,
    ArrowRight,
    Wrench,
    Activity,
    Calendar,
    History,
    Search,
    Filter,
    FileText,
    Plus,
    Bell,
    Send,
    X,
    Trash2,
    Megaphone
} from 'lucide-react';
import maintenanceService from '../../services/maintenanceService';
import type { MaintenanceInspection } from '../../types/maintenance';
import InspectionStepByStep from './InspectionStepByStep';
import MaintenanceAnalytics from './MaintenanceAnalytics';
import TicketManager from './TicketManager';
import InspectionHistory from './InspectionHistory';
import { useSession } from '../../contexts/SessionContext';
import { ui } from '../../utils/ui';


interface DirectorStats {
    totalActiveTickets: number;
    avgResolutionTime: number;
    criticalIssuesCount: number;
    totalInspectionsThisMonth: number;
}

interface CenterComparison {
    centerId: string;
    centerName: string;
    healthScore: number;
    pendingTickets: number;
    lastInspectionDate: string | null;
}

interface FrequentRepair {
    conceptName: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
}

interface UnmanagedRepair {
    id: string;
    centerName: string;
    conceptName: string;
    daysOpen: number;
    status: string;
}

interface InspectionScheduleItem {
    centerId: string;
    centerName: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    scheduledDate: Date;
    completedDate?: string;
    inspectorName?: string;
}

const MaintenanceDirectorDashboard: React.FC = () => {
    const { employee } = useSession();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'convocatoria' | 'historico' | 'analiticas' | 'incidencias'>('dashboard');
    const [stats, setStats] = useState<DirectorStats>({
        totalActiveTickets: 0,
        avgResolutionTime: 0,
        criticalIssuesCount: 0,
        totalInspectionsThisMonth: 0
    });
    const [centers, setCenters] = useState<CenterComparison[]>([]);
    const [frequentRepairs, setFrequentRepairs] = useState<FrequentRepair[]>([]);
    const [unmanagedRepairs, setUnmanagedRepairs] = useState<UnmanagedRepair[]>([]);

    // Nuevos estados
    const [schedule, setSchedule] = useState<InspectionScheduleItem[]>([]);
    const [history, setHistory] = useState<MaintenanceInspection[]>([]);
    const [historyFilter, setHistoryFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Estados para Nueva Inspección
    const [isInspecting, setIsInspecting] = useState(false);
    const [centersList, setCentersList] = useState<Array<{ id: string; name: string }>>([]);
    const [selectedCenterId, setSelectedCenterId] = useState<string>('');

    // Estados para Convocatoria
    const [isConvoking, setIsConvoking] = useState(false);
    const [convocationDeadline, setConvocationDeadline] = useState<string>('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsData, centersData, frequentData, unmanagedData, scheduleData, historyData, centersListData] = await Promise.all([
                maintenanceService.getDirectorStats(),
                maintenanceService.getCenterComparison(),
                maintenanceService.getFrequentRepairs(),
                maintenanceService.getUnmanagedRepairs(),
                maintenanceService.getInspectionSchedule(),
                maintenanceService.getAllInspections(undefined, 100),
                maintenanceService.getCenters()
            ]);

            setStats(statsData);
            setCenters(centersData);
            setFrequentRepairs(frequentData);
            setUnmanagedRepairs(unmanagedData);
            setSchedule(scheduleData);
            if (historyData.success && historyData.data) {
                setHistory(historyData.data);
            }
            setCentersList(centersListData.map(c => ({ id: c.id.toString(), name: c.name })));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConvokeInspection = () => {
        // Calcular fecha por defecto (15 del último mes del trimestre)
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3) + 1;
        const quarterEndMonth = (currentQuarter * 3) - 1;
        const defaultDate = new Date(today.getFullYear(), quarterEndMonth, 15);

        setConvocationDeadline(defaultDate.toISOString().split('T')[0]);
        setIsConvoking(true);
    };

    const handleConfirmConvocation = () => {
        if (!convocationDeadline) return;

        const deadline = new Date(convocationDeadline);
        maintenanceService.setQuarterlyDeadline(deadline);

        // Recargar datos para actualizar la fecha en la tabla
        loadDashboardData();
        setIsConvoking(false);
        ui.success(`✅ Convocatoria enviada correctamente a todos los centros con fecha límite: ${deadline.toLocaleDateString()}`);
    };

    const handleResetData = async () => {
        if (await ui.confirm('⚠️ ¿Estás seguro de que deseas ELIMINAR TODOS los datos de pruebas (inspecciones, items, alertas)? Esta acción no se puede deshacer.')) {
            setLoading(true);
            const result = await maintenanceService.clearAllData();
            if (result.success) {
                ui.success('✅ Datos eliminados correctamente. Recargando...');
                loadDashboardData();
            } else {
                ui.error(`❌ Error eliminando datos: ${result.error}`);
            }
            setLoading(false);
        }
    };

    const handleBackFromInspection = () => {
        setIsInspecting(false);
        setSelectedCenterId('');
        loadDashboardData(); // Recargar datos al volver
    };

    const handleNotify = (centerName: string) => {
        ui.success(`📧 Notificación enviada al encargado de ${centerName} para recordar la inspección pendiente.`);
    };

    const filteredHistory = history.filter(inspection =>
        inspection.center_name.toLowerCase().includes(historyFilter.toLowerCase()) ||
        inspection.inspector_name.toLowerCase().includes(historyFilter.toLowerCase())
    );

    if (isInspecting) {
        return (
            <InspectionStepByStep
                userEmail={employee?.email || 'director@lajungla.es'}
                userName={employee?.name || 'Director'}
                centerName={''} // Se seleccionará dentro
                centerId={''}   // Se seleccionará dentro
                availableCenters={centersList}
                onBack={handleBackFromInspection}
            />
        );
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', border: '4px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                    <p style={{ color: '#4b5563' }}>Cargando panel de dirección...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '32px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#111827',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                margin: 0
                            }}>
                                <Activity style={{ width: '32px', height: '32px', color: '#2563eb' }} />
                                Panel de Control de Mantenimiento
                            </h1>
                            <p style={{ color: '#4b5563', marginTop: '8px', fontSize: '16px' }}>
                                Visión global del estado de las instalaciones
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleConvokeInspection}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 20px',
                                    backgroundColor: '#059669',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                            >
                                <Megaphone style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                                Convocar Inspección Trimestral
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <button
                        onClick={async () => setActiveTab('dashboard')}
                        style={{
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: activeTab === 'dashboard' ? '#2563eb' : '#6b7280',
                            border: 'none',
                            borderBottom: activeTab === 'dashboard' ? '2px solid #2563eb' : '2px solid transparent',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <BarChart3 style={{ width: '18px', height: '18px' }} />
                        Dashboard
                    </button>
                    <button
                        onClick={async () => setActiveTab('convocatoria')}
                        style={{
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: activeTab === 'convocatoria' ? '#2563eb' : '#6b7280',
                            border: 'none',
                            borderBottom: activeTab === 'convocatoria' ? '2px solid #2563eb' : '2px solid transparent',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Calendar style={{ width: '18px', height: '18px' }} />
                        Convocatoria
                    </button>
                    <button
                        onClick={async () => setActiveTab('historico')}
                        style={{
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: activeTab === 'historico' ? '#2563eb' : '#6b7280',
                            border: 'none',
                            borderBottom: activeTab === 'historico' ? '2px solid #2563eb' : '2px solid transparent',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <History style={{ width: '18px', height: '18px' }} />
                        Histórico
                    </button>
                    <button
                        onClick={async () => setActiveTab('analiticas')}
                        style={{
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: activeTab === 'analiticas' ? '#2563eb' : '#6b7280',
                            border: 'none',
                            borderBottom: activeTab === 'analiticas' ? '2px solid #2563eb' : '2px solid transparent',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <TrendingUp style={{ width: '18px', height: '18px' }} />
                        Analíticas
                    </button>
                    <button
                        onClick={async () => setActiveTab('incidencias')}
                        style={{
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: activeTab === 'incidencias' ? '#2563eb' : '#6b7280',
                            border: 'none',
                            borderBottom: activeTab === 'incidencias' ? '2px solid #2563eb' : '2px solid transparent',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <AlertTriangle style={{ width: '18px', height: '18px' }} />
                        Incidencias
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'dashboard' && (
                <>
                    {/* KPIs Globales */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '24px',
                        marginBottom: '32px'
                    }}>
                        {/* Card 1 - Clickable to Incidencias */}
                        <div
                            onClick={async () => setActiveTab('incidencias')}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #f3f4f6',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
                                e.currentTarget.style.borderColor = '#2563eb';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#f3f4f6';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                                    <Wrench style={{ width: '24px', height: '24px', color: '#2563eb' }} />
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Tickets Activos</span>
                            </div>
                            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#2563eb' }}>{stats.totalActiveTickets}</div>
                            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                reparaciones pendientes
                                <ArrowRight style={{ width: '14px', height: '14px', color: '#2563eb' }} />
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #f3f4f6'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                                    <Clock style={{ width: '24px', height: '24px', color: '#16a34a' }} />
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Tiempo Resolución</span>
                            </div>
                            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>{stats.avgResolutionTime}</div>
                            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>días de media</div>
                        </div>

                        {/* Card 3 */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #f3f4f6'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                                    <AlertTriangle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Problemas Críticos</span>
                            </div>
                            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#dc2626' }}>{stats.criticalIssuesCount}</div>
                            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>requieren atención inmediata</div>
                        </div>

                        {/* Card 4 */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #f3f4f6'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ padding: '12px', backgroundColor: '#faf5ff', borderRadius: '8px' }}>
                                    <CheckCircle style={{ width: '24px', height: '24px', color: '#9333ea' }} />
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Inspecciones Mes</span>
                            </div>
                            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>{stats.totalInspectionsThisMonth}</div>
                            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>realizadas este mes</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        {/* Comparativa de Centros */}
                        <div style={{
                            gridColumn: 'span 2',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #f3f4f6',
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                    <MapPin style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                                    Estado por Centro
                                </h2>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#f9fafb' }}>
                                        <tr>
                                            <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Centro</th>
                                            <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Health Score</th>
                                            <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Tickets</th>
                                            <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Última Inspección</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {centers.map((center, idx) => (
                                            <tr key={center.centerId} style={{ borderBottom: idx < centers.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ fontWeight: '500', color: '#111827' }}>{center.centerName}</div>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '2px 10px',
                                                        borderRadius: '9999px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        backgroundColor: center.healthScore >= 80 ? '#dcfce7' : center.healthScore >= 60 ? '#fef9c3' : '#fee2e2',
                                                        color: center.healthScore >= 80 ? '#166534' : center.healthScore >= 60 ? '#854d0e' : '#991b1b'
                                                    }}>
                                                        {center.healthScore}%
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                    <span style={{ color: '#4b5563', fontWeight: '500' }}>{center.pendingTickets}</span>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', color: '#6b7280' }}>
                                                    {center.lastInspectionDate
                                                        ? new Date(center.lastInspectionDate).toLocaleDateString('es-ES')
                                                        : 'Pendiente'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Reparaciones Frecuentes */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #f3f4f6'
                        }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                    <TrendingUp style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                                    Top Reparaciones
                                </h2>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {frequentRepairs.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#f3f4f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#4b5563'
                                                }}>
                                                    {idx + 1}
                                                </div>
                                                <span style={{ color: '#374151', fontWeight: '500' }}>{item.conceptName}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: '#111827', fontWeight: 'bold' }}>{item.count}</span>
                                                <span style={{ fontSize: '12px', color: '#6b7280' }}>veces</span>
                                            </div>
                                        </div>
                                    ))}
                                    {frequentRepairs.length === 0 && (
                                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '16px' }}>No hay datos suficientes</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tickets Sin Gestionar */}
                    <div style={{
                        marginTop: '32px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #f3f4f6'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <AlertTriangle style={{ width: '20px', height: '20px' }} />
                                Tickets Sin Gestionar (+7 días)
                            </h2>
                        </div>
                        <div style={{ padding: '24px' }}>
                            {unmanagedRepairs.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                                    {unmanagedRepairs.map((ticket) => (
                                        <div key={ticket.id} style={{
                                            border: '1px solid #fee2e2',
                                            backgroundColor: '#fef2f2',
                                            borderRadius: '8px',
                                            padding: '16px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <span style={{
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: '#991b1b',
                                                    backgroundColor: '#fee2e2',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px'
                                                }}>
                                                    {ticket.centerName}
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                                                    {ticket.daysOpen} días
                                                </span>
                                            </div>
                                            <h3 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px', fontSize: '16px' }}>{ticket.conceptName}</h3>
                                            <div style={{ fontSize: '14px', color: '#4b5563', textTransform: 'capitalize' }}>Estado: {ticket.status}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                                    <CheckCircle style={{ width: '48px', height: '48px', color: '#22c55e', margin: '0 auto 12px' }} />
                                    <h3 style={{ color: '#166534', fontWeight: '500', fontSize: '18px', marginBottom: '4px' }}>¡Todo al día!</h3>
                                    <p style={{ color: '#16a34a', fontSize: '14px' }}>No hay tickets antiguos sin gestionar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'convocatoria' && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #f3f4f6',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <Calendar style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                            Convocatoria Trimestral - {Math.floor(new Date().getMonth() / 3) + 1}º Trimestre {new Date().getFullYear()}
                        </h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f9fafb' }}>
                                <tr>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Centro</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Fecha Límite</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Estado</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Inspector</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Fecha Realización</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((item, idx) => (
                                    <tr key={item.centerId} style={{ borderBottom: idx < schedule.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '500', color: '#111827' }}>{item.centerName}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#4b5563' }}>
                                            {new Date(item.scheduledDate).toLocaleDateString('es-ES')}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: item.status === 'completed' ? '#dcfce7' : item.status === 'in_progress' ? '#dbeafe' : item.status === 'overdue' ? '#fee2e2' : '#f3f4f6',
                                                color: item.status === 'completed' ? '#166534' : item.status === 'in_progress' ? '#1e40af' : item.status === 'overdue' ? '#991b1b' : '#374151'
                                            }}>
                                                {item.status === 'completed' ? 'Completada' : item.status === 'in_progress' ? 'En Progreso' : item.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#4b5563' }}>
                                            {item.inspectorName || '-'}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right', color: '#4b5563' }}>
                                            {item.completedDate ? new Date(item.completedDate).toLocaleDateString('es-ES') : '-'}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {item.status !== 'completed' && (
                                                    <>
                                                        <button
                                                            onClick={async () => {
                                                                setSelectedCenterId(item.centerId);
                                                                setIsInspecting(true);
                                                            }}
                                                            style={{
                                                                backgroundColor: 'white',
                                                                border: '1px solid #2563eb',
                                                                borderRadius: '6px',
                                                                padding: '6px 12px',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                fontSize: '12px',
                                                                color: '#2563eb',
                                                                fontWeight: '500',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'white';
                                                            }}
                                                        >
                                                            <Wrench style={{ width: '12px', height: '12px' }} />
                                                            Inspeccionar
                                                        </button>
                                                        <button
                                                            onClick={async () => handleNotify(item.centerName)}
                                                            style={{
                                                                backgroundColor: 'transparent',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '6px',
                                                                padding: '6px 12px',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                fontSize: '12px',
                                                                color: '#4b5563',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                                                e.currentTarget.style.borderColor = '#9ca3af';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.borderColor = '#d1d5db';
                                                            }}
                                                        >
                                                            <Send style={{ width: '12px', height: '12px' }} />
                                                            Notificar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'historico' && (
                <InspectionHistory
                    centerId="" // Mostrar historial global o permitir selección
                    onViewInspection={(id) => {
                        // Lógica para ver detalle (podría abrir modal o navegar)
                        console.log('Ver inspección:', id);
                    }}
                />
            )}

            {activeTab === 'analiticas' && <MaintenanceAnalytics />}

            {activeTab === 'incidencias' && <TicketManager />}

            {/* Modal de Convocatoria */}
            {isConvoking && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '400px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
                            Convocar Inspección Trimestral
                        </h3>
                        <p style={{ color: '#4b5563', marginBottom: '20px', fontSize: '14px' }}>
                            Selecciona la fecha límite para que los centros realicen la inspección. Se enviará una notificación a todos los encargados.
                        </p>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                Fecha Límite
                            </label>
                            <input
                                type="date"
                                value={convocationDeadline}
                                onChange={async (e) => setConvocationDeadline(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={async () => setIsConvoking(false)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmConvocation}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: '#059669',
                                    color: 'white',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Confirmar y Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceDirectorDashboard;
