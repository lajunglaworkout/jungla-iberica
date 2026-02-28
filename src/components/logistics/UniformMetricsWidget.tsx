import React, { useState, useEffect } from 'react';
import { Package, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { getUniformRequests } from '../../services/hrService';

interface UniformMetrics {
    pendingCount: number;
    approvedCount: number;
    shippedCount: number;
    disputedCount: number;
    totalRequests: number;
    recentRequests: Record<string, unknown>[];
}

const UniformMetricsWidget: React.FC = () => {
    const [metrics, setMetrics] = useState<UniformMetrics>({
        pendingCount: 0,
        approvedCount: 0,
        shippedCount: 0,
        disputedCount: 0,
        totalRequests: 0,
        recentRequests: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const requests = await getUniformRequests();

            const pending = requests.filter(r => r['status'] === 'pending').length;
            const approved = requests.filter(r => r['status'] === 'approved').length;
            const shipped = requests.filter(r => r['status'] === 'shipped' || r['status'] === 'awaiting_confirmation').length;
            const disputed = requests.filter(r => r['status'] === 'disputed').length;

            setMetrics({
                pendingCount: pending,
                approvedCount: approved,
                shippedCount: shipped,
                disputedCount: disputed,
                totalRequests: requests.length,
                recentRequests: requests.slice(0, 5)
            });
        } catch (err) {
            console.error('Error loading uniform metrics', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-xl"></div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Package className="text-emerald-600" size={20} />
                    Resumen de Vestuario
                </h3>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    Total: {metrics.totalRequests}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-yellow-700">{metrics.pendingCount}</span>
                    <span className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                        <Clock size={12} /> Pendientes
                    </span>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-red-700">{metrics.disputedCount}</span>
                    <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertTriangle size={12} /> Incidencias
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Enviados (En tránsito)</span>
                    <span className="font-bold text-gray-800">{metrics.shippedCount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{ width: `${(metrics.shippedCount / (metrics.totalRequests || 1)) * 100}%` }}
                    ></div>
                </div>

                <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-500">Tasa de Aprobación</span>
                    <span className="font-bold text-gray-800">
                        {Math.round(((metrics.approvedCount + metrics.shippedCount) / (metrics.totalRequests || 1)) * 100)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default UniformMetricsWidget;
