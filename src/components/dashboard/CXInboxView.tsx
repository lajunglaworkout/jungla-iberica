import React, { useState } from 'react';
import {
    MessageSquare, CheckCircle, XCircle, Edit3, Send,
    User, Clock, AlertTriangle, Paperclip, MoreVertical, Search,
    MapPin, Filter, RefreshCw
} from 'lucide-react';

type CenterKey = 'sevilla' | 'jerez' | 'puerto';

interface Message {
    id: string;
    center: CenterKey;
    from: string;
    avatar?: string; // Initials if no image
    preview: string;
    timestamp: string;
    status: 'pending' | 'responded' | 'archived';
    agentProposal?: {
        text: string;
        actions: string[]; // e.g., "Check Tariff", "Update Profile"
        confidence: number;
    };
    conversation: {
        from: 'user' | 'agent' | 'staff';
        text: string;
        timestamp: string;
    }[];
}

const CENTER_CONFIG: Record<CenterKey, { label: string; color: string; bg: string; border: string }> = {
    sevilla: { label: 'Sevilla', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },  // Green
    jerez: { label: 'Jerez', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },      // Blue
    puerto: { label: 'Puerto', color: '#d97706', bg: '#fffbeb', border: '#fde68a' }     // Orange
};

// Mock Data
const MOCK_MESSAGES: Message[] = [
    {
        id: '1',
        center: 'sevilla',
        from: 'Elena Medina Peñalver',
        preview: 'Hola, quiero pagar la mensualidad como Socia Fundadora...',
        timestamp: 'Hoy, 18:03',
        status: 'pending',
        agentProposal: {
            text: "Hola Elena! Muchas gracias por avisarnos. Voy a revisar tu ficha ahora mismo para confirmar tu condición de Socia Fundadora y ajustar la tarifa a los 49,50€ correspondientes. En unos minutos te confirmo. ¡Un saludo!",
            actions: ['Revisar ficha de cliente', 'Verificar tarifa Fundador'],
            confidence: 0.95
        },
        conversation: [
            {
                from: 'user',
                text: "Hola, quiero pagar la mensualidad como Socia Fundadora pero me sale 55 euros.\nCreo que yo sería 49,50 euros.\nMe podrías informar si estoy equivocada?\nGracias",
                timestamp: 'Hoy, 18:03'
            }
        ]
    },
    {
        id: '2',
        center: 'jerez',
        from: 'Alejandra Rodríguez',
        preview: '¿Cuándo empiezan las clases de yoga?',
        timestamp: 'Hoy, 11:29',
        status: 'pending',
        agentProposal: {
            text: "Hola Alejandra! Las clases de Yoga empiezan el próximo lunes a las 19:30. ¿Te gustaría que te reserve una plaza para probar? 🧘‍♀️",
            actions: [],
            confidence: 0.88
        },
        conversation: [
            {
                from: 'user',
                text: "Hola, una pregunta rápida. ¿Cuándo empiezan las clases de yoga?",
                timestamp: 'Hoy, 11:29'
            }
        ]
    },
    {
        id: '3',
        center: 'puerto',
        from: 'Jorge de Cristobal',
        preview: 'Gracias, ya lo he solucionado.',
        timestamp: 'Ayer, 09:55',
        status: 'responded',
        conversation: [
            { from: 'user', text: "No puedo reservar la clase de mañana.", timestamp: 'Ayer, 09:10' },
            { from: 'staff', text: "Hola Jorge, prueba a actualizar la app. Ya debería irte bien.", timestamp: 'Ayer, 09:45' },
            { from: 'user', text: "Gracias, ya lo he solucionado.", timestamp: 'Ayer, 09:55' }
        ]
    }
];

