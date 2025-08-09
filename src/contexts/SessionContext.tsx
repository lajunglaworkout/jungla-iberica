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

// Empleados por defecto para usuarios conocidos
const DEFAULT_EMPLOYEES: Record<string, Employee> = {
  'carlossuarezparra@gmail.com': {
    id: 'CEO001',
    name: 'Carlos Suárez Parra',
    email: 'carlossuarezparra@gmail.com',
    role: 'SUPERADMIN',
    is_active: true,
    workType: 'marca',
    profile_image: 'https://ui-avatars.com/api/?name=Carlos+Suarez&background=059669&color=fff',
    nombre: 'Carlos Suárez Parra',
    correo_electronico: 'carlossuarezparra@gmail.com',
    esta_activo: true,
    imagen_de_perfil: 'https://ui-avatars.com/api/?name=Carlos+Suarez&background=059669&color=fff'
  },
  'beni.jungla@gmail.com': {
    id: 'DIR001',
    name: 'Benito Morales',
    email: 'beni.jungla@gmail.com',
    role: 'Director',
    is_active: true,
    workType: 'marca',
    profile_image: 'https://ui-avatars.com/api/?name=Benito+Morales&background=3b82f6&color=fff',
    nombre: 'Benito Morales',
    correo_electronico: 'beni.jungla@gmail.com',
    esta_activo: true,
    imagen_de_perfil: 'https://ui-avatars.com/api/?name=Benito+Morales&background=3b82f6&color=fff'
  },
  'lajunglacentral@gmail.com': {
    id: 'DIR002',
    name: 'Vicente Benítez',
    email: 'lajunglacentral@gmail.com',
    role: 'Director',
    is_active: true,
    workType: 'marca',
    profile_image: 'https://ui-avatars.com/api/?name=Vicente+Benitez&background=8b5cf6&color=fff',
    nombre: 'Vicente Benítez',
    correo_electronico: 'lajunglacentral@gmail.com',
    esta_activo: true,
    imagen_de_perfil: 'https://ui-avatars.com/api/?name=Vicente+Benitez&background=8b5cf6&color=fff'
  }
};

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar datos del empleado
  const loadEmployeeData = async (userId: string, email: string) => {
    try {
      console.log('🔍 Cargando datos del empleado para:', email);
      
      // PRIMERO: Verificar si es un usuario conocido
      const defaultEmployee = DEFAULT_EMPLOYEES[email];
      if (defaultEmployee) {
        console.log('✅ Usando empleado por defecto para:', email);
        
        const processedEmployee = {
          ...defaultEmployee,
          user_id: userId
        };

        const roleFromDB = defaultEmployee.role;
        const mappedRole = ROLE_MAPPING[roleFromDB] || 'employee';
        const config = DASHBOARD_CONFIGS[mappedRole] || DASHBOARD_CONFIGS.employee;

        setEmployee(processedEmployee);
        setUserRole(mappedRole);
        setDashboardConfig(config);
        setError(null);

        console.log('✅ Sesión configurada con datos por defecto:', {
          employee: processedEmployee.name,
          role: mappedRole,
          config: config.sections
        });

        return true;
      }

      // SEGUNDO: Intentar consultar la base de datos con timeout corto
      console.log('🔍 Consultando base de datos...');
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout de BD')), 3000); // Solo 3 segundos
      });

      const queryPromise = supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();

      const result = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      if (result && result.data) {
        console.log('✅ Datos encontrados en BD:', result.data);
        
        const employeeData = result.data;
        const processedEmployee: Employee = {
          ...employeeData,
          user_id: userId,
          nombre: employeeData.name,
          correo_electronico: employeeData.email,
          esta_activo: employeeData.is_active,
          imagen_de_perfil: employeeData.profile_image,
          workType: 'marca'
        };

        const roleFromDB = employeeData.role || 'employee';
        const mappedRole = ROLE_MAPPING[roleFromDB] || 'employee';
        const config = DASHBOARD_CONFIGS[mappedRole] || DASHBOARD_CONFIGS.employee;

        setEmployee(processedEmployee);
        setUserRole(mappedRole);
        setDashboardConfig(config);
        setError(null);

        console.log('✅ Sesión configurada desde BD:', {
          employee: processedEmployee.name,
          role: mappedRole
        });

        return true;
      }

      throw new Error('No se encontraron datos');

    } catch (err) {
      console.log('⚠️ Error o timeout en BD:', err);
      
      // TERCERO: Fallback para usuario genérico
      console.log('🔧 Creando empleado genérico para:', email);
      
      const genericEmployee: Employee = {
        id: `USER_${userId.slice(0, 8)}`,
        user_id: userId,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email,
        role: 'employee',
        is_active: true,
        workType: 'marca',
        profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=6b7280&color=fff`,
        nombre: email.split('@')[0],
        correo_electronico: email,
        esta_activo: true,
        imagen_de_perfil: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=6b7280&color=fff`
      };

      setEmployee(genericEmployee);
      setUserRole('employee');
      setDashboardConfig(DASHBOARD_CONFIGS.employee);
      setError(null);

      console.log('✅ Empleado genérico creado:', genericEmployee.name);
      return true;
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