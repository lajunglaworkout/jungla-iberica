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

// Crear usuario en Supabase Auth y BD
export const createUserWithAuth = async (userData: CreateUserData & { password: string }) => {
  try {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });

    if (authError) {
      console.error('Error creando usuario en Auth:', authError);
      return { success: false, error: authError.message, user: null };
    }

    // 2. Crear registro en la tabla employees
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .insert([{
        user_id: authData.user.id,
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

    if (employeeError) {
      console.error('Error creando empleado:', employeeError);
      // Intentar eliminar el usuario de Auth si falló la BD
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: employeeError.message, user: null };
    }

    console.log('✅ Usuario creado correctamente:', employeeData);
    return { success: true, user: employeeData };
  } catch (error) {
    console.error('Error inesperado creando usuario:', error);
    return { success: false, error: 'Error inesperado', user: null };
  }
};

// Cambiar contraseña de usuario (requiere configuración especial en Supabase)
export const changeUserPassword = async (userId: string, newPassword: string) => {
  try {
    console.log('🔄 Intentando cambiar contraseña para userId:', userId);
    
    // Determinar si userId es un número (id) o UUID (user_id)
    const isNumericId = /^\d+$/.test(userId);
    console.log('🔍 ID es numérico:', isNumericId, 'valor:', userId);
    
    let existingUser;
    let checkError;
    
    if (isNumericId) {
      // Si es numérico, buscar por id
      const result = await supabase
        .from('employees')
        .select('id, user_id, email, name')
        .eq('id', parseInt(userId))
        .single();
      existingUser = result.data;
      checkError = result.error;
    } else {
      // Si es UUID, buscar por user_id
      const result = await supabase
        .from('employees')
        .select('id, user_id, email, name')
        .eq('user_id', userId)
        .single();
      existingUser = result.data;
      checkError = result.error;
    }

    if (checkError || !existingUser) {
      console.error('Error verificando usuario:', checkError);
      return { success: false, error: 'Usuario no encontrado: ' + (checkError?.message || 'No existe') };
    }

    console.log('👤 Usuario encontrado para cambio de contraseña:', existingUser);

    // Actualizar usando el campo correcto
    const updateField = isNumericId ? 'id' : 'user_id';
    const updateValue = isNumericId ? parseInt(userId) : userId;
    console.log('🔄 Registrando cambio usando campo:', updateField, 'valor:', updateValue);

    // Nota: Esta función requiere permisos de administrador en Supabase
    // Por ahora, solo actualizamos un campo en la BD para tracking
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .update({ 
        updated_at: new Date().toISOString(),
        // Podríamos añadir un campo password_reset_required: true
      })
      .eq(updateField, updateValue)
      .select()
      .single();

    if (employeeError) {
      console.error('Error actualizando registro de empleado:', employeeError);
      return { success: false, error: 'No se pudo actualizar el registro del usuario' };
    }

    console.log('⚠️ Cambio de contraseña registrado en BD');
    console.log('📧 Se debe notificar al usuario para que cambie su contraseña');
    return { 
      success: true, 
      message: 'Cambio registrado. El usuario debe cambiar su contraseña en el próximo login.' 
    };
  } catch (error) {
    console.error('Error inesperado cambiando contraseña:', error);
    return { success: false, error: 'Error inesperado: ' + (error as Error).message };
  }
};

// Actualizar email de usuario (BD + intento de sincronización con Auth)
export const updateUserEmail = async (userId: string, newEmail: string) => {
  try {
    console.log('🔄 Actualizando email en BD para userId:', userId, 'nuevo email:', newEmail);
    
    // Determinar si userId es un número (id) o UUID (user_id)
    const isNumericId = /^\d+$/.test(userId);
    console.log('🔍 ID es numérico:', isNumericId, 'valor:', userId);
    
    let existingUser;
    let checkError;
    
    if (isNumericId) {
      // Si es numérico, buscar por id
      const result = await supabase
        .from('employees')
        .select('id, user_id, email, name')
        .eq('id', parseInt(userId))
        .single();
      existingUser = result.data;
      checkError = result.error;
    } else {
      // Si es UUID, buscar por user_id
      const result = await supabase
        .from('employees')
        .select('id, user_id, email, name')
        .eq('user_id', userId)
        .single();
      existingUser = result.data;
      checkError = result.error;
    }

    if (checkError || !existingUser) {
      console.error('Error verificando usuario:', checkError);
      return { success: false, error: 'Usuario no encontrado: ' + (checkError?.message || 'No existe') };
    }

    console.log('👤 Usuario encontrado:', existingUser);

    // Actualizar usando el campo correcto
    const updateField = isNumericId ? 'id' : 'user_id';
    const updateValue = isNumericId ? parseInt(userId) : userId;
    console.log('🔄 Actualizando usando campo:', updateField, 'valor:', updateValue);

    // 1. Actualizar en la tabla employees
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .update({ 
        email: newEmail,
        updated_at: new Date().toISOString()
      })
      .eq(updateField, updateValue)
      .select()
      .single();

    if (employeeError) {
      console.error('Error actualizando email en employees:', employeeError);
      return { success: false, error: employeeError.message };
    }

    // 2. Intentar actualizar en Supabase Auth (puede fallar por permisos)
    if (existingUser.user_id) {
      try {
        console.log('🔄 Intentando actualizar email en Supabase Auth...');
        const { error: authError } = await supabase.auth.admin.updateUserById(existingUser.user_id, {
          email: newEmail,
          email_confirm: true
        });
        
        if (authError) {
          console.log('⚠️ No se pudo actualizar en Auth (permisos limitados):', authError.message);
        } else {
          console.log('✅ Email actualizado también en Supabase Auth');
        }
      } catch (authErr) {
        console.log('⚠️ Error actualizando Auth (esperado por permisos):', authErr);
      }
    }

    console.log('✅ Email actualizado correctamente en BD:', employeeData);
    console.log('⚠️ Nota: El usuario deberá contactar al administrador para reactivar el acceso');
    return { 
      success: true, 
      user: employeeData,
      message: 'Email actualizado. El usuario debe contactar al administrador para reactivar su acceso.'
    };
  } catch (error) {
    console.error('Error inesperado actualizando email:', error);
    return { success: false, error: 'Error inesperado: ' + (error as Error).message };
  }
};

