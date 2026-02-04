
import 'dotenv/config';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// --- CONFIGURACIÓN SUPABASE ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gfnjlmfziczimaohgkct.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);

// URL base
const BASE_URL = 'https://jungla.wodbuster.com';

async function runAnalyticsExtraction() {
    console.log('🦍 [Analytics] Iniciando extracción v3 (URLs Directas)...');

    let browser;
    try {
        // 1. CONEXIÓN
        try {
            const resp = await axios.get('http://127.0.0.1:9222/json/version', { timeout: 2000 });
            browser = await puppeteer.connect({
                browserWSEndpoint: resp.data.webSocketDebuggerUrl,
                defaultViewport: null
            });
            console.log('✅ Conectado a Chrome');
        } catch (e) {
            console.error('\n❌ ERROR: Chrome no está abierto en modo debug (Puerto 9222).');
            return;
        }

        // SIEMPRE abrir nueva pestaña para no interferir con AttCliente
        const page = await browser.newPage();
        console.log('   ✅ Usando pestaña dedicada aislada.');

        // Variables globales
        let atletasGlobal: any[] = [];
        let metricasGlobal: any = {};
        let ocupacionGlobal: any = {};

        // Helper para navegar
        const goTo = async (url: string) => {
            console.log(`   🔗 Navegando a ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        };


        // --- 1. ATLETAS ---
        console.log('\n📊 1/5 Extrayendo: ATLETAS...');
        try {
            await goTo(`${BASE_URL}/manager/athletes.aspx`);

            // Esperar un poco más para carga dinámica y posibles iframes
            await new Promise(r => setTimeout(r, 8000));

            // 🔍 DEBUG: VOLCAR HTML para entender qué está pasando
            const htmlContent = await page.content();
            const debugPath = '/Users/user/Desktop/jungla-iberica/debug_athletes.html';
            fs.writeFileSync(debugPath, htmlContent);
            console.log(`   🐛 HTML de Atletas guardado en ${debugPath}.`);

            // Intentar detectar si hay iframes
            const frames = page.frames();
            console.log(`   🐛 Frames detectados: ${frames.length}`);

            // Extracción (modificada para buscar también en frames)
            let rows: any[] = [];

            // 1. Buscar en Main Frame
            const mainRows = await page.evaluate(() => Array.from(document.querySelectorAll('tr')).map(r => r.outerHTML));
            console.log(`   🐛 Filas TR en Main Frame: ${mainRows.length}`);

            // 2. Buscar en otros Frames si main está vacío
            if (mainRows.length < 5) {
                for (const frame of frames) {
                    try {
                        const fRows = await frame.evaluate(() => Array.from(document.querySelectorAll('tr')).length);
                        console.log(`       🐛 Frame ${frame.name() || frame.url()}: ${fRows} filas.`);
                    } catch (e) { }
                }
            }

            // (El resto del código de extracción se mantiene igual, pero ahora sabemos el diagnóstico)
            const atletas = await page.evaluate(() => {
                const trs = Array.from(document.querySelectorAll('tr, .dxgvDataRow_Office2010Blue')); // Probar clase DevExpress típica
                return trs.map(row => {
                    const r = row as HTMLElement;
                    const cols = Array.from(r.querySelectorAll('td'));
                    if (cols.length < 3) return null;

                    const rawText = r.innerText;
                    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

                    if (!emailMatch && rawText.length < 10) return null;

                    const c0 = cols[0] as HTMLElement;
                    const c1 = cols[1] as HTMLElement;

                    return {
                        nombre: c1?.innerText?.trim() || c0?.innerText?.trim() || 'Desconocido',
                        email: emailMatch?.[0] || '',
                        estado: rawText.toLowerCase().includes('baja') ? 'baja' : 'activo',
                        raw: rawText.replace(/\n/g, '|').substring(0, 150)
                    };
                }).filter(Boolean);
            });
            console.log(`   ✅ ${atletas.length} atletas encontrados.`);
            atletasGlobal = atletas;

        } catch (e) { console.error('   ❌ Fallo bloque Atletas:', e); }


        // --- 2. MÉTRICAS CLAVE (Marketing) ---
        console.log('\n📊 2/5 Extrayendo: MÉTRICAS CLAVE...');
        try {
            await goTo(`${BASE_URL}/manager/marketing.aspx`);

            const metricas = await page.evaluate(() => {
                const bodyText = document.body.innerText;
                const extractVal = (label: string) => {
                    const regex = new RegExp(`${label}[\\s\\n]+([0-9.,]+)`, 'i');
                    return bodyText.match(regex)?.[1] || '0';
                };
                return {
                    ticketMedio: extractVal('Ticket medio'),
                    lifetime: extractVal('Lifetime'),
                    cltv: extractVal('CLTV'),
                    rawResumen: bodyText.substring(0, 500)
                };
            });
            console.log('   ✅ Métricas:', metricas);
            metricasGlobal = metricas;

        } catch (e) { console.error('   ❌ Fallo bloque Métricas:', e); }


        // --- 3. OCUPACIÓN ---
        console.log('\n📊 3/5 Extrayendo: OCUPACIÓN...');
        try {
            await goTo(`${BASE_URL}/manager/usoclases.aspx`);

            const ocupacion = await page.evaluate(() => {
                const clases = Array.from(document.querySelectorAll('.class-block, .fc-event, td[class*="ocupacion"], tr[class*="row"]'));
                const firstClass = clases[0] as HTMLElement;
                return {
                    totalClasesDetectadas: clases.length,
                    ejemplo: firstClass?.innerText || 'No detectado'
                };
            });
            console.log(`   ✅ Ocupación: ${ocupacion.totalClasesDetectadas} bloques.`);
            ocupacionGlobal = ocupacion;

        } catch (e) { console.error('   ❌ Fallo bloque Ocupación:', e); }


        // --- 4. CUÁNTO ENTRENAN ---
        console.log('\n📊 4/5 Extrayendo: ASISTENCIA (Cuanto Entrenan)...');
        try {
            await goTo(`${BASE_URL}/manager/cuantoentrenan.aspx`);

            const asistencia = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('tr'));
                return {
                    filasDatos: rows.length,
                    resumen: document.body.innerText.substring(0, 200).replace(/\n/g, ' ')
                };
            });
            console.log(`   ✅ Asistencia datos: ${asistencia.filasDatos} filas.`);
        } catch (e) { console.error('   ❌ Fallo bloque Asistencia:', e); }


        // --- GUARDADO ---
        console.log('\n💾 Guardando snapshot unificado en Supabase...');

        const snapshot = {
            center: 'sevilla',
            atletas: atletasGlobal,
            metricasClave: metricasGlobal,
            ocupacion: ocupacionGlobal,
            raw_timestamp: new Date().toISOString()
        };

        const { error } = await supabase.from('wodbuster_snapshots').insert({
            center: 'sevilla',
            data: snapshot,
            athlete_count: atletasGlobal.length,
            // Cálculo aproximado de activos
            active_count: atletasGlobal.filter((a: any) => a.estado === 'activo').length
        });

        if (error) console.error('   ❌ Error guardando:', error.message);
        else console.log('   ✅ Snapshot guardado correctamente.');

        // CERRAR PESTAÑA LIMPIAMENTE
        await page.close();

    } catch (e: any) {
        if (e.message.includes('ECONNREFUSED')) {
            console.error('\n❌ ERROR: Chrome no conectado.');
        } else {
            console.error('❌ Error fatal:', e.message);
        }
    } finally {
        if (browser) browser.disconnect();
    }
}

// Bucle cada hora
const INTERVAL_MINUTES = 60;
async function loop() {
    await runAnalyticsExtraction();
    console.log(`\n💤 Esperando ${INTERVAL_MINUTES} min...`);
    setInterval(runAnalyticsExtraction, INTERVAL_MINUTES * 60 * 1000);
}

loop();
