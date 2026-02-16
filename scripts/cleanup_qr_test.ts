
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log('Cleaning up test records...');

    // Hardcoded for safety based on user request: employee_id 96, date 2026-02-16
    // We need to verify if employee_id in DB is integer or string (UUID).
    // The user said "employee_id = '96'".

    const { error } = await supabase
        .from('time_records')
        .delete()
        .eq('employee_id', 96)
        .eq('date', '2026-02-16');

    if (error) {
        console.error('Error deleting:', error);
    } else {
        console.log('Successfully deleted test records for employee 96 on 2026-02-16');
    }
}

cleanup();
