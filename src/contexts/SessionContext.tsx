// src/contexts/SessionContext.tsx - Versión corregida con propiedades faltantes
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
 
 userRole: UserRole | null;
 permissions: RolePermissions | null;
 dashboardConfig: DashboardConfig | null;
 
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

 const loadEmployeeData = async (userId: string): Promise<EmployeeWithRole | null> => {
   try {
     console.log('🔍 Cargando datos del empleado para user_id:', userId);
     
     // Primero intentar cargar desde la tabla 'employees' (estructura nueva)
     const { data: employeeData, error: employeeError } = await supabase
       .from('employees')
       .select('*')
       .eq('user_id', userId)
       .eq('is_active', true)
       .single();

     console.log('📊 Resultado de la consulta employees:', { employeeData, employeeError });

     if (employeeError) {
       console.log('⚠️ No encontrado en employees, intentando en empleados...');
       
       // Fallback: intentar cargar desde la tabla 'empleados' (estructura existente)
       const { data: empleadoData, error: empleadoError } = await supabase
         .from('empleados')
         .select('*')
         .eq('correo_electronico', user?.email)
         .eq('esta_activo', true)
         .single();

       console.log('📊 Resultado de la consulta empleados:', { empleadoData, empleadoError });

       if (empleadoError || !empleadoData) {
         console.error('❌ Error cargando empleado de ambas tablas:', { employeeError, empleadoError });
         setError('Usuario no encontrado en el sistema');
         return null;
       }

       // Mapear datos de la tabla 'empleados' al formato esperado
       const advancedRole = getAdvancedRole(empleadoData.role || 'employee', empleadoData);
       const roleConfig = getRoleConfig(advancedRole);

       const employeeWithRole: EmployeeWithRole = {
         id: empleadoData.identificacion || userId,
         name: empleadoData.nombre,
         email: empleadoData.correo_electronico,
         role: empleadoData.role || 'employee',
         // Nuevas propiedades añadidas para compatibilidad
         imagen_de_perfil: empleadoData.imagen_de_perfil,
         avatar: empleadoData.imagen_de_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(empleadoData.nombre)}&background=059669&color=fff`,
         telefono: empleadoData.telefono,
         DNI: empleadoData.DNI,
         DIRECCION: empleadoData.DIRECCION,
         posicion: empleadoData.posicion,
         esta_activo: empleadoData.esta_activo,
         fecha_de_contratacion: empleadoData.fecha_de_contratacion,
         tipo_de_contrato: empleadoData.tipo_de_contrato,
         id_del_centro: empleadoData.id_del_centro,
         id_departamento: empleadoData.id_departamento,
         // Propiedades del sistema de roles
         advancedRole,
         permissions: roleConfig.permissions,
         dashboardConfig: roleConfig.config
       };

       console.log('✅ Empleado cargado exitosamente desde empleados:', {
         name: employeeWithRole.name,
         email: employeeWithRole.email,
         dbRole: employeeWithRole.role,
         advancedRole: employeeWithRole.advancedRole
       });

       setError(null);
       return employeeWithRole;
     }

     if (!employeeData) {
       console.warn('⚠️ No hay datos de empleado para user_id:', userId);
       setError('Datos de usuario no disponibles');
       return null;
     }

     // Datos encontrados en la tabla 'employees'
     const advancedRole = getAdvancedRole(employeeData.role, employeeData);
     const roleConfig = getRoleConfig(advancedRole);

     const employeeWithRole: EmployeeWithRole = {
       ...employeeData,
       // Asegurar que las propiedades están disponibles
       avatar: employeeData.imagen_de_perfil || employeeData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeData.name)}&background=059669&color=fff`,
       advancedRole,
       permissions: roleConfig.permissions,
       dashboardConfig: roleConfig.config
     };

     console.log('✅ Empleado cargado exitosamente desde employees:', {
       name: employeeWithRole.name,
       email: employeeWithRole.email,
       dbRole: employeeWithRole.role,
       advancedRole: employeeWithRole.advancedRole
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

   const getInitialSession = async () => {
     try {
       const { data: { session }, error: sessionError } = await supabase.auth.getSession();
       
       if (sessionError) {
         console.error('❌ Error obteniendo sesión:', sessionError);
         setError('Error de autenticación');
       } else if (session?.user && isMounted) {
         setSession(session);
         setUser(session.user);
         
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

   return () => {
     isMounted = false;
     subscription.unsubscribe();
   };
 }, []);

 const signIn = async (email: string, password: string) => {
   try {
     setError(null);
     setLoading(true);
     
     const { error: signInError } = await supabase.auth.signInWithPassword({
       email,
       password
     });

     if (signInError) {
       let errorMessage = 'Error de autenticación';
       
       switch (signInError.message) {
         case 'Invalid login credentials':
           errorMessage = 'Credenciales incorrectas';
           break;
         case 'Email not confirmed':
           errorMessage = 'Email no confirmado';
           break;
         default:
           errorMessage = signInError.message;
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
     
     const { error: signOutError } = await supabase.auth.signOut();
     if (signOutError) {
       console.error('❌ Error al cerrar sesión:', signOutError);
       setError('Error cerrando sesión');
     }
   } catch (error) {
     console.error('💥 Error inesperado al cerrar sesión:', error);
     setError('Error inesperado');
   }
 };

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
   
   userRole: employee?.advancedRole || null,
   permissions: employee?.permissions || null,
   dashboardConfig: employee?.dashboardConfig || null,
   
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