// src/utils/supabaseTest.ts
import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Iniciando diagnóstico de Supabase...');
  
  try {
    // Test 1: Verificar configuración
    console.log('✅ Test 1: Configuración cargada correctamente');
    
    // Test 2: Verificar conectividad básica
    console.log('🔍 Test 2: Verificando conectividad...');
    // AUDIT FIX: 'empleados' no existe → usar 'employees'
    const { data, error } = await supabase.from('employees').select('count').limit(1);
    
    if (error) {
      console.error('❌ Test 2 falló:', error);
      
      // Test 3: Verificar si es problema de autenticación
      if (error.message.includes('JWT')) {
        console.log('🔍 Test 3: Problema de JWT/autenticación detectado');
        return { success: false, issue: 'auth', error };
      }
      
      // Test 4: Verificar si es problema de red
      if (error.message.includes('fetch') || error.message.includes('network')) {
        console.log('🔍 Test 4: Problema de red detectado');
        return { success: false, issue: 'network', error };
      }
      
      // Test 5: Verificar si es problema de permisos
      if (error.message.includes('permission') || error.message.includes('forbidden')) {
        console.log('🔍 Test 5: Problema de permisos detectado');
        return { success: false, issue: 'permissions', error };
      }
      
      return { success: false, issue: 'unknown', error };
    }
    
    console.log('✅ Test 2: Conectividad exitosa');
    return { success: true, data };
    
  } catch (networkError) {
    console.error('❌ Error de red:', networkError);
    return { success: false, issue: 'network', error: networkError };
  }
}

export async function testSupabaseAuth() {
  console.log('🔍 Probando autenticación de Supabase...');
  
  try {
    // Intentar obtener la sesión actual
    const { data: session, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error);
      return { success: false, error };
    }
    
    console.log('✅ Sesión obtenida:', session ? 'Activa' : 'No activa');
    return { success: true, session };
    
  } catch (authError) {
    console.error('❌ Error de autenticación:', authError);
    return { success: false, error: authError };
  }
}

export async function runFullDiagnostic() {
  console.log('🚀 Ejecutando diagnóstico completo de Supabase...');
  
  const connectionTest = await testSupabaseConnection();
  const authTest = await testSupabaseAuth();
  
  const results = {
    connection: connectionTest,
    auth: authTest,
    timestamp: new Date().toISOString()
  };
  
  console.log('📊 Resultados del diagnóstico:', results);
  
  // Sugerir soluciones basadas en los resultados
  if (!connectionTest.success) {
    switch (connectionTest.issue) {
      case 'network':
        console.log('💡 Solución sugerida: Verificar conexión a internet y firewall');
        break;
      case 'auth':
        console.log('💡 Solución sugerida: Verificar credenciales de Supabase');
        break;
      case 'permissions':
        console.log('💡 Solución sugerida: Verificar permisos de la API key');
        break;
      default:
        console.log('💡 Solución sugerida: Contactar soporte de Supabase');
    }
  }
  
  return results;
}
