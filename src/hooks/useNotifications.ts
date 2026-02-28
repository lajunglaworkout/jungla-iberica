// src/hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { useSession } from '../contexts/SessionContext';

interface Notification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { employee } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!employee?.id) return;
    
    // Cargar notificaciones iniciales (por ahora usamos ejemplos)
    loadNotifications();

    // Suscribirse a cambios en tiempo real cuando tengas la tabla
    /*
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
        filter: `empleado_id=eq.${employee.id}`
      }, (payload) => {
        handleNewNotification(payload.new as Notification);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
    */
  }, [employee?.id]);

  const loadNotifications = async () => {
    // Por ahora usamos datos de ejemplo
    const exampleNotifications: Notification[] = [
      {
        id: '1',
        titulo: 'Checklist pendiente',
        mensaje: 'Tienes un checklist de apertura sin completar',
        tipo: 'warning',
        leida: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        titulo: 'Nueva alta',
        mensaje: '5 nuevos socios esta semana',
        tipo: 'success',
        leida: false,
        created_at: new Date().toISOString()
      }
    ];
    
    setNotifications(exampleNotifications);
    setUnreadCount(exampleNotifications.filter(n => !n.leida).length);
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, leida: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
    setUnreadCount(0);
  };

  return { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  };
};