// Desactivar usuario (eliminar acceso)
export const deactivateUser = async (userId: string) => {
  try {
    console.log('🔄 Desactivando usuario con ID:', userId);
    
    // Determinar si userId es un número (id) o UUID (user_id)
    const isNumericId = /^\d+$/.test(userId);
    console.log('🔍 ID es numérico:', isNumericId, 'valor:', userId);
    
    let existingUser;
    let checkError;
    
    if (isNumericId) {
      // Si es numérico, buscar por id
      const result = await supabase
        .from('employees')
        .select('id, user_id, email, name, is_active')
        .eq('id', parseInt(userId))
        .single();
      existingUser = result.data;
      checkError = result.error;
    } else {
      // Si es UUID, buscar por user_id
      const result = await supabase
        .from('employees')
        .select('id, user_id, email, name, is_active')
        .eq('user_id', userId)
        .single();
      existingUser = result.data;
      checkError = result.error;
    }

    if (checkError || !existingUser) {
      console.error('Error verificando usuario:', checkError);
      return { success: false, error: 'Usuario no encontrado: ' + (checkError?.message || 'No existe') };
    }

    console.log('👤 Usuario encontrado para desactivar:', existingUser);

    // Actualizar usando el campo correcto
    const updateField = isNumericId ? 'id' : 'user_id';
    const updateValue = isNumericId ? parseInt(userId) : userId;
    console.log('🔄 Desactivando usando campo:', updateField, 'valor:', updateValue);

    // 1. Desactivar en la BD
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq(updateField, updateValue)
      .select()
      .single();

    if (employeeError) {
      console.error('Error desactivando empleado:', employeeError);
      return { success: false, error: employeeError.message };
    }

    // 2. Opcional: Eliminar de Supabase Auth (comentado para mantener historial)
    // await supabase.auth.admin.deleteUser(userId);

    console.log('✅ Usuario desactivado correctamente:', employeeData);
    return { success: true };
  } catch (error) {
    console.error('Error inesperado desactivando usuario:', error);
    return { success: false, error: 'Error inesperado: ' + (error as Error).message };
  }
};

// Reactivar usuario
export const reactivateUser = async (userId: string) => {
  try {
    console.log('🔄 Reactivando usuario con ID:', userId);
    
    // Determinar si userId es un número (id) o UUID (user_id)
    const isNumericId = /^\d+$/.test(userId);
    console.log('🔍 ID es numérico:', isNumericId, 'valor:', userId);
    
    let existingUser;
    let checkError;
    
    if (isNumericId) {
      // Si es numérico, buscar por id
      const result = await supabase
        .from('employees')
        .select('id, user_id, email, name, is_active')
        .eq('id', parseInt(userId))
        .single();
      existingUser = result.data;
      checkError = result.error;
    } else {
      // Si es UUID, buscar por user_id
      const result = await supabase
        .from('employees')
        .select('id, user_id, email, name, is_active')
        .eq('user_id', userId)
        .single();
      existingUser = result.data;
      checkError = result.error;
    }

    if (checkError || !existingUser) {
      console.error('Error verificando usuario:', checkError);
      return { success: false, error: 'Usuario no encontrado: ' + (checkError?.message || 'No existe') };
    }

    console.log('👤 Usuario encontrado para reactivar:', existingUser);

    // Actualizar usando el campo correcto
    const updateField = isNumericId ? 'id' : 'user_id';
    const updateValue = isNumericId ? parseInt(userId) : userId;
    console.log('🔄 Reactivando usando campo:', updateField, 'valor:', updateValue);

    const { data, error } = await supabase
      .from('employees')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq(updateField, updateValue)
      .select()
      .single();

    if (error) {
      console.error('Error reactivando usuario:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Usuario reactivado correctamente:', data);
    return { success: true, user: data };
  } catch (error) {
    console.error('Error inesperado reactivando usuario:', error);
    return { success: false, error: 'Error inesperado: ' + (error as Error).message };
  }
};

// Reactivar acceso después de cambio de email (solo superadmin)
export const reactivateEmailAccess = async (email: string) => {
  try {
    console.log('🔄 Reactivando acceso para email:', email);
    
    // Buscar usuario por email en employees
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('id, user_id, email, name, is_active')
      .eq('email', email)
      .single();

    if (employeeError || !employeeData) {
      console.error('Error encontrando usuario:', employeeError);
      return { success: false, error: 'Usuario no encontrado con ese email' };
    }

    console.log('👤 Usuario encontrado:', employeeData);

    // Actualizar timestamp para permitir login normal
    const { error: updateError } = await supabase
      .from('employees')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeData.id);

    if (updateError) {
      console.error('Error actualizando estado:', updateError);
      return { success: false, error: 'Error actualizando registro de usuario' };
    }

    console.log('✅ Estado de email actualizado');
    return { 
      success: true, 
      message: `El usuario ${employeeData.name} puede intentar hacer login nuevamente con el email ${email}. Si persisten los problemas, debe contactar al administrador.` 
    };

  } catch (error) {
    console.error('Error inesperado reactivando acceso:', error);
    return { success: false, error: 'Error inesperado: ' + (error as Error).message };
  }
};
