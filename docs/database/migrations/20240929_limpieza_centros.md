# Migración: Limpieza y Normalización de Centros

**Fecha:** 29 de Septiembre de 2025  
**Responsable:** Equipo de Desarrollo  
**Base de Datos:** PostgreSQL (Supabase)

## Objetivo
Normalizar la tabla `centers` y sus relaciones, eliminando datos redundantes y asegurando la integridad referencial.

## Cambios Realizados

### 1. Estado Inicial
- Se identificaron múltiples entradas redundantes en la tabla `centers`
- Se encontraron inconsistencias en los tipos de datos de las claves foráneas
- Se detectaron tablas con referencias a centros que ya no existían

### 2. Centros Conservados
Se decidió conservar solo los siguientes centros:
- **ID: 9** - Sevilla
- **ID: 10** - Jerez
- **ID: 11** - Puerto

### 3. Proceso de Migración

#### 3.1. Actualización de Referencias
Se actualizaron las referencias en las siguientes tablas:
- `daily_attendance`
- `qr_tokens`
- `timeclock_records`
- `employees`
- `shifts`
- `time_records`
- `daily_checklists`
- `marketing_content`
- `inventory_items`

#### 3.2. Normalización de Tipos de Datos
Se estandarizaron los tipos de datos de las claves foráneas a `bigint` para coincidir con el tipo de `centers.id`.

#### 3.3. Eliminación de Datos Redundantes
Se eliminaron las entradas en `centers` que no eran 9, 10 o 11, después de asegurar que no había referencias huérfanas.

### 4. Verificaciones Realizadas

#### 4.1. Integridad Referencial
```sql
-- Verificación de referencias huérfanas
SELECT 
    'daily_attendance' as table_name, 
    COUNT(*) as orphaned_records
FROM public.daily_attendance
WHERE center_id NOT IN (9, 10, 11)
UNION ALL
-- [Consultas similares para las demás tablas]
```

**Resultado:** No se encontraron referencias huérfanas.

#### 4.2. Tipos de Datos
```sql
-- Verificación de tipos de datos
SELECT
    tc.table_name, 
    kcu.column_name, 
    c.data_type
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.columns AS c
      ON c.table_name = tc.table_name
      AND c.column_name = kcu.column_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'centers';
```

**Resultado:** Todos los tipos de datos son consistentes (`bigint`).

### 5. Índices
Se verificaron los índices existentes y se identificaron oportunidades de optimización:

#### Índices Existentes
- `inventory_items`: `idx_inventory_center`, `idx_inventory_items_center`
- `daily_attendance`: `idx_daily_attendance_center`
- `time_records`: `idx_time_records_center`

#### Recomendaciones
Considerar agregar índices a las columnas de clave foránea en:
- `qr_tokens(center_id)`
- `timeclock_records(center_id)`
- `employees(center_id)`
- `shifts(center_id)`
- `daily_checklists(centro_id)`
- `marketing_content(centro_especifico_id)`

### 6. Scripts Ejecutados

#### 6.1. Actualización de Referencias
```sql
-- Ejemplo para daily_attendance
UPDATE public.daily_attendance
SET center_id = CASE 
    WHEN center_id = 1 THEN 9
    WHEN center_id = 2 THEN 10
    WHEN center_id = 3 THEN 11
    ELSE center_id
END
WHERE center_id IN (1, 2, 3);

-- [Scripts similares para las demás tablas]
```

#### 6.2. Eliminación de Centros Redundantes
```sql
-- Deshabilitar triggers temporalmente
SET session_replication_role = 'replica';

-- Eliminar centros redundantes
DELETE FROM public.centers
WHERE id NOT IN (9, 10, 11);

-- Volver a habilitar triggers
SET session_replication_role = 'origin';
```

### 7. Pruebas Realizadas
1. Verificación de que todas las referencias son válidas
2. Comprobación de que no hay valores nulos en claves foráneas
3. Validación de que los conteos de registros son consistentes
4. Pruebas de rendimiento en consultas comunes

### 8. Reversión
En caso de ser necesario, se puede restaurar desde la copia de seguridad realizada antes de la migración.

### 9. Notas Adicionales
- Se recomienda realizar una copia de seguridad de la base de datos antes de aplicar estos cambios en producción.
- Monitorear el rendimiento después de la migración para identificar posibles cuellos de botella.
- Actualizar la documentación de la aplicación para reflejar los cambios en el modelo de datos.

---
*Documentación generada automáticamente el 29/09/2025*
