# 🔍 INFORME DE AUDITORÍA — CRM La Jungla Ibérica
**Fecha:** 22 de febrero de 2026  
**Auditor:** Ingeniero QA & Seguridad Senior (Antigravity AI)  
**Entorno:** Local (`http://localhost:5173/`) — Versión `v3.6.10-NOTIF-FIX`  
**Credenciales usadas:** `carlossuarezparra@gmail.com` (Superadmin / CEO)

---

## 📊 Resumen Ejecutivo

| Categoría | Total |
|---|---|
| 🔴 Errores Críticos | 3 |
| 🟠 Vulnerabilidades de Seguridad | 6 |
| 🟡 Mejoras de Diseño UI/UX | 8 |

---

## 🔴 ERRORES CRÍTICOS (Consola / Funcionalidad Rota)

### CRIT-01 — Logística → Historial: Fallo total de carga
- **Módulo:** Logística → Historial de Movimientos
- **Error:** Supabase `PGRST200` — Error 400 (Bad Request)
- **Detalle:** La query intenta hacer un JOIN entre `inventory_movements` e `inventory_items`, pero la relación de clave foránea no está configurada en el esquema público de Supabase.
- **Hint del servidor:** `"Perhaps you meant 'inventory_items' instead of 'inventory_movements'"`
- **Impacto:** El historial de movimientos de inventario **no carga ningún dato**. El módulo está completamente roto.
- **Archivo afectado:** `src/services/inventoryMovementService.ts`
- **Acción requerida:** Crear la FK `inventory_movements.inventory_item_id → inventory_items.id` en Supabase, o exponer la relación manualmente en el esquema.

---

### CRIT-02 — Academy: Fallo al cargar tutores
- **Módulo:** Academy
- **Error:** Supabase Error 400 al consultar la tabla `academy_tutors`
- **Impacto:** El módulo de Academy no puede listar tutores. El resto del dashboard de Academy carga parcialmente.
- **Acción requerida:** Verificar que la tabla `academy_tutors` existe en Supabase y tiene los permisos RLS adecuados.

---

### CRIT-03 — Footer: Placeholder `__BUILD_DATE__` sin resolver
- **Módulo:** Global (todas las páginas)
- **Detalle:** El footer muestra `v3.6.10-NOTIF-FIX · __BUILD_DATE__` en lugar de la fecha real del build.
- **Archivo afectado:** `src/version.ts` o el script de build en `vite.config.ts`
- **Impacto:** Bajo a nivel funcional, pero genera una impresión de software sin terminar en producción.
- **Acción requerida:** Configurar el plugin de Vite para inyectar la fecha de build en la variable `BUILD_DATE`.

---

## 🟠 VULNERABILIDADES DE SEGURIDAD

### SEC-01 — API Key de Google expuesta en el bundle del frontend
- **Archivo:** `src/services/marketingService.ts` (línea 428)
- **Código:** `const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;`
- **Riesgo:** Cualquier usuario puede extraer la API Key de Google del bundle JavaScript compilado. Esto permite el uso no autorizado y la facturación contra la cuenta del proyecto.
- **Recomendación:** Mover la llamada a Google API al backend (proxy) y eliminar la variable `VITE_GOOGLE_API_KEY` del frontend.

### SEC-02 — Token de Instagram almacenado en localStorage sin cifrar
- **Archivos:** `src/components/marketing/MarketingAnalyticsDashboard.tsx`, `src/components/marketing/StrategyHub.tsx`
- **Código:** `localStorage.setItem('ig_access_token', newAccessToken);`
- **Riesgo:** Los tokens de acceso a Instagram se almacenan en `localStorage` en texto plano. Cualquier extensión de navegador o script XSS podría leerlos.
- **Recomendación:** Almacenar tokens sensibles en cookies `httpOnly` o en el backend.

