import React from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import type { Mensaje } from './FranquiciadoTypes';

interface NewMessageState {
    categoria: string;
    asunto: string;
    mensaje: string;
    prioridad: string;
}

interface Props {
    mensajes: Mensaje[];
    showMessageForm: boolean;
    newMessage: NewMessageState;
    sendingMessage: boolean;
    onToggleForm: () => void;
    onMessageChange: (update: Partial<NewMessageState>) => void;
    onSendMessage: () => void;
    getCategoriaIcon: (cat: string) => string;
    getEstadoStyle: (estado: string) => { bg: string; color: string; text: string };
}

const CATEGORIES = [
    { id: 'informacion', label: 'Información', icon: '💬', color: 'blue' },
    { id: 'propuesta', label: 'Propuesta', icon: '💡', color: 'amber' },
    { id: 'incidencia', label: 'Incidencia', icon: '🚨', color: 'red' }
];

const PRIORITIES = [
    { id: 'baja', label: 'Baja', color: 'gray' },
    { id: 'normal', label: 'Normal', color: 'blue' },
    { id: 'alta', label: 'Alta', color: 'red' }
];

const FranquiciadoMessaging: React.FC<Props> = ({
    mensajes, showMessageForm, newMessage, sendingMessage,
    onToggleForm, onMessageChange, onSendMessage, getCategoriaIcon, getEstadoStyle
}) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <MessageCircle size={16} className="text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Mensajes</span>
            </div>
            <button
                onClick={onToggleForm}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${showMessageForm
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
            >
                {showMessageForm ? 'Cancelar' : '+ Nuevo Mensaje'}
            </button>
        </div>

        {showMessageForm ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Category Selection */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Tipo de mensaje
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => onMessageChange({ categoria: cat.id })}
                                className={`p-3 rounded-lg border-2 text-center transition-all ${newMessage.categoria === cat.id
                                    ? cat.color === 'blue' ? 'border-blue-500 bg-blue-50'
                                        : cat.color === 'amber' ? 'border-amber-500 bg-amber-50'
                                            : 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <span className="text-xl mb-1 block">{cat.icon}</span>
                                <span className={`text-xs font-semibold ${newMessage.categoria === cat.id
                                    ? cat.color === 'blue' ? 'text-blue-700'
                                        : cat.color === 'amber' ? 'text-amber-700'
                                            : 'text-red-700'
                                    : 'text-gray-600'
                                    }`}>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority Selection */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Prioridad
                    </label>
                    <div className="flex gap-2">
                        {PRIORITIES.map((pri) => (
                            <button
                                key={pri.id}
                                onClick={() => onMessageChange({ prioridad: pri.id })}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${newMessage.prioridad === pri.id
                                    ? pri.color === 'gray' ? 'bg-gray-600 text-white'
                                        : pri.color === 'blue' ? 'bg-blue-600 text-white'
                                            : 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {pri.id === 'alta' && '🔥 '}{pri.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subject */}
                <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Asunto
                    </label>
                    <input
                        type="text"
                        value={newMessage.asunto}
                        onChange={(e) => onMessageChange({ asunto: e.target.value })}
                        placeholder="Escribe un asunto breve..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                </div>

                {/* Message */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Mensaje
                    </label>
                    <textarea
                        value={newMessage.mensaje}
                        onChange={(e) => onMessageChange({ mensaje: e.target.value })}
                        placeholder="Describe tu mensaje en detalle..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                    />
                </div>

                {/* Send Button */}
                <button
                    onClick={onSendMessage}
                    disabled={sendingMessage || !newMessage.asunto.trim() || !newMessage.mensaje.trim()}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {sendingMessage ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send size={16} />
                            Enviar Mensaje
                        </>
                    )}
                </button>
            </div>
        ) : (
            <div className="space-y-2">
                {mensajes.slice(0, 3).map(msg => (
                    <div key={msg.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{getCategoriaIcon(msg.categoria)}</span>
                            <div>
                                <div className="font-medium text-gray-900 text-sm">{msg.asunto}</div>
                                <div className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</div>
                            </div>
                        </div>
                        <span
                            className="text-xs px-2 py-1 rounded-full font-medium"
                            style={{
                                backgroundColor: getEstadoStyle(msg.estado).bg,
                                color: getEstadoStyle(msg.estado).color
                            }}
                        >
                            {getEstadoStyle(msg.estado).text}
                        </span>
                    </div>
                ))}
                {mensajes.length === 0 && (
                    <div className="text-center py-6">
                        <MessageCircle size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">Sin mensajes</p>
                        <button
                            onClick={onToggleForm}
                            className="text-xs text-emerald-600 font-medium mt-2 hover:underline"
                        >
                            Enviar tu primer mensaje
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
);

export default FranquiciadoMessaging;
