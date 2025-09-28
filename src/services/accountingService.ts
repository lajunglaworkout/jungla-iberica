import { supabase } from '../lib/supabase';

export interface CuotaType {
  id: string;
  center_id: string;
  nombre: string;
  precio: number;
  activo: boolean;
  lleva_iva: boolean; // CRÍTICO para Modelo 303 - distingue subvencionadas vs comerciales
}

export interface MonthlyCuota {
  id?: string;
  cuota_type_id: string;
  cantidad: number;
  importe: number; // precio sin IVA
  iva: number; // IVA calculado
  // Datos del tipo de cuota (join)
  tipo?: string;
  precio_total?: number;
}

export interface GastoExtra {
  id: string;
  concepto: string;
  importe: number;
  categoria: string;
  lleva_iva?: boolean; // Indica si el gasto lleva IVA (por defecto true, pero nóminas y SS no llevan)
}

export interface FinancialData {
  id?: string;
  center_id: string;
  center_name: string;
  mes: number;
  año: number;
  
  // Servicios adicionales
  nutricion: number;
  fisioterapia: number;
  entrenamiento_personal: number;
  entrenamientos_grupales: number;
  otros: number;
  
  // Gastos fijos con IVA
  alquiler: number;
  alquiler_iva: boolean;
  suministros: number;
  suministros_iva: boolean;
  nominas: number;
  nominas_iva: boolean;
  seguridad_social: number;
  seguridad_social_iva: boolean;
  marketing: number;
  marketing_iva: boolean;
  mantenimiento: number;
  mantenimiento_iva: boolean;
  royalty: number;
  royalty_iva: boolean;
  software_gestion: number;
  software_gestion_iva: boolean;
  
  // Datos relacionados
  cuotas: MonthlyCuota[];
  gastos_extras: GastoExtra[];
}

class AccountingService {
  // Obtener tipos de cuotas por centro
  async getCuotaTypes(centerId: string): Promise<CuotaType[]> {
    try {
      const { data, error } = await supabase
        .from('cuota_types')
        .select('*')
        .eq('center_id', centerId)
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading cuota types:', error);
      return [];
    }
  }

