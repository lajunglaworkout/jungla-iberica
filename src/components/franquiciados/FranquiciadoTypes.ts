// Shared types for FranquiciadoDashboard components

export interface FinancialMetrics {
    ingresos: number;
    gastos: number;
    balance: number;
    ingresosAnterior?: number;
}

export interface ClientMetrics {
    activos: number;
    altasMes: number;
    bajasMes: number;
    retencion: number;
}

export interface IncidenciasMetrics {
    abiertas: number;
    cerradas: number;
    logistica: number;
    mantenimiento: number;
}

export interface EventosMetrics {
    realizados: number;
    pendientes: number;
    participantes: number;
    satisfaccion: number;
}

export interface Mensaje {
    id: number;
    categoria: string;
    asunto: string;
    mensaje: string;
    prioridad: string;
    estado: string;
    respuesta?: string;
    created_at: string;
}

export interface Reunion {
    id: number;
    titulo: string;
    fecha: string;
    tipo: string;
    acta?: string;
    acta_pdf_url?: string;
}

export interface MonthlyFinancial {
    mes: number;
    año: number;
    ingresos: number;
    gastos: number;
    balance: number;
}

export interface MonthlyClients {
    mes: number;
    año: number;
    activos: number;
    altas: number;
    bajas: number;
}

export interface Incident {
    id: number;
    title: string;
    description: string;
    status: 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada';
    priority: 'baja' | 'media' | 'alta' | 'critica';
    incident_type: 'maintenance' | 'logistics' | 'hr' | 'security';
    created_at: string;
    department: string;
    responsible: string;
}
