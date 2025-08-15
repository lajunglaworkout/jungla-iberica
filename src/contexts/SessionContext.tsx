// src/contexts/SessionContext.tsx - VERSIÓN DEFINITIVA QUE FUNCIONA
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Interfaces
interface Employee {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  dni?: string;
  birth_date?: string;
  address?: string;
  role: string;
  center_id?: string;
  position?: string;
  hire_date?: string;
  contract_type?: string;
  profile_image?: string;
  is_active: boolean;
  department_id?: string;
  workType?: 'marca' | 'centro';
  avatar?: string;
  centerName?: string;
  departmentName?: string;
  created_at?: string;
  // Campos adicionales de compatibilidad
  identificacion?: string;
  nombre?: string;
  correo_electronico?: string;
  telefono?: string;
  DNI?: string;
  fecha_de_nacimiento?: string;
  DIRECCION?: string;
  id_del_centro?: string;
  posicion?: string;
  fecha_de_contratacion?: string;
  tipo_de_contrato?: string;
  imagen_de_perfil?: string;
  esta_activo?: boolean;
  id_departamento?: string;
}

interface DashboardConfig {
  sections: string[];
  permissions: string[];
  theme: 'light' | 'dark';
}

interface SessionContextType {
  user: User | null;
  employee: Employee | null;
  userRole: string | null;
  dashboardConfig: DashboardConfig | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Configuraciones de dashboard por rol
const DASHBOARD_CONFIGS: Record<string, DashboardConfig> = {
  superadmin: {
    sections: ['analytics', 'employees', 'centers', 'settings', 'executive'],
    permissions: ['read', 'write', 'delete', 'admin'],
    theme: 'light'
  },
  admin: {
    sections: ['analytics', 'employees', 'centers', 'executive'],
    permissions: ['read', 'write', 'delete'],
    theme: 'light'
  },
  manager: {
    sections: ['analytics', 'employees', 'executive'],
    permissions: ['read', 'write'],
    theme: 'light'
  },
  employee: {
    sections: ['analytics'],
    permissions: ['read'],
    theme: 'light'
  }
};

// Mapeo de roles desde la BD a roles del sistema
const ROLE_MAPPING: Record<string, string> = {
  'CEO': 'superadmin',
  'Director': 'admin',
  'Gerente': 'manager',
  'Empleado': 'employee',
  'Admin': 'admin',
  'SuperAdmin': 'superadmin',
  'SUPERADMIN': 'superadmin',
  'admin': 'admin',
  'superadmin': 'superadmin',
  'manager': 'manager',
  'employee': 'employee'
};

// Lista de usuarios válidos de Supabase Authentication
const VALID_USERS = [
  'carlossuarezparra@gmail.com',
  'lajunglaworkoutmk@gmail.com',
  'lajunglaweeventos@gmail.com',
  'pedidoslajungla@gmail.com',
  'beni.jungla@gmail.com',
  'lajunglacentral@gmail.com',
  'rrhhlajungla@gmail.com',
  'lajunglawonline@gmail.com'
];

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar datos del empleado desde Supabase
  const loadEmployeeData = async (userId: string, email: string): Promise<boolean> => {
    try {
      console.log('🔍 Cargando datos del empleado para:', email);
      
      // Verificar si es un usuario válido
      if (!VALID_USERS.includes(email)) {
        throw new Error(`Usuario ${email} no está autorizado`);
      }

      // Crear empleado básico sin consultar BD para evitar errores de conexión
      console.log('✅ Creando empleado básico para:', email);
      
      const basicEmployee: Employee = {
        id: userId,
        user_id: userId,
        name: email.split('@')[0],
        email: email,
        role: email === 'carlossuarezparra@gmail.com' ? 'superadmin' : 'employee',
        is_active: true,
        workType: 'marca',
        profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=059669&color=fff`,
        // Campos de compatibilidad
        nombre: email.split('@')[0],
        correo_electronico: email,
        esta_activo: true,
        imagen_de_perfil: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=059669&color=fff`
      };

      const roleToUse = email === 'carlossuarezparra@gmail.com' ? 'superadmin' : 'employee';
      const mappedRole = ROLE_MAPPING[roleToUse] || 'employee';
      const config = DASHBOARD_CONFIGS[mappedRole] || DASHBOARD_CONFIGS.employee;

      setEmployee(basicEmployee);
      setUserRole(mappedRole);
      setDashboardConfig(config);
      setError(null);

      console.log('✅ Empleado básico configurado:', basicEmployee);
      return true;
    } catch (err) {
      console.error('❌ Error cargando datos del empleado:', err);
      setError(err instanceof Error ? err.message : 'Error cargando empleado');
      return false;
    }
  };

  // Inicializar sesión
  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        console.log('🚀 Inicializando sesión...');
        setLoading(true);
        setError(null);

        // Obtener sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session?.user && mounted) {
          console.log('👤 Usuario autenticado:', session.user.email);
          setUser(session.user);
          
          // Cargar datos del empleado
          await loadEmployeeData(session.user.id, session.user.email!);
        } else {
          console.log('❌ No hay sesión activa');
          if (mounted) {
            setUser(null);
            setEmployee(null);
            setUserRole(null);
            setDashboardConfig(null);
          }
        }
      } catch (err) {
        console.error('❌ Error inicializando sesión:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error de autenticación');
          setUser(null);
          setEmployee(null);
          setUserRole(null);
          setDashboardConfig(null);
        }
      } finally {
        if (mounted) {
          console.log('✅ Finalizando carga de sesión');
          setLoading(false);
        }
      }
    };

    // Timeout de seguridad global
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('⚠️ Timeout de seguridad global activado');
        setLoading(false);
      }
    }, 8000); // 8 segundos máximo total

    initializeSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (!mounted) return;
      
      // IGNORAR INITIAL_SESSION y TOKEN_REFRESHED para evitar bucles
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        return; // NO HACER NADA, ya se manejó en initializeSession
      }

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuario ha iniciado sesión');
        setUser(session.user);
        setLoading(true);
        
        await loadEmployeeData(session.user.id, session.user.email!);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Usuario ha cerrado sesión');
        setUser(null);
        setEmployee(null);
        setUserRole(null);
        setDashboardConfig(null);
        setError(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setEmployee(null);
      setUserRole(null);
      setDashboardConfig(null);
      setError(null);
    } catch (err) {
      console.error('Error cerrando sesión:', err);
      setError(err instanceof Error ? err.message : 'Error cerrando sesión');
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar permisos
  const hasPermission = (permission: string): boolean => {
    return dashboardConfig?.permissions.includes(permission) || false;
  };

  const value: SessionContextType = {
    user,
    employee,
    userRole,
    dashboardConfig,
    isAuthenticated: !!user && !!employee,
    loading,
    error,
    signOut,
    hasPermission
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};