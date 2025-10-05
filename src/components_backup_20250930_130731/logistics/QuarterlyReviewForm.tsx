import React, { useState } from 'react';
import { Save, Send, ArrowLeft } from 'lucide-react';

interface QuarterlyReviewFormProps {
  onBack: () => void;
  reviewData: any;
}

const QuarterlyReviewForm: React.FC<QuarterlyReviewFormProps> = ({ onBack, reviewData }) => {
  // Usar los items reales del inventario si están disponibles, sino usar datos de ejemplo
  const initialItems = reviewData.reviewItems || [
    { id: 1, name: 'Mancuerna 4KG', system: 8, counted: 0, regular: 0, deteriorated: 0, obs: '' },
    { id: 2, name: 'Mancuerna 5KG', system: 6, counted: 0, regular: 0, deteriorated: 0, obs: '' }
  ];
  
  const [items, setItems] = useState(initialItems);

  const updateItem = (id: number, field: string, value: any) => {
    setItems((prev: any) => prev.map((item: any) => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Calcular totales
  const totals = items.reduce((acc: any, item: any) => ({
    totalProducts: acc.totalProducts + 1,
    totalSystem: acc.totalSystem + item.system,
    totalCounted: acc.totalCounted + item.counted,
    totalRegular: acc.totalRegular + item.regular,
    totalDeteriorated: acc.totalDeteriorated + item.deteriorated,
    discrepancies: acc.discrepancies + (item.counted !== item.system ? 1 : 0)
  }), {
    totalProducts: 0,
    totalSystem: 0,
    totalCounted: 0,
    totalRegular: 0,
    totalDeteriorated: 0,
    discrepancies: 0
  });

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
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb' }}>PRODUCTO</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb' }}>SISTEMA</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb' }}>CONTADO</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb' }}>REGULAR</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb' }}>DETERIORADO</th>
              <th style={{ padding: '12px', border: '1px solid #e5e7eb' }}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.id}>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{item.name}</td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', backgroundColor: '#f3f4f6' }}>
                  {item.system}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                  <input
                    type="number"
                    value={item.counted || ''}
                    onChange={(e) => updateItem(item.id, 'counted', Number(e.target.value))}
                    style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                  />
                </td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                  <input
                    type="number"
                    value={item.regular || ''}
                    onChange={(e) => updateItem(item.id, 'regular', Number(e.target.value))}
                    style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                  />
                </td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                  <input
                    type="number"
                    value={item.deteriorated || ''}
                    onChange={(e) => updateItem(item.id, 'deteriorated', Number(e.target.value))}
                    style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                  />
                </td>
                <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                  <input
                    type="text"
                    value={item.obs}
                    onChange={(e) => updateItem(item.id, 'obs', e.target.value)}
                    style={{ width: '150px', padding: '4px' }}
                  />
                </td>
              </tr>
            ))}
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

        <div style={{ padding: '1rem', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button style={{ padding: '10px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px' }}>
            <Save size={16} /> Guardar
          </button>
          <button style={{ padding: '10px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px' }}>
            <Send size={16} /> Enviar a Beni
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyReviewForm;
