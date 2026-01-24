import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    AlertTriangle,
    CheckCircle,
    Activity,
    Clock,
    Database,
    Shield,
    Terminal,
    RefreshCw,
    Search,
    Filter,
    Brain
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface LogEntry {
    id: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    module: string;
    message: string;
    meta: any;
    created_at: string;
    user_email: string | null;
}

export const SystemAuditView: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [stats, setStats] = useState({
        errorsToday: 0,
        criticalsToday: 0,
        activeUsers: 0
    });

    const loadLogs = async () => {
        setLoading(true);
        try {
            // Load logs
            let query = supabase
                .from('system_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (filterLevel !== 'all') {
                query = query.eq('level', filterLevel);
            }

            const { data, error } = await query;

            if (error) throw error;
            setLogs(data || []);

            // Calculate simple stats for "today"
            const today = new Date().toISOString().split('T')[0];
            const { count: errorCount } = await supabase
                .from('system_logs')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today)
                .in('level', ['error', 'critical']);

            setStats(prev => ({ ...prev, errorsToday: errorCount || 0 }));

        } catch (err) {
            console.error('Error loading audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();

        // Auto refresh every 30s
        const interval = setInterval(loadLogs, 30000);
        return () => clearInterval(interval);
    }, [filterLevel]);

    const getHealthStatus = () => {
        if (stats.criticalsToday > 0) return { color: 'bg-red-500', text: 'Crítico', icon: AlertTriangle };
        if (stats.errorsToday > 5) return { color: 'bg-amber-500', text: 'Atención', icon: Activity };
        return { color: 'bg-emerald-500', text: 'Saludable', icon: CheckCircle };
    };

    const health = getHealthStatus();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-8 w-8 text-emerald-600" />
                        System Guardian
                    </h1>
                    <p className="text-gray-500">Auditoría y salud del sistema en tiempo real</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-full text-white font-bold flex items-center gap-2 ${health.color}`}>
                        <health.icon size={20} />
                        {health.text}
                    </div>
                    <button
                        onClick={loadLogs}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <AlertTriangle size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-700">Errores Hoy</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.errorsToday}</p>
                    <p className="text-xs text-gray-500 mt-1">Requieren revisión</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Database size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-700">Logs (24h)</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">--</p>
                    <p className="text-xs text-gray-500 mt-1">Eventos registrados</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Terminal size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-700">Último Despliegue</h3>
                    </div>
                    <p className="text-lg font-bold text-gray-900">v3.5.0</p>
                    <p className="text-xs text-gray-500 mt-1">Hace 2 días</p>
                </div>
            </div>

            {/* Main Content: Logs & Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Logs Feed */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Terminal size={18} className="text-gray-400" />
                            Live Logs
                        </h3>

                        <div className="flex gap-2">
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="all">Todos</option>
                                <option value="error">Errores</option>
                                <option value="warning">Warnings</option>
                                <option value="info">Info</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-[600px]">
                        {logs.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No hay logs registrados recientemente
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Nivel</th>
                                        <th className="px-6 py-3">Módulo</th>
                                        <th className="px-6 py-3">Mensaje</th>
                                        <th className="px-6 py-3 text-right">Hace</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase
                          ${log.level === 'error' || log.level === 'critical' ? 'bg-red-100 text-red-700' :
                                                        log.level === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-50 text-blue-600'}`}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-700">
                                                {log.module}
                                            </td>
                                            <td className="px-6 py-3 text-gray-600 max-w-md truncate group-hover:whitespace-normal group-hover:break-words">
                                                {log.message}
                                                {log.user_email && <div className="text-xs text-gray-400 mt-1">Usuario: {log.user_email}</div>}
                                            </td>
                                            <td className="px-6 py-3 text-right text-gray-400 text-xs whitespace-nowrap">
                                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Suggestions Panel */}
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-sm border border-emerald-100 p-6">
                    <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <Brain size={20} className="text-emerald-600" />
                        Sugerencias IA
                    </h3>

                    <div className="space-y-4">
                        {stats.errorsToday === 0 ? (
                            <div className="p-4 bg-white/60 rounded-lg border border-emerald-200">
                                <p className="text-sm text-emerald-800 font-medium">✨ Sistema optimizado</p>
                                <p className="text-xs text-emerald-600 mt-1">No detecto patrones de error significativos hoy. ¡Buen trabajo!</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-white/60 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-800 font-medium">🔍 Investigar Errores Recientes</p>
                                <p className="text-xs text-amber-600 mt-1">
                                    Se han detectado {stats.errorsToday} fallos hoy. Revisa la tabla de logs para identificar si es un problema recurrente en un módulo específico.
                                </p>
                            </div>
                        )}

                        {/* Placeholder for future smart suggestions */}
                        <div className="p-4 bg-white/40 rounded-lg border border-dashed border-gray-300">
                            <p className="text-xs text-gray-500 italic">
                                El agente está aprendiendo patrones de uso. Vuelve en 24h para ver recomendaciones de rendimiento.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-emerald-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Acciones Rápidas</h4>
                        <button className="w-full py-2 bg-white border border-gray-200 hover:border-emerald-300 text-gray-600 rounded-lg text-sm font-medium transition-colors mb-2">
                            Limpiar logs antiguos
                        </button>
                        <button className="w-full py-2 bg-white border border-gray-200 hover:border-emerald-300 text-gray-600 rounded-lg text-sm font-medium transition-colors">
                            Ver reporte semanal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
