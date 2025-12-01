import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import maintenanceService from '../../services/maintenanceService';

const MaintenanceAnalytics: React.FC = () => {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        const response = await maintenanceService.getGlobalMaintenanceStats();
        if (response.success && response.data) {
            setStats(response.data);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando analíticas...</div>;
    }

    // Calcular tendencia
    const lastMonth = stats[stats.length - 1]?.averageScore || 0;
    const prevMonth = stats[stats.length - 2]?.averageScore || 0;
    const trend = lastMonth - prevMonth;

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Header Section */}
            <div className="w-full bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Panel de Analítica</h2>
                    <p className="text-gray-400">Visión detallada del rendimiento de mantenimiento</p>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                {/* Score Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {trend >= 0 ? '+' : ''}{trend}%
                        </span>
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Puntuación Global</h3>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-bold text-gray-900">{lastMonth}</span>
                            <span className="text-gray-400 text-sm">/ 100</span>
                        </div>
                    </div>
                </div>

                {/* Inspections Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Inspecciones (6 meses)</h3>
                        <div className="text-4xl font-bold text-gray-900">
                            {stats.reduce((acc, curr) => acc + (curr.count || 0), 0)}
                        </div>
                    </div>
                </div>

                {/* Critical Issues Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Tendencia Crítica</h3>
                        <div className="text-4xl font-bold text-gray-900">
                            {/* Placeholder logic for critical trend */}
                            -12%
                        </div>
                        <p className="text-xs text-green-600 mt-1">Mejora respecto al mes anterior</p>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Evolución de Calidad</h3>
                        <p className="text-sm text-gray-500 mt-1">Puntuación media mensual de inspecciones</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-600">Excelente (&gt;80)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            <span className="text-gray-600">Regular (60-80)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-gray-600">Crítico (&lt;60)</span>
                        </div>
                    </div>
                </div>

                <div className="h-80 relative pl-8">
                    {/* Grid lines background */}
                    <div className="absolute inset-0 left-8 flex flex-col justify-between pointer-events-none">
                        {[100, 75, 50, 25, 0].map((val) => (
                            <div key={val} className="w-full border-t border-gray-100 flex items-center relative">
                                <span className="absolute -left-8 text-xs text-gray-400 w-6 text-right -mt-2">{val}</span>
                            </div>
                        ))}
                    </div>

                    <div className="h-full flex items-end justify-between space-x-6 px-4 relative z-10 pt-4">
                        {stats.length > 0 ? stats.map((stat) => (
                            <div key={stat.month} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                                <div className="relative w-full flex justify-center items-end h-[90%]">
                                    <div
                                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 relative ${stat.averageScore >= 80 ? 'bg-gradient-to-t from-green-500 to-green-400 shadow-green-200' :
                                            stat.averageScore >= 60 ? 'bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-yellow-200' :
                                                'bg-gradient-to-t from-red-500 to-red-400 shadow-red-200'
                                            } shadow-lg hover:shadow-xl group-hover:scale-105`}
                                        style={{ height: `${Math.max(stat.averageScore, 5)}%` }}
                                    >
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg pointer-events-none transition-all duration-200 shadow-xl whitespace-nowrap z-20">
                                            <div className="font-bold">{stat.averageScore} puntos</div>
                                            <div className="text-gray-400 text-[10px]">{stat.count} inspecciones</div>
                                            {/* Arrow */}
                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {new Date(stat.month + '-01').toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                                </div>
                            </div>
                        )) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No hay datos suficientes para mostrar la gráfica
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

import { CheckCircle } from 'lucide-react';
export default MaintenanceAnalytics;
