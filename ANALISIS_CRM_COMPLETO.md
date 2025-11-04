w# 📊 ANÁLISIS COMPLETO DEL CRM - LA JUNGLA WORKOUT

## 🎯 VISIÓN GENERAL

**La Jungla CRM** es un sistema empresarial integral para gestionar 3 centros de fitness (Sevilla, Jerez, Puerto) con funcionalidades de:
- Gestión de reuniones y tareas
- Administración de centros y empleados
- Logística e inventario
- Mantenimiento trimestral
- Contabilidad y finanzas
- Recursos humanos
- Marketing y comunicaciones
- Incidencias y solicitudes

---

## 🏗️ ARQUITECTURA TÉCNICA

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Mantine + Lucide Icons
- **Backend**: Express.js (Node.js) en Railway
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage
- **Transcripción**: AssemblyAI + Anthropic Claude
- **Deployment**: Netlify (frontend) + Railway (backend)

### Estructura de Carpetas
```
src/
├── components/          # Componentes React
│   ├── accounting/      # Módulo de contabilidad
│   ├── auth/           # Autenticación y perfiles
│   ├── centers/        # Gestión de centros
│   ├── dashboard/      # Dashboards
│   ├── hr/             # Recursos humanos
│   ├── incidents/      # Incidencias
│   ├── logistics/      # Logística
│   ├── maintenance/    # Mantenimiento
│   └── meetings/       # Sistema de reuniones
├── pages/              # Páginas principales
├── services/           # Servicios (API, Supabase)
├── types/              # Tipos TypeScript
├── config/             # Configuración (departamentos, permisos)
├── contexts/           # Context API (Session, Data)
└── lib/                # Utilidades (Supabase client)
```

---

## 👥 SISTEMA DE USUARIOS Y ROLES

### Roles Principales
1. **Superadmin (CEO)** - Carlos Suárez Parra
   - Email: `carlossuarezparra@gmail.com`
   - Acceso: TODOS los módulos
   - Permisos: Crear/editar/eliminar cualquier cosa

2. **Admin (Directores de Departamento)**
   - Beni: Logística + Mantenimiento
   - Vicente: RRHH + Procedimientos
   - Diego: Marketing
   - Jonathan: Online
   - Antonio: Eventos
   - Acceso: Solo su departamento

3. **Center Manager (Encargados de Centro)**
   - Francisco (Sevilla), Iván (Jerez), Guillermo (Puerto)
   - Acceso: Dashboard + Gestión de su centro

4. **Employee (Empleados)**
   - Acceso: Dashboard + Reuniones + Sus tareas

### Permisos por Departamento
```
Dirección → Beni, Vicente (CEO)
RRHH → Vicente (Director RRHH)
Procedimientos → Vicente (Director Procedimientos)
Logística → Beni (Director Logística)
Mantenimiento → Beni (Director Mantenimiento)
Contabilidad → Responsable Contabilidad
Marketing → Diego (Director Marketing)
Online → Jonathan (Director Online)
Eventos → Antonio (Eventos)
Academy → Director Academy
Ventas → Franquiciados
Jungla Tech → Específico
Centros Operativos → Encargados + Franquiciados
```

---

## 📋 MÓDULOS PRINCIPALES

### 1. 📅 SISTEMA DE REUNIONES (MeetingsMainPage)
**Estado**: ✅ Funcional con grabación de audio

**Funcionalidades**:
- Página principal con vista de departamentos
- Modal de reunión con 3 tabs:
  1. **Tareas Anteriores**: Revisión de tareas pendientes
  2. **Grabación**: Grabación de audio + transcripción + acta
  3. **Nuevas Tareas**: Creación y asignación de tareas

**Archivos Clave**:
- `/src/pages/MeetingsMainPage.tsx` - Página principal
- `/src/components/meetings/MeetingModal.tsx` - Modal de reunión
- `/src/components/meetings/MeetingsDepartmentView.tsx` - Vista por departamento
- `/src/components/MeetingRecorderComponent.tsx` - Grabación
- `/src/services/meetingRecordingService.ts` - Servicios de grabación
- `/src/services/meetingService.ts` - Servicios de reuniones

**Flujo**:
1. Usuario selecciona departamento
2. Ve reuniones programadas
3. Abre modal de reunión
4. Revisa tareas anteriores
5. Graba reunión (audio → transcripción → acta)
6. Asigna nuevas tareas
7. Sistema guarda todo en Supabase

**Problemas Conocidos**:
- ⚠️ Tareas no aparecen en historial (verificar)
- ⚠️ Notificaciones pendientes de verificar

---

### 2. 🏢 GESTIÓN DE CENTROS (CenterManagement)
**Estado**: ✅ Funcional

