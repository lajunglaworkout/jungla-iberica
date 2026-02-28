import React from 'react';
import {
    Users, Calendar, ArrowLeft, TrendingUp, TrendingDown, Activity, UserPlus
} from 'lucide-react';
import type { ClientMetrics, MonthlyClients } from './FranquiciadoTypes';

// ─── SimpleLineChart ──────────────────────────────────────────────────────────

const SimpleLineChart: React.FC<{
    data: { label: string; value: number }[];
    color: string;
    height?: number;
    area?: boolean;
}> = ({ data, color, height = 200, area = false }) => {
    if (data.length < 2) return null;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const minValue = Math.min(...data.map(d => d.value)) * 0.9;
    const range = maxValue - minValue;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value - minValue) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                ))}
                {area && (
                    <path
                        d={`M0,100 L0,${100 - ((data[0].value - minValue) / range) * 100} ${points.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`}
                        fill={color}
                        fillOpacity="0.1"
                    />
                )}
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((d.value - minValue) / range) * 100;
                    return (
                        <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke={color} strokeWidth="1" />
                    );
                })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {data.map((d, i) => (
                    (i % 2 === 0 || i === data.length - 1) && (
                        <span key={i} style={{ fontSize: '10px', color: '#9ca3af', position: 'absolute', left: `${(i / (data.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}>
                            {d.label}
                        </span>
                    )
                ))}
            </div>
        </div>
    );
};

// ─── FranquiciadoClientView ───────────────────────────────────────────────────

interface Props {
    clients: ClientMetrics;
    historicalClients: MonthlyClients[];
    selectedMonth: number;
    selectedYear: number;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
    onBack: () => void;
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const FranquiciadoClientView: React.FC<Props> = ({
    clients, historicalClients, selectedMonth, selectedYear,
    onMonthChange, onYearChange, onBack
}) => (
    <div className="animate-in fade-in duration-300">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Volver
                </button>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-semibold text-purple-600 flex items-center gap-1.5">
                    <Users size={14} />
                    Clientes Detallados
                </span>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-gray-400" />
                <select
                    value={selectedMonth}
                    onChange={(e) => onMonthChange(parseInt(e.target.value))}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                    {MONTHS.map((name, i) => (
                        <option key={i} value={i + 1}>{name}</option>
                    ))}
                </select>
                <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(parseInt(e.target.value))}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                    {[2024, 2025].map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Client Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Users size={16} className="text-purple-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activos</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{clients.activos}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <TrendingUp size={16} className="text-emerald-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Altas</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600">+{clients.altasMes}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <TrendingDown size={16} className="text-red-500" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bajas</span>
                </div>
                <div className="text-2xl font-bold text-red-500">-{clients.bajasMes}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Activity size={16} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Retención</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{clients.retencion}%</div>
            </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white border border-gray-200 rounded-xl mb-8">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Crecimiento de Clientes</h3>
                <p className="text-sm text-gray-500">Evolución del número de socios activos</p>
            </div>
            <div className="p-6">
                {historicalClients.length > 0 ? (
                    <SimpleLineChart
                        height={280}
                        color="#8b5cf6"
                        area={true}
                        data={historicalClients.map(c => ({
                            label: `${c.mes}/${c.año}`,
                            value: c.activos
                        }))}
                    />
                ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-gray-400">
                        <TrendingUp size={32} className="mb-3 opacity-40" />
                        <p className="text-sm font-medium">No hay histórico de clientes suficiente</p>
                    </div>
                )}
            </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Users size={16} className="text-gray-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Detalle Mensual</h3>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mes</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Activos</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-emerald-600 uppercase tracking-wide">Altas</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-red-500 uppercase tracking-wide">Bajas</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Crecimiento</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {historicalClients.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center text-gray-400">
                                        <UserPlus size={24} className="mb-2 opacity-50" />
                                        <p className="text-sm font-medium">No hay datos de clientes registrados</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            historicalClients.map((row, idx) => {
                                const netGrowth = row.altas - row.bajas;
                                return (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(row.año, row.mes - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-semibold text-gray-900">{row.activos}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                +{row.altas}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
                                                -{row.bajas}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-semibold ${netGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {netGrowth > 0 ? '+' : ''}{netGrowth}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default FranquiciadoClientView;
