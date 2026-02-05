
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || '';

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

console.log('Using Service Role Key:', serviceRoleKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createBucket() {
    console.log('Attempting to create "maintenance-photos" bucket...');

    const { data, error } = await supabase.storage.createBucket('maintenance-photos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/*']
    });

    if (error) {
        console.error('❌ Error creating bucket:', error);

        // Check if it already exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (buckets) {
            console.log('Existing buckets:', buckets.map(b => b.name));
            const exists = buckets.find(b => b.name === 'maintenance-photos');
            if (exists) {
                console.log('✅ Bucket "maintenance-photos" already exists. Updating public setting...');
                const { error: updateError } = await supabase.storage.updateBucket('maintenance-photos', {
                    public: true
                });
                if (updateError) console.error('Error updating bucket:', updateError);
                else console.log('✅ Bucket updated to Public.');
            }
        }
    } else {
        console.log('✅ Bucket created successfully:', data);
    }
}

createBucket();
