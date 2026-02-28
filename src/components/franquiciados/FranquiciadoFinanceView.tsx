import React from 'react';
import {
    DollarSign, Calendar, ArrowLeft, BarChart2, Activity, FileText
} from 'lucide-react';
import type { FinancialMetrics, MonthlyFinancial } from './FranquiciadoTypes';

// ─── SimpleBarChart ───────────────────────────────────────────────────────────

const SimpleBarChart: React.FC<{
    data: { label: string; v1: number; v2: number; v3?: number }[];
    colors: [string, string, string?];
    height?: number;
}> = ({ data, colors, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.v1, d.v2, d.v3 || 0)));

    return (
        <div style={{ height: `${height}px`, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: '20px' }}>
            {data.map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100%' }}>
                        <div style={{
                            width: '12px',
                            height: `${(d.v1 / maxValue) * 100}%`,
                            backgroundColor: colors[0],
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.5s ease'
                        }} title={`Ingresos: ${d.v1}`} />
                        <div style={{
                            width: '12px',
                            height: `${(d.v2 / maxValue) * 100}%`,
                            backgroundColor: colors[1],
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.5s ease'
                        }} title={`Gastos: ${d.v2}`} />
                        {d.v3 !== undefined && colors[2] && (
                            <div style={{
                                width: '12px',
                                height: `${Math.abs(d.v3) / maxValue * 100}%`,
                                backgroundColor: d.v3 >= 0 ? colors[2] : '#ef4444',
                                borderRadius: '4px 4px 0 0',
                                opacity: 0.5,
                                transition: 'height 0.5s ease'
                            }} title={`Balance: ${d.v3}`} />
                        )}
                    </div>
                    <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '8px' }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

// ─── FranquiciadoFinanceView ──────────────────────────────────────────────────

interface Props {
    financial: FinancialMetrics;
    historicalFinance: MonthlyFinancial[];
    selectedMonth: number;
    selectedYear: number;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
    onBack: () => void;
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const FranquiciadoFinanceView: React.FC<Props> = ({
    financial, historicalFinance, selectedMonth, selectedYear,
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
                <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                    <DollarSign size={14} />
                    Finanzas Detalladas
                </span>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-gray-400" />
                <select
                    value={selectedMonth}
                    onChange={(e) => onMonthChange(parseInt(e.target.value))}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                    {MONTHS.map((name, i) => (
                        <option key={i} value={i + 1}>{name}</option>
                    ))}
                </select>
                <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(parseInt(e.target.value))}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                    {[2024, 2025].map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <DollarSign size={16} className="text-emerald-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingresos</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                    {financial.ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <Activity size={16} className="text-red-500" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gastos</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                    {financial.gastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${financial.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                        <BarChart2 size={16} className={financial.balance >= 0 ? 'text-blue-600' : 'text-orange-500'} />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Balance Neto</span>
                </div>
                <div className={`text-2xl font-bold ${financial.balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {financial.balance >= 0 ? '+' : ''}{financial.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </div>
            </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white border border-gray-200 rounded-xl mb-8">
            <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Evolución Anual</h3>
                        <p className="text-sm text-gray-500">Análisis de rendimiento últimos 12 meses</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            Ingresos
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            Gastos
                        </span>
                    </div>
                </div>
            </div>
            <div className="p-6">
                {historicalFinance.length > 0 ? (
                    <SimpleBarChart
                        height={280}
                        colors={['#10b981', '#ef4444', '#3b82f6']}
                        data={historicalFinance.map(f => ({
                            label: `${f.mes}/${f.año}`,
                            v1: f.ingresos,
                            v2: f.gastos,
                            v3: f.balance
                        }))}
                    />
                ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-gray-400">
                        <BarChart2 size={32} className="mb-3 opacity-40" />
                        <p className="text-sm font-medium">No hay datos suficientes para generar la gráfica</p>
                    </div>
                )}
            </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText size={16} className="text-gray-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Desglose Mensual</h3>
                </div>
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5">
                    <FileText size={14} />
                    Descargar Informe
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Periodo</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingresos</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Gastos</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Balance</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {historicalFinance.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center text-gray-400">
                                        <Calendar size={24} className="mb-2 opacity-50" />
                                        <p className="text-sm font-medium">No hay registros históricos disponibles</p>
                                        <p className="text-xs text-gray-400 mt-1">Los datos aparecerán aquí mes a mes</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            historicalFinance.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            {new Date(row.año, row.mes - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-medium text-emerald-600">
                                            {row.ingresos.toLocaleString('es-ES')} €
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-medium text-red-500">
                                            {row.gastos.toLocaleString('es-ES')} €
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`text-sm font-semibold ${row.balance >= 0 ? 'text-gray-900' : 'text-orange-500'}`}>
                                            {row.balance >= 0 ? '+' : ''}{row.balance.toLocaleString('es-ES')} €
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.balance >= 0
                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                            }`}>
                                            {row.balance >= 0 ? 'Positivo' : 'Negativo'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default FranquiciadoFinanceView;
