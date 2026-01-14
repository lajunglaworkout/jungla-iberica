// src/components/notifications/NotificationPanel.tsx
// Panel desplegable de notificaciones con diseño premium

import React, { useState, useRef, useEffect } from 'react';
import {
    Bell,
    AlertTriangle,
    AlertCircle,
    Calendar,
    MessageSquare,
    CheckSquare,
    Settings,
    Palmtree,
    Check,
    CheckCheck,
    Trash2,
    X,
    ExternalLink
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { AppNotification, NOTIFICATION_CONFIG, PRIORITY_CONFIG, NotificationType } from '../../types/notifications';

// Mapeo de iconos
const ICON_MAP: Record<string, React.ElementType> = {
    Bell,
    AlertTriangle,
    AlertCircle,
    Calendar,
    MessageSquare,
    CheckSquare,
    Settings,
    Palmtree
};

// Función para formatear fecha relativa
const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

// Agrupar notificaciones por fecha
const groupNotificationsByDate = (notifications: AppNotification[]): Record<string, AppNotification[]> => {
    const groups: Record<string, AppNotification[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    notifications.forEach(notification => {
        const date = new Date(notification.created_at).toDateString();
        let groupKey: string;

        if (date === today) {
            groupKey = 'Hoy';
        } else if (date === yesterday) {
            groupKey = 'Ayer';
        } else {
            groupKey = new Date(notification.created_at).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(notification);
    });

    return groups;
};

interface NotificationItemProps {
    notification: AppNotification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onNavigate?: (link: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
    onDelete,
    onNavigate
}) => {
    const typeConfig = NOTIFICATION_CONFIG[notification.type];
    const priorityConfig = PRIORITY_CONFIG[notification.priority];
    const IconComponent = ICON_MAP[typeConfig.icon] || Bell;

    const handleClick = () => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        if (notification.link && onNavigate) {
            onNavigate(notification.link);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
        group relative p-3 rounded-lg cursor-pointer transition-all duration-200
        ${notification.is_read
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-blue-50/50 hover:bg-blue-50 border-l-4 border-blue-500'
                }
      `}
            style={{
                borderColor: !notification.is_read ? priorityConfig.borderColor : undefined
            }}
        >
            <div className="flex gap-3">
                {/* Icono del tipo */}
                <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: typeConfig.bgColor }}
                >
                    <IconComponent size={18} style={{ color: typeConfig.color }} />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                                {notification.title}
                            </p>
                            {notification.body && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {notification.body}
                                </p>
                            )}
                        </div>

                        {/* Badge de prioridad para alta/urgente */}
                        {(notification.priority === 'high' || notification.priority === 'urgent') && (
                            <span
                                className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded"
                                style={{
                                    backgroundColor: priorityConfig.bgColor,
                                    color: priorityConfig.color
                                }}
                            >
                                {priorityConfig.label}
                            </span>
                        )}
                    </div>

                    {/* Footer con tipo y tiempo */}
                    <div className="flex items-center justify-between mt-2">
                        <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                        >
                            {typeConfig.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {formatRelativeTime(notification.created_at)}
                        </span>
                    </div>
                </div>

                {/* Acciones hover */}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            title="Marcar como leída"
                        >
                            <Check size={14} />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                        className="p-1 hover:bg-red-100 rounded text-red-500"
                        title="Eliminar"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: (moduleId: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, onNavigate }) => {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [filter, setFilter] = useState<NotificationType | 'all'>('all');
    const panelRef = useRef<HTMLDivElement>(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Filtrar notificaciones
    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => n.type === filter);

    // Agrupar por fecha
    const groupedNotifications = groupNotificationsByDate(filteredNotifications);

    return (
        <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 w-96 max-h-[80vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Bell className="text-emerald-600" size={20} />
                        <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                            >
                                <CheckCheck size={14} />
                                Marcar todas
                            </button>
                        )}
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                            <X size={16} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-1 overflow-x-auto pb-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Todas
                    </button>
                    {Object.entries(NOTIFICATION_CONFIG).map(([type, config]) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type as NotificationType)}
                            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${filter === type ? 'text-white' : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            style={{
                                backgroundColor: filter === type ? config.color : '#f3f4f6'
                            }}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell className="mx-auto text-gray-300 mb-3" size={40} />
                        <p className="text-gray-500 font-medium">Sin notificaciones</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {filter === 'all'
                                ? 'No tienes notificaciones pendientes'
                                : `No hay notificaciones de tipo "${NOTIFICATION_CONFIG[filter].label}"`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="p-2">
                        {Object.entries(groupedNotifications).map(([date, items]) => (
                            <div key={date} className="mb-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                                    {date}
                                </p>
                                <div className="space-y-1">
                                    {items.map(notification => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={markAsRead}
                                            onDelete={deleteNotification}
                                            onNavigate={onNavigate}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-3 text-center">
                    <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                        Ver historial completo
                    </button>
                </div>
            )}
        </div>
    );
};

// Componente del botón de campana con contador
interface NotificationBellProps {
    onClick: () => void;
    isOpen: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick, isOpen }) => {
    const { unreadCount } = useNotifications();

    return (
        <button
            onClick={onClick}
            className={`
        relative p-2 rounded-lg transition-all duration-200
        ${isOpen
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
      `}
        >
            <Bell size={20} className={unreadCount > 0 ? 'animate-pulse' : ''} />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full px-1.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationPanel;
