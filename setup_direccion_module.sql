-- ============================================
-- CONFIGURACIÓN MÓDULO DIRECCIÓN
-- ============================================
-- Tareas recurrentes y objetivos para reuniones de Dirección
-- ============================================

-- NOTA: Este script asume que las tablas recurring_tasks y department_objectives existen
-- Si no existen, primero hay que crearlas

-- 1. ELIMINAR TAREAS RECURRENTES ANTIGUAS DE DIRECCIÓN
-- DELETE FROM recurring_tasks WHERE departamento = 'direccion';

-- 2. CREAR TAREAS RECURRENTES PARA DIRECCIÓN

-- 2.1 Incidencias urgentes
INSERT INTO recurring_tasks (
  departamento,
  titulo,
  descripcion,
  tipo,
  requiere_datos,
  datos_esperados
) VALUES (
  'direccion',
  'Incidencias urgentes',
  'Revisar incidencias pendientes desde la última reunión. Se cargará automáticamente el número de incidencias generadas y los motivos de no cierre.',
  'incidencias',
  true,
  jsonb_build_object(
    'tipo', 'incidencias_pendientes',
    'campos', jsonb_build_array(
      jsonb_build_object('nombre', 'numero_incidencias', 'tipo', 'number', 'label', 'Nº Incidencias desde última reunión'),
      jsonb_build_object('nombre', 'incidencias_abiertas', 'tipo', 'number', 'label', 'Incidencias abiertas'),
      jsonb_build_object('nombre', 'motivos_no_cierre', 'tipo', 'textarea', 'label', 'Motivos de no cierre'),
      jsonb_build_object('nombre', 'comentarios', 'tipo', 'textarea', 'label', 'Comentarios adicionales')
    )
  )
);

-- 2.2 Revisión de contabilidad y clientes por centro
INSERT INTO recurring_tasks (
  departamento,
  titulo,
  descripcion,
  tipo,
  requiere_datos,
  datos_esperados
) VALUES (
  'direccion',
  'Revisión de contabilidad y clientes de cada centro',
  'Analizar datos contables y de clientes de cada centro. Se cargarán automáticamente los datos reales.',
  'contabilidad_centros',
  true,
  jsonb_build_object(
    'tipo', 'datos_por_centro',
    'centros', jsonb_build_array('Sevilla', 'Jerez', 'Puerto', 'Central'),
    'campos_por_centro', jsonb_build_array(
      jsonb_build_object('nombre', 'ingresos_mes', 'tipo', 'number', 'label', 'Ingresos del mes (€)', 'auto_load', true),
      jsonb_build_object('nombre', 'clientes_activos', 'tipo', 'number', 'label', 'Clientes activos', 'auto_load', true),
      jsonb_build_object('nombre', 'clientes_nuevos', 'tipo', 'number', 'label', 'Clientes nuevos', 'auto_load', true),
      jsonb_build_object('nombre', 'clientes_bajas', 'tipo', 'number', 'label', 'Bajas del mes', 'auto_load', true),
      jsonb_build_object('nombre', 'observaciones', 'tipo', 'textarea', 'label', 'Observaciones')
    )
  )
);

-- 2.3 Datos de cada departamento
INSERT INTO recurring_tasks (
  departamento,
  titulo,
  descripcion,
  tipo,
  requiere_datos,
  datos_esperados
) VALUES (
  'direccion',
  'Datos de rendimiento de cada departamento',
  'Revisar porcentajes de cumplimiento y KPIs de cada departamento para detectar problemas.',
  'rendimiento_departamentos',
  true,
  jsonb_build_object(
    'tipo', 'datos_por_departamento',
    'departamentos', jsonb_build_array('rrhh', 'procedimientos', 'logistica', 'mantenimiento', 'marketing', 'ventas'),
    'campos_por_departamento', jsonb_build_array(
      jsonb_build_object('nombre', 'porcentaje_cumplimiento', 'tipo', 'number', 'label', 'Cumplimiento (%)', 'auto_load', true, 'min', 0, 'max', 100),
      jsonb_build_object('nombre', 'tareas_completadas', 'tipo', 'number', 'label', 'Tareas completadas', 'auto_load', true),
      jsonb_build_object('nombre', 'tareas_pendientes', 'tipo', 'number', 'label', 'Tareas pendientes', 'auto_load', true),
      jsonb_build_object('nombre', 'cuellos_botella', 'tipo', 'number', 'label', 'Cuellos de botella', 'auto_load', true),
      jsonb_build_object('nombre', 'estado', 'tipo', 'select', 'label', 'Estado', 'opciones', jsonb_build_array('Óptimo', 'Normal', 'Requiere atención', 'Crítico')),
      jsonb_build_object('nombre', 'acciones', 'tipo', 'textarea', 'label', 'Acciones a tomar')
    )
  )
);

-- 3. ELIMINAR OBJETIVOS ANTIGUOS DE DIRECCIÓN
DELETE FROM department_objectives WHERE departamento = 'direccion';

-- 4. CREAR OBJETIVOS PARA DIRECCIÓN (Definición manual en reuniones)
INSERT INTO department_objectives (
  departamento,
  titulo,
  descripcion,
  tipo_valor,
  unidad,
  valor_objetivo,
  es_recurrente
) VALUES 
(
  'direccion',
  'Objetivo 1',
  'Definir en la reunión',
  'texto',
  NULL,
  NULL,
  true
),
(
  'direccion',
  'Objetivo 2',
  'Definir en la reunión',
  'texto',
  NULL,
  NULL,
  true
),
(
  'direccion',
  'Objetivo 3',
  'Definir en la reunión',
  'texto',
  NULL,
  NULL,
  true
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Tareas recurrentes de Dirección' as tipo, COUNT(*) as total 
FROM recurring_tasks 
WHERE departamento = 'direccion'
UNION ALL
SELECT 'Objetivos de Dirección' as tipo, COUNT(*) as total 
FROM department_objectives 
WHERE departamento = 'direccion';

-- Ver detalle de tareas recurrentes
SELECT id, titulo, tipo, requiere_datos
FROM recurring_tasks
WHERE departamento = 'direccion'
ORDER BY id;
