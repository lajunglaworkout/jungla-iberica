
import 'dotenv/config';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gfnjlmfziczimaohgkct.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);

const FILTER_DATE_CUTOFF = new Date('2026-01-15');

async function runDeepSync() {
    console.log(`\n🕵️‍♀️ [Modo PROFUNDO] Iniciando análisis detallado...`);
    let browser;
    try {
        // 1. Conectar al Chrome Zombie
        const resp = await axios.get('http://127.0.0.1:9222/json/version', { timeout: 2000 });
        browser = await puppeteer.connect({
            browserWSEndpoint: resp.data.webSocketDebuggerUrl,
            defaultViewport: null
        });

        const pages = await browser.pages();
        let page = pages.find(p => p.url().includes('wodbuster'));
        if (!page) {
            console.error('❌ No encuentro Wodbuster abierto.');
            browser.disconnect();
            return;
        }

        if (!page.url().includes('mensajes.aspx')) {
            await page.goto('https://jungla.wodbuster.com/admin/mensajes.aspx', { waitUntil: 'domcontentloaded' });
        }
        await page.bringToFront();

        // 2. Obtener la lista inicial de mensajes (solo IDs y fechas para filtrar)
        console.log('📋 Leyendo lista...');
        await new Promise(r => setTimeout(r, 2000)); // Esperar carga

        const summaries = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('div.card, div.list-group-item, div.row > div'));
            return cards.map((c, index) => {
                const el = c as HTMLElement;
                const text = el.innerText || '';
                return { index, text, raw: text };
            }).filter(c => c.text.length > 10 && c.text.includes('\n'));
        });

        console.log(`🔍 Encontrados ${summaries.length} candidatos en la lista.`);

        // 3. Iterar y PROFUNDIZAR
        let processedCount = 0;

        // Solo procesamos los primeros 5 por ahora en modo test, para no bloquearte mucho
        // El usuario puede configurar este límite luego.
        const limit = summaries.slice(0, 10);

        for (const summary of limit) {

            const lines = summary.text.split('\n');
            const dateStr = lines[1] ? lines[1].trim() : '';

            // TODO: Agregar aquí la lógica estricta de fecha si se desea

            console.log(`👉 [${processedCount + 1}/${limit.length}] Entrando en chat de: ${lines[0]}...`);

            // CLICK para entrar
            await page.evaluate((idx) => {
                const cards = Array.from(document.querySelectorAll('div.card, div.list-group-item, div.row > div'));
                // Filtramos igual que antes
                const valid = cards.filter(c => (c as HTMLElement).innerText.length > 10);
                if (valid[idx]) (valid[idx] as HTMLElement).click();
            }, summary.index);

            // Esperar carga del detalle
            try {
                await page.waitForSelector('.chat-history, .conversation, textarea', { timeout: 5000 });
            } catch (e) {
                console.log('   ⚠️ No detecté chat, volviendo...');
                await page.goBack();
                continue;
            }

            // --- SCRAPING PROFUNDO ---
            const chatData = await page.evaluate(() => {
                // Heurística visual para saber quién habló el último
                // Buscamos las burbujas de chat. 
                // En Wodbuster, suelen ser divs con clases distintas para "mio" (staff) y "suyo" (user).
                const bubbles = Array.from(document.querySelectorAll('.bubble, .msg, .message, div[class*="msg"], div[class*="bubble"]'));

                if (bubbles.length === 0) return { lastAuthor: 'unknown', text: document.body.innerText.substring(0, 200) };

                const lastBubble = bubbles[bubbles.length - 1] as HTMLElement;
                const style = window.getComputedStyle(lastBubble);
                const isRightAligned = style.textAlign === 'right' || style.float === 'right' || style.marginLeft === 'auto' || lastBubble.className.includes('mine') || lastBubble.className.includes('staff');

                return {
                    lastAuthor: isRightAligned ? 'staff' : 'client',
                    text: lastBubble.innerText
                };
            });

            console.log(`   🧠 Último mensaje de: ${chatData.lastAuthor.toUpperCase()}`);

            const status = chatData.lastAuthor === 'staff' ? 'responded' : 'pending';

            // GENERAR BORRADOR IA (Simulado por ahora)
            let aiProposal = null;
            if (status === 'pending') {
                aiProposal = {
                    text: `Hola ${lines[0].split(' ')[0]}! Gracias por escribirnos. ¿En qué podemos ayudarte?`,
                    actions: ['Revisar ficha'],
                    confidence: 0.8
                };
            }

            // GUARDAR EN SUPABASE
            const { error } = await supabase.from('inbox_messages').upsert({
                sender: lines[0], // Nombre del usuario extraido de la lista
                content: chatData.text, // Último mensaje real
                status: status,
                agent_proposal: aiProposal, // Guardamos la sugerencia
                source: 'wodbuster',
                raw_data: { summary, chatData }
            }, { onConflict: 'content' });

            if (error) console.log(`   ⚠️ Error DB: ${error.message}`);
            else console.log(`   ✅ Sincronizado: ${status.toUpperCase()} -> DB`);

            // Volver a la lista
            await page.goBack();
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 1500)); // Calmar al DOM

            processedCount++;
        }

        console.log('✅ Ronda profunda terminada.');
        browser.disconnect();

    } catch (e) {
        console.error('🔥 Error:', e);
        if (browser) browser.disconnect();
    }
}
runDeepSync();
