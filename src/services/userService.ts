import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  dni?: string;
  birth_date?: string;
  address?: string;
  role?: string;
  center_id?: string;
  position?: string;
  hire_date?: string;
  contract_type?: string;
  profile_image?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Nuevos campos para permisos
  base_role?: 'ceo' | 'director' | 'center_manager' | 'trainer' | 'employee';
  assigned_modules?: string[];
}

export interface CreateUserData {
  name: string;
  email: string;
  phone?: string;
  dni?: string;
  base_role?: 'ceo' | 'director' | 'center_manager' | 'trainer' | 'employee';
  center_id?: string;
  assigned_modules?: string[];
}

// Cargar todos los usuarios
export const loadUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error cargando usuarios:', error);
      return { success: false, error: error.message, users: [] };
    }

    return { success: true, users: data || [] };
  } catch (error) {
    console.error('Error inesperado cargando usuarios:', error);
    return { success: false, error: 'Error inesperado', users: [] };
  }
};

// Crear nuevo usuario
export const createUser = async (userData: CreateUserData) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([{
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        dni: userData.dni,
        base_role: userData.base_role || 'employee',
        center_id: userData.center_id,
        assigned_modules: userData.assigned_modules || [],
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creando usuario:', error);
      return { success: false, error: error.message, user: null };
    }

    console.log('✅ Usuario creado correctamente:', data);
    return { success: true, user: data };
  } catch (error) {
    console.error('Error inesperado creando usuario:', error);
    return { success: false, error: 'Error inesperado', user: null };
  }
};

// Actualizar usuario
export const updateUser = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando usuario:', error);
      return { success: false, error: error.message, user: null };
    }

    console.log('✅ Usuario actualizado correctamente:', data);
    return { success: true, user: data };
  } catch (error) {
    console.error('Error inesperado actualizando usuario:', error);
    return { success: false, error: 'Error inesperado', user: null };
  }
};

// Eliminar usuario (desactivar)
export const deleteUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error eliminando usuario:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Usuario desactivado correctamente:', data);
    return { success: true };
  } catch (error) {
    console.error('Error inesperado eliminando usuario:', error);
    return { success: false, error: 'Error inesperado' };
  }
};

// Obtener usuario por email
export const getUserByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error obteniendo usuario por email:', error);
      return { success: false, error: error.message, user: null };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('Error inesperado obteniendo usuario:', error);
    return { success: false, error: 'Error inesperado', user: null };
  }
};

// Verificar permisos de usuario
export const checkUserPermissions = async (email: string, moduleId: string) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('base_role, assigned_modules')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { hasPermission: false };
    }

    // CEO tiene acceso a todo
    if (data.base_role === 'ceo') {
      return { hasPermission: true };
    }

    // Verificar módulos asignados
    const hasModule = data.assigned_modules?.includes(moduleId) || false;
    return { hasPermission: hasModule };
  } catch (error) {
    console.error('Error verificando permisos:', error);
    return { hasPermission: false };
  }
};
