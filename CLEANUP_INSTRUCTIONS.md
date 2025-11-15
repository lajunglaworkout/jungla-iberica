# 🧹 Instrucciones de Limpieza del Módulo de Reuniones

## 📋 Archivos Disponibles

### 1. `cleanup_meetings.sql` - Limpieza Total
**Elimina TODO** el contenido del módulo de reuniones:
- ✅ Todas las reuniones
- ✅ Todas las tareas relacionadas
- ✅ Todas las métricas
- ✅ Todos los cuellos de botella
- ✅ Todos los objetivos

**⚠️ ADVERTENCIA:** Este script es irreversible. Solo usar si quieres comenzar desde cero.

### 2. `cleanup_meetings_selective.sql` - Limpieza Selectiva
**Elimina SOLO** reuniones de prueba:
- ✅ Reuniones con "prueba" en el título
- ✅ Reuniones con "test" en el título
- ✅ Reuniones con "Nueva Reunión" en el título
- ✅ Datos relacionados con esas reuniones

**🔒 CONSERVA:** Reuniones reales con títulos diferentes.

---

## 🚀 Cómo Ejecutar

### Opción 1: Desde Supabase Dashboard

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Click en "SQL Editor" en el menú lateral
3. Click en "New Query"
4. Copia y pega el contenido del script que quieras ejecutar
5. Click en "Run" o presiona `Cmd + Enter`

### Opción 2: Desde Terminal (psql)

```bash
# Conectar a tu base de datos
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Ejecutar el script
\i cleanup_meetings.sql
# o
\i cleanup_meetings_selective.sql
```

### Opción 3: Desde Node.js/TypeScript

```typescript
import { supabase } from './supabaseClient';

// Leer el archivo SQL
const fs = require('fs');
const sql = fs.readFileSync('./cleanup_meetings.sql', 'utf8');

// Ejecutar
const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
```

---

## ✅ Verificación Post-Limpieza

Ejecuta estas consultas para verificar que todo está limpio:

```sql
-- Ver reuniones restantes
SELECT COUNT(*) as total_reuniones FROM meetings;

-- Ver tareas restantes relacionadas con reuniones
SELECT COUNT(*) as total_tareas 
FROM tareas 
WHERE reunion_id IS NOT NULL;

-- Ver métricas restantes
SELECT COUNT(*) as total_metricas FROM meeting_analytics;

-- Ver cuellos de botella restantes
SELECT COUNT(*) as total_bottlenecks FROM meeting_bottlenecks;
```

**Resultado esperado después de limpieza total:** `0` en todos los conteos

**Resultado esperado después de limpieza selectiva:** Solo reuniones reales (sin palabras de prueba)

---

## 🔄 Backup Recomendado

Antes de ejecutar cualquier script, haz un backup:

```bash
# Backup de la base de datos completa
pg_dump -h [HOST] -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# O solo las tablas relevantes
pg_dump -h [HOST] -U postgres -d postgres \
  -t meetings \
  -t tareas \
  -t meeting_analytics \
  -t meeting_bottlenecks \
  -t meeting_objectives \
  > backup_meetings_$(date +%Y%m%d).sql
```

---

## 📊 Datos que se Conservan

Los siguientes datos NO se eliminan:
- ✅ Empleados
- ✅ Departamentos
- ✅ Centros
- ✅ Tareas NO relacionadas con reuniones
- ✅ Objetivos recurrentes del departamento
- ✅ Configuraciones del sistema

---

## 🆘 En Caso de Error

Si algo sale mal:

1. **Restaurar desde backup:**
   ```bash
   psql -h [HOST] -U postgres -d postgres < backup_[fecha].sql
   ```

2. **O contactar soporte de Supabase** para restauración desde snapshot automático

---

## ✨ Después de la Limpieza

El módulo estará listo para:
- ✅ Crear reuniones reales
- ✅ Grabar y transcribir
- ✅ Generar actas con IA
- ✅ Programar siguientes reuniones
- ✅ Gestionar tareas y objetivos

---

**¿Necesitas ayuda?** Revisa la documentación en `/docs/meetings-module.md`
