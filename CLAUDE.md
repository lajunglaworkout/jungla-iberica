# CLAUDE.md — CRM La Jungla Ibérica
> Contexto del proyecto para Claude AI. Actualizado: 25 Feb 2026

---

## 🗂️ Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Estado**: Zustand + React Context
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Netlify (frontend) + Supabase (backend)

---

## ✅ TABLAS REALES EN SUPABASE (verificadas 25 Feb 2026)

### 👥 RRHH
| Tabla | Uso |
|-------|-----|
| `employees` | Empleados (tabla principal) |
| `departments` | Departamentos |
| `employee_shifts` | Turnos asignados a empleados |
| `shifts` | Turnos disponibles |
| `timeclock_records` | Fichajes con QR |
| `employee_timeclock` | ❌ NO EXISTE → usar `timeclock_records` |
| `attendance_records` | Registros de asistencia |
| `daily_attendance` | Asistencia diaria |
| `vacation_requests` | Solicitudes de vacaciones |
| `uniform_requests` | Solicitudes de uniforme |
| `time_records` | Registros de tiempo |
| `pending_signatures` | Firmas pendientes |

### 🏢 CENTROS
| Tabla | Uso |
|-------|-----|
| `centers` | Centros de trabajo (tabla principal) |
| `centros` | ❌ NO EXISTE → usar `centers` |
| `qr_tokens` | Tokens QR para fichaje |
| `center_qr_tokens` | ❌ NO EXISTE → usar `qr_tokens` |
| `daily_checklists` | Checklists diarios |
| `checklist_incidents` | Incidencias de checklist |

### 💰 CONTABILIDAD / FINANZAS
| Tabla | Uso |
|-------|-----|
| `financial_data` | **Tabla principal de finanzas** (ingresos + gastos por centro/mes) |
| `center_monthly_financials` | ❌ NO EXISTE → usar `financial_data` |
| `accounting_data` | ❌ NO EXISTE → usar `financial_data` |
| `gastos_extras` | Gastos adicionales (FK a financial_data) |
| `gastos_marca` | Gastos de marca |
| `ingresos_marca` | Ingresos de marca |
| `monthly_cuotas` | Cuotas mensuales |
| `cuota_types` | Tipos de cuota |

#### Columnas de `financial_data`:
```
id, center_id, center_name, mes, año,
-- INGRESOS (suma = total ingresos):
nutricion, fisioterapia, entrenamiento_personal, entrenamientos_grupales, otros,
-- GASTOS:
alquiler, suministros, nominas, seguridad_social, marketing, mantenimiento, royalty, software_gestion,
created_at, updated_at
```
> ⚠️ `ingresos_sin_iva` NO EXISTE. Total ingresos = nutricion + fisioterapia + entrenamiento_personal + entrenamientos_grupales + otros

### 📦 LOGÍSTICA / INVENTARIO
| Tabla | Uso |
|-------|-----|
| `inventory_items` | Items de inventario (`quantity` es la columna real) |
| `inventory_movements` | Movimientos de inventario |
| `quarterly_reviews` | Revisiones trimestrales |
| `quarterly_review_items` | Items de revisión trimestral |
| `quarterly_inventory_assignments` | Asignaciones de revisión a empleados |
| `orders` | Pedidos (tipo: review_order, purchase, transfer) |
| `order_items` | Items de pedidos (FK a orders) |
| `stock_alerts` | Alertas de stock mínimo |
| `product_categories` | Categorías de producto |
| `suppliers` | Proveedores (tabla principal en inglés) |
| `proveedores` | ⚠️ EXISTE como tabla separada — verificar si hay duplicidad |
| `supplier_orders` | Pedidos a proveedores |
| `purchase_orders` | ❌ NO EXISTE → usar `orders` |

#### Columnas clave de `inventory_items`:
```
-- Columnas ESPAÑOLAS (originales):
id, nombre_item, categoria (texto libre, NO FK), proveedor, ubicacion, estado,
cantidad_actual, cantidad_inicial, deterioradas, codigo

-- Columnas INGLESAS (añadidas después — AMBAS EXISTEN):
quantity, purchase_price, sale_price, location, status, supplier

-- Otras:
center_id, min_stock, max_stock, created_at, updated_at
```
> ⚠️ NO existe: `name`, `sku`, `category_id`
> ✅ `cantidad_actual` SÍ existe (no fue eliminada). Usar `quantity` para nueva lógica.
> ✅ `categoria` es texto libre (no FK a product_categories)

