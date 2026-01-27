
import 'dotenv/config';
import puppeteer from 'puppeteer';
import axios from 'axios';

(async () => {
    console.log('🕵️‍♀️ DIAGNÓSTICO: Analizando estructura de mensajes respondidos vs nuevos...');

    try {
        const resp = await axios.get('http://127.0.0.1:9222/json/version', { timeout: 2000 });
        const browser = await puppeteer.connect({
            browserWSEndpoint: resp.data.webSocketDebuggerUrl,
            defaultViewport: null
        });

        const pages = await browser.pages();
        let page = pages.find(p => p.url().includes('wodbuster'));

        if (!page) {
            console.log('❌ No encontré la pestaña de Wodbuster. Ábrela en Chrome.');
            return;
        }

        const debugInfo = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('div.card, div.list-group-item, div.row > div'));

            // Filter likely message cards
            const validCards = cards.filter(c => {
                const text = (c as HTMLElement).innerText || '';
                return text.length > 10 && text.includes('\n');
            });

            return validCards.slice(0, 5).map((c, index) => {
                const el = c as HTMLElement;
                return {
                    index,
                    text: el.innerText.split('\n').slice(0, 2).join(' | '), // Name + Date
                    fullTextFirst20chars: el.innerText.substring(0, 20).replace(/\n/g, '↵'),
                    className: el.className,
                    backgroundColor: window.getComputedStyle(el).backgroundColor,
                    fontWeight: window.getComputedStyle(el).fontWeight,
                    hasUnreadClass: el.classList.contains('unread') || el.classList.contains('font-weight-bold') || el.className.includes('bold'),
                    innerHTML_snippet: el.innerHTML.substring(0, 100)
                };
            });
        });

        console.log('\n📊 RESULTADOS DEL ANÁLISIS (Primeros 5 mensajes):');
        console.table(debugInfo);

        console.log('\n❓ PREGUNTA PARA EL USUARIO:');
        console.log('Mirando la tabla de arriba, compara un mensaje que sepas que está "Respondido" vs uno "Sin responder".');
        console.log('- ¿Tienen diferente "className"?');
        console.log('- ¿Diferente "fontWeight" (negrita)?');
        console.log('- ¿Diferente color de fondo?');

        browser.disconnect();

    } catch (e) {
        console.error('Error:', e);
    }
})();
