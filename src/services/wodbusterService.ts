import { supabase } from '../lib/supabase';

// Center type
export type CenterKey = 'sevilla' | 'jerez' | 'puerto';

// Real Wodbuster API response interface (Spanish fields)
export interface WodbusterAtleta {
    Dni: string | null;
    'Dni(Facturación)': string | null;
    'Nombre para mostrar': string | null;
    Foto: string;
    Nombre: string | null;
    Apellido1: string | null;
    Apellido2: string | null;
    Email: string;
    Teléfono: string | null;
    Cumpleaños: string | null;
    Creado: string;
    Tarifa: string | null;
    Importe: number | null;
    'Precio tarifa fijo': boolean;
    DescuentoTarifa: number | null;
    DescuentoBono: number | null;
    DescuentoTienda: number | null;
    'Pagado hasta:': string;
    ClasesSueltas: number;
    'Grupo de pago': string | null;
    Sexo: string | null;
    EsAdmin: boolean;
    EsCoach: boolean;
    EsGestor: boolean;
    Tipo: string;
    'Código del torno': string | null;
    'Días sin entrenar': number;
    Distintivo: string | null;
    Borrado: boolean;
    FechaCortesia: string | null;
    'Total pagado': number;
    Dirección: string | null;
    'Código postal': string | null;
    Localidad: string | null;
    Provincia: string | null;
    Pais: string | null;
}

export interface WodbusterMetrics {
    centro: CenterKey;
    timestamp: string;
    totalAtletas: number;
    atletasActivos: number;
    atletasConTarifa: number;
    ingresosRecurrentes: number;
    sociosFundadores: number;
    atletasConBono: number;
    diasPromedioSinEntrenar: number;
    nuevosEsteMes: number;
    atletasEnRiesgo: number;
    bajasEsteMes: number;
    churnRate: number;
    ltvPromedio: number;
}

export interface CombinedMetrics {
    sevilla: WodbusterMetrics | null;
    jerez: WodbusterMetrics | null;
    puerto: WodbusterMetrics | null;
    combined: {
        totalAtletas: number;
        atletasActivos: number;
        ingresosRecurrentes: number;
        nuevosEsteMes: number;
        bajasEsteMes: number;
        atletasEnRiesgo: number;
        churnRate: number;
    };
}

export interface ChurnedMember {
    nombre: string;
    email: string;
    fechaBaja: string;
    mesesComSocio: number;
    totalPagado: number;
    diasSinEntrenarAlDarseBaja: number;
    tarifa: string | null;
}