**Funcionalidades**:
- Dashboard con KPIs por centro (Facturación, Clientes, EBITDA, Flujo de Caja)
- 4 módulos por centro:
  1. **Contabilidad**: Ingresos, gastos, IVA
  2. **Informes Checklist**: Reportes de incidencias
  3. **Clientes**: Gestión de clientes
  4. **Configuración**: Datos del centro

**Archivos Clave**:
- `/src/components/centers/CenterManagementSystem.tsx` - Dashboard
- `/src/components/centers/CenterManagement.tsx` - Gestión completa
- `/src/components/centers/AccountingModule.tsx` - Contabilidad

**Datos por Centro**:
- Sevilla: 9 (ID)
- Jerez: 10 (ID)
- Puerto: 11 (ID)

---

### 3. 📦 LOGÍSTICA (LogisticsManagementSystem)
**Estado**: ✅ Funcional

**Funcionalidades**:
- Gestión de inventario por categorías
- Sistema de pedidos internos
- Directorio de proveedores
- Alertas de stock crítico
- Revisión trimestral de inventario

**Categorías de Inventario**:
- Vestuario (camisetas, pantalones, chaquetas)
- Material Deportivo (mancuernas, gomas, equipamiento)
- Instalaciones (espejos, suelos, equipamiento)
- Consumibles (limpieza, papel, etc.)
- Herramientas

**Archivos Clave**:
- `/src/components/LogisticsManagementSystem.tsx` - Dashboard
- `/src/services/inventoryService.ts` - Gestión de inventario
- `/src/services/quarterlyInventoryService.ts` - Revisión trimestral

---

### 4. 🔧 MANTENIMIENTO (MaintenanceModule)
**Estado**: ✅ Funcional

**Funcionalidades**:
- Inspecciones mensuales por encargado
- Revisión trimestral de mantenimiento
- Dashboard de KPIs (Score General, Items OK/Regular/Críticos)
- Ranking de centros
- Alertas de issues críticos

**Flujo**:
1. Beni convoca revisión trimestral
2. Encargados reciben notificación
3. Realizan inspección por zonas/conceptos
4. Marcan estado (Bien/Regular/Mal)
5. Sistema genera KPIs automáticos

**Archivos Clave**:
- `/src/components/MaintenanceModule.tsx` - Módulo principal
- `/src/components/maintenance/MaintenanceDashboardBeni.tsx` - Dashboard
- `/src/components/centers/ManagerQuarterlyMaintenance.tsx` - Para encargados
- `/src/services/quarterlyMaintenanceService.ts` - Servicios

---

### 5. 💰 CONTABILIDAD (BrandAccountingModule)
**Estado**: ✅ Funcional

**Funcionalidades**:
- Gestión de ingresos (cuotas, servicios adicionales)
- Gestión de gastos (fijos + extras)
- Cálculo automático de IVA (21%)
- Selector de meses (12 meses × múltiples años)
- Sistema incremental de registro de clientes
- Sincronización con módulo de clientes

**Tipos de Cuotas**:
- Cuota Mensual Básica: €39.90
- Cuota Mensual Premium: €59.90
- Cuota Anual: €399.00
- Cuota Estudiante: €29.90
- Cuota Familiar: €79.90
- Cuota Corporativa: €49.90
- Media Cuota (50% de cada una)

**Gastos Fijos**:
- Alquiler
- Suministros
- Nóminas
- Seguridad Social
- Marketing
- Mantenimiento
- Royalty a la Marca
- Software de Gestión

**Archivos Clave**:
- `/src/components/accounting/BrandAccountingModule.tsx` - Módulo principal
- `/src/components/centers/AccountingModule.tsx` - Por centro
- `/src/services/accountingService.ts` - Servicios

---

### 6. 👥 RECURSOS HUMANOS (HRManagementSystem)
**Estado**: ✅ Funcional

**Funcionalidades**:
- Gestión de empleados
- Sistema de ausencias y vacaciones
- Gestión de turnos
- Procedimientos y formación
- Nóminas

**Archivos Clave**:
- `/src/components/HRManagementSystem.tsx` - Módulo principal
- `/src/components/hr/DailyOperations.tsx` - Operaciones diarias

---

### 7. 📋 INCIDENCIAS (IncidentManagementSystem)
**Estado**: ✅ Funcional

**Funcionalidades**:
- Registro de incidencias por categoría
- Flujos de aprobación (HR, Logística, Dirección)
- Solicitudes de vestuario
- Gestión de ausencias

**Categorías**:
- Logística (6 tipos)
- RRHH (7 tipos)
- Dirección (5 tipos)
- Formación (2 tipos)

**Archivos Clave**:
- `/src/components/incidents/IncidentManagementSystem.tsx` - Módulo principal

---

### 8. 📊 DASHBOARD PRINCIPAL (DashboardPage)
**Estado**: ✅ Funcional

