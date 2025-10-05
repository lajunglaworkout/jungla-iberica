import { supabase } from '../lib/supabase';

// Interfaces basadas en las tablas reales de Supabase
export interface IngresoMarca {
  id: string;
  concepto: string;
  tipo: string; // categoria en la UI
  importe: number;
  iva: boolean; // lleva_iva en la UI
  fecha: string;
  notas?: string;
  mes: number;
  año: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface GastoMarca {
  id: string;
  concepto: string;
  tipo: string; // categoria en la UI
  importe: number;
  iva: boolean; // lleva_iva en la UI
  fecha: string;
  notas?: string;
  mes: number;
  año: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ResumenMensualMarca {
  mes: number;
  año: number;
  total_ingresos: number;
  iva_ingresos: number;
  total_gastos: number;
  iva_gastos: number;
  beneficio_neto: number;
}

export interface BrandFinancialData {
  mes: number;
  año: number;
  ingresos: IngresoMarca[];
  gastos: GastoMarca[];
  resumen?: ResumenMensualMarca;
}

class BrandService {
  // ===== INGRESOS =====
  
  async getIngresosByMonth(mes: number, año: number): Promise<IngresoMarca[]> {
    const { data, error } = await supabase
      .from('ingresos_marca')
      .select('*')
      .eq('mes', mes)
      .eq('año', año)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createIngreso(ingreso: Omit<IngresoMarca, 'id' | 'created_at' | 'updated_at'>): Promise<IngresoMarca> {
    const { data, error } = await supabase
      .from('ingresos_marca')
      .insert([ingreso])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateIngreso(id: string, updates: Partial<IngresoMarca>): Promise<IngresoMarca> {
    const { data, error } = await supabase
      .from('ingresos_marca')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteIngreso(id: string): Promise<void> {
    const { error } = await supabase
      .from('ingresos_marca')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== GASTOS =====

  async getGastosByMonth(mes: number, año: number): Promise<GastoMarca[]> {
    const { data, error } = await supabase
      .from('gastos_marca')
      .select('*')
      .eq('mes', mes)
      .eq('año', año)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createGasto(gasto: Omit<GastoMarca, 'id' | 'created_at' | 'updated_at'>): Promise<GastoMarca> {
    const { data, error } = await supabase
      .from('gastos_marca')
      .insert([gasto])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateGasto(id: string, updates: Partial<GastoMarca>): Promise<GastoMarca> {
    const { data, error } = await supabase
      .from('gastos_marca')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteGasto(id: string): Promise<void> {
    const { error } = await supabase
      .from('gastos_marca')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== RESUMEN MENSUAL =====

  async getResumenMensual(mes: number, año: number): Promise<ResumenMensualMarca | null> {
    const { data, error } = await supabase
      .from('resumen_mensual_marca')
      .select('*')
      .eq('mes', mes)
      .eq('año', año)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data;
  }

  async calculateAndSaveResumen(mes: number, año: number): Promise<ResumenMensualMarca> {
    // Obtener ingresos y gastos del mes
    const [ingresos, gastos] = await Promise.all([
      this.getIngresosByMonth(mes, año),
      this.getGastosByMonth(mes, año)
    ]);

    // Calcular totales
    const totalIngresosSinIva = ingresos.reduce((sum, ing) => sum + ing.importe, 0);
    const ivaIngresos = ingresos
      .filter(ing => ing.iva)
      .reduce((sum, ing) => sum + (ing.importe * 0.21), 0);
    
    const totalGastosSinIva = gastos.reduce((sum, gasto) => sum + gasto.importe, 0);
    const ivaGastos = gastos
      .filter(gasto => gasto.iva)
      .reduce((sum, gasto) => sum + (gasto.importe * 0.21), 0);

    const totalIngresos = totalIngresosSinIva + ivaIngresos;
    const totalGastosConIva = totalGastosSinIva + ivaGastos;
    const beneficioNeto = totalIngresos - totalGastosConIva;

    const resumen: ResumenMensualMarca = {
      mes,
      año,
      total_ingresos: totalIngresos,
      iva_ingresos: ivaIngresos,
      total_gastos: totalGastosConIva,
      iva_gastos: ivaGastos,
      beneficio_neto: beneficioNeto
    };

    // Guardar o actualizar resumen
    const { data, error } = await supabase
      .from('resumen_mensual_marca')
      .upsert([resumen])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== DATOS COMPLETOS =====

  async getBrandFinancialData(mes: number, año: number): Promise<BrandFinancialData> {
    const [ingresos, gastos, resumen] = await Promise.all([
      this.getIngresosByMonth(mes, año),
      this.getGastosByMonth(mes, año),
      this.getResumenMensual(mes, año)
    ]);

    return {
      mes,
      año,
      ingresos,
      gastos,
      resumen: resumen || undefined
    };
  }

  // ===== ESTADÍSTICAS =====

  async getYearlyStats(año: number): Promise<{
    totalIngresos: number;
    totalGastos: number;
    beneficioAnual: number;
    mejorMes: { mes: number; beneficio: number };
    peorMes: { mes: number; beneficio: number };
  }> {
    const { data, error } = await supabase
      .from('resumen_mensual_marca')
      .select('*')
      .eq('año', año)
      .order('mes');

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        totalIngresos: 0,
        totalGastos: 0,
        beneficioAnual: 0,
        mejorMes: { mes: 1, beneficio: 0 },
        peorMes: { mes: 1, beneficio: 0 }
      };
    }

    const totalIngresos = data.reduce((sum, r) => sum + r.total_ingresos, 0);
    const totalGastos = data.reduce((sum, r) => sum + r.total_gastos, 0);
    const beneficioAnual = totalIngresos - totalGastos;

    const mejorMes = data.reduce((max, r) => 
      r.beneficio_neto > max.beneficio_neto ? r : max
    );
    const peorMes = data.reduce((min, r) => 
      r.beneficio_neto < min.beneficio_neto ? r : min
    );

    return {
      totalIngresos,
      totalGastos,
      beneficioAnual,
      mejorMes: { mes: mejorMes.mes, beneficio: mejorMes.beneficio_neto },
      peorMes: { mes: peorMes.mes, beneficio: peorMes.beneficio_neto }
    };
  }

  // ===== CATEGORÍAS =====

  async getCategoriasIngresos(): Promise<string[]> {
    const { data, error } = await supabase
      .from('ingresos_marca')
      .select('tipo')
      .not('tipo', 'is', null);

    if (error) throw error;

    const categorias = [...new Set(data?.map(d => d.tipo) || [])];
    return categorias.length > 0 ? categorias : [
      'Royalties de Centros',
      'Cuotas de Franquicia',
      'Servicios de Marketing',
      'Venta de Participaciones',
      'Consultoría',
      'Formación',
      'Colaboraciones',
      'Otros Ingresos'
    ];
  }

  async getCategoriasGastos(): Promise<string[]> {
    const { data, error } = await supabase
      .from('gastos_marca')
      .select('tipo')
      .not('tipo', 'is', null);

    if (error) throw error;

    const categorias = [...new Set(data?.map(d => d.tipo) || [])];
    return categorias.length > 0 ? categorias : [
      'Marketing y Publicidad',
      'Personal Corporativo',
      'Oficinas y Administración',
      'Tecnología y Software',
      'Asesoría Legal/Fiscal',
      'Desarrollo de Negocio',
      'Formación y Eventos',
      'Colaboraciones',
      'Otros Gastos'
    ];
  }
}

export const brandService = new BrandService();
