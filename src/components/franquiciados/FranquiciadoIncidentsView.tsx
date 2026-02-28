import React from 'react';
import {
    AlertTriangle, ArrowLeft, CheckCircle, Clock, Filter, FileText,
    Plus, Search, Wrench
} from 'lucide-react';
import type { Incident } from './FranquiciadoTypes';

interface Props {
    detailedIncidents: Incident[];
    onBack: () => void;
    onNewIncident: () => void;
    getPriorityBadge: (priority: string) => React.ReactNode;
}

const FranquiciadoIncidentsView: React.FC<Props> = ({
    detailedIncidents, onBack, onNewIncident, getPriorityBadge
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
                <span className="text-sm font-semibold text-orange-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    Gestión de Incidencias
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <Filter size={14} />
                    Filtrar
                </button>
                <button
                    onClick={onNewIncident}
                    className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                    <Plus size={16} />
                    Nueva Incidencia
                </button>
            </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <AlertTriangle size={16} className="text-gray-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{detailedIncidents.length}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <Clock size={16} className="text-red-500" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Abiertas</span>
                </div>
                <div className="text-2xl font-bold text-red-500">{detailedIncidents.filter(i => i.status === 'abierta').length}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                        <Wrench size={16} className="text-orange-500" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">En Proceso</span>
                </div>
                <div className="text-2xl font-bold text-orange-500">{detailedIncidents.filter(i => i.status === 'en_proceso').length}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <CheckCircle size={16} className="text-emerald-500" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resueltas</span>
                </div>
                <div className="text-2xl font-bold text-emerald-500">{detailedIncidents.filter(i => i.status === 'resuelta' || i.status === 'cerrada').length}</div>
            </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText size={16} className="text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Listado de Incidencias</h3>
                        <p className="text-sm text-gray-500">Registro histórico completo</p>
                    </div>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Incidencia</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Prioridad</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Responsable</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {detailedIncidents.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center text-gray-400">
                                        <CheckCircle size={32} className="mb-3 opacity-40" />
                                        <p className="text-sm font-medium text-gray-600">¡Todo en orden!</p>
                                        <p className="text-xs text-gray-400 mt-1">No hay incidencias activas</p>
                                        <button
                                            onClick={onNewIncident}
                                            className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                                        >
                                            Reportar un problema
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            detailedIncidents.map((incident) => (
                                <tr key={incident.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            {new Date(incident.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-1">
                                            {new Date(incident.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="text-sm font-medium text-gray-900 truncate">{incident.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{incident.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${incident.incident_type === 'maintenance' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                            incident.incident_type === 'logistics' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                                                incident.incident_type === 'security' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' :
                                                    'bg-purple-50 text-purple-700 ring-purple-600/20'
                                            }`}>
                                            {incident.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getPriorityBadge(incident.priority)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${incident.status === 'abierta' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                            incident.status === 'en_proceso' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                                                'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${incident.status === 'abierta' ? 'bg-red-500' :
                                                incident.status === 'en_proceso' ? 'bg-orange-500' : 'bg-emerald-500'
                                                }`} />
                                            {incident.status === 'abierta' ? 'Abierta' :
                                                incident.status === 'en_proceso' ? 'En Proceso' :
                                                    incident.status === 'resuelta' ? 'Resuelta' : 'Cerrada'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-medium text-gray-700">{incident.responsible}</span>
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

export default FranquiciadoIncidentsView;
