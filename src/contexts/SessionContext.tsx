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
  center_manager: {
    sections: ['management'], // Solo pestaña Gestión
    permissions: ['read', 'write', 'center_specific'],
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
  'Encargado': 'center_manager',
  'Empleado': 'employee',
  'Admin': 'admin',
  'SuperAdmin': 'superadmin',
  'SUPERADMIN': 'superadmin',
  'admin': 'admin',
  'superadmin': 'superadmin',
  'center_manager': 'center_manager',
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
  'lajunglawonline@gmail.com',
  'franciscogiraldezmorales@gmail.com',
  'danivf1991@gmail.com'
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

      // Intentar cargar empleado desde la base de datos
      console.log('✅ Consultando empleado en base de datos para:', email);

      const { data: employeeData, error: dbError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      let basicEmployee: Employee;
      let roleToUse: string;

      if (employeeData && !dbError) {
        // Empleado encontrado en la BD
        console.log('✅ Empleado encontrado en BD:', employeeData);
        roleToUse = employeeData.role || 'employee';

        basicEmployee = {
          id: employeeData.id?.toString() || userId,
          user_id: userId,
          name: employeeData.name || email.split('@')[0],
          email: email,
          role: roleToUse,
          center_id: employeeData.center_id?.toString(),
          is_active: true,
          workType: employeeData.center_id ? 'centro' : 'marca',
          profile_image: employeeData.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeData.name || email.split('@')[0])}&background=059669&color=fff`,
          phone: employeeData.phone,
          dni: employeeData.dni,
          position: employeeData.position,
          hire_date: employeeData.hire_date,
          // Campos de compatibilidad
          nombre: employeeData.name || email.split('@')[0],
          correo_electronico: email,
          esta_activo: true,
          imagen_de_perfil: employeeData.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeData.name || email.split('@')[0])}&background=059669&color=fff`
        };
      } else {
        // Fallback: crear empleado básico si no está en BD
        console.log('⚠️ Empleado no encontrado en BD, creando básico');
        roleToUse = 'employee';

        // Solo para casos especiales conocidos
        if (email === 'carlossuarezparra@gmail.com') {
          roleToUse = 'SUPERADMIN';
        }

        basicEmployee = {
          id: userId,
          user_id: userId,
          name: email.split('@')[0],
          email: email,
          role: roleToUse,
          is_active: true,
          workType: 'marca',
          profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=059669&color=fff`,
          nombre: email.split('@')[0],
          correo_electronico: email,
          esta_activo: true,
          imagen_de_perfil: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=059669&color=fff`
        };
      }

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

    // Timeout de seguridad eliminado para evitar cierres de sesión en conexiones lentas
    // const safetyTimeout = setTimeout(...) 

    initializeSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);

      if (!mounted) return;

      // IGNORAR TOKEN_REFRESHED para evitar bucles, pero PERMITIR INITIAL_SESSION si no hay usuario
      if (event === 'TOKEN_REFRESHED') {
        return;
      }

      // Si es INITIAL_SESSION y ya tenemos usuario, ignorar. Si no tenemos usuario, dejar pasar.
      if (event === 'INITIAL_SESSION' && user) {
        console.log('🔄 INITIAL_SESSION ignorado porque ya hay usuario');
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuario ha iniciado sesión');

        // Solo activar loading si no hay usuario (login inicial)
        // Si ya hay usuario, es una actualización de sesión (ej. cambio de pestaña) y no queremos desmontar la UI
        const isInitialLogin = !user;

        setUser(session.user);

        if (isInitialLogin) {
          setLoading(true);
        }

        await loadEmployeeData(session.user.id, session.user.email!);

        if (isInitialLogin) {
          setLoading(false);
        }
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

    // 🔧 FIX CRÍTICO: Mantener sesión activa al cambiar de pestaña
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && mounted) {
        console.log('👁️ Página visible de nuevo, verificando sesión...');

        // Si está cargando, NO forzar a false, dejar que termine el proceso natural
        if (loading) {
          console.log('⚠️ Detectado loading=true al volver, esperando proceso natural...');
        }

        // Verificar que la sesión sigue activa
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error verificando sesión al volver:', error);
          // Intentar refrescar sesión si hay error
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData.session) {
            console.log('✅ Sesión refrescada con éxito');
            if (!user) {
              setUser(refreshData.session.user);
              await loadEmployeeData(refreshData.session.user.id, refreshData.session.user.email!);
            }
            return;
          }
        }

        if (session?.user) {
          console.log('✅ Sesión activa confirmada:', session.user.email);

          // Si no hay usuario cargado, restaurar
          if (!user) {
            console.log('🔄 Restaurando sesión después de cambio de pestaña');
            setUser(session.user);
            // NO activar loading aquí para evitar parpadeos o desmontajes
            await loadEmployeeData(session.user.id, session.user.email!);
          } else {
            console.log('✅ Usuario ya cargado, no es necesario restaurar');
          }
        } else {
          console.log('❌ No hay sesión activa al volver');
          // No forzar logout aquí, dejar que el usuario intente navegar y falle si es necesario
          // setLoading(false);
        }
      }
    };

    // Escuchar cambios de visibilidad de la página
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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