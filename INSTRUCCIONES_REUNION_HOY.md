# 📋 INSTRUCCIONES PARA LA REUNIÓN DE HOY
**Fecha:** 17 de Noviembre de 2025  
**Reunión:** Primera reunión de dirección usando el CRM

---

## ✅ TODO LISTO Y FUNCIONANDO

### **1. Visibilidad de reuniones** ✅
- Los participantes VEN las reuniones donde fueron invitados
- Funciona en dashboard y en historial

### **2. Asignación de tareas** ✅
- Las tareas se asignan por EMAIL automáticamente
- Funciona con Vicente y Beni (tienen emails correctos)
- Cuando actualices los emails del resto, funcionará automáticamente

---

## 🚀 PASOS PARA LA REUNIÓN

### **ANTES DE LA REUNIÓN (5 min)**

#### **1. Crear la reunión en el CRM**
1. Ir al Dashboard
2. Click en "Nueva Reunión"
3. Completar:
   - **Título:** "Reunión de Dirección Semanal"
   - **Fecha:** Hoy (17/11/2025)
   - **Hora inicio:** 10:00 (o la hora que sea)
   - **Hora fin:** 11:00
   - **Asignar a:** "RRHH y Procedimientos" (Vicente)
   - **Descripción:** Agenda de la reunión
4. Marcar "Es una tarea recurrente" (opcional)
5. Guardar

#### **2. Verificar que Vicente la ve**
1. Pedir a Vicente que abra el CRM
2. Debe ver la reunión en su dashboard
3. Si no la ve, refrescar la página (F5)

---

### **DURANTE LA REUNIÓN**

#### **Opción A: Con grabación y acta automática** (RECOMENDADO)

1. **Abrir la reunión** en el CRM
2. **Click en "Grabar reunión"**
3. **Configurar tiempo** (opcional):
   - 30 min, 45 min, 60 min, etc.
   - O "Sin límite"
4. **Click en "Iniciar Grabación"** 🔴
5. **Hablar normalmente** durante la reunión
6. **Click en "Detener"** cuando termines
7. **Esperar procesamiento** (1-2 min):
   - Transcripción automática
   - Acta generada por IA
   - Tareas extraídas automáticamente

#### **Opción B: Sin grabación (manual)**

1. Tomar notas en el campo "Notas"
2. Al finalizar, guardar la reunión
3. Crear tareas manualmente si es necesario

---

### **DESPUÉS DE LA REUNIÓN (5 min)**

#### **1. Revisar el acta generada**

El sistema habrá generado:
- **Transcripción** completa de la reunión
- **Acta** con resumen y puntos clave
- **Tareas** asignadas automáticamente

#### **2. Editar tareas si es necesario**

Puedes:
- ✏️ Editar el título de la tarea
- 👤 Cambiar a quién está asignada
- 📅 Modificar la fecha límite
- 🎯 Ajustar la prioridad

**IMPORTANTE:** 
- Si asignas a "Vicente" → El sistema buscará su email automáticamente
- Si asignas a "Beni" → El sistema buscará su email automáticamente
- Si asignas a otro empleado sin email correcto → Se guardará el nombre (actualiza el email después)

#### **3. Guardar las tareas**

1. Click en "Guardar reunión"
2. Las tareas se guardarán en la BD
3. Se enviarán notificaciones a los asignados

#### **4. Verificar que las tareas aparecen**

**Para Vicente:**
1. Ir a su dashboard
2. Debe ver las tareas asignadas a él
3. Aparecerán en "Mis Tareas Pendientes"

**Para ti (CEO):**
1. Puedes ver todas las tareas en el historial
2. Puedes ver el acta completa
3. Puedes exportar el acta como PDF

---

## 🔍 LOGS DE DEBUG (Para verificar)

### **Al asignar tareas, verás en consola:**

```
📧 Asignando tarea "Revisar KPIs" a: Vicente → vicente@lajungla.com
{
  encontrado: true,
  empleado: { name: "Vicente", email: "vicente@lajungla.com" }
}
```

**Esto significa:**
- ✅ Encontró a Vicente en la BD
- ✅ Extrajo su email correctamente
- ✅ La tarea se guardará con el email

