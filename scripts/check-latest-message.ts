import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';

(async () => {
    try {
        console.log('📡 Conectando a tu Chrome (9222)...');
        const response = await axios.get('http://127.0.0.1:9222/json/version');
        const browser = await puppeteer.connect({
            browserWSEndpoint: response.data.webSocketDebuggerUrl,
            defaultViewport: null
        });

        const pages = await browser.pages();
        let page = pages.find(p => p.url().includes('wodbuster.com'));
        if (!page) {
            console.log('⚠️ No veo pestaña wodbuster, usando la activa...');
            page = pages[0]; // Fallback to whatever is open
        }
        await page.bringToFront();

        // IR DIRECTO A MENSAJES (Saltar el menú intermedio)
        const targetUrl = 'https://jungla.wodbuster.com/admin/mensajes.aspx';

        if (!page.url().includes('mensajes.aspx')) {
            console.log(`📨 Yendo directo a la bandeja (${targetUrl})...`);
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
        }

        console.log('👀 Esperando a que carguen los mensajes...');

        // Wait for cards - generic selector
        try {
            await page.waitForSelector('div[onclick*="chat.aspx"], .card', { timeout: 10000 });
        } catch (e) {
            console.log('⚠️ Tardando en cargar tarjetas...');
        }

        // Explicit wait for robust rendering
        await new Promise(r => setTimeout(r, 4000));

        console.log('📸 Fotografiando inbox...');
        await page.screenshot({ path: 'inbox-snapshot.png' });

        console.log('🕵️ Leyendo mensajes...');

        const messages = await page.evaluate(() => {
            // Buscamos cualquier elemento que parezca tener nombre y hora
            // En tu captura parece un grid de tarjetas
            // Buscamos divs que contengan texto y tengan cierta estructura

            // Selector "div con clase card" o similar
            let elements = Array.from(document.querySelectorAll('div.card'));

            // Si no hay cards con clase explicita, buscar por estructura
            if (elements.length === 0) {
                // Estrategia: Buscar elementos que tengan "chat.aspx" en algún atributo (link o onclick)
                // En tu captura: chat.aspx?id=...
                const links = Array.from(document.querySelectorAll('a[href*="chat.aspx"]'));
                if (links.length > 0) return links.slice(0, 5).map(l => l.innerText);

                // Buscar divs con onclick
                const divs = Array.from(document.querySelectorAll('div[onclick*="chat.aspx"]'));
                elements = divs;
            }

            if (elements.length === 0) {
                // Fallback final: coger divs genéricos que tengan texto
                return ["No identifiqué selector exacto, ver captura."];
            }

            return elements.slice(0, 5).map(c => c.innerText.replace(/\n/g, ' | '));
        });

        if (messages.length > 0 && messages[0] !== "No identifiqué selector exacto, ver captura.") {
            console.log('✅ ¡MENSAJES ENCONTRADOS!:');
            messages.forEach((m, i) => console.log(`   ${i + 1}. ${m}`));
        } else {
            console.log('❌ No encontré tarjetas de mensajes claras. Revisa la captura.');
            console.log('Datos raw:', messages);
        }

        browser.disconnect();

    } catch (e) {
        console.error('🔥 Error General:', e.message);
    }
})();
