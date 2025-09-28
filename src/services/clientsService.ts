import { supabase } from '../lib/supabase';

export interface ClientMetrics {
  id?: string;
  center_id: string;
  center_name: string;
  mes: number;
  año: number;
  objetivo_mensual: number;
  altas_reales: number;
  bajas_reales: number;
  clientes_activos: number;
  leads: number;
  // Datos sincronizados desde contabilidad
  clientes_contabilidad?: number;
  facturacion_total?: number;
  created_at?: string;
  updated_at?: string;
}

class ClientsService {
  // Obtener métricas de clientes por centro y mes
  async getClientMetrics(centerId: string, centerName: string, mes: number, año: number): Promise<ClientMetrics> {
    try {
      console.log('Cargando métricas de clientes para:', { centerId, mes, año });
      
      const { data, error } = await supabase
        .from('client_metrics')
        .select('*')
        .eq('center_id', centerId)
        .eq('mes', mes)
        .eq('año', año)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        console.log('Métricas de clientes cargadas:', data);
        return data;
      }

      // Si no existe, retornar datos por defecto
      console.log('No se encontraron métricas, retornando valores por defecto');
      return {
        center_id: centerId,
        center_name: centerName,
        mes: mes,
        año: año,
        objetivo_mensual: 0,
        altas_reales: 0,
        bajas_reales: 0,
        clientes_activos: 0,
        leads: 0,
        clientes_contabilidad: 0,
        facturacion_total: 0
      };
    } catch (error) {
      console.error('Error loading client metrics:', error);
      // Retornar datos por defecto en caso de error
      return {
        center_id: centerId,
        center_name: centerName,
        mes: mes,
        año: año,
        objetivo_mensual: 0,
        altas_reales: 0,
        bajas_reales: 0,
        clientes_activos: 0,
        leads: 0,
        clientes_contabilidad: 0,
        facturacion_total: 0
      };
    }
  }

  // Guardar métricas de clientes
  async saveClientMetrics(data: ClientMetrics): Promise<boolean> {
    try {
      console.log('Guardando métricas de clientes:', data);
      
      const { data: result, error } = await supabase
        .from('client_metrics')
        .upsert({
          center_id: data.center_id,
          center_name: data.center_name,
          mes: data.mes,
          año: data.año,
          objetivo_mensual: data.objetivo_mensual,
          altas_reales: data.altas_reales,
          bajas_reales: data.bajas_reales,
          clientes_activos: data.clientes_activos,
          leads: data.leads,
          clientes_contabilidad: data.clientes_contabilidad || 0,
          facturacion_total: data.facturacion_total || 0,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'center_id,mes,año'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving client metrics:', error);
        return false;
      }

      console.log('Métricas de clientes guardadas exitosamente:', result);
      return true;
    } catch (error) {
      console.error('Error saving client metrics:', error);
      return false;
    }
  }

  // Sincronizar datos desde el módulo de contabilidad
  async syncFromAccounting(centerId: string, mes: number, año: number, clientesContabilidad: number, facturacionTotal: number): Promise<boolean> {
    try {
      console.log('Sincronizando datos desde contabilidad:', { centerId, mes, año, clientesContabilidad, facturacionTotal });
      
      // Obtener métricas existentes
      const existingMetrics = await this.getClientMetrics(centerId, '', mes, año);
      
      // Actualizar solo los campos de sincronización
      const { error } = await supabase
        .from('client_metrics')
        .upsert({
          ...existingMetrics,
          clientes_contabilidad: clientesContabilidad,
          facturacion_total: facturacionTotal,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'center_id,mes,año'
        });

      if (error) {
        console.error('Error syncing from accounting:', error);
        return false;
      }

      console.log('Sincronización desde contabilidad exitosa');
      return true;
    } catch (error) {
      console.error('Error syncing from accounting:', error);
      return false;
    }
  }
}

export const clientsService = new ClientsService();
