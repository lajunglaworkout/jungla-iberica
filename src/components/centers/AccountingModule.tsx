import React, { useState, useEffect } from 'react';
import { TrendingUp, Calculator, Plus, Settings, Trash2, Download, Calendar, ArrowLeft, TrendingDown, Save, Home, Zap, Users, Shield, Megaphone, Wrench, Building2, Monitor, DollarSign, Lightbulb, UserCheck, ShieldCheck, Speaker, Settings as SettingsIcon, MonitorSpeaker } from 'lucide-react';
import { accountingService, type FinancialData as SupabaseFinancialData, type CuotaType, type MonthlyCuota, type GastoExtra as SupabaseGastoExtra } from '../../services/accountingService';
import { supabase } from '../../lib/supabase';

interface AccountingModuleProps {
  centerName: string;
  centerId: string;
  onBack: () => void;
}

interface TipoCuota {
  nombre: string;
  precio: number; // Precio total que paga el usuario (con IVA incluido)
}

interface MovimientoCuota {
  fecha: string;
  descripcion?: string;
}

interface CuotaItem {
  id: string;
  cuota_type_id: string;
  tipo: string;
  cantidad: number;
  importe: number;
  iva: number;
  precio_total?: number;
  lleva_iva?: boolean;
}

interface GastoExtra {
  id: string;
  concepto: string;
  importe: number;
  categoria: string;
  lleva_iva?: boolean;
}

interface FinancialData {
  id?: string;
  center_id: string;
  center_name: string;
  mes: number;
  año: number;
  cuotas: CuotaItem[];
  // Ingresos
  nutricion: number;
  fisioterapia: number;
  entrenamiento_personal: number;
  entrenamientos_grupales: number;
  otros: number;
  // Gastos fijos
  alquiler: number;
  suministros: number;
  nominas: number;
  seguridad_social: number;
  marketing: number;
  mantenimiento: number;
  royalty: number;
  software_gestion: number;
  // Gastos extras
  gastos_extras: GastoExtra[];
  // Campos de IVA (requeridos para compatibilidad con el servicio)
  alquiler_iva: boolean;
  suministros_iva: boolean;
  nominas_iva: boolean;
  seguridad_social_iva: boolean;
  marketing_iva: boolean;
  mantenimiento_iva: boolean;
  royalty_iva: boolean;
  software_gestion_iva: boolean;
}

// Tipos de cuota por defecto con precios - se pueden personalizar por centro
const DEFAULT_TPOS_CUOTA: TipoCuota[] = [
  { nombre: 'Cuota Mensual Básica', precio: 39.90 },
  { nombre: 'Cuota Mensual Premium', precio: 59.90 },
  { nombre: 'Media Cuota Básica', precio: 19.95 }, // 50% de la básica para medio mes
  { nombre: 'Media Cuota Premium', precio: 29.95 }, // 50% de la premium para medio mes
  { nombre: 'Cuota Anual', precio: 399.00 },
  { nombre: 'Cuota Estudiante', precio: 29.90 },
  { nombre: 'Media Cuota Estudiante', precio: 14.95 }, // 50% de estudiante para medio mes
  { nombre: 'Cuota Familiar', precio: 79.90 },
  { nombre: 'Cuota Corporativa', precio: 49.90 },
  { nombre: 'Cuota Día', precio: 12.90 },
  { nombre: 'Cuota Fin de Semana', precio: 19.90 }
];

