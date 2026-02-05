
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixBadImageData() {
    console.log('Fixing bad image data...');

    // Update where has_images is true but image_urls is null
    const { data, error } = await supabase
        .from('checklist_incidents')
        .update({ has_images: false })
        .is('image_urls', null)
        .eq('has_images', true)
        .select();

    if (error) {
        console.error('Error fixing data:', error);
    } else {
        console.log(`✅ Fixed ${data.length} records where image_urls was null.`);
    }

    // Also check empty array if stored as jsonb []
    // (Supabase sometimes handles this differently in filter, but worth a check)
}

fixBadImageData();
