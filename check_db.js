
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking employees table structure (by inserting dummy and seeing error or fetching one)...');
    const { data: employees, error: empError } = await supabase.from('employees').select('*').limit(1);
    if (empError) console.error('Error fetching employees:', empError);
    else console.log('Employee sample keys:', employees.length > 0 ? Object.keys(employees[0]) : 'No employees found');

    console.log('Checking departments table...');
    const { data: departments, error: depError } = await supabase.from('departments').select('*');
    if (depError) console.error('Error fetching departments:', depError);
    else console.log('Departments:', departments);
}

check();
