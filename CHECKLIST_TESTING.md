# ✅ CHECKLIST DE TESTING - LA JUNGLA WORKOUT CRM
**Fecha:** 17 de Noviembre de 2025  
**Versión:** 2.0 (Post correcciones críticas)

---

## 🔴 PRIORIDAD CRÍTICA - TESTING INMEDIATO

### 1. **RRHH 2.0 - CORRECCIONES DE HOY** ⏳

#### 1.1 Sesión Persistente
- [ ] **Test 1:** Iniciar sesión con usuario válido
- [ ] **Test 2:** Abrir nueva pestaña de Gmail/otra web
- [ ] **Test 3:** Esperar 2-3 minutos
- [ ] **Test 4:** Volver al CRM
- [ ] **Resultado esperado:** Sesión sigue activa, no pide login
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 1.2 Edición de Empleado - Persistencia de Datos
- [ ] **Test 1:** Ir a RRHH > Empleados
- [ ] **Test 2:** Editar empleado "Fran"
- [ ] **Test 3:** Cambiar nombre a "Francisco TEST"
- [ ] **Test 4:** Cambiar teléfono
- [ ] **Test 5:** Guardar cambios
- [ ] **Test 6:** Navegar a otra sección (ej. Dashboard)
- [ ] **Test 7:** Volver a RRHH > Ver perfil de Fran
- [ ] **Resultado esperado:** Todos los cambios persisten
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 1.3 Asignación de Departamento y Rol
- [ ] **Test 1:** Editar empleado "Fran"
- [ ] **Test 2:** Cambiar departamento a "Entrenamiento"
- [ ] **Test 3:** Cambiar rol a "Manager"
- [ ] **Test 4:** Guardar
- [ ] **Test 5:** Recargar página (F5)
- [ ] **Test 6:** Verificar que departamento y rol se mantienen
- [ ] **Resultado esperado:** Departamento = Entrenamiento, Rol = Manager
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 1.4 Buscador de Empleados en Documentos
- [ ] **Test 1:** Ir a RRHH > Gestión de Documentos
- [ ] **Test 2:** Click en "Subir Documento"
- [ ] **Test 3:** Escribir "Salva" en el buscador
- [ ] **Test 4:** Verificar que aparece en la lista
- [ ] **Test 5:** Escribir "Fran" en el buscador
- [ ] **Test 6:** Verificar que aparece en la lista
- [ ] **Test 7:** Limpiar búsqueda
- [ ] **Resultado esperado:** Búsqueda funciona en tiempo real
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 1.5 Subida del Primer Documento
- [ ] **Test 1:** Seleccionar empleado sin documentos previos
- [ ] **Test 2:** Seleccionar tipo "Nómina"
- [ ] **Test 3:** Subir archivo PDF de prueba
- [ ] **Test 4:** Guardar
- [ ] **Resultado esperado:** Documento se sube correctamente
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

## 🟠 PRIORIDAD ALTA - TESTING GENERAL RRHH

### 2. **GESTIÓN DE EMPLEADOS** ⏳

#### 2.1 Alta de Empleado
- [ ] **Test 1:** Ir a RRHH > Nuevo Empleado
- [ ] **Test 2:** Rellenar datos obligatorios (nombre, email)
- [ ] **Test 3:** Asignar centro
- [ ] **Test 4:** Asignar departamento
- [ ] **Test 5:** Asignar rol
- [ ] **Test 6:** Guardar
- [ ] **Resultado esperado:** Empleado creado correctamente
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 2.2 Baja de Empleado
- [ ] **Test 1:** Seleccionar empleado de prueba
- [ ] **Test 2:** Marcar como "Inactivo"
- [ ] **Test 3:** Guardar
- [ ] **Test 4:** Verificar que no aparece en lista activa
- [ ] **Resultado esperado:** Empleado marcado como inactivo
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 2.3 Checklist de Documentación
- [ ] **Test 1:** Ver perfil de empleado
- [ ] **Test 2:** Ir a pestaña "Checklist"
- [ ] **Test 3:** Marcar "Contrato firmado"
- [ ] **Test 4:** Marcar "Alta SS"
- [ ] **Test 5:** Guardar
- [ ] **Test 6:** Verificar que se mantiene
- [ ] **Resultado esperado:** Checklist se guarda correctamente
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

