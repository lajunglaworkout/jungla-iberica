import React from 'react';
import { RecurringTask } from './MeetingModalTypes';

interface RecurringTaskTypeContentProps {
  task: RecurringTask;
  index: number;
  onNoteChange: (index: number, note: string) => void;
}

export const RecurringTaskTypeContent: React.FC<RecurringTaskTypeContentProps> = ({ task, index, onNoteChange }) => {
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
                <div><strong>💰 Ingresos mes:</strong> <span style={{ color: '#059669' }}>{task.datos?.valores?.[centro]?.ingresos || 'Cargando...'}</span></div>
                <div><strong>👥 Clientes activos:</strong> <span style={{ color: '#3b82f6' }}>{task.datos?.valores?.[centro]?.clientes_activos || 'Cargando...'}</span></div>
                <div><strong>✨ Clientes nuevos:</strong> <span style={{ color: '#10b981' }}>{task.datos?.valores?.[centro]?.nuevos || 'Cargando...'}</span></div>
                <div><strong>📉 Bajas del mes:</strong> <span style={{ color: '#ef4444' }}>{task.datos?.valores?.[centro]?.bajas || 'Cargando...'}</span></div>
                <textarea placeholder="Observaciones..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '50px', marginTop: '8px', boxSizing: 'border-box' }} />
              </div>
            </div>
          </details>
        ))}
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
                <div><strong>✅ Cumplimiento:</strong> <span style={{ color: '#059669' }}>{task.datos?.valores?.[dept]?.cumplimiento || 'Cargando...'}</span></div>
                <div><strong>📝 Tareas completadas:</strong> <span style={{ color: '#3b82f6' }}>{task.datos?.valores?.[dept]?.completadas ?? 'Cargando...'}</span></div>
                <div><strong>⏳ Tareas pendientes:</strong> <span style={{ color: '#f59e0b' }}>{task.datos?.valores?.[dept]?.pendientes ?? 'Cargando...'}</span></div>
                <div><strong>⚠️ Cuellos de botella:</strong> <span style={{ color: '#ef4444' }}>{task.datos?.valores?.[dept]?.cuellos_botella || 'Cargando...'}</span></div>
                <select style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', marginTop: '4px' }}>
                  <option>Óptimo</option><option>Normal</option><option>Requiere atención</option><option>Crítico</option>
                </select>
                <textarea placeholder="Acciones a tomar..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '50px', marginTop: '4px', boxSizing: 'border-box' }} />
              </div>
            </div>
          </details>
        ))}
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
                <div><strong>💰 Ingresos del mes:</strong> <span style={{ color: '#059669' }}>Cargando...</span></div>
                <div><strong>💸 Gastos del mes:</strong> <span style={{ color: '#ef4444' }}>Cargando...</span></div>
                <div><strong>📊 Balance:</strong> <span style={{ color: '#3b82f6' }}>Cargando...</span></div>
                <div><strong>📈 Comparativa mes anterior:</strong> <span style={{ color: '#6b7280' }}>Cargando...</span></div>
                <textarea placeholder="Observaciones contables..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '50px', marginTop: '8px', boxSizing: 'border-box' }} />
              </div>
            </div>
          </details>
        ))}
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
                <div><strong>👥 Clientes activos:</strong> <span style={{ color: '#3b82f6' }}>Cargando...</span></div>
                <div><strong>📊 Tendencia clientes:</strong> <span style={{ color: '#10b981' }}>Cargando...</span></div>
                <div><strong>💰 Facturación mes:</strong> <span style={{ color: '#059669' }}>Cargando...</span></div>
                <div><strong>📈 Tendencia facturación:</strong> <span style={{ color: '#10b981' }}>Cargando...</span></div>
                <div><strong>⭐ Satisfacción media:</strong> <span style={{ color: '#f59e0b' }}>Cargando...</span></div>
                <textarea placeholder="Análisis de tendencias..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '50px', marginTop: '8px', boxSizing: 'border-box' }} />
              </div>
            </div>
          </details>
        ))}
      </div>
    );
  }

  if (task.tipo === 'incidencias') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <div><strong>🔴 Incidencias abiertas:</strong> <span style={{ color: '#dc2626' }}>{task.datos?.incidencias_abiertas ?? 'Cargando...'}</span></div>
          <div><strong>📊 Nuevas desde última reunión:</strong> <span style={{ color: '#f59e0b' }}>{task.datos?.nuevas_desde_ultima_reunion ?? 'Cargando...'}</span></div>
          <textarea placeholder="Motivos de no cierre..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '50px', marginTop: '8px', boxSizing: 'border-box' }} />
          <textarea placeholder="Comentarios adicionales..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '50px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'incidencias_personal') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#dc2626' }}>🚨 Bajas activas</div>
            <div style={{ color: '#6b7280' }}>Cargando bajas de personal...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#f59e0b' }}>⚠️ Incidencias pendientes</div>
            <div style={{ color: '#6b7280' }}>Cargando incidencias de personal...</div>
          </div>
          <textarea placeholder="Comentarios sobre incidencias de personal..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'checklist_incidencias') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#3b82f6' }}>📋 Incidencias en checklist</div>
            <div style={{ color: '#6b7280' }}>Cargando incidencias de checklist...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Resumen</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
              <div>• <strong>Total pendientes:</strong> <span style={{ color: '#ef4444' }}>Cargando...</span></div>
              <div>• <strong>Resueltas esta semana:</strong> <span style={{ color: '#10b981' }}>Cargando...</span></div>
            </div>
          </div>
          <textarea placeholder="Acciones a tomar sobre checklist..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'propuestas_sanciones') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f3e8ff', border: '1px solid #a855f7', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#a855f7' }}>💡 Propuestas pendientes</div>
            <div style={{ color: '#6b7280' }}>Cargando propuestas...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#dc2626' }}>⚖️ Sanciones activas</div>
            <div style={{ color: '#6b7280' }}>Cargando sanciones...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#3b82f6' }}>📝 Cambios de procedimientos</div>
            <div style={{ color: '#6b7280' }}>Cargando cambios pendientes...</div>
          </div>
          <textarea placeholder="Decisiones tomadas sobre propuestas, sanciones o cambios..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '80px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'pedidos_logistica') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#10b981' }}>📦 Pedidos recibidos</div>
            <div style={{ color: '#6b7280' }}>Cargando pedidos recibidos...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#3b82f6' }}>📤 Pedidos enviados</div>
            <div style={{ color: '#6b7280' }}>Cargando pedidos enviados...</div>
          </div>
          <textarea placeholder="Observaciones sobre pedidos..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'roturas_perdidas') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#ef4444' }}>💔 Roturas reportadas</div>
            <div style={{ color: '#6b7280' }}>Cargando roturas...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#f59e0b' }}>❓ Pérdidas registradas</div>
            <div style={{ color: '#6b7280' }}>Cargando pérdidas...</div>
          </div>
          <textarea placeholder="Acciones tomadas sobre roturas y pérdidas..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'stock_minimo') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#f59e0b' }}>⚠️ Materiales cerca de stock mínimo</div>
            <div style={{ color: '#6b7280' }}>Cargando materiales con stock bajo...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#059669' }}>💰 Estimación de inversión</div>
            <div style={{ color: '#6b7280' }}>Calculando inversión necesaria...</div>
          </div>
          <textarea placeholder="Decisiones sobre compras y reposición..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'envios_pendientes') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e0e7ff', border: '1px solid #6366f1', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6366f1' }}>🚚 Envíos pendientes</div>
            <div style={{ color: '#6b7280' }}>Cargando envíos pendientes...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Resumen</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
              <div>• <strong>Total pendientes:</strong> <span style={{ color: '#f59e0b' }}>Cargando...</span></div>
              <div>• <strong>Urgentes:</strong> <span style={{ color: '#ef4444' }}>Cargando...</span></div>
            </div>
          </div>
          <textarea placeholder="Plan de envíos y prioridades..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'incidencias_mantenimiento') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#ef4444' }}>🔴 Incidencias abiertas</div>
            <div style={{ color: '#6b7280' }}>Cargando incidencias abiertas...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#10b981' }}>✅ Incidencias cerradas</div>
            <div style={{ color: '#6b7280' }}>Cargando incidencias cerradas...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Estadísticas</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
              <div>• <strong>Tiempo medio resolución:</strong> <span style={{ color: '#3b82f6' }}>Cargando...</span></div>
              <div>• <strong>Tasa de resolución:</strong> <span style={{ color: '#10b981' }}>Cargando...</span></div>
            </div>
          </div>
          <textarea placeholder="Observaciones sobre incidencias..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'reparaciones_pendientes') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#3b82f6' }}>🔧 Reparaciones pendientes</div>
            <div style={{ color: '#6b7280' }}>Cargando reparaciones pendientes...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Prioridad</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
              <div>• <strong>Urgentes:</strong> <span style={{ color: '#ef4444' }}>Cargando...</span></div>
              <div>• <strong>Normales:</strong> <span style={{ color: '#f59e0b' }}>Cargando...</span></div>
              <div>• <strong>Bajas:</strong> <span style={{ color: '#10b981' }}>Cargando...</span></div>
            </div>
          </div>
          <textarea placeholder="Plan de reparaciones y prioridades..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'coste_reparaciones') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#d1fae5', border: '1px solid #10b981', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#059669' }}>💰 Coste total reparaciones</div>
            <div style={{ color: '#6b7280' }}>Cargando costes...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Desglose</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
              <div>• <strong>Materiales:</strong> <span style={{ color: '#3b82f6' }}>Cargando...</span></div>
              <div>• <strong>Mano de obra:</strong> <span style={{ color: '#3b82f6' }}>Cargando...</span></div>
              <div>• <strong>Externos:</strong> <span style={{ color: '#3b82f6' }}>Cargando...</span></div>
            </div>
          </div>
          <textarea placeholder="Análisis de costes y optimizaciones..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'pagos_pendientes') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#f59e0b' }}>📝 Pagos pendientes de apuntar</div>
            <div style={{ color: '#6b7280' }}>Cargando pagos sin apuntar...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Resumen</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
              <div>• <strong>Total pendientes:</strong> <span style={{ color: '#f59e0b' }}>Cargando...</span></div>
              <div>• <strong>Importe total:</strong> <span style={{ color: '#ef4444' }}>Cargando...</span></div>
            </div>
          </div>
          <textarea placeholder="Acciones sobre pagos pendientes..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'transferencias_autorizar') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e0e7ff', border: '1px solid #6366f1', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6366f1' }}>🔐 Transferencias no recurrentes por autorizar</div>
            <div style={{ color: '#6b7280' }}>Cargando transferencias pendientes...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Resumen</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
              <div>• <strong>Pendientes de autorización:</strong> <span style={{ color: '#f59e0b' }}>Cargando...</span></div>
              <div>• <strong>Importe total:</strong> <span style={{ color: '#6366f1' }}>Cargando...</span></div>
            </div>
          </div>
          <textarea placeholder="Decisiones sobre autorizaciones..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'gastos_extra') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#ef4444' }}>⚠️ Gastos extra detectados</div>
            <div style={{ color: '#6b7280' }}>Cargando gastos fuera de lo normal...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Por departamento/centro</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Cargando desglose...</div>
          </div>
          <textarea placeholder="Análisis de gastos extra y justificaciones..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'incidencias_checklist_operaciones') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#ef4444' }}>⚠️ Incidencias importantes del checklist</div>
            <div style={{ color: '#6b7280' }}>Cargando incidencias de checklist...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Resumen</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
              <div>• <strong>Críticas:</strong> <span style={{ color: '#ef4444' }}>Cargando...</span></div>
              <div>• <strong>Importantes:</strong> <span style={{ color: '#f59e0b' }}>Cargando...</span></div>
            </div>
          </div>
          <textarea placeholder="Plan de acción sobre incidencias..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'eventos_actividades') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e0e7ff', border: '1px solid #6366f1', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6366f1' }}>📅 Próximos eventos</div>
            <div style={{ color: '#6b7280' }}>Cargando eventos programados...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#3b82f6' }}>✅ Actividades pendientes</div>
            <div style={{ color: '#6b7280' }}>Cargando actividades...</div>
          </div>
          <textarea placeholder="Planificación y coordinación de eventos..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'sugerencias_peticiones') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f3e8ff', border: '1px solid #a855f7', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#a855f7' }}>💡 Sugerencias del sistema</div>
            <div style={{ color: '#6b7280' }}>Cargando sugerencias...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#3b82f6' }}>📝 Peticiones pendientes</div>
            <div style={{ color: '#6b7280' }}>Cargando peticiones...</div>
          </div>
          <textarea placeholder="Respuesta a sugerencias y peticiones..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  if (task.tipo === 'comunicados_franquiciados') {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#3b82f6' }}>📢 Comunicados pendientes</div>
            <div style={{ color: '#6b7280' }}>Cargando comunicados con franquiciados...</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Estado</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
              <div>• <strong>Pendientes de envío:</strong> <span style={{ color: '#f59e0b' }}>Cargando...</span></div>
              <div>• <strong>Enviados sin respuesta:</strong> <span style={{ color: '#3b82f6' }}>Cargando...</span></div>
            </div>
          </div>
          <textarea placeholder="Nuevos comunicados o seguimiento..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }} />
        </div>
      </div>
    );
  }

  // Default: simple task with note textarea
  return (
    <textarea
      placeholder="Notas sobre esta tarea recurrente..."
      value={task.notas}
      onChange={async (e) => onNoteChange(index, e.target.value)}
      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minHeight: '60px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
    />
  );
};
