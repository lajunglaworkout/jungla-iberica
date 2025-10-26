# 🗄️ SETUP SUPABASE - SISTEMA DE REUNIONES

## 📋 INSTRUCCIONES PARA CONFIGURAR LAS TABLAS

### 1️⃣ VERIFICAR TABLAS EXISTENTES

**Opción A: Usar SQL Editor de Supabase**

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a: **SQL Editor**
4. Copia y ejecuta el contenido de: `scripts/inspectSupabase.sql`

**Opción B: Ver en Supabase Dashboard**

1. Ve a: **Table Editor**
2. Verás todas las tablas disponibles

---

### 2️⃣ TABLAS QUE NECESITAMOS

#### ✅ TABLA: `employees` (YA EXISTE)
```
- id: UUID
- name: VARCHAR
- email: VARCHAR
- department: VARCHAR
- ... (otras columnas)
```

#### ❌ TABLA: `meetings` (NECESITA CREARSE)
```
- id: BIGINT (auto-increment)
- title: VARCHAR
- department: VARCHAR
- type: VARCHAR (weekly, monthly, quarterly)
- date: DATE
- start_time: TIME
- end_time: TIME (opcional)
- duration_minutes: INTEGER
- participants: TEXT[] (array de emails)
- leader_email: VARCHAR
- agenda: TEXT
- objectives: JSONB
- kpis: JSONB
- tasks: JSONB
- notes: TEXT
- summary: TEXT
- status: VARCHAR (scheduled, in_progress, completed, cancelled)
- completion_percentage: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- created_by: VARCHAR
```

#### ❌ TABLA: `meeting_recordings` (NECESITA CREARSE)
```
- id: UUID
- meeting_id: BIGINT (FK → meetings.id)
- audio_url: TEXT
- transcript: TEXT
- meeting_minutes: TEXT
- tasks_assigned: JSONB
- status: VARCHAR (recording, processing, completed, error)
- duration_seconds: INTEGER
- created_at: TIMESTAMP
```

#### ❌ TABLA: `tareas` (NECESITA CREARSE)
```
- id: BIGINT (auto-increment)
- titulo: VARCHAR
- descripcion: TEXT
- asignado_a: VARCHAR
- departamento_responsable: VARCHAR
- estado: VARCHAR (pendiente, en_progreso, completada, cancelada)
- prioridad: VARCHAR (baja, media, alta, critica)
- fecha_limite: DATE
- fecha_creacion: TIMESTAMP
- fecha_completacion: TIMESTAMP
- creado_por: VARCHAR
- reunion_id: BIGINT (FK → meetings.id)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

### 3️⃣ CREAR TABLAS EN SUPABASE

**Opción A: Ejecutar SQL (RECOMENDADO)**

1. Ve a Supabase Dashboard > **SQL Editor**
2. Copia TODO el contenido de: `scripts/inspectSupabase.sql`
3. Pega en el editor
4. Haz clic en **Run** (o presiona Ctrl+Enter)
5. ✅ Las tablas se crearán automáticamente

**Opción B: Crear manualmente en Table Editor**

1. Ve a Supabase Dashboard > **Table Editor**
2. Haz clic en **Create a new table**
3. Crea cada tabla con sus columnas

---

### 4️⃣ VERIFICAR QUE TODO ESTÁ CORRECTO

Ejecuta en SQL Editor:

```sql
-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver estructura de meetings
SELECT * FROM information_schema.columns 
WHERE table_name = 'meetings'
ORDER BY ordinal_position;

-- Ver estructura de tareas
SELECT * FROM information_schema.columns 
WHERE table_name = 'tareas'
ORDER BY ordinal_position;

-- Ver estructura de meeting_recordings
SELECT * FROM information_schema.columns 
WHERE table_name = 'meeting_recordings'
ORDER BY ordinal_position;
```

---

### 5️⃣ HABILITAR STORAGE PARA GRABACIONES

1. Ve a Supabase Dashboard > **Storage**
2. Haz clic en **Create a new bucket**
3. Nombre: `meeting_recordings`
4. Privacidad: **Public** (para acceso a URLs)
5. Haz clic en **Create bucket**

---

### 6️⃣ ACTUALIZAR VARIABLES DE ENTORNO

El archivo `.env.local` ya tiene:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_API_KEY=...
```

✅ **No necesita cambios adicionales**

---

### 7️⃣ VERIFICAR CONEXIÓN EN LA APP

Una vez creadas las tablas, la app debería:

1. ✅ Cargar empleados de `employees`
2. ✅ Crear reuniones en `meetings`
3. ✅ Guardar grabaciones en `meeting_recordings`
4. ✅ Crear tareas en `tareas`

---

## 📊 RESUMEN DE TABLAS

| Tabla | Estado | Acción |
|---|---|---|
| `employees` | ✅ Existe | Usar como está |
| `meetings` | ❌ Crear | Ejecutar SQL |
| `meeting_recordings` | ❌ Crear | Ejecutar SQL |
| `tareas` | ❌ Crear | Ejecutar SQL |
| `meeting_recordings` (Storage) | ❌ Crear | Crear bucket |

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecuta el SQL** en Supabase para crear las tablas
2. **Crea el bucket** de storage
3. **Recarga la app** en el navegador
4. **Prueba crear una reunión** con participantes
5. **Prueba grabar** una reunión

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Dónde ejecuto el SQL?**
R: Supabase Dashboard > SQL Editor > Pega el contenido de `scripts/inspectSupabase.sql`

**P: ¿Qué pasa si ya existen las tablas?**
R: El SQL usa `CREATE TABLE IF NOT EXISTS`, así que no habrá problemas

**P: ¿Cómo verifico que se crearon?**
R: Ve a Table Editor y deberías ver todas las tablas listadas

**P: ¿Necesito hacer RLS (Row Level Security)?**
R: Por ahora no, pero puedes habilitarlo después si quieres más seguridad

---

## 📞 SOPORTE

Si algo no funciona:
1. Verifica que ejecutaste el SQL completo
2. Recarga la página del navegador
3. Abre la consola (F12) para ver errores
4. Revisa los logs en Supabase Dashboard

✅ **¡Listo para empezar!**
