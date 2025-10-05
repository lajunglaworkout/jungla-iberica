# 🚨 INSTRUCCIONES PARA CONFIGURAR BASE DE DATOS

## ✅ SCRIPTS A EJECUTAR EN SUPABASE:

Ve a tu panel de Supabase → SQL Editor y ejecuta estos scripts **EN ORDEN**:

### **PASO 1: Corregir tabla daily_checklists**
```sql
-- Copiar y pegar todo el contenido de:
-- src/sql/fix_daily_checklists_schema.sql
```

### **PASO 2: Crear tabla checklist_incidents**
```sql
-- Copiar y pegar todo el contenido de:
-- src/sql/fix_checklist_incidents_schema.sql
```

### **PASO 3: Crear tabla vacation_requests (NUEVO)**
```sql
-- Copiar y pegar todo el contenido de:
-- src/sql/create_vacation_requests_table.sql
```

### 2. **VERIFICAR QUE LAS TABLAS SE CREARON CORRECTAMENTE**

Ejecuta esta consulta para verificar:
```sql
-- Verificar estructura de daily_checklists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_checklists'
ORDER BY ordinal_position;

-- Verificar estructura de checklist_incidents
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'checklist_incidents'
ORDER BY ordinal_position;

-- Verificar datos de ejemplo
SELECT COUNT(*) as daily_checklists_count FROM daily_checklists;
SELECT COUNT(*) as incidents_count FROM checklist_incidents;
```

### 3. **RESULTADO ESPERADO**

Deberías ver:
- ✅ Tabla `daily_checklists` con columnas: id, center_id, date, employee_id, tasks, status, etc.
- ✅ Tabla `checklist_incidents` con columnas: id, center_id, center_name, incident_type, etc.
- ✅ Algunos registros de ejemplo en ambas tablas

### 4. **PROBAR EL SISTEMA**

Una vez ejecutados los scripts:

1. **Iniciar sesión** con Francisco: `franciscogiraldezmorales@gmail.com`
2. **Ir a Gestión** → Check-list Diario
3. **Marcar algunas tareas** como completadas
4. **Click en botón flotante rojo** 🚨 para reportar incidencia
5. **Completar el formulario** con fotos y prioridad
6. **Verificar** que se guarda correctamente

### 5. **SI SIGUES TENIENDO PROBLEMAS**

Ejecuta esta consulta para limpiar y recrear todo:
```sql
-- LIMPIAR TODO Y EMPEZAR DE NUEVO
DROP TABLE IF EXISTS checklist_incidents CASCADE;
DROP TABLE IF EXISTS daily_checklists CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_incident_stats_by_center(TEXT) CASCADE;

-- Luego ejecutar los scripts de nuevo
```

## 📋 ARCHIVOS IMPORTANTES:

- `src/sql/fix_daily_checklists_schema.sql` - Corrige tabla principal
- `src/sql/fix_checklist_incidents_schema.sql` - Crea tabla de incidencias
- `src/components/incidents/SmartIncidentModal.tsx` - Modal completo
- `src/services/checklistIncidentService.ts` - Servicio de BD

## 🎯 OBJETIVO:

Que el sistema de checklist e incidencias funcione completamente:
- ✅ Guardar checklists diarios
- ✅ Reportar incidencias con fotos
- ✅ Derivación automática por departamento
- ✅ Seguimiento de estado y resolución

¡Una vez ejecutados los scripts SQL, el sistema estará 100% funcional! 🚀
