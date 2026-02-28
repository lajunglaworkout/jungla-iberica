import { DepartmentObjective, RecurringTask } from './MeetingModalTypes';

export const OBJECTIVES_BY_DEPT: Record<string, DepartmentObjective[]> = {
  contabilidad: [
    { nombre: 'Facturación total centros', tipo: 'numero', unidad: '€', placeholder: 'Ej: 45000' },
    { nombre: 'Gastos pendientes de apuntar', tipo: 'numero', unidad: '€', placeholder: 'Ej: 1200' },
    { nombre: 'Ratio ingresos/gastos', tipo: 'porcentaje', placeholder: 'Ej: 68' }
  ],
  mantenimiento: [
    { nombre: 'Incidencias abiertas', tipo: 'numero', unidad: 'incidencias', placeholder: 'Ej: 4' },
    { nombre: 'Incidencias resueltas esta semana', tipo: 'numero', unidad: 'incidencias', placeholder: 'Ej: 7' },
    { nombre: 'Estado general instalaciones', tipo: 'porcentaje', placeholder: 'Ej: 85' }
  ],
  ventas: [
    { nombre: 'Ventas cerradas', tipo: 'numero', unidad: '€', placeholder: 'Ej: 15000' },
    { nombre: 'Leads contactados', tipo: 'numero', unidad: 'leads', placeholder: 'Ej: 25' },
    { nombre: 'Tasa de conversión', tipo: 'porcentaje', placeholder: 'Ej: 35' }
  ],
  marketing: [
    { nombre: 'Alcance total redes', tipo: 'numero', unidad: 'personas', placeholder: 'Ej: 50000' },
    { nombre: 'Engagement rate', tipo: 'porcentaje', placeholder: 'Ej: 4.5' },
    { nombre: 'Leads generados', tipo: 'numero', unidad: 'leads', placeholder: 'Ej: 120' }
  ],
  rrhh: [
    { nombre: 'Absentismo acumulado', tipo: 'numero', unidad: 'días', placeholder: 'Ej: 3' },
    { nombre: 'Incidencias de personal', tipo: 'numero', unidad: 'incidencias', placeholder: 'Ej: 1' },
    { nombre: 'Satisfacción del equipo', tipo: 'porcentaje', placeholder: 'Ej: 80' }
  ],
  procedimientos: [
    { nombre: 'Procedimientos actualizados', tipo: 'numero', unidad: 'documentos', placeholder: 'Ej: 5' },
    { nombre: 'Formaciones completadas', tipo: 'numero', unidad: 'sesiones', placeholder: 'Ej: 3' },
    { nombre: 'Cumplimiento normativo', tipo: 'porcentaje', placeholder: 'Ej: 100' }
  ],
  logistica: [
    { nombre: 'Pedidos pendientes de envío', tipo: 'numero', unidad: 'pedidos', placeholder: 'Ej: 8' },
    { nombre: 'Artículos bajo mínimos', tipo: 'numero', unidad: 'artículos', placeholder: 'Ej: 12' },
    { nombre: 'Precisión de inventario', tipo: 'porcentaje', placeholder: 'Ej: 92' }
  ],
  operaciones: [
    { nombre: 'Ocupación media centros', tipo: 'porcentaje', placeholder: 'Ej: 75' },
    { nombre: 'Bajas de socios esta semana', tipo: 'numero', unidad: 'socios', placeholder: 'Ej: 5' },
    { nombre: 'Altas de socios esta semana', tipo: 'numero', unidad: 'socios', placeholder: 'Ej: 12' }
  ],
  direccion: [
    { nombre: 'Resultado operativo global', tipo: 'numero', unidad: '€', placeholder: 'Ej: 22000' },
    { nombre: 'Objetivos estratégicos completados', tipo: 'porcentaje', placeholder: 'Ej: 60' },
    { nombre: 'NPS / Satisfacción cliente', tipo: 'numero', unidad: 'puntos', placeholder: 'Ej: 8.5' }
  ]
};

