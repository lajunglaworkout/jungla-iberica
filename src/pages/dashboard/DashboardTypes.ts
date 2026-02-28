// src/pages/dashboard/DashboardTypes.ts
export interface SmartAlert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success' | 'error';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  isRead: boolean;
  department?: string;
  actionUrl?: string;
  moduleId?: string;
  hrView?: string;
  logisticsView?: string;
  taskId?: string | number;
  reviewId?: string | number;
  notificationId?: number;
}
