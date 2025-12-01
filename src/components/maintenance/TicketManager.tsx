import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Filter, MoreHorizontal } from 'lucide-react';
import maintenanceService from '../../services/maintenanceService';

const TicketManager: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, open, in_progress, resolved

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        const response = await maintenanceService.getTickets();
        if (response.success && response.data) {
            setTickets(response.data);
        }
        setLoading(false);
    };

    const handleStatusChange = async (ticketId: string, newStatus: string) => {
        const response = await maintenanceService.updateTicketStatus(ticketId, newStatus);
        if (response.success) {
            loadTickets(); // Reload to reflect changes
        }
    };

    const filteredTickets = tickets.filter(t => filter === 'all' || t.status === filter);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Abierto</span>;
            case 'in_progress': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">En Progreso</span>;
            case 'resolved': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Resuelto</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
            default: return <CheckCircle className="w-4 h-4 text-blue-500" />;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando incidencias...</div>;
    }

    const columns = [
        { id: 'open', title: 'Abierto', color: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertCircle },
        { id: 'in_progress', title: 'En Progreso', color: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Clock },
        { id: 'resolved', title: 'Resuelto', color: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle }
    ];

    return (
        <div className="space-y-6 h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Tablero de Incidencias</h3>
                    <p className="text-sm text-gray-500">Gestión visual de tickets de mantenimiento</p>
                </div>
                <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] overflow-hidden">
                {columns.map((col) => (
                    <div key={col.id} className={`flex flex-col h-full rounded-xl border ${col.border} bg-gray-50/50`}>
                        {/* Column Header */}
                        <div className={`p-4 border-b ${col.border} ${col.color} rounded-t-xl flex items-center justify-between`}>
                            <div className="flex items-center font-bold text-gray-900">
                                <col.icon className={`w-5 h-5 mr-2 ${col.text}`} />
                                {col.title}
                            </div>
                            <span className="bg-white px-2 py-1 rounded-md text-xs font-bold text-gray-600 shadow-sm">
                                {tickets.filter(t => t.status === col.id).length}
                            </span>
                        </div>

                        {/* Column Content */}
                        <div className="p-4 overflow-y-auto space-y-4 flex-1">
                            {tickets.filter(t => t.status === col.id).map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer relative"
                                >
                                    {/* Priority Stripe */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${ticket.priority === 'high' ? 'bg-red-500' :
                                        ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`}></div>

                                    <div className="pl-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baja'}
                                            </span>
                                            <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{ticket.title}</h4>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{ticket.description}</p>

                                        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-600 truncate max-w-[100px]">
                                                    {ticket.centers?.name || 'Centro'}
                                                </span>
                                            </div>
                                            <div>
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {col.id === 'open' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(ticket.id, 'in_progress'); }}
                                                    className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded text-xs font-bold hover:bg-blue-100 transition-colors"
                                                >
                                                    Empezar
                                                </button>
                                            )}
                                            {col.id === 'in_progress' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(ticket.id, 'resolved'); }}
                                                    className="flex-1 bg-green-50 text-green-600 py-1.5 rounded text-xs font-bold hover:bg-green-100 transition-colors"
                                                >
                                                    Resolver
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {tickets.filter(t => t.status === col.id).length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-sm text-gray-400">No hay tickets</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TicketManager;
