import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

(async () => {
    try {
        console.log('📡 Buscando tu Chrome abierto en puerto 9222...');

        const response = await axios.get('http://127.0.0.1:9222/json/version');
        const { webSocketDebuggerUrl } = response.data;

        console.log('🔗 Conectando al navegador existente...');

        const browser = await puppeteer.connect({
            browserWSEndpoint: webSocketDebuggerUrl,
            defaultViewport: null
        });

        const pages = await browser.pages();
        let page = pages.find(p => p.url().includes('wodbuster.com'));

        if (!page) {
            console.log('⚠️ No veo Wodbuster. Abriendo panel...');
            page = await browser.newPage();
            await page.goto('https://jungla.wodbuster.com/manager/default.aspx', { waitUntil: 'networkidle0' });
        } else {
            console.log(`🎯 Pestaña encontrada: ${page.url()}`);
            await page.bringToFront();
            if (!page.url().includes('/manager/')) {
                console.log('🔄 Redirigiendo a /manager/default.aspx...');
                await page.goto('https://jungla.wodbuster.com/manager/default.aspx', { waitUntil: 'networkidle0' });
            }
        }

        console.log('👀 Buscando tarjeta "MÉTRICAS CLAVE" o menú...');

        await new Promise(r => setTimeout(r, 2000));

        // Use safe JS evaluation to find element by text (avoiding page.$x errors)
        const clickedType = await page.evaluate(() => {
            // Helper to find by text
            function findByText(selector, text) {
                const elements = Array.from(document.querySelectorAll(selector));
                return elements.find(el => el.textContent && el.textContent.toUpperCase().includes(text.toUpperCase()));
            }

            // 1. Try Dashboard Tile
            const metricTile = findByText('div.card span, div.card h4, h4, span.card-title', 'METRICAS');
            if (metricTile) {
                metricTile.click();
                return 'tile';
            }

            // 2. Try Sidebar Link
            const sidebarLink = findByText('a', 'INFORMES');
            if (sidebarLink) {
                sidebarLink.click();
                return 'link';
            }

            return null;
        });

        if (clickedType) {
            console.log(`   -> Clic realizado en: ${clickedType === 'tile' ? 'Tarjeta Métricas' : 'Menú Informes'}`);
        } else {
            console.log('   (No encontré ni tarjeta ni menú). Hago captura.');
            await page.screenshot({ path: 'debug-nolink.png' });
            browser.disconnect();
            return;
        }

        // Wait for page load
        console.log('⏳ Esperando carga del informe...');
        await new Promise(r => setTimeout(r, 5000));

        console.log('📉 Extrayendo datos....');

        // Wait for table or chart
        try {
            const data = await page.evaluate(() => {
                const table = document.querySelector('table');
                if (table) {
                    const rows = Array.from(table.querySelectorAll('tr'));
                    return rows.map(row => {
                        return Array.from(row.querySelectorAll('td, th')).map(cell => cell.innerText.trim());
                    });
                } else {
                    // Try to get Chart data if stored in window variable (Highcharts hack)
                    if (window.Highcharts && window.Highcharts.charts[0]) {
                        return window.Highcharts.charts[0].series.map(s => ({
                            name: s.name,
                            data: s.data.map(p => ({ x: p.category, y: p.y }))
                        }));
                    }
                }
                return null;
            });

            if (data) {
                console.log(`✅ ¡ÉXITO! Recibimos datos.`);
                // fs is node module, cannot use inside evaluate. Pass data out.
            } else {
                console.log('⚠️ No encontré tabla ni gráfico Highcharts compatible.');
            }

            if (data) {
                fs.writeFileSync('wodbuster_data.json', JSON.stringify(data, null, 2));
                console.log('💾 Guardado en wodbuster_data.json');
            } else {
                await page.screenshot({ path: 'debug-report-page.png' });
                console.log('📸 Captura guardada en debug-report-page.png');
            }

        } catch (e) {
            console.log('⚠️ Error extrayendo: ' + e.message);
        }

        console.log('👋 Desconectando...');
        browser.disconnect();

    } catch (error) {
        console.error('🔥 Error Fatal:', error.message);
    }
})();
