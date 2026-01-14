// src/types/notifications.ts
// Tipos para el sistema de notificaciones

export type NotificationType = 'incident' | 'event' | 'message' | 'task' | 'system' | 'vacation';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
    id: string;
    user_id: number;
    type: NotificationType;
    title: string;
    body?: string;
    link?: string;
    is_read: boolean;
    priority: NotificationPriority;
    metadata?: Record<string, any>;
    created_at: string;
    expires_at?: string;
}

export interface NotificationCreate {
    user_id: number;
    type: NotificationType;
    title: string;
    body?: string;
    link?: string;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
    expires_at?: string;
}

// Configuración de iconos y colores por tipo
export const NOTIFICATION_CONFIG: Record<NotificationType, {
    icon: string;
    color: string;
    bgColor: string;
    label: string;
}> = {
    incident: {
        icon: 'AlertTriangle',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        label: 'Incidencia'
    },
    event: {
        icon: 'Calendar',
        color: '#3b82f6',
        bgColor: '#dbeafe',
        label: 'Evento'
    },
    message: {
        icon: 'MessageSquare',
        color: '#8b5cf6',
        bgColor: '#ede9fe',
        label: 'Mensaje'
    },
    task: {
        icon: 'CheckSquare',
        color: '#10b981',
        bgColor: '#d1fae5',
        label: 'Tarea'
    },
    system: {
        icon: 'Settings',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        label: 'Sistema'
    },
    vacation: {
        icon: 'Palmtree',
        color: '#06b6d4',
        bgColor: '#cffafe',
        label: 'Vacaciones'
    }
};

// Configuración de prioridades
export const PRIORITY_CONFIG: Record<NotificationPriority, {
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    label: string;
}> = {
    low: {
        icon: 'Bell',
        color: '#9ca3af',
        bgColor: '#f9fafb',
        borderColor: '#e5e7eb',
        label: 'Baja'
    },
    normal: {
        icon: 'Bell',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        borderColor: '#bfdbfe',
        label: 'Normal'
    },
    high: {
        icon: 'AlertCircle',
        color: '#f97316',
        bgColor: '#fff7ed',
        borderColor: '#fed7aa',
        label: 'Alta'
    },
    urgent: {
        icon: 'AlertTriangle',
        color: '#ef4444',
        bgColor: '#fef2f2',
        borderColor: '#fecaca',
        label: 'Urgente'
    }
};