### **Si NO encuentra el email:**

```
📧 Asignando tarea "Revisar informes" a: Fran → Fran
{
  encontrado: false,
  empleado: null
}
```

**Esto significa:**
- ⚠️ No encontró a Fran en la BD (o no tiene email correcto)
- ⚠️ Se guardará con el nombre "Fran"
- ⚠️ NO aparecerá en su dashboard hasta que actualices su email

---

## 📊 EJEMPLO COMPLETO

### **Escenario:**

**Reunión:** Dirección Semanal  
**Participantes:** Carlos (CEO), Vicente (RRHH)  
**Duración:** 30 minutos

### **Flujo:**

1. **10:00** - Carlos crea la reunión y la asigna a Vicente
2. **10:00** - Vicente ve la reunión en su dashboard
3. **10:05** - Carlos inicia la grabación
4. **10:35** - Carlos detiene la grabación
5. **10:37** - Sistema genera acta con 3 tareas:
   - "Revisar KPIs de noviembre" → Vicente
   - "Actualizar procedimientos" → Vicente
   - "Preparar informe trimestral" → Carlos

6. **10:38** - Carlos revisa y guarda las tareas
7. **10:39** - Sistema procesa:
   ```
   📧 "Revisar KPIs" → Vicente → vicente@lajungla.com ✅
   📧 "Actualizar procedimientos" → Vicente → vicente@lajungla.com ✅
   📧 "Preparar informe" → Carlos → carlossuarezparra@gmail.com ✅
   ```

8. **10:40** - Vicente abre su dashboard:
   - ✅ Ve 2 tareas asignadas a él
   - ✅ Ve la reunión en el historial
   - ✅ Puede ver el acta completa

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### **Problema 1: Vicente no ve la reunión**

**Solución:**
1. Refrescar la página (F5)
2. Verificar que está logueado con su email correcto
3. Verificar que la reunión se asignó a "RRHH y Procedimientos"

### **Problema 2: Las tareas no aparecen en el dashboard**

**Causas posibles:**
- El empleado no tiene email correcto en la BD
- La tarea se asignó por nombre, no por email

**Solución:**
1. Verificar logs en consola (F12)
2. Ver si dice "encontrado: true"
3. Si dice "false", actualizar el email del empleado

### **Problema 3: La grabación no funciona**

**Causas posibles:**
- Navegador no tiene permisos de micrófono
- Backend no está corriendo (localhost:3001)

**Solución:**
1. Permitir acceso al micrófono en el navegador
2. Verificar que el backend está corriendo
3. Usar opción manual si es necesario

---

## 🎯 CHECKLIST FINAL

### **Antes de la reunión:**
- [ ] Reunión creada en el CRM
- [ ] Vicente puede verla en su dashboard
- [ ] Agenda definida

### **Durante la reunión:**
- [ ] Grabación iniciada (opcional)
- [ ] Notas tomadas

### **Después de la reunión:**
- [ ] Acta generada
- [ ] Tareas revisadas
- [ ] Tareas guardadas
- [ ] Verificado que aparecen en dashboards

---

## 📝 NOTAS IMPORTANTES

### **Para hoy:**
- ✅ Vicente y Beni tienen emails correctos → Funcionará perfecto
- ⚠️ Resto del equipo: actualiza emails después

### **Para el futuro:**
- Actualizar emails de todos los empleados en RRHH
- Configurar emails automáticos (opcional)
- Añadir más participantes a las reuniones

---

## 🚀 ¡LISTO PARA LA REUNIÓN!

Todo está configurado y funcionando. Solo tienes que:

1. **Crear la reunión** (2 min)
2. **Verificar que Vicente la ve** (1 min)
3. **Hacer la reunión** normalmente
4. **Guardar las tareas** (2 min)

**¡Éxito en la reunión!** 🎯

---

## 📞 SOPORTE

Si algo no funciona:
1. Verificar logs en consola (F12)
2. Refrescar la página
3. Verificar que los emails están correctos en la BD

**Los cambios ya están en producción (Netlify)** ✅
