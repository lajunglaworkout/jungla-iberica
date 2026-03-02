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

export interface MonthlyRevenue {
    total: number;   // importe real cobrado
    count: number;   // número de transacciones
    mes: string;     // primer día del mes YYYY-MM-DD
}

export interface CombinedMetrics {
    sevilla: WodbusterMetrics | null;
    jerez: WodbusterMetrics | null;
    puerto: WodbusterMetrics | null;
    revenue: {
        sevilla: MonthlyRevenue | null;
        jerez:   MonthlyRevenue | null;
        puerto:  MonthlyRevenue | null;
        total:   number;
    };
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
     * Obtiene el último snapshot de un centro concreto.
     * Filtra por centro — requiere que los snapshots estén etiquetados con center tag.
     */
    getMembersByCenter: async (center: CenterKey): Promise<WodbusterAtleta[] | null> => {
        try {
            const { data, error } = await supabase
                .from('wodbuster_snapshots')
                .select('data, created_at')
                .eq('center', center)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Sin snapshots para este centro
                console.error(`Wodbuster snapshot error [${center}]:`, error);
                throw error;
            }

            // Normalizar: admite array plano o { atletas: [...] }
            let atletas = data?.data;
            if (atletas && !Array.isArray(atletas) && atletas.atletas) {
                atletas = atletas.atletas;
            }

            return atletas;
        } catch (err) {
            console.error(`Error fetching Wodbuster [${center}]:`, err);
            return null;
        }
    },

    /**
     * Obtiene los ingresos reales (pagos cobrados) del mes en curso para un centro.
     * Lee de wodbuster_pagos_sync — poblada por el sync diario o el webhook.
     */
    getMonthlyRevenue: async (center: CenterKey): Promise<MonthlyRevenue | null> => {
        try {
            const now     = new Date();
            const mesSync = new Date(now.getFullYear(), now.getMonth(), 1)
                .toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('wodbuster_pagos_sync')
                .select('importe_total, total_pagos, mes_sync')
                .eq('center_id', center)
                .eq('mes_sync', mesSync)
                .single();

            if (error || !data) return null;

            return {
                total: data.importe_total ?? 0,
                count: data.total_pagos   ?? 0,
                mes:   data.mes_sync,
            };
        } catch {
            return null;
        }
    },

    /**
     * Calcula KPIs a partir del snapshot para un centro.
     */
    getMetricsByCenter: async (center: CenterKey): Promise<WodbusterMetrics | null> => {
        const atletas = await wodbusterService.getMembersByCenter(center);
        if (!atletas || !Array.isArray(atletas)) return null;

        const today             = new Date();
        const firstDayOfMonth   = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        const activos = atletas.filter(a => {
            if (a.Borrado) return false;
            const pagadoHasta = new Date(a['Pagado hasta:']);
            return pagadoHasta >= today;
        });

        const bajas = atletas.filter(a => {
            if (a.Borrado) return false;
            const pagadoHasta = new Date(a['Pagado hasta:']);
            return pagadoHasta >= firstDayLastMonth && pagadoHasta < firstDayOfMonth;
        });

        const conTarifa  = activos.filter(a => a.Tarifa && a.Importe && a.Importe > 0);
        const fundadores = activos.filter(a => a.Tarifa?.toLowerCase().includes('fundador'));
        const conBono    = activos.filter(a => a.Tipo === 'Alumno (bono)');
        const mrr        = conTarifa.reduce((sum, a) => sum + (a.Importe || 0), 0);

        const nuevos = atletas.filter(a => {
            const creado = new Date(a.Creado);
            return creado >= firstDayOfMonth;
        }).length;

        const enRiesgo   = activos.filter(a => a['Días sin entrenar'] >= 7).length;
        const diasPromedio = activos.length > 0
            ? activos.reduce((sum, a) => sum + (a['Días sin entrenar'] || 0), 0) / activos.length
            : 0;

        const activosUltimoMes = atletas.filter(a => {
            if (a.Borrado) return false;
            const pagadoHasta = new Date(a['Pagado hasta:']);
            return pagadoHasta >= firstDayLastMonth;
        }).length;
        const churnRate = activosUltimoMes > 0 ? (bajas.length / activosUltimoMes) * 100 : 0;

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
     * Métricas de los 3 centros + totales combinados + revenue real.
     */
    getAllCentersMetrics: async (): Promise<CombinedMetrics> => {
        const [sevilla, jerez, puerto, revSevilla, revJerez, revPuerto] = await Promise.all([
            wodbusterService.getMetricsByCenter('sevilla'),
            wodbusterService.getMetricsByCenter('jerez'),
            wodbusterService.getMetricsByCenter('puerto'),
            wodbusterService.getMonthlyRevenue('sevilla'),
            wodbusterService.getMonthlyRevenue('jerez'),
            wodbusterService.getMonthlyRevenue('puerto'),
        ]);

        // Combined: suma real si hay datos por centro, o referencia única si no
        const centersWithData = [sevilla, jerez, puerto].filter(Boolean) as WodbusterMetrics[];
        const combined = centersWithData.length > 1
            ? {
                totalAtletas:       centersWithData.reduce((s, c) => s + c.totalAtletas, 0),
                atletasActivos:     centersWithData.reduce((s, c) => s + c.atletasActivos, 0),
                ingresosRecurrentes:centersWithData.reduce((s, c) => s + c.ingresosRecurrentes, 0),
                nuevosEsteMes:      centersWithData.reduce((s, c) => s + c.nuevosEsteMes, 0),
                bajasEsteMes:       centersWithData.reduce((s, c) => s + c.bajasEsteMes, 0),
                atletasEnRiesgo:    centersWithData.reduce((s, c) => s + c.atletasEnRiesgo, 0),
                churnRate: centersWithData.length > 0
                    ? centersWithData.reduce((s, c) => s + c.churnRate, 0) / centersWithData.length
                    : 0,
            }
            : centersWithData[0]
            ? {
                totalAtletas:        centersWithData[0].totalAtletas,
                atletasActivos:      centersWithData[0].atletasActivos,
                ingresosRecurrentes: centersWithData[0].ingresosRecurrentes,
                nuevosEsteMes:       centersWithData[0].nuevosEsteMes,
                bajasEsteMes:        centersWithData[0].bajasEsteMes,
                atletasEnRiesgo:     centersWithData[0].atletasEnRiesgo,
                churnRate:           centersWithData[0].churnRate,
            }
            : {
                totalAtletas: 0, atletasActivos: 0, ingresosRecurrentes: 0,
                nuevosEsteMes: 0, bajasEsteMes: 0, atletasEnRiesgo: 0, churnRate: 0,
            };

        const revenueTotal =
            (revSevilla?.total ?? 0) +
            (revJerez?.total   ?? 0) +
            (revPuerto?.total  ?? 0);

        return {
            sevilla,
            jerez,
            puerto,
            revenue: {
                sevilla: revSevilla,
                jerez:   revJerez,
                puerto:  revPuerto,
                total:   Math.round(revenueTotal * 100) / 100,
            },
            combined,
        };
    },

    /**
     * Miembros que causaron baja en los últimos 3 meses.
     */
    getChurnedMembers: async (center: CenterKey): Promise<ChurnedMember[]> => {
        const atletas = await wodbusterService.getMembersByCenter(center);
        if (!atletas) return [];

        const today = new Date();
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);

        const churned = atletas.filter(a => {
            if (a.Borrado) return false;
            const pagadoHasta = new Date(a['Pagado hasta:']);
            return pagadoHasta >= threeMonthsAgo && pagadoHasta < today;
        });

        return churned.map(a => {
            const creado      = new Date(a.Creado);
            const pagadoHasta = new Date(a['Pagado hasta:']);
            const mesesComoSocio = Math.round(
                (pagadoHasta.getTime() - creado.getTime()) / (1000 * 60 * 60 * 24 * 30)
            );
            return {
                nombre: `${a.Nombre || ''} ${a.Apellido1 || ''}`.trim() || a['Nombre para mostrar'] || 'Sin nombre',
                email:  a.Email,
                fechaBaja:  a['Pagado hasta:'],
                mesesComSocio: mesesComoSocio,
                totalPagado: a['Total pagado'] || 0,
                diasSinEntrenarAlDarseBaja: a['Días sin entrenar'],
                tarifa: a.Tarifa
            };
        }).sort((a, b) => new Date(b.fechaBaja).getTime() - new Date(a.fechaBaja).getTime());
    },

    /**
     * Miembros en riesgo (7+ días sin entrenar).
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
