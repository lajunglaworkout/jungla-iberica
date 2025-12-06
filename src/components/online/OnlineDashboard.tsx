import React, { useState, useEffect } from 'react';
import {
    CheckSquare, Video, Calendar, Lightbulb,
    DollarSign, BarChart3, Loader2, Globe,
    Users, TrendingUp, Activity
} from 'lucide-react';
import { KPICard } from '../academy/Dashboard/KPICard';
import { NavigationCard } from '../academy/Dashboard/NavigationCard';
import { OnlineTareasView } from './Tareas/OnlineTareasView';
import { OnlineContenidoView } from './Contenido/OnlineContenidoView';
import { OnlineCalendarioView } from './Calendario/OnlineCalendarioView';
import { OnlineIdeasView } from './Ideas/OnlineIdeasView';
import { OnlineFacturacionView } from './Facturacion/OnlineFacturacionView';
import { OnlineReportesView } from './Reportes/OnlineReportesView';
import { supabase } from '../../lib/supabase';

// Interfaces for dashboard data
interface DashboardMetrics {
    pendingTasks: number;
    contentPieces: number;
    scheduledPosts: number;
    newIdeas: number;
    activeClients: number;
    monthlyRevenue: number;
}

interface OnlineDashboardProps {
    hideBilling?: boolean;
}

export const OnlineDashboard: React.FC<OnlineDashboardProps> = ({ hideBilling = false }) => {
    const [activeView, setActiveView] = useState<string>('dashboard');
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        pendingTasks: 0,
        contentPieces: 0,
        scheduledPosts: 0,
        newIdeas: 0,
        activeClients: 0,
        monthlyRevenue: 0
    });

    useEffect(() => {
        loadDashboardMetrics();
    }, []);

    const loadDashboardMetrics = async () => {
        setLoading(true);
        try {
            // Execute all count queries in parallel
            // Note: Tables might not exist yet if migration hasn't run, so we handle errors gracefully
            const [
                { count: tasksCount },
                { count: contentCount },
                { count: scheduledCount },
                { count: ideasCount },
                { count: clientsCount }
            ] = await Promise.all([
                supabase.from('online_tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('online_content').select('*', { count: 'exact', head: true }),
                supabase.from('online_calendar').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
                supabase.from('online_ideas').select('*', { count: 'exact', head: true }).eq('status', 'new'),
                supabase.from('online_clients').select('*', { count: 'exact', head: true }).eq('status', 'active')
            ]);

            setMetrics({
                pendingTasks: tasksCount || 0,
                contentPieces: contentCount || 0,
                scheduledPosts: scheduledCount || 0,
                newIdeas: ideasCount || 0,
                activeClients: clientsCount || 0,
                monthlyRevenue: 0 // Placeholder until Harbiz integration
            });
        } catch (error) {
            console.error('Error loading online metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'tareas':
                return <OnlineTareasView onBack={() => setActiveView('dashboard')} />;
            case 'contenido':
                return <OnlineContenidoView onBack={() => setActiveView('dashboard')} />;
            case 'calendario':
                return <OnlineCalendarioView onBack={() => setActiveView('dashboard')} />;
            case 'ideas':
                return <OnlineIdeasView onBack={() => setActiveView('dashboard')} />;
            case 'facturacion':
                return <OnlineFacturacionView onBack={() => setActiveView('dashboard')} />;
            case 'reportes':
                return <OnlineReportesView onBack={() => setActiveView('dashboard')} />;
            case 'dashboard':
            default:
                return renderDashboard();
        }
    };

    const renderDashboard = () => (
        <div className="space-y-24 animate-in fade-in duration-500">
            {/* Header Section */}
            <div style={{
                background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #2dd4bf 100%)', // Teal/Jungle gradient
                borderRadius: '16px',
                padding: '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
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
                    <Globe style={{ height: '16px', width: '16px' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Plataforma Online</span>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Video className="h-8 w-8 text-white" />
                        <h1 className="text-3xl font-bold">La Jungla Online</h1>
                    </div>
                    <p className="text-teal-100 text-lg max-w-2xl">
                        Gestión de Contenido, Redes y Entrenamiento Online
                    </p>
                </div>

                {/* Decorative background elements */}
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                    <Video size={300} />
                </div>
            </div>

            {/* KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                <KPICard
                    title="Facturación Mes"
                    value={`${metrics.monthlyRevenue} €`}
                    subtitle="Harbiz"
                    icon={DollarSign}
                    color="#14b8a6" // Teal
                    trend="stable"
                    trendValue="+0%"
                />
                <KPICard
                    title="Clientes Activos"
                    value={metrics.activeClients}
                    subtitle="Suscripciones activas"
                    icon={Users}
                    color="#22c55e" // Green
                    trend="up"
                    trendValue="+0"
                />
                <KPICard
                    title="Contenido Publicado"
                    value={metrics.contentPieces}
                    subtitle="Total biblioteca"
                    icon={Video}
                    color="#f59e0b" // Amber
                />
                <KPICard
                    title="Engagement"
                    value="0%"
                    subtitle="Promedio mensual"
                    icon={Activity}
                    color="#ec4899" // Pink
                />
            </div>

            {/* Spacer to separate KPIs from Navigation Cards */}
            <div className="h-20"></div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <NavigationCard
                    title="TAREAS"
                    icon={CheckSquare}
                    metric={`${metrics.pendingTasks} Pendientes`}
                    subtext="Gestión operativa"
                    onClick={() => setActiveView('tareas')}
                    color="#ef4444" // Red
                    status={metrics.pendingTasks > 0 ? 'warning' : 'active'}
                />
                <NavigationCard
                    title="CONTENIDO DIGITAL"
                    icon={Video}
                    metric={`${metrics.contentPieces} Piezas`}
                    subtext="Biblioteca de vídeos"
                    onClick={() => setActiveView('contenido')}
                    color="#3b82f6" // Blue
                    status="active"
                />
                <NavigationCard
                    title="CALENDARIO"
                    icon={Calendar}
                    metric={`${metrics.scheduledPosts} Programados`}
                    subtext="Planificación redes"
                    onClick={() => setActiveView('calendario')}
                    color="#8b5cf6" // Violet
                    status="active"
                />
                <NavigationCard
                    title="IDEAS"
                    icon={Lightbulb}
                    metric={`${metrics.newIdeas} Nuevas`}
                    subtext="Backlog de contenido"
                    onClick={() => setActiveView('ideas')}
                    color="#f59e0b" // Amber
                    status="active"
                />
                {!hideBilling && (
                    <NavigationCard
                        title="FACTURACIÓN"
                        icon={DollarSign}
                        metric={`${metrics.activeClients} Clientes`}
                        subtext="Datos de Harbiz"
                        onClick={() => setActiveView('facturacion')}
                        color="#10b981"
                        status="active"
                    />
                )}
                {!hideBilling && (
                    <NavigationCard
                        title="REPORTES"
                        icon={BarChart3}
                        metric="Analytics"
                        subtext="Performance y métricas"
                        onClick={() => setActiveView('reportes')}
                        color="#6366f1"
                        status="active"
                    />
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Cargando La Jungla Online...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50">
            {renderContent()}
        </div>
    );
};
