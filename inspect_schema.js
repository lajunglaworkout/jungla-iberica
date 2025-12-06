
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectInventoryItems() {
    console.log('Inspecting inventory_items table...');

    // Try to select one row to see the columns
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching inventory_items:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Sample row keys:', Object.keys(data[0]));
            console.log('Sample row:', data[0]);
        } else {
            console.log('No data found in inventory_items.');

            // Check specific columns
            const columnsToCheck = ['status', 'estado', 'is_active', 'active'];
            for (const col of columnsToCheck) {
                const { error: colError } = await supabase.from('inventory_items').select(col).limit(1);
                if (!colError) {
                    console.log(`Column '${col}' EXISTS.`);
                } else {
                    console.log(`Column '${col}' likely does NOT exist (or error):`, colError.message);
                }
            }
        }
    }
}

inspectInventoryItems();
