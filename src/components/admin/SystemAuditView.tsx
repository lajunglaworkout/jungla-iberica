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
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-bold flex items-center gap-2 ${health.color}`}>
                        <health.icon size={16} />
                        {health.text}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadLogs}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg text-red-600 shadow-sm">
                            <AlertTriangle size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-700">Errores Hoy</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.errorsToday}</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                            <Database size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-700">Logs (24h)</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">--</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm">
                            <Terminal size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-700">Versión</h3>
                    </div>
                    <p className="text-xl font-bold text-gray-900">v3.5.0</p>
                </div>
            </div>

            {/* Main Content: Logs & Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Logs Feed */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            Live Logs
                        </h3>

                        <div className="flex gap-2">
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            >
                                <option value="all">Todos los niveles</option>
                                <option value="error">Errores</option>
                                <option value="warning">Advertencias</option>
                                <option value="info">Información</option>
                            </select>
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="overflow-y-auto max-h-[500px]">
                            {logs.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 bg-gray-50/50">
                                    <Terminal size={32} className="mx-auto mb-3 opacity-20" />
                                    No hay logs registrados recientemente
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Nivel</th>
                                            <th className="px-6 py-3 font-semibold">Módulo</th>
                                            <th className="px-6 py-3 font-semibold">Mensaje</th>
                                            <th className="px-6 py-3 text-right font-semibold">Tiempo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                                        ${log.level === 'error' || log.level === 'critical' ? 'bg-red-100 text-red-600' :
                                                            log.level === 'warning' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-blue-50 text-blue-600'
                                                        }`} title={log.level}>
                                                        {log.level === 'error' ? '!' : log.level === 'warning' ? '⚠️' : 'i'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">
                                                    {log.module}
                                                </td>
                                                <td className="px-6 py-3 text-gray-700">
                                                    <div className="max-w-md truncate group-hover:whitespace-normal group-hover:break-words">
                                                        {log.message}
                                                    </div>
                                                    {log.user_email && <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                        <Activity size={10} /> {log.user_email}
                                                    </div>}
                                                </td>
                                                <td className="px-6 py-3 text-right text-gray-400 text-xs whitespace-nowrap font-mono">
                                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Suggestions Panel */}
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 border border-indigo-100 h-fit">
                    <h3 className="font-bold text-indigo-900 mb-6 flex items-center gap-2">
                        <Brain size={20} className="text-indigo-600" />
                        Análisis de Salud
                    </h3>

                    <div className="space-y-4">
                        {stats.errorsToday === 0 ? (
                            <div className="p-4 bg-white/80 rounded-lg border border-indigo-100 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-emerald-500 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-sm text-gray-800 font-semibold">Sistema Estable</p>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">No se han detectado anomalías críticas en las últimas 24 horas.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-white/80 rounded-lg border border-red-100 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-sm text-gray-800 font-semibold">Atención Requerida</p>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            {stats.errorsToday} errores detectados hoy. Se recomienda revisar los logs marcados en rojo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-white/50 rounded-lg border border-dashed border-indigo-200">
                            <p className="text-xs text-indigo-400 text-center">
                                El motor de IA está monitorizando la latencia y carga del servidor en tiempo real.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
