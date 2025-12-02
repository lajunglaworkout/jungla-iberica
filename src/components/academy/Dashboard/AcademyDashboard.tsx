import React, { useState, useEffect } from 'react';
import {
    BookOpen, CheckSquare, Users, Building2, Calendar,
    CreditCard, GraduationCap, Briefcase, BarChart3,
    DollarSign, Loader2, Brain
} from 'lucide-react';
import { KPICard } from './KPICard';
import { NavigationCard } from './NavigationCard';
import { ContenidosView } from '../Contenidos/ContenidosView';
import { TareasView } from '../Tareas/TareasView';
import { TutoresView } from '../Tutores/TutoresView';
import { supabase } from '../../../lib/supabase';

// Interfaces for dashboard data
interface DashboardMetrics {
    totalModules: number;
    totalLessons: number;
    pendingTasks: number;
    activeTutors: number;
    activeCenters: number;
    activeStudents: number;
    activeCompanies: number;
    upcomingCohorts: number;
}

export const AcademyDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<string>('dashboard');
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalModules: 0,
        totalLessons: 0,
        pendingTasks: 0,
        activeTutors: 0,
        activeCenters: 0,
        activeStudents: 0,
        activeCompanies: 0,
        upcomingCohorts: 0
    });

    useEffect(() => {
        loadDashboardMetrics();
    }, []);

    const loadDashboardMetrics = async () => {
        setLoading(true);
        try {
            // Execute all count queries in parallel
            const [
                { count: modulesCount },
                { count: lessonsCount },
                { count: tasksCount },
                { count: tutorsCount },
                { count: centersCount },
                { count: studentsCount },
                { count: companiesCount },
                { count: cohortsCount }
            ] = await Promise.all([
                supabase.from('academy_modules').select('*', { count: 'exact', head: true }),
                supabase.from('academy_lessons').select('*', { count: 'exact', head: true }),
                supabase.from('academy_tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('academy_tutors').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('academy_partner_centers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('academy_students_cache').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('academy_companies_cache').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('academy_cohortes').select('*', { count: 'exact', head: true }).gt('start_date', new Date().toISOString())
            ]);

            setMetrics({
                totalModules: modulesCount || 0,
                totalLessons: lessonsCount || 0,
                pendingTasks: tasksCount || 0,
                activeTutors: tutorsCount || 0,
                activeCenters: centersCount || 0,
                activeStudents: studentsCount || 0,
                activeCompanies: companiesCount || 0,
                upcomingCohorts: cohortsCount || 0
            });
        } catch (error) {
            console.error('Error loading academy metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'contenidos':
                return <ContenidosView onBack={() => setActiveView('dashboard')} />;
            case 'tareas':
                return <TareasView onBack={() => setActiveView('dashboard')} />;
            case 'tutores':
                return <TutoresView onBack={() => setActiveView('dashboard')} />;
            case 'dashboard':
            default:
                return renderDashboard();
        }
    };

    const renderDashboard = () => (
        <div className="space-y-16 animate-in fade-in duration-500">
            {/* Header Section */}
            <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%)',
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
                    <Brain style={{ height: '16px', width: '16px' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Sistema Operativo</span>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <GraduationCap className="h-8 w-8 text-white" />
                        <h1 className="text-3xl font-bold">La Jungla Academy</h1>
                    </div>
                    <p className="text-blue-100 text-lg max-w-2xl">
                        Centro de Control y Gestión de Formación
                    </p>
                </div>

                {/* Decorative background elements */}
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                    <GraduationCap size={300} />
                </div>
            </div>

            {/* KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <KPICard
                    title="Ingresos Mes Actual"
                    value="0 €"
                    subtitle="+0% vs mes anterior"
                    icon={DollarSign}
                    color="#84cc16"
                    trend="stable"
                    trendValue="+0%"
                />
                <KPICard
                    title="Alumnos Activos"
                    value={metrics.activeStudents}
                    subtitle="Total matriculados"
                    icon={Users}
                    color="#22c55e"
                    trend="up"
                    trendValue="+0"
                />
                <KPICard
                    title="Próximos Cursos"
                    value={metrics.upcomingCohorts}
                    subtitle="Inscripciones abiertas"
                    icon={Calendar}
                    color="#0ea5e9"
                />
                <KPICard
                    title="Satisfacción"
                    value="0/5"
                    subtitle="Basado en 0 reseñas"
                    icon={BarChart3}
                    color="#f59e0b"
                />
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <NavigationCard
                    title="CONTENIDOS"
                    icon={BookOpen}
                    metric={`${metrics.totalLessons} Lecciones`}
                    subtext={`${metrics.totalModules} Módulos activos`}
                    onClick={() => setActiveView('contenidos')}
                    color="#84cc16"
                    status="active"
                />
                <NavigationCard
                    title="TAREAS"
                    icon={CheckSquare}
                    metric={`${metrics.pendingTasks} Pendientes`}
                    subtext="Gestión operativa"
                    onClick={() => setActiveView('tareas')}
                    color="#22c55e"
                    status={metrics.pendingTasks > 0 ? 'warning' : 'active'}
                />
                <NavigationCard
                    title="TUTORES"
                    icon={Users}
                    metric={`${metrics.activeTutors} Activos`}
                    subtext="Gestión de equipo docente"
                    onClick={() => setActiveView('tutores')}
                    color="#10b981"
                    status="active"
                />
                <NavigationCard
                    title="CENTROS"
                    icon={Building2}
                    metric={`${metrics.activeCenters} Activos`}
                    subtext="Partners y sedes"
                    onClick={() => setActiveView('centros')}
                    color="#f59e0b"
                    status="active"
                />
                <NavigationCard
                    title="COHORTES"
                    icon={Calendar}
                    metric={`${metrics.upcomingCohorts} Próximas`}
                    subtext="Gestión de ediciones"
                    onClick={() => setActiveView('cohortes')}
                    color="#3b82f6"
                    status="active"
                />
                <NavigationCard
                    title="FINANCIERO"
                    icon={DollarSign}
                    metric="Ver Resumen"
                    subtext="Ingresos y Gastos"
                    onClick={() => setActiveView('financiero')}
                    color="#0ea5e9"
                    status="active"
                />
                <NavigationCard
                    title="ALUMNOS"
                    icon={GraduationCap}
                    metric={`${metrics.activeStudents} Activos`}
                    subtext="Expedientes y notas"
                    onClick={() => setActiveView('alumnos')}
                    color="#8b5cf6"
                    status="active"
                />
                <NavigationCard
                    title="EMPRESAS"
                    icon={Briefcase}
                    metric={`${metrics.activeCompanies} Interesadas`}
                    subtext="Convenios y prácticas"
                    onClick={() => setActiveView('empresas')}
                    color="#d946ef"
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Cargando Academy...</p>
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
