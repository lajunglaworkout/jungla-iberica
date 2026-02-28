import React, { useState } from 'react';
import { Plus, Eye, ArrowLeft } from 'lucide-react';
import QuarterlyReviewForm from './QuarterlyReviewForm';
import { useInventory } from '../../hooks/useInventory';
import { ui } from '../../utils/ui';


const QuarterlyReviewSystem: React.FC = () => {
  const { inventoryItems } = useInventory();
  const [selectedCenter, setSelectedCenter] = useState<'all' | number>('all');
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'create'>('list');
  const [selectedReview, setSelectedReview] = useState<Record<string, unknown> | null>(null);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);

  const openReviewForm = (review: Record<string, unknown>) => {
    setSelectedReview(review);
    setCurrentView('form');
  };

  const backToList = () => {
    setCurrentView('list');
    setSelectedReview(null);
  };

  const getCurrentQuarter = () => {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    return `Q${quarter}-${now.getFullYear()}`;
  };

  const createNewReview = () => {
    console.log('📊 Inventario total cargado:', inventoryItems.length);
    console.log('📦 Items por centro:', inventoryItems.reduce((acc, item) => {
      acc[item.center] = (acc[item.center] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));

    // Crear revisiones para todos los centros con inventario real
    const centers = [
      { id: 9, name: 'Sevilla' },
      { id: 10, name: 'Jerez' },
      { id: 11, name: 'Puerto' }
    ];

    const newReviews = centers.map(center => {
      // Filtrar items del inventario por centro
      const centerItems = inventoryItems.filter(item => {
        const centerMap: Record<string, number> = { sevilla: 9, jerez: 10, puerto: 11 };
        return centerMap[item.center] === center.id;
      });

      console.log(`🏪 ${center.name} (ID: ${center.id}):`, centerItems.length, 'productos');
      console.log('Productos encontrados:', centerItems.map(item => `${item.name} (${item.center})`));

      // Crear items para la revisión con datos reales del inventario
      const reviewItems = centerItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        system: item.quantity,
        counted: 0,
        regular: 0,
        deteriorated: 0,
        obs: ''
      }));

      return {
        id: Date.now() + center.id,
        center: center.name,
        quarter: getCurrentQuarter(), // Q4-2025 para octubre
        status: 'draft',
        items: centerItems.length, // Usar el número real de items filtrados
        discrepancies: 0,
        created_date: new Date().toISOString().split('T')[0],
        reviewItems: reviewItems
      };
    });

    // Filtrar solo centros que tienen productos
    const reviewsWithItems = newReviews.filter(review => review.items > 0);

    if (reviewsWithItems.length === 0) {
      ui.warning('⚠️ No se encontraron productos en el inventario para crear revisiones.\n\nVerifica que el inventario esté cargado correctamente.');
      return;
    }

    // Añadir las nuevas revisiones al estado
    setReviews(prev => [...prev, ...reviewsWithItems]);
    
    // Mostrar mensaje de confirmación con números reales
    ui.success(`✅ Se han creado ${reviewsWithItems.length} revisiones para ${getCurrentQuarter()}\n\n` +
          reviewsWithItems.map(r => `🏪 ${r.center}: ${r.items} productos`).join('\n'));
  };

  if (currentView === 'form' && selectedReview) {
    return <QuarterlyReviewForm onBack={backToList} reviewData={selectedReview} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2>📋 Revisiones Trimestrales</h2>
        <button 
          onClick={createNewReview}
          style={{ 
            padding: '12px 20px', 
            backgroundColor: '#059669', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={20} /> Nueva Revisión {getCurrentQuarter()}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {reviews.length === 0 ? (
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
              Crea la primera revisión {getCurrentQuarter()} para comenzar el proceso de conteo trimestral.
            </p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              💡 Al crear una revisión, se generarán automáticamente formularios para todos los centros con inventario.
            </p>
          </div>
        ) : (
          reviews.map(review => (
          <div key={review.id} style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, marginBottom: '8px' }}>🏪 {review.center} - {review.quarter}</h3>
              <p style={{ margin: 0, color: '#6b7280' }}>
                📦 {review.items} productos • 
                {review.discrepancies > 0 ? ` ⚠️ ${review.discrepancies} discrepancias` : ' ✅ Sin discrepancias'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                Creada: {new Date(review.created_date).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: review.status === 'completed' ? '#059669' : 
                               review.status === 'in_review' ? '#f59e0b' : '#6b7280',
                color: 'white'
              }}>
                {review.status === 'completed' ? '✅ Completada' : 
                 review.status === 'in_review' ? '👀 En Revisión' : '📝 Borrador'}
              </span>
              <button 
                onClick={() => openReviewForm(review)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Eye size={16} /> Ver
              </button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuarterlyReviewSystem;
