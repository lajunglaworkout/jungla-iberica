# 📧 CONFIGURACIÓN DE EMAILS PARA REUNIONES
**Fecha:** 17 de Noviembre de 2025  
**Objetivo:** Enviar recordatorios y actas de reuniones por email

---

## 🎯 TU PREGUNTA

> "¿Cómo configurar el email para que tanto el recordatorio de la reunión como el acta les llegue mediante un email a los participantes, además de incluir las tareas en su perfil del CRM? Por otro lado, ¿a ellos les aparecerá la reunión en la que ellos hayan tenido participación aunque la haya creado yo?"

---

## ✅ ESTADO ACTUAL DEL SISTEMA

### **1. ¿Las reuniones son visibles para los participantes?**

**RESPUESTA: PARCIALMENTE** ⚠️

**Situación actual:**
- ✅ Las reuniones se guardan en Supabase con campo `participants`
- ✅ Existe sistema de notificaciones en BD
- ⚠️ **PERO:** El dashboard solo muestra las reuniones creadas por el usuario actual
- ❌ **FALTA:** Filtro para mostrar reuniones donde el usuario es participante

**Código actual (DashboardPage.tsx):**
```typescript
// Cargar reuniones desde Supabase
const meetingsResult = await loadMeetingsFromSupabase();

// PROBLEMA: No filtra por participantes
// Solo carga todas las reuniones
```

### **2. ¿Existen notificaciones por email?**

**RESPUESTA: NO** ❌

**Situación actual:**
- ✅ Existe tabla `notifications` en Supabase
- ✅ Existe servicio `notificationService.ts`
- ✅ Se crean notificaciones en la BD
- ❌ **FALTA:** Integración con servicio de email (SMTP/SendGrid/Resend)
- ❌ **FALTA:** Configuración de Supabase Auth para emails automáticos

---

## 🔧 SOLUCIONES NECESARIAS

### **SOLUCIÓN 1: Mostrar reuniones a participantes** (FÁCIL - 30 min)

#### **Problema:**
Cuando creas una reunión, los participantes no la ven en su dashboard.

#### **Solución:**
Modificar el filtro de carga de reuniones para incluir:
1. Reuniones creadas por el usuario
2. Reuniones donde el usuario es participante

**Código a modificar:**
```typescript
// src/services/meetingService.ts

export const loadMeetingsFromSupabase = async (userEmail?: string) => {
  try {
    let query = supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: true });
    
    // 🔧 NUEVO: Filtrar por participantes
    if (userEmail) {
      query = query.or(`created_by.eq.${userEmail},participants.cs.{${userEmail}}`);
    }
    
    const { data, error } = await query;
    
    // ... resto del código
  }
};
```

**Explicación:**
- `created_by.eq.${userEmail}` → Reuniones creadas por el usuario
- `participants.cs.{${userEmail}}` → Reuniones donde el usuario está en la lista de participantes
- `.or()` → Combina ambas condiciones

---

### **SOLUCIÓN 2: Emails automáticos** (MEDIO - 2-3 horas)

Hay **3 opciones** para enviar emails:

---

#### **OPCIÓN A: Supabase Edge Functions** (RECOMENDADA) ⭐

**Ventajas:**
- ✅ Integrado con Supabase
- ✅ Gratis hasta 500k invocaciones/mes
- ✅ Triggers automáticos en BD
- ✅ No necesita servidor externo

**Cómo funciona:**
1. Creas una Edge Function en Supabase
2. Configuras un trigger en la tabla `meetings`
3. Cuando se crea/actualiza una reunión → se envía email automáticamente

**Pasos:**

**1. Instalar Supabase CLI:**
```bash
npm install -g supabase
```

**2. Crear Edge Function:**
```bash
supabase functions new send-meeting-email
```

**3. Código de la función (`supabase/functions/send-meeting-email/index.ts`):**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { meeting, type } = await req.json()
    // type: 'reminder' | 'minutes'
    
    const emailHtml = type === 'reminder' 
      ? generateReminderEmail(meeting)
      : generateMinutesEmail(meeting)
    
    // Enviar email usando Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'La Jungla CRM <crm@lajunglaworkout.com>',
        to: meeting.participants,
        subject: type === 'reminder' 
          ? `📅 Recordatorio: ${meeting.title}` 
          : `📋 Acta: ${meeting.title}`,
        html: emailHtml
      })
    })
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

