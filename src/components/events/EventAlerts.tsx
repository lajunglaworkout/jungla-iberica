import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle, Calendar, Users, ChevronRight, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';

interface Alert {
    id: string;
    type: 'overdue' | 'upcoming' | 'survey' | 'info';
    title: string;
    description: string;
    eventoId?: number;
    eventoNombre?: string;
    dueDate?: string;
}

interface EventAlertsProps {
    onNavigateToEvent?: (eventId: number) => void;
}

export const EventAlerts: React.FC<EventAlertsProps> = ({ onNavigateToEvent }) => {
    const { employee } = useSession();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        loadAlerts();
    }, [employee]);

    const loadAlerts = async () => {
        if (!employee) return;
        setLoading(true);

        try {
            const alertsList: Alert[] = [];
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            // 1. Load overdue checklist items
            const { data: overdueItems } = await supabase
                .from('evento_checklist')
                .select('*, eventos:evento_id(id, nombre, center_id)')
                .eq('completado', false)
                .lt('fecha_limite', todayStr);

            overdueItems?.forEach(item => {
                const evento = item.eventos as any;
                alertsList.push({
                    id: `checklist-${item.id}`,
                    type: 'overdue',
                    title: item.nombre,
                    description: `Fecha límite: ${new Date(item.fecha_limite).toLocaleDateString('es-ES')}`,
                    eventoId: evento?.id,
                    eventoNombre: evento?.nombre,
                    dueDate: item.fecha_limite
                });
            });

            // 2. Load upcoming checklist items (next 3 days)
            const threeDaysLater = new Date(today);
            threeDaysLater.setDate(threeDaysLater.getDate() + 3);
            const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

            const { data: upcomingItems } = await supabase
                .from('evento_checklist')
                .select('*, eventos:evento_id(id, nombre, center_id)')
                .eq('completado', false)
                .gte('fecha_limite', todayStr)
                .lte('fecha_limite', threeDaysStr);

            upcomingItems?.forEach(item => {
                const evento = item.eventos as any;
                alertsList.push({
                    id: `upcoming-${item.id}`,
                    type: 'upcoming',
                    title: item.nombre,
                    description: `Vence: ${new Date(item.fecha_limite).toLocaleDateString('es-ES')}`,
                    eventoId: evento?.id,
                    eventoNombre: evento?.nombre,
                    dueDate: item.fecha_limite
                });
            });

            // 3. Load events that ended but have no surveys
            const { data: finishedEvents } = await supabase
                .from('eventos')
                .select('id, nombre, fecha_evento')
                .eq('estado', 'finalizado')
                .lt('fecha_evento', todayStr);

            if (finishedEvents) {
                for (const evento of finishedEvents) {
                    const { count: surveyCount } = await supabase
                        .from('evento_encuestas')
                        .select('id', { count: 'exact', head: true })
                        .eq('evento_id', evento.id);

                    const { count: participantCount } = await supabase
                        .from('evento_participantes')
                        .select('id', { count: 'exact', head: true })
                        .eq('evento_id', evento.id);

                    if ((surveyCount || 0) < (participantCount || 0) && (participantCount || 0) > 0) {
                        alertsList.push({
                            id: `survey-${evento.id}`,
                            type: 'survey',
                            title: 'Encuestas pendientes',
                            description: `${surveyCount || 0}/${participantCount} encuestas registradas`,
                            eventoId: evento.id,
                            eventoNombre: evento.nombre
                        });
                    }
                }
            }

            setAlerts(alertsList);
        } catch (error) {
            console.error('Error loading alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAlertStyle = (type: string) => {
        switch (type) {
            case 'overdue':
                return { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626' };
            case 'upcoming':
                return { bg: '#fffbeb', border: '#fcd34d', icon: '#d97706' };
            case 'survey':
                return { bg: '#eff6ff', border: '#93c5fd', icon: '#3b82f6' };
            default:
                return { bg: '#f9fafb', border: '#e5e7eb', icon: '#6b7280' };
        }
    };

    const overdueCount = alerts.filter(a => a.type === 'overdue').length;
    const upcomingCount = alerts.filter(a => a.type === 'upcoming').length;
    const surveyCount = alerts.filter(a => a.type === 'survey').length;

    if (loading) {
        return (
            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                    <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid #e5e7eb', borderTop: '2px solid #10b981', borderRadius: '50%' }} />
                    Cargando alertas...
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {/* Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: alerts.length > 0 && overdueCount > 0 ? '#fef2f2' : '#f9fafb'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        position: 'relative',
                        padding: '8px',
                        backgroundColor: overdueCount > 0 ? '#fee2e2' : '#f3f4f6',
                        borderRadius: '10px'
                    }}>
                        <Bell size={20} color={overdueCount > 0 ? '#dc2626' : '#6b7280'} />
                        {alerts.length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 700,
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {alerts.length}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                            🔔 Alertas y Tareas Pendientes
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                            {overdueCount > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>{overdueCount} vencidas</span>}
                            {overdueCount > 0 && upcomingCount > 0 && ' · '}
                            {upcomingCount > 0 && <span style={{ color: '#d97706' }}>{upcomingCount} próximas</span>}
                            {(overdueCount > 0 || upcomingCount > 0) && surveyCount > 0 && ' · '}
                            {surveyCount > 0 && <span style={{ color: '#3b82f6' }}>{surveyCount} encuestas</span>}
                            {alerts.length === 0 && '✅ Todo al día'}
                        </p>
                    </div>
                </div>
                <ChevronRight
                    size={20}
                    color="#9ca3af"
                    style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s'
                    }}
                />
            </div>

            {/* Alert List */}
            {isExpanded && alerts.length > 0 && (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {alerts.map(alert => {
                        const style = getAlertStyle(alert.type);
                        return (
                            <div
                                key={alert.id}
                                onClick={() => alert.eventoId && onNavigateToEvent?.(alert.eventoId)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    backgroundColor: style.bg,
                                    border: `1px solid ${style.border}`,
                                    borderRadius: '10px',
                                    cursor: alert.eventoId ? 'pointer' : 'default'
                                }}
                            >
                                {alert.type === 'overdue' && <AlertTriangle size={20} color={style.icon} />}
                                {alert.type === 'upcoming' && <Clock size={20} color={style.icon} />}
                                {alert.type === 'survey' && <Users size={20} color={style.icon} />}

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                                        {alert.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {alert.eventoNombre && <span style={{ fontWeight: 500 }}>{alert.eventoNombre}</span>}
                                        {alert.eventoNombre && ' · '}
                                        {alert.description}
                                    </div>
                                </div>

                                {alert.eventoId && (
                                    <ChevronRight size={18} color="#9ca3af" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {isExpanded && alerts.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                    <CheckCircle size={40} color="#16a34a" style={{ marginBottom: '12px' }} />
                    <p style={{ margin: 0, color: '#16a34a', fontWeight: 600 }}>¡Todo al día!</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                        No tienes tareas pendientes ni alertas
                    </p>
                </div>
            )}
        </div>
    );
};

export default EventAlerts;
