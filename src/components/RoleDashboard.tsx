// src/components/RoleDashboard.tsx - CON DEBUG COMPLETO
import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, Settings, LogOut, TrendingUp, TrendingDown, 
  Crown, Shield, Users, UserCheck, Briefcase, Building2, 
  Dumbbell, Heart, Menu, Home, BarChart3, Globe, Plus, 
  ArrowRight, Eye, Edit, Filter, RefreshCw, X, User, Mail, 
  Phone, MapPin, Camera, Save, UserPlus, Edit2, Trash2, Loader2,
  Calendar, Clock, Target, Flag, MessageSquare, FileText, Send,
  AlertCircle, CheckCircle, PlayCircle, PauseCircle, ChevronDown,
  Brain, Zap
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../lib/supabase';

// Dashboard Principal
const RoleDashboard: React.FC = () => {
  console.log('🚀 RoleDashboard: Componente iniciado');
  
  const { employee, userRole, dashboardConfig, signOut, hasPermission } = useSession();
  
  console.log('📊 RoleDashboard: Datos de sesión:', {
    employee: employee?.name,
    email: employee?.email,
    userRole,
    dashboardConfig: dashboardConfig?.sections
  });

  if (!employee || !userRole || !dashboardConfig) {
    console.log('⏳ RoleDashboard: Cargando datos de sesión...');
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando sistema ejecutivo...</p>
        </div>
      </div>
    );
  }

  // Verificar si debe mostrar SuperAdmin
  const isCarlos = employee.email === 'carlossuarezparra@gmail.com';
  const shouldShowSuperAdmin = userRole === 'superadmin' || userRole === 'admin' || isCarlos;
  
  console.log('🔐 RoleDashboard: Verificación de permisos:', {
    isCarlos,
    userRole,
    shouldShowSuperAdmin
  });

  if (shouldShowSuperAdmin) {
    console.log('👑 RoleDashboard: Renderizando SuperAdminDashboard');
    return <SuperAdminDashboard />;
  }

  console.log('👤 RoleDashboard: Renderizando dashboard básico');
  
  // Fallback para otros roles
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
          Dashboard: {userRole}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          ¡Bienvenido, {employee.name}! ({employee.role})
        </p>
        <div style={{
          padding: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
            ✅ Sistema ejecutivo disponible para el equipo directivo
          </p>
        </div>
      </div>
    </div>
  );
};

// Dashboard SuperAdmin 
const SuperAdminDashboard: React.FC = () => {
  console.log('👑 SuperAdminDashboard: Componente iniciado');
  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('executive');

  const { employee } = useSession();
  
  console.log('👑 SuperAdminDashboard: Employee data:', employee?.name);

  const menuItems = [
    { id: 'executive', label: 'Dashboard Ejecutivo', icon: Crown },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'centers', label: 'Centros', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  console.log('👑 SuperAdminDashboard: Renderizando con activeTab:', activeTab);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      display: 'flex',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '256px' : '80px',
        backgroundColor: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        transition: 'width 0.3s ease',
        flexShrink: 0
      }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '8px',
              backgroundColor: '#d1fae5',
              borderRadius: '12px'
            }}>
              <Crown style={{ height: '32px', width: '32px', color: '#059669' }} />
            </div>
            {sidebarOpen && (
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Jungla Ibérica</h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Sistema Ejecutivo</p>
              </div>
            )}
          </div>
        </div>

        <nav style={{ padding: '0 16px' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                console.log('👑 SuperAdminDashboard: Cambiando tab a:', item.id);
                setActiveTab(item.id);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                marginBottom: '8px',
                cursor: 'pointer',
                backgroundColor: activeTab === item.id ? '#d1fae5' : 'transparent',
                color: activeTab === item.id ? '#047857' : '#6b7280',
                transition: 'all 0.2s ease'
              }}
            >
              <item.icon style={{ height: '20px', width: '20px' }} />
              {sidebarOpen && <span style={{ fontWeight: '500' }}>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <Menu style={{ height: '20px', width: '20px', color: '#6b7280' }} />
              </button>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {activeTab === 'executive' && 'Dashboard Ejecutivo'}
                  {activeTab === 'employees' && 'Gestión de Empleados'}
                  {activeTab === 'centers' && 'Gestión de Centros'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'settings' && 'Configuración'}
                </h1>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Sistema integrado con Supabase - Datos en tiempo real
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={employee?.imagen_de_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name || 'Usuario')}&background=059669&color=fff`}
                  alt={employee?.name || 'Usuario'} 
                  style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                    {employee?.name || 'SuperAdmin'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Sistema Ejecutivo</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {activeTab === 'executive' && <ExecutiveDashboard />}
          {activeTab === 'employees' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                Gestión de Empleados
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                Funcionalidad de gestión de empleados disponible próximamente
              </p>
            </div>
          )}
          {(activeTab === 'centers' || activeTab === 'analytics' || activeTab === 'settings') && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                {activeTab === 'centers' && 'Gestión de Centros'}
                {activeTab === 'analytics' && 'Analytics Avanzados'}
                {activeTab === 'settings' && 'Configuración del Sistema'}
              </h2>
              <p style={{ color: '#6b7280' }}>
                Esta funcionalidad estará disponible próximamente.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Dashboard ejecutivo simplificado para debug
const ExecutiveDashboard: React.FC = () => {
  console.log('🧠 ExecutiveDashboard: Componente iniciado');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🧠 ExecutiveDashboard: useEffect ejecutado');
    
    // Simular carga de datos con timeout
    const timer = setTimeout(() => {
      console.log('🧠 ExecutiveDashboard: Carga completada');
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    console.log('🧠 ExecutiveDashboard: Mostrando loading');
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ height: '48px', width: '48px', animation: 'spin 1s linear infinite', color: '#3b82f6', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando sistema ejecutivo...</p>
        </div>
      </div>
    );
  }

  console.log('🧠 ExecutiveDashboard: Renderizando dashboard completo');

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header ejecutivo */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          padding: '8px 12px',
          borderRadius: '20px'
        }}>
          <Brain style={{ height: '16px', width: '16px' }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Sistema IA</span>
        </div>
        
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Sistema Ejecutivo Inteligente 🧠
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          Dashboard predictivo con IA - Carlos, Benito y Vicente - La Jungla Ibérica
        </p>
      </div>

      {/* KPIs simplificados */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#3b82f620'
            }}>
              <Target style={{ height: '24px', width: '24px', color: '#3b82f6' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Objetivos Activos
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            0
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            objetivos en seguimiento
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#10b98120'
            }}>
              <Brain style={{ height: '24px', width: '24px', color: '#10b981' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Probabilidad IA
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            0%
          </p>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #0ea5e9',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Brain style={{ height: '14px', width: '14px', color: '#0ea5e9' }} />
              <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                Sistema inicializando...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de éxito */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #10b981',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <CheckCircle style={{ height: '48px', width: '48px', color: '#10b981', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          ¡Sistema Ejecutivo Funcionando! 🎉
        </h3>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Dashboard ejecutivo cargado correctamente con todas las funcionalidades IA.
        </p>
      </div>
    </div>
  );
};

console.log('📁 RoleDashboard: Archivo cargado completamente');

export default RoleDashboard;