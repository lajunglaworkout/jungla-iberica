// src/components/centers/accounting/AccountingTypes.ts

export interface TipoCuota {
  nombre: string;
  precio: number;
}

export interface CuotaItem {
  id: string;
  cuota_type_id: string;
  tipo: string;
  cantidad: number;
  importe: number;
  iva: number;
  precio_total?: number;
  lleva_iva?: boolean;
}

export interface GastoExtra {
  id: string;
  concepto: string;
  importe: number;
  categoria: string;
  lleva_iva?: boolean;
}

export interface FinancialData {
  id?: string;
  center_id: string;
  center_name: string;
  mes: number;
  año: number;
  cuotas: CuotaItem[];
  ingresos_con_iva: number;
  ingresos_sin_iva: number;
  nutricion: number;
  fisioterapia: number;
  entrenamiento_personal: number;
  entrenamientos_grupales: number;
  otros: number;
  nutricion_iva: boolean;
  fisioterapia_iva: boolean;
  entrenamiento_personal_iva: boolean;
  entrenamientos_grupales_iva: boolean;
  otros_iva: boolean;
  alquiler: number;
  suministros: number;
  nominas: number;
  seguridad_social: number;
  marketing: number;
  mantenimiento: number;
  royalty: number;
  software_gestion: number;
  gastos_extras: GastoExtra[];
  alquiler_iva: boolean;
  suministros_iva: boolean;
  nominas_iva: boolean;
  seguridad_social_iva: boolean;
  marketing_iva: boolean;
  mantenimiento_iva: boolean;
  royalty_iva: boolean;
  software_gestion_iva: boolean;
}

export const DEFAULT_TPOS_CUOTA: TipoCuota[] = [
  { nombre: 'Cuota Mensual Básica', precio: 39.90 },
  { nombre: 'Cuota Mensual Premium', precio: 59.90 },
  { nombre: 'Media Cuota Básica', precio: 19.95 },
  { nombre: 'Media Cuota Premium', precio: 29.95 },
  { nombre: 'Cuota Anual', precio: 399.00 },
  { nombre: 'Cuota Estudiante', precio: 29.90 },
  { nombre: 'Media Cuota Estudiante', precio: 14.95 },
  { nombre: 'Cuota Familiar', precio: 79.90 },
  { nombre: 'Cuota Corporativa', precio: 49.90 },
  { nombre: 'Cuota Día', precio: 12.90 },
  { nombre: 'Cuota Fin de Semana', precio: 19.90 },
];

export const CATEGORIAS_GASTOS = [
  'Operativo', 'Mantenimiento', 'Marketing', 'Personal',
  'Administrativo', 'Tecnología', 'Software de Gestión', 'Otros',
];

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const INITIAL_FINANCIAL_DATA = (centerId: string, centerName: string): FinancialData => ({
  center_id: centerId,
  center_name: centerName,
  mes: new Date().getMonth() + 1,
  año: new Date().getFullYear(),
  cuotas: [],
  ingresos_con_iva: 0,
  ingresos_sin_iva: 0,
  nutricion: 0,
  fisioterapia: 0,
  entrenamiento_personal: 0,
  entrenamientos_grupales: 0,
  otros: 0,
  nutricion_iva: true,
  fisioterapia_iva: true,
  entrenamiento_personal_iva: true,
  entrenamientos_grupales_iva: true,
  otros_iva: true,
  alquiler: 0,
  suministros: 0,
  nominas: 0,
  seguridad_social: 0,
  marketing: 0,
  mantenimiento: 0,
  royalty: 0,
  software_gestion: 0,
  gastos_extras: [],
  alquiler_iva: true,
  suministros_iva: true,
  nominas_iva: false,
  seguridad_social_iva: false,
  marketing_iva: true,
  mantenimiento_iva: true,
  royalty_iva: false,
  software_gestion_iva: true,
});

export const calcularPrecios = (precio: number, llevaIva = true, esPrecioConIva = false) => {
  if (!llevaIva) return { precioSinIva: precio, iva: 0, precioTotal: precio };
  if (esPrecioConIva) {
    const precioSinIva = precio / 1.21;
    const iva = precio - precioSinIva;
    return {
      precioSinIva: Math.round(precioSinIva * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      precioTotal: precio,
    };
  }
  const iva = precio * 0.21;
  const precioTotal = precio + iva;
  return {
    precioSinIva: Math.round(precio * 100) / 100,
    iva: Math.round(iva * 100) / 100,
    precioTotal: Math.round(precioTotal * 100) / 100,
  };
};