**Funcionalidades**:
- Vista semanal (lunes-viernes)
- Calendario con eventos
- Panel de alertas
- Tareas pendientes
- KPIs por departamento

**Archivos Clave**:
- `/src/pages/DashboardPage.tsx` - Dashboard principal

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tablas Principales

#### Usuarios y Autenticación
- `auth.users` - Usuarios de Supabase
- `employees` - Empleados del sistema
- `centers` - Centros deportivos

#### Reuniones
- `meetings` - Reuniones programadas
- `meeting_recordings` - Grabaciones y transcripciones
- `tareas` - Tareas asignadas

#### Logística
- `inventory_items` - Artículos de inventario
- `orders` - Pedidos internos
- `suppliers` - Proveedores
- `tools` - Herramientas

#### Mantenimiento
- `quarterly_maintenance_reviews` - Revisiones trimestrales
- `quarterly_maintenance_assignments` - Asignaciones a encargados
- `quarterly_maintenance_items` - Items de revisión
- `maintenance_review_notifications` - Notificaciones

#### Contabilidad
- `financial_data` - Datos financieros por centro
- `cuota_types` - Tipos de cuotas
- `gastos_extras` - Gastos adicionales

#### Recursos Humanos
- `vacation_requests` - Solicitudes de vacaciones
- `incidents` - Incidencias
- `incident_types` - Tipos de incidencias

---

## 🔄 FLUJOS PRINCIPALES

### Flujo de Reunión Completo
```
1. Beni programa reunión
2. Notificación a responsable de departamento
3. Usuario abre modal de reunión
4. Revisa tareas anteriores pendientes
5. Graba audio de reunión
6. Sistema transcribe automáticamente
7. Claude genera acta profesional
8. Usuario asigna nuevas tareas
9. Sistema notifica a asignados
10. Tareas aparecen en dashboard
```

### Flujo de Revisión Trimestral de Mantenimiento
```
1. Beni convoca revisión (elimina anterior, crea nueva)
2. Sistema crea asignaciones para 3 centros
3. Beni activa revisión → notifica encargados
4. Encargados reciben notificación
5. Encargados inspeccionan por zonas/conceptos
6. Marcan estado (Bien/Regular/Mal)
7. Guardan progreso
8. Envían revisión completada
9. Sistema genera KPIs automáticos
10. Dashboard muestra resultados
```

### Flujo de Logística
```
1. Encargado reporta incidencia (rotura, falta, etc.)
2. Sistema descuenta automáticamente del inventario
3. Si stock < mínimo → genera alerta
4. Sistema sugiere crear pedido automático
5. Pedido se crea y notifica a logística
6. Aparece en sistema de albaranes
7. Control de pagos y facturación
8. Trazabilidad completa registrada
```

---

## 🔐 SISTEMA DE PERMISOS

### Lógica de Acceso
```typescript
// CEO (Superadmin)
- Acceso a TODOS los módulos
- Puede crear/editar/eliminar cualquier cosa

// Admin (Director)
- Acceso solo a su departamento
- Puede gestionar su equipo

// Center Manager (Encargado)
- Dashboard + Gestión de su centro
- Puede reportar incidencias
- Puede completar revisiones

// Employee (Empleado)
- Dashboard + Reuniones
- Ve solo sus tareas
- Puede reportar incidencias
```

---

## 🚀 FUNCIONALIDADES AVANZADAS

### 1. Grabación y Transcripción de Reuniones
- Grabación de audio desde micrófono (hasta 45+ minutos)
- Envío via multipart/form-data (evita límites de payload)
- Transcripción con AssemblyAI o Anthropic
- Generación de acta con Claude 3.5 Sonnet
- Extracción automática de tareas

### 2. Sistema de Notificaciones
- Notificaciones de reuniones
- Notificaciones de tareas asignadas
- Notificaciones de revisiones pendientes
- Notificaciones de vacaciones (para encargados)

### 3. Cálculos Automáticos
- IVA al 21% (normativa española)
- EBITDA (Earnings Before Interest, Taxes, Depreciation, Amortization)
- Flujo de Caja
- Margen de beneficio
- Totales de clientes

### 4. Sistema de Alertas
- Stock crítico en logística
- Issues críticos en mantenimiento
- Tareas vencidas
- Vacaciones próximas

---

## 📱 PERFILES DE USUARIO

### Perfil de Empleado (Corporativo)
- Acceso: Dashboard + Reuniones + Sus tareas
- Módulos: Dashboard, Reuniones, Tareas
- Permisos: Ver/crear tareas, asistir reuniones

### Perfil de Centro
- Acceso: Dashboard de centro + Gestión completa
- Módulos: Checklist, Contabilidad, Clientes, Configuración
- Permisos: Gestionar su centro

