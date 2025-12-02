import React, { useState } from 'react';
import {
    BookOpen,
    CheckSquare,
    Users,
    Building2,
    Calendar,
    DollarSign,
    GraduationCap,
    Briefcase,
    BarChart3,
    TrendingUp,
    Award,
    Clock
} from 'lucide-react';
import { KPICard } from './KPICard';
import { NavigationCard } from './NavigationCard';
import { AcademyKPIs } from '../../../types/academy';

// Placeholder data - In future this will come from Supabase
const MOCK_KPIS: AcademyKPIs = {
    ingresos_mes_actual: 12450,
    alumnos_activos: 47,
    proximos_cursos: 3,
    satisfaccion_promedio: 4.2
};

export const AcademyDashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState<string>('dashboard');

    // Navigation handlers
    const handleNavigate = (view: string) => {
        console.log(`Navigating to ${view}`);
        setCurrentView(view);
        // In a real implementation, this would update the URL or parent state
        // For now, we just log it as we haven't implemented the sub-views yet
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
    };

    if (currentView !== 'dashboard') {
        return (
            <div className="p-8">
                <button
                    onClick={() => setCurrentView('dashboard')}
                    className="mb-4 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
                >
                    ← Volver al Dashboard
                </button>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Vista: {currentView}</h2>
                    <p className="text-gray-500">Esta vista está en desarrollo.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-[#CDDC39]" />
                        La Jungla Academy
                    </h1>
                    <p className="text-gray-500 mt-1">Centro de Control y Gestión de Formación</p>
                </div>
                <div className="flex gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Sistema Operativo
                    </span>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Ingresos Mes Actual"
                    value={formatCurrency(MOCK_KPIS.ingresos_mes_actual)}
                    icon={DollarSign}
                    trend="+12% vs mes anterior"
                    trendUp={true}
                    color="#CDDC39"
                />
                <KPICard
                    title="Alumnos Activos"
                    value={MOCK_KPIS.alumnos_activos}
                    icon={Users}
                    trend="+5 nuevos esta semana"
                    trendUp={true}
                    color="#2E7D32"
                />
                <KPICard
                    title="Próximos Cursos"
                    value={MOCK_KPIS.proximos_cursos}
                    icon={Calendar}
                    trend="Inscripciones abiertas"
                    trendUp={true}
                    color="#000000"
                />
                <KPICard
                    title="Satisfacción"
                    value={`${MOCK_KPIS.satisfaccion_promedio}/5`}
                    icon={Award}
                    trend="Basado en 12 reseñas"
                    trendUp={true}
                    color="#F59E0B"
                />
            </div>

            {/* Main Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Row 1 */}
                <NavigationCard
                    title="CONTENIDOS"
                    icon={BookOpen}
                    metric="15 Lecciones"
                    subtext="2 Módulos activos"
                    onClick={() => handleNavigate('contenidos')}
                    color="#CDDC39"
                    status="active"
                />
                <NavigationCard
                    title="TAREAS"
                    icon={CheckSquare}
                    metric="8 Pendientes"
                    subtext="3 Urgentes"
                    onClick={() => handleNavigate('tareas')}
                    color="#2E7D32"
                    status="warning"
                />
                <NavigationCard
                    title="TUTORES"
                    icon={Users}
                    metric="6 Activos"
                    subtext="2 Centros"
                    onClick={() => handleNavigate('tutores')}
                    color="#000000"
                    status="active"
                />

                {/* Row 2 */}
                <NavigationCard
                    title="CENTROS"
                    icon={Building2}
                    metric="4 Activos"
                    subtext="1 Pendiente firma"
                    onClick={() => handleNavigate('centros')}
                    color="#F59E0B"
                    status="active"
                />
                <NavigationCard
                    title="COHORTES"
                    icon={Calendar}
                    metric="3 Próximas"
                    subtext="1 En curso"
                    onClick={() => handleNavigate('cohortes')}
                    color="#3B82F6"
                    status="active"
                />
                <NavigationCard
                    title="FINANCIERO"
                    icon={DollarSign}
                    metric="Ver Resumen"
                    subtext="Ingresos y Gastos"
                    onClick={() => handleNavigate('financiero')}
                    color="#10B981"
                    status="active"
                />

                {/* Row 3 */}
                <NavigationCard
                    title="ALUMNOS"
                    icon={GraduationCap}
                    metric="47 Activos"
                    subtext="12 Certificados"
                    onClick={() => handleNavigate('alumnos')}
                    color="#8B5CF6"
                    status="active"
                />
                <NavigationCard
                    title="EMPRESAS"
                    icon={Briefcase}
                    metric="8 Interesadas"
                    subtext="5 Pagadas"
                    onClick={() => handleNavigate('empresas')}
                    color="#EC4899"
                    status="active"
                />
                <NavigationCard
                    title="REPORTES"
                    icon={BarChart3}
                    metric="Generar"
                    subtext="PDF / Excel"
                    onClick={() => handleNavigate('reportes')}
                    color="#6366F1"
                    status="neutral"
                />
            </div>
        </div>
    );
};
