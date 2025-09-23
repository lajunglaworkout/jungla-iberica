// Servicio para reportes de inventario en tiempo real
import { supabase } from '../lib/supabase';

export interface InventoryKPIs {
  totalItems: number;
  totalValue: number;
  criticalItems: number;
  roturaRate: number;
  centerComparison: CenterStats[];
  topProblematicItems: ProblematicItem[];
}

export interface CenterStats {
  centerName: string;
  totalItems: number;
  totalRoturas: number;
  roturaRate: number;
  healthScore: number;
}

export interface ProblematicItem {
  nombre_item: string;
  categoria: string;
  totalRoturas: number;
  centrosAfectados: number;
}

class InventoryReportsService {
  
  async getInventoryKPIs(): Promise<InventoryKPIs> {
    try {
      console.log('🔍 Obteniendo KPIs del inventario desde Supabase...');
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .in('center_id', [9, 10, 11]);

      if (error) {
        console.error('❌ Error Supabase:', error);
        return this.getEmptyKPIs();
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No hay datos en Supabase');
        return this.getEmptyKPIs();
      }

      console.log(`✅ ${data.length} items encontrados en Supabase`);

      const totalItems = data.length;
      const totalValue = data.reduce((sum, item) => 
        sum + ((item.precio_compra || 0) * (item.cantidad_actual || 0)), 0);
      
      const criticalItems = data.filter(item => 
        (item.cantidad_actual || 0) <= 5).length;

      const totalRoturas = data.reduce((sum, item) => sum + (item.roturas || 0), 0);
      const totalInicial = data.reduce((sum, item) => sum + (item.cantidad_inicial || 0), 0);
      const roturaRate = totalInicial > 0 ? (totalRoturas / totalInicial) * 100 : 0;

      const centerComparison = this.getCenterStats(data);
      const topProblematicItems = this.getProblematicItems(data);

      return {
        totalItems,
        totalValue,
        criticalItems,
        roturaRate,
        centerComparison,
        topProblematicItems
      };

    } catch (error) {
      console.error('❌ Error conectando a Supabase:', error);
      return this.getEmptyKPIs();
    }
  }

  private getSimulatedKPIs(): InventoryKPIs {
    // Datos simulados basados en el análisis real de los scripts SQL
    return {
      totalItems: 188,
      totalValue: 45000,
      criticalItems: 23,
      roturaRate: 28.5,
      centerComparison: [
        { centerName: 'Puerto', totalItems: 47, totalRoturas: 8, roturaRate: 12.3, healthScore: 87 },
        { centerName: 'Jerez', totalItems: 72, totalRoturas: 45, roturaRate: 31.2, healthScore: 68 },
        { centerName: 'Sevilla', totalItems: 69, totalRoturas: 52, roturaRate: 35.8, healthScore: 64 }
      ],
      topProblematicItems: [
        { nombre_item: 'Goma 3,15 CM', categoria: 'Gomas', totalRoturas: 23, centrosAfectados: 2 },
        { nombre_item: 'Goma 2,1 CM', categoria: 'Gomas', totalRoturas: 21, centrosAfectados: 3 },
        { nombre_item: 'Cierre Barra', categoria: 'Accesorios', totalRoturas: 18, centrosAfectados: 2 },
        { nombre_item: 'Step', categoria: 'Cardio', totalRoturas: 15, centrosAfectados: 2 },
        { nombre_item: 'Goma 4,5 CM', categoria: 'Gomas', totalRoturas: 12, centrosAfectados: 2 }
      ]
    };
  }

  private getCenterStats(data: any[]): CenterStats[] {
    const centers = { 9: 'Sevilla', 10: 'Jerez', 11: 'Puerto' };
    const stats: CenterStats[] = [];

    Object.entries(centers).forEach(([id, name]) => {
      const centerItems = data.filter(item => item.center_id === parseInt(id));
      const totalRoturas = centerItems.reduce((sum, item) => sum + (item.roturas || 0), 0);
      const totalInicial = centerItems.reduce((sum, item) => sum + (item.cantidad_inicial || 0), 0);
      const roturaRate = totalInicial > 0 ? (totalRoturas / totalInicial) * 100 : 0;
      const healthScore = Math.max(0, 100 - roturaRate);

      stats.push({
        centerName: name,
        totalItems: centerItems.length,
        totalRoturas,
        roturaRate: Math.round(roturaRate * 10) / 10,
        healthScore: Math.round(healthScore)
      });
    });

    return stats;
  }

  private getProblematicItems(data: any[]): ProblematicItem[] {
    const itemMap = new Map();

    data.forEach(item => {
      const key = item.nombre_item;
      if (!itemMap.has(key)) {
        itemMap.set(key, {
          nombre_item: item.nombre_item,
          categoria: item.categoria,
          totalRoturas: 0,
          centrosAfectados: new Set()
        });
      }
      const itemData = itemMap.get(key);
      itemData.totalRoturas += item.roturas || 0;
      if (item.roturas > 0) {
        itemData.centrosAfectados.add(item.center_id);
      }
    });

    return Array.from(itemMap.values())
      .map(item => ({
        ...item,
        centrosAfectados: item.centrosAfectados.size
      }))
      .filter(item => item.totalRoturas > 0)
      .sort((a, b) => b.totalRoturas - a.totalRoturas)
      .slice(0, 10);
  }

  private getEmptyKPIs(): InventoryKPIs {
    return {
      totalItems: 0,
      totalValue: 0,
      criticalItems: 0,
      roturaRate: 0,
      centerComparison: [],
      topProblematicItems: []
    };
  }
}

export const inventoryReportsService = new InventoryReportsService();
