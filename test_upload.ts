
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log('Testing upload to maintenance-photos...');

    // Create dummy buffer (fake png header)
    const buffer = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex'); // Fake PNG signature
    const fileName = `test_${Date.now()}.png`;

    const { data, error } = await supabase.storage
        .from('maintenance-photos')
        .upload(`test/${fileName}`, buffer, {
            contentType: 'image/png'
        });

    if (error) {
        console.error('❌ Upload Error:', error);
    } else {
        console.log('✅ Upload Success:', data);

        // Test Get Public URL
        const { data: urlData } = supabase.storage
            .from('maintenance-photos')
            .getPublicUrl(`test/${fileName}`);
        console.log('🔗 Public URL:', urlData.publicUrl);
    }
}

testUpload();
