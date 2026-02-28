/**
 * ProjectHistoryView — Biblia Histórica del Proyecto
 *
 * Componente de solo lectura para el CTO entrante.
 * Muestra el historial de decisiones técnicas, métricas de calidad
 * y el estado de cada fase de refactorización.
 *
 * Acceso: solo usuarios con rol 'admin' o 'ceo'
 * Ruta sugerida: /admin/project-history
 */

import { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PhaseStatus = 'completed' | 'in_progress' | 'pending';
type MetricTrend = 'up' | 'down' | 'neutral';

interface MetricRow {
  label: string;
  baseline: string;
  fase0: string;
  fase1: string;
  fase2: string;
  fase3: string;
  goal: string;
  trend: MetricTrend;
}

interface PhaseItem {
  id: string;
  phase: string;
  title: string;
  status: PhaseStatus;
  date: string;
  summary: string;
  changes: ChangeItem[];
  metrics?: MetricDelta[];
}

interface ChangeItem {
  file: string;
  type: 'created' | 'modified' | 'deprecated' | 'deleted';
  description: string;
}

interface MetricDelta {
  label: string;
  before: string;
  after: string;
  isPositive: boolean;
}

interface ADR {
  id: string;
  title: string;
  date: string;
  decision: string;
  reason: string;
  tradeoffs: { pro: string[]; con: string[] };
}

// ─── Datos ────────────────────────────────────────────────────────────────────

const METRICS: MetricRow[] = [
  {
    label: 'any escapes totales',
    baseline: '487',
    fase0: '464',
    fase1: '464',
    fase2: '—',
    fase3: '< 150',
    goal: '< 50',
    trend: 'down',
  },
  {
    label: 'Componentes con DB directa',
    baseline: '89',
    fase0: '89',
    fase1: '58',
    fase2: '—',
    fase3: '< 20',
    goal: '0',
    trend: 'down',
  },
  {
    label: 'Archivos de test',
    baseline: '1',
    fase0: '1',
    fase1: '1',
    fase2: '8+',
    fase3: '12+',
    goal: '50+',
    trend: 'up',
  },
  {
    label: 'Cobertura de tests',
    baseline: '~0%',
    fase0: '~0%',
    fase1: '~0%',
    fase2: '~10%',
    fase3: '~15%',
    goal: '40%+',
    trend: 'up',
  },
  {
    label: 'Servicios en src/services/',
    baseline: '26',
    fase0: '33',
    fase1: '36',
    fase2: '—',
    fase3: '—',
    goal: '49+',
    trend: 'up',
  },
  {
    label: 'Archivos > 2.000 líneas',
    baseline: '5',
    fase0: '5',
    fase1: '5',
    fase2: '5',
    fase3: '0',
    goal: '0',
    trend: 'down',
  },
  {
    label: 'database.gen.ts (líneas)',
    baseline: '26 ❌',
    fase0: '7.928 ✅',
    fase1: '7.928 ✅',
    fase2: '—',
    fase3: '—',
    goal: 'Regenerado en CI',
    trend: 'up',
  },
];

const PHASES: PhaseItem[] = [
  {
    id: 'pre',
    phase: 'Pre-Fase',
    title: 'Reemplazo de alert()/confirm()',
    status: 'completed',
    date: 'Feb 2026',
    summary:
      'Todos los diálogos nativos del browser reemplazados por el sistema de toasts de ui.ts. ' +
      '384 reemplazos en 77 archivos mediante scripts Python automáticos.',
    changes: [
      { file: 'src/utils/ui.ts', type: 'modified', description: 'Sistema de toasts: ui.success, ui.error, ui.warning, ui.info, ui.confirm' },
      { file: 'scripts/transform_alerts.py', type: 'created', description: '330 cambios automáticos en 74 archivos' },
      { file: 'scripts/transform_alerts2.py', type: 'created', description: '48 cambios adicionales en patrones complejos' },
    ],
    metrics: [
      { label: 'alert() / confirm() nativos', before: '~384', after: '0', isPositive: true },
      { label: 'Archivos modificados', before: '0', after: '77', isPositive: true },
    ],
  },
  {
    id: 'fase0',
    phase: 'Fase 0',
    title: 'Tipos y Tooling',
    status: 'completed',
    date: '26 Feb 2026',
    summary:
      'Cimientos de calidad: tipos Supabase auto-generados (7.928 líneas), cliente tipado ' +
      'con createClient<Database>(), ESLint con no-explicit-any, y script de métricas.',
    changes: [
      { file: 'src/types/database.gen.ts', type: 'modified', description: 'De 26 líneas vacías a 7.928 líneas con tipos Row/Insert/Update de todas las tablas' },
      { file: 'src/lib/supabase.ts', type: 'modified', description: 'De 501 líneas (464 de tipos manuales) a 35 líneas. createClient<Database>()' },
      { file: 'eslint.config.js', type: 'modified', description: 'Añadido no-explicit-any: warn y no-unused-vars: warn' },
      { file: 'scripts/audit-metrics.sh', type: 'created', description: 'Script de métricas ejecutable con npm run audit' },
      { file: 'package.json', type: 'modified', description: 'Añadido script "audit": "bash scripts/audit-metrics.sh"' },
    ],
    metrics: [
      { label: 'Líneas en database.gen.ts', before: '26', after: '7.928', isPositive: true },
      { label: 'Líneas en supabase.ts', before: '501', after: '35', isPositive: true },
      { label: 'Tipos manuales eliminados', before: '464 líneas', after: '0', isPositive: true },
    ],
  },
  {
    id: 'fase1',
    phase: 'Fase 1',
    title: 'Capa de Servicios',
    status: 'completed',
    date: '26 Feb 2026',
    summary:
      'Creados eventService, academyService y leadService. 27 componentes migrados sin queries ' +
      'Supabase directas. Componentes con DB directa: 85 → 58 (-32%). inventoryService marcado deprecated.',
    changes: [
      { file: 'src/services/eventService.ts', type: 'created', description: '12 sub-servicios para eventos, check-list, gastos, participantes, encuestas, materiales' },
      { file: 'src/services/academyService.ts', type: 'created', description: '13 sub-servicios para módulos, lecciones, bloques, academia online' },
      { file: 'src/services/leadService.ts', type: 'created', description: '4 sub-servicios para leads, interacciones, proyectos, tareas de venta' },
      { file: 'src/services/inventoryService.ts', type: 'deprecated', description: 'Mock en memoria — marcado @deprecated. Pendiente migrar a logisticsService.ts' },
      { file: 'src/components/events/*.tsx (12 archivos)', type: 'modified', description: 'Migrados a eventService' },
      { file: 'src/components/academy/*.tsx (8 archivos)', type: 'modified', description: 'Migrados a academyService' },
      { file: 'src/components/sales/*.tsx (8 archivos)', type: 'modified', description: 'Migrados a leadService' },
    ],
    metrics: [
      { label: 'Componentes con Supabase directo', before: '85', after: '58', isPositive: true },
      { label: 'Servicios en src/services/', before: '33', after: '36', isPositive: true },
      { label: 'Servicios mock', before: '1', after: '1 (pendiente)', isPositive: false },
    ],
  },
  {
    id: 'fase2',
    phase: 'Fase 2',
    title: 'Tests',
    status: 'pending',
    date: 'Pendiente',
    summary:
      'Infraestructura de tests: mock de Supabase, tests de servicios críticos (accounting, meeting, ' +
      'event, maintenance), smoke tests de componentes. Objetivo: 8 archivos de test, ~30 casos, ~10% cobertura.',
    changes: [
      { file: 'src/__tests__/helpers/mockSupabase.ts', type: 'created', description: 'Utilidad de mock encadenado para tests de servicios sin BD real' },
      { file: 'src/__tests__/accountingService.test.ts', type: 'created', description: 'Tests de cálculos financieros, IVA, totales' },
      { file: 'src/__tests__/meetingService.test.ts', type: 'created', description: 'Tests de CRUD de reuniones' },
      { file: 'src/__tests__/eventService.test.ts', type: 'created', description: 'Tests de CRUD de eventos' },
      { file: 'src/__tests__/maintenanceService.test.ts', type: 'created', description: 'Tests de lógica de inspecciones' },
      { file: 'src/__tests__/LoginForm.test.tsx', type: 'created', description: 'Smoke test del flujo de autenticación' },
      { file: 'src/__tests__/MeetingModal.test.tsx', type: 'created', description: 'Smoke test del modal más complejo' },
      { file: 'vitest.config.ts', type: 'modified', description: 'Coverage thresholds: lines: 5, functions: 5, branches: 5' },
    ],
    metrics: [],
  },
  {
    id: 'fase3',
    phase: 'Fase 3',
    title: 'Descomposición + Reducción de any',
    status: 'pending',
    date: 'Pendiente',
    summary:
      'Descomponer los 5 mega-componentes (>2.000 líneas), reducir any de 464 a <150, ' +
      'activar tsconfig estricto, crear los 13 servicios pendientes.',
    changes: [
      { file: 'src/components/LogisticsManagementSystem.tsx', type: 'modified', description: '4.576 líneas → extraer SupplierMgmt, OrderMgmt, InventoryKPI + hook useLogisticsState' },
      { file: 'src/components/meetings/MeetingModal.tsx', type: 'modified', description: '3.376 líneas → extraer secciones + hook useMeetingModal' },
      { file: 'src/components/hr/ShiftAssignmentSystem.tsx', type: 'modified', description: '2.157 líneas → extraer ShiftCalendar, ShiftEditor, ShiftStats' },
      { file: 'src/components/academy/Contenidos/ContenidosView.tsx', type: 'modified', description: '2.223 líneas → extraer ContenidosList, Editor, Preview' },
      { file: 'src/services/maintenanceService.ts', type: 'modified', description: 'Reducir 41 :any usando tipos generados de maintenance_inspections' },
      { file: 'src/services/userService.ts', type: 'modified', description: 'Reducir 29 :any usando tipos generados de employees' },
      { file: 'tsconfig.app.json', type: 'modified', description: 'Activar noUnusedLocals y noUnusedParameters' },
    ],
    metrics: [],
  },
];

const ADRS: ADR[] = [
  {
    id: 'ADR-001',
    title: 'Supabase como BaaS',
    date: 'Oct 2024',
    decision: 'Usar Supabase (PostgreSQL hosted) en lugar de backend custom Node.js.',
    reason: 'Velocidad de MVP. Un fundador solo no puede mantener backend + frontend simultáneamente. Supabase incluye auth, storage, realtime y RLS.',
    tradeoffs: {
      pro: ['Auth, storage, realtime y RLS incluidos sin código', 'SDK tipado con TypeScript', 'Admin dashboard sin código extra', 'Escalabilidad gestionada'],
      con: ['Lock-in al proveedor (migrar: 2-3 semanas)', 'Lógica de negocio en cliente o RPC, no en servidor', 'Precio escala con usage'],
    },
  },
  {
    id: 'ADR-002',
    title: 'Netlify para deploy',
    date: 'Oct 2024',
    decision: 'Deploy en Netlify con Functions serverless para el backend Express.',
    reason: 'CI/CD automático desde git, SSL gratuito, CDN global, sin gestión de infraestructura.',
    tradeoffs: {
      pro: ['CI/CD automático', 'SSL + CDN gratuitos', 'Preview deployments por PR', 'Sin DevOps'],
      con: ['Cold starts en Functions serverless', 'Límites de ejecución en plan gratuito', 'No apto para WebSockets persistentes'],
    },
  },
  {
    id: 'ADR-003',
    title: 'Sistema ui.ts (toasts) reemplaza alert()',
    date: 'Feb 2026',
    decision: 'Reemplazar todos los alert()/confirm() nativos del browser por ui.ts.',
    reason: 'Los diálogos nativos bloquean el hilo JS, no se pueden estilizar con CSS, y en algunos entornos (iframes, PWA) se desactivan silenciosamente.',
    tradeoffs: {
      pro: ['No bloquean el hilo', 'Estilizables', 'Funcionan en todos los entornos', 'UX consistente'],
      con: ['await ui.confirm() no bloquea → código async', 'Requiere importar ui en cada componente'],
    },
  },
  {
    id: 'ADR-004',
    title: 'Tipos Supabase auto-generados',
    date: 'Feb 2026',
    decision: 'No mantener tipos de BD a mano. Regenerar con CLI tras cada cambio de schema.',
    reason: 'Con 40+ tablas y esquema en evolución, los tipos manuales siempre quedaban desfasados, generando falsos positivos en TypeScript y errores en producción.',
    tradeoffs: {
      pro: ['Siempre sincronizados con schema real', 'Autocompletado en IDE para columnas de BD', 'Errores de schema detectados en compile-time'],
      con: ['Requiere ejecutar npm run types:gen tras cambios', 'Archivo de 7.928 líneas no editable'],
    },
  },
  {
    id: 'ADR-005',
    title: 'Patrón de servicio con objeto exportado',
    date: 'Feb 2026',
    decision: 'Exportar servicios como objetos con métodos agrupados, no como funciones sueltas.',
    reason: 'Permite agrupar operaciones relacionadas, facilita el mocking en tests, y hace claro qué dominio gestiona cada operación.',
    tradeoffs: {
      pro: ['Fácil de mockear en tests', 'Agrupa operaciones por dominio', 'Autocomplete de IDE muestra operaciones disponibles'],
      con: ['No tree-shakeable (todo el objeto se importa aunque solo uses 1 método)'],
    },
  },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: PhaseStatus }) => {
  const config = {
    completed: { text: '✅ Completada', cls: 'bg-green-100 text-green-800 border-green-200' },
    in_progress: { text: '🔄 En curso', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    pending: { text: '⏳ Pendiente', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  }[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.cls}`}>
      {config.text}
    </span>
  );
};

const ChangeTypeBadge = ({ type }: { type: ChangeItem['type'] }) => {
  const config = {
    created: { text: 'NUEVO', cls: 'bg-green-100 text-green-700' },
    modified: { text: 'MOD', cls: 'bg-blue-100 text-blue-700' },
    deprecated: { text: 'DEPRECATED', cls: 'bg-orange-100 text-orange-700' },
    deleted: { text: 'BORRADO', cls: 'bg-red-100 text-red-700' },
  }[type];

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold ${config.cls}`}>
      {config.text}
    </span>
  );
};

