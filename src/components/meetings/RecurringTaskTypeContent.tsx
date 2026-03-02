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

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Textarea conectado que siempre guarda datos */
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
      border: '1px solid #e5e7eb',
      borderRadius: '4px',
      fontSize: '13px',
      minHeight: '56px',
      boxSizing: 'border-box',
      resize: 'vertical',
      fontFamily: 'inherit',
      color: '#374151',
      backgroundColor: '#fafafa',
    }}
  />
);

/** Fila label / valor alineados horizontalmente */
const DataRow: React.FC<{ label: string; value?: string | number; color?: string }> = ({
  label, value, color = '#374151'
}) => {
  const hasValue = value !== undefined && value !== null && value !== '';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
      <span style={{ color: '#6b7280', fontSize: '12px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: '700', fontSize: '14px', color: hasValue ? color : '#d1d5db', textAlign: 'right' }}>
        {hasValue ? value : '—'}
      </span>
    </div>
  );
};

/** Card unificada con borde de color + notas separadas */
const SectionCard: React.FC<{
  color: string;
  children: React.ReactNode;
  notes: string;
  placeholder: string;
  index: number;
  onNoteChange: (index: number, note: string) => void;
}> = ({ color, children, notes, placeholder, index, onNoteChange }) => (
  <div style={{
    marginTop: '10px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderLeft: `4px solid ${color}`,
    borderRadius: '6px',
    overflow: 'hidden',
  }}>
    <div style={{ padding: '12px 14px', display: 'grid', gap: '10px' }}>
      {children}
    </div>
    <div style={{ borderTop: '1px solid #f3f4f6', padding: '8px 14px' }}>
      <NotesTextarea value={notes} placeholder={placeholder} index={index} onNoteChange={onNoteChange} />
    </div>
  </div>
);

/** KPI con objetivo y barra de progreso (semáforo rojo/verde) */
const KpiRow: React.FC<{
  label: string;
  value?: number;
  objetivo?: number;
  format: 'euros' | 'numero';
}> = ({ label, value, objetivo, format }) => {
  const hasData = value !== undefined && value !== null;
  const hasObjective = objetivo !== undefined && objetivo > 0;
  const pct = hasData && hasObjective ? Math.round((value! / objetivo!) * 100) : null;
  const ok = pct !== null ? pct >= 100 : null;

  const fmt = (v: number) =>
    format === 'euros' ? `${v.toLocaleString('es-ES')} €` : v.toLocaleString('es-ES');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
        <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '500' }}>
          {label}
        </span>
        {pct !== null && (
          <span style={{ fontSize: '11px', fontWeight: '700', color: ok ? '#059669' : '#dc2626' }}>
            {pct}%
          </span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '17px', fontWeight: '700', color: ok === null ? '#374151' : ok ? '#059669' : '#dc2626' }}>
          {hasData ? fmt(value!) : '—'}
        </span>
        {hasObjective && (
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>obj. {fmt(objetivo!)}</span>
        )}
      </div>
      {pct !== null && (
        <div style={{ marginTop: '5px', height: '4px', backgroundColor: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(pct, 100)}%`,
            height: '100%',
            backgroundColor: ok ? '#10b981' : '#ef4444',
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}
    </div>
  );
};

// ── Tipos de centros con card grid y semáforo ────────────────────────────────

const CentrosGrid: React.FC<{
  centros: string[];
  valores: Record<string, Record<string, number | undefined>>;
}> = ({ centros, valores }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
    {centros.map((centro) => {
      const v = valores[centro] ?? {};
      const clientesPct = v.objetivo_clientes && v.objetivo_clientes > 0 && v.clientes_activos !== undefined
        ? Math.round((v.clientes_activos / v.objetivo_clientes) * 100)
        : null;
      const factPct = v.objetivo_facturacion && v.objetivo_facturacion > 0 && v.ingresos !== undefined
        ? Math.round((v.ingresos / v.objetivo_facturacion) * 100)
        : null;
      const hasSemaforo = clientesPct !== null || factPct !== null;
      const overallOk = hasSemaforo
        ? (clientesPct === null || clientesPct >= 100) && (factPct === null || factPct >= 100)
        : null;

      return (
        <div
          key={centro}
          style={{
            background: 'white',
            border: `2px solid ${overallOk === null ? '#e5e7eb' : overallOk ? '#10b981' : '#ef4444'}`,
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}
        >
          <div style={{
            padding: '10px 14px',
            background: overallOk === null ? '#f9fafb' : overallOk ? '#d1fae5' : '#fee2e2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>📍 {centro}</span>
            {overallOk !== null && (
              <span style={{ fontSize: '15px' }}>{overallOk ? '🟢' : '🔴'}</span>
            )}
          </div>
          <div style={{ padding: '12px 14px', display: 'grid', gap: '12px' }}>
            <KpiRow
              label="Facturación mes"
              value={v.ingresos}
              objetivo={v.objetivo_facturacion}
              format="euros"
            />
            <KpiRow
              label="Clientes activos"
              value={v.clientes_activos}
              objetivo={v.objetivo_clientes}
              format="numero"
            />
            {(v.nuevos !== undefined || v.bajas !== undefined) && (
              <div style={{
                display: 'flex',
                gap: '12px',
                fontSize: '12px',
                paddingTop: '8px',
                borderTop: '1px solid #f3f4f6',
              }}>
                {v.nuevos !== undefined && (
                  <span style={{ color: '#059669', fontWeight: '600' }}>+{v.nuevos} altas</span>
                )}
                {v.bajas !== undefined && (
                  <span style={{ color: '#dc2626', fontWeight: '600' }}>−{v.bajas} bajas</span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// ── Componente principal ─────────────────────────────────────────────────────

export const RecurringTaskTypeContent: React.FC<RecurringTaskTypeContentProps> = ({
  task, index, onNoteChange
}) => {

  // ── Centros: grid con semáforo (Dirección) ────────────────────────────────
  if (task.tipo === 'expandible_centros') {
    const centros: string[] = task.datos?.centros ?? [];
    const valores: Record<string, Record<string, number | undefined>> = task.datos?.valores ?? {};

    return (
      <div style={{ marginTop: '12px' }}>
        <CentrosGrid centros={centros} valores={valores} />
        <div style={{ marginTop: '10px' }}>
          <NotesTextarea value={task.notas} placeholder="Observaciones sobre los centros..." index={index} onNoteChange={onNoteChange} />
        </div>
      </div>
    );
  }

  // ── Departamentos: mini cards (Dirección) ─────────────────────────────────
  if (task.tipo === 'expandible_departamentos') {
    const DEPT_META: Record<string, { label: string; icon: string; color: string }> = {
      rrhh:          { label: 'RRHH',          icon: '👥', color: '#8b5cf6' },
      procedimientos:{ label: 'Procedimientos', icon: '📋', color: '#3b82f6' },
      logistica:     { label: 'Logística',      icon: '📦', color: '#f59e0b' },
      mantenimiento: { label: 'Mantenimiento',  icon: '🔧', color: '#ef4444' },
      marketing:     { label: 'Marketing',      icon: '📣', color: '#ec4899' },
      ventas:        { label: 'Ventas',         icon: '💼', color: '#10b981' },
    };
    const departamentos: string[] = task.datos?.departamentos ?? [];
    const valores: Record<string, Record<string, number | string | undefined>> = task.datos?.valores ?? {};

    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          {departamentos.map((dept) => {
            const meta = DEPT_META[dept] ?? { label: dept.toUpperCase(), icon: '📊', color: '#6b7280' };
            const v = valores[dept] ?? {};
            const hasDatos = Object.keys(v).length > 0;
            const cuellos = v.cuellos_botella;
            const pendientes = v.pendientes;

            return (
              <div
                key={dept}
                style={{
                  background: 'white',
                  border: `1.5px solid ${meta.color}30`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{
                  padding: '10px 12px',
                  background: `${meta.color}10`,
                  borderBottom: `1.5px solid ${meta.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '16px' }}>{meta.icon}</span>
                  <span style={{ fontWeight: '700', fontSize: '12px', color: meta.color, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    {meta.label}
                  </span>
                </div>
                <div style={{ padding: '10px 12px', display: 'grid', gap: '6px', fontSize: '12px' }}>
                  {hasDatos ? (
                    <>
                      {v.cumplimiento !== undefined && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280' }}>Cumplimiento</span>
                          <span style={{ fontWeight: '700', color: Number(v.cumplimiento) >= 80 ? '#059669' : '#dc2626' }}>
                            {v.cumplimiento}%
                          </span>
                        </div>
                      )}
                      {v.completadas !== undefined && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280' }}>Completadas</span>
                          <span style={{ fontWeight: '600', color: '#374151' }}>{v.completadas}</span>
                        </div>
                      )}
                      {pendientes !== undefined && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280' }}>Pendientes</span>
                          <span style={{ fontWeight: '600', color: Number(pendientes) > 0 ? '#f59e0b' : '#374151' }}>{pendientes}</span>
                        </div>
                      )}
                      {cuellos !== undefined && Number(cuellos) > 0 && (
                        <div style={{
                          marginTop: '4px',
                          padding: '4px 8px',
                          background: '#fee2e2',
                          borderRadius: '6px',
                          color: '#dc2626',
                          fontWeight: '600',
                        }}>
                          ⚠ {cuellos} cuello{Number(cuellos) > 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '11px' }}>
                      Sin datos — añade en notas
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <NotesTextarea value={task.notas} placeholder="Acciones a tomar por departamento..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  // ── Contabilidad: datos de centros ────────────────────────────────────────
  if (task.tipo === 'datos_centros_contabilidad') {
    const centros: string[] = task.datos?.centros ?? [];
    return (
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '10px' }}>
          {centros.map((centro: string) => {
            const v = task.datos?.valores?.[centro] ?? {};
            const balance = v.balance;
            const positivo = balance !== undefined ? Number(balance) >= 0 : null;
            return (
              <div key={centro} style={{
                background: 'white',
                border: `1.5px solid ${positivo === null ? '#e5e7eb' : positivo ? '#10b981' : '#ef4444'}40`,
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{
                  padding: '10px 14px',
                  background: positivo === null ? '#f9fafb' : positivo ? '#d1fae520' : '#fee2e220',
                  borderBottom: `1px solid ${positivo === null ? '#e5e7eb' : positivo ? '#10b98130' : '#ef444430'}`,
                  fontWeight: '700',
                  fontSize: '13px',
                  color: '#111827',
                }}>
                  {centro}
                </div>
                <div style={{ padding: '12px 14px', display: 'grid', gap: '8px' }}>
                  <DataRow label="Ingresos mes" value={v.ingresos} color="#059669" />
                  <DataRow label="Gastos mes" value={v.gastos} color="#ef4444" />
                  <DataRow label="Balance" value={v.balance} color={positivo ? '#059669' : '#dc2626'} />
                  <DataRow label="vs mes anterior" value={v.comparativa} color="#6b7280" />
                </div>
              </div>
            );
          })}
        </div>
        <NotesTextarea value={task.notas} placeholder="Observaciones contables..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  // ── Operaciones: tendencias de clientes ───────────────────────────────────
  if (task.tipo === 'tendencias_clientes') {
    const centros: string[] = task.datos?.centros ?? [];
    return (
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '10px' }}>
          {centros.map((centro: string) => {
            const v = task.datos?.valores?.[centro] ?? {};
            return (
              <div key={centro} style={{
                background: 'white',
                border: '1.5px solid #10b98130',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{
                  padding: '10px 14px',
                  background: '#d1fae520',
                  borderBottom: '1px solid #10b98130',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: '#111827',
                }}>
                  {centro}
                </div>
                <div style={{ padding: '12px 14px', display: 'grid', gap: '8px' }}>
                  <DataRow label="Clientes activos" value={v.clientes_activos} color="#3b82f6" />
                  <DataRow label="Facturación mes" value={v.facturacion} color="#059669" />
                  <DataRow label="Tendencia" value={v.tendencia} color="#10b981" />
                  <DataRow label="Satisfacción media" value={v.satisfaccion} color="#f59e0b" />
                </div>
              </div>
            );
          })}
        </div>
        <NotesTextarea value={task.notas} placeholder="Análisis de tendencias y acciones..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  // ── RRHH ──────────────────────────────────────────────────────────────────
  if (task.tipo === 'incidencias') {
    return (
      <SectionCard color="#ef4444" notes={task.notas} placeholder="Motivos, acciones y comentarios sobre incidencias..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Incidencias abiertas" value={task.datos?.incidencias_abiertas} color="#dc2626" />
        <DataRow label="Nuevas desde última reunión" value={task.datos?.nuevas_desde_ultima_reunion} color="#f59e0b" />
      </SectionCard>
    );
  }

  if (task.tipo === 'incidencias_personal') {
    return (
      <SectionCard color="#f59e0b" notes={task.notas} placeholder="Comentarios sobre incidencias de personal, medidas adoptadas..." index={index} onNoteChange={onNoteChange}>
        <div style={{ display: 'grid', gap: '6px', padding: '10px', background: '#fafafa', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>
            Bajas activas
          </div>
          <DataRow label="Empleados de baja"
            value={task.datos?.bajas_activas !== undefined ? task.datos.bajas_activas : undefined}
            color="#dc2626" />
        </div>
        <div style={{ display: 'grid', gap: '6px', padding: '10px', background: '#fafafa', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>
            Incidencias pendientes
          </div>
          <DataRow label="Abiertas"
            value={task.datos?.incidencias_pendientes !== undefined ? task.datos.incidencias_pendientes : undefined}
            color="#f59e0b" />
        </div>
      </SectionCard>
    );
  }

  if (task.tipo === 'checklist_incidencias') {
    return (
      <SectionCard color="#3b82f6" notes={task.notas} placeholder="Acciones a tomar sobre incidencias de checklist..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Incidencias en checklist pendientes" value={task.datos?.pendientes_checklist} color="#ef4444" />
        <DataRow label="Resueltas esta semana" value={task.datos?.resueltas_semana} color="#10b981" />
      </SectionCard>
    );
  }

  if (task.tipo === 'propuestas_sanciones') {
    return (
      <SectionCard color="#a855f7" notes={task.notas} placeholder="Decisiones sobre propuestas, sanciones y cambios..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Propuestas pendientes" value={task.datos?.propuestas_pendientes} color="#a855f7" />
        <DataRow label="Sanciones activas" value={task.datos?.sanciones_activas} color="#dc2626" />
        <DataRow label="Cambios de procedimientos" value={task.datos?.cambios_pendientes} color="#3b82f6" />
      </SectionCard>
    );
  }

  // ── Logística ─────────────────────────────────────────────────────────────
  if (task.tipo === 'pedidos_logistica') {
    return (
      <SectionCard color="#3b82f6" notes={task.notas} placeholder="Observaciones sobre pedidos, proveedores, prioridades..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Pedidos recibidos" value={task.datos?.pedidos_recibidos} color="#10b981" />
        <DataRow label="Pedidos enviados" value={task.datos?.pedidos_enviados} color="#3b82f6" />
        <DataRow label="Pendientes de envío" value={task.datos?.pedidos_pendientes} color="#f59e0b" />
      </SectionCard>
    );
  }

  if (task.tipo === 'roturas_perdidas') {
    return (
      <SectionCard color="#ef4444" notes={task.notas} placeholder="Acciones sobre roturas y pérdidas, responsables..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Roturas reportadas" value={task.datos?.roturas} color="#ef4444" />
        <DataRow label="Pérdidas registradas" value={task.datos?.perdidas} color="#f59e0b" />
        <DataRow label="Coste estimado" value={task.datos?.coste_estimado} color="#dc2626" />
      </SectionCard>
    );
  }

  if (task.tipo === 'stock_minimo') {
    return (
      <SectionCard color="#f59e0b" notes={task.notas} placeholder="Decisiones sobre compras, reposición, proveedores..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Artículos bajo mínimos" value={task.datos?.articulos_bajo_minimo} color="#f59e0b" />
        <DataRow label="Inversión estimada" value={task.datos?.inversion_estimada} color="#059669" />
      </SectionCard>
    );
  }

  if (task.tipo === 'envios_pendientes') {
    return (
      <SectionCard color="#6366f1" notes={task.notas} placeholder="Plan de envíos, prioridades y responsables..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Envíos pendientes total" value={task.datos?.envios_pendientes} color="#6366f1" />
        <DataRow label="Urgentes" value={task.datos?.envios_urgentes} color="#ef4444" />
      </SectionCard>
    );
  }

  // ── Mantenimiento ─────────────────────────────────────────────────────────
  if (task.tipo === 'incidencias_mantenimiento') {
    return (
      <SectionCard color="#f59e0b" notes={task.notas} placeholder="Observaciones sobre incidencias de mantenimiento..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Incidencias abiertas" value={task.datos?.abiertas} color="#ef4444" />
        <DataRow label="Cerradas esta semana" value={task.datos?.cerradas_semana} color="#10b981" />
        <DataRow label="Tiempo medio resolución" value={task.datos?.tiempo_medio} color="#3b82f6" />
      </SectionCard>
    );
  }

  if (task.tipo === 'reparaciones_pendientes') {
    return (
      <SectionCard color="#3b82f6" notes={task.notas} placeholder="Plan de reparaciones, prioridades y presupuesto..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Reparaciones pendientes total" value={task.datos?.total_reparaciones} color="#3b82f6" />
        <DataRow label="Urgentes" value={task.datos?.urgentes} color="#ef4444" />
        <DataRow label="Normales" value={task.datos?.normales} color="#f59e0b" />
      </SectionCard>
    );
  }

  if (task.tipo === 'coste_reparaciones') {
    return (
      <SectionCard color="#10b981" notes={task.notas} placeholder="Análisis de costes, optimizaciones, decisiones..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Coste total reparaciones" value={task.datos?.coste_total} color="#059669" />
        <DataRow label="Materiales" value={task.datos?.coste_materiales} color="#3b82f6" />
        <DataRow label="Mano de obra" value={task.datos?.coste_mano_obra} color="#3b82f6" />
        <DataRow label="Externos" value={task.datos?.coste_externos} color="#3b82f6" />
      </SectionCard>
    );
  }

  // ── Contabilidad ──────────────────────────────────────────────────────────
  if (task.tipo === 'pagos_pendientes') {
    return (
      <SectionCard color="#f59e0b" notes={task.notas} placeholder="Acciones sobre pagos pendientes, prioridades..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Pagos sin apuntar" value={task.datos?.pagos_sin_apuntar} color="#f59e0b" />
        <DataRow label="Importe total pendiente" value={task.datos?.importe_pendiente} color="#ef4444" />
      </SectionCard>
    );
  }

  if (task.tipo === 'transferencias_autorizar') {
    return (
      <SectionCard color="#6366f1" notes={task.notas} placeholder="Decisiones sobre autorizaciones, detalles..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Pendientes de autorización" value={task.datos?.pendientes_autorizacion} color="#6366f1" />
        <DataRow label="Importe total" value={task.datos?.importe_total} color="#6366f1" />
      </SectionCard>
    );
  }

  if (task.tipo === 'gastos_extra') {
    return (
      <SectionCard color="#ef4444" notes={task.notas} placeholder="Análisis de gastos extra, justificaciones, acciones..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Gastos fuera de lo normal" value={task.datos?.num_gastos_extra} color="#ef4444" />
        <DataRow label="Importe total" value={task.datos?.importe_gastos_extra} color="#dc2626" />
      </SectionCard>
    );
  }

  // ── Operaciones ───────────────────────────────────────────────────────────
  if (task.tipo === 'incidencias_checklist_operaciones') {
    return (
      <SectionCard color="#f59e0b" notes={task.notas} placeholder="Plan de acción sobre incidencias de operaciones..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Críticas" value={task.datos?.criticas} color="#ef4444" />
        <DataRow label="Importantes" value={task.datos?.importantes} color="#f59e0b" />
        <DataRow label="Menores" value={task.datos?.menores} color="#10b981" />
      </SectionCard>
    );
  }

  if (task.tipo === 'eventos_actividades') {
    return (
      <SectionCard color="#6366f1" notes={task.notas} placeholder="Planificación y coordinación de eventos, responsables..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Próximos eventos programados" value={task.datos?.proximos_eventos} color="#6366f1" />
        <DataRow label="Actividades pendientes" value={task.datos?.actividades_pendientes} color="#3b82f6" />
      </SectionCard>
    );
  }

  if (task.tipo === 'sugerencias_peticiones') {
    return (
      <SectionCard color="#a855f7" notes={task.notas} placeholder="Respuesta a sugerencias y peticiones, decisiones..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Sugerencias pendientes" value={task.datos?.sugerencias_pendientes} color="#a855f7" />
        <DataRow label="Peticiones sin resolver" value={task.datos?.peticiones_pendientes} color="#3b82f6" />
      </SectionCard>
    );
  }

  if (task.tipo === 'comunicados_franquiciados') {
    return (
      <SectionCard color="#3b82f6" notes={task.notas} placeholder="Nuevos comunicados, seguimiento, respuestas..." index={index} onNoteChange={onNoteChange}>
        <DataRow label="Pendientes de envío" value={task.datos?.comunicados_pendientes} color="#f59e0b" />
        <DataRow label="Enviados sin respuesta" value={task.datos?.sin_respuesta} color="#3b82f6" />
      </SectionCard>
    );
  }

  // ── Eventos — resumen en tiempo real ─────────────────────────────────────
  if (task.tipo === 'eventos_resumen') {
    const d = task.datos ?? {};
    const balance = d.balance as number | undefined;
    const balancePositivo = balance !== undefined ? balance >= 0 : null;
    const fmt = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

    return (
      <div style={{ marginTop: '10px' }}>
        {/* KPIs principales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          {[
            { label: 'Eventos activos', value: d.activos, color: '#059669' },
            { label: 'Este mes', value: d.este_mes, color: '#3b82f6' },
            { label: 'Participantes', value: d.participantes, color: '#8b5cf6' },
            { label: 'Tareas pendientes', value: d.tareas_pendientes, color: d.tareas_pendientes > 0 ? '#f59e0b' : '#10b981' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'white',
              border: `1.5px solid ${item.color}25`,
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: item.color, lineHeight: 1 }}>
                {item.value ?? '—'}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontWeight: '500' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
        {/* Balance financiero */}
        {balance !== undefined && (
          <div style={{
            background: balancePositivo ? '#d1fae5' : '#fee2e2',
            border: `1.5px solid ${balancePositivo ? '#10b981' : '#ef4444'}40`,
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Balance acumulado</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: balancePositivo ? '#059669' : '#dc2626' }}>
              {fmt(balance)}
            </span>
          </div>
        )}
        <NotesTextarea value={task.notas} placeholder="Próximos eventos, decisiones, seguimiento de participantes..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  // ── Academy — resumen en tiempo real ──────────────────────────────────────
  if (task.tipo === 'academy_resumen') {
    const d = task.datos ?? {};
    return (
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          {[
            { label: 'Alumnos activos',    value: d.alumnos_activos,   color: '#059669' },
            { label: 'Tutores activos',     value: d.tutores_activos,   color: '#3b82f6' },
            { label: 'Centros activos',     value: d.centros_activos,   color: '#8b5cf6' },
            { label: 'Cohortes próximas',   value: d.cohortes_proximas, color: '#f59e0b' },
            { label: 'Tareas pendientes',   value: d.tareas_pendientes, color: d.tareas_pendientes > 0 ? '#ef4444' : '#10b981' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'white',
              border: `1.5px solid ${item.color}25`,
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: item.color, lineHeight: 1 }}>
                {item.value ?? '—'}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontWeight: '500' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
        <NotesTextarea value={task.notas} placeholder="Estado general de la academia, bloqueos, decisiones..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  // ── Online — resumen en tiempo real ──────────────────────────────────────
  if (task.tipo === 'online_resumen') {
    const d = task.datos ?? {};
    return (
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          {[
            { label: 'Tareas pendientes',      value: d.tareas_pendientes,        color: d.tareas_pendientes > 0 ? '#f59e0b' : '#10b981' },
            { label: 'Contenido en producción', value: d.contenido_produccion,     color: '#3b82f6' },
            { label: 'Publicaciones prog.',     value: d.publicaciones_programadas, color: '#8b5cf6' },
            { label: 'Ideas nuevas',            value: d.ideas_nuevas,             color: '#ec4899' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'white',
              border: `1.5px solid ${item.color}25`,
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: item.color, lineHeight: 1 }}>
                {item.value ?? '—'}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontWeight: '500' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
        <NotesTextarea value={task.notas} placeholder="Estado de tareas, prioridades de contenido, calendario..." index={index} onNoteChange={onNoteChange} />
      </div>
    );
  }

  // ── Default: textarea simple ───────────────────────────────────────────────
  return (
    <textarea
      placeholder="Notas sobre esta tarea recurrente..."
      value={task.notas || ''}
      onChange={(e) => onNoteChange(index, e.target.value)}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        fontSize: '14px',
        minHeight: '60px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box',
        backgroundColor: '#fafafa',
      }}
    />
  );
};
