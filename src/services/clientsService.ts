import { supabase } from '../lib/supabase';

export interface ClientCancellationMetrics {
  id?: string;
  center_id: string;
  mes: number;
  año: number;
  total_bajas: number;
  // Tiempo de permanencia
  baja_1_mes: number;
  baja_3_meses: number;
  baja_6_meses: number;
  baja_1_año: number;
  baja_mas_1_año: number;
  // Motivos
  motivo_precio: number;
  motivo_servicio: number;
  motivo_ubicacion: number;
  motivo_otro: number;
  created_at?: string;
  updated_at?: string;
}

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
  async saveClientMetrics(metrics: ClientMetrics): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('client_metrics')
        .upsert(metrics);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving client metrics:', error);
      return false;
    }
  }

  // Obtener métricas de cancelación
  async getCancellationMetrics(centerId: string, mes: number, año: number): Promise<ClientCancellationMetrics> {
    try {
      const { data, error } = await supabase
        .from('client_cancellations')
        .select('*')
        .eq('center_id', centerId)
        .eq('mes', mes)
        .eq('año', año)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        return data;
      }

      // Datos por defecto si no existe el registro
      return {
        center_id: centerId,
        mes,
        año,
        total_bajas: 0,
        baja_1_mes: 0,
        baja_3_meses: 0,
        baja_6_meses: 0,
        baja_1_año: 0,
        baja_mas_1_año: 0,
        motivo_precio: 0,
        motivo_servicio: 0,
        motivo_ubicacion: 0,
        motivo_otro: 0
      };
    } catch (error) {
      console.error('Error loading cancellation metrics:', error);
      throw error;
    }
  }

  // Guardar métricas de cancelación
  async saveCancellationMetrics(metrics: ClientCancellationMetrics): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('client_cancellations')
        .upsert({
          ...metrics,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'center_id,mes,año'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving cancellation metrics:', error);
      return false;
    }
  }

  // Sincronizar datos desde el módulo de contabilidad
  async syncFromAccounting(
    centerId: string, 
    mes: number, 
    año: number, 
    clientesNetos: number,
    altas: number,
    bajas: number,
    facturacionTotal: number
  ): Promise<boolean> {
    try {
      console.log('Sincronizando datos desde contabilidad:', { 
        centerId, 
        mes, 
        año, 
        clientesNetos, 
        altas, 
        bajas, 
        facturacionTotal 
      });
      
      // Obtener métricas existentes
      const existingMetrics = await this.getClientMetrics(centerId, '', mes, año);
      
      // Actualizar solo los campos de sincronización
      const { error } = await supabase
        .from('client_metrics')
        .upsert({
          ...existingMetrics,
          clientes_contabilidad: clientesNetos,
          altas_reales: altas,
          bajas_reales: bajas,
          facturacion_total: facturacionTotal,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'center_id,mes,año'
        });

      if (error) {
        console.error('Error syncing from accounting:', error);
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