function generateReminderEmail(meeting: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Recordatorio de Reunión</h1>
        </div>
        <div class="content">
          <h2>${meeting.title}</h2>
          <p><strong>Fecha:</strong> ${new Date(meeting.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Hora:</strong> ${meeting.start_time}</p>
          <p><strong>Duración:</strong> ${meeting.duration_minutes || 60} minutos</p>
          
          ${meeting.agenda ? `
            <h3>Agenda:</h3>
            <p>${meeting.agenda}</p>
          ` : ''}
          
          <a href="https://lajungla-crm.netlify.app" class="button">Abrir CRM</a>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateMinutesEmail(meeting: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1976d2; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .task { background: white; padding: 12px; margin: 8px 0; border-left: 4px solid #059669; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Acta de Reunión</h1>
        </div>
        <div class="content">
          <h2>${meeting.title}</h2>
          <p><strong>Fecha:</strong> ${new Date(meeting.date).toLocaleDateString('es-ES')}</p>
          
          <h3>Resumen:</h3>
          <p>${meeting.summary || 'Sin resumen disponible'}</p>
          
          <h3>Tareas Asignadas:</h3>
          ${meeting.tasks_assigned?.map((task: any) => `
            <div class="task">
              <strong>${task.title}</strong><br>
              Asignado a: ${task.assignedTo}<br>
              Fecha límite: ${new Date(task.deadline).toLocaleDateString('es-ES')}
            </div>
          `).join('') || '<p>No hay tareas asignadas</p>'}
          
          <a href="https://lajungla-crm.netlify.app" class="button">Ver en CRM</a>
        </div>
      </div>
    </body>
    </html>
  `
}
```

**4. Configurar variables de entorno en Supabase:**
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**5. Desplegar la función:**
```bash
supabase functions deploy send-meeting-email
```

**6. Crear trigger en Supabase:**
```sql
-- Trigger para enviar recordatorio 1 día antes
CREATE OR REPLACE FUNCTION send_meeting_reminder()
RETURNS trigger AS $$
BEGIN
  -- Llamar a la Edge Function
  PERFORM net.http_post(
    url := 'https://[tu-proyecto].supabase.co/functions/v1/send-meeting-email',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'meeting', row_to_json(NEW),
      'type', 'reminder'
    )::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se ejecuta al crear reunión
CREATE TRIGGER on_meeting_created
  AFTER INSERT ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION send_meeting_reminder();
```

---

#### **OPCIÓN B: Resend (Servicio externo)** (MÁS SIMPLE) ⭐⭐

**Ventajas:**
- ✅ Muy fácil de configurar
- ✅ 100 emails gratis/día
- ✅ API simple
- ✅ No necesita Edge Functions

**Pasos:**

**1. Crear cuenta en Resend:**
- Ve a https://resend.com
- Regístrate gratis
- Obtén tu API Key

**2. Añadir variable de entorno:**
```bash
# .env.local
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**3. Crear servicio de email (`src/services/emailService.ts`):**
```typescript
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

export const sendMeetingReminder = async (meeting: any) => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'La Jungla CRM <crm@lajunglaworkout.com>',
        to: meeting.participants,
        subject: `📅 Recordatorio: ${meeting.title}`,
        html: generateReminderHTML(meeting)
      })
    });
    
    if (!response.ok) {
      throw new Error('Error enviando email');
    }
    
    console.log('✅ Email enviado');
    return { success: true };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error };
  }
};

export const sendMeetingMinutes = async (meeting: any, minutes: string, tasks: any[]) => {
  // Similar al anterior pero con el acta
};

