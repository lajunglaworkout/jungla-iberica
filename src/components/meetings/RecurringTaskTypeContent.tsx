/**
 * RecurringTaskTypeContent — Contenido expandible por tipo de tarea recurrente
 *
 * NOTA: Los campos "Cargando..." muestran datos que vienen de task.datos (cargados
 * por useMeetingModal.loadRecurringTasks). Para los tipos que no tienen integración
 * real con Supabase aún, el usuario puede rellenar las notas manualmente.
 *
 * TODOS los textareas están conectados a onNoteChange para que las notas se guarden.
 */
import React from 'react';
import { RecurringTask } from './MeetingModalTypes';

interface RecurringTaskTypeContentProps {
  task: RecurringTask;
  index: number;
  onNoteChange: (index: number, note: string) => void;
}

// Helper: textarea conectado que siempre guarda datos
const NotesTextarea: React.FC<{
  value: string;
  placeholder: string;
  index: number;
  onNoteChange: (index: number, note: string) => void;
}> = ({ value, placeholder, index, onNoteChange }) => (
  <textarea
    placeholder={placeholder}
    value={value || ''}
    onChange={(e) => onNoteChange(index, e.target.value)}
    style={{
      width: '100%',
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '13px',
      minHeight: '60px',
      marginTop: '8px',
      boxSizing: 'border-box',
      resize: 'vertical',
      fontFamily: 'inherit',
    }}
  />
);

// Helper: fila de dato con valor o "Sin datos"
const DataRow: React.FC<{ label: string; value?: string | number; color?: string }> = ({
  label, value, color = '#6b7280'
}) => (
  <div>
    <strong>{label}</strong>{' '}
    <span style={{ color: value !== undefined && value !== null && value !== '' ? color : '#9ca3af' }}>
      {value !== undefined && value !== null && value !== '' ? value : '—'}
    </span>
  </div>
);

