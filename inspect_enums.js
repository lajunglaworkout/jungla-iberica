
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfnjlmfziczimaohgkct.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbmpsbWZ6aWN6aW1hb2hna2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc0NjgsImV4cCI6MjA2OTcxMzQ2OH0.1hn6Tse7FI58VA90kU2YXiweNesa8Ndrl0w9qKixph0';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectEnums() {
    console.log('🔍 Inspecting Enums...');

    // We can't directly query pg_enum via the JS client easily if we don't have direct SQL access enabled for anon/service_role in this way,
    // but we can try to call a function if it exists, or just try to insert a bad value and catch the error which usually lists valid values.

    const rolesToTest = [
        'employee', 'admin', 'manager', 'superadmin', 'center_manager',
        'Empleado', 'Director', 'Gerente', 'Encargado', 'CEO', 'Admin', 'Superadmin',
        'Franquiciado', 'Manager', 'Jefe'
    ];

    for (const role of rolesToTest) {
        console.log(`Testing role: ${role}...`);
        const { error } = await supabase
            .from('employees')
            .insert([{
                email: `test_enum_${role}@example.com`,
                role: role,
                first_name: 'Test',
                last_name: 'Enum'
            }]);

        if (error) {
            console.log(`❌ Role '${role}' rejected: ${error.message}`);
        } else {
            console.log(`✅ Role '${role}' ACCEPTED!`);
            // Cleanup
            await supabase.from('employees').delete().eq('email', `test_enum_${role}@example.com`);
        }
    }
}

inspectEnums();
