
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectIncident() {
    const { data, error } = await supabase
        .from('checklist_incidents')
        .select('*')
        .eq('id', 42)
        .single();

    if (error) console.error(error);
    else console.log('Incident 42:', JSON.stringify(data, null, 2));
}

inspectIncident();
