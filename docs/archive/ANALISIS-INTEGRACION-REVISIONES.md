# Análisis de Integración - Revisiones Trimestrales
**Fecha:** 2025-10-23

## 📊 ESTADO ACTUAL

### ✅ MÓDULO DE INVENTARIO (Logística)
**Componente:** `QuarterlyReviewSystem.tsx`
**Estado:** Completamente desarrollado
**Funcionalidad actual:**
- ✅ Crea revisiones por centro (Sevilla, Jerez, Puerto)
- ✅ Carga inventario real desde `useInventory()`
- ✅ Genera formularios con items del inventario
- ✅ Estados: draft, in_review, completed
- ✅ Componente hijo: `QuarterlyReviewForm.tsx`

**Almacenamiento actual:** Estado local (useState)

### ✅ MÓDULO DE MANTENIMIENTO
**Componente:** `MaintenanceInspectionSystem.tsx`
**Estado:** Completamente desarrollado
**Funcionalidad actual:**
- ✅ Sistema de inspección por zonas
- ✅ Conceptos de mantenimiento predefinidos
- ✅ Estados: bien, regular, mal, fuera_servicio
- ✅ Sistema de fotos (deterioro/reparación)
- ✅ Tareas con prioridades
- ✅ Servicio: `maintenanceService.ts`

**Almacenamiento actual:** Supabase (tablas maintenance_*)

---

## 🎯 OBJETIVO DE INTEGRACIÓN

### LO QUE NECESITAMOS:

1. **Conectar Inventario con Supabase**
   - Guardar revisiones en `quarterly_reviews`
   - Guardar asignaciones en `quarterly_inventory_assignments`
   - Guardar items en `quarterly_review_items`

2. **Conectar Mantenimiento con nuevo esquema**
   - Guardar revisiones en `quarterly_maintenance_reviews`
   - Guardar asignaciones en `quarterly_maintenance_assignments`
   - Guardar resultados en `quarterly_maintenance_results`

3. **Añadir flujo de activación**
   - Beni/Director crea revisión (status: draft)
   - Establece fecha límite
   - Activa revisión (status: active)
   - Sistema crea asignaciones para cada centro
   - Sistema envía notificaciones a encargados

4. **Vista de Encargados**
   - Ver solo revisiones activas de su centro
   - Completar revisión
   - Marcar como completado
   - Sistema notifica a Beni/Director

5. **Función de eliminación de inventario**
   - Beni revisa items marcados como "to_remove"
   - Elimina del inventario real
   - Actualiza `inventory_items`

---

## 📋 TABLAS CREADAS EN SUPABASE

### INVENTARIO:
- ✅ `quarterly_reviews` (modificada con type, deadline_date, activated_at)
- ✅ `quarterly_inventory_assignments` (nueva)
- ✅ `quarterly_review_items` (existente, añadido assignment_id)

### MANTENIMIENTO:
- ✅ `quarterly_maintenance_reviews` (nueva)
- ✅ `quarterly_maintenance_assignments` (nueva)
- ✅ `quarterly_maintenance_results` (nueva)

### NOTIFICACIONES:
- ✅ `review_notifications` (existente)

---

## 🔄 PLAN DE INTEGRACIÓN

### FASE 1: Inventario (Beni)
1. Modificar `QuarterlyReviewSystem` para guardar en Supabase
2. Añadir campo "Fecha Límite" al crear revisión
3. Añadir botón "Activar Revisión"
4. Al activar: crear assignments + enviar notificaciones
5. Añadir función para eliminar items rotos del inventario

### FASE 2: Mantenimiento (Director)
1. Crear componente wrapper para revisiones trimestrales
2. Usar `MaintenanceInspectionSystem` existente
3. Guardar en nuevas tablas de mantenimiento trimestral
4. Añadir campo "Fecha Límite"
5. Añadir botón "Activar Revisión"
6. Al activar: crear assignments + enviar notificaciones

### FASE 3: Vista Encargados
1. Modificar `CenterManagement` (ya hecho)
2. Filtrar revisiones por center_id del encargado
3. Mostrar solo revisiones activas (status: 'active')
4. Al completar: actualizar assignment + notificar

---

## ⚠️ IMPORTANTE - NO MODIFICAR

### Componentes que NO se deben tocar:
- ❌ `QuarterlyReviewForm.tsx` (lógica de formulario)
- ❌ `MaintenanceInspectionSystem.tsx` (lógica de inspección)
- ❌ `maintenanceService.ts` (servicio existente)
- ❌ Tipos en `maintenance.ts`

### Solo añadir:
- ✅ Capa de persistencia (Supabase)
- ✅ Flujo de activación
- ✅ Sistema de notificaciones
- ✅ Filtros para encargados
- ✅ Función de eliminación de inventario

---

## 🚀 PRÓXIMOS PASOS

**¿Qué quieres que haga primero?**

A) Integrar Inventario con Supabase (Fase 1)
B) Integrar Mantenimiento con Supabase (Fase 2)  
C) Implementar vista de Encargados (Fase 3)
D) Todo junto paso a paso
