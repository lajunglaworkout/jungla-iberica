# 📋 MEJORAS SISTEMA DE TURNOS - ESTILO FACTORIAL

## 🎯 OBJETIVO
Implementar sistema de turnos profesional similar a Factorial con cuadrante visual, borradores y publicación.

---

## 📊 REFERENCIA VISUAL (Fotos proporcionadas)

### Foto 2.3.1 - Vista Calendario con Turnos
- Calendario mensual con turnos asignados visualmente
- Colores por tipo de turno
- Vista clara de todo el día
- Lista de empleados con turnos debajo

### Foto 2.3.2 - Cuadrante Semanal Completo
- Vista horizontal por empleado
- Bloques de color por turno
- Días de la semana como columnas
- Fácil visualización de patrones

### Foto 2.3.3 - Vista Detallada con Sidebar
- Panel lateral con detalles
- Edición inline de turnos
- Información completa visible

### Foto 2.4 - Sistema de Estados
- 🟢 **Borrador** - Trabajo en progreso
- 🔴 **Cancelado** - Turnos cancelados
- 🟣 **Publicado** - Enviado a empleados

### Foto 2.8.1 - Modal Programar Fechas
- Selector de rango de fechas
- Días específicos configurables
- Validación de fechas

---

## 🔧 PROBLEMAS ACTUALES A CORREGIR

### 2.1 ❌ Cuadrante no visual
**Problema:** No se comporta como calendario, difícil de ver patrones
**Solución:** Implementar cuadrante tipo Factorial con bloques visuales

### 2.2 ❌ Error "multas de semana"
**Problema:** Término incorrecto en interfaz
**Solución:** Corregir nomenclatura a "días de la semana"

### 2.3 ❌ Tercer empleado no aparece
**Problema:** Al añadir 3er empleado al turno, no se refleja
**Solución:** Corregir lógica de asignación múltiple

### 2.4 ⭐ CRÍTICO: Sistema Borrador/Publicación
**Problema:** No existe sistema de borradores
**Solución:** 
- Estado "Borrador" para trabajar sin notificar
- Botón "Publicar" que envía emails automáticos
- Confirmación de publicación
- Historial de cambios

### 2.5 ❌ No se pueden modificar turnos
**Problema:** Una vez creado, no se puede editar
**Solución:** Botón "Editar" en cada turno con modal

### 2.6 ⭐ CRÍTICO: Gestión de Festivos
**Problema:** No hay sistema de festivos (nacionales/locales)
**Solución:**
- Configuración de festivos por centro
- Festivos nacionales predefinidos
- Festivos locales personalizables
- Importación/creación manual
- Visual en calendario (días marcados)

### 2.7 ❌ Solo asigna día actual
**Problema:** Aunque turno sea L-V, solo asigna hoy
**Solución:** Respetar días configurados en el turno

### 2.8 ❌ Selector de fechas incorrecto
**Problema:** Seleccionar L-V asigna M-S
**Solución:** Corregir lógica de selección de rangos

---

## 🎨 DISEÑO PROPUESTO

### Vista Principal - Cuadrante Semanal
```
┌─────────────────────────────────────────────────────────────┐
│  📅 Semana del 21 - 27 Oct 2025          [Borrador] [Publicar] │
├─────────────────────────────────────────────────────────────┤
│ Empleado      │ Lun │ Mar │ Mié │ Jue │ Vie │ Sáb │ Dom │
├───────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ Salva         │ 🟢  │ 🟢  │ 🟢  │ 🟢  │ 🟢  │     │     │
│ Francisco     │ 🔵  │ 🔵  │ 🔵  │ 🔵  │ 🔵  │     │     │
│ Entrenador 1  │ 🟡  │ 🟡  │     │ 🟡  │ 🟡  │ 🟡  │     │
└───────────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘

🟢 Mañana (7:00-15:00)
🔵 Tarde (15:00-23:00)
🟡 Partido (horario variable)
🔴 Festivo
```

### Estados de Turnos
- **🟡 Borrador** - Trabajo en progreso, no visible para empleados
- **🟢 Publicado** - Enviado a empleados, confirmación por email
- **🔴 Modificado** - Cambios pendientes de publicar
- **⚫ Archivado** - Turnos pasados

---

## 📧 SISTEMA DE NOTIFICACIONES

### Al Publicar Turnos
```
Para: empleado@lajungla.com
Asunto: 📅 Tus turnos para la semana del 21-27 Oct

Hola Salva,

Se han publicado tus turnos para la próxima semana:

📅 Lunes 21 Oct: Mañana (7:00 - 15:00)
📅 Martes 22 Oct: Mañana (7:00 - 15:00)
📅 Miércoles 23 Oct: Mañana (7:00 - 15:00)
📅 Jueves 24 Oct: Mañana (7:00 - 15:00)
📅 Viernes 25 Oct: Mañana (7:00 - 15:00)

Ver en CRM: https://lajungla-crm.netlify.app

Saludos,
La Jungla Workout
```

