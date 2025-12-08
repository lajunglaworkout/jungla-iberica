import React, { useState, useEffect } from 'react';
import {
    Building2, DollarSign, Users, TrendingUp, TrendingDown, Calendar,
    AlertTriangle, CheckCircle, Wrench, Package, Send, Clock,
    MessageCircle, FileText, ChevronRight, Star, Loader2, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';

// Interfaces
interface FinancialMetrics {
    ingresos: number;
    gastos: number;
    balance: number;
    ingresosAnterior?: number;
}

interface ClientMetrics {
    activos: number;
    altasMes: number;
    bajasMes: number;
    retencion: number;
}

interface IncidenciasMetrics {
    abiertas: number;
    cerradas: number;
    logistica: number;
    mantenimiento: number;
}

interface EventosMetrics {
    realizados: number;
    pendientes: number;
    participantes: number;
    satisfaccion: number;
}

interface Mensaje {
    id: number;
    categoria: string;
    asunto: string;
    mensaje: string;
    prioridad: string;
    estado: string;
    respuesta?: string;
    created_at: string;
}

interface Reunion {
    id: number;
    titulo: string;
    fecha: string;
    tipo: string;
    acta?: string;
    acta_pdf_url?: string;
}

// KPI Card Component
const KPICard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
    trend?: number;
}> = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ padding: '10px', backgroundColor: `${color}15`, borderRadius: '12px' }}>
                <Icon size={24} color={color} />
            </div>
            {trend !== undefined && (
                <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: trend >= 0 ? '#16a34a' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                }}>
                    {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(trend)}%
                </span>
            )}
        </div>
        <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{value}</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{subtitle}</div>}
        </div>
    </div>
);

// Section Header Component
const SectionHeader: React.FC<{ title: string; icon: React.ElementType; color: string }> = ({ title, icon: Icon, color }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: `2px solid ${color}`
    }}>
        <div style={{ padding: '8px', backgroundColor: `${color}15`, borderRadius: '10px' }}>
            <Icon size={20} color={color} />
        </div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>{title}</h3>
    </div>
);