export const RecurringTaskTypeContent: React.FC<RecurringTaskTypeContentProps> = ({
  task, index, onNoteChange
}) => {

  if (task.tipo === 'expandible_centros') {
    return (
      <div style={{ marginTop: '12px' }}>
        {task.datos?.centros?.map((centro: string) => (
          <details key={centro} style={{ marginBottom: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '8px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '4px' }}>
              🏢 {centro}
            </summary>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', marginTop: '4px' }}>
              <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                <DataRow label="💰 Ingresos mes:" value={task.datos?.valores?.[centro]?.ingresos} color="#059669" />
                <DataRow label="👥 Clientes activos:" value={task.datos?.valores?.[centro]?.clientes_activos} color="#3b82f6" />
                <DataRow label="✨ Clientes nuevos:" value={task.datos?.valores?.[centro]?.nuevos} color="#10b981" />
                <DataRow label="📉 Bajas del mes:" value={task.datos?.valores?.[centro]?.bajas} color="#ef4444" />
              </div>
            </div>
          </details>
        ))}
        <NotesTextarea value={task.notas} placeholder="Observaciones sobre los centros..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'expandible_departamentos') {
    return (
      <div style={{ marginTop: '12px' }}>
        {task.datos?.departamentos?.map((dept: string) => (
          <details key={dept} style={{ marginBottom: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '8px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '4px' }}>
              📊 {dept.toUpperCase()}
            </summary>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', marginTop: '4px' }}>
              <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                <DataRow label="✅ Cumplimiento:" value={task.datos?.valores?.[dept]?.cumplimiento} color="#059669" />
                <DataRow label="📝 Tareas completadas:" value={task.datos?.valores?.[dept]?.completadas} color="#3b82f6" />
                <DataRow label="⏳ Tareas pendientes:" value={task.datos?.valores?.[dept]?.pendientes} color="#f59e0b" />
                <DataRow label="⚠️ Cuellos de botella:" value={task.datos?.valores?.[dept]?.cuellos_botella} color="#ef4444" />
              </div>
            </div>
          </details>
        ))}
        <NotesTextarea value={task.notas} placeholder="Acciones a tomar por departamento..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'datos_centros_contabilidad') {
    return (
      <div style={{ marginTop: '12px' }}>
        {task.datos?.centros?.map((centro: string) => (
          <details key={centro} style={{ marginBottom: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '8px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px', marginBottom: '4px' }}>
              🏢 {centro}
            </summary>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', marginTop: '4px' }}>
              <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                <DataRow label="💰 Ingresos del mes:" value={task.datos?.valores?.[centro]?.ingresos} color="#059669" />
                <DataRow label="💸 Gastos del mes:" value={task.datos?.valores?.[centro]?.gastos} color="#ef4444" />
                <DataRow label="📊 Balance:" value={task.datos?.valores?.[centro]?.balance} color="#3b82f6" />
                <DataRow label="📈 Comparativa mes anterior:" value={task.datos?.valores?.[centro]?.comparativa} color="#6b7280" />
              </div>
            </div>
          </details>
        ))}
        <NotesTextarea value={task.notas} placeholder="Observaciones contables..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'tendencias_clientes') {
    return (
      <div style={{ marginTop: '12px' }}>
        {task.datos?.centros?.map((centro: string) => (
          <details key={centro} style={{ marginBottom: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '8px', backgroundColor: '#d1fae5', border: '1px solid #10b981', borderRadius: '6px', marginBottom: '4px' }}>
              📈 {centro}
            </summary>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', marginTop: '4px' }}>
              <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                <DataRow label="👥 Clientes activos:" value={task.datos?.valores?.[centro]?.clientes_activos} color="#3b82f6" />
                <DataRow label="📊 Tendencia:" value={task.datos?.valores?.[centro]?.tendencia} color="#10b981" />
                <DataRow label="💰 Facturación mes:" value={task.datos?.valores?.[centro]?.facturacion} color="#059669" />
                <DataRow label="⭐ Satisfacción media:" value={task.datos?.valores?.[centro]?.satisfaccion} color="#f59e0b" />
              </div>
            </div>
          </details>
        ))}
        <NotesTextarea value={task.notas} placeholder="Análisis de tendencias y acciones..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'incidencias') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="🔴 Incidencias abiertas:" value={task.datos?.incidencias_abiertas} color="#dc2626" />
          <DataRow label="📊 Nuevas desde última reunión:" value={task.datos?.nuevas_desde_ultima_reunion} color="#f59e0b" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Motivos, acciones y comentarios sobre incidencias..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'incidencias_personal') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#dc2626' }}>🚨 Bajas activas</div>
            <DataRow label="" value={task.datos?.bajas_activas !== undefined ? `${task.datos.bajas_activas} empleado(s) de baja` : undefined} color="#dc2626" />
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#f59e0b' }}>⚠️ Incidencias pendientes</div>
            <DataRow label="" value={task.datos?.incidencias_pendientes !== undefined ? `${task.datos.incidencias_pendientes} incidencia(s)` : undefined} color="#f59e0b" />
          </div>
        </div>
        <NotesTextarea value={task.notas} placeholder="Comentarios sobre incidencias de personal, medidas adoptadas..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'checklist_incidencias') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="📋 Incidencias en checklist pendientes:" value={task.datos?.pendientes_checklist} color="#ef4444" />
          <DataRow label="✅ Resueltas esta semana:" value={task.datos?.resueltas_semana} color="#10b981" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Acciones a tomar sobre incidencias de checklist..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'propuestas_sanciones') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f3e8ff', border: '1px solid #a855f7', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="💡 Propuestas pendientes:" value={task.datos?.propuestas_pendientes} color="#a855f7" />
          <DataRow label="⚖️ Sanciones activas:" value={task.datos?.sanciones_activas} color="#dc2626" />
          <DataRow label="📝 Cambios de procedimientos:" value={task.datos?.cambios_pendientes} color="#3b82f6" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Decisiones sobre propuestas, sanciones y cambios..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'pedidos_logistica') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="📦 Pedidos recibidos:" value={task.datos?.pedidos_recibidos} color="#10b981" />
          <DataRow label="📤 Pedidos enviados:" value={task.datos?.pedidos_enviados} color="#3b82f6" />
          <DataRow label="⏳ Pendientes de envío:" value={task.datos?.pedidos_pendientes} color="#f59e0b" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Observaciones sobre pedidos, proveedores, prioridades..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'roturas_perdidas') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="💔 Roturas reportadas:" value={task.datos?.roturas} color="#ef4444" />
          <DataRow label="❓ Pérdidas registradas:" value={task.datos?.perdidas} color="#f59e0b" />
          <DataRow label="💸 Coste estimado:" value={task.datos?.coste_estimado} color="#dc2626" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Acciones sobre roturas y pérdidas, responsables..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'stock_minimo') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="⚠️ Artículos bajo mínimos:" value={task.datos?.articulos_bajo_minimo} color="#f59e0b" />
          <DataRow label="💰 Inversión estimada:" value={task.datos?.inversion_estimada} color="#059669" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Decisiones sobre compras, reposición, proveedores..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'envios_pendientes') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e0e7ff', border: '1px solid #6366f1', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="🚚 Envíos pendientes total:" value={task.datos?.envios_pendientes} color="#6366f1" />
          <DataRow label="🔴 Urgentes:" value={task.datos?.envios_urgentes} color="#ef4444" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Plan de envíos, prioridades y responsables..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'incidencias_mantenimiento') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="🔴 Incidencias abiertas:" value={task.datos?.abiertas} color="#ef4444" />
          <DataRow label="✅ Cerradas esta semana:" value={task.datos?.cerradas_semana} color="#10b981" />
          <DataRow label="⏱️ Tiempo medio resolución:" value={task.datos?.tiempo_medio} color="#3b82f6" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Observaciones sobre incidencias de mantenimiento..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'reparaciones_pendientes') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="🔧 Reparaciones pendientes total:" value={task.datos?.total_reparaciones} color="#3b82f6" />
          <DataRow label="🔴 Urgentes:" value={task.datos?.urgentes} color="#ef4444" />
          <DataRow label="🟡 Normales:" value={task.datos?.normales} color="#f59e0b" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Plan de reparaciones, prioridades y presupuesto..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'coste_reparaciones') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#d1fae5', border: '1px solid #10b981', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="💰 Coste total reparaciones:" value={task.datos?.coste_total} color="#059669" />
          <DataRow label="🔩 Materiales:" value={task.datos?.coste_materiales} color="#3b82f6" />
          <DataRow label="👷 Mano de obra:" value={task.datos?.coste_mano_obra} color="#3b82f6" />
          <DataRow label="🏢 Externos:" value={task.datos?.coste_externos} color="#3b82f6" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Análisis de costes, optimizaciones, decisiones..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'pagos_pendientes') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="📝 Pagos sin apuntar:" value={task.datos?.pagos_sin_apuntar} color="#f59e0b" />
          <DataRow label="💸 Importe total pendiente:" value={task.datos?.importe_pendiente} color="#ef4444" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Acciones sobre pagos pendientes, prioridades..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'transferencias_autorizar') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e0e7ff', border: '1px solid #6366f1', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="🔐 Pendientes de autorización:" value={task.datos?.pendientes_autorizacion} color="#6366f1" />
          <DataRow label="💰 Importe total:" value={task.datos?.importe_total} color="#6366f1" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Decisiones sobre autorizaciones, detalles..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'gastos_extra') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="⚠️ Gastos fuera de lo normal:" value={task.datos?.num_gastos_extra} color="#ef4444" />
          <DataRow label="💸 Importe total:" value={task.datos?.importe_gastos_extra} color="#dc2626" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Análisis de gastos extra, justificaciones, acciones..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'incidencias_checklist_operaciones') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="🔴 Críticas:" value={task.datos?.criticas} color="#ef4444" />
          <DataRow label="🟡 Importantes:" value={task.datos?.importantes} color="#f59e0b" />
          <DataRow label="🟢 Menores:" value={task.datos?.menores} color="#10b981" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Plan de acción sobre incidencias de operaciones..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'eventos_actividades') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e0e7ff', border: '1px solid #6366f1', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="📅 Próximos eventos programados:" value={task.datos?.proximos_eventos} color="#6366f1" />
          <DataRow label="✅ Actividades pendientes:" value={task.datos?.actividades_pendientes} color="#3b82f6" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Planificación y coordinación de eventos, responsables..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'sugerencias_peticiones') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f3e8ff', border: '1px solid #a855f7', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="💡 Sugerencias pendientes:" value={task.datos?.sugerencias_pendientes} color="#a855f7" />
          <DataRow label="📝 Peticiones sin resolver:" value={task.datos?.peticiones_pendientes} color="#3b82f6" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Respuesta a sugerencias y peticiones, decisiones..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  if (task.tipo === 'comunicados_franquiciados') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <DataRow label="📢 Pendientes de envío:" value={task.datos?.comunicados_pendientes} color="#f59e0b" />
          <DataRow label="📬 Enviados sin respuesta:" value={task.datos?.sin_respuesta} color="#3b82f6" />
        </div>
        <NotesTextarea value={task.notas} placeholder="Nuevos comunicados, seguimiento, respuestas..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  // Default: simple task — textarea siempre guardado
  return (
    <textarea
      placeholder="Notas sobre esta tarea recurrente..."
      value={task.notas || ''}
      onChange={(e) => onNoteChange(index, e.target.value)}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        minHeight: '60px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box'
      }}
    />
  );
};
