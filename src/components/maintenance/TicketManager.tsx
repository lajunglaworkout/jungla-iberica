import React, { useState, useEffect } from 'react';
import {
    AlertCircle, CheckCircle, Clock, Filter, MoreHorizontal, X,
    User, MapPin, Calendar, Image, MessageSquare, ArrowRight, Wrench, ChevronDown
} from 'lucide-react';
import maintenanceService from '../../services/maintenanceService';

interface Ticket {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved';
    priority: 'high' | 'medium' | 'low';
    created_at: string;
    center_id?: string;
    centers?: { name: string };
    source: 'maintenance' | 'checklist' | 'inspection';
    // Checklist incident specific fields
    reporter_name?: string;
    reporter_id?: string;
    incident_type?: string;
    department?: string;
    responsible?: string;
    has_images?: boolean;
    inventory_item?: string;
    inventory_quantity?: number;
    resolution_notes?: string;
    resolved_by?: string;
    resolved_at?: string;
    // Inspection item specific fields
    zone_name?: string;
    concept_name?: string;
    observations?: string;
    task_to_perform?: string;
}

const TicketManager: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        const response = await maintenanceService.getTickets();
        if (response.success && response.data) {
            console.log('📋 Tickets cargados:', response.data);
            setTickets(response.data);
        }
        setLoading(false);
    };

    const handleStatusChange = async (ticketId: string, newStatus: string, source: string) => {
        // For checklist incidents, use the incident service
        if (source === 'checklist') {
            // Update in checklist_incidents table
            const { supabase } = await import('../../lib/supabase');
            await supabase
                .from('checklist_incidents')
                .update({
                    status: newStatus === 'open' ? 'abierta' :
                        newStatus === 'in_progress' ? 'en_progreso' : 'resuelta',
                    updated_at: new Date().toISOString()
                })
                .eq('id', ticketId);
        } else if (source === 'inspection') {
            // Update in maintenance_inspection_items table
            const { supabase } = await import('../../lib/supabase');
            await supabase
                .from('maintenance_inspection_items')
                .update({
                    task_status: newStatus === 'open' ? 'pendiente' :
                        newStatus === 'in_progress' ? 'en_progreso' : 'completada',
                    completed_date: newStatus === 'resolved' ? new Date().toISOString() : null
                })
                .eq('id', ticketId);
        } else {
            // Original maintenance_tickets
            await maintenanceService.updateTicketStatus(ticketId, newStatus);
        }
        loadTickets();
        setSelectedTicket(null);
    };

    const getSourceBadge = (source: string) => {
        switch (source) {
            case 'checklist':
                return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">CHECKLIST</span>;
            case 'inspection':
                return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">INSPECCIÓN</span>;
            default:
                return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">TICKET</span>;
        }
    };

    const columns = [
        { id: 'open', title: 'Abierto', color: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertCircle },
        { id: 'in_progress', title: 'En Progreso', color: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Clock },
        { id: 'resolved', title: 'Resuelto', color: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle }
    ];

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Cargando incidencias...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Tablero de Incidencias</h3>
                    <p className="text-sm text-gray-500">
                        {tickets.length} incidencias totales • {tickets.filter(t => t.status === 'open').length} pendientes
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('checklist')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'checklist' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                    >
                        Checklist
                    </button>
                    <button
                        onClick={() => setFilter('inspection')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'inspection' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                    >
                        Inspecciones
                    </button>
                </div>
            )}

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] overflow-hidden">
                {columns.map((col) => {
                    const colTickets = tickets.filter(t => {
                        const statusMatch = t.status === col.id;
                        const sourceMatch = filter === 'all' || t.source === filter;
                        return statusMatch && sourceMatch;
                    });

                    return (
                        <div key={col.id} className={`flex flex-col h-full rounded-xl border ${col.border} bg-gray-50/50`}>
                            {/* Column Header */}
                            <div className={`p-4 border-b ${col.border} ${col.color} rounded-t-xl flex items-center justify-between`}>
                                <div className="flex items-center font-bold text-gray-900">
                                    <col.icon className={`w-5 h-5 mr-2 ${col.text}`} />
                                    {col.title}
                                </div>
                                <span className="bg-white px-2 py-1 rounded-md text-xs font-bold text-gray-600 shadow-sm">
                                    {colTickets.length}
                                </span>
                            </div>

                            {/* Column Content */}
                            <div className="p-4 overflow-y-auto space-y-4 flex-1">
                                {colTickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 group cursor-pointer relative"
                                    >
                                        {/* Priority Stripe */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${ticket.priority === 'high' ? 'bg-red-500' :
                                                ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`}></div>

                                        <div className="pl-3">
                                            {/* Header: Source + Priority */}
                                            <div className="flex justify-between items-start mb-2">
                                                {getSourceBadge(ticket.source)}
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baja'}
                                                </span>
                                            </div>

                                            {/* Title & Description */}
                                            <h4 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm">{ticket.title}</h4>
                                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{ticket.description}</p>

                                            {/* Reporter (if from checklist) */}
                                            {ticket.reporter_name && (
                                                <div className="flex items-center text-xs text-gray-500 mb-2">
                                                    <User className="w-3 h-3 mr-1" />
                                                    <span className="truncate">{ticket.reporter_name}</span>
                                                </div>
                                            )}

                                            {/* Indicator icons */}
                                            <div className="flex items-center gap-2 mb-3">
                                                {ticket.has_images && (
                                                    <span className="text-purple-500" title="Tiene imágenes">
                                                        <Image className="w-3.5 h-3.5" />
                                                    </span>
                                                )}
                                                {ticket.inventory_item && (
                                                    <span className="text-amber-500" title="Material requerido">
                                                        <Wrench className="w-3.5 h-3.5" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Footer: Center + Date */}
                                            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                                                <div className="flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    <span className="font-medium text-gray-600 truncate max-w-[100px]">
                                                        {ticket.centers?.name || 'Centro'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(ticket.created_at).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Click hint */}
                                            <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] text-emerald-600 font-medium">Click para ver detalles →</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {colTickets.length === 0 && (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                        <p className="text-sm text-gray-400">No hay tickets</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className={`p-6 border-b ${selectedTicket.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                selectedTicket.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                                    'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}>
                            <div className="flex justify-between items-start">
                                <div className="text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getSourceBadge(selectedTicket.source)}
                                        <span className="px-2 py-0.5 bg-white/20 text-white rounded text-xs font-medium">
                                            {selectedTicket.priority === 'high' ? '🔴 Prioridad Alta' :
                                                selectedTicket.priority === 'medium' ? '🟡 Prioridad Media' : '🔵 Prioridad Baja'}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold">{selectedTicket.title}</h2>
                                    <p className="text-white/80 text-sm mt-1">
                                        {selectedTicket.centers?.name || 'Centro'} • {new Date(selectedTicket.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción</h3>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedTicket.description}</p>
                            </div>

                            {/* Reporter Info */}
                            {selectedTicket.reporter_name && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Reportado Por</h3>
                                        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <User className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedTicket.reporter_name}</p>
                                                <p className="text-xs text-gray-500">{selectedTicket.department || 'Empleado'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Responsable</h3>
                                        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Wrench className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedTicket.responsible || 'Mantenimiento'}</p>
                                                <p className="text-xs text-gray-500">{selectedTicket.incident_type || 'maintenance'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Inspection Item Details */}
                            {selectedTicket.source === 'inspection' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Zona</h3>
                                        <p className="bg-gray-50 p-4 rounded-lg font-medium">{selectedTicket.zone_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Concepto</h3>
                                        <p className="bg-gray-50 p-4 rounded-lg font-medium">{selectedTicket.concept_name || 'N/A'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Materials needed */}
                            {selectedTicket.inventory_item && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Material Requerido</h3>
                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-3">
                                        <Wrench className="w-5 h-5 text-amber-600" />
                                        <div>
                                            <p className="font-medium text-amber-900">{selectedTicket.inventory_item}</p>
                                            {selectedTicket.inventory_quantity && (
                                                <p className="text-sm text-amber-700">Cantidad: {selectedTicket.inventory_quantity}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Images indicator */}
                            {selectedTicket.has_images && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Imágenes Adjuntas</h3>
                                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg flex items-center gap-3">
                                        <Image className="w-5 h-5 text-purple-600" />
                                        <p className="text-purple-900">Esta incidencia tiene imágenes adjuntas</p>
                                    </div>
                                </div>
                            )}

                            {/* Task to perform (for inspection items) */}
                            {selectedTicket.task_to_perform && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Tarea a Realizar</h3>
                                    <p className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-900">{selectedTicket.task_to_perform}</p>
                                </div>
                            )}

                            {/* Observations */}
                            {selectedTicket.observations && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Observaciones</h3>
                                    <p className="bg-gray-50 p-4 rounded-lg text-gray-700">{selectedTicket.observations}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer - Actions */}
                        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                ID: {selectedTicket.id}
                            </div>
                            <div className="flex gap-3">
                                {selectedTicket.status === 'open' && (
                                    <button
                                        onClick={() => handleStatusChange(selectedTicket.id, 'in_progress', selectedTicket.source)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Empezar a Trabajar
                                    </button>
                                )}
                                {selectedTicket.status === 'in_progress' && (
                                    <button
                                        onClick={() => handleStatusChange(selectedTicket.id, 'resolved', selectedTicket.source)}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Marcar como Resuelto
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketManager;