### 📅 REUNIONES / TAREAS
| Tabla | Uso |
|-------|-----|
| `meetings` | Reuniones (tabla en inglés) |
| `reuniones` | ⚠️ EXISTE también — verificar coexistencia |
| `reuniones_accionistas` | Reuniones de accionistas |
| `meeting_objectives` | Objetivos de reunión |
| `meeting_bottlenecks` | Cuellos de botella |
| `meeting_metrics` | Métricas de reuniones |
| `tareas` | Tareas (tabla en español) |
| `objetivos` | Objetivos estratégicos |

### 🔧 MANTENIMIENTO
| Tabla | Uso |
|-------|-----|
| `maintenance_inspections` | Inspecciones de mantenimiento |
| `maintenance_inspection_items` | Items de inspección |
| `maintenance_tickets` | Tickets de mantenimiento |
| `maintenance_alerts` | Alertas de mantenimiento |
| `maintenance_concepts` | Conceptos de mantenimiento |
| `maintenance_zones` | Zonas de mantenimiento |
| `quarterly_maintenance_assignments` | Asignaciones trimestrales mantenimiento |
| `quarterly_maintenance_items` | Items de mantenimiento trimestral |
| `quarterly_maintenance_reviews` | Revisiones de mantenimiento |

### 🎓 ACADEMY
| Tabla | Uso |
|-------|-----|
| `academy_lessons` | Lecciones |
| `academy_modules` | Módulos |
| `academy_tasks` | Tareas de academy |
| `academy_shared_content` | Contenido compartido |

### 🔐 SISTEMA / AUTH
| Tabla | Uso |
|-------|-----|
| `users` | Usuarios del sistema |
| `notifications` | Notificaciones |
| `incidents` | Incidencias |
| `incident_categories` | Categorías de incidencia |
| `incident_types` | Tipos de incidencia |

---

## ❌ TABLAS QUE NO EXISTEN (errores confirmados)

```
purchase_orders     → usar orders
center_monthly_financials → usar financial_data
accounting_data     → usar financial_data
centros             → usar centers
empleados           → usar employees
employee_timeclock  → usar timeclock_records
center_qr_tokens    → usar qr_tokens
name                → en inventory_items NO existe, usar nombre_item
sku                 → en inventory_items NO existe, usar codigo
category_id         → en inventory_items NO existe, categoria es texto libre
ingresos_sin_iva    → columna no existe en financial_data, calcular suma de campos
```

---

## 🔑 Roles del Sistema
- `superadmin` — CEO (Carlos)
- `admin` — Administración
- `manager` — Manager
- `center_manager` — Responsable de centro (ej: Francisco)
- `employee` — Empleado

---

## 📁 Estructura de Módulos Clave
```
src/
├── components/
│   ├── logistics/          # LogisticsManagementSystem, OrderManagement, QuarterlyReviewForm
│   ├── hr/                 # RRHH, fichaje, turnos, nóminas
│   ├── centers/            # Dashboard por centro
│   ├── franquiciados/      # FranquiciadoDashboard
│   ├── maintenance/        # Tickets, inspecciones
│   └── ExecutiveDashboard  # Vista CEO
├── services/
│   └── quarterlyInventoryService.ts  # Lógica revisión trimestral
├── contexts/
│   └── SessionContext.tsx  # Auth + roles
└── lib/
    └── supabase.ts         # Cliente Supabase
```

---

## ⚠️ Reglas para Futuros Cambios
1. **Antes de usar `.from('tabla')`** — verificar que la tabla existe en esta lista
2. **Si vas a usar una tabla nueva** — confirmar primero con SQL: `SELECT COUNT(*) FROM tabla`
3. **Nunca usar** las tablas de la lista ❌ de arriba
4. **Para finanzas** siempre usar `financial_data`, nunca `accounting_data` ni `center_monthly_financials`
5. **Para inventario** siempre usar `quantity`, nunca `cantidad_actual`