const CATEGORIAS_GASTOS = [
  'Operativo',
  'Mantenimiento',
  'Marketing',
  'Personal',
  'Administrativo',
  'Tecnología',
  'Software de Gestión',
  'Otros'
];

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const AccountingModule: React.FC<AccountingModuleProps> = ({ centerName, centerId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'entrada' | 'reportes'>('entrada');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<FinancialData>({
    center_id: centerId,
    center_name: centerName,
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    cuotas: [],
    // Ingresos
    nutricion: 0,
    fisioterapia: 0,
    entrenamiento_personal: 0,
    entrenamientos_grupales: 0,
    otros: 0,
    // Gastos fijos
    alquiler: 0,
    suministros: 0,
    nominas: 0,
    seguridad_social: 0,
    marketing: 0,
    mantenimiento: 0,
    royalty: 0,
    software_gestion: 0,
    // Gastos extras
    gastos_extras: [],
    // Valores por defecto para IVA (opcionales)
    alquiler_iva: true,
    suministros_iva: true,
    nominas_iva: false,
    seguridad_social_iva: false,
    marketing_iva: true,
    mantenimiento_iva: true,
    royalty_iva: false,
    software_gestion_iva: true
  });

  // Estado para tipos de cuotas desde Supabase
  const [tiposCuota, setTiposCuota] = useState<CuotaType[]>([]);
  const [showCuotaConfig, setShowCuotaConfig] = useState(false);
  const [newTipoCuota, setNewTipoCuota] = useState('');
  const [newPrecioCuota, setNewPrecioCuota] = useState<number>(0);
  const [newTipoIva, setNewTipoIva] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Cargar datos desde Supabase
  useEffect(() => {
    loadCuotaTypes();
  }, [centerId]);

  useEffect(() => {
    if (tiposCuota.length > 0) {
      loadFinancialData();
    }
  }, [centerId, data.mes, data.año, tiposCuota.length]);

  const loadCuotaTypes = async () => {
    try {
      console.log('Cargando tipos de cuotas para centro:', centerId);
      const types = await accountingService.getCuotaTypes(centerId);
      console.log('Tipos de cuotas cargados:', types);
      setTiposCuota(types);
    } catch (error) {
      console.error('Error cargando tipos de cuotas:', error);
      // Usar tipos por defecto si hay error
      const defaultTypes = DEFAULT_TPOS_CUOTA.map((tipo: TipoCuota, index: number) => ({
        id: `default-${index}`,
        center_id: centerId,
        nombre: tipo.nombre,
        precio: tipo.precio,
        activo: true,
        lleva_iva: true // Por defecto todas llevan IVA
      }));
      setTiposCuota(defaultTypes);
    }
  };

  const loadFinancialData = async () => {
    setLoading(true);
    const financialData = await accountingService.getFinancialData(centerId, centerName, data.mes, data.año);
    
    // Convertir datos de Supabase al formato local
    const localData: FinancialData = {
      id: financialData.id,
      center_id: centerId,
      center_name: centerName,
      cuotas: financialData.cuotas.map(cuota => ({
        id: cuota.id || Math.random().toString(36).substr(2, 9),
        cuota_type_id: cuota.cuota_type_id,
        cantidad: cuota.cantidad,
        importe: cuota.importe,
        iva: cuota.iva,
        tipo: cuota.tipo || '',
        precio_total: cuota.precio_total,
        lleva_iva: cuota.lleva_iva !== false // Por defecto true si no está definido
      })),
      // Ingresos
      nutricion: financialData.nutricion || 0,
      fisioterapia: financialData.fisioterapia || 0,
      entrenamiento_personal: financialData.entrenamiento_personal || 0,
      entrenamientos_grupales: financialData.entrenamientos_grupales || 0,
      otros: financialData.otros || 0,
      
      // Gastos fijos
      alquiler: financialData.alquiler || 0,
      suministros: financialData.suministros || 0,
      nominas: financialData.nominas || 0,
      seguridad_social: financialData.seguridad_social || 0,
      marketing: financialData.marketing || 0,
      mantenimiento: financialData.mantenimiento || 0,
      royalty: financialData.royalty || 0,
      software_gestion: financialData.software_gestion || 0,
      
      // Gastos extras
      gastos_extras: financialData.gastos_extras?.map(gasto => ({
        ...gasto,
        lleva_iva: gasto.lleva_iva !== false // Por defecto true si no está definido
      })) || [],
      
      // Configuración de IVA (con valores por defecto si no están definidos)
      alquiler_iva: financialData.alquiler_iva !== undefined ? financialData.alquiler_iva : true,
      suministros_iva: financialData.suministros_iva !== undefined ? financialData.suministros_iva : true,
      nominas_iva: financialData.nominas_iva !== undefined ? financialData.nominas_iva : false,
      seguridad_social_iva: financialData.seguridad_social_iva !== undefined ? financialData.seguridad_social_iva : false,
      marketing_iva: financialData.marketing_iva !== undefined ? financialData.marketing_iva : true,
      mantenimiento_iva: financialData.mantenimiento_iva !== undefined ? financialData.mantenimiento_iva : true,
      royalty_iva: financialData.royalty_iva !== undefined ? financialData.royalty_iva : false,
      software_gestion_iva: financialData.software_gestion_iva !== undefined ? financialData.software_gestion_iva : true,
      
      // Fecha
      mes: financialData.mes || new Date().getMonth() + 1,
      año: financialData.año || new Date().getFullYear()
    };
    
    setData(localData);
    setLoading(false);
  };

  // Cálculos automáticos con IVA por tipo de cuota y gasto
  const totalIngresosNetosCuotas = data.cuotas.reduce((sum, cuota) => sum + (cuota.cantidad * cuota.importe), 0);
  const totalIvaCuotas = data.cuotas.reduce((sum, cuota) => sum + (cuota.cantidad * cuota.iva), 0);
  const totalIngresosNetos = totalIngresosNetosCuotas + data.nutricion + data.fisioterapia + data.entrenamiento_personal + data.entrenamientos_grupales + data.otros;
  const totalIngresos = totalIngresosNetos + totalIvaCuotas;

  // Calcular gastos con IVA según corresponda
  const gastosExtrasConIva = data.gastos_extras
    .filter(gasto => gasto.lleva_iva)
    .reduce((sum, gasto) => sum + gasto.importe, 0);
  const gastosExtrasSinIva = data.gastos_extras
    .filter(gasto => !gasto.lleva_iva)
    .reduce((sum, gasto) => sum + gasto.importe, 0);

  // IVA soportado = IVA de gastos que llevan IVA (gastos fijos + gastos extras)
  const gastosFijosConIva = 
    (data.alquiler_iva !== false ? (data.alquiler || 0) : 0) +
    (data.suministros_iva !== false ? (data.suministros || 0) : 0) +
    (data.nominas_iva === true ? (data.nominas || 0) : 0) +
    (data.seguridad_social_iva === true ? (data.seguridad_social || 0) : 0) +
    (data.marketing_iva !== false ? (data.marketing || 0) : 0) +
    (data.mantenimiento_iva !== false ? (data.mantenimiento || 0) : 0) +
    (data.royalty_iva === true ? (data.royalty || 0) : 0) +
    (data.software_gestion_iva !== false ? (data.software_gestion || 0) : 0);
  
  const ivaSoportado = (gastosFijosConIva + (gastosExtrasConIva || 0)) * 0.21;

  // IVA repercutido = IVA de cuotas + IVA de servicios adicionales (asumiendo que llevan IVA)
  const ivaRepercutido = totalIvaCuotas; // Por simplicidad, asumimos que servicios adicionales llevan IVA

  // IVA a pagar = IVA repercutido - IVA soportado
  const ivaAPagar = ivaRepercutido - ivaSoportado;

  const totalGastos = data.alquiler + data.suministros + data.nominas + data.seguridad_social +
    data.marketing + data.mantenimiento + data.royalty + (data.software_gestion || 0) +
    gastosExtrasConIva + gastosExtrasSinIva;
  
  const beneficioNeto = totalIngresos - totalGastos;
  const margen = totalIngresos > 0 ? (beneficioNeto / totalIngresos) * 100 : 0;

  const handleChange = (field: keyof FinancialData, value: string | boolean) => {
    if (field === 'cuotas' || field === 'gastos_extras') return; // Estos se manejan por separado
    
    // Manejar campos booleanos (IVA)
    if (field.endsWith('_iva')) {
      const boolValue = typeof value === 'string' ? value === 'true' : value;
      setData(prev => ({ ...prev, [field]: boolValue }));
      return;
    }
    
    // Campos numéricos
    const numericFields = [
      'nutricion', 'fisioterapia', 'entrenamiento_personal', 'entrenamientos_grupales', 'otros',
      'alquiler', 'suministros', 'nominas', 'seguridad_social', 'marketing', 'mantenimiento',
      'royalty', 'software_gestion', 'mes', 'año'
    ];
    
    if (numericFields.includes(field)) {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0;
      
      // Manejar campos que deben ser enteros
      if (field === 'mes' || field === 'año') {
        setData(prev => ({ ...prev, [field]: Math.round(numValue) }));
      } else {
        // Redondear a 2 decimales para campos monetarios
        setData(prev => ({ ...prev, [field]: Math.round(numValue * 100) / 100 }));
      }
      return;
    }
    
    // Para cualquier otro campo
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Función para calcular precios con o sin IVA
  const calcularPrecios = (precio: number, llevaIva: boolean = true, esPrecioConIva: boolean = false) => {
    if (!llevaIva) {
      // Si no lleva IVA, el precio introducido es el precio final
      return { 
        precioSinIva: precio, 
        iva: 0, 
        precioTotal: precio 
      };
    }

    if (esPrecioConIva) {
      // Si el precio incluye IVA, calculamos el precio sin IVA
      // precio = precioConIva = precioSinIva * 1.21
      // precioSinIva = precio / 1.21
      const precioSinIva = precio / 1.21;
      const iva = precio - precioSinIva;
      
      return {
        precioSinIva: Math.round(precioSinIva * 100) / 100,
        iva: Math.round(iva * 100) / 100,
        precioTotal: precio
      };
    } else {
      // Si el precio NO incluye IVA, calculamos el IVA y el precio total
      const iva = precio * 0.21;  // IVA = Precio base × 21%
      const precioTotal = precio + iva;  // Precio total = Precio base + IVA
      
      return { 
        precioSinIva: Math.round(precio * 100) / 100,  // Redondear a 2 decimales
        iva: Math.round(iva * 100) / 100,  // Redondear a 2 decimales
        precioTotal: Math.round(precioTotal * 100) / 100
      };
    }
  };

  // Funciones para gestionar tipos de cuotas con Supabase
  const addTipoCuota = async () => {
    console.log('Intentando añadir cuota:', { nombre: newTipoCuota.trim(), precio: newPrecioCuota });
    
    if (newTipoCuota.trim() && newPrecioCuota > 0) {
      // Verificar duplicados localmente
      const duplicado = tiposCuota.some(t => t.nombre.toLowerCase() === newTipoCuota.trim().toLowerCase());
      if (duplicado) {
        alert('Ya existe una cuota con ese nombre');
        return;
      }
      
      const newType = await accountingService.createCuotaType(centerId, newTipoCuota.trim(), newPrecioCuota, newTipoIva);
      if (newType) {
        console.log('Cuota creada exitosamente:', newType);
        await loadCuotaTypes(); // Recargar tipos
        setNewTipoCuota('');
        setNewPrecioCuota(0);
        setNewTipoIva(true);
      } else {
        console.error('Error: No se pudo crear la cuota');
      }
    } else {
      console.log('Validación fallida:', { 
        nombreVacio: !newTipoCuota.trim(), 
        precioInvalido: newPrecioCuota <= 0 
      });
    }
  };

  const removeTipoCuota = async (id: string) => {
    const tipo = tiposCuota.find(t => t.id === id);
    const confirmMessage = `¿Estás seguro de que quieres eliminar el tipo de cuota "${tipo?.nombre}" (€${tipo?.precio})?\n\nSi hay cuotas usando este tipo, podrían verse afectadas.\n\nEsta acción no se puede deshacer.`;
    
    if (window.confirm(confirmMessage)) {
      const success = await accountingService.deleteCuotaType(id);
      if (success) {
        await loadCuotaTypes(); // Recargar tipos
      }
    }
  };

  // Función para guardar todos los datos financieros
  const saveFinancialData = async () => {
    setLoading(true);
    
    // Convertir datos locales al formato de Supabase
    const supabaseData: SupabaseFinancialData = {
      center_id: centerId,
      center_name: centerName,
      mes: data.mes,
      año: data.año,
      nutricion: data.nutricion,
      fisioterapia: data.fisioterapia,
      entrenamiento_personal: data.entrenamiento_personal,
      entrenamientos_grupales: data.entrenamientos_grupales,
      otros: data.otros,
      alquiler: data.alquiler,
      alquiler_iva: data.alquiler_iva,
      suministros: data.suministros,
      suministros_iva: data.suministros_iva,
      nominas: data.nominas,
      nominas_iva: data.nominas_iva,
      seguridad_social: data.seguridad_social,
      seguridad_social_iva: data.seguridad_social_iva,
      marketing: data.marketing,
      marketing_iva: data.marketing_iva,
      mantenimiento: data.mantenimiento,
      mantenimiento_iva: data.mantenimiento_iva,
      royalty: data.royalty,
      royalty_iva: data.royalty_iva,
      software_gestion: data.software_gestion,
      software_gestion_iva: data.software_gestion_iva,
      cuotas: data.cuotas.map(cuota => {
        const tipoCuota = tiposCuota.find(t => t.nombre === cuota.tipo);
        return {
          cuota_type_id: tipoCuota?.id || '',
          cantidad: cuota.cantidad,
          importe: cuota.importe,
          iva: cuota.iva
        };
      }),
      gastos_extras: data.gastos_extras
    };

    const success = await accountingService.saveFinancialData(supabaseData);
    if (success) {
      console.log('Datos guardados correctamente en Supabase');
    } else {
      console.error('Error al guardar datos en Supabase');
    }
    
    setLoading(false);
  };

  // Funciones para manejar cuotas
  const addCuota = () => {
    if (tiposCuota.length === 0) {
      alert('Primero debes configurar tipos de cuotas usando el botón "⚙️ Config"');
      return;
    }
    
    const primerTipo = tiposCuota[0];
    // Asumimos que el precio del tipo de cuota es con IVA incluido
    const { precioSinIva, iva, precioTotal } = calcularPrecios(primerTipo.precio, primerTipo.lleva_iva, true);

    const newCuota: CuotaItem = {
      id: Date.now().toString(),
      cuota_type_id: primerTipo.id,
      tipo: primerTipo.nombre,
      cantidad: 0,
      importe: precioSinIva,  // Precio base sin IVA
      iva: iva,               // IVA calculado
      precio_total: precioTotal,  // Precio total con IVA
      lleva_iva: primerTipo.lleva_iva
    };
    setData(prev => ({ ...prev, cuotas: [...prev.cuotas, newCuota] }));
  };

  const updateCuota = (id: string, field: keyof CuotaItem, value: string | number) => {
    setData(prev => ({
      ...prev,
      cuotas: prev.cuotas.map(cuota => {
        if (cuota.id === id) {
          if (field === 'tipo' && typeof value === 'string') {
            // Cuando cambia el tipo de cuota, recalcular precio e IVA automáticamente
            const tipoSeleccionado = tiposCuota.find(t => t.nombre === value);
            if (tipoSeleccionado) {
              // Usar el valor real de lleva_iva del tipo de cuota
              // Asumimos que el precio del tipo de cuota es con IVA incluido
              const { precioSinIva, iva, precioTotal } = calcularPrecios(tipoSeleccionado.precio, tipoSeleccionado.lleva_iva, true);
              return { 
                ...cuota, 
                tipo: value, 
                importe: precioSinIva, 
                iva: iva, 
                precio_total: precioTotal,
                lleva_iva: tipoSeleccionado.lleva_iva 
              };
            }
            return { ...cuota, tipo: value };
          } else if (field === 'cantidad') {
            // Solo actualizar la cantidad, mantener precios calculados
            return { ...cuota, cantidad: typeof value === 'string' ? parseFloat(value) || 0 : value };
          }
          // Para otros campos, mantener comportamiento original
          return { ...cuota, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value };
        }
        return cuota;
      })
    }));
  };

  const removeCuota = async (id: string) => {
    const cuota = data.cuotas.find(c => c.id === id);
    const confirmMessage = `¿Estás seguro de que quieres eliminar la cuota "${cuota?.tipo}" con ${cuota?.cantidad} clientes?\n\nEsta acción no se puede deshacer.`;

    if (window.confirm(confirmMessage)) {
      try {
        // Si la cuota tiene un ID de Supabase (no es un ID temporal), eliminarla de Supabase
        if (cuota && cuota.id && !cuota.id.includes('temp-')) {
          // Buscar el financial_data_id actual
          const financialData = await accountingService.getFinancialData(centerId, centerName, data.mes, data.año);
          if (financialData.id) {
            // Eliminar la cuota específica de Supabase
            await supabase
              .from('monthly_cuotas')
              .delete()
              .eq('financial_data_id', financialData.id)
              .eq('id', cuota.id);
          }
        }

        // Actualizar el estado local
        setData(prev => ({ ...prev, cuotas: prev.cuotas.filter(cuota => cuota.id !== id) }));
      } catch (error) {
        console.error('Error eliminando cuota:', error);
        alert('Error al eliminar la cuota. Inténtalo de nuevo.');
      }
    }
  };

  const updateCuotaCantidad = (cuotaId: string, nuevaCantidad: number) => {
    setData(prev => ({
      ...prev,
      cuotas: prev.cuotas.map(cuota => 
        cuota.id === cuotaId 
          ? { ...cuota, cantidad: nuevaCantidad }
          : cuota
      )
    }));
  };

  const updateCuotaTipo = (cuotaId: string, nuevoTipo: string) => {
    const tipoCuota = tiposCuota.find(t => t.nombre === nuevoTipo);
    if (!tipoCuota) return;
    
    // Asumimos que el precio del tipo de cuota es con IVA incluido
    const { precioSinIva, iva, precioTotal } = calcularPrecios(tipoCuota.precio, tipoCuota.lleva_iva, true);
    
    setData(prev => ({
      ...prev,
      cuotas: prev.cuotas.map(cuota => 
        cuota.id === cuotaId 
          ? { 
              ...cuota, 
              tipo: nuevoTipo, 
              importe: precioSinIva, 
              iva: iva,
              precio_total: precioTotal,
              lleva_iva: tipoCuota.lleva_iva 
            }
          : cuota
      )
    }));
  };

  // Funciones para manejar gastos extras
  const addGastoExtra = () => {
    const newGasto: GastoExtra = {
      id: Date.now().toString(),
      concepto: '',
      importe: 0,
      categoria: CATEGORIAS_GASTOS[0],
      lleva_iva: true // Por defecto, la mayoría de gastos llevan IVA
    };
    setData(prev => ({ ...prev, gastos_extras: [...prev.gastos_extras, newGasto] }));
  };

  const updateGastoExtra = (id: string, field: keyof GastoExtra, value: string | number | boolean) => {
    setData(prev => ({
      ...prev,
      gastos_extras: prev.gastos_extras.map(gasto => 
        gasto.id === id ? { 
          ...gasto, 
          [field]: field === 'lleva_iva' ? value : (typeof value === 'string' ? (field === 'concepto' || field === 'categoria' ? value : parseFloat(value) || 0) : value)
        } : gasto
      )
    }));
  };

  const removeGastoExtra = async (id: string) => {
    const gasto = data.gastos_extras.find(g => g.id === id);
    const confirmMessage = `¿Estás seguro de que quieres eliminar el gasto "${gasto?.concepto}" de €${gasto?.importe}?\n\nEsta acción no se puede deshacer.`;

    if (window.confirm(confirmMessage)) {
      try {
        // Si el gasto tiene un ID de Supabase (no es un ID temporal), eliminarlo de Supabase
        if (gasto && gasto.id && !gasto.id.includes('temp-')) {
          // Buscar el financial_data_id actual
          const financialData = await accountingService.getFinancialData(centerId, centerName, data.mes, data.año);
          if (financialData.id) {
            // Eliminar el gasto específico de Supabase
            await supabase
              .from('gastos_extras')
              .delete()
              .eq('financial_data_id', financialData.id)
              .eq('id', gasto.id);
          }
        }

        // Actualizar el estado local
        setData(prev => ({ ...prev, gastos_extras: prev.gastos_extras.filter(gasto => gasto.id !== id) }));
      } catch (error) {
        console.error('Error eliminando gasto extra:', error);
        alert('Error al eliminar el gasto. Inténtalo de nuevo.');
      }
    }
  };

  // Función para forzar el guardado de gastos extras
  const forceSaveGastosExtras = async () => {
    try {
      setSaving(true);
      
      // Crear un objeto con todos los campos requeridos
      const gastosToSave = {
        // Campos requeridos
        id: data.id,
        center_id: data.center_id,
        center_name: data.center_name,
        mes: data.mes,
        año: data.año,
        
        // Ingresos
        cuotas: [],
        nutricion: data.nutricion || 0,
        fisioterapia: data.fisioterapia || 0,
        entrenamiento_personal: data.entrenamiento_personal || 0,
        entrenamientos_grupales: data.entrenamientos_grupales || 0,
        otros: data.otros || 0,
        
        // Gastos fijos con IVA
        alquiler: data.alquiler || 0,
        suministros: data.suministros || 0,
        nominas: data.nominas || 0,
        seguridad_social: data.seguridad_social || 0,
        marketing: data.marketing || 0,
        mantenimiento: data.mantenimiento || 0,
        royalty: data.royalty || 0,
        software_gestion: data.software_gestion || 0,
        
        // Gastos extras
        gastos_extras: data.gastos_extras || [],
        
        // Configuración de IVA (todos requeridos en la interfaz)
        alquiler_iva: data.alquiler_iva !== undefined ? data.alquiler_iva : true,
        suministros_iva: data.suministros_iva !== undefined ? data.suministros_iva : true,
        nominas_iva: data.nominas_iva !== undefined ? data.nominas_iva : false,
        seguridad_social_iva: data.seguridad_social_iva !== undefined ? data.seguridad_social_iva : false,
        marketing_iva: data.marketing_iva !== undefined ? data.marketing_iva : true,
        mantenimiento_iva: data.mantenimiento_iva !== undefined ? data.mantenimiento_iva : true,
        royalty_iva: data.royalty_iva !== undefined ? data.royalty_iva : false,
        software_gestion_iva: data.software_gestion_iva !== undefined ? data.software_gestion_iva : true
      };
      
      console.log('Datos a guardar:', gastosToSave);
      
      // Llamar al servicio de guardado
      const success = await accountingService.saveFinancialData(gastosToSave as FinancialData);
      
      if (success) {
        alert('Gastos extras guardados correctamente.');
      } else {
        throw new Error('Error al guardar los gastos extras');
      }
    } catch (error) {
      console.error('Error guardando gastos extras:', error);
      alert('Error al guardar los gastos extras. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Cálculo automático de clientes basado en cuotas
  const totalClientes = data.cuotas.reduce((sum, cuota) => {
    // Consideramos que cada cuota representa un cliente
    // Las medias cuotas (0.5) también cuentan como clientes
    return sum + cuota.cantidad;
  }, 0);

  // Función para sincronizar con módulo de clientes
  const syncWithClientsModule = () => {
    const clientsData = {
      totalClientes,
      facturacionTotal: totalIngresos,
      mes: data.mes,
      año: data.año,
      desgloseCuotas: data.cuotas.map(cuota => ({
        tipo: cuota.tipo,
        cantidad: cuota.cantidad,
        importe: cuota.importe
      }))
    };
    
    console.log('Sincronizando datos con clientes:', clientsData);
    
    // Guardar en localStorage para que el módulo de clientes lo pueda leer
    localStorage.setItem(`clients_sync_${centerId}`, JSON.stringify(clientsData));
  };

  const handleSave = async () => {
    try {
      await saveFinancialData();
      
      // Sincronizar automáticamente con módulo de clientes
      syncWithClientsModule();
      
      // También sincronizar directamente con Supabase si está disponible
      try {
        const { clientsService } = await import('../../services/clientsService');
        await clientsService.syncFromAccounting(centerId, data.mes, data.año, totalClientes, totalIngresos);
        console.log('Sincronización automática con Supabase completada');
      } catch (error) {
        console.log('Sincronización con localStorage completada (Supabase no disponible)');
      }
      
      alert(`Datos guardados en Supabase correctamente. ${totalClientes} clientes sincronizados automáticamente con el módulo de clientes.`);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los datos en Supabase');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', overflowX: 'auto' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '1200px' }}>
        <button onClick={onBack} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>💰 Contabilidad - {centerName}</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Gestión financiera mensual</p>
        </div>
        
        {/* Selector de Mes y Año Global */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          <select 
            value={data.mes} 
            onChange={(e) => handleChange('mes', e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
          >
            {MESES.map((mes, index) => (
              <option key={index} value={index + 1}>{mes}</option>
            ))}
          </select>
          <select 
            value={data.año} 
            onChange={(e) => handleChange('año', e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minWidth: '100px' }}
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i;
              return (
                <option key={year} value={year}>{year}</option>
              );
            })}
          </select>
          <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
            📊 Histórico disponible para análisis de tendencias
          </div>
        </div>
      </div>

      <div style={{ padding: '32px', minWidth: '1200px', overflowX: 'auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <button onClick={() => setActiveTab('entrada')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'entrada' ? '#059669' : '#f3f4f6', color: activeTab === 'entrada' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            📝 Entrada de Datos
          </button>
          <button onClick={() => setActiveTab('reportes')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'reportes' ? '#059669' : '#f3f4f6', color: activeTab === 'reportes' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            📊 Reportes
          </button>
        </div>

        {activeTab === 'entrada' && (
          <>
            {/* Información del nuevo sistema incremental */}
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', padding: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '20px' }}>🚀</div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#065f46' }}>
                  Sistema de Registro Incremental
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#047857' }}>
                  Día 5: Añade +200 clientes • Día 15: Añade +150 clientes • Total automático: 350 clientes • Historial completo de movimientos
                </p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', minWidth: '1100px' }}>
            {/* Ingresos */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '2px solid #10b981' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp style={{ width: '20px', height: '20px' }} />
                Ingresos
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Cuotas por Tipo con IVA Individual */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500' }}>💰 Cuotas por Tipo</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setShowCuotaConfig(true)}
                        style={{ padding: '6px 12px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Configurar tipos de cuotas"
                      >
                        ⚙️ Config
                      </button>
                      <button
                        onClick={addCuota}
                        disabled={loading || tiposCuota.length === 0}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: (loading || tiposCuota.length === 0) ? '#9ca3af' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: (loading || tiposCuota.length === 0) ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus style={{ width: '14px', height: '14px' }} />
                        {loading ? 'Cargando...' : 'Añadir Tipo'}
                      </button>
                    </div>
                  </div>

                  {/* Información de sincronización */}
                  <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '6px', padding: '8px', marginBottom: '12px', fontSize: '12px', color: '#0c4a6e' }}>
                    👥 <strong>{totalClientes}</strong> clientes totales • Configura el número de clientes por tipo de cuota
                  </div>

                  {/* Lista de cuotas por tipo */}
                  {data.cuotas.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr 0.8fr 0.8fr auto', gap: '4px', marginBottom: '6px', fontSize: '10px', color: '#6b7280', fontWeight: '500' }}>
                        <div>Tipo de Cuota</div>
                        <div>Clientes</div>
                        <div>Base (€)</div>
                        <div>IVA</div>
                        <div>Total</div>
                        <div>IVA?</div>
                        <div></div>
                      </div>
                    </div>
                  )}

                  {data.cuotas.map((cuota) => (
                    <div key={cuota.id} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr 0.8fr 0.8fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <select
                          value={cuota.tipo}
                          onChange={(e) => updateCuota(cuota.id || '', 'tipo', e.target.value)}
                          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}
                        >
                          {tiposCuota.map((tipo) => <option key={tipo.nombre} value={tipo.nombre}>{tipo.nombre}</option>)}
                        </select>
                        <input
                          type="number"
                          placeholder="Nº clientes"
                          value={cuota.cantidad}
                          onChange={(e) => updateCuota(cuota.id || '', 'cantidad', e.target.value)}
                          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', textAlign: 'center' }}
                          min="0"
                        />
                        <div style={{ padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '6px', fontSize: '12px', textAlign: 'center', color: '#0c4a6e', fontWeight: '500' }}>
                          €{(cuota.importe * cuota.cantidad).toFixed(2)}
                        </div>
                        <div style={{ padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '12px', textAlign: 'center', color: '#1e40af', fontWeight: '500' }}>
                          €{(cuota.iva * cuota.cantidad).toFixed(2)}
                        </div>
                        <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '6px', fontSize: '12px', textAlign: 'center', color: '#2563eb', fontWeight: '500' }}>
                          €{(cuota.precio_total * cuota.cantidad).toFixed(2)}
                        </div>
                        <select
                          value={cuota.lleva_iva !== undefined ? cuota.lleva_iva.toString() : 'true'}
                          onChange={(e) => {
                            const tipoSeleccionado = tiposCuota.find(t => t.nombre === cuota.tipo);
                            if (tipoSeleccionado) {
                              // Si el selector de IVA cambia, usamos el precio base del tipo de cuota
                              // y especificamos si el precio incluye IVA o no
                              const { precioSinIva, iva, precioTotal } = calcularPrecios(
                                tipoSeleccionado.precio, 
                                e.target.value === 'true',
                                true // Asumimos que el precio del tipo de cuota es con IVA incluido
                              );
                              setData(prev => ({
                                ...prev,
                                cuotas: prev.cuotas.map(c =>
                                  c.id === cuota.id
                                    ? { 
                                        ...c, 
                                        importe: precioSinIva, 
                                        iva: iva, 
                                        precio_total: precioTotal,
                                        lleva_iva: e.target.value === 'true' 
                                      }
                                    : c
                                )
                              }));
                            }
                          }}
                          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                        >
                          <option value="true">Con IVA</option>
                          <option value="false">Sin IVA</option>
                        </select>
                        <button
                          onClick={() => removeCuota(cuota.id || '')}
                          style={{ padding: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          title="Eliminar cuota"
                        >
                          <Trash2 style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Mensaje informativo cuando no hay cuotas */}
                  {data.cuotas.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', color: '#92400e', fontSize: '14px' }}>
                      <div style={{ fontWeight: '500', marginBottom: '8px' }}>🚀 ¡Sistema de Cuotas por Tipo!</div>
                      <div style={{ fontSize: '12px' }}>
                        1. Configura tipos de cuotas (⚙️ Config)<br/>
                        2. Usa "Añadir Tipo" para crear cuotas específicas<br/>
                        3. Especifica el número de clientes para cada tipo<br/>
                        4. Sistema calcula automáticamente IVA y totales
                      </div>
                    </div>
                  )}
                </div>

                {/* Servicios Adicionales - Solo los servicios reales */}
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>
                    🏋️ Servicios Adicionales
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#64748b' }}>
                        🥗 Nutrición
                      </label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00 €" 
                        value={data.nutricion || ''} 
                        onChange={(e) => handleChange('nutricion', e.target.value)} 
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white' }} 
                        title="Ingresos por consultas nutricionales - Actualizar cada viernes"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#64748b' }}>
                        🩺 Fisioterapia
                      </label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00 €" 
                        value={data.fisioterapia || ''} 
                        onChange={(e) => handleChange('fisioterapia', e.target.value)} 
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white' }} 
                        title="Ingresos por fisioterapia - Actualizar cada viernes"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#64748b' }}>
                        💪 Entrenamientos Personales
                      </label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00 €" 
                        value={data.entrenamiento_personal || ''} 
                        onChange={(e) => handleChange('entrenamiento_personal', e.target.value)} 
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white' }} 
                        title="Ingresos por entrenamientos personales - Actualizar cada viernes"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#64748b' }}>
                        🏃 Entrenamientos Grupales
                      </label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00 €" 
                        value={data.entrenamientos_grupales || ''} 
                        onChange={(e) => handleChange('entrenamientos_grupales', e.target.value)} 
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white' }} 
                        title="Ingresos por entrenamientos grupales - Actualizar cada viernes"
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#64748b' }}>
                        📋 Otros Ingresos
                      </label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00 €" 
                        value={data.otros || ''} 
                        onChange={(e) => handleChange('otros', e.target.value)} 
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white' }} 
                        title="Otros ingresos no categorizados - Actualizar cada viernes"
                      />
                    </div>
                  </div>
                  
                  {/* Información adicional */}
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                    💡 Incluye todos los ingresos adicionales a las cuotas mensuales
                  </div>
                </div>
              </div>
            </div>

            {/* Gastos */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
              border: '2px solid #ef4444'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown style={{ width: '20px', height: '20px' }} />
                Gastos
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    <Home style={{ width: '16px', height: '16px', marginRight: '6px', color: '#6b7280' }} />
                    Alquiler (€)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input type="number" step="0.01" value={data.alquiler} onChange={(e) => handleChange('alquiler', e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                    <select
                      value={data.alquiler_iva.toString()}
                      onChange={(e) => handleChange('alquiler_iva', e.target.value === 'true')}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="true">Con IVA</option>
                      <option value="false">Sin IVA</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    <Zap style={{ width: '16px', height: '16px', marginRight: '6px', color: '#6b7280' }} />
                    Suministros (€)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input type="number" step="0.01" value={data.suministros} onChange={(e) => handleChange('suministros', e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                    <select
                      value={data.suministros_iva !== undefined ? data.suministros_iva.toString() : 'true'}
                      onChange={(e) => handleChange('suministros_iva', e.target.value)}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="true">Con IVA</option>
                      <option value="false">Sin IVA</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    <Users style={{ width: '16px', height: '16px', marginRight: '6px', color: '#6b7280' }} />
                    Nóminas (€)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input type="number" step="0.01" value={data.nominas} onChange={(e) => handleChange('nominas', e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                    <select
                      value={data.nominas_iva.toString()}
                      onChange={(e) => handleChange('nominas_iva', e.target.value === 'true')}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="true">Con IVA</option>
                      <option value="false">Sin IVA</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    <Shield style={{ width: '16px', height: '16px', marginRight: '6px', color: '#6b7280' }} />
                    Seguridad Social (€)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input type="number" step="0.01" value={data.seguridad_social} onChange={(e) => handleChange('seguridad_social', e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                    <select
                      value={data.seguridad_social_iva !== undefined ? data.seguridad_social_iva.toString() : 'false'}
                      onChange={(e) => handleChange('seguridad_social_iva', e.target.value)}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="true">Con IVA</option>
                      <option value="false">Sin IVA</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    <Megaphone style={{ width: '16px', height: '16px', marginRight: '6px', color: '#6b7280' }} />
                    Marketing (€)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input type="number" step="0.01" value={data.marketing} onChange={(e) => handleChange('marketing', e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                    <select
                      value={data.marketing_iva.toString()}
                      onChange={(e) => handleChange('marketing_iva', e.target.value === 'true')}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="true">Con IVA</option>
                      <option value="false">Sin IVA</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    <Wrench style={{ width: '16px', height: '16px', marginRight: '6px', color: '#6b7280' }} />
                    Mantenimiento (€)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input type="number" step="0.01" value={data.mantenimiento} onChange={(e) => handleChange('mantenimiento', e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                    <select
                      value={data.mantenimiento_iva.toString()}
                      onChange={(e) => handleChange('mantenimiento_iva', e.target.value === 'true')}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="true">Con IVA</option>
                      <option value="false">Sin IVA</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    <Building2 style={{ width: '16px', height: '16px', marginRight: '6px', color: '#6b7280' }} />
                    Royalty a la Marca (€)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input type="number" step="0.01" value={data.royalty || 0} onChange={(e) => handleChange('royalty', e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} placeholder="Ej: 5% de facturación" title="Royalty mensual pagado a la marca matriz" />
                    <select
                      value={data.royalty_iva.toString()}
                      onChange={(e) => handleChange('royalty_iva', e.target.value === 'true')}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="true">Con IVA</option>
                      <option value="false">Sin IVA</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    <Monitor style={{ width: '16px', height: '16px', marginRight: '6px', color: '#6b7280' }} />
                    Software de Gestión (€)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input type="number" step="0.01" value={data.software_gestion || 0} onChange={(e) => handleChange('software_gestion', e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} placeholder="Ej: Licencias, suscripciones" title="Gastos de software de gestión empresarial" />
                    <select
                      value={data.software_gestion_iva.toString()}
                      onChange={(e) => handleChange('software_gestion_iva', e.target.value === 'true')}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="true">Con IVA</option>
                      <option value="false">Sin IVA</option>
                    </select>
                  </div>
                </div>
                {/* Gastos Extras Dinámicos */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500' }}>💸 Gastos Extras</label>
                    <button onClick={addGastoExtra} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Plus style={{ width: '14px', height: '14px' }} />
                      Añadir
                    </button>
                  </div>
                  
                  {/* Lista de gastos extras */}
                  <div style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px', 
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    minHeight: '80px',
                    maxHeight: data.gastos_extras.length > 3 ? '300px' : 'auto',
                    overflowY: data.gastos_extras.length > 3 ? 'auto' : 'visible',
                    position: 'relative'
                  }}>
                    {data.gastos_extras.length > 0 && (
                      <button 
                        onClick={forceSaveGastosExtras}
                        disabled={saving}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '4px 8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          zIndex: 10
                        }}
                        title="Guardar gastos extras"
                      >
                        <Save style={{ width: '12px', height: '12px' }} />
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    )}
                    {data.gastos_extras.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', padding: '20px' }}>
                        No hay gastos extras. Usa "Añadir" para crear el primero.
                      </div>
                    )}
                    {data.gastos_extras.map((gasto) => (
                      <div key={gasto.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr auto', gap: '6px', marginBottom: '8px', alignItems: 'end' }}>
                        <input 
                          type="text" 
                          placeholder="Concepto del gasto" 
                          value={gasto.concepto} 
                          onChange={(e) => updateGastoExtra(gasto.id, 'concepto', e.target.value)} 
                          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px' }} 
                        />
                        <select 
                          value={gasto.categoria} 
                          onChange={(e) => updateGastoExtra(gasto.id, 'categoria', e.target.value)} 
                          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px' }}
                        >
                          {CATEGORIAS_GASTOS.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <input 
                          type="number" 
                          placeholder="€" 
                          value={gasto.importe} 
                          onChange={(e) => updateGastoExtra(gasto.id, 'importe', e.target.value)} 
                          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px' }} 
                        />
                        <select
                          value={gasto.lleva_iva !== undefined ? gasto.lleva_iva.toString() : 'true'}
                          onChange={(e) => updateGastoExtra(gasto.id, 'lleva_iva', e.target.value === 'true')}
                          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px' }}
                        >
                          <option value="true">Con IVA</option>
                          <option value="false">Sin IVA</option>
                        </select>
                        <button 
                          onClick={() => removeGastoExtra(gasto.id)} 
                          style={{ padding: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <Trash2 style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator style={{ width: '20px', height: '20px' }} />
                Resumen Financiero
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <p style={{ fontSize: '14px', color: '#166534', margin: '0 0 4px 0' }}>Ingresos Netos (sin IVA)</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', margin: 0 }}>€{totalIngresosNetos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
                  <p style={{ fontSize: '14px', color: '#0c4a6e', margin: '0 0 4px 0' }}>IVA a Pagar (Modelo 303)</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: ivaAPagar >= 0 ? '#0284c7' : '#059669', margin: 0 }}>
                    €{ivaAPagar.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                    IVA repercutido: €{ivaRepercutido.toFixed(2)} | IVA soportado: €{ivaSoportado.toFixed(2)}
                  </p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 4px 0' }}>Total Ingresos (con IVA)</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#64748b', margin: 0 }}>€{totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <p style={{ fontSize: '14px', color: '#991b1b', margin: '0 0 4px 0' }}>Total Gastos</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>€{totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: beneficioNeto >= 0 ? '#eff6ff' : '#fef2f2', borderRadius: '8px', border: `1px solid ${beneficioNeto >= 0 ? '#bfdbfe' : '#fecaca'}` }}>
                  <p style={{ fontSize: '14px', color: beneficioNeto >= 0 ? '#1e40af' : '#991b1b', margin: '0 0 4px 0' }}>Beneficio Neto</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: beneficioNeto >= 0 ? '#2563eb' : '#dc2626', margin: 0 }}>€{beneficioNeto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 4px 0' }}>Margen Beneficio</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#64748b', margin: 0 }}>{margen.toFixed(1)}%</p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
                  <p style={{ fontSize: '14px', color: '#0c4a6e', margin: '0 0 4px 0' }}>Total Clientes</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0284c7', margin: 0 }}>{totalClientes}</p>
                </div>
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button onClick={handleSave} style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Save style={{ width: '16px', height: '16px' }} />
                  Guardar & Sincronizar
                </button>
                <button 
                  onClick={() => {
                    syncWithClientsModule();
                    alert(`${totalClientes} clientes sincronizados con el módulo de clientes para ${MESES[data.mes - 1]} ${data.año}`);
                  }} 
                  style={{ padding: '12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Sincronizar solo los datos de clientes sin guardar"
                >
                  👥 Sync
                </button>
              </div>
            </div>
          </div>
          </>
        )}

        {activeTab === 'reportes' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp style={{ width: '24px', height: '24px' }} />
              Análisis Financiero Avanzado
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>
              Dashboard con análisis predictivo, previsiones fiscales y recomendaciones empresariales
            </p>

            {/* Selector de período para análisis */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', alignItems: 'center' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Período de análisis:</label>
              <select
                value={selectedYear || new Date().getFullYear()}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Panel de Análisis de Clientes */}
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users style={{ width: '20px', height: '20px' }} />
                  Evolución de Clientes
                </h3>

                {/* Gráfico de evolución de clientes (simulado con datos) */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Ene {selectedYear}</span>
                    <span style={{ fontSize: '12px', fontWeight: '500' }}>438 clientes</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', backgroundColor: '#0ea5e9', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Feb {selectedYear}</span>
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>445 clientes (+1.6%)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '87%', height: '100%', backgroundColor: '#0ea5e9', borderRadius: '4px' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Mar {selectedYear}</span>
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>450 clientes (+1.1%)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '88%', height: '100%', backgroundColor: '#0ea5e9', borderRadius: '4px' }}></div>
                </div>

                {/* Insights de clientes */}
                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1e40af' }}>📊 Insights de Clientes</h4>
                  <ul style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                    <li>✅ Crecimiento estable: +2.8% en el trimestre</li>
                    <li>🎯 Meta del trimestre: 450 clientes alcanzada</li>
                    <li>📈 Tendencia positiva: 3 meses consecutivos de crecimiento</li>
                    <li>💡 Recomendación: Mantener estrategias actuales</li>
                  </ul>
                </div>
              </div>

              {/* Panel de Previsiones Fiscales */}
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator style={{ width: '20px', height: '20px' }} />
                  Previsiones Fiscales Trimestrales
                </h3>

                {/* IVA Trimestral (Modelo 303) */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>IVA Trimestral (Modelo 303)</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: ivaAPagar >= 0 ? '#dc2626' : '#059669' }}>€{ivaAPagar.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    📅 Próximo vencimiento: 20 de abril {selectedYear + 1}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
                      <div style={{ fontWeight: '500', color: '#0ea5e9' }}>IVA Repercutido</div>
                      <div>€{ivaRepercutido.toFixed(2)}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                      <div style={{ fontWeight: '500', color: '#dc2626' }}>IVA Soportado</div>
                      <div>€{ivaSoportado.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Retenciones IRPF (Modelos 111 y 115) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Retenciones IRPF (111 + 115)</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc2626' }}>€2.180,00</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    📅 Próximo vencimiento: 20 de abril {selectedYear + 1}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
                      <div style={{ fontWeight: '500', color: '#92400e' }}>Modelo 111</div>
                      <div>Empleados: €1.950</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
                      <div style={{ fontWeight: '500', color: '#92400e' }}>Modelo 115</div>
                      <div>Alquiler: €230</div>
                    </div>
                  </div>
                </div>

                {/* Resumen fiscal */}
                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#991b1b' }}>💰 Impacto Fiscal Trimestral</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                    <div>
                      <div style={{ color: '#64748b' }}>Total impuestos</div>
                      <div style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '16px' }}>€6.430</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b' }}>Días hasta vencimiento</div>
                      <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '16px' }}>15 días</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de Flujo de Caja */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign style={{ width: '20px', height: '20px' }} />
                  Análisis de Flujo de Caja
                </h3>

                {/* Flujo mensual */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#166534' }}>INGRESOS</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#15803d' }}>€26.858</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#991b1b' }}>GASTOS</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#dc2626' }}>€18.420</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#1e40af' }}>FLUJO NETO</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb' }}>€8.438</div>
                    </div>
                  </div>
                </div>

                {/* Previsión de caja para próximos meses */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#166534' }}>📈 Previsión Próximos 3 Meses</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '11px' }}>
                    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '500', color: '#64748b' }}>Abril</div>
                      <div style={{ color: '#15803d' }}>€8.950</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '500', color: '#64748b' }}>Mayo</div>
                      <div style={{ color: '#15803d' }}>€9.200</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '500', color: '#64748b' }}>Junio</div>
                      <div style={{ color: '#15803d' }}>€9.450</div>
                    </div>
                  </div>
                </div>

                {/* Recomendaciones de caja */}
                <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#166534' }}>💡 Recomendaciones de Caja</h4>
                  <ul style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                    <li>✅ Flujo positivo: +€8.438 este mes</li>
                    <li>📈 Tendencia alcista: +8.9% vs mes anterior</li>
                    <li>🎯 Previsión positiva: Crecimiento sostenido</li>
                    <li>💰 Reserva recomendada: €25.000-€30.000</li>
                  </ul>
                </div>
              </div>

              {/* Panel de Recomendaciones y Decisiones */}
              <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb style={{ width: '20px', height: '20px' }} />
                  Recomendaciones Estratégicas
                </h3>

                {/* KPIs principales */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>MARGEN</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>31.4%</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>ROI</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>145%</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>CRECIMIENTO</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>+12.5%</div>
                  </div>
                </div>

                {/* Alertas y recomendaciones */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#7c3aed' }}>🚨 Alertas Importantes</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ padding: '8px 12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
                      ⚠️ IVA trimestral vence en 15 días
                    </div>
                    <div style={{ padding: '8px 12px', backgroundColor: '#dcfce7', border: '1px solid #16a34a', borderRadius: '6px', fontSize: '12px', color: '#166534' }}>
                      ✅ Todos los indicadores en verde
                    </div>
                  </div>
                </div>

                {/* Decisiones recomendadas */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#7c3aed' }}>🎯 Decisiones Recomendadas</h4>
                  <ul style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Invertir en marketing:</strong> ROI del 145% justifica incremento del 15% en presupuesto</li>
                    <li><strong>Optimizar gastos:</strong> Reducir suministros un 8% sin impactar operaciones</li>
                    <li><strong>Preparar provisiones:</strong> Reservar €6.430 para impuestos del próximo trimestre</li>
                    <li><strong>Evaluar expansión:</strong> Indicadores positivos sugieren apertura de nuevo centro</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button style={{ padding: '12px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download style={{ width: '16px', height: '16px' }} />
                Exportar Reporte PDF
              </button>
              <button style={{ padding: '12px 24px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar style={{ width: '16px', height: '16px' }} />
                Ver Calendario Fiscal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Configuración de Tipos de Cuotas */}
      {showCuotaConfig && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', margin: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>⚙️ Configurar Tipos de Cuotas</h3>
              <button 
                onClick={() => setShowCuotaConfig(false)}
                style={{ padding: '4px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Añadir nuevo tipo de cuota:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '6px', marginBottom: '6px' }}>
                <input 
                  type="text"
                  value={newTipoCuota}
                  onChange={(e) => setNewTipoCuota(e.target.value)}
                  placeholder="Ej: Cuota Senior, Cuota VIP..."
                  style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                />
                <input 
                  type="number"
                  value={newPrecioCuota || ''}
                  onChange={(e) => setNewPrecioCuota(parseFloat(e.target.value) || 0)}
                  placeholder="Precio €"
                  style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                />
                <select
                  value={newTipoIva.toString()}
                  onChange={(e) => setNewTipoIva(e.target.value === 'true')}
                  style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                >
                  <option value="true">CON IVA</option>
                  <option value="false">SIN IVA</option>
                </select>
                <button 
                  onClick={addTipoCuota}
                  disabled={!newTipoCuota.trim() || newPrecioCuota <= 0}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: (!newTipoCuota.trim() || newPrecioCuota <= 0) ? '#9ca3af' : '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: (!newTipoCuota.trim() || newPrecioCuota <= 0) ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Añadir
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', backgroundColor: '#f0f9ff', padding: '8px', borderRadius: '4px', border: '1px solid #0ea5e9' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>💡 Configuración de IVA</p>
                <p style={{ margin: 0 }}>• <strong>CON IVA:</strong> Cuotas comerciales (declara IVA a Hacienda) • <strong>SIN IVA:</strong> Cuotas subvencionadas/gratuitas</p>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
                Tipos de cuotas actuales:
              </label>
              <div style={{ display: 'grid', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {tiposCuota.map((tipo) => (
                  <div key={tipo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                    <span style={{ fontSize: '12px' }}>
                      {tipo.nombre} - €{tipo.precio} 
                      <span style={{ 
                        marginLeft: '8px', 
                        padding: '2px 6px', 
                        backgroundColor: tipo.lleva_iva ? '#dcfce7' : '#fef3c7', 
                        color: tipo.lleva_iva ? '#166534' : '#92400e',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}>
                        {tipo.lleva_iva ? 'CON IVA' : 'SIN IVA'}
                      </span>
                    </span>
                    <button 
                      onClick={() => removeTipoCuota(tipo.id)}
                      style={{ padding: '3px 6px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '10px' }}
                      title="Eliminar tipo de cuota"
                    >
                      <Trash2 style={{ width: '10px', height: '10px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button 
                onClick={() => setShowCuotaConfig(false)}
                style={{ padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingModule;