### SEC-03 — Datos de clientes sincronizados a localStorage
- **Archivos:** `src/components/centers/AccountingModule.tsx` (línea 759), `src/components/centers/ClientsModule.tsx`
- **Código:** `localStorage.setItem('clients_sync_${centerId}', JSON.stringify(clientsData));`
- **Riesgo:** Datos de clientes completos (potencialmente con información personal) se almacenan en `localStorage`, accesible a cualquier script del dominio.
- **Recomendación:** Usar IndexedDB con cifrado o eliminar la sincronización local si no es estrictamente necesaria.

### SEC-04 — `localStorage.clear()` en módulos de RRHH (Destrucción de sesión)
- **Archivos:** `src/components/hr/ShiftAssignmentSystem.tsx` (línea 468), `src/components/hr/ShiftCalendarClean.tsx` (línea 373), `src/components/hr/SimpleShiftCalendar.tsx` (línea 71)
- **Riesgo:** Estos componentes ejecutan `localStorage.clear()` como mecanismo de "recuperación de errores", lo que borra **todo** el almacenamiento local, incluyendo la sesión de Supabase Auth. Esto provoca un logout inesperado del usuario.
- **Recomendación:** Eliminar solo las claves específicas del módulo en lugar de usar `clear()`.

### SEC-05 — Información de debug de autenticación en consola
- **Archivo:** `src/App.tsx` (líneas 122-133)
- **Código:** `console.log('Estado de autenticación:', { isAuthenticated, userRole, employee: { id, name, email, role } })`
- **Riesgo:** En producción, la consola del navegador muestra el email, ID, nombre y rol del usuario autenticado. Esto facilita ataques de ingeniería social y reconocimiento.
- **Recomendación:** Envolver estos logs en una condición `if (import.meta.env.DEV)`.

### SEC-06 — Control de acceso solo en el cliente (sin server-side guards)
- **Archivo:** `src/App.tsx` — función `getAvailableModules()` (líneas 260-624)
- **Detalle:** La visibilidad de los módulos (CEO, Admin, Empleado) se controla **exclusivamente** en el frontend. No existe ningún middleware o Row Level Security (RLS) en Supabase que impida a un usuario con rol `employee` acceder a datos de módulos de CEO si manipula las peticiones directamente.
- **Riesgo:** Un atacante podría usar las credenciales de un empleado para hacer queries directas a Supabase y acceder a datos de todos los módulos.
- **Recomendación:** Implementar políticas RLS en Supabase basadas en el campo `role` del token JWT.

---

## 🟡 MEJORAS DE DISEÑO UI/UX

### UX-01 — Sidebar demasiado larga (13+ items, requiere scroll constante)
- **Módulo:** Navegación global
- **Detalle:** El menú lateral tiene más de 13 módulos para el rol de CEO. Los módulos inferiores (Academy, Online, Eventos) solo son accesibles haciendo scroll. Esto ralentiza la navegación.
- **Recomendación:** Agrupar módulos en categorías colapsables (ej. "Operaciones", "Gestión", "Comunicación").

### UX-02 — Saludo redundante en header
- **Módulo:** Reuniones (y otros)
- **Detalle:** Aparece "Bienvenido de nuevo, carlossuarezparra" tanto en el header principal como en el sub-header del módulo.
- **Recomendación:** Eliminar el saludo del sub-header del módulo, dejarlo solo en el header global.

### UX-03 — Calendario semanal muestra semana anterior
- **Módulo:** Dashboard
- **Detalle:** Hoy es domingo 22/02, pero el calendario semanal muestra la semana del 16-20/02.
- **Recomendación:** Ajustar la lógica para que siempre muestre la semana actual o la próxima.

### UX-04 — Tareas vencidas acumuladas sin gestión automática
- **Módulo:** Mis Tareas
- **Detalle:** Se muestran múltiples tareas con etiqueta "(Vencida)" de finales de 2025. No hay un mecanismo para archivarlas o marcarlas como caducadas automáticamente.
- **Recomendación:** Implementar archivado automático o un filtro "Ocultar vencidas" por defecto.

