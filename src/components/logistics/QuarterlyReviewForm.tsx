import React, { useState } from 'react';
import { Save, Send, ArrowLeft } from 'lucide-react';
import quarterlyInventoryService from '../../services/quarterlyInventoryService';
import { devLog } from '../../utils/devLogger';
import { ui } from '../../utils/ui';


interface ReviewItem {
  id: number;
  name: string;
  system: number;
  counted: number | null;
  regular: number;
  deteriorated: number;
  obs: string;
  touched?: boolean;
  [key: string]: unknown;
}
interface QuarterlyReviewData {
  reviewItems?: ReviewItem[];
  [key: string]: unknown;
}
interface QuarterlyReviewFormProps {
  onBack: () => void;
  reviewData: QuarterlyReviewData;
}

const QuarterlyReviewForm: React.FC<QuarterlyReviewFormProps> = ({ onBack, reviewData }) => {
  // Usar los items reales del inventario si están disponibles, sino usar datos de ejemplo
  // BUG-INF1 FIX: Cada item arranca con touched=false. Solo los que Francisco modifica manualmente
  // se enviarán con counted_quantity real. Los no tocados se envían como null → el backend los ignora.
  const initialItems = (reviewData.reviewItems || [
    { id: 1, name: 'Mancuerna 4KG', system: 8, counted: null, regular: 0, deteriorated: 0, obs: '' },
    { id: 2, name: 'Mancuerna 5KG', system: 6, counted: null, regular: 0, deteriorated: 0, obs: '' }
  ]).map((item: ReviewItem) => ({ ...item, touched: false }));

  const [items, setItems] = useState(initialItems);
  const [showDiscrepanciesOnly, setShowDiscrepanciesOnly] = useState(false);

  const updateItem = (id: number, field: string, value: unknown) => {
    setItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, [field]: value, touched: true } : item
    ));
  };

  // Calcular totales
  const totals = items.reduce((acc: { totalProducts: number; totalSystem: number; totalCounted: number; totalRegular: number; totalDeteriorated: number; discrepancies: number }, item) => ({
    totalProducts: acc.totalProducts + 1,
    totalSystem: acc.totalSystem + item.system,
    totalCounted: acc.totalCounted + (item.counted || 0), // Counted es el total
    totalRegular: acc.totalRegular + (item.regular || 0),
    totalDeteriorated: acc.totalDeteriorated + (item.deteriorated || 0),
    discrepancies: acc.discrepancies + (item.counted !== null && item.counted !== '' && Number(item.counted) !== Number(item.system) ? 1 : 0)
  }), {
    totalProducts: 0,
    totalSystem: 0,
    totalCounted: 0,
    totalRegular: 0,
    totalDeteriorated: 0,
    discrepancies: 0
  });

  const filteredItems = showDiscrepanciesOnly
    ? items.filter((item) => item.counted !== null && item.counted !== '' && Number(item.counted) !== Number(item.system))
    : items;

  // ...

  const handleSave = async () => {
    devLog('💾 Guardando progreso...', items);

    try {
      // Transformar items al formato esperado por el servicio
      // BUG-INF1 FIX: Solo enviar counted_quantity si el item fue tocado manualmente
      const reviewItems = items.map((item) => ({
        inventory_item_id: item.id,
        product_name: item.name,
        category: item.category,
        current_system_quantity: item.system,
        counted_quantity: item.touched ? (item.counted ?? null) : null,
        regular_quantity: item.touched ? (item.regular || 0) : 0,
        deteriorated_quantity: item.touched ? (item.deteriorated || 0) : 0,
        to_remove_quantity: item.touched ? (item.deteriorated || 0) : 0,
        observations: item.obs || ''
      }));

      // Guardar en la base de datos
      const result = await quarterlyInventoryService.saveReviewItems(reviewData.id, reviewItems);

      if (result.success) {
        ui.success('✅ Progreso guardado correctamente. Puedes continuar más tarde.');
        devLog('✅ Items guardados:', result.items);
      } else {
        ui.error('❌ Error guardando el progreso. Inténtalo de nuevo.');
        console.error('❌ Error guardando:', result.error);
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      ui.error('❌ Error inesperado guardando el progreso.');
    }
  };

  const handleSend = async () => {
    devLog('📤 Enviando a Beni...', items);

    // 1. Validar inconsistencias lógicas (Subconjuntos > Total)
    const illogicalItems = items.filter((item) => {
      const subsets = (item.regular || 0) + (item.deteriorated || 0);
      return subsets > (item.counted || 0);
    });

    if (illogicalItems.length > 0) {
      const itemList = illogicalItems.map((i) => `• ${i.name} (Total: ${i.counted} | Detalle: ${(i.regular || 0) + (i.deteriorated || 0)})`).join('\n');
      ui.error(`Error logico: la suma de Regular+Deteriorado supera Contado en: ${itemList.replace(/\n/g, ' | ')}`);
      return;
    }

    // 2. Validar discrepancias con sistema (Avisar pero permitir enviar si es intencional)
    const discrepancies = items.filter((item) => {
      // Comparar Total Físico (counted) con Sistema
      return Number(item.counted) !== Number(item.system);
    });

    if (discrepancies.length > 0) {
      const confirmSend = await ui.confirm(
        `⚠️ Hay ${discrepancies.length} productos con discrepancias entre Contado y Sistema.\n\n` +
        `¿Confirmas que has contado bien y quieres enviar estas diferencias para ajuste?`
      );
      if (!confirmSend) return;
    }

    try {
      // Primero guardar todo
      await handleSave();

      // Luego marcar como asignación completada (pasa a submitted en el sistema)
      // TODO: Usar el email del usuario real si está disponible
      const result = await quarterlyInventoryService.completeAssignment(reviewData.id, 'franciscogiraldezmorales@gmail.com');

      if (result.success) {
        ui.success('✅ Revisión ENVIADA a Beni.\n\nAhora Logística revisará las discrepancias y aplicará los cambios al inventario.');
        onBack(); // Volver al panel principal
      } else {
        ui.error('❌ Error enviando la revisión.');
        console.error('❌ Error completando:', result.error);
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      ui.error('❌ Error inesperado enviando la revisión.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div style={{ backgroundColor: '#059669', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 style={{ margin: 0 }}>MATERIAL DEPORTIVO - REVISIÓN {reviewData.quarter}</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>Centro: {reviewData.center}</p>
          </div>
        </div>

        {/* Toolbar de Filtros y Acciones */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', color: '#374151' }}>
              <input
                type="checkbox"
                checked={showDiscrepanciesOnly}
                onChange={(e) => setShowDiscrepanciesOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
              />
              Mostrar solo discrepancias ({totals.discrepancies})
            </label>
          </div>
          <div>
            <button
              onClick={() => ui.warning('🚧 Función "Añadir Producto Manual" en desarrollo.\n\nPor favor, añade productos no listados en el campo "Observaciones" de un item relacionado o al final de la revisión.')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              + Añadir Producto Manual
            </button>
          </div>
        </div>

        {/* Vista Escritorio (Tabla) */}
        <div className="hidden md:block overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb' }}>PRODUCTO</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', width: '20%' }}>SISTEMA</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', width: '20%', backgroundColor: '#ecfdf5' }}>TOTAL FÍSICO</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', width: '15%', fontSize: '12px' }}>DE LOS CUALES<br />REGULAR</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', width: '15%', fontSize: '12px', color: '#ef4444' }}>DE LOS CUALES<br />ROTOS (BAJA)</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb' }}>OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let lastCategory = '';
                return filteredItems.map((item) => {
                  const isUncounted = item.counted === null || item.counted === '';
                  const hasDiscrepancy = !isUncounted && Number(item.counted) !== Number(item.system);
                  const showCategoryHeader = item.category !== lastCategory;
                  lastCategory = item.category;

                  const rowStyle = hasDiscrepancy ? { backgroundColor: '#fef2f2' } : {};
                  const borderStyle = hasDiscrepancy ? '2px solid #fecaca' : '1px solid #e5e7eb';

                  return (
                    <React.Fragment key={item.id}>
                      {showCategoryHeader && (
                        <tr>
                          <td colSpan={6} style={{
                            padding: '10px 14px',
                            backgroundColor: '#059669',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            border: 'none'
                          }}>
                            📁 {item.category}
                          </td>
                        </tr>
                      )}
                      <tr style={rowStyle}>
                        <td style={{ padding: '12px', border: borderStyle, fontWeight: hasDiscrepancy ? 'bold' : 'normal', color: hasDiscrepancy ? '#b91c1c' : 'inherit' }}>
                          {hasDiscrepancy && <span style={{ marginRight: '6px' }}>⚠️</span>}
                          {item.name}
                        </td>
                        <td style={{ padding: '12px', border: borderStyle, textAlign: 'center', backgroundColor: '#f3f4f6' }}>
                          {item.system}
                        </td>
                        <td style={{ padding: '12px', border: borderStyle }}>
                          <input
                            type="number"
                            value={item.counted !== null ? item.counted : ''}
                            onChange={(e) => updateItem(item.id, 'counted', e.target.value === '' ? null : Number(e.target.value))}
                            style={{
                              width: '80px',
                              padding: '8px',
                              textAlign: 'center',
                              border: hasDiscrepancy ? '2px solid #f87171' : '1px solid #d1d5db',
                              borderRadius: '6px',
                              backgroundColor: 'white',
                              fontWeight: hasDiscrepancy ? 'bold' : 'normal',
                              color: hasDiscrepancy ? '#ef4444' : 'inherit'
                            }}
                            placeholder="-"
                          />
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                          <input
                            type="number"
                            value={item.regular || ''}
                            onChange={(e) => updateItem(item.id, 'regular', Number(e.target.value))}
                            style={{
                              width: '80px',
                              padding: '8px',
                              textAlign: 'center',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              backgroundColor: 'white'
                            }}
                            placeholder="0"
                          />
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                          <input
                            type="number"
                            value={item.deteriorated || ''}
                            onChange={(e) => updateItem(item.id, 'deteriorated', Number(e.target.value))}
                            style={{
                              width: '80px',
                              padding: '8px',
                              textAlign: 'center',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              backgroundColor: 'white'
                            }}
                            placeholder="0"
                          />
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                          <input
                            type="text"
                            value={item.obs}
                            onChange={(e) => updateItem(item.id, 'obs', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px'
                            }}
                            placeholder="Observaciones..."
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                });
              })()}
              {/* Fila de totales */}
              <tr style={{ backgroundColor: '#059669', color: 'white', fontWeight: '600' }}>
                <td style={{ padding: '12px', border: '1px solid #047857' }}>
                  📊 TOTALES ({totals.totalProducts} productos)
                </td>
                <td style={{ padding: '12px', border: '1px solid #047857', textAlign: 'center' }}>
                  {totals.totalSystem}
                </td>
                <td style={{ padding: '12px', border: '1px solid #047857', textAlign: 'center' }}>
                  {totals.totalCounted}
                </td>
                <td style={{ padding: '12px', border: '1px solid #047857', textAlign: 'center' }}>
                  {totals.totalRegular}
                </td>
                <td style={{ padding: '12px', border: '1px solid #047857', textAlign: 'center' }}>
                  {totals.totalDeteriorated}
                </td>
                <td style={{ padding: '12px', border: '1px solid #047857' }}>
                  {totals.discrepancies > 0 ? `⚠️ ${totals.discrepancies} discrepancias` : '✅ Sin discrepancias'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Vista Móvil (Tarjetas) */}
        <div className="md:hidden flex flex-col gap-4 p-4 bg-gray-50">
          {(() => {
            let lastCategory = '';
            return filteredItems.map((item) => {
              const isUncounted = item.counted === null || item.counted === '';
              const discrepancy = !isUncounted && Number(item.counted) !== Number(item.system);
              const showCategoryHeader = item.category !== lastCategory;
              lastCategory = item.category;

              return (
                <React.Fragment key={item.id}>
                  {showCategoryHeader && (
                    <div style={{
                      padding: '10px 16px',
                      backgroundColor: '#059669',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      📁 {item.category}
                    </div>
                  )}
                  <div key={item.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${discrepancy ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'}`}>
                    <div className={`p-4 border-b flex justify-between items-center ${discrepancy ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                      <span className={`font-bold text-lg ${discrepancy ? 'text-red-800' : 'text-gray-800'}`}>
                        {discrepancy && '⚠️ '} {item.name}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-200 text-gray-600 rounded">
                        Sistema: {item.system}
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-green-700 uppercase">Total Físico</label>
                        <input
                          type="number"
                          value={item.counted !== null ? item.counted : ''}
                          onChange={(e) => updateItem(item.id, 'counted', e.target.value === '' ? null : Number(e.target.value))}
                          className={`w-full p-3 text-center text-lg font-bold border rounded-lg focus:ring-2 outline-none ${discrepancy ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 focus:ring-green-500'
                            }`}
                          placeholder="-"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Regular</label>
                        <input
                          type="number"
                          value={item.regular || ''}
                          onChange={(e) => updateItem(item.id, 'regular', Number(e.target.value))}
                          className="w-full p-3 text-center text-lg font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-red-500 uppercase">Rotos (Baja)</label>
                        <input
                          type="number"
                          value={item.deteriorated || ''}
                          onChange={(e) => updateItem(item.id, 'deteriorated', Number(e.target.value))}
                          className="w-full p-3 text-center text-lg font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <input
                        type="text"
                        value={item.obs}
                        onChange={(e) => updateItem(item.id, 'obs', e.target.value)}
                        placeholder="Observaciones..."
                        className="w-full p-3 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </React.Fragment>
              );
            });
          })()}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No hay items que mostrar.
            </div>
          )}
        </div>

        <div style={{ padding: '1rem', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save size={16} /> Guardar
          </button>
          <button
            onClick={handleSend}
            style={{
              padding: '10px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Send size={16} /> Enviar a Beni
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyReviewForm;
