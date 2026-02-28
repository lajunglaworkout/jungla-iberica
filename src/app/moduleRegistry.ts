// src/app/moduleRegistry.ts
// Registro centralizado de módulos y lógica de acceso por rol.
import React from 'react';
import {
  LayoutDashboard, ListTodo, Calendar, Brain, Shield, BookOpen,
  Users, Package, AlertTriangle, Globe, Building2, DollarSign,
  ClipboardList, GraduationCap,
} from 'lucide-react';

import DashboardPage from '../pages/DashboardPage';
import MyTasksPage from '../pages/MyTasksPage';
import MeetingsMainPage from '../pages/MeetingsMainPage';
import IntelligentExecutiveDashboard from '../components/IntelligentExecutiveDashboard';
import { UserManagementSystem } from '../components/admin/UserManagementSystem';
import { ProjectHistoryView } from '../components/admin/ProjectHistoryView';
import HRManagementSystem from '../components/HRManagementSystem';
import LogisticsManagementSystem from '../components/LogisticsManagementSystem';
import MaintenanceModule from '../components/MaintenanceModule';
import { MarketingDashboard } from '../components/marketing/MarketingDashboard';
import BrandAccountingModule from '../components/accounting/BrandAccountingModule';
import { AcademyDashboard } from '../components/academy/Dashboard/AcademyDashboard';
import { OnlineDashboard } from '../components/online/OnlineDashboard';
import { EventsDashboard } from '../components/events/EventsDashboard';
import CenterManagement from '../components/centers/CenterManagement';

export interface AppModule {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number }>;
  color?: string;
  component?: React.ComponentType<Record<string, unknown>>;
  available?: boolean;
  onClick?: () => void;
  hasSubmenu?: boolean;
  hideBilling?: boolean;
  isDefault?: boolean;
  [key: string]: unknown;
}

interface EmployeeWithDepts {
  center_id?: string;
  departments?: { id: string; name: string }[];
  [key: string]: unknown;
}

const BASE_MODULES: AppModule[] = [
  { id: 'main-dashboard', title: 'Dashboard', description: 'Vista general del sistema', icon: LayoutDashboard, color: '#3b82f6', component: DashboardPage as React.ComponentType<Record<string, unknown>>, available: true, isDefault: true },
  { id: 'my-tasks', title: 'Mis Tareas', description: 'Gestiona tus tareas pendientes', icon: ListTodo, color: '#8b5cf6', component: MyTasksPage as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'meetings', title: 'Reuniones', description: 'Gestión de reuniones y calendario', icon: Calendar, color: '#059669', component: MeetingsMainPage as React.ComponentType<Record<string, unknown>>, available: true },
];

const CEO_MODULES: AppModule[] = [
  { id: 'intelligent', title: 'Dashboard Inteligente', description: 'Sistema con IA predictiva y KPIs críticos', icon: Brain, color: '#7c3aed', component: IntelligentExecutiveDashboard as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'admin-users', title: 'Gestión de Accesos', description: 'Alta de usuarios, centros y permisos', icon: Shield, color: '#10b981', component: UserManagementSystem as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'project-history', title: 'Biblia del Proyecto', description: 'Historial técnico, métricas de calidad y decisiones de arquitectura', icon: BookOpen, color: '#1e3a5f', component: ProjectHistoryView as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'hr', title: 'RRHH y Procedimientos', description: 'Gestión de empleados y procedimientos', icon: Users, color: '#059669', component: HRManagementSystem as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'logistics', title: 'Logística', description: 'Gestión de vestuario y pedidos', icon: Package, color: '#ea580c', component: LogisticsManagementSystem as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'maintenance', title: 'Mantenimiento', description: 'Inspecciones mensuales y mantenimiento', icon: AlertTriangle, color: '#dc2626', component: MaintenanceModule as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'marketing', title: 'Marketing', description: 'Contenido y publicaciones', icon: Globe, color: '#dc2626', component: MarketingDashboard as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'centers', title: 'Centros', description: 'Gestión de centros deportivos', icon: Building2, color: '#0891b2', component: undefined, available: true, hasSubmenu: true },
  { id: 'brand-management', title: 'Gestión de Marca', description: 'Gestión financiera de la marca', icon: DollarSign, color: '#8b5cf6', component: BrandAccountingModule as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'incidents', title: 'Incidencias', description: 'Ausencias, vacaciones y solicitudes', icon: ClipboardList, color: '#7c2d12', component: undefined, available: true },
  { id: 'academy', title: 'Academy', description: 'Gestión de formación', icon: GraduationCap, color: '#CDDC39', component: AcademyDashboard as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'online', title: 'La Jungla Online', description: 'Gestión de contenido online', icon: Globe, color: '#2563eb', component: OnlineDashboard as React.ComponentType<Record<string, unknown>>, available: true },
  { id: 'events', title: 'Eventos', description: 'Gestión de eventos', icon: Calendar, color: '#7c2d12', component: EventsDashboard as React.ComponentType<Record<string, unknown>>, available: true },
];

