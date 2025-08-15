// crear-usuarios-empleados.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gfnjlmfziczimaohgkct.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbmpsbWZ6aWN6aW1hb2hna2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDEzNzQ2OCwiZXhwIjoyMDY5NzEzNDY4fQ._UBAs1jxVzWcgYkYExS2iYPStl9KdQT1oBQby4ThtDQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const empleados = [
  // SEVILLA (6 empleados)
  { email: 'francisco.giraldez@lajungla.com', name: 'Francisco Giráldez', center_id: 9, role: 'Encargado' },
  { email: 'salvador.cabrera@lajungla.com', name: 'Salvador Cabrera', center_id: 9, role: 'Encargado' },
  { email: 'javier.surian@lajungla.com', name: 'Javier Surián', center_id: 9, role: 'Empleado' },
  { email: 'jesus.arias@lajungla.com', name: 'Jesús Arias', center_id: 9, role: 'Empleado' },
  { email: 'jesus.rosado@lajungla.com', name: 'Jesús Rosado', center_id: 9, role: 'Empleado' },
  { email: 'santiago.frias@lajungla.com', name: 'Santiago Frías', center_id: 9, role: 'Empleado' },
  
  // JEREZ (6 empleados)
  { email: 'ivan.fernandez@lajungla.com', name: 'Iván Fernández González', center_id: 10, role: 'Encargado' },
  { email: 'pablo.benitez@lajungla.com', name: 'Pablo Benítez Macarro', center_id: 10, role: 'Encargado' },
  { email: 'mario.munoz@lajungla.com', name: 'Mario Muñoz Díaz', center_id: 10, role: 'Empleado' },
  { email: 'joseluis.rodriguez@lajungla.com', name: 'José Luis Rodríguez Muñoz', center_id: 10, role: 'Empleado' },
  { email: 'antonio.duran@lajungla.com', name: 'Antonio Jesús Durán', center_id: 10, role: 'Empleado' },
  { email: 'francisco.estepa@lajungla.com', name: 'Francisco Estepa Crespo', center_id: 10, role: 'Empleado' },
  
  // PUERTO (6 empleados)
  { email: 'israel.torres@lajungla.com', name: 'Israel Torres', center_id: 11, role: 'Encargado' },
  { email: 'guillermo.bermudez@lajungla.com', name: 'Guillermo Bermúdez', center_id: 11, role: 'Encargado' },
  { email: 'jose.figueroa@lajungla.com', name: 'José Figueroa', center_id: 11, role: 'Empleado' },
  { email: 'adrian.jimenez@lajungla.com', name: 'Adrián Jiménez', center_id: 11, role: 'Empleado' },
  { email: 'manuel.bella@lajungla.com', name: 'Manuel Bella', center_id: 11, role: 'Empleado' },
  { email: 'jonathan.padilla@lajungla.com', name: 'Jonathan Padilla', center_id: 11, role: 'Empleado' }
]

async function crearUsuarios() {
  console.log('🚀 Iniciando creación de 18 usuarios de empleados...\n')
  
  let creados = 0
  let errores = 0
  
  for (const emp of empleados) {
    try {
      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: emp.email,
        password: 'Jungla25',
        email_confirm: true,
        user_metadata: {
          name: emp.name,
          center_id: emp.center_id,
          role: emp.role
        }
      })
      
      if (authError) {
        if (authError.message.includes('already exists')) {
          console.log(`⚠️  ${emp.email} - Ya existe`)
        } else {
          console.error(`❌ Error con ${emp.email}:`, authError.message)
          errores++
        }
        continue
      }
      
      console.log(`✅ Usuario creado: ${emp.email} (${emp.name})`)
      creados++
      
      // 2. Actualizar el user_id en la tabla employees
      if (authData && authData.user) {
        const { error: updateError } = await supabase
          .from('employees')
          .update({ user_id: authData.user.id })
          .eq('email', emp.email)
        
        if (updateError) {
          console.error(`   ⚠️ Error actualizando employee:`, updateError.message)
        } else {
          console.log(`   ✓ Vinculado con tabla employees`)
        }
      }
      
    } catch (err) {
      console.error(`❌ Error con ${emp.email}:`, err)
      errores++
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMEN:')
  console.log(`✅ Usuarios creados: ${creados}`)
  console.log(`❌ Errores: ${errores}`)
  console.log(`📋 Total procesados: ${empleados.length}`)
  console.log('\n🔑 Todos los usuarios tienen contraseña: Jungla25')
  console.log('='.repeat(50))
}

// Ejecutar
crearUsuarios()