function generateReminderHTML(meeting: any) {
  return `
    <h1>📅 Recordatorio de Reunión</h1>
    <h2>${meeting.title}</h2>
    <p><strong>Fecha:</strong> ${new Date(meeting.date).toLocaleDateString('es-ES')}</p>
    <p><strong>Hora:</strong> ${meeting.start_time}</p>
    ${meeting.agenda ? `<p><strong>Agenda:</strong> ${meeting.agenda}</p>` : ''}
    <a href="https://lajungla-crm.netlify.app">Abrir CRM</a>
  `;
}
```

**4. Llamar al servicio al crear reunión:**
```typescript
// src/services/meetingService.ts

export const saveMeetingToSupabase = async (task: Task) => {
  // ... código existente ...
  
  // 🆕 AÑADIR: Enviar email de recordatorio
  if (data) {
    await sendMeetingReminder(data);
  }
  
  return { success: true, meeting: data };
};
```

---

#### **OPCIÓN C: Supabase Auth Emails** (LIMITADO)

**Ventajas:**
- ✅ Ya incluido en Supabase
- ✅ Gratis

**Desventajas:**
- ❌ Solo para emails de autenticación
- ❌ No sirve para recordatorios/actas personalizados

**NO RECOMENDADO para tu caso**

---

## 📋 PLAN DE IMPLEMENTACIÓN RECOMENDADO

### **FASE 1: Visibilidad de reuniones** (HOY - 30 min)

1. ✅ Modificar `loadMeetingsFromSupabase()` para filtrar por participantes
2. ✅ Actualizar `DashboardPage.tsx` para pasar email del usuario
3. ✅ Probar que los participantes ven las reuniones

### **FASE 2: Emails básicos** (MAÑANA - 2 horas)

1. ✅ Crear cuenta en Resend (gratis)
2. ✅ Crear `emailService.ts`
3. ✅ Integrar en `saveMeetingToSupabase()`
4. ✅ Probar envío de recordatorios

### **FASE 3: Emails avanzados** (PRÓXIMA SEMANA - 3 horas)

1. ✅ Migrar a Supabase Edge Functions
2. ✅ Configurar triggers automáticos
3. ✅ Añadir envío de actas después de reunión
4. ✅ Sistema de recordatorios programados (1 día antes, 1 hora antes)

---

## 🧪 TESTING PARA HOY

### **Test 1: Visibilidad de reuniones**
1. Crear reunión como CEO
2. Asignar a "RRHH y Procedimientos"
3. Login como responsable de RRHH
4. **Resultado esperado:** La reunión aparece en su dashboard

### **Test 2: Emails (si implementas Fase 2)**
1. Crear reunión con participantes
2. Verificar que reciben email
3. Comprobar formato del email

---

## 💡 SOLUCIÓN TEMPORAL PARA HOY

Si quieres probar la reunión de dirección HOY sin emails:

### **Opción 1: Notificaciones en el CRM**
- ✅ Ya funciona
- Los participantes verán notificación en el panel de alertas
- No necesita configuración adicional

### **Opción 2: Email manual**
- Copia el acta generada por el CRM
- Envía email manual a participantes
- Incluye link al CRM

### **Opción 3: WhatsApp/Telegram**
- Notificación rápida
- Link directo al CRM
- Más inmediato que email

---

## 🎯 RECOMENDACIÓN FINAL

### **Para la reunión de HOY:**
1. ✅ Implementar FASE 1 (visibilidad) - 30 minutos
2. ✅ Usar notificaciones del CRM
3. ✅ Email manual si es necesario

### **Para el futuro:**
1. ✅ Implementar FASE 2 (Resend) - Mañana
2. ✅ Implementar FASE 3 (Edge Functions) - Próxima semana

---

## 📞 ¿QUIERES QUE IMPLEMENTE ALGO AHORA?

Puedo implementar ahora mismo:

**A) FASE 1 - Visibilidad de reuniones** (30 min)
- Los participantes verán las reuniones en su dashboard
- Listo para la reunión de hoy

**B) FASE 1 + FASE 2 - Con emails** (2 horas)
- Visibilidad + emails automáticos
- Necesitas crear cuenta en Resend

**C) Solo documentación**
- Te dejo todo documentado para que lo implementes cuando quieras

**¿Qué prefieres?** 🚀