### Al Modificar Turnos Publicados
```
Asunto: ⚠️ Cambio en tus turnos - Semana del 21-27 Oct

Se ha modificado tu turno:

❌ Antes: Miércoles 23 Oct - Mañana (7:00-15:00)
✅ Ahora: Miércoles 23 Oct - Tarde (15:00-23:00)

Motivo: Cambio de necesidades operativas
```

---

## 🎯 FESTIVOS - CONFIGURACIÓN

### Festivos Nacionales 2025 (Predefinidos)
- 1 Enero - Año Nuevo
- 6 Enero - Reyes
- 18 Abril - Viernes Santo
- 1 Mayo - Día del Trabajo
- 15 Agosto - Asunción
- 12 Octubre - Fiesta Nacional
- 1 Noviembre - Todos los Santos
- 6 Diciembre - Constitución
- 25 Diciembre - Navidad

### Festivos Locales (Configurables por Centro)
**Sevilla:**
- 28 Febrero - Día de Andalucía
- Feria de Abril (fechas variables)
- Corpus Christi

**Jerez:**
- 28 Febrero - Día de Andalucía
- Feria del Caballo (mayo)

**Puerto de Santa María:**
- 28 Febrero - Día de Andalucía
- Fiestas locales

### Interfaz Gestión Festivos
```
┌─────────────────────────────────────────┐
│  🎉 Gestión de Festivos                 │
├─────────────────────────────────────────┤
│  Centro: [Sevilla ▼]                    │
│                                         │
│  📅 Festivos Nacionales (9)             │
│  ✅ Aplicados automáticamente           │
│                                         │
│  📅 Festivos Locales (3)                │
│  ┌─────────────────────────────────┐   │
│  │ 28 Feb - Día Andalucía    [❌]  │   │
│  │ 15 Abr - Feria Abril      [❌]  │   │
│  │ 20 Jun - Corpus Christi   [❌]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [+ Añadir Festivo Local]               │
└─────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE TRABAJO PROPUESTO

### 1. Crear Turno en Borrador
```
1. Click "Nuevo Turno"
2. Configurar horario, días, empleados
3. Guardar como BORRADOR
4. Turno visible solo para admins
```

### 2. Revisar y Ajustar
```
1. Ver cuadrante completo
2. Detectar conflictos visualmente
3. Editar turnos si necesario
4. Seguir en modo BORRADOR
```

### 3. Publicar
```
1. Click "Publicar Turnos"
2. Confirmación: "¿Enviar a X empleados?"
3. Sistema envía emails automáticos
4. Estado cambia a PUBLICADO
5. Empleados reciben notificación
```

### 4. Modificar Publicados
```
1. Editar turno publicado
2. Sistema detecta cambio
3. Al guardar: "¿Notificar cambio?"
4. Email automático de modificación
```

---

## 📊 PRIORIDADES DE IMPLEMENTACIÓN

### FASE 1 - CRÍTICO (Hacer AHORA)
1. ✅ Corregir guardado empleados (HECHO)
2. ✅ Bloquear superadmin (HECHO)
3. 🔴 Corregir asignación L-V (solo asigna hoy)
4. 🔴 Corregir selector de fechas (M-S en vez de L-V)
5. 🔴 Permitir editar turnos creados

### FASE 2 - IMPORTANTE (Siguiente)
6. 🟡 Sistema Borrador/Publicación
7. 🟡 Notificaciones por email
8. 🟡 Gestión de festivos

### FASE 3 - MEJORAS UX (Después)
9. 🟢 Cuadrante visual tipo Factorial
10. 🟢 Drag & drop de turnos
11. 🟢 Vista mensual completa
12. 🟢 Exportar a PDF/Excel

---

## 🎯 DECISIÓN INMEDIATA

**¿Qué hacemos primero?**

**OPCIÓN A - Rápido (30 min):**
- Corregir bug asignación L-V
- Corregir selector de fechas
- Permitir editar turnos

**OPCIÓN B - Completo (2-3 horas):**
- Todo lo anterior +
- Sistema Borrador/Publicación
- Emails automáticos
- Gestión festivos básica

**OPCIÓN C - Fichaje móvil primero (15 min):**
- Arreglar pantalla vacía fichaje móvil
- Luego volver a turnos

---

## 📝 NOTAS TÉCNICAS

### Tablas Supabase Necesarias
- `shifts` - Definición de turnos ✅ (existe)
- `employee_shifts` - Asignaciones ✅ (existe)
- `shift_drafts` - Borradores (crear)
- `holidays` - Festivos (crear)
- `shift_notifications` - Historial emails (crear)

### Servicios a Crear
- `shiftDraftService.ts` - Gestión borradores
- `holidayService.ts` - Gestión festivos
- `shiftNotificationService.ts` - Emails automáticos

---

**ESPERANDO DECISIÓN DEL CEO (Carlos)** 🎯
