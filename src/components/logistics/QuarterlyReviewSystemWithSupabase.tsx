import React, { useState, useEffect } from 'react';
import { Plus, Eye, Send, CheckCircle, Calendar, Trash2 } from 'lucide-react';
import QuarterlyReviewForm from './QuarterlyReviewForm';
import { useInventory } from '../../hooks/useInventory';
import { useSession } from '../../contexts/SessionContext';
import quarterlyInventoryService from '../../services/quarterlyInventoryService';
import { devLog } from '../../utils/devLogger';
import { ui } from '../../utils/ui';


interface QuarterlyReviewRecord {
  id: number;
  center_id?: string | number;
  status?: string;
  created_at?: string;
  deadline_date?: string;
  reviewItems?: Record<string, unknown>[];
  [key: string]: unknown;
}
interface QuarterlyReviewSystemProps {
  onItemUpdated?: () => void;
}

const QuarterlyReviewSystemWithSupabase: React.FC<QuarterlyReviewSystemProps> = ({ onItemUpdated }) => {
  const { inventoryItems } = useInventory();
  const { employee } = useSession();
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'create'>('list');
  const [selectedReview, setSelectedReview] = useState<QuarterlyReviewRecord | null>(null);
  const [reviews, setReviews] = useState<QuarterlyReviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState('');

  // Cargar revisiones desde Supabase
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    const result = await quarterlyInventoryService.getReviews();
    if (result.success) {
      setReviews(result.reviews || []);
    }
    setLoading(false);
  };

  const getCurrentQuarter = () => {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const year = now.getFullYear();
    return { quarter: `Q${quarter}-${year}`, year, quarterNum: quarter };
  };

  const openReviewForm = async (review: QuarterlyReviewRecord) => {
    setLoading(true);
    let formItems = [];

    // 1. Obtener la asignación asociada a esta revisión (si existe)
    const assignment = await quarterlyInventoryService.getAssignmentByReviewId(review.id);

    // 2. Si hay asignación, buscar items guardados
    let savedItemsMap: Record<number, any> = {};
    if (assignment) {
      const savedItems = await quarterlyInventoryService.getReviewItemsByAssignmentId(assignment.id);

      if (savedItems.length > 0) {
        savedItems.forEach((item) => {
          savedItemsMap[(item as Record<string, unknown>).inventory_item_id as number] = item;
        });
        devLog(`📥 Recuperados ${savedItems.length} items guardados de la asignación ${assignment.id}`);
      }
    }

    // 3. Construir lista combinando Inventario Maestro + Progreso Guardado
    const centerMap: Record<number, string> = {
      9: 'sevilla',
      10: 'jerez',
      11: 'puerto',
      1: 'central'
    };

    const centerKey = centerMap[review.center_id];
    const masterItems = inventoryItems.filter(item => item.center === centerKey);

    devLog(`📦 Cargando ${masterItems.length} items maestros para revisión de ${review.center_name}`);

    formItems = masterItems.map(item => {
      const saved = savedItemsMap[item.id];
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        system: item.quantity, // Siempre mostrar stock actual del sistema
        // Si hay guardado, usar valor guardado. Si no, 0.
        counted: saved ? saved.counted_quantity : 0,
        regular: saved ? saved.regular_quantity : 0,
        deteriorated: saved ? saved.deteriorated_quantity : 0,
        obs: saved ? saved.observations : ''
      };
    });

    review.reviewItems = formItems;
    review.assignment = assignment; // Guardar referencia

    setSelectedReview(review);
    setCurrentView('form');
    setLoading(false);
  };

  const backToList = () => {
    setCurrentView('list');
    setSelectedReview(null);
    loadReviews(); // Recargar al volver
  };

  // CONVOCAR NUEVA REVISIÓN TRIMESTRAL (Beni convoca, no la hace)
  const handleCreateReview = async () => {
    if (!deadlineDate) {
      ui.warning('⚠️ Por favor establece una fecha límite');
      return;
    }

    setLoading(true);
    devLog('📊 Inventario total cargado:', inventoryItems.length);

    const centers = [
      { id: 9, name: 'Sevilla' },
      { id: 10, name: 'Jerez' },
      { id: 11, name: 'Puerto' }
    ];

    const centersWithItems = centers.map(center => {
      const centerMap: Record<string, number> = { sevilla: 9, jerez: 10, puerto: 11 };
      const centerItems = inventoryItems.filter(item => centerMap[item.center] === center.id);

      return {
        id: center.id,
        name: center.name,
        items: centerItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity
        }))
      };
    }).filter(center => center.items.length > 0);

    if (centersWithItems.length === 0) {
      ui.warning('⚠️ No se encontraron productos en el inventario');
      setLoading(false);
      return;
    }

    const { quarter, year } = getCurrentQuarter();

    // Crear revisiones en estado DRAFT (sin activar aún)
    const result = await quarterlyInventoryService.createReview({
      quarter,
      year,
      deadline_date: deadlineDate,
      created_by: employee?.email || 'beni.jungla@gmail.com',
      centers: centersWithItems
    });

    if (result.success) {
      ui.success(`✅ Revisión Trimestral ${quarter} convocada\n\n` +
        `Se han creado ${result.reviews?.length} revisiones:\n` +
        centersWithItems.map(c => `🏪 ${c.name}: ${c.items.length} productos`).join('\n') +
        `\n\n⏰ Fecha límite: ${new Date(deadlineDate).toLocaleDateString('es-ES')}\n\n` +
        `📌 Ahora debes ACTIVAR cada revisión para notificar a los encargados.`);
      setShowCreateModal(false);
      setDeadlineDate('');
      loadReviews();
    } else {
      ui.error('❌ Error convocando revisión');
    }

    setLoading(false);
  };

  // ACTIVAR REVISIÓN (Beni)
  const handleActivateReview = async (reviewId: number, centerName: string) => {
    const encargados: Record<string, string> = {
      'Sevilla': 'franciscogiraldezmorales@gmail.com',
      'Jerez': 'ivan.jerez@lajungla.es',
      'Puerto': 'guillermo.puerto@lajungla.es'
    };

    const encargadoEmail = encargados[centerName];

    if (!encargadoEmail) {
      ui.warning('⚠️ No se encontró encargado para este centro');
      return;
    }

    const confirm = await ui.confirm(
      `¿Activar revisión y notificar a ${encargadoEmail}?\n\n` +
      `El encargado recibirá una notificación y podrá completar la revisión desde su módulo de Gestión.`
    );

    if (!confirm) return;

    setLoading(true);
    const result = await quarterlyInventoryService.activateReview(reviewId, encargadoEmail);

    if (result.success) {
      ui.success(`✅ Revisión activada y notificación enviada a ${encargadoEmail}`);
      loadReviews();
    } else {
      ui.error('❌ Error activando revisión');
    }

    setLoading(false);
  };

  // MODAL DE DECISIONES POST-REVISIÓN (Beni)
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [reviewToProcess, setReviewToProcess] = useState<QuarterlyReviewRecord | null>(null);
  const [allReviewItems, setAllReviewItems] = useState<any[]>([]); // Todos los items de la revisión
  const [decisions, setDecisions] = useState<Record<number, {
    darDeBaja: boolean;
    enviarAPedido: boolean;
    marcarRegular: boolean;
    toOrder: number;
  }>>({});
  const [showOnlyDiscrepancies, setShowOnlyDiscrepancies] = useState(true);

  const openDecisionModal = async (review: QuarterlyReviewRecord) => {
    setLoading(true);

    // Buscar asignación de esta revisión
    const assignmentForModal = await quarterlyInventoryService.getAssignmentByReviewId(review.id);

    if (!assignmentForModal) {
      ui.error('Error cargando detalles de asignación');
      setLoading(false);
      return;
    }

    const reviewItems = await quarterlyInventoryService.getReviewItemsByAssignmentId(assignmentForModal.id);

    if (reviewItems.length >= 0) {
      setAllReviewItems(reviewItems);

      // Inicializar decisiones por defecto para items con discrepancias
      const initialDecisions: Record<number, any> = {};
      reviewItems.forEach((item: any) => {
        const counted = item.counted_quantity || 0;
        const system = item.current_system_quantity || 0;
        const broken = item.deteriorated_quantity || 0;
        const regular = item.regular_quantity || 0;
        const missing = system > counted ? system - counted : 0;
        const hasIssue = (counted !== system) || broken > 0 || regular > 0;

        if (hasIssue) {
          initialDecisions[item.id] = {
            darDeBaja: false,       // The user requested NO auto-checks 
            enviarAPedido: false,   // The user prefers explicit manual checking
            marcarRegular: false,
            toOrder: broken + missing,   // Keep suggested quantity
          };
        }
      });
      setDecisions(initialDecisions);
    }

    setReviewToProcess(review);
    setShowDecisionModal(true);
    setLoading(false);
  };

  const updateDecision = (itemId: number, field: string, value: unknown) => {
    setDecisions(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { darDeBaja: false, enviarAPedido: false, marcarRegular: false, toOrder: 0 }),
        [field]: value
      }
    }));
  };

  const handleProcessDecisions = async () => {
    if (!reviewToProcess) return;

    // Construir array de decisiones para el servicio
    const itemsWithDecisions = allReviewItems
      .filter((item) => decisions[item.id])
      .map((item) => {
        const d = decisions[item.id];
        const counted = item.counted_quantity || 0;
        const system = item.current_system_quantity || 0;
        const broken = item.deteriorated_quantity || 0;
        const regular = item.regular_quantity || 0;
        const missing = system > counted ? system - counted : 0;

        return {
          item_id: item.id,
          inventory_item_id: item.inventory_item_id,
          product_name: item.product_name,
          category: item.category,
          current_system_quantity: system,
          counted_quantity: counted,
          regular_quantity: regular,
          deteriorated_quantity: broken,
          actions: {
            darDeBaja: d.darDeBaja,
            enviarAPedido: d.enviarAPedido,
            marcarRegular: d.marcarRegular,
          },
          quantities: {
            broken: d.darDeBaja ? broken : 0,
            missing,
            regular,
            toOrder: d.enviarAPedido ? d.toOrder : 0,
          }
        };
      });

    if (itemsWithDecisions.length === 0) {
      ui.info('No has seleccionado ninguna acción. Marca al menos una decisión para procesar.');
      return;
    }

    // Resumen para confirmación
    const totalBajas = itemsWithDecisions.filter(d => d.actions.darDeBaja).length;
    const totalPedido = itemsWithDecisions.filter(d => d.actions.enviarAPedido).length;
    const totalRegular = itemsWithDecisions.filter(d => d.actions.marcarRegular).length;
    const totalUnidadesPedido = itemsWithDecisions.reduce((sum, d) => sum + d.quantities.toOrder, 0);

    const confirmMsg = [
      `⚡ ¿Procesar estas decisiones?\n`,
      totalBajas > 0 ? `🗑️ Dar de baja: ${totalBajas} productos` : '',
      totalPedido > 0 ? `🛒 Pedido post-revisión: ${totalPedido} productos (${totalUnidadesPedido} uds)` : '',
      totalRegular > 0 ? `⚠️ Marcar regular: ${totalRegular} productos` : '',
      `\n• Se actualizará el inventario.`,
      `• Se generará el pedido automáticamente.`,
      `• Carlos recibirá notificación resumen.`
    ].filter(Boolean).join('\n');

    if (!await ui.confirm(confirmMsg)) return;

    setLoading(true);
    const result = await quarterlyInventoryService.processReviewDecisions(
      reviewToProcess.id,
      reviewToProcess.center_name,
      reviewToProcess.quarter,
      itemsWithDecisions,
      employee?.email || 'beni.jungla@gmail.com'
    );

    if (result.success && result.summary) {
      const s = result.summary;
      let successMsg = `✅ Revisión procesada correctamente.\n\n`;
      successMsg += `📊 Resumen:\n`;
      if (s.bajasUnidades > 0) successMsg += `• 🗑️ ${s.bajasUnidades} uds dadas de baja (${s.bajas} productos)\n`;
      if (s.faltantesUnidades > 0) successMsg += `• ❌ ${s.faltantesUnidades} uds faltantes registradas\n`;
      if (s.regulares > 0) successMsg += `• ⚠️ ${s.regulares} productos marcados como Regular\n`;
      if (result.orderId) successMsg += `\n🛒 Pedido generado: ${result.orderId}\n(${s.pedidoUnidades} unidades en ${s.pedidoItems} productos)`;

      ui.info(successMsg);
      setShowDecisionModal(false);
      setDecisions({});
      loadReviews();
      if (onItemUpdated) onItemUpdated();
    } else {
      ui.error('❌ Error procesando decisiones. Revisa la consola.');
    }
    setLoading(false);
  };

  // Filtrar items para mostrar
  const getFilteredItems = () => {
    if (!showOnlyDiscrepancies) return allReviewItems;
    return allReviewItems.filter((item) => {
      const counted = item.counted_quantity || 0;
      const system = item.current_system_quantity || 0;
      const broken = item.deteriorated_quantity || 0;
      const regular = item.regular_quantity || 0;
      return counted !== system || broken > 0 || regular > 0;
    });
  };

  // ========== RENDER ==========

  if (currentView === 'form' && selectedReview) {
    return <QuarterlyReviewForm onBack={backToList} reviewData={selectedReview} />;
  }

  // Contar totales para el resumen del modal
  const countDecisionSummary = () => {
    let bajas = 0, pedido = 0, regulares = 0, unidades = 0;
    Object.values(decisions).forEach(d => {
      if (d.darDeBaja) bajas++;
      if (d.enviarAPedido) { pedido++; unidades += d.toOrder; }
      if (d.marcarRegular) regulares++;
    });
    return { bajas, pedido, regulares, unidades };
  };

  const summary = countDecisionSummary();

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2>📋 Revisiones Trimestrales de Inventario</h2>
        {/* Boton Convocar solo para Beni/Admin */}
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: loading ? '#9ca3af' : '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={20} /> Convocar Revisión {getCurrentQuarter().quarter}
        </button>
      </div>

      {/* MODAL DE DECISIONES POST-REVISIÓN */}
      {showDecisionModal && reviewToProcess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>⚡ Decisiones Post-Revisión</h2>
            <p style={{ color: '#6b7280' }}>Revisión: <strong>{reviewToProcess.quarter} - {reviewToProcess.center_name}</strong></p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563' }}>
                <input
                  type="checkbox"
                  checked={showOnlyDiscrepancies}
                  onChange={(e) => setShowOnlyDiscrepancies(e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                Mostrar solo items con discrepancias/roturas
              </label>
              <div style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '500' }}>
                {summary.bajas > 0 && <span style={{ color: '#ef4444' }}>🗑️ {summary.bajas} Bajas</span>}
                {summary.pedido > 0 && <span style={{ color: '#3b82f6' }}>🛒 {summary.pedido} Pedido ({summary.unidades} uds)</span>}
                {summary.regulares > 0 && <span style={{ color: '#f59e0b' }}>⚠️ {summary.regulares} Regular</span>}
              </div>
            </div>

            <div style={{ marginBottom: '1rem', maxHeight: '50vh', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '25%' }}>Producto</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '8%' }}>Sistema</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '8%' }}>Contados</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '8%' }}>Rotos</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '8%' }}>Regular</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '10%' }}>Diferencia</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '10%' }}>Dar de Baja</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '10%' }}>Enviar a Pedido</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '10%' }}>Marcar Regular</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const items = getFilteredItems();
                    if (items.length === 0) {
                      return <tr><td colSpan={9} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>✅ No hay items con discrepancias o roturas.</td></tr>;
                    }

                    const grouped = items.reduce((acc: Record<string, typeof items>, item) => {
                      const cat = item.category && item.category !== 'null' ? item.category : 'Sin Clasificar';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(item);
                      return acc;
                    }, {});

                    return Object.keys(grouped).sort().map(category => (
                      <React.Fragment key={category}>
                        <tr style={{ backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb', borderBottom: '2px solid #e5e7eb' }}>
                          <td colSpan={9} style={{ padding: '8px 12px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px', color: '#111827' }}>
                            📁 {category} ({grouped[category].length} items)
                          </td>
                        </tr>
                        {grouped[category].map((item) => {
                          const counted = item.counted_quantity || 0;
                          const system = item.current_system_quantity || 0;
                          const broken = item.deteriorated_quantity || 0;
                          const regular = item.regular_quantity || 0;
                          const diff = counted - system;
                          const missing = system > counted ? system - counted : 0;

                          const itemDecisions = decisions[item.id] || { darDeBaja: false, enviarAPedido: false, marcarRegular: false, toOrder: broken + missing };

                          return (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '10px', fontWeight: '500' }}>{item.product_name}</td>
                              <td style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>{system}</td>
                              <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{counted}</td>
                              <td style={{ padding: '10px', textAlign: 'center', color: broken > 0 ? '#ef4444' : '#d1d5db' }}>
                                {broken > 0 ? broken : '-'}
                              </td>
                              <td style={{ padding: '10px', textAlign: 'center', color: regular > 0 ? '#f59e0b' : '#d1d5db' }}>
                                {regular > 0 ? regular : '-'}
                              </td>
                              <td style={{
                                padding: '10px', textAlign: 'center',
                                color: diff < 0 ? '#ef4444' : diff > 0 ? '#10b981' : '#6b7280',
                                fontWeight: diff !== 0 ? 'bold' : 'normal'
                              }}>
                                {diff > 0 ? `+${diff}` : diff}
                              </td>
                              <td style={{ padding: '10px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={itemDecisions.darDeBaja}
                                  onChange={(e) => updateDecision(item.id, 'darDeBaja', e.target.checked)}
                                  disabled={broken === 0}
                                />
                                {broken > 0 && <span style={{ marginLeft: '5px', color: '#ef4444' }}>({broken})</span>}
                              </td>
                              <td style={{ padding: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <input
                                  type="checkbox"
                                  checked={itemDecisions.enviarAPedido}
                                  onChange={(e) => updateDecision(item.id, 'enviarAPedido', e.target.checked)}
                                />
                                {itemDecisions.enviarAPedido && (
                                  <input
                                    type="number"
                                    value={itemDecisions.toOrder}
                                    onChange={(e) => updateDecision(item.id, 'toOrder', parseInt(e.target.value) || 0)}
                                    min="0"
                                    style={{ width: '50px', padding: '3px', borderRadius: '4px', border: '1px solid #ccc' }}
                                  />
                                )}
                              </td>
                              <td style={{ padding: '10px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={itemDecisions.marcarRegular}
                                  onChange={(e) => updateDecision(item.id, 'marcarRegular', e.target.checked)}
                                />
                                {regular > 0 && <span style={{ marginLeft: '5px', color: '#f59e0b', fontSize: '12px' }}>({regular} rep.)</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowDecisionModal(false)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button
                onClick={handleProcessDecisions}
                disabled={loading || Object.keys(decisions).length === 0}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: loading || Object.keys(decisions).length === 0 ? '#9ca3af' : '#059669',
                  color: 'white',
                  cursor: loading || Object.keys(decisions).length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Procesando...' : `Procesar Decisiones (${Object.keys(decisions).length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0 }}>📋 Convocar Revisión Trimestral</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Se convocará la revisión para todos los centros. Los encargados recibirán una notificación y podrán completar el conteo desde su módulo de Gestión.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                <Calendar size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Fecha Límite *
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setDeadlineDate('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateReview}
                disabled={!deadlineDate || loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: deadlineDate && !loading ? '#059669' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: deadlineDate && !loading ? 'pointer' : 'not-allowed'
                }}
              >
                Convocar Revisión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de revisiones */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {loading && reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Cargando revisiones...
          </div>
        ) : reviews.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            border: '2px dashed #e5e7eb',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>No hay revisiones trimestrales</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Crea la primera revisión {getCurrentQuarter().quarter} para comenzar el proceso de conteo trimestral.
            </p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: '8px' }}>
                    🏪 {review.center_name} - {review.quarter}
                  </h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    📦 {review.total_items} productos •
                    {review.total_discrepancies > 0 ? ` ⚠️ ${review.total_discrepancies} discrepancias` : ' ✅ Sin discrepancias'}
                  </p>
                  {review.deadline_date && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#f59e0b' }}>
                      ⏰ Fecha límite: {new Date(review.deadline_date).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor:
                    review.status === 'aplicada' ? '#059669' :
                      review.status === 'submitted' ? '#3b82f6' :
                        review.status === 'active' ? '#f59e0b' :
                          '#6b7280',
                  color: 'white'
                }}>
                  {review.status === 'aplicada' ? '✅ Aplicada' :
                    review.status === 'submitted' ? '🔵 Enviada' :
                      review.status === 'active' ? '🟡 Activa' :
                        '📝 Borrador'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => openReviewForm(review)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px'
                  }}
                >
                  <Eye size={16} /> Ver Detalles
                </button>

                {review.status === 'draft' && (
                  <button
                    onClick={() => handleActivateReview(review.id, review.center_name)}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: loading ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <Send size={16} /> Activar y Notificar
                  </button>
                )}

                {/* BOTON DE APLICAR SOLO PARA STATUS SUBMITTED (O Active si se quiere forzar) */}
                {(review.status === 'submitted' || review.status === 'active') && (
                  <button
                    onClick={() => openDecisionModal(review)}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: loading ? '#9ca3af' : '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <CheckCircle size={16} /> Revisar y Aplicar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuarterlyReviewSystemWithSupabase;
