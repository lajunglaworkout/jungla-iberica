// src/pages/dashboard/DashboardAlertsPanel.tsx
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, CheckCircle, AlertTriangle, LayoutDashboard, Plus, Calendar, History, Users } from 'lucide-react';
import { Task } from '../../types/dashboard';
import { SmartAlert } from './DashboardTypes';

interface DashboardAlertsPanelProps {
  alerts: SmartAlert[];
  canCreateMeetings: boolean;
  isCEO: boolean;
  showMeetingHistory: boolean;
  showUserManagement: boolean;
  onNewTask: () => void;
  onNewMeeting: () => void;
  onToggleMeetingHistory: () => void;
  onToggleUserManagement: () => void;
  onShowIncidentModal: () => void;
  onAlertClick: (alert: SmartAlert) => void;
}

export const DashboardAlertsPanel: React.FC<DashboardAlertsPanelProps> = ({
  alerts, canCreateMeetings, isCEO,
  showMeetingHistory, showUserManagement,
  onNewTask, onNewMeeting, onToggleMeetingHistory, onToggleUserManagement,
  onShowIncidentModal, onAlertClick,
}) => (
  <div className="alerts-container">
    <div className="alerts-panel">
      {/* Alerts header */}
      <div className="alerts-header">
        <h3><Bell size={18} /> Alertas</h3>
        <span className="badge">{alerts.filter(a => !a.isRead).length}</span>
      </div>

      <div className="alerts-list">
        <div className="alert-section">
          <h4>Pendientes</h4>
          {alerts.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
              🎉 No hay notificaciones pendientes
            </div>
          ) : (
            alerts.slice(0, 4).map(alert => (
              <div
                key={alert.id}
                className={`alert ${alert.type} ${alert.isRead ? 'read' : 'unread'}`}
                role={alert.actionUrl || alert.moduleId ? 'button' : undefined}
                tabIndex={alert.actionUrl || alert.moduleId ? 0 : undefined}
                onClick={() => onAlertClick(alert)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAlertClick(alert); } }}
                style={{ cursor: alert.actionUrl || alert.moduleId ? 'pointer' : 'default' }}
              >
                <div className="alert-icon">
                  {(alert.type === 'warning' || alert.type === 'error') ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                </div>
                <div className="alert-content">
                  <div className="alert-title">
                    {alert.title}
                    {alert.department && <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px', fontWeight: 'normal' }}>• {alert.department}</span>}
                  </div>
                  <div className="alert-message">{alert.description}</div>
                  <div className="alert-time">{format(new Date(alert.createdAt), 'HH:mm', { locale: es })}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="action-buttons-section">
        <div className="action-buttons-header">
          <h3><LayoutDashboard size={18} /> Acciones Rápidas</h3>
        </div>
        <div className="action-buttons-grid">
          <button className="action-btn primary" onClick={onNewTask} style={{ backgroundColor: '#059669', color: 'white' }}>
            <Plus size={20} /><span>Nueva Tarea</span>
          </button>

          {canCreateMeetings && (
            <>
              <button className="action-btn secondary" onClick={onNewMeeting} style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                <Calendar size={20} /><span>Nueva Reunión</span>
              </button>
              <button
                className="action-btn tertiary"
                onClick={onToggleMeetingHistory}
                style={{ backgroundColor: showMeetingHistory ? '#8b5cf6' : '#f3f4f6', color: showMeetingHistory ? 'white' : '#374151' }}
              >
                <History size={20} /><span>Historial</span>
              </button>
            </>
          )}

          {isCEO && (
            <button
              className="action-btn users"
              onClick={onToggleUserManagement}
              style={{ backgroundColor: showUserManagement ? '#6366f1' : '#f3f4f6', color: showUserManagement ? 'white' : '#374151' }}
            >
              <Users size={20} /><span>Usuarios</span>
            </button>
          )}

          <button className="action-btn incidents" onClick={onShowIncidentModal} style={{ backgroundColor: '#ef4444', color: 'white' }}>
            <AlertTriangle size={20} /><span>Incidencias</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
