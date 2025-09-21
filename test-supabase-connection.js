// Script para probar conexión con Supabase desde la consola del navegador
// Copia y pega este código en la consola del navegador (F12 → Console)

console.log('🔍 Probando conexión con Supabase...');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');

// Probar conexión básica
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🚀 Probando consulta a product_categories...');
  
  supabase
    .from('product_categories')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error conectando a Supabase:', error);
      } else {
        console.log('✅ Conexión exitosa! Categorías encontradas:', data?.length);
        console.log('📊 Datos:', data);
      }
    });
    
  console.log('🚀 Probando consulta a suppliers...');
  
  supabase
    .from('suppliers')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error consultando suppliers:', error);
      } else {
        console.log('✅ Proveedores encontrados:', data?.length);
        console.log('📊 Proveedores:', data);
      }
    });
    
  console.log('🚀 Probando consulta a inventory_items...');
  
  supabase
    .from('inventory_items')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error consultando inventory_items:', error);
      } else {
        console.log('✅ Items de inventario encontrados:', data?.length);
        console.log('📊 Inventario:', data);
      }
    });
    
} else {
  console.error('❌ Variables de entorno no configuradas');
}
