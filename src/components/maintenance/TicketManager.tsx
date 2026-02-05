import React, { useState, useEffect } from 'react';
import {
    AlertCircle, CheckCircle, Clock, Filter, X,
    User, MapPin, Calendar, Image as ImageIcon, Wrench, ChevronDown, Building2, FileText, ExternalLink
} from 'lucide-react';
import maintenanceService from '../../services/maintenanceService';
import { useData } from '../../contexts/DataContext';
import { useSession } from '../../contexts/SessionContext';

interface Ticket {
    id: string | number;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved';
    priority: 'high' | 'medium' | 'low';
    created_at: string;
    center_id?: string | number;
    centers?: { name: string };
    center_name?: string;
    source: 'maintenance' | 'checklist' | 'inspection';
    reporter_name?: string;
    reporter_id?: string;
    incident_type?: string;
    department?: string;
    responsible?: string;
    has_images?: boolean;
    image_urls?: string[];
    inventory_item?: string;
    inventory_quantity?: number;
    resolution_notes?: string;
    resolved_by?: string;
    resolved_at?: string;
    started_by?: string;
    started_at?: string;
    action_plan?: string;
    estimated_time?: string;
}

const TicketManager: React.FC = () => {
    const { employees } = useData();
    const { employee } = useSession();
    const [showStartWorkModal, setShowStartWorkModal] = useState(false);
    const [actionPlan, setActionPlan] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('1 hora');
    const [isSubmittingStart, setIsSubmittingStart] = useState(false);
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

    const getReporterName = (ticket: Ticket) => {
        // 1. Try generic reporter_name from ticket
        if (ticket.reporter_name && ticket.reporter_name !== 'Usuario') return ticket.reporter_name;

        // 2. Try to find by reporter_id in employees context
        if (ticket.reporter_id && employees.length > 0) {
            const emp = employees.find(e => e.id.toString() === ticket.reporter_id || e.user_id === ticket.reporter_id);
            if (emp) return emp.name;
        }

        // 3. Fallback
        return ticket.reporter_name || 'Usuario';
    };



    const handleStartWorkConfirm = async () => {
        if (!selectedTicket || !actionPlan) return;
        setIsSubmittingStart(true);

        try {
            const { supabase } = await import('../../lib/supabase');

            // Only for checklist_incidents for now (maintenance tickets have different schema usually, but assuming unified)
            if (selectedTicket.source === 'checklist') {
                const updateData = {
                    status: 'en_proceso', // Using confirmed enum
                    started_by: employee?.name || 'Mantenimiento',
                    started_at: new Date().toISOString(),
                    action_plan: actionPlan,
                    estimated_time: estimatedTime,
                    updated_at: new Date().toISOString()
                };

                const { error } = await supabase
                    .from('checklist_incidents')
                    .update(updateData)
                    .eq('id', selectedTicket.id);

                if (error) throw error;
            } else {
                // Generico fallback
                await maintenanceService.updateTicketStatus(String(selectedTicket.id), 'in_progress');
            }

            setShowStartWorkModal(false);
            loadTickets();
            setSelectedTicket(null); // Close main modal too? Or keep open? Maybe keep open to see changes?
            // Actually, keep main modal open but refresh data?
            // For now close to force refresh list
        } catch (error) {
            console.error('Error starting work:', error);
            alert('Error al iniciar trabajo. Verifica que la base de datos esté actualizada.');
        } finally {
            setIsSubmittingStart(false);
        }
    };

    const handleStatusChange = async (ticketId: string | number, newStatus: string, source: string) => {
        if (source === 'checklist') {
            const { supabase } = await import('../../lib/supabase');
            // FIX: Correct enum values based on check constraint
            const dbStatus = newStatus === 'open' ? 'abierta' :
                newStatus === 'in_progress' ? 'en_proceso' : 'resuelta';

            await supabase
                .from('checklist_incidents')
                .update({
                    status: dbStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', ticketId);
        } else if (source === 'inspection') {
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
            await maintenanceService.updateTicketStatus(String(ticketId), newStatus);
        }
        loadTickets();
        setSelectedTicket(null);
    };

    const columns = [
        { id: 'open', title: 'Abierto', bgColor: '#fef2f2', borderColor: '#fecaca', textColor: '#dc2626', icon: AlertCircle },
        { id: 'in_progress', title: 'En Progreso', bgColor: '#eff6ff', borderColor: '#bfdbfe', textColor: '#2563eb', icon: Clock },
        { id: 'resolved', title: 'Resuelto', bgColor: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#16a34a', icon: CheckCircle }
    ];

    const priorityConfig = {
        high: {
            bg: '#fee2e2', // Red 100
            border: '#fca5a5', // Red 300
            text: '#991b1b', // Red 800
            badgeBg: '#fecaca',
            badgeText: '#7f1d1d',
            label: 'ALTA'
        },
        medium: {
            bg: '#fef3c7', // Amber 100
            border: '#fcd34d', // Amber 300
            text: '#92400e', // Amber 800
            badgeBg: '#fde68a',
            badgeText: '#78350f',
            label: 'MEDIA'
        },
        low: {
            bg: '#f3f4f6', // Gray 100
            border: '#d1d5db', // Gray 300
            text: '#1f2937', // Gray 800
            badgeBg: '#e5e7eb',
            badgeText: '#374151',
            label: 'BAJA'
        }
    };

    const sourceConfig = {
        checklist: { bg: '#f3e8ff', text: '#6b21a8', label: 'CHECKLIST' },
        inspection: { bg: '#e0f2fe', text: '#0369a1', label: 'INSPECCIÓN' },
        maintenance: { bg: '#f3f4f6', text: '#374151', label: 'TICKET' }
    };

    if (loading) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{
                    width: '32px', height: '32px',
                    border: '3px solid #10b981', borderTopColor: 'transparent',
                    borderRadius: '50%', margin: '0 auto 16px',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#6b7280' }}>Cargando incidencias...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Tablero de Incidencias</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                        {tickets.length} incidencias totales • {tickets.filter(t => t.status === 'open').length} pendientes
                    </p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: '#111827',
                        color: 'white',
                        borderRadius: '10px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Filter style={{ width: '16px', height: '16px' }} />
                    Filtrar
                    <ChevronDown style={{ width: '16px', height: '16px', transform: showFilters ? 'rotate(180deg)' : 'none' }} />
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div style={{ display: 'flex', gap: '8px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'checklist', label: 'Checklist' },
                        { key: 'inspection', label: 'Inspecciones' }
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: filter === f.key ? 'none' : '1px solid #e5e7eb',
                                backgroundColor: filter === f.key ? '#111827' : 'white',
                                color: filter === f.key ? 'white' : '#374151',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {columns.map((col) => {
                    const colTickets = tickets.filter(t => {
                        const statusMatch = t.status === col.id;
                        const sourceMatch = filter === 'all' || t.source === filter;
                        return statusMatch && sourceMatch;
                    });

                    return (
                        <div
                            key={col.id}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                border: `1px solid ${col.borderColor}`,
                                overflow: 'hidden'
                            }}
                        >
                            {/* Column Header */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: col.bgColor,
                                borderBottom: `1px solid ${col.borderColor}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <col.icon style={{ width: '18px', height: '18px', color: col.textColor }} />
                                    <span style={{ fontWeight: '600', color: '#111827' }}>{col.title}</span>
                                </div>
                                <span style={{
                                    padding: '4px 10px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    color: col.textColor
                                }}>
                                    {colTickets.length}
                                </span>
                            </div>

                            {/* Column Content */}
                            <div style={{
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                maxHeight: 'calc(100vh - 380px)',
                                overflowY: 'auto'
                            }}>
                                {colTickets.map((ticket) => {
                                    const pConfig = priorityConfig[ticket.priority] || priorityConfig.low;
                                    const sConfig = sourceConfig[ticket.source] || sourceConfig.maintenance;

                                    return (
                                        <div
                                            key={ticket.id}
                                            onClick={() => setSelectedTicket(ticket)}
                                            style={{
                                                backgroundColor: pConfig.bg,
                                                borderRadius: '12px',
                                                padding: '14px',
                                                border: `1px solid ${pConfig.border}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'none';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={{ paddingLeft: '4px' }}>
                                                {/* Badges row */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                    <span style={{
                                                        padding: '3px 8px',
                                                        backgroundColor: 'white',
                                                        color: sConfig.text,
                                                        borderRadius: '6px',
                                                        fontSize: '10px',
                                                        fontWeight: '700',
                                                        letterSpacing: '0.5px',
                                                        border: '1px solid rgba(0,0,0,0.05)'
                                                    }}>
                                                        {sConfig.label}
                                                    </span>
                                                    <span style={{
                                                        padding: '3px 8px',
                                                        backgroundColor: pConfig.badgeBg,
                                                        color: pConfig.badgeText,
                                                        borderRadius: '6px',
                                                        fontSize: '10px',
                                                        fontWeight: '700'
                                                    }}>
                                                        {pConfig.label}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h4 style={{
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    color: pConfig.text,
                                                    margin: '0 0 6px 0',
                                                    lineHeight: '1.3',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {ticket.title}
                                                </h4>

                                                {/* Description */}
                                                {ticket.description && (
                                                    <p style={{
                                                        fontSize: '12px',
                                                        color: '#4b5563', // Gray 600
                                                        margin: '0 0 10px 0',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {ticket.description}
                                                    </p>
                                                )}

                                                {/* Footer */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    paddingTop: '10px',
                                                    borderTop: `1px solid ${pConfig.border}`,
                                                    fontSize: '11px',
                                                    color: '#6b7280'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <User style={{ width: '12px', height: '12px' }} />
                                                        <span style={{ fontWeight: '500' }}>{getReporterName(ticket).split(' ')[0]}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Calendar style={{ width: '12px', height: '12px' }} />
                                                        <span>{new Date(ticket.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {(ticket.has_images || (ticket.image_urls && ticket.image_urls.length > 0)) && (
                                                            <ImageIcon style={{ width: '12px', height: '12px', color: '#a855f7' }} />
                                                        )}
                                                        {ticket.inventory_item && (
                                                            <Wrench style={{ width: '12px', height: '12px', color: '#f59e0b' }} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {colTickets.length === 0 && (
                                    <div style={{
                                        padding: '32px',
                                        textAlign: 'center',
                                        border: '2px dashed #e5e7eb',
                                        borderRadius: '12px'
                                    }}>
                                        <p style={{ color: '#9ca3af', fontSize: '14px' }}>No hay tickets</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {selectedTicket && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '24px'
                    }}
                    onClick={() => setSelectedTicket(null)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '640px',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '28px 28px 24px',
                            background: selectedTicket.priority === 'high'
                                ? 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)'
                                : selectedTicket.priority === 'medium'
                                    ? 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)'
                                    : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1, paddingRight: '16px' }}>
                                    {/* Badges */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: '700'
                                        }}>
                                            {sourceConfig[selectedTicket.source]?.label || 'TICKET'}
                                        </span>
                                        <span style={{
                                            padding: '6px 12px',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: '700'
                                        }}>
                                            PRIORIDAD {priorityConfig[selectedTicket.priority]?.label || 'BAJA'}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 style={{
                                        fontSize: '22px',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        margin: '0 0 12px 0',
                                        lineHeight: '1.3'
                                    }}>
                                        {selectedTicket.title}
                                    </h2>

                                    {/* Meta */}
                                    <div style={{ display: 'flex', gap: '16px', color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Building2 style={{ width: '16px', height: '16px' }} />
                                            {selectedTicket.centers?.name || selectedTicket.center_name || 'Centro'}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar style={{ width: '16px', height: '16px' }} />
                                            {new Date(selectedTicket.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    style={{
                                        padding: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'flex'
                                    }}
                                >
                                    <X style={{ width: '20px', height: '20px', color: 'white' }} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '24px 28px', maxHeight: 'calc(90vh - 280px)', overflowY: 'auto' }}>
                            {/* Description */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FileText style={{ width: '14px', height: '14px' }} />
                                    Descripción
                                </h3>
                                <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px' }}>
                                    <p style={{ color: '#374151', lineHeight: '1.6', margin: 0 }}>
                                        {selectedTicket.description || 'Sin descripción'}
                                    </p>
                                </div>
                            </div>

                            {/* Reporter & Responsible */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                                        Reportado por
                                    </h3>
                                    <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User style={{ width: '20px', height: '20px', color: 'white' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
                                                {getReporterName(selectedTicket)}
                                            </p>
                                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                                                {selectedTicket.department || 'Empleado del centro'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                                        Asignado a
                                    </h3>
                                    <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Wrench style={{ width: '20px', height: '20px', color: 'white' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
                                                {selectedTicket.responsible || 'Mantenimiento'}
                                            </p>
                                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                                                {selectedTicket.incident_type || 'Departamento responsable'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Work In Progress Details */}
                            {(selectedTicket.action_plan || selectedTicket.started_by) && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Wrench style={{ width: '14px', height: '14px' }} />
                                        Trabajo en Curso
                                    </h3>
                                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe', padding: '16px', borderRadius: '12px' }}>
                                        {selectedTicket.started_by && (
                                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1e40af' }}>
                                                <User style={{ width: '14px', height: '14px' }} />
                                                <span style={{ fontWeight: '600' }}>Iniciado por:</span> {selectedTicket.started_by}
                                                <span style={{ color: '#93c5fd' }}>•</span>
                                                <Clock style={{ width: '14px', height: '14px' }} />
                                                <span>{new Date(selectedTicket.started_at || '').toLocaleString()}</span>
                                            </div>
                                        )}
                                        {selectedTicket.estimated_time && (
                                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1e40af' }}>
                                                <Clock style={{ width: '14px', height: '14px' }} />
                                                <span style={{ fontWeight: '600' }}>Tiempo Estimado:</span> {selectedTicket.estimated_time}
                                            </div>
                                        )}
                                        {selectedTicket.action_plan && (
                                            <div>
                                                <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af', marginBottom: '4px', textTransform: 'uppercase' }}>PLAN DE ACCIÓN</p>
                                                <p style={{ color: '#1e3a8a', fontSize: '14px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                                                    {selectedTicket.action_plan}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Images */}
                            {(selectedTicket.image_urls && selectedTicket.image_urls.length > 0) && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <ImageIcon style={{ width: '14px', height: '14px' }} />
                                        Imágenes Adjuntas ({selectedTicket.image_urls.length})
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                        {selectedTicket.image_urls.map((url, idx) => (
                                            <a
                                                key={idx}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'block',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #e5e7eb',
                                                    position: 'relative'
                                                }}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Imagen ${idx + 1}`}
                                                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    backgroundColor: 'rgba(0,0,0,0)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'}
                                                >
                                                    <ExternalLink style={{ width: '24px', height: '24px', color: 'white', opacity: 0 }} />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No images message */}
                            {selectedTicket.has_images && (!selectedTicket.image_urls || selectedTicket.image_urls.length === 0) && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                                        Imágenes
                                    </h3>
                                    <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <ImageIcon style={{ width: '20px', height: '20px', color: '#a855f7' }} />
                                        <p style={{ color: '#7c3aed', margin: 0, fontSize: '14px' }}>
                                            Esta incidencia tiene imágenes adjuntas
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Material */}
                            {selectedTicket.inventory_item && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                                        Material Requerido
                                    </h3>
                                    <div style={{ backgroundColor: '#fefce8', border: '1px solid #fde047', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Wrench style={{ width: '20px', height: '20px', color: 'white' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', color: '#92400e', margin: 0 }}>{selectedTicket.inventory_item}</p>
                                            {selectedTicket.inventory_quantity && (
                                                <p style={{ fontSize: '13px', color: '#a16207', margin: 0 }}>Cantidad: {selectedTicket.inventory_quantity}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '20px 28px',
                            borderTop: '1px solid #f3f4f6',
                            backgroundColor: '#f9fafb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
                                ID: {String(selectedTicket.id).slice(0, 12)}
                            </span>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {selectedTicket.status === 'open' && (
                                    <button
                                        onClick={() => setShowStartWorkModal(true)}
                                        style={{
                                            padding: '12px 20px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                        }}
                                    >
                                        <Clock style={{ width: '16px', height: '16px' }} />
                                        Empezar a Trabajar
                                    </button>
                                )}
                                {selectedTicket.status === 'in_progress' && (
                                    <button
                                        onClick={() => handleStatusChange(selectedTicket.id, 'resolved', selectedTicket.source)}
                                        style={{
                                            padding: '12px 20px',
                                            backgroundColor: '#22c55e',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                        }}
                                    >
                                        <CheckCircle style={{ width: '16px', height: '16px' }} />
                                        Marcar como Resuelto
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    style={{
                                        padding: '12px 20px',
                                        backgroundColor: '#e5e7eb',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Start Work Modal */}
            {showStartWorkModal && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '20px', width: '90%', maxWidth: '500px',
                        padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
                            👷‍♂️ Empezar a Trabajar
                        </h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                Plan de Acción
                            </label>
                            <textarea
                                value={actionPlan}
                                onChange={(e) => setActionPlan(e.target.value)}
                                placeholder="Describe brevemente qué vas a hacer..."
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #d1d5db',
                                    minHeight: '100px', fontSize: '14px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                Tiempo Estimado
                            </label>
                            <select
                                value={estimatedTime}
                                onChange={(e) => setEstimatedTime(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #d1d5db',
                                    backgroundColor: 'white', fontSize: '14px'
                                }}
                            >
                                <option value="30 mins">30 mins</option>
                                <option value="1 hora">1 hora</option>
                                <option value="2 horas">2 horas</option>
                                <option value="4 horas">4 horas</option>
                                <option value="1 día">1 día</option>
                                <option value="Más de 1 día">Más de 1 día</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowStartWorkModal(false)}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px', border: 'none',
                                    backgroundColor: '#f3f4f6', color: '#374151', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleStartWorkConfirm}
                                disabled={!actionPlan || isSubmittingStart}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px', border: 'none',
                                    backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer',
                                    opacity: (!actionPlan || isSubmittingStart) ? 0.7 : 1
                                }}
                            >
                                {isSubmittingStart ? 'Guardando...' : 'Confirmar Inicio'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketManager;
