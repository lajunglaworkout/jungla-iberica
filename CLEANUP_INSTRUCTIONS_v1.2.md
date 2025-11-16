# 🧹 Instrucciones de Limpieza Completa del Sistema v1.2

**Fecha:** 16 Noviembre 2025  
**Propósito:** Eliminar TODOS los datos de prueba antes de comenzar con datos reales

---

## ⚠️ ADVERTENCIA CRÍTICA

**ESTE PROCESO ELIMINARÁ TODOS LOS DATOS DE PRUEBA**

### Antes de continuar:
1. ✅ **BACKUP COMPLETADO** - v1.2 (16 Nov 2025 07:41:02 UTC)
2. ✅ **Tag Git creado** - `v1.2-meetings-configured`
3. ✅ **Código sincronizado** en GitHub
4. ⚠️ **NO HAY VUELTA ATRÁS** después de ejecutar

---

## 📋 Datos que se Eliminarán

### ✅ Confirmado para Eliminar:

#### 1. **Reuniones y Tareas**
- ❌ Todas las reuniones de prueba
- ❌ Todas las tareas (reuniones y generales)
- ❌ Objetivos de reuniones
- ❌ Notas y comentarios

#### 2. **Clientes y Leads** (si existen)
- ❌ Clientes de prueba
- ❌ Leads de prueba
- ❌ Historial de contactos

#### 3. **Logística** (si existe)
- ❌ Notificaciones críticas de prueba
- ❌ Pedidos de prueba
- ❌ Inventario de prueba
- ⚠️ **OPCIÓN:** Mantener productos pero resetear cantidades

#### 4. **Contabilidad** (si existe)
- ❌ Pagos de prueba
- ❌ Transferencias de prueba
- ❌ Gastos extra de prueba

#### 5. **RRHH** (si existe)
- ❌ Incidencias de personal de prueba
- ❌ Propuestas/sanciones de prueba
- ❌ Checklist de prueba

#### 6. **Mantenimiento** (si existe)
- ❌ Incidencias de prueba
- ❌ Reparaciones de prueba
- ❌ Costes de prueba

#### 7. **Operaciones** (si existe)
- ❌ Eventos de prueba
- ❌ Actividades de prueba
- ❌ Sugerencias de prueba
- ❌ Comunicados de prueba

---

## 🔍 Paso 1: Verificación Previa

### Ejecutar en Supabase SQL Editor:

```sql
-- Ver cuántos registros hay en cada tabla
SELECT 'meetings' as tabla, COUNT(*) as total FROM meetings
UNION ALL
SELECT 'tareas' as tabla, COUNT(*) as total FROM tareas;
```

**Anota estos números** para compararlos después de la limpieza.

---

## 🗑️ Paso 2: Ejecutar Limpieza

### Opción A: Limpieza Automática (Recomendado)

1. **Abre Supabase SQL Editor**
2. **Abre el archivo** `cleanup_all_test_data.sql`
3. **Revisa el script** - Las secciones están comentadas
4. **Descomenta** solo las tablas que existan en tu BD
5. **Ejecuta el script completo**

### Opción B: Limpieza Manual (Más Control)

Ejecuta sección por sección, verificando después de cada una:

```sql
-- 1. Primero las tareas (tienen dependencia de reuniones)
DELETE FROM tareas;

-- 2. Luego las reuniones
DELETE FROM meetings;

-- 3. Continúa con otras tablas según necesites
```

---

## 📊 Paso 3: Verificación Post-Limpieza

### Verificar Conteos:

```sql
SELECT 'DESPUÉS DE LIMPIEZA' as info;

SELECT 'meetings' as tabla, COUNT(*) as total FROM meetings
UNION ALL
SELECT 'tareas' as tabla, COUNT(*) as total FROM tareas;
```

**Resultado esperado:** `0` en todas las tablas limpiadas

---

## 🔄 Paso 4: Resetear IDs (Opcional)

Si quieres que los nuevos registros empiecen desde ID 1:

```sql
-- Resetear secuencias de IDs
ALTER SEQUENCE meetings_id_seq RESTART WITH 1;
ALTER SEQUENCE tareas_id_seq RESTART WITH 1;

-- Añade más según las tablas que hayas limpiado
```

---

## 🧪 Paso 5: Verificación en la Aplicación

### 1. Reiniciar Servidor:
```bash
# Detener servidor (Ctrl+C)
npm run dev
```

### 2. Limpiar Caché del Navegador:
- **Mac:** `Cmd + Shift + R`
- **Windows:** `Ctrl + Shift + R`

### 3. Verificar en la App:
- [ ] No aparecen reuniones antiguas
- [ ] No aparecen tareas antiguas
- [ ] No hay notificaciones de prueba en Logística
- [ ] Puedes crear una nueva reunión sin errores
- [ ] Las tareas recurrentes se cargan correctamente

---

## 🚨 Si Algo Sale Mal - Plan de Recuperación

### Restaurar Código:
```bash
cd /Users/user/Desktop/jungla-iberica
git checkout v1.2-meetings-configured
```

### Restaurar Base de Datos:
1. Abre **Supabase SQL Editor**
2. Ejecuta el script `backup_full_v1.2.sql`
3. Los datos se restaurarán (si los guardaste)

### Contactar Soporte:
- Revisa logs de Supabase
- Revisa consola del navegador
- Consulta `BACKUP_RESTORE_v1.2.md`

---

## ✅ Checklist Final

Después de la limpieza, verifica:

- [ ] ✅ Todas las tablas tienen 0 registros (o los esperados)
- [ ] ✅ No hay errores en Supabase
- [ ] ✅ La aplicación carga sin errores
- [ ] ✅ Puedes crear una nueva reunión de prueba
- [ ] ✅ Las tareas recurrentes funcionan
- [ ] ✅ No hay notificaciones falsas
- [ ] ✅ El sistema está listo para datos reales

---

## 📝 Notas Importantes

### Lo que NO se elimina:
- ✅ Estructura de tablas (columnas, tipos, índices)
- ✅ Configuración de Supabase
- ✅ Usuarios y permisos
- ✅ Políticas de seguridad (RLS)
- ✅ Funciones y triggers
- ✅ Código de la aplicación

### Después de la limpieza:
1. El sistema estará completamente limpio
2. Listo para recibir datos reales
3. Todas las funcionalidades seguirán operativas
4. Los módulos configurados mantendrán su estructura

---

## 🎯 Próximos Pasos

Una vez limpio el sistema:

1. **Comenzar a cargar datos reales:**
   - Clientes reales
   - Datos contables reales
   - Inventario real
   - etc.

2. **Configurar módulos restantes:**
   - Procedimientos
   - Marketing
   - Ventas

3. **Implementar carga automática de datos** en reuniones

---

**✅ Sistema listo para comenzar con datos reales**

**Fecha de limpieza:** _________________  
**Ejecutado por:** _________________  
**Verificado por:** _________________