export const FranquiciadoDashboard: React.FC = () => {
    const { employee } = useSession();
    const [loading, setLoading] = useState(true);
    const [centerName, setCenterName] = useState('');
    const [centerId, setCenterId] = useState<number | null>(null);

    // Metrics state
    const [financial, setFinancial] = useState<FinancialMetrics>({ ingresos: 0, gastos: 0, balance: 0 });
    const [clients, setClients] = useState<ClientMetrics>({ activos: 0, altasMes: 0, bajasMes: 0, retencion: 0 });
    const [incidencias, setIncidencias] = useState<IncidenciasMetrics>({ abiertas: 0, cerradas: 0, logistica: 0, mantenimiento: 0 });
    const [eventos, setEventos] = useState<EventosMetrics>({ realizados: 0, pendientes: 0, participantes: 0, satisfaccion: 0 });

    // Messages state
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [reuniones, setReuniones] = useState<Reunion[]>([]);
    const [showMessageForm, setShowMessageForm] = useState(false);
    const [newMessage, setNewMessage] = useState({
        categoria: 'informacion',
        asunto: '',
        mensaje: '',
        prioridad: 'normal'
    });
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        if (employee?.center_id) {
            loadCenterData();
        }
    }, [employee]);

    const loadCenterData = async () => {
        if (!employee?.center_id) return;
        setLoading(true);

        try {
            const cId = parseInt(employee.center_id);
            setCenterId(cId);

            // Load center info
            const { data: center } = await supabase
                .from('centers')
                .select('name')
                .eq('id', cId)
                .single();
            setCenterName(center?.name || 'Mi Centro');

            // Load financial data (current month)
            const now = new Date();
            const { data: financialData } = await supabase
                .from('center_monthly_financials')
                .select('*')
                .eq('center_id', cId)
                .eq('mes', now.getMonth() + 1)
                .eq('año', now.getFullYear())
                .single();

            if (financialData) {
                setFinancial({
                    ingresos: financialData.ingresos_sin_iva || 0,
                    gastos: (financialData.alquiler || 0) + (financialData.suministros || 0) +
                        (financialData.nominas || 0) + (financialData.marketing || 0) +
                        (financialData.mantenimiento || 0) + (financialData.royalty || 0),
                    balance: (financialData.ingresos_sin_iva || 0) -
                        ((financialData.alquiler || 0) + (financialData.suministros || 0) +
                            (financialData.nominas || 0) + (financialData.marketing || 0))
                });
            }

            // Load client metrics
            const { data: clientData } = await supabase
                .from('client_metrics')
                .select('*')
                .eq('center_id', cId)
                .eq('mes', now.getMonth() + 1)
                .eq('año', now.getFullYear())
                .single();

            if (clientData) {
                setClients({
                    activos: clientData.clientes_activos || 0,
                    altasMes: clientData.altas_mes || 0,
                    bajasMes: clientData.bajas_mes || 0,
                    retencion: clientData.clientes_activos > 0
                        ? Math.round(((clientData.clientes_activos - clientData.bajas_mes) / clientData.clientes_activos) * 100)
                        : 0
                });
            }

            // Load incidents
            const { data: incidentsData } = await supabase
                .from('incidents')
                .select('status, incident_type_id')
                .eq('center_id', cId);

            if (incidentsData) {
                const abiertas = incidentsData.filter(i => i.status === 'pending' || i.status === 'in_progress').length;
                const cerradas = incidentsData.filter(i => i.status === 'resolved' || i.status === 'closed').length;
                setIncidencias({ abiertas, cerradas, logistica: 0, mantenimiento: 0 });
            }

            // Load events
            const { data: eventosData } = await supabase
                .from('eventos')
                .select('id, estado, fecha_evento')
                .eq('center_id', cId);

            if (eventosData) {
                const realizados = eventosData.filter(e => e.estado === 'finalizado').length;
                const pendientes = eventosData.filter(e => e.estado !== 'finalizado' && e.estado !== 'cancelado').length;

                // Get participants count
                const eventIds = eventosData.map(e => e.id);
                const { count: participantesCount } = await supabase
                    .from('evento_participantes')
                    .select('id', { count: 'exact', head: true })
                    .in('evento_id', eventIds);

                // Get satisfaction
                const { data: encuestas } = await supabase
                    .from('evento_encuestas')
                    .select('puntuacion_general')
                    .in('evento_id', eventIds);

                const satisfaccion = encuestas && encuestas.length > 0
                    ? encuestas.reduce((s, e) => s + (e.puntuacion_general || 0), 0) / encuestas.length
                    : 0;

                setEventos({
                    realizados,
                    pendientes,
                    participantes: participantesCount || 0,
                    satisfaccion: Math.round(satisfaccion * 10) / 10
                });
            }

            // Load messages
            const { data: mensajesData } = await supabase
                .from('franquiciado_mensajes')
                .select('*')
                .eq('center_id', cId)
                .order('created_at', { ascending: false })
                .limit(10);
            setMensajes(mensajesData || []);

            // Load reuniones
            const { data: reunionesData } = await supabase
                .from('reuniones_accionistas')
                .select('*')
                .eq('center_id', cId)
                .order('fecha', { ascending: false })
                .limit(10);
            setReuniones(reunionesData || []);

        } catch (error) {
            console.error('Error loading center data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.asunto.trim() || !newMessage.mensaje.trim() || !centerId) return;
        setSendingMessage(true);

        try {
            await supabase.from('franquiciado_mensajes').insert([{
                franquiciado_id: employee?.id ? parseInt(employee.id) : null,
                center_id: centerId,
                categoria: newMessage.categoria,
                asunto: newMessage.asunto.trim(),
                mensaje: newMessage.mensaje.trim(),
                prioridad: newMessage.prioridad,
                estado: 'pendiente'
            }]);

            // Reload messages
            const { data: mensajesData } = await supabase
                .from('franquiciado_mensajes')
                .select('*')
                .eq('center_id', centerId)
                .order('created_at', { ascending: false })
                .limit(10);
            setMensajes(mensajesData || []);

            // Reset form
            setNewMessage({ categoria: 'informacion', asunto: '', mensaje: '', prioridad: 'normal' });
            setShowMessageForm(false);
            alert('✅ Mensaje enviado correctamente');

        } catch (error) {
            console.error('Error sending message:', error);
            alert('❌ Error al enviar el mensaje');
        } finally {
            setSendingMessage(false);
        }
    };

    const getCategoriaIcon = (cat: string) => {
        switch (cat) {
            case 'incidencia': return '🔴';
            case 'propuesta': return '💡';
            case 'informacion': return 'ℹ️';
            default: return '📩';
        }
    };

    const getEstadoStyle = (estado: string) => {
        switch (estado) {
            case 'pendiente': return { bg: '#fef3c7', color: '#92400e', text: '⏳ Pendiente' };
            case 'leido': return { bg: '#dbeafe', color: '#1e40af', text: '👁️ Leído' };
            case 'respondido': return { bg: '#dcfce7', color: '#166534', text: '✅ Respondido' };
            case 'cerrado': return { bg: '#f3f4f6', color: '#6b7280', text: '🔒 Cerrado' };
            default: return { bg: '#f3f4f6', color: '#6b7280', text: estado };
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: '12px',
                color: '#10b981'
            }}>
                <Loader2 className="animate-spin" size={32} />
                <span style={{ fontSize: '18px', fontWeight: 500 }}>Cargando dashboard...</span>
            </div>
        );
    }

    return (
        <div style={{ padding: 'clamp(16px, 4vw, 32px)', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
                borderRadius: '20px',
                padding: 'clamp(20px, 4vw, 32px)',
                color: 'white',
                marginBottom: '32px',
                boxShadow: '0 10px 30px rgba(4, 120, 87, 0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <Building2 size={32} />
                            <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700 }}>
                                {centerName}
                            </h1>
                        </div>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                            Panel de Franquiciado · Vista general del centro
                        </p>
                    </div>
                    <button
                        onClick={loadCenterData}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '10px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}
                    >
                        <RefreshCw size={16} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Financial & Clients Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                {/* Facturación */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                    <SectionHeader title="Facturación del Mes" icon={DollarSign} color="#10b981" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>{financial.ingresos.toLocaleString()} €</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Ingresos</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>{financial.gastos.toLocaleString()} €</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Gastos</div>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            padding: '16px',
                            backgroundColor: financial.balance >= 0 ? '#f0fdf4' : '#fef2f2',
                            borderRadius: '12px',
                            border: `2px solid ${financial.balance >= 0 ? '#16a34a' : '#dc2626'}`
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: financial.balance >= 0 ? '#16a34a' : '#dc2626' }}>
                                {financial.balance >= 0 ? '+' : ''}{financial.balance.toLocaleString()} €
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Balance</div>
                        </div>
                    </div>
                </div>

                {/* Clientes */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                    <SectionHeader title="Clientes" icon={Users} color="#8b5cf6" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '10px' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#7c3aed' }}>{clients.activos}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Activos</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#dcfce7', borderRadius: '10px' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a' }}>+{clients.altasMes}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Altas</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '10px' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626' }}>-{clients.bajasMes}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Bajas</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#dbeafe', borderRadius: '10px' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#2563eb' }}>{clients.retencion}%</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Retención</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Incidencias & Eventos Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                {/* Incidencias */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                    <SectionHeader title="Incidencias" icon={AlertTriangle} color="#f59e0b" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            backgroundColor: incidencias.abiertas > 0 ? '#fef2f2' : '#f0fdf4',
                            borderRadius: '12px',
                            border: `2px solid ${incidencias.abiertas > 0 ? '#fca5a5' : '#86efac'}`
                        }}>
                            <div style={{ fontSize: '36px', fontWeight: 700, color: incidencias.abiertas > 0 ? '#dc2626' : '#16a34a' }}>
                                {incidencias.abiertas}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>🔴 Abiertas</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
                            <div style={{ fontSize: '36px', fontWeight: 700, color: '#16a34a' }}>{incidencias.cerradas}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>🟢 Cerradas</div>
                        </div>
                    </div>
                </div>

                {/* Eventos */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                    <SectionHeader title="Eventos" icon={Calendar} color="#3b82f6" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#dbeafe', borderRadius: '10px' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#2563eb' }}>{eventos.realizados}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Realizados</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '10px' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#d97706' }}>{eventos.pendientes}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Pendientes</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '10px' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#7c3aed' }}>{eventos.participantes}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Particip.</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '10px' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#f59e0b' }}>
                                <Star size={16} style={{ display: 'inline', marginRight: '4px' }} fill="#f59e0b" />
                                {eventos.satisfaccion}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Media</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reuniones de Accionistas */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                <SectionHeader title="Reuniones de Accionistas" icon={FileText} color="#6366f1" />
                {reuniones.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                        <FileText size={40} color="#d1d5db" style={{ marginBottom: '12px' }} />
                        <p style={{ margin: 0 }}>No hay reuniones registradas</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {reuniones.map(reunion => (
                            <div
                                key={reunion.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        padding: '8px 12px',
                                        backgroundColor: reunion.tipo === 'extraordinaria' ? '#fef3c7' : '#dbeafe',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: reunion.tipo === 'extraordinaria' ? '#92400e' : '#1e40af'
                                    }}>
                                        {new Date(reunion.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#111827' }}>{reunion.titulo}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            Junta {reunion.tipo}
                                        </div>
                                    </div>
                                </div>
                                {reunion.acta_pdf_url && (
                                    <a
                                        href={reunion.acta_pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            textDecoration: 'none',
                                            fontWeight: 500
                                        }}
                                    >
                                        Ver acta
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mensajería */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <SectionHeader title="Comunicación con Central" icon={MessageCircle} color="#10b981" />
                    <button
                        onClick={() => setShowMessageForm(!showMessageForm)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: showMessageForm ? '#f3f4f6' : '#10b981',
                            color: showMessageForm ? '#6b7280' : 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Send size={16} />
                        {showMessageForm ? 'Cancelar' : 'Nuevo Mensaje'}
                    </button>
                </div>

                {/* Message Form */}
                {showMessageForm && (
                    <div style={{
                        backgroundColor: '#f0fdf4',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px',
                        border: '2px solid #86efac'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>
                                    Categoría
                                </label>
                                <select
                                    value={newMessage.categoria}
                                    onChange={(e) => setNewMessage({ ...newMessage, categoria: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="incidencia">🔴 Incidencia</option>
                                    <option value="propuesta">💡 Propuesta</option>
                                    <option value="informacion">ℹ️ Información</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>
                                    Prioridad
                                </label>
                                <select
                                    value={newMessage.prioridad}
                                    onChange={(e) => setNewMessage({ ...newMessage, prioridad: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="baja">Baja</option>
                                    <option value="normal">Normal</option>
                                    <option value="alta">Alta</option>
                                    <option value="urgente">🚨 Urgente</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>
                                Asunto
                            </label>
                            <input
                                type="text"
                                value={newMessage.asunto}
                                onChange={(e) => setNewMessage({ ...newMessage, asunto: e.target.value })}
                                placeholder="Escribe el asunto..."
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>
                                Mensaje
                            </label>
                            <textarea
                                value={newMessage.mensaje}
                                onChange={(e) => setNewMessage({ ...newMessage, mensaje: e.target.value })}
                                placeholder="Escribe tu mensaje..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={sendingMessage || !newMessage.asunto.trim() || !newMessage.mensaje.trim()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: sendingMessage ? '#9ca3af' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: sendingMessage ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {sendingMessage ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            {sendingMessage ? 'Enviando...' : 'Enviar Mensaje'}
                        </button>
                    </div>
                )}

                {/* Messages List */}
                <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#6b7280' }}>
                        Mis Mensajes ({mensajes.length})
                    </h4>
                    {mensajes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                            <MessageCircle size={40} color="#d1d5db" style={{ marginBottom: '12px' }} />
                            <p style={{ margin: 0 }}>No has enviado mensajes aún</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {mensajes.map(msg => {
                                const estadoStyle = getEstadoStyle(msg.estado);
                                return (
                                    <div
                                        key={msg.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 16px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '10px',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '20px' }}>{getCategoriaIcon(msg.categoria)}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>{msg.asunto}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    {new Date(msg.created_at).toLocaleDateString('es-ES')}
                                                    {msg.prioridad === 'urgente' && <span style={{ marginLeft: '8px', color: '#dc2626' }}>🚨 Urgente</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px',
                                            backgroundColor: estadoStyle.bg,
                                            color: estadoStyle.color,
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 500
                                        }}>
                                            {estadoStyle.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FranquiciadoDashboard;
