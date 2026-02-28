// src/pages/dashboard/useSmartAlerts.ts
import { useState, useEffect, useCallback } from 'react';
import { getPendingVacationRequestsRaw, getPendingUniformRequestsRaw, getVacationRequestsForEmployees } from '../../services/hrService';
import { getEmployeeIdsByCenter } from '../../services/userService';
import { checklistIncidentService } from '../../services/checklistIncidentService';
import { getUserNotifications } from '../../services/notificationService';
import { SmartAlert } from './DashboardTypes';

interface EmployeeForAlerts {
  id?: string;
  email?: string;
  role?: string;
  center_id?: string;
  departments?: { id: string; name: string }[];
}

export function useSmartAlerts(userRole: string | null, employee: EmployeeForAlerts | null) {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);

  const loadAlerts = useCallback(async () => {
    if (!userRole || !employee) return;

    const newAlerts: SmartAlert[] = [];
    const now = new Date().toISOString();

    try {
      if (userRole === 'admin') {
        // Solicitudes de vacaciones pendientes
        const vacationRequests = await getPendingVacationRequestsRaw();

        if (vacationRequests.length > 0) {
          const employeeNames = [...new Set(vacationRequests.map((r) => (r as Record<string, unknown>).employee_name as string))];
          const displayed = employeeNames.slice(0, 3);
          const remaining = employeeNames.length - displayed.length;
          const applicantsText = `${displayed.join(', ')}${remaining > 0 ? ` y ${remaining} más` : ''}`;
          newAlerts.push({
            id: 'vac-requests',
            title: 'Vacaciones pendientes de aprobar',
            description: `${vacationRequests.length} solicitud${vacationRequests.length === 1 ? '' : 'es'} de ${applicantsText}`,
            type: 'warning', priority: 'high', createdAt: (vacationRequests[0] as Record<string, unknown>).requested_at as string ?? now,
            isRead: false, department: 'RRHH', actionUrl: '/hr-management', moduleId: 'hr', hrView: 'vacations',
          });
        }

        // Solicitudes de uniformes pendientes
        const uniformRequests = await getPendingUniformRequestsRaw();

        if (uniformRequests.length > 0) {
          const uniformNames = [...new Set(uniformRequests.map((r) => (r as Record<string, unknown>).employee_name as string))];
          const displayed = uniformNames.slice(0, 3);
          const remaining = uniformNames.length - displayed.length;
          const applicantsText = `${displayed.join(', ')}${remaining > 0 ? ` y ${remaining} más` : ''}`;
          newAlerts.push({
            id: 'uniform-requests',
            title: 'Solicitudes de uniformes pendientes',
            description: `${uniformRequests.length} solicitud${uniformRequests.length === 1 ? '' : 'es'} de ${applicantsText}`,
            type: 'info', priority: 'high', createdAt: (uniformRequests[0] as Record<string, unknown>).requested_at as string ?? now,
            isRead: false, department: 'Logística', actionUrl: '/logistics', moduleId: 'logistics', logisticsView: 'orders',
          });
        }

        // Incidencias de checklist pendientes
        try {
          const pendingIncidents = await checklistIncidentService.getPendingIncidents();
          if (pendingIncidents && pendingIncidents.length > 0) {
            type IncidentRow = { department?: string; title: string; priority?: string; created_at?: string };
            const incidentsByDept = pendingIncidents.reduce((acc: Record<string, IncidentRow[]>, incident: IncidentRow) => {
              const dept = incident.department || 'General';
              if (!acc[dept]) acc[dept] = [];
              acc[dept].push(incident);
              return acc;
            }, {});

            const userDepts = employee?.departments ?? [];
            Object.entries(incidentsByDept).forEach(([dept, incidentList]) => {
              const hasLogistics = userDepts.some(d => d.id === 'logistics' || d.name === 'Logística');
              const hasMaintenance = userDepts.some(d => d.id === 'maintenance' || d.name === 'Mantenimiento');
              const hasHR = userDepts.some(d => d.id === 'hr' || d.name === 'RRHH' || d.name === 'Personal');
              const hasCustomerService = userDepts.some(d => d.id === 'customer_service' || d.name === 'Atención al Cliente');

              const shouldShow =
                (hasMaintenance && dept === 'Mantenimiento') ||
                (hasLogistics && dept === 'Logística') ||
                (hasHR && dept === 'Personal') ||
                (hasCustomerService && dept === 'Atención al Cliente') ||
                userRole === 'superadmin';

              if (shouldShow) {
                const titles = incidentList.slice(0, 2).map(inc => inc.title.replace('Incidencia: ', '')).join(', ');
                const remaining = incidentList.length > 2 ? ` y ${incidentList.length - 2} más` : '';
                newAlerts.push({
                  id: `incidents-${dept.toLowerCase()}`,
                  title: `${incidentList.length} Incidencia${incidentList.length === 1 ? '' : 's'} - ${dept}`,
                  description: `${titles}${remaining}`,
                  type: 'error', priority: 'high',
                  createdAt: incidentList[0].created_at || now,
                  isRead: false, department: dept,
                  actionUrl: dept === 'Mantenimiento' ? '/maintenance' : dept === 'Logística' ? '/logistics' : dept === 'Personal' ? '/hr-management' : '/incidents',
                  moduleId: dept === 'Mantenimiento' ? 'maintenance' : dept === 'Logística' ? 'logistics' : dept === 'Personal' ? 'hr' : 'incidents',
                });
              }
            });
          }
        } catch { /* incidencias no bloqueantes */ }

      } else if (userRole === 'center_manager') {
        const centerId = employee?.center_id ? Number(employee.center_id) : 9;
        const centerEmployeeIds = await getEmployeeIdsByCenter(centerId);
        if (centerEmployeeIds.length > 0) {
          const vacationRequests = await getVacationRequestsForEmployees(centerEmployeeIds);
          if (vacationRequests.length > 0) {
            newAlerts.push({
              id: 'vacation-requests',
              title: `${vacationRequests.length} Solicitud${vacationRequests.length > 1 ? 'es' : ''} de Vacaciones`,
              description: `${vacationRequests.map((r) => (r as Record<string, unknown>).employee_name as string).join(', ')} ha${vacationRequests.length > 1 ? 'n' : ''} solicitado vacaciones`,
              type: 'warning', priority: 'high', createdAt: now, isRead: false, department: 'RRHH',
            });
          }
        }

      } else if (userRole === 'superadmin') {
        try {
          const overdueIncidents = await checklistIncidentService.getOverdueIncidents();
          if (overdueIncidents && overdueIncidents.length > 0) {
            const critical = overdueIncidents.filter(i => i.priority === 'critica');
            const high = overdueIncidents.filter(i => i.priority === 'alta');
            const medium = overdueIncidents.filter(i => i.priority === 'media');
            const low = overdueIncidents.filter(i => i.priority === 'baja');
            const parts = [
              critical.length && `${critical.length} crítica${critical.length > 1 ? 's' : ''}`,
              high.length && `${high.length} alta${high.length > 1 ? 's' : ''}`,
              medium.length && `${medium.length} media${medium.length > 1 ? 's' : ''}`,
              low.length && `${low.length} baja${low.length > 1 ? 's' : ''}`,
            ].filter(Boolean).join(', ');
            newAlerts.push({
              id: 'overdue-incidents',
              title: `⚠️ ${overdueIncidents.length} Incidencia${overdueIncidents.length > 1 ? 's' : ''} Vencida${overdueIncidents.length > 1 ? 's' : ''}`,
              description: `Sin resolver: ${parts}`,
              type: 'error', priority: 'high', createdAt: overdueIncidents[0].created_at || now,
              isRead: false, department: 'Incidencias', actionUrl: '/incidents', moduleId: 'incidents',
            });
          }

          const nearDeadline = await checklistIncidentService.getIncidentsNearDeadline();
          if (nearDeadline && nearDeadline.length > 0) {
            newAlerts.push({
              id: 'near-deadline-incidents',
              title: `⏰ ${nearDeadline.length} Incidencia${nearDeadline.length > 1 ? 's' : ''} Próxima${nearDeadline.length > 1 ? 's' : ''} a Vencer`,
              description: 'Menos de 2 horas restantes',
              type: 'warning', priority: 'high', createdAt: nearDeadline[0].created_at || now,
              isRead: false, department: 'Incidencias', actionUrl: '/incidents', moduleId: 'incidents',
            });
          }
        } catch { /* no bloqueante */ }
      }

      // Notificaciones de tareas y revisiones para todos los usuarios
      if (employee?.email) {
        try {
          const result = await getUserNotifications(employee.email, true);
          if (result.success && result.notifications) {
            const taskNotifications = result.notifications.filter(n =>
              (n.type === 'task_assigned' || n.type === 'task_deadline') && n.reference_type !== 'quarterly_review'
            );
            taskNotifications.forEach(n => {
              newAlerts.push({
                id: `task-notification-${n.id}`,
                title: n.title, description: n.message,
                type: n.type === 'task_assigned' ? 'info' : 'success',
                priority: 'medium', createdAt: n.created_at, isRead: n.is_read,
                department: 'Tareas', actionUrl: '/meetings', moduleId: 'meetings',
                taskId: n.task_id, notificationId: n.id,
              });
            });

            const reviewNotifications = result.notifications.filter(n =>
              n.reference_type === 'quarterly_review' || n.type === 'review_assigned'
            );
            reviewNotifications.forEach(n => {
              const isAdminRole = ['admin', 'superadmin', 'ceo', 'logistics_director'].includes(employee?.role ?? '');
              const targetModuleId = isAdminRole ? 'logistics' : 'center-management';
              const targetView = isAdminRole ? 'quarterly' : 'inventory-review';
              newAlerts.push({
                id: `review-notification-${n.id}`,
                title: n.title, description: n.message || 'Nueva revisión asignada',
                type: 'info', priority: 'high', createdAt: n.created_at, isRead: n.is_read,
                department: isAdminRole ? 'Logística' : 'Gestión',
                actionUrl: `/${targetModuleId}`, moduleId: targetModuleId,
                logisticsView: targetView, reviewId: n.reference_id, notificationId: n.id,
              });
            });
          }
        } catch { /* no bloqueante */ }
      }
    } catch { /* error global no bloqueante */ }

    setAlerts(newAlerts);
  }, [userRole, employee]);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 120000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  return { alerts };
}