  // Crear nuevo tipo de cuota
  async createCuotaType(centerId: string, nombre: string, precio: number, llevaIva: boolean = true): Promise<CuotaType | null> {
    try {
      // Verificar si ya existe
      const { data: allTypes } = await supabase
        .from('cuota_types')
        .select('*')
        .eq('center_id', centerId);
      
      const existing = allTypes?.find(t => 
        t.nombre.toLowerCase() === nombre.trim().toLowerCase()
      );

      if (existing) {
        console.log('Tipo de cuota ya existe, actualizando precio y IVA...', existing);
        const { data, error } = await supabase
          .from('cuota_types')
          .update({ precio: precio, activo: true, lleva_iva: llevaIva })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Error actualizando precio:', error);
          throw error;
        }
        return data;
      }

      // Crear nuevo si no existe
      const { data, error } = await supabase
        .from('cuota_types')
        .insert({
          center_id: centerId,
          nombre: nombre.trim(),
          precio: precio,
          activo: true,
          lleva_iva: llevaIva
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating cuota type:', error);
      return null;
    }
  }

  // Eliminar tipo de cuota
  async deleteCuotaType(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cuota_types')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting cuota type:', error);
      return false;
    }
  }

  // Obtener datos financieros de un centro para un mes/año específico
  async getFinancialData(centerId: string, centerName: string, mes: number, año: number): Promise<FinancialData> {
    try {
      // Buscar datos financieros existentes
      let { data: financialData, error: financialError } = await supabase
        .from('financial_data')
        .select('*')
        .eq('center_id', centerId)
        .eq('mes', mes)
        .eq('año', año)
        .single();

      if (financialError && financialError.code !== 'PGRST116') {
        throw financialError;
      }

      // Si no existen datos, crear registro inicial
      if (!financialData) {
        const newData = {
          center_id: centerId,
          center_name: centerName,
          mes: mes,
          año: año,
          // Valores por defecto para servicios adicionales
          nutricion: 0,
          fisioterapia: 0,
          entrenamiento_personal: 0,
          entrenamientos_grupales: 0,
          otros: 0,
          // Valores por defecto para gastos fijos
          alquiler: 0,
          suministros: 0,
          nominas: 0,
          seguridad_social: 0,
          marketing: 0,
          mantenimiento: 0,
          royalty: 0,
          software_gestion: 0
        };

        const { data: createdData, error: createError } = await supabase
          .from('financial_data')
          .insert(newData)
          .select()
          .single();

        if (createError) throw createError;
        financialData = createdData;
      }

      // Obtener cuotas mensuales con información del tipo
      const { data: cuotas, error: cuotasError } = await supabase
        .from('monthly_cuotas')
        .select(`
          *,
          cuota_types!inner(nombre, precio, lleva_iva)
        `)
        .eq('financial_data_id', financialData.id)
        .order('created_at', { ascending: false }); // Ordenar por fecha de creación
      
      if (cuotasError) {
        console.error('Error cargando cuotas mensuales:', cuotasError);
        throw cuotasError;
      }

      // Obtener gastos extras
      const { data: gastosExtras, error: gastosError } = await supabase
        .from('gastos_extras')
        .select('*')
        .eq('financial_data_id', financialData.id)
        .order('created_at', { ascending: false }); // Ordenar por fecha de creación
      
      if (gastosError) {
        console.error('Error cargando gastos extras:', gastosError);
        throw gastosError;
      }

      // Formatear cuotas para incluir información del tipo
      const formattedCuotas = (cuotas || []).map(cuota => ({
        id: cuota.id,
        cuota_type_id: cuota.cuota_type_id,
        cantidad: Number(cuota.cantidad) || 0,
        importe: Number(cuota.importe) || 0,
        iva: Number(cuota.iva) || 0,
        tipo: cuota.cuota_types?.nombre || 'Desconocido',
        precio_total: Number(cuota.importe) + Number(cuota.iva) || 0,
        lleva_iva: cuota.cuota_types?.lleva_iva ?? true
      }));

      return {
        ...financialData,
        cuotas: formattedCuotas,
        gastos_extras: (gastosExtras || []).map(gasto => ({
          id: gasto.id,
          concepto: gasto.concepto,
          importe: Number(gasto.importe) || 0,
          categoria: gasto.categoria || 'Operativo',
          lleva_iva: gasto.lleva_iva !== undefined ? gasto.lleva_iva : true
        }))
      };
    } catch (error) {
      console.error('Error loading financial data:', error);
      // Retornar datos por defecto en caso de error
      return {
        id: '',
        center_id: centerId,
        center_name: centerName,
        mes: mes,
        año: año,
        // Valores por defecto para servicios adicionales
        nutricion: 0,
        fisioterapia: 0,
        entrenamiento_personal: 0,
        entrenamientos_grupales: 0,
        otros: 0,
        // Valores por defecto para gastos fijos
        alquiler: 0,
        suministros: 0,
        nominas: 0,
        seguridad_social: 0,
        marketing: 0,
        mantenimiento: 0,
        royalty: 0,
        software_gestion: 0,
        // Arrays vacíos
        cuotas: [],
        gastos_extras: []
      };
    }
  }

  // Obtener datos históricos para análisis de tendencias
  async getHistoricalData(centerId: string, añoInicio: number, añoFin: number): Promise<FinancialData[]> {
    try {
      const { data, error } = await supabase
        .from('financial_data')
        .select(`
          *,
          monthly_cuotas(
            *,
            cuota_types!inner(nombre, precio)
          ),
          gastos_extras(*)
        `)
        .eq('center_id', centerId)
        .gte('año', añoInicio)
        .lte('año', añoFin)
        .order('año', { ascending: true })
        .order('mes', { ascending: true });

      if (error) throw error;

      // Formatear datos
      return (data || []).map(record => ({
        ...record,
        cuotas: (record.monthly_cuotas || []).map((cuota: any) => ({
          id: cuota.id,
          cuota_type_id: cuota.cuota_type_id,
          cantidad: cuota.cantidad,
          importe: cuota.importe,
          iva: cuota.iva,
          tipo: cuota.cuota_types.nombre,
          precio_total: cuota.cuota_types.precio
        })),
        gastos_extras: record.gastos_extras || []
      }));
    } catch (error) {
      console.error('Error loading historical data:', error);
      return [];
    }
  }

  // Obtener resumen de años disponibles para un centro
  async getAvailableYears(centerId: string): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('financial_data')
        .select('año')
        .eq('center_id', centerId)
        .order('año', { ascending: false });

      if (error) throw error;

      const years = [...new Set((data || []).map((record: any) => record.año))];
      return years;
    } catch (error) {
      console.error('Error loading available years:', error);
      return [];
    }
  }

  // Guardar datos financieros completos
  async saveFinancialData(data: FinancialData): Promise<boolean> {
    try {
      console.log('Guardando datos financieros:', data);
      
      // Preparar datos básicos limpiando valores undefined/null
      // Todas las columnas existen en la BD según la estructura confirmada
      const financialDataToSave = {
        center_id: data.center_id,
        center_name: data.center_name,
        mes: Number(data.mes),
        año: Number(data.año),
        nutricion: Number(data.nutricion) || 0,
        fisioterapia: Number(data.fisioterapia) || 0,
        entrenamiento_personal: Number(data.entrenamiento_personal) || 0,
        entrenamientos_grupales: Number(data.entrenamientos_grupales) || 0,
        otros: Number(data.otros) || 0,
        alquiler: Number(data.alquiler) || 0,
        suministros: Number(data.suministros) || 0,
        nominas: Number(data.nominas) || 0,
        seguridad_social: Number(data.seguridad_social) || 0,
        marketing: Number(data.marketing) || 0,
        mantenimiento: Number(data.mantenimiento) || 0,
        royalty: Number(data.royalty) || 0,
        software_gestion: Number(data.software_gestion) || 0
      };

      console.log('Datos preparados para guardar:', financialDataToSave);

      // Actualizar datos básicos
      const { data: updatedFinancialData, error: updateError } = await supabase
        .from('financial_data')
        .upsert(financialDataToSave, {
          onConflict: 'center_id,mes,año'
        })
        .select()
        .single();

      if (updateError) {
        console.error('Error actualizando datos financieros:', updateError);
        throw updateError;
      }

      console.log('Datos financieros guardados exitosamente:', updatedFinancialData);
      const financialDataId = updatedFinancialData.id;

      // Eliminar cuotas existentes y recrear
      await supabase
        .from('monthly_cuotas')
        .delete()
        .eq('financial_data_id', financialDataId);

      if (data.cuotas && data.cuotas.length > 0) {
        const cuotasToInsert = data.cuotas
          .filter(cuota => cuota.cuota_type_id && cuota.cantidad > 0)
          .map(cuota => ({
            financial_data_id: financialDataId,
            cuota_type_id: cuota.cuota_type_id,
            cantidad: Number(cuota.cantidad) || 0,
            importe: Number(cuota.importe) || 0,
            iva: Number(cuota.iva) || 0
          }));

        console.log('Cuotas a insertar:', cuotasToInsert);

        if (cuotasToInsert.length > 0) {
          const { error: cuotasError } = await supabase
            .from('monthly_cuotas')
            .insert(cuotasToInsert);

          if (cuotasError) {
            console.error('Error insertando cuotas:', cuotasError);
            throw cuotasError;
          }
        }
      }

      // Eliminar gastos extras existentes y recrear
      await supabase
        .from('gastos_extras')
        .delete()
        .eq('financial_data_id', financialDataId);

      if (data.gastos_extras && data.gastos_extras.length > 0) {
        // Primero, asegurarnos de que tenemos el financial_data_id
        if (!financialDataId) {
          throw new Error('No se pudo obtener el ID de los datos financieros');
        }

        // Preparar los gastos para insertar, asegurando que solo contengan los campos necesarios
        const gastosToInsert = data.gastos_extras
          .filter(gasto => gasto.concepto && gasto.importe > 0)
          .map(gasto => {
            // Crear un objeto con solo los campos necesarios
            const gastoToInsert: any = {
              financial_data_id: financialDataId,
              concepto: gasto.concepto.trim(),
              importe: Number(gasto.importe) || 0,
              categoria: gasto.categoria || 'Operativo'
              // Nota: El campo 'lleva_iva' fue eliminado porque no existe en la tabla
            };

            // No incluir el ID para que sea generado automáticamente por la base de datos
            // Esto evita problemas con IDs temporales o formatos incorrectos
            return gastoToInsert;
          });

        console.log('Gastos extras a insertar:', gastosToInsert);

        if (gastosToInsert.length > 0) {
          try {
            // Insertar los gastos en lotes para evitar problemas con el tamaño de la petición
            const batchSize = 10; // Tamaño del lote
            for (let i = 0; i < gastosToInsert.length; i += batchSize) {
              const batch = gastosToInsert.slice(i, i + batchSize);
              const { error: gastosError } = await supabase
                .from('gastos_extras')
                .insert(batch);

              if (gastosError) {
                console.error('Error insertando lote de gastos extras:', gastosError);
                throw gastosError;
              }
              console.log(`Lote de ${batch.length} gastos extras insertados correctamente`);
            }
            console.log('Todos los gastos extras se insertaron correctamente');
          } catch (error) {
            console.error('Error en la inserción de gastos extras:', error);
            throw error;
          }
        }
      }

      console.log('✅ Datos financieros guardados exitosamente en Supabase');
      return true;
    } catch (error) {
      console.error('❌ Error saving financial data:', error);
      return false;
    }
  }
}

export const accountingService = new AccountingService();
