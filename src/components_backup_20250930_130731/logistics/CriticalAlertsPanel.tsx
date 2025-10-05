import React, { useState, useEffect } from 'react';
import { X, TriangleAlert } from 'lucide-react';
import { inventoryReportsService } from '../../services/inventoryReportsService';

interface CriticalAlert {
  id: string;
  type: 'stock_critical' | 'high_breakage' | 'center_health' | 'supplier_issue';
  severity: 'high' | 'critical';
  title: string;
  message: string;
  description: string;
  value: number;
  threshold?: number;
  center?: string;
  item?: string;
  actionRequired: string;
  timestamp: Date;
  archived: boolean;
}

const CriticalAlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAlerts();
    const interval = setInterval(generateAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const generateAlerts = async () => {
    try {
      const kpis = await inventoryReportsService.getInventoryKPIs();
      const newAlerts: CriticalAlert[] = [];

      // Obtener datos detallados para análisis más específico
      const { supabase } = await import('../../lib/supabase');
      const { data: inventoryData } = await supabase
        .from('inventory_items')
        .select('*')
        .in('center_id', [9, 10, 11]);

      // Agrupar items críticos por categoría y analizar patrones
      if (inventoryData && inventoryData.length > 0) {
        const criticalItems = inventoryData.filter(item => {
          const currentStock = item.cantidad_actual || 0;
          const minStock = item.min_stock || 0;
          // Solo considerar crítico si está por debajo del stock mínimo definido
          return minStock > 0 && currentStock <= minStock;
        });

        // Agrupar por categoría
        const criticalByCategory = criticalItems.reduce((acc, item) => {
          const category = item.categoria || 'Sin categoría';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        }, {} as Record<string, any[]>);

        // Crear alertas específicas por categoría crítica
        Object.entries(criticalByCategory).forEach(([category, items]) => {
          if ((items as any[]).length >= 2) { // Solo alertar si hay 2+ items de la misma categoría realmente críticos
            // Analizar patrones inteligentes según el tipo de producto
            const patternAnalysis = (items as any[]).reduce((acc: any, item: any) => {
              const name = (item.nombre_item || '').toLowerCase();
              let pattern = 'general';
              
              // Para pesas/mancuernas: buscar peso en kg
              if (name.includes('mancuerna') || name.includes('pesa') || name.includes('disco')) {
                const weightMatch = name.match(/(\d+)\s*(kg|k)/);
                if (weightMatch) {
                  pattern = `${weightMatch[1]}kg`;
                }
              }
              // Para gomas/bandas: buscar resistencia o longitud
              else if (name.includes('goma') || name.includes('banda') || name.includes('elástic')) {
                const resistanceMatch = name.match(/(ligera|media|fuerte|extra)/);
                const sizeMatch = name.match(/(\d+)\s*(cm|mm)/);
                if (resistanceMatch) {
                  pattern = `resistencia ${resistanceMatch[1]}`;
                } else if (sizeMatch) {
                  pattern = `${sizeMatch[1]}${sizeMatch[2]}`;
                }
              }
              // Para ropa: usar talla real
              else if (name.includes('camiseta') || name.includes('pantalón') || name.includes('short')) {
                const size = item.size || item.talla;
                if (size && size !== 'Sin talla') {
                  pattern = `talla ${size}`;
                }
              }
              // Para otros productos: usar categoría general
              else {
                const size = item.size || item.talla;
                if (size && size !== 'Sin talla') {
                  pattern = size;
                }
              }
              
              acc[pattern] = (acc[pattern] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const mostCommonPattern = Object.entries(patternAnalysis)
              .sort(([,a], [,b]) => (b as number) - (a as number))[0];

            const hasSpecificPatternIssue = mostCommonPattern && (mostCommonPattern[1] as number) >= 2 && mostCommonPattern[0] !== 'general';

            newAlerts.push({
              id: `critical-category-${category.toLowerCase().replace(/\s+/g, '-')}`,
              type: 'stock_critical',
              severity: (items as any[]).length > 8 ? 'critical' : 'high',
              title: `🚨 Stock Crítico: ${category}`,
              message: hasSpecificPatternIssue 
                ? `${(items as any[]).length} items críticos - Problema específico en ${mostCommonPattern[0]}`
                : `${(items as any[]).length} items de ${category} en stock crítico`,
              description: hasSpecificPatternIssue
                ? `La categoría "${category}" tiene un problema crítico de stock, especialmente en ${mostCommonPattern[0]} (${mostCommonPattern[1]} items afectados). Estos items están por debajo de su stock mínimo definido. Ejemplo: ${(items as any[])[0].nombre_item} tiene ${(items as any[])[0].cantidad_actual || 0} unidades (mínimo: ${(items as any[])[0].min_stock || 0}).`
                : `La categoría "${category}" tiene ${(items as any[]).length} productos por debajo de su stock mínimo definido. Esto indica un problema sistemático en la gestión de esta línea de productos.`,
              value: (items as any[]).length,
              threshold: 3,
              item: hasSpecificPatternIssue ? `${category} - ${mostCommonPattern[0]}` : category,
              actionRequired: hasSpecificPatternIssue
                ? `Pedido urgente de ${category} ${mostCommonPattern[0]} para todos los centros`
                : `Revisar planificación de pedidos para toda la línea de ${category}`,
              timestamp: new Date(),
              archived: false
            });
          }
        });

        // Alerta general solo si hay muchas categorías afectadas
        const affectedCategories = Object.keys(criticalByCategory).length;
        if (affectedCategories > 5) {
          newAlerts.push({
            id: 'critical-stock-general',
            type: 'stock_critical',
            severity: 'critical',
            title: '🚨 Crisis General de Stock',
            message: `${affectedCategories} categorías diferentes con stock crítico`,
            description: `Hay una crisis generalizada de stock afectando ${affectedCategories} categorías diferentes con un total de ${criticalItems.length} items. Esto indica un problema sistémico en la planificación de inventario.`,
            value: affectedCategories,
            threshold: 5,
            actionRequired: 'Revisión urgente del sistema de planificación de inventario y pedidos automáticos',
            timestamp: new Date(),
            archived: false
          });
        }
      }

      // Alerta de tasa de rotura alta
      if (kpis.roturaRate > 8) {
        newAlerts.push({
          id: 'high-breakage',
          type: 'high_breakage',
          severity: kpis.roturaRate > 15 ? 'critical' : 'high',
          title: '⚠️ Tasa de Rotura Elevada',
          message: `${Math.round(kpis.roturaRate)}% de tasa de rotura general`,
          description: `La tasa de rotura actual (${kpis.roturaRate.toFixed(1)}%) supera el umbral recomendado del 8%. Esto indica problemas de calidad en los productos o proveedores.`,
          value: kpis.roturaRate,
          threshold: 8,
          actionRequired: 'Evaluar calidad de proveedores y considerar cambios en productos problemáticos',
          timestamp: new Date(),
          archived: false
        });
      }

      // Alertas por centro con health score bajo
      kpis.centerComparison.forEach(center => {
        if (center.healthScore < 70) {
          newAlerts.push({
            id: `health-${center.centerName.toLowerCase()}`,
            type: 'center_health',
            severity: center.healthScore < 50 ? 'critical' : 'high',
            title: `🏪 ${center.centerName} - Health Score Bajo`,
            message: `Health Score: ${center.healthScore}% (${center.totalRoturas} roturas)`,
            description: `El centro ${center.centerName} tiene un Health Score de ${center.healthScore}%, indicando problemas en la gestión de inventario. Total de roturas: ${center.totalRoturas}.`,
            value: center.healthScore,
            threshold: 70,
            center: center.centerName,
            actionRequired: `Revisar gestión de inventario en ${center.centerName} y capacitar al equipo`,
            timestamp: new Date(),
            archived: false
          });
        }
      });

      // Análisis inteligente de productos problemáticos por categoría y patrón
      const problematicByCategory = kpis.topProblematicItems.reduce((acc, item) => {
        const category = item.categoria || 'Sin categoría';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      // Alertas específicas por categoría problemática
      Object.entries(problematicByCategory).forEach(([category, items]) => {
        const totalRoturas = items.reduce((sum, item) => sum + item.totalRoturas, 0);
        
        if (totalRoturas > 15) { // Solo alertar si la categoría tiene muchas roturas
          // Buscar patrones en los nombres (ej: "Goma 5cm", "Goma 10cm")
          const sizePattern = items.reduce((acc, item) => {
            const name = item.nombre_item.toLowerCase();
            // Buscar patrones de tamaño (números seguidos de cm, mm, etc.)
            const sizeMatch = name.match(/(\d+)\s*(cm|mm|m|kg|gr)/);
            if (sizeMatch) {
              const size = `${sizeMatch[1]}${sizeMatch[2]}`;
              acc[size] = (acc[size] || 0) + item.totalRoturas;
            }
            return acc;
          }, {} as Record<string, number>);

          const mostProblematicSize = Object.entries(sizePattern)
            .sort(([,a], [,b]) => (b as number) - (a as number))[0];

          const hasSpecificSizeIssue = mostProblematicSize && (mostProblematicSize[1] as number) > 8;

          newAlerts.push({
            id: `problematic-category-${category.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'supplier_issue',
            severity: totalRoturas > 30 ? 'critical' : 'high',
            title: hasSpecificSizeIssue 
              ? `🔧 ${category} ${mostProblematicSize[0]} - Problema de Calidad`
              : `🔧 ${category} - Problemas Recurrentes`,
            message: hasSpecificSizeIssue
              ? `${category} de ${mostProblematicSize[0]} se rompen frecuentemente (${mostProblematicSize[1]} roturas)`
              : `${totalRoturas} roturas en productos de ${category}`,
            description: hasSpecificSizeIssue
              ? `Los productos de ${category} de tamaño ${mostProblematicSize[0]} presentan un patrón de roturas recurrentes (${mostProblematicSize[1]} roturas registradas). Esto indica un problema específico de calidad en este tamaño particular, posiblemente relacionado con el proveedor o el proceso de fabricación.`
              : `La categoría "${category}" presenta un patrón preocupante con ${totalRoturas} roturas totales distribuidas en ${items.length} productos diferentes. Esto sugiere un problema sistémico de calidad en esta línea de productos.`,
            value: hasSpecificSizeIssue ? mostProblematicSize[1] : totalRoturas,
            threshold: hasSpecificSizeIssue ? 8 : 15,
            item: hasSpecificSizeIssue ? `${category} ${mostProblematicSize[0]}` : category,
            actionRequired: hasSpecificSizeIssue
              ? `Contactar proveedor específicamente sobre ${category} ${mostProblematicSize[0]} - revisar proceso de fabricación`
              : `Auditoría completa de calidad para toda la línea de ${category}`,
            timestamp: new Date(),
            archived: false
          });
        }
      });

      setAlerts(newAlerts.filter(alert => !alert.archived));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{padding: '20px', textAlign: 'center'}}>Analizando alertas...</div>;

  if (alerts.length === 0) {
    return (
      <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ color: '#166534', fontSize: '24px' }}>✅</div>
        <h3 style={{ color: '#166534', margin: '8px 0' }}>Todo Bajo Control</h3>
      </div>
    );
  }

  const archiveAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#dc2626', marginBottom: '16px' }}>
        <TriangleAlert size={20} style={{ marginRight: '8px' }} />
        Alertas Críticas ({alerts.length})
      </h3>
      {alerts.map(alert => (
        <div key={alert.id} style={{
          background: alert.severity === 'critical' ? '#fee2e2' : '#fef3c7',
          border: `2px solid ${alert.severity === 'critical' ? '#dc2626' : '#f59e0b'}`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => {
          // Crear modal personalizado con información detallada
          const modalContent = document.createElement('div');
          modalContent.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
              <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 600px; max-height: 80vh; overflow-y: auto; margin: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                  <h2 style="color: #dc2626; margin: 0; display: flex; align-items: center; gap: 8px;">
                    🚨 ${alert.title}
                  </h2>
                  <button onclick="this.closest('div').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">×</button>
                </div>
                
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 6px;">
                  <h3 style="margin: 0 0 8px 0; color: #991b1b;">📋 Descripción del Problema</h3>
                  <p style="margin: 0; color: #374151; line-height: 1.5;">${alert.description}</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                  <div style="padding: 1rem; background: #f3f4f6; border-radius: 8px;">
                    <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">📊 Valor Actual</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #dc2626;">${alert.value}</div>
                  </div>
                  <div style="padding: 1rem; background: #f3f4f6; border-radius: 8px;">
                    <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">🎯 Umbral Crítico</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #059669;">${alert.threshold}</div>
                  </div>
                </div>

                ${alert.item ? `
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 6px;">
                  <h3 style="margin: 0 0 8px 0; color: #0c4a6e;">📦 Producto Específico Afectado</h3>
                  <p style="margin: 0; color: #374151; font-weight: 600;">${alert.item}</p>
                </div>
                ` : ''}

                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px;">
                  <h3 style="margin: 0 0 8px 0; color: #92400e;">⚡ Acción Requerida</h3>
                  <p style="margin: 0; color: #374151; line-height: 1.5;">${alert.actionRequired}</p>
                </div>

                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                  <button onclick="this.closest('div').remove()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Cerrar
                  </button>
                  <button onclick="alert('🚀 Funcionalidad de pedido automático próximamente'); this.closest('div').remove();" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🛒 Crear Pedido Urgente
                  </button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(modalContent);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
                {alert.title}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#374151', 
                marginBottom: '8px',
                lineHeight: '1.4'
              }}>
                {alert.message}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                💡 Click para ver detalles y acciones recomendadas
              </div>
              {alert.item && (
                <div style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#059669'
                }}>
                  📦 Producto afectado: {alert.item}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                archiveAlert(alert.id);
              }}
              style={{
                padding: '6px',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Archivar alerta"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CriticalAlertsPanel;
