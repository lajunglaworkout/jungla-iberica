
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectAllIncidentsWithImages() {
    const { data, error } = await supabase
        .from('checklist_incidents')
        .select('id, title, has_images, image_urls')
        .eq('has_images', true);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${data.length} incidents with images:`);
        data.forEach(inc => {
            console.log(`ID: ${inc.id}, Title: ${inc.title}`);
            console.log(`   Has Images: ${inc.has_images}`);
            console.log(`   Image URLs: ${JSON.stringify(inc.image_urls)}`);
            // Validate URLs
            if (Array.isArray(inc.image_urls)) {
                inc.image_urls.forEach(url => {
                    if (typeof url !== 'string' || !url.startsWith('http')) {
                        console.log(`   ⚠️ INVALID URL: ${url}`);
                    }
                });
            } else {
                console.log(`   ⚠️ image_urls is NOT an array! Type: ${typeof inc.image_urls}`);
            }
            console.log('---');
        });
    }
}

inspectAllIncidentsWithImages();
