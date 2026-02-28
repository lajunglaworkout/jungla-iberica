// src/app/AppSidebar.tsx
import React from 'react';
import { ChevronLeft, Menu, LogOut } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { AppModule } from './moduleRegistry';

interface AppSidebarProps {
  modules: AppModule[];
  selectedModule: string | null;
  sidebarOpen: boolean;
  isMobile: boolean;
  onModuleSelect: (id: string) => void;
  onToggle: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  modules, selectedModule, sidebarOpen, isMobile, onModuleSelect, onToggle,
}) => {
  const { employee, userRole, signOut } = useSession();

  const roleLabel =
    userRole === 'superadmin' ? 'CEO' :
    userRole === 'admin' ? 'Director' :
    (userRole === 'center_manager' || userRole === 'manager') ? 'Encargado' :
    'Empleado';

  return (
    <div style={{
      width: isMobile ? (sidebarOpen ? '280px' : '0px') : (sidebarOpen ? '280px' : '80px'),
      flexShrink: 0,
      backgroundColor: '#047857',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 1000,
      overflowX: 'hidden',
      height: '100vh',
      boxShadow: isMobile && sidebarOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
    }}>

      {/* Logo & toggle */}
      <div style={{ padding: sidebarOpen ? '20px' : '20px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', minWidth: sidebarOpen ? '100%' : '80px' }}>
        {sidebarOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="La Jungla Workout" style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'white', padding: '4px', flexShrink: 0 }} />
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0, whiteSpace: 'nowrap' }}>La Jungla</h1>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0, whiteSpace: 'nowrap' }}>CRM Ejecutivo</p>
            </div>
          </div>
        )}
        {(!isMobile || sidebarOpen) && (
          <button
            onClick={onToggle}
            style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#059669', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
          >
            {sidebarOpen
              ? <ChevronLeft size={20} className="text-slate-400 hover:text-white" />
              : <Menu size={24} className="text-emerald-400" />}
          </button>
        )}
      </div>

      {/* User profile */}
      {employee && (
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', minWidth: sidebarOpen ? '100%' : '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.first_name || '')}&background=059669&color=fff`}
              alt="Avatar"
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }}
            />
            {sidebarOpen && (
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0, whiteSpace: 'nowrap' }}>
                  {employee.first_name} {employee.last_name}
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap' }}>{roleLabel}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', minWidth: sidebarOpen ? '100%' : '80px' }}>
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = selectedModule === module.id;
          return (
            <button
              key={module.id}
              onClick={() => {
                if (module.onClick && typeof module.onClick === 'function') {
                  module.onClick();
                } else {
                  onModuleSelect(module.id);
                }
              }}
              style={{
                width: '100%',
                padding: sidebarOpen ? '12px 16px' : '12px',
                marginBottom: '8px',
                display: 'flex', alignItems: 'center', gap: '12px',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}`,
                borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.85)',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'; } }}
            >
              {Icon && <Icon style={{ height: '20px', width: '20px', color: isActive ? (module.color as string) : 'inherit', flexShrink: 0 }} />}
              {sidebarOpen && (
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '14px', fontWeight: isActive ? '700' : '500', color: 'inherit', margin: 0, whiteSpace: 'nowrap' }}>{module.title}</p>
                  {module.description && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0, whiteSpace: 'nowrap' }}>{module.description}</p>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', minWidth: sidebarOpen ? '100%' : '80px' }}>
        <button
          onClick={signOut}
          style={{ width: '100%', padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <LogOut style={{ height: '16px', width: '16px', flexShrink: 0 }} />
          {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>Cerrar Sesión</span>}
        </button>
        {sidebarOpen && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>v.5 rev_log</p>
          </div>
        )}
      </div>
    </div>
  );
};