export function getAvailableModules(
  userRole: string | null,
  employee: EmployeeWithDepts | null,
): AppModule[] {
  const isCEO = userRole === 'superadmin' || userRole === 'ceo';
  const isAdmin = ['admin', 'superadmin', 'ceo', 'logistics_director'].includes(userRole ?? '');
  const isCenterManager = userRole === 'center_manager';

  if (isCEO) return [...BASE_MODULES, ...CEO_MODULES];

  if (isAdmin) {
    const departments = employee?.departments ?? [];
    const hasDept = (name: string) => departments.some(d => d.name.toLowerCase().includes(name.toLowerCase()));
    const adminModules: AppModule[] = [];

    if (hasDept('logística') || hasDept('logistica')) adminModules.push({ id: 'logistics', title: 'Logística', description: 'Gestión de vestuario y pedidos', icon: Package, color: '#ea580c', component: LogisticsManagementSystem as React.ComponentType<Record<string, unknown>>, available: true });
    if (hasDept('mantenimiento')) adminModules.push({ id: 'maintenance', title: 'Mantenimiento', description: 'Inspecciones mensuales y mantenimiento', icon: AlertTriangle, color: '#dc2626', component: MaintenanceModule as React.ComponentType<Record<string, unknown>>, available: true });
    if (hasDept('rrhh') || hasDept('humanos')) adminModules.push({ id: 'hr', title: 'RRHH y Procedimientos', description: 'Gestión de empleados y procedimientos', icon: Users, color: '#059669', component: HRManagementSystem as React.ComponentType<Record<string, unknown>>, available: true });
    if (hasDept('online')) adminModules.push({ id: 'online', title: 'La Jungla Online', description: 'Gestión de contenido online', icon: Globe, color: '#2563eb', component: OnlineDashboard as React.ComponentType<Record<string, unknown>>, available: true });
    if (hasDept('eventos')) adminModules.push({ id: 'events', title: 'Eventos', description: 'Gestión de eventos', icon: Calendar, color: '#7c2d12', component: EventsDashboard as React.ComponentType<Record<string, unknown>>, available: true });
    if (hasDept('academy') || hasDept('formación')) adminModules.push({ id: 'academy', title: 'Academy', description: 'Gestión de formación', icon: GraduationCap, color: '#CDDC39', component: AcademyDashboard as React.ComponentType<Record<string, unknown>>, available: true });
    adminModules.push({ id: 'centers', title: 'Centros', description: 'Gestión de centros deportivos', icon: Building2, color: '#0891b2', component: undefined, available: true, hasSubmenu: true });

    return [...BASE_MODULES, ...adminModules];
  }

  if (isCenterManager) {
    return [
      ...BASE_MODULES,
      { id: 'center-management', title: 'Gestión', description: 'Gestión del Centro', icon: Building2, color: '#059669', component: CenterManagement as React.ComponentType<Record<string, unknown>>, available: true },
    ];
  }

  // Empleados de centro
  const departments = employee?.departments ?? [];
  const hasDept = (name: string) => departments.some(d => d.name.toLowerCase().includes(name.toLowerCase()));
  const extraModules: AppModule[] = [
    { id: 'center-management', title: 'Gestión del Centro', description: 'Tu centro de trabajo', icon: Building2, color: '#059669', component: CenterManagement as React.ComponentType<Record<string, unknown>>, available: true },
  ];
  if (hasDept('online')) extraModules.push({ id: 'online', title: 'La Jungla Online', description: 'Gestión de contenido online', icon: Globe, color: '#2563eb', component: OnlineDashboard as React.ComponentType<Record<string, unknown>>, available: true, hideBilling: true });
  if (hasDept('eventos')) extraModules.push({ id: 'events', title: 'Eventos', description: 'Gestión de eventos', icon: Calendar, color: '#7c2d12', component: EventsDashboard as React.ComponentType<Record<string, unknown>>, available: true });

  return [...BASE_MODULES, ...extraModules];
}
