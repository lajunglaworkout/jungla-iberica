import puppeteer from 'puppeteer';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN ---
// (Idealmente esto viene de variables de entorno)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gfnjlmfziczimaohgkct.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'TU_CLAVE_AQUI';
const INTERVAL_MINUTES = 30;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runSync() {
    console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Iniciando ronda de vigilancia...`);
    let browser;
    try {
        // 1. Conectar a Chrome
        try {
            const resp = await axios.get('http://127.0.0.1:9222/json/version', { timeout: 2000 });
            browser = await puppeteer.connect({
                browserWSEndpoint: resp.data.webSocketDebuggerUrl,
                defaultViewport: null
            });
        } catch (e) {
            console.error('❌ No detecto Chrome Zombie (Puerto 9222). Asegurate de haberlo lanzado.');
            return;
        }

        const pages = await browser.pages();
        let page = pages.find(p => p.url().includes('wodbuster'));
        if (!page) {
            page = await browser.newPage();
            await page.goto('https://jungla.wodbuster.com/admin/mensajes.aspx', { waitUntil: 'domcontentloaded' });
        } else {
            await page.bringToFront();
            if (!page.url().includes('mensajes.aspx')) {
                await page.goto('https://jungla.wodbuster.com/admin/mensajes.aspx', { waitUntil: 'domcontentloaded' });
            }
        }

        // 2. Leer Lista
        console.log('👀 Escaneando buzón...');

        // Espera explícita para asegurar carga dinámica
        await new Promise(r => setTimeout(r, 5000));

        const messages = await page.evaluate(() => {
            // Selectores robustos (probados en script manual)
            // Intentamos varios tipos de contenedores que Wodbuster usa
            const candidates = Array.from(document.querySelectorAll('div.card, div.list-group-item, div.row > div'));

            // Filtramos los que parecen tarjetas de mensaje (tienen texto y no son contenedores vacíos)
            const validCards = candidates.filter(c => {
                const text = c.innerText;
                return text.length > 10 && text.length < 300 && text.includes('\n'); // Tienen saltos de linea (nombre / fecha)
            });

            return validCards.map(c => {
                const text = c.innerText.split('\n');
                return {
                    raw: c.innerText,
                    sender: text[0] ? text[0].trim() : 'Desconocido',
                    date_str: text[1] ? text[1].trim() : '',
                    preview: text.slice(2).join(' ').substring(0, 50) + '...'
                };
            });
        });

        console.log(`📥 Detectados ${messages.length} hilos.`);

        // 3. Subir a Supabase (Mock por ahora, usando 'tareas' o tabla temporal si no existe messages)
        // En producción crearíamos tabla 'inbox_messages'
        console.log('☁️ Sincronizando con CRM...');
        /*
        const { error } = await supabase.from('inbox_messages').upsert(messages.map(m => ({
            sender: m.sender,
            content: m.preview,
            received_at: new Date(), // Parsear fecha real sería mejor
            source: 'wodbuster'
        })));
        */

        // Por seguridad en esta demo, solo logueamos
        console.log('✅ Sincronización completada (Lectura).');
        messages.slice(0, 3).forEach(m => console.log(`   - ${m.sender}: ${m.preview.substring(0, 30)}...`));

        // --- FASE 4: GUARDARRAÍLES Y RESPUESTA ---
        // El Agente NUNCA contesta solo. Busca órdenes aprobadas.
        console.log('🛡️ Verificando respuestas aprobadas por humanos...');

        /* 
           LÓGICA DE SEGURIDAD:
           1. Buscamos en Supabase mensajes con status = 'APPROVED_TO_SEND'
           2. Solo si existe esa flag explícita, el robot escribe.
        */
        const pendingReplies = []; // await supabase.from('outbox').select('*').eq('status', 'APPROVED');

        if (pendingReplies.length === 0) {
            console.log('   -> No hay órdenes de envío confirmadas. El Agente permanece en silencio. 🤫');
        } else {
            console.log(`   -> ¡Atención! Se encontraron ${pendingReplies.length} respuestas aprobadas. Enviando...`);
            // Aquí iría el código de 'page.type' y click en enviar, 
            // pero ESTÁ DESACTIVADO hasta que tú lo valides.
        }

        browser.disconnect();

    } catch (e) {
        console.error('🔥 Error en la ronda:', e.message);
        if (browser) browser.disconnect();
    }
}

// Bucle Infinito
(async () => {
    console.log(`🤖 AGENTE ATENCIÓN AL CLIENTE v1.0`);
    console.log(`🔄 Frecuencia: Cada ${INTERVAL_MINUTES} minutos.`);
    console.log(`----------------------------------------`);

    // Ejecutar inmediatamente al inicio
    await runSync();

    // Programar intervalo
    setInterval(runSync, INTERVAL_MINUTES * 60 * 1000);
})();