const MetricCard = ({
  label,
  baseline,
  fase0,
  fase1,
  goal,
  trend,
}: MetricRow) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">{label}</div>
    <div className="grid grid-cols-5 gap-2 text-center">
      {[
        { phase: 'Línea Base', value: baseline, dim: true },
        { phase: 'Post F0', value: fase0, dim: false },
        { phase: 'Post F1', value: fase1, dim: false },
        { phase: 'Objetivo F', value: goal, dim: false },
        {
          phase: 'Tendencia',
          value: trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️',
          dim: false,
        },
      ].map(({ phase, value, dim }) => (
        <div key={phase}>
          <div className="text-xs text-gray-400 mb-1">{phase}</div>
          <div className={`text-sm font-bold ${dim ? 'text-gray-400' : 'text-gray-800'}`}>{value}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

export const ProjectHistoryView = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'adrs' | 'roadmap'>('overview');
  const [expandedPhase, setExpandedPhase] = useState<string | null>('fase1');

  const tabs = [
    { id: 'overview', label: '📊 Métricas' },
    { id: 'phases', label: '📅 Fases' },
    { id: 'adrs', label: '🏛️ Decisiones (ADR)' },
    { id: 'roadmap', label: '🗺️ Roadmap' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">📖 Biblia Histórica del Proyecto</h1>
              <p className="text-slate-300 text-sm">
                CRM Jungla Ibérica · Registro de evolución técnica para el CTO entrante
              </p>
            </div>
            <div className="text-right text-sm text-slate-400">
              <div>Última actualización</div>
              <div className="text-white font-medium">26 Feb 2026</div>
              <div className="text-slate-400 text-xs mt-1">Fase 1 completada</div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-600">
            {[
              { label: 'any escapes', value: '464', sub: 'objetivo: < 150', color: 'text-orange-300' },
              { label: 'DB directa', value: '58 / 183', sub: 'objetivo: 0', color: 'text-yellow-300' },
              { label: 'Tests', value: '1', sub: 'objetivo: 12+', color: 'text-red-300' },
              { label: 'Servicios', value: '36', sub: '+ 13 pendientes', color: 'text-green-300' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-slate-700 rounded-lg p-3">
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-slate-300 text-xs font-medium">{label}</div>
                <div className="text-slate-500 text-xs">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white border border-gray-200 border-b-white text-slate-800 -mb-px'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Métricas ───────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Dashboard de Calidad</h2>
              <p className="text-sm text-gray-500 mb-4">
                Evolución de métricas por fase. Ejecuta <code className="bg-gray-100 px-1 rounded text-xs">npm run audit</code> para ver los valores actuales.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {METRICS.map((m) => (
                  <MetricCard key={m.label} {...m} />
                ))}
              </div>
            </div>

            {/* Stack tecnológico */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Stack Tecnológico</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { layer: 'Frontend', tech: 'React 19', note: 'SPA con routing client-side' },
                  { layer: 'Lenguaje', tech: 'TypeScript ~5.8', note: 'Tipado estático completo' },
                  { layer: 'Build', tech: 'Vite 7', note: 'HMR rápido, bundles optimizados' },
                  { layer: 'CSS', tech: 'Tailwind CSS 4', note: 'Utility-first, sin CSS custom' },
                  { layer: 'Base de datos', tech: 'Supabase (PostgreSQL)', note: 'BaaS: auth, storage, RLS, realtime' },
                  { layer: 'Deploy', tech: 'Netlify', note: 'CI/CD automático desde git' },
                  { layer: 'Testing', tech: 'Vitest + RTL', note: 'Integrado con Vite sin config extra' },
                  { layer: 'IA', tech: 'Anthropic SDK + Google AI', note: 'CX automatizado, análisis' },
                ].map(({ layer, tech, note }) => (
                  <div key={layer} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-400 w-24 shrink-0 pt-0.5">{layer}</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{tech}</div>
                      <div className="text-xs text-gray-500">{note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Fases ──────────────────────────────────────────────────── */}
        {activeTab === 'phases' && (
          <div className="space-y-3">
            {PHASES.map((phase) => (
              <div key={phase.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-mono font-bold text-gray-400 w-14">{phase.phase}</div>
                    <div>
                      <div className="font-semibold text-gray-800">{phase.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{phase.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={phase.status} />
                    <span className="text-gray-400">{expandedPhase === phase.id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Body */}
                {expandedPhase === phase.id && (
                  <div className="border-t border-gray-100 p-5 space-y-5">
                    <p className="text-sm text-gray-600">{phase.summary}</p>

                    {/* Métricas delta */}
                    {phase.metrics && phase.metrics.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cambios medibles</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {phase.metrics.map((m) => (
                            <div key={m.label} className="bg-gray-50 rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400 line-through">{m.before}</span>
                                <span className="text-gray-400">→</span>
                                <span className={`text-sm font-bold ${m.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                                  {m.after}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Archivos */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Archivos afectados ({phase.changes.length})
                      </h4>
                      <div className="space-y-2">
                        {phase.changes.map((change, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <ChangeTypeBadge type={change.type} />
                            <div>
                              <code className="text-xs font-mono text-blue-700 bg-blue-50 px-1 rounded">
                                {change.file}
                              </code>
                              <p className="text-xs text-gray-500 mt-0.5">{change.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: ADRs ───────────────────────────────────────────────────── */}
        {activeTab === 'adrs' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>¿Qué es un ADR?</strong> Un Architecture Decision Record documenta una decisión
              de arquitectura importante: qué se decidió, por qué y qué trade-offs se aceptaron.
              Ayuda al equipo futuro a entender el contexto sin tener que revisar commits históricos.
            </div>

            {ADRS.map((adr) => (
              <div key={adr.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-800 text-white text-xs font-mono font-bold px-2 py-1 rounded shrink-0">
                    {adr.id}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-semibold text-gray-800">{adr.title}</h3>
                      <span className="text-xs text-gray-400">{adr.date}</span>
                    </div>

                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Decisión</div>
                        <p className="text-gray-700">{adr.decision}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Razón</div>
                        <p className="text-gray-700">{adr.reason}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-xs font-semibold text-green-700 mb-2">✅ Ventajas</div>
                          <ul className="space-y-1">
                            {adr.tradeoffs.pro.map((p, i) => (
                              <li key={i} className="text-xs text-green-800">{p}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="text-xs font-semibold text-orange-700 mb-2">⚠️ Trade-offs</div>
                          <ul className="space-y-1">
                            {adr.tradeoffs.con.map((c, i) => (
                              <li key={i} className="text-xs text-orange-800">{c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Roadmap ─────────────────────────────────────────────────── */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            {[
              {
                horizon: 'Corto plazo (próximas 4 semanas)',
                color: 'red',
                items: [
                  'Completar Fase 2: Tests — 8 archivos de test, ~30 casos, mock de Supabase',
                  'Completar Fase 3: Descomponer los 5 mega-componentes (>2K líneas)',
                  'Crear los 13 servicios pendientes (shift, timeclock, vacation, uniform…)',
                  'Reducir any de 464 a < 300 usando tipos generados',
                ],
              },
              {
                horizon: 'Medio plazo (2-3 meses)',
                color: 'yellow',
                items: [
                  'Cobertura de tests > 20%',
                  'any escapes < 150',
                  '0 componentes con queries Supabase directas',
                  '0 archivos > 2.000 líneas',
                  'Activar noUnusedLocals: true en tsconfig',
                  'CI/CD: npm run types:gen antes de cada deploy',
                ],
              },
              {
                horizon: 'Largo plazo (6+ meses)',
                color: 'green',
                items: [
                  'Cobertura de tests > 40%',
                  'E2E tests con Playwright (login, fichaje, reunión)',
                  'Storybook para componentes de UI',
                  'any < 50 (solo donde sea inevitable)',
                  'Separación en monorepo: packages/ui, packages/services, packages/types',
                  'Activar no-explicit-any: error en ESLint',
                ],
              },
            ].map(({ horizon, color, items }) => (
              <div key={horizon} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full bg-${color}-400`} />
                  <h3 className="font-semibold text-gray-800">{horizon}</h3>
                </div>
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-gray-300 mt-0.5">☐</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Servicios pendientes */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Servicios pendientes de crear (13)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { svc: 'shiftService.ts', tablas: 'shifts, shift_assignments' },
                  { svc: 'timeclockService.ts', tablas: 'time_records' },
                  { svc: 'vacationService.ts', tablas: 'vacation_requests' },
                  { svc: 'uniformService.ts', tablas: 'uniforms, uniform_assignments' },
                  { svc: 'incidentService.ts', tablas: 'incidents, cx_inbox' },
                  { svc: 'centerService.ts', tablas: 'centers' },
                  { svc: 'cxInboxService.ts', tablas: 'cx_messages' },
                  { svc: 'executiveDashboardService.ts', tablas: 'múltiples' },
                  { svc: 'auditService.ts', tablas: 'audit_log' },
                  { svc: 'documentService.ts', tablas: 'documents' },
                  { svc: 'franquiciadoService.ts', tablas: 'franchisees' },
                  { svc: 'objectiveService.ts', tablas: 'objectives' },
                  { svc: 'departmentService.ts', tablas: 'departments' },
                ].map(({ svc, tablas }) => (
                  <div key={svc} className="flex items-center gap-3 p-2.5 bg-orange-50 rounded-lg">
                    <span className="text-orange-400 text-xs">⏳</span>
                    <div>
                      <code className="text-xs font-mono text-orange-800">{svc}</code>
                      <div className="text-xs text-orange-600">{tablas}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400 pb-4">
          Documento vivo — actualizar en <code className="bg-gray-100 px-1 rounded">docs/PROJECT_HISTORY.md</code> al completar cada fase
          · <code className="bg-gray-100 px-1 rounded">npm run audit</code> para métricas actuales
        </div>
      </div>
    </div>
  );
};

export default ProjectHistoryView;