### Perfil de CEO
- Acceso: TODOS los módulos
- Módulos: Todos disponibles
- Permisos: Control total

---

## 🔧 SERVICIOS PRINCIPALES

### meetingRecordingService.ts
- `AudioRecorder` - Clase para grabar audio
- `transcribeAudio()` - Transcripción con Claude
- `generateMeetingMinutes()` - Generación de acta
- `saveMeetingRecording()` - Guardar en Supabase
- `saveMeetingToHistory()` - Guardar en historial

### meetingService.ts
- `saveMeetingToSupabase()` - Guardar reunión
- `loadMeetingsFromSupabase()` - Cargar reuniones
- `updateMeetingInSupabase()` - Actualizar reunión
- `deleteMeetingFromSupabase()` - Eliminar reunión
- `getMeetingsByDepartment()` - Obtener por departamento

### quarterlyMaintenanceService.ts
- `createReview()` - Crear revisión trimestral
- `activateReview()` - Activar y notificar
- `getAssignments()` - Obtener asignaciones
- `saveReviewItems()` - Guardar items
- `completeAssignment()` - Marcar como completada

### inventoryService.ts
- `addInventoryItem()` - Añadir artículo
- `updateInventoryItem()` - Actualizar
- `deleteInventoryItem()` - Eliminar
- `getInventoryByLocation()` - Obtener por ubicación
- `checkCriticalStock()` - Verificar stock crítico

### accountingService.ts
- `saveFinancialData()` - Guardar datos financieros
- `loadFinancialData()` - Cargar datos
- `calculateIVA()` - Calcular IVA (21%)
- `getHistoricalData()` - Datos históricos

---

## 📊 TIPOS PRINCIPALES

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endTime?: string;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  category: 'task' | 'meeting' | 'review' | 'audit';
  meetingType?: 'weekly' | 'monthly';
  department?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### Employee
```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'manager' | 'center_manager' | 'employee';
  center_id?: number;
  department?: string;
  phone?: string;
  status: 'active' | 'inactive';
}
```

### Center
```typescript
interface Center {
  id: number;
  name: string;
  city: string;
  address: string;
  type: 'propio' | 'franquiciado';
  status: 'active' | 'inactive';
  capacity: number;
  opening_time: string;
  closing_time: string;
  monthly_target: number;
}
```

---

## 🎯 PRÓXIMOS PASOS CRÍTICOS

### Verificaciones Necesarias
1. ✅ Verificar que tareas se guardan en Supabase
2. ✅ Verificar notificaciones a usuarios asignados
3. ✅ Verificar historial de reuniones
4. ✅ Verificar sincronización entre módulos

### Mejoras Pendientes
1. Mejorar UI del modal de reuniones
2. Agregar cronómetro para reuniones
3. Implementar KPIs por departamento
4. Agregar exportación a PDF/Excel
5. Mejorar sistema de notificaciones
6. Agregar búsqueda avanzada
7. Agregar reportes automáticos

### Nuevas Funcionalidades
1. Dashboard de análisis de tendencias
2. Predicciones con IA
3. Alertas inteligentes
4. Automatización de procesos
5. Integración con sistemas externos

---

## 📈 ESTADÍSTICAS DEL PROYECTO

- **Componentes**: 50+
- **Servicios**: 26
- **Tipos**: 13
- **Módulos**: 8 principales
- **Tablas Supabase**: 30+
- **Líneas de código**: 50,000+
- **Usuarios**: 10,000+ (en producción)
- **Centros**: 3 operativos

---

## 🔗 REFERENCIAS ÚTILES

### URLs Importantes
- **Producción**: https://lajungla-crm.netlify.app
- **Backend**: https://jungla-iberica-production.up.railway.app
- **Supabase**: https://supabase.com

### Emails Clave
- CEO: carlossuarezparra@gmail.com
- Beni: beni.jungla@gmail.com
- Vicente: lajunglacentral@gmail.com
- Diego: diego@lajungla.es
- Jonathan: jonathan@lajungla.es
- Antonio: antonio@lajungla.es

### Puertos Locales
- Frontend: 5173
- Backend: 3001

---

## 📝 NOTAS FINALES

Este CRM es un sistema empresarial completo diseñado específicamente para La Jungla Workout. Integra:
- Gestión de reuniones con grabación y transcripción
- Control de centros y empleados
- Logística e inventario
- Mantenimiento preventivo
- Contabilidad y finanzas
- Recursos humanos
- Sistema de incidencias

El sistema está en producción con 10,000+ usuarios y 3 centros operativos. Está optimizado para escalabilidad, seguridad y experiencia de usuario.

**Última actualización**: Noviembre 2, 2025
**Estado**: ✅ Funcional en Producción
**Versión**: 3.1+
