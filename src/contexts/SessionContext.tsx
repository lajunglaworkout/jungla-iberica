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
          userRef.current = session.user; // Actualizar referencia para evitar recargas posteriores

          // Cargar datos del empleado
          await loadEmployeeData(session.user.id, session.user.email!);
        } else {
          console.log('❌ No hay sesión activa');
          if (mounted) {
            setUser(null);
            userRef.current = null;
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

    // Referencia para acceder al usuario actual dentro del callback de onAuthStateChange
    // Esto evita el problema del closure obsoleto donde 'user' siempre es null
    const userRef = { current: user };

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);

      if (!mounted) return;

      // Actualizar referencia
      if (session?.user) {
        userRef.current = session.user;
      }

      // IGNORAR TOKEN_REFRESHED para evitar bucles, pero PERMITIR INITIAL_SESSION si no hay usuario
      if (event === 'TOKEN_REFRESHED') {
        return;
      }

      // Si es INITIAL_SESSION y ya tenemos usuario, ignorar. Si no tenemos usuario, dejar pasar.
      if (event === 'INITIAL_SESSION' && userRef.current) {
        console.log('🔄 INITIAL_SESSION ignorado porque ya hay usuario');
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuario ha iniciado sesión');

        // Solo activar loading si no hay usuario (login inicial)
        // Si ya hay usuario (verificado por ref), es una actualización de sesión y no queremos desmontar la UI
        const isInitialLogin = !userRef.current;
        const isSameUser = userRef.current?.id === session.user.id;

        if (isInitialLogin) {
          console.log('🆕 Login inicial detectado, activando loading...');
          setLoading(true);
        } else if (isSameUser) {
          console.log('🔄 Misma sesión de usuario detectada, omitiendo recarga de datos...');
          // Actualizamos el usuario por si hay cambios en metadatos, pero evitamos recargar empleado si no es necesario
          // Nota: Si setUser causa re-render innecesarios, podríamos omitirlo también si deepEqual(user, session.user)
          // Por ahora, solo evitamos loadEmployeeData si es el mismo usuario

          // Si queremos ser estrictos y evitar CUALQUIER re-render:
          // return; 

          // Pero Supabase refresca tokens, así que es bueno actualizar el usuario.
          // Sin embargo, para evitar el "parpadeo" o "loading" en componentes hijos,
          // vamos a verificar si realmente necesitamos actualizar el estado.
          if (JSON.stringify(userRef.current) === JSON.stringify(session.user)) {
            console.log('✨ El objeto usuario es idéntico, omitiendo actualización de estado.');
            return;
          }
        } else {
          console.log('🔄 Actualización de sesión detectada (usuario ya existe), manteniendo UI...');
        }

        setUser(session.user);
        userRef.current = session.user; // Actualizar ref inmediatamente

        // Solo recargar datos del empleado si es un login inicial o si el usuario ha cambiado
        if (isInitialLogin || !isSameUser) {
          await loadEmployeeData(session.user.id, session.user.email!);
        }

        if (isInitialLogin) {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Usuario ha cerrado sesión');
        setUser(null);
        userRef.current = null;
        setEmployee(null);
        setUserRole(null);
        setDashboardConfig(null);
        setError(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Dependencias vacías para que solo se ejecute al montar

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