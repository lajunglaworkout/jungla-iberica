import React, { useState } from 'react';
import {
    Calendar,
    BarChart3,
    Brain,
    Users,
    Video,
    TrendingUp,
    Activity,
    DollarSign
} from 'lucide-react';
import { MarketingContenidoView } from './Contenido/MarketingContenidoView';
import { MarketingCalendarioView } from './Calendario/MarketingCalendarioView';
import { MarketingReportesView } from './Reportes/MarketingReportesView';
import { MarketingAIView } from './AI/MarketingAIView';
import { MarketingColaboracionesView } from './Colaboraciones/MarketingColaboracionesView';
import { NavigationCard } from '../academy/Dashboard/NavigationCard';
import { KPICard } from '../academy/Dashboard/KPICard';

export const MarketingDashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'contenido' | 'calendario' | 'reportes' | 'ai' | 'colaboraciones'>('dashboard');

    const renderContent = () => {
        switch (currentView) {
            case 'contenido':
                return <MarketingContenidoView onBack={() => setCurrentView('dashboard')} />;
            case 'calendario':
                return <MarketingCalendarioView onBack={() => setCurrentView('dashboard')} />;
            case 'reportes':
                return <MarketingReportesView onBack={() => setCurrentView('dashboard')} />;
            case 'ai':
                return <MarketingAIView onBack={() => setCurrentView('dashboard')} />;
            case 'colaboraciones':
                return <MarketingColaboracionesView onBack={() => setCurrentView('dashboard')} />;
            case 'dashboard':
            default:
                return renderDashboard();
        }
    };

    const renderDashboard = () => (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Video className="h-8 w-8 text-white/90" />
                        <h1 className="text-3xl font-bold tracking-tight">Marketing & Contenidos</h1>
                    </div>
                    <p className="text-emerald-100 text-lg max-w-2xl">
                        Gestión integral de creación, publicación y análisis de impacto
                    </p>
                </div>
                {/* Decorative background elements */}
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                    <Video size={300} />
                </div>
            </div>

            {/* KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <KPICard
                    title="Contenido Mes"
                    value="12"
                    subtitle="Piezas producidas"
                    icon={Video}
                    color="#10b981" // Emerald
                    trend="up"
                    trendValue="+2"
                />
                <KPICard
                    title="Engagement"
                    value="4.8%"
                    subtitle="Promedio mensual"
                    icon={Activity}
                    color="#f59e0b" // Amber
                    trend="stable"
                    trendValue="+0.1%"
                />
                <KPICard
                    title="Alcance Total"
                    value="15.2k"
                    subtitle="Últimos 30 días"
                    icon={TrendingUp}
                    color="#3b82f6" // Blue
                    trend="up"
                    trendValue="+12%"
                />
                <KPICard
                    title="Inversión"
                    value="0 €"
                    subtitle="Ads & Colaboraciones"
                    icon={DollarSign}
                    color="#ef4444" // Red
                />
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <NavigationCard
                    title="CREACIÓN CONTENIDO"
                    icon={Video}
                    metric="Gestión"
                    subtext="Producción y biblioteca"
                    onClick={() => setCurrentView('contenido')}
                    color="#10b981"
                    status="active"
                />
                <NavigationCard
                    title="CALENDARIO"
                    icon={Calendar}
                    metric="Planificación"
                    subtext="Vista mensual"
                    onClick={() => setCurrentView('calendario')}
                    color="#8b5cf6"
                    status="active"
                />
                <NavigationCard
                    title="REPORTES"
                    icon={BarChart3}
                    metric="Métricas"
                    subtext="Análisis de impacto"
                    onClick={() => setCurrentView('reportes')}
                    color="#3b82f6"
                    status="active"
                />
                <NavigationCard
                    title="INTELIGENCIA ARTIFICIAL"
                    icon={Brain}
                    metric="Herramientas"
                    subtext="Generación y análisis"
                    onClick={() => setCurrentView('ai')}
                    color="#f59e0b"
                    status="active"
                />
                <NavigationCard
                    title="COLABORACIONES"
                    icon={Users}
                    metric="Partners"
                    subtext="Atletas y acuerdos"
                    onClick={() => setCurrentView('colaboraciones')}
                    color="#ec4899"
                    status="active"
                />
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50">
            {renderContent()}
        </div>
    );
};