export const wodbusterService = {
    /**
     * Retrieves all members from a specific center
     */
    /**
     * Retrieves all members from a specific center
     */
    getMembersByCenter: async (center: CenterKey): Promise<WodbusterAtleta[] | null> => {
        try {
            console.log(`📡 [${center.toUpperCase()}] Fetching from Supabase snapshots...`);

            // Buscar el último snapshot disponible
            const { data, error } = await supabase
                .from('wodbuster_snapshots')
                .select('data, created_at')
                // .eq('center', center) // TODO: Habilitar filtro cuando el agente detecte centros correctamente
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No se encontraron filas
                    console.log(`ℹ️ [${center}] No hay snapshots previos.`);
                    return null;
                }
                console.error(`[${center}] Snapshot error:`, error);
                throw error;
            }

            // Parsear datos (nuevo formato rico vs lista plana antigua)
            let atletas = data?.data;
            if (atletas && !Array.isArray(atletas) && atletas.atletas) {
                // Formato Nuevo: { prop, atletas: [...] }
                atletas = atletas.atletas;
            }

            console.log(`✅ [${center.toUpperCase()}] Loaded snapshot from ${new Date(data.created_at).toLocaleString()} (${Array.isArray(atletas) ? atletas.length : 0} atletas)`);
            return atletas;
        } catch (err) {
            console.error(`Error fetching Wodbuster [${center}]:`, err);
            return null;
        }
    },

    /**
     * Calculate metrics for a specific center
     */
    getMetricsByCenter: async (center: CenterKey): Promise<WodbusterMetrics | null> => {
        const atletas = await wodbusterService.getMembersByCenter(center);
        if (!atletas || !Array.isArray(atletas)) {
            console.warn(`❌ No atletas data for ${center}`);
            return null;
        }

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        // Active members: paid until >= today and not deleted
        const activos = atletas.filter(a => {
            if (a.Borrado) return false;
            const pagadoHasta = new Date(a['Pagado hasta:']);
            return pagadoHasta >= today;
        });

        // Churned this month: paid until is in the past month
        const bajas = atletas.filter(a => {
            if (a.Borrado) return false;
            const pagadoHasta = new Date(a['Pagado hasta:']);
            return pagadoHasta >= firstDayLastMonth && pagadoHasta < firstDayOfMonth;
        });

        // Members with recurring tariff
        const conTarifa = activos.filter(a => a.Tarifa && a.Importe && a.Importe > 0);
        const fundadores = activos.filter(a => a.Tarifa?.toLowerCase().includes('fundador'));
        const conBono = activos.filter(a => a.Tipo === 'Alumno (bono)');

        // Monthly recurring revenue
        const mrr = conTarifa.reduce((sum, a) => sum + (a.Importe || 0), 0);

        // New this month
        const nuevos = atletas.filter(a => {
            const creado = new Date(a.Creado);
            return creado >= firstDayOfMonth;
        }).length;

        // At risk: 7+ days without training
        const enRiesgo = activos.filter(a => a['Días sin entrenar'] >= 7).length;

        // Average days without training
        const diasPromedio = activos.length > 0
            ? activos.reduce((sum, a) => sum + (a['Días sin entrenar'] || 0), 0) / activos.length
            : 0;

        // Churn rate
        const activosUltimoMes = atletas.filter(a => {
            if (a.Borrado) return false;
            const pagadoHasta = new Date(a['Pagado hasta:']);
            return pagadoHasta >= firstDayLastMonth;
        }).length;
        const churnRate = activosUltimoMes > 0 ? (bajas.length / activosUltimoMes) * 100 : 0;

        // LTV promedio
        const ltv = activos.length > 0
            ? activos.reduce((sum, a) => sum + (a['Total pagado'] || 0), 0) / activos.length
            : 0;

        return {
            centro: center,
            timestamp: new Date().toISOString(),
            totalAtletas: atletas.length,
            atletasActivos: activos.length,
            atletasConTarifa: conTarifa.length,
            ingresosRecurrentes: Math.round(mrr * 100) / 100,
            sociosFundadores: fundadores.length,
            atletasConBono: conBono.length,
            diasPromedioSinEntrenar: Math.round(diasPromedio * 10) / 10,
            nuevosEsteMes: nuevos,
            atletasEnRiesgo: enRiesgo,
            bajasEsteMes: bajas.length,
            churnRate: Math.round(churnRate * 100) / 100,
            ltvPromedio: Math.round(ltv * 100) / 100
        };
    },

    /**
     * Get metrics for ALL centers + combined totals
     */
    getAllCentersMetrics: async (): Promise<CombinedMetrics> => {
        console.log('📊 Fetching metrics for all centers...');

        // Fetch all in parallel
        const [sevilla, jerez, puerto] = await Promise.all([
            wodbusterService.getMetricsByCenter('sevilla'),
            wodbusterService.getMetricsByCenter('jerez'),
            wodbusterService.getMetricsByCenter('puerto')
        ]);

        // Calculate combined totals
        const centers = [sevilla, jerez, puerto].filter(Boolean) as WodbusterMetrics[];

        const combined = {
            totalAtletas: centers.reduce((sum, c) => sum + c.totalAtletas, 0),
            atletasActivos: centers.reduce((sum, c) => sum + c.atletasActivos, 0),
            ingresosRecurrentes: centers.reduce((sum, c) => sum + c.ingresosRecurrentes, 0),
            nuevosEsteMes: centers.reduce((sum, c) => sum + c.nuevosEsteMes, 0),
            bajasEsteMes: centers.reduce((sum, c) => sum + c.bajasEsteMes, 0),
            atletasEnRiesgo: centers.reduce((sum, c) => sum + c.atletasEnRiesgo, 0),
            churnRate: centers.length > 0
                ? centers.reduce((sum, c) => sum + c.churnRate, 0) / centers.length
                : 0
        };

        console.log('📊 Combined Metrics:', combined);

        return { sevilla, jerez, puerto, combined };
    },

    /**
     * Get churned members with analysis
     */
    getChurnedMembers: async (center: CenterKey): Promise<ChurnedMember[]> => {
        const atletas = await wodbusterService.getMembersByCenter(center);
        if (!atletas) return [];

        const today = new Date();
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);

        // Find members who churned in the last 3 months
        const churned = atletas.filter(a => {
            if (a.Borrado) return false;
            const pagadoHasta = new Date(a['Pagado hasta:']);
            return pagadoHasta >= threeMonthsAgo && pagadoHasta < today;
        });

        return churned.map(a => {
            const creado = new Date(a.Creado);
            const pagadoHasta = new Date(a['Pagado hasta:']);
            const mesesComoSocio = Math.round((pagadoHasta.getTime() - creado.getTime()) / (1000 * 60 * 60 * 24 * 30));

            return {
                nombre: `${a.Nombre || ''} ${a.Apellido1 || ''}`.trim() || a['Nombre para mostrar'] || 'Sin nombre',
                email: a.Email,
                fechaBaja: a['Pagado hasta:'],
                mesesComSocio: mesesComoSocio,
                totalPagado: a['Total pagado'] || 0,
                diasSinEntrenarAlDarseBaja: a['Días sin entrenar'],
                tarifa: a.Tarifa
            };
        }).sort((a, b) => new Date(b.fechaBaja).getTime() - new Date(a.fechaBaja).getTime());
    },

    /**
     * Get at-risk members (7+ days without training)
     */
    getAtRiskMembers: async (center: CenterKey): Promise<WodbusterAtleta[]> => {
        const atletas = await wodbusterService.getMembersByCenter(center);
        if (!atletas) return [];

        const today = new Date();
        return atletas.filter(a => {
            if (a.Borrado) return false;
            const pagadoHasta = new Date(a['Pagado hasta:']);
            return pagadoHasta >= today && a['Días sin entrenar'] >= 7;
        }).sort((a, b) => b['Días sin entrenar'] - a['Días sin entrenar']);
    }
};
