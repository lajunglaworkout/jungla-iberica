// src/contexts/SessionContext.tsx - Versión Completa Integrada
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { 
  UserRole, 
  getAdvancedRole, 
  getRoleConfig, 
  hasPermission as checkPermission,
  hasBusinessUnitAccess,
  type EmployeeWithRole,
  type RolePermissions,
  type DashboardConfig,
  BusinessUnit
} from '../types';

interface SessionContextType {
  user: User | null;
  session: Session | null;
  employee: EmployeeWithRole | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  
  // Sistema de Roles
  userRole: UserRole | null;
  permissions: RolePermissions | null;
  dashboardConfig: DashboardConfig | null;
  
  // Funciones de permisos
  hasPermission: (permission: keyof RolePermissions) => boolean;
  canAccessBusinessUnit: (businessUnit: BusinessUnit) => boolean;
  canViewAllCenters: () => boolean;
  canManageUsers: () => boolean | string;
  canViewFinancials: () => boolean | string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [employee, setEmployee] = useState<EmployeeWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar datos del empleado con rol avanzado
  const loadEmployeeData = async (userId: string): Promise<EmployeeWithRole | null> => {
    try {
      console.log('🔍 Cargando datos del empleado para user_id:', userId);
      
      const { data: employeeData, error } = await supabase
        .from('employees')
        .select(`
          *,
          center:centers(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('⚠️ No se encontró empleado para user_id:', userId);
          setError('Usuario no encontrado en el sistema');
        } else {
          console.error('❌ Error cargando empleado:', error);
          setError('Error cargando datos del usuario');
        }
        return null;
      }

      if (!employeeData) {
        console.warn('⚠️ No hay datos de empleado para user_id:', userId);
        setError('Datos de usuario no disponibles');
        return null;
      }

      // Calcular rol avanzado
      const advancedRole = getAdvancedRole(employeeData.role, employeeData);
      
      // Obtener configuración completa
      const roleConfig = getRoleConfig(advancedRole);

      // Crear empleado extendido
      const employeeWithRole: EmployeeWithRole = {
        ...employeeData,
        advancedRole,
        permissions: roleConfig.permissions,
        dashboardConfig: roleConfig.config
      };

      console.log('✅ Empleado cargado exitosamente:', {
        name: employeeWithRole.name,
        email: employeeWithRole.email,
        dbRole: employeeWithRole.role,
        advancedRole: employeeWithRole.advancedRole,
        centerName: employeeWithRole.center?.name || 'Sin centro',
        centerType: employeeWithRole.center?.type || 'N/A'
      });

      setError(null);
      return employeeWithRole;
    } catch (error) {
      console.error('💥 Error inesperado cargando empleado:', error);
      setError('Error inesperado del sistema');
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error obteniendo sesión:', error);
          setError('Error de autenticación');
        } else if (session?.user && isMounted) {
          setSession(session);
          setUser(session.user);
          
          // Cargar datos del empleado
          const employeeData = await loadEmployeeData(session.user.id);
          if (isMounted) {
            setEmployee(employeeData);
          }
        }
      } catch (error) {
        console.error('💥 Error inesperado obteniendo sesión:', error);
        setError('Error del sistema');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              console.log('✅ Usuario iniciando sesión');
              const employeeData = await loadEmployeeData(session.user.id);
              if (isMounted) {
                setEmployee(employeeData);
              }
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('👋 Usuario cerrando sesión');
            if (isMounted) {
              setEmployee(null);
              setError(null);
            }
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token renovado');
            break;
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Cleanup
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        let errorMessage = 'Error de autenticación';
        
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Credenciales incorrectas';
            break;
          case 'Email not confirmed':
            errorMessage = 'Email no confirmado';
            break;
          default:
            errorMessage = error.message;
        }
        
        setError(errorMessage);
        return { error: { message: errorMessage } };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = 'Error inesperado durante el login';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setEmployee(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error al cerrar sesión:', error);
        setError('Error cerrando sesión');
      }
    } catch (error) {
      console.error('💥 Error inesperado al cerrar sesión:', error);
      setError('Error inesperado');
    }
  };

  // ===== FUNCIONES DE PERMISOS =====
  const hasPermissionCheck = (permission: keyof RolePermissions): boolean => {
    if (!employee?.permissions) return false;
    return checkPermission(employee.advancedRole, permission);
  };

  const canAccessBusinessUnitCheck = (businessUnit: BusinessUnit): boolean => {
    if (!employee?.advancedRole) return false;
    return hasBusinessUnitAccess(employee.advancedRole, businessUnit);
  };

  const canViewAllCenters = (): boolean => {
    return hasPermissionCheck('canViewAllCenters');
  };

  const canManageUsers = (): boolean | string => {
    if (!employee?.permissions) return false;
    return employee.permissions.canManageUsers;
  };

  const canViewFinancials = (): boolean | string => {
    if (!employee?.permissions) return false;
    return employee.permissions.canViewFinancials;
  };

  const value: SessionContextType = {
    user,
    session,
    employee,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user && !!session && !!employee,
    
    // Sistema de Roles
    userRole: employee?.advancedRole || null,
    permissions: employee?.permissions || null,
    dashboardConfig: employee?.dashboardConfig || null,
    
    // Funciones de permisos
    hasPermission: hasPermissionCheck,
    canAccessBusinessUnit: canAccessBusinessUnitCheck,
    canViewAllCenters,
    canManageUsers,
    canViewFinancials
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
    throw new Error('useSession debe ser usado dentro de un SessionProvider');
  }
  return context;
};