### UX-05 — Botones de acción aglomerados en tarjetas de tareas
- **Módulo:** Mis Tareas
- **Detalle:** Los botones "Completar" y "Eliminar" están muy juntos en la misma línea, especialmente en viewports estándar.
- **Recomendación:** Usar un menú contextual (3 puntos) o separar los botones con más padding.

### UX-06 — Dashboard Inteligente sin datos de atletas
- **Módulo:** Dashboard Inteligente
- **Detalle:** Los KPIs de los centros Jerez, Puerto y Sevilla muestran "0 atletas" y "No atletas data" porque la tabla `wodbuster_snapshots` no tiene datos.
- **Recomendación:** Mostrar un estado vacío informativo ("Sin datos de Wodbuster configurados") en lugar de KPIs en cero.

### UX-07 — Mantenimiento: Carga lenta (>5 segundos)
- **Módulo:** Mantenimiento (Director Dashboard)
- **Detalle:** El panel de dirección tarda más de 5 segundos en cargar, probablemente por queries pesadas o múltiples peticiones secuenciales.
- **Recomendación:** Optimizar queries (paginación, índices) o añadir un skeleton loader claro.

### UX-08 — `App.tsx` monolítico (1564 líneas)
- **Archivo:** `src/App.tsx`
- **Detalle:** El archivo principal contiene toda la lógica de routing, módulos, y rendering en un solo fichero de 1564 líneas. Esto dificulta el mantenimiento y aumenta el riesgo de bugs.
- **Recomendación:** Separar en archivos: `Router.tsx`, `ModuleRegistry.ts`, `Sidebar.tsx`, `AuthGuard.tsx`.

---

## 📋 Estado de Todos los Módulos Auditados

| # | Módulo | Estado | Notas |
|---|---|---|---|
| 1 | Dashboard | ✅ OK | Funcional. Footer con placeholder. |
| 2 | Mis Tareas | ✅ OK | Funcional. Tareas vencidas acumuladas. |
| 3 | Reuniones | ✅ OK | Funcional. Saludo duplicado. |
| 4 | Dashboard Inteligente | ⚠️ Warning | Carga OK pero sin datos de atletas. |
| 5 | Gestión de Accesos | ✅ OK | Lista de usuarios operativa. |
| 6 | RRHH y Procedimientos | ✅ OK | Portal del empleado funcional. |
| 7 | Logística → Inventario | ✅ OK | 221 items cargados correctamente. |
| 8 | Logística → Revisión Trimestral | ✅ OK | Vista Q1-2026 funcional. |
| 9 | Logística → Historial | ❌ ERROR | **Fallo crítico de BD (PGRST200).** |
| 10 | Logística → Pedidos | ✅ OK | Tres sub-pestañas funcionales. |
| 11 | Logística → Herramientas | ✅ OK | 2 herramientas listadas. |
| 12 | Logística → Proveedores | ✅ OK | Interfaz lista para proveedores. |
| 13 | Mantenimiento | ⚠️ Warning | Funcional pero carga lenta (>5s). |
| 14 | Marketing | ✅ OK | Dashboard operativo. |
| 15 | Centros | ✅ OK | Sistema de centros funcional. |
| 16 | Gestión de Marca | ✅ OK | Módulo de contabilidad operativo. |
| 17 | Incidencias | ✅ OK | Sistema de incidencias funcional. |
| 18 | Academy | ⚠️ Warning | Error al cargar tutores (tabla). |
| 19 | La Jungla Online | ✅ OK | Dashboard online funcional. |
| 20 | Eventos | ✅ OK | Panel de eventos operativo. |

---

## 🏁 Conclusión

El CRM está **operativo en un 85%** de sus módulos. Los problemas más urgentes son:

1. **Arreglar la FK** entre `inventory_movements` e `inventory_items` en Supabase (CRIT-01).
2. **Crear/verificar la tabla `academy_tutors`** en Supabase (CRIT-02).
3. **Mover la Google API Key** del frontend al backend (SEC-01).
4. **Implementar RLS** en Supabase para control de acceso real (SEC-06).

Los problemas de UI/UX son de prioridad media y pueden abordarse progresivamente.
