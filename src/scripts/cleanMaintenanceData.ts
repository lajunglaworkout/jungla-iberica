import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno si se ejecuta localmente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltan las credenciales de Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanMaintenanceData() {
    console.log('🧹 Iniciando limpieza de datos de mantenimiento...');

    try {
        // 1. Eliminar alertas de mantenimiento
        const { error: alertsError } = await supabase
            .from('maintenance_alerts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Borrar todo

        if (alertsError) throw alertsError;
        console.log('✅ Alertas eliminadas');

        // 2. Eliminar items de inspección
        const { error: itemsError } = await supabase
            .from('maintenance_inspection_items')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (itemsError) throw itemsError;
        console.log('✅ Items de inspección eliminados');

        // 3. Eliminar inspecciones
        const { error: inspectionsError } = await supabase
            .from('maintenance_inspections')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (inspectionsError) throw inspectionsError;
        console.log('✅ Inspecciones eliminadas');

        console.log('✨ Limpieza completada con éxito.');

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    }
}

cleanMaintenanceData();
