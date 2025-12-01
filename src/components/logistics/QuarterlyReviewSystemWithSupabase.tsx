import React, { useState, useEffect } from 'react';
import { Plus, Eye, Send, CheckCircle, Calendar, Trash2 } from 'lucide-react';
import QuarterlyReviewForm from './QuarterlyReviewForm';
import { useInventory } from '../../hooks/useInventory';
import { useSession } from '../../contexts/SessionContext';
import quarterlyInventoryService from '../../services/quarterlyInventoryService';

const QuarterlyReviewSystemWithSupabase: React.FC = () => {
  const { inventoryItems } = useInventory();
  const { employee } = useSession();
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'create'>('list');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
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

  const openReviewForm = (review: any) => {
    // Si la revisión no tiene items cargados, cargarlos del inventario actual
    if (!review.reviewItems) {
      const centerMap: Record<number, string> = {
        9: 'sevilla',
        10: 'jerez',
        11: 'puerto',
        1: 'central'
      };

      const centerKey = centerMap[review.center_id];
      const items = inventoryItems.filter(item => item.center === centerKey);

      console.log(`📦 Cargando ${items.length} items para revisión de ${review.center_name}`);

      review.reviewItems = items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        system: item.quantity,
        counted: 0,
        regular: 0,
        deteriorated: 0,
        obs: ''
      }));
    }

    setSelectedReview(review);
    setCurrentView('form');
  };

  const backToList = () => {
    setCurrentView('list');
    setSelectedReview(null);
    loadReviews(); // Recargar al volver
  };

  // CONVOCAR NUEVA REVISIÓN TRIMESTRAL (Beni convoca, no la hace)
  const handleCreateReview = async () => {
    if (!deadlineDate) {
      alert('⚠️ Por favor establece una fecha límite');
      return;
    }

    setLoading(true);
    console.log('📊 Inventario total cargado:', inventoryItems.length);

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
      alert('⚠️ No se encontraron productos en el inventario');
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
      alert(`✅ Revisión Trimestral ${quarter} convocada\n\n` +
        `Se han creado ${result.reviews?.length} revisiones:\n` +
        centersWithItems.map(c => `🏪 ${c.name}: ${c.items.length} productos`).join('\n') +
        `\n\n⏰ Fecha límite: ${new Date(deadlineDate).toLocaleDateString('es-ES')}\n\n` +
        `📌 Ahora debes ACTIVAR cada revisión para notificar a los encargados.`);
      setShowCreateModal(false);
      setDeadlineDate('');
      loadReviews();
    } else {
      alert('❌ Error convocando revisión');
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
      alert('⚠️ No se encontró encargado para este centro');
      return;
    }

    const confirm = window.confirm(
      `¿Activar revisión y notificar a ${encargadoEmail}?\n\n` +
      `El encargado recibirá una notificación y podrá completar la revisión desde su módulo de Gestión.`
    );

    if (!confirm) return;

    setLoading(true);
    const result = await quarterlyInventoryService.activateReview(reviewId, encargadoEmail);

    if (result.success) {
      alert(`✅ Revisión activada y notificación enviada a ${encargadoEmail}`);
      loadReviews();
    } else {
      alert('❌ Error activando revisión');
    }

    setLoading(false);
  };

  // AUTORIZAR ELIMINACIÓN DE ITEMS ROTOS (Beni)
  const handleAuthorizeRemoval = async (reviewId: number) => {
    const confirm = window.confirm(
      '⚠️ ¿Autorizar eliminación de items rotos?\n\n' +
      'Esta acción:\n' +
      '• Eliminará automáticamente los items marcados del inventario\n' +
      '• Actualizará las cantidades en el sistema\n' +
      '• Marcará la revisión como completada\n\n' +
      '¿Continuar?'
    );

    if (!confirm) return;

    setLoading(true);
    const result = await quarterlyInventoryService.authorizeItemRemoval(
      reviewId,
      employee?.email || 'beni.jungla@gmail.com'
    );

    if (result.success) {
      const summary = result.removedItems?.map((item: any) =>
        `• ${item.name}: -${item.removed} (nuevo total: ${item.newQuantity})`
      ).join('\n');

      alert(`✅ Items eliminados del inventario:\n\n${summary}`);
      loadReviews();
    } else {
      alert('❌ Error autorizando eliminación');
    }

    setLoading(false);
  };

  if (currentView === 'form' && selectedReview) {
    return <QuarterlyReviewForm onBack={backToList} reviewData={selectedReview} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2>📋 Revisiones Trimestrales de Inventario</h2>
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
                    review.status === 'completed' ? '#059669' :
                      review.status === 'active' ? '#3b82f6' :
                        '#6b7280',
                  color: 'white'
                }}>
                  {review.status === 'completed' ? '✅ Completada' :
                    review.status === 'active' ? '🔄 Activa' :
                      '📝 Borrador'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => openReviewForm(review)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
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

                {review.status === 'active' && review.total_discrepancies > 0 && (
                  <button
                    onClick={() => handleAuthorizeRemoval(review.id)}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: loading ? '#9ca3af' : '#f59e0b',
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
                    <CheckCircle size={16} /> Autorizar Eliminación
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