### 3. **CONTROL DE ASISTENCIA** ⏳

#### 3.1 Fichaje con QR
- [ ] **Test 1:** Generar QR del empleado
- [ ] **Test 2:** Escanear QR desde móvil
- [ ] **Test 3:** Fichar entrada
- [ ] **Test 4:** Verificar registro en dashboard
- [ ] **Test 5:** Fichar salida
- [ ] **Resultado esperado:** Fichajes registrados correctamente
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 3.2 Gestión de Turnos
- [ ] **Test 1:** Ir a RRHH > Turnos
- [ ] **Test 2:** Crear turno para empleado
- [ ] **Test 3:** Asignar horario (09:00 - 17:00)
- [ ] **Test 4:** Guardar
- [ ] **Test 5:** Verificar en calendario
- [ ] **Resultado esperado:** Turno visible en calendario
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 3.3 Solicitud de Vacaciones
- [ ] **Test 1:** Empleado solicita vacaciones
- [ ] **Test 2:** Seleccionar fechas
- [ ] **Test 3:** Enviar solicitud
- [ ] **Test 4:** Encargado recibe notificación
- [ ] **Test 5:** Encargado aprueba/rechaza
- [ ] **Resultado esperado:** Flujo completo funciona
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

## 🟡 PRIORIDAD MEDIA - OTROS MÓDULOS

### 4. **GESTIÓN DE CENTROS** ⏳

#### 4.1 Dashboard de Centro
- [ ] **Test 1:** Seleccionar centro
- [ ] **Test 2:** Ver métricas de clientes
- [ ] **Test 3:** Ver datos de contabilidad
- [ ] **Test 4:** Verificar que datos son reales (no hardcodeados)
- [ ] **Resultado esperado:** Datos dinámicos desde BD
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 4.2 Checklist Diario
- [ ] **Test 1:** Abrir checklist del día
- [ ] **Test 2:** Marcar tareas completadas
- [ ] **Test 3:** Añadir observaciones
- [ ] **Test 4:** Guardar
- [ ] **Test 5:** Verificar en historial
- [ ] **Resultado esperado:** Checklist guardado correctamente
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

### 5. **LOGÍSTICA E INVENTARIO** ⏳

#### 5.1 Gestión de Stock
- [ ] **Test 1:** Ir a Logística > Inventario
- [ ] **Test 2:** Crear nuevo producto
- [ ] **Test 3:** Establecer stock mínimo
- [ ] **Test 4:** Registrar entrada de stock
- [ ] **Test 5:** Registrar salida de stock
- [ ] **Test 6:** Verificar alertas de stock bajo
- [ ] **Resultado esperado:** Sistema de alertas funciona
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 5.2 Pedidos a Proveedores
- [ ] **Test 1:** Crear nuevo pedido
- [ ] **Test 2:** Seleccionar proveedor
- [ ] **Test 3:** Añadir productos
- [ ] **Test 4:** Guardar pedido
- [ ] **Test 5:** Marcar como recibido
- [ ] **Test 6:** Verificar actualización de stock
- [ ] **Resultado esperado:** Stock se actualiza automáticamente
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

### 6. **MANTENIMIENTO** ⏳

#### 6.1 Registro de Incidencias
- [ ] **Test 1:** Crear nueva incidencia
- [ ] **Test 2:** Asignar centro
- [ ] **Test 3:** Establecer prioridad
- [ ] **Test 4:** Guardar
- [ ] **Test 5:** Marcar como resuelta
- [ ] **Test 6:** Añadir coste de reparación
- [ ] **Resultado esperado:** Incidencia registrada y resuelta
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

### 7. **REUNIONES Y SEGUIMIENTO** ⏳

#### 7.1 Reunión Semanal
- [ ] **Test 1:** Crear reunión semanal de RRHH
- [ ] **Test 2:** Cargar tareas recurrentes automáticas
- [ ] **Test 3:** Verificar datos de incidencias
- [ ] **Test 4:** Añadir objetivos
- [ ] **Test 5:** Guardar acta
- [ ] **Test 6:** Verificar en historial
- [ ] **Resultado esperado:** Reunión guardada con todos los datos
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 7.2 Tareas Recurrentes
- [ ] **Test 1:** Verificar carga automática de tareas
- [ ] **Test 2:** Comprobar datos expandibles por centro
- [ ] **Test 3:** Verificar datos de incidencias
- [ ] **Test 4:** Guardar cambios
- [ ] **Resultado esperado:** Tareas se cargan automáticamente
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

### 8. **CONTABILIDAD** ⏳

#### 8.1 Gestión de Cuotas
- [ ] **Test 1:** Ir a Contabilidad > Cuotas
- [ ] **Test 2:** Crear nuevo tipo de cuota
- [ ] **Test 3:** Asignar precio
- [ ] **Test 4:** Guardar
- [ ] **Test 5:** Verificar en lista
- [ ] **Resultado esperado:** Cuota creada correctamente
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

#### 8.2 Transferencias
- [ ] **Test 1:** Crear transferencia entre centros
- [ ] **Test 2:** Establecer monto
- [ ] **Test 3:** Guardar
- [ ] **Test 4:** Verificar en ambos centros
- [ ] **Resultado esperado:** Transferencia registrada en ambos
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

### 9. **VENTAS Y LEADS** ⏳

#### 9.1 Gestión de Leads
- [ ] **Test 1:** Crear nuevo lead
- [ ] **Test 2:** Asignar a vendedor
- [ ] **Test 3:** Registrar interacción
- [ ] **Test 4:** Mover en pipeline
- [ ] **Test 5:** Convertir a cliente
- [ ] **Resultado esperado:** Lead convertido correctamente
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

### 10. **MARKETING** ⏳

#### 10.1 Publicaciones
- [ ] **Test 1:** Crear nueva publicación
- [ ] **Test 2:** Programar fecha
- [ ] **Test 3:** Añadir contenido
- [ ] **Test 4:** Guardar
- [ ] **Test 5:** Verificar en calendario
- [ ] **Resultado esperado:** Publicación programada
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

## 🟢 PRIORIDAD BAJA - TESTING AVANZADO

### 11. **DASHBOARD EJECUTIVO** ⏳

#### 11.1 KPIs Globales
- [ ] **Test 1:** Ver dashboard CEO
- [ ] **Test 2:** Verificar métricas de todos los centros
- [ ] **Test 3:** Comprobar alertas críticas
- [ ] **Test 4:** Verificar tendencias
- [ ] **Resultado esperado:** Datos agregados correctamente
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

### 12. **REPORTES** ⏳

#### 12.1 Exportación
- [ ] **Test 1:** Generar reporte de empleados
- [ ] **Test 2:** Exportar a Excel
- [ ] **Test 3:** Verificar datos
- [ ] **Resultado esperado:** Exportación correcta
- [ ] **Resultado real:** _________________
- [ ] **Estado:** ⏳ Pendiente

---

## 📊 RESUMEN DE TESTING

### Por Prioridad
- **🔴 Crítico:** 5 tests (RRHH correcciones)
- **🟠 Alta:** 8 tests (RRHH general)
- **🟡 Media:** 10 tests (Otros módulos)
- **🟢 Baja:** 2 tests (Avanzado)

### Total: **25 grupos de tests**

---

## 📝 INSTRUCCIONES DE USO

1. **Imprimir este checklist** o tenerlo en pantalla
2. **Ejecutar tests en orden de prioridad**
3. **Marcar con ✅ los tests completados**
4. **Anotar resultados reales**
5. **Reportar bugs encontrados**
6. **Actualizar estado al finalizar cada grupo**

---

## 🐛 REGISTRO DE BUGS ENCONTRADOS

### Bug #1
- **Módulo:** _________________
- **Test:** _________________
- **Descripción:** _________________
- **Severidad:** 🔴 Crítico / 🟠 Alto / 🟡 Medio / 🟢 Bajo
- **Estado:** ⏳ Pendiente / 🔧 En corrección / ✅ Resuelto

### Bug #2
- **Módulo:** _________________
- **Test:** _________________
- **Descripción:** _________________
- **Severidad:** 🔴 Crítico / 🟠 Alto / 🟡 Medio / 🟢 Bajo
- **Estado:** ⏳ Pendiente / 🔧 En corrección / ✅ Resuelto

---

**Última actualización:** 17 de Noviembre de 2025, 07:30 CET  
**Responsable del testing:** Vicente (Director de Operaciones)  
**Soporte técnico:** Equipo de Desarrollo