export const CXInboxView: React.FC = () => {
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(MOCK_MESSAGES[0].id);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending'>('pending');
    const [centerFilter, setCenterFilter] = useState<CenterKey | 'all'>('all');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        // Simulate sync delay
        setTimeout(() => setIsSyncing(false), 2000);
    };

    const filteredMessages = MOCK_MESSAGES.filter(m => {
        const matchStatus = statusFilter === 'all' || m.status === statusFilter;
        const matchCenter = centerFilter === 'all' || m.center === centerFilter;
        return matchStatus && matchCenter;
    });

    const selectedMessage = MOCK_MESSAGES.find(m => m.id === selectedMessageId);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '24px',
            height: 'calc(100vh - 200px)',
            minHeight: '600px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Sidebar List */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Inbox CX</h3>
                        <style>
                            {`
                                @keyframes spin {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                            `}
                        </style>
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: 'white',
                                color: isSyncing ? '#3b82f6' : '#6b7280',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: isSyncing ? 'default' : 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <RefreshCw
                                size={14}
                                style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }}
                            />
                            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                        </button>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Status Filter */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setStatusFilter('pending')}
                                style={{
                                    flex: 1,
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    backgroundColor: statusFilter === 'pending' ? '#eff6ff' : 'transparent',
                                    color: statusFilter === 'pending' ? '#2563eb' : '#6b7280',
                                    border: statusFilter === 'pending' ? '1px solid #bfdbfe' : '1px solid transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                Pendientes ({MOCK_MESSAGES.filter(m => m.status === 'pending').length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('all')}
                                style={{
                                    flex: 1,
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    backgroundColor: statusFilter === 'all' ? '#f3f4f6' : 'transparent',
                                    color: statusFilter === 'all' ? '#374151' : '#6b7280',
                                    border: '1px solid transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                Todos
                            </button>
                        </div>

                        {/* Center Filter */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                            <button
                                onClick={() => setCenterFilter('all')}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    borderRadius: '4px',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: centerFilter === 'all' ? '#1f2937' : 'white',
                                    color: centerFilter === 'all' ? 'white' : '#6b7280',
                                    cursor: 'pointer'
                                }}
                            >
                                Todos
                            </button>
                            {Object.entries(CENTER_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => setCenterFilter(key as CenterKey)}
                                    style={{
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        borderRadius: '4px',
                                        border: `1px solid ${config.border}`,
                                        backgroundColor: centerFilter === key ? config.bg : 'white',
                                        color: config.color,
                                        cursor: 'pointer',
                                        fontWeight: centerFilter === key ? '600' : '400'
                                    }}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filteredMessages.map(msg => (
                        <div
                            key={msg.id}
                            onClick={() => setSelectedMessageId(msg.id)}
                            style={{
                                padding: '16px',
                                borderBottom: '1px solid #f3f4f6',
                                cursor: 'pointer',
                                backgroundColor: selectedMessageId === msg.id ? '#f8fafc' : 'white',
                                borderLeft: `3px solid ${CENTER_CONFIG[msg.center].color}`,
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>{msg.from}</span>
                                <span style={{
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: CENTER_CONFIG[msg.center].bg,
                                    color: CENTER_CONFIG[msg.center].color,
                                    fontWeight: '500'
                                }}>
                                    {CENTER_CONFIG[msg.center].label}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{msg.timestamp}</span>
                            </div>
                            <p style={{
                                fontSize: '13px',
                                color: '#4b5563',
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {msg.preview}
                            </p>
                            {msg.status === 'pending' && (
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                                    <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '500' }}>Requiere acción</span>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredMessages.length === 0 && (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                            No hay mensajes que coincidan con los filtros.
                        </div>
                    )}
                </div>
            </div>

            {/* Conversation Detail */}
            {selectedMessage ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: CENTER_CONFIG[selectedMessage.center].bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: CENTER_CONFIG[selectedMessage.center].color,
                                fontWeight: 'bold',
                                border: `1px solid ${CENTER_CONFIG[selectedMessage.center].border}`
                            }}>
                                {selectedMessage.from.charAt(0)}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{selectedMessage.from}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={12} color={CENTER_CONFIG[selectedMessage.center].color} />
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                        Cliente en <strong>{CENTER_CONFIG[selectedMessage.center].label}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}>
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    {/* Chat History */}
                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
                        {selectedMessage.conversation.map((bubble, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: bubble.from === 'user' ? 'flex-start' : 'flex-end',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    maxWidth: '70%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: bubble.from === 'user' ? 'white' : '#3b82f6',
                                    color: bubble.from === 'user' ? '#1f2937' : 'white',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    borderTopLeftRadius: bubble.from === 'user' ? '0' : '12px',
                                    borderTopRightRadius: bubble.from === 'user' ? '12px' : '0'
                                }}>
                                    <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' }}>{bubble.text}</p>
                                    <span style={{
                                        display: 'block',
                                        textAlign: 'right',
                                        fontSize: '11px',
                                        opacity: 0.7,
                                        marginTop: '4px'
                                    }}>
                                        {bubble.timestamp}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Agent Proposal Area */}
                    {selectedMessage.agentProposal && selectedMessage.status === 'pending' && (
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#fffbeb',
                            borderTop: '1px solid #fcd34d'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <MessageSquare size={16} color="#d97706" />
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#d97706' }}>
                                    Propuesta del Agente (Confianza: {(selectedMessage.agentProposal.confidence * 100).toFixed(0)}%)
                                </span>
                            </div>

                            <div style={{
                                backgroundColor: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                marginBottom: '16px'
                            }}>
                                <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                                    {selectedMessage.agentProposal.text}
                                </p>
                            </div>

                            {/* Suggested Actions */}
                            {selectedMessage.agentProposal.actions.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    {selectedMessage.agentProposal.actions.map((action, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            color: '#b45309',
                                            marginBottom: '4px'
                                        }}>
                                            <AlertTriangle size={14} />
                                            <span>Acción sugerida: <strong>{action}</strong></span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}>
                                    <CheckCircle size={18} />
                                    Aprobar y Enviar
                                </button>
                                <button style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}>
                                    <Edit3 size={18} />
                                    Editar
                                </button>
                                <button style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'white',
                                    color: '#ef4444',
                                    border: '1px solid #fecaca',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}>
                                    <XCircle size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Manual Input (fallback) */}
                    {(!selectedMessage.agentProposal || selectedMessage.status !== 'pending') && (
                        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
                            <div style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '8px',
                                display: 'flex',
                                gap: '8px',
                                backgroundColor: '#f9fafb'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Escribe un mensaje..."
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        background: 'transparent',
                                        outline: 'none',
                                        fontSize: '14px'
                                    }}
                                />
                                <button style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    cursor: 'pointer'
                                }}>
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: '#9ca3af',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                }}>
                    <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>Selecciona una conversación para empezar</p>
                </div>
            )}
        </div>
    );
};
