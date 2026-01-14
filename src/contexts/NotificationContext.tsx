// src/contexts/NotificationContext.tsx
// Contexto global para el sistema de notificaciones con Supabase Realtime

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from './SessionContext';
import { Notification, NotificationCreate } from '../types/notifications';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    createNotification: (data: NotificationCreate) => Promise<string | null>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { employee } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calcular notificaciones no leídas
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Obtener notificaciones del usuario
    const fetchNotifications = useCallback(async () => {
        if (!employee?.id) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', employee.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (fetchError) throw fetchError;

            setNotifications(data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    }, [employee?.id]);

    // Marcar una notificación como leída
    const markAsRead = useCallback(async (id: string) => {
        try {
            const { error: updateError } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (updateError) throw updateError;

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    }, []);

    // Marcar todas como leídas
    const markAllAsRead = useCallback(async () => {
        if (!employee?.id) return;

        try {
            const { error: updateError } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', employee.id)
                .eq('is_read', false);

            if (updateError) throw updateError;

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    }, [employee?.id]);

    // Eliminar notificación
    const deleteNotification = useCallback(async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    }, []);

    // Crear nueva notificación
    const createNotification = useCallback(async (data: NotificationCreate): Promise<string | null> => {
        try {
            const { data: newNotification, error: insertError } = await supabase
                .from('notifications')
                .insert({
                    ...data,
                    priority: data.priority || 'normal',
                    is_read: false
                })
                .select()
                .single();

            if (insertError) throw insertError;

            return newNotification?.id || null;
        } catch (err) {
            console.error('Error creating notification:', err);
            return null;
        }
    }, []);

    // Cargar notificaciones al iniciar y cuando cambie el empleado
    useEffect(() => {
        if (employee?.id) {
            fetchNotifications();
        }
    }, [employee?.id, fetchNotifications]);

    // Suscripción a Supabase Realtime
    useEffect(() => {
        if (!employee?.id) return;

        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${employee.id}`
                },
                (payload) => {
                    console.log('🔔 Nueva notificación recibida:', payload.new);
                    const newNotification = payload.new as Notification;
                    setNotifications(prev => [newNotification, ...prev]);

                    // Opcional: Reproducir sonido o mostrar toast
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(newNotification.title, {
                            body: newNotification.body || '',
                            icon: '/logo.png'
                        });
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${employee.id}`
                },
                (payload) => {
                    const updatedNotification = payload.new as Notification;
                    setNotifications(prev =>
                        prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
                    );
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${employee.id}`
                },
                (payload) => {
                    const deletedId = (payload.old as any).id;
                    setNotifications(prev => prev.filter(n => n.id !== deletedId));
                }
            )
            .subscribe();

        // Solicitar permiso para notificaciones del navegador
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, [employee?.id]);

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