export const RECURRING_TASKS_SIMPLE: Record<string, string[]> = {
  contabilidad: ['Revisar contabilidad', 'Pagos pendientes', 'Incidencias', 'Reconciliación bancaria'],
  marketing: ['Revisar campañas activas', 'Analizar métricas', 'Planificar contenido', 'Seguimiento leads'],
  rrhh: ['Revisar candidatos', 'Incidencias de personal', 'Nóminas', 'Evaluaciones'],
  ventas: ['Seguimiento de leads', 'Propuestas pendientes', 'Cierre de ventas', 'Reuniones programadas'],
  sales: ['Seguimiento de leads', 'Propuestas pendientes', 'Cierre de ventas', 'Reuniones programadas'],
  operaciones: ['Revisar incidencias', 'Mantenimiento', 'Inventario', 'Proveedores'],
  logistica: ['Revisar pedidos', 'Gestión de inventario', 'Proveedores', 'Envíos pendientes'],
  mantenimiento: ['Incidencias reportadas', 'Mantenimiento preventivo', 'Equipamiento', 'Proveedores de servicios'],
  procedimientos: ['Revisar procedimientos vigentes', 'Actualizar documentación', 'Formación del equipo', 'Auditorías internas']
};

export const RRHH_TASKS: RecurringTask[] = [
  { titulo: 'Incidencias de personal', notas: '', tipo: 'incidencias_personal', datos: { bajas_activas: 0, incidencias_pendientes: 0 } },
  { titulo: 'Incidencias en checklist a resolver', notas: '', tipo: 'checklist_incidencias', datos: {} },
  { titulo: 'Propuestas, sanciones, cambios de procedimientos', notas: '', tipo: 'propuestas_sanciones', datos: {} }
];

export const LOGISTICA_TASKS: RecurringTask[] = [
  { titulo: 'Pedidos recibidos y enviados', notas: '', tipo: 'pedidos_logistica', datos: {} },
  { titulo: 'Roturas o pérdidas', notas: '', tipo: 'roturas_perdidas', datos: {} },
  { titulo: 'Estimación de inversión - Materiales cerca de stock mínimo', notas: '', tipo: 'stock_minimo', datos: {} },
  { titulo: 'Envíos pendientes', notas: '', tipo: 'envios_pendientes', datos: {} }
];

export const MANTENIMIENTO_TASKS: RecurringTask[] = [
  { titulo: 'Incidencias abiertas / cerradas', notas: '', tipo: 'incidencias_mantenimiento', datos: {} },
  { titulo: 'Reparaciones pendientes', notas: '', tipo: 'reparaciones_pendientes', datos: {} },
  { titulo: 'Coste reparaciones', notas: '', tipo: 'coste_reparaciones', datos: {} }
];

export const CONTABILIDAD_TASKS: RecurringTask[] = [
  { titulo: 'Datos de centros activos', notas: '', tipo: 'datos_centros_contabilidad', datos: { centros: ['Sevilla', 'Jerez', 'Puerto'] } },
  { titulo: 'Pagos pendientes de apuntar', notas: '', tipo: 'pagos_pendientes', datos: {} },
  { titulo: 'Transferencias no recurrentes por autorizar', notas: '', tipo: 'transferencias_autorizar', datos: {} },
  { titulo: 'Gastos extra detectados', notas: '', tipo: 'gastos_extra', datos: {} }
];

export const OPERACIONES_TASKS: RecurringTask[] = [
  { titulo: 'Incidencias importantes', notas: '', tipo: 'incidencias_checklist_operaciones', datos: {} },
  { titulo: 'Tendencias de clientes / facturación', notas: '', tipo: 'tendencias_clientes', datos: { centros: ['Sevilla', 'Jerez', 'Puerto'] } },
  { titulo: 'Próximos eventos / actividades pendientes', notas: '', tipo: 'eventos_actividades', datos: {} },
  { titulo: 'Sugerencias o peticiones', notas: '', tipo: 'sugerencias_peticiones', datos: {} },
  { titulo: 'Comunicados con franquiciados', notas: '', tipo: 'comunicados_franquiciados', datos: {} }
];
