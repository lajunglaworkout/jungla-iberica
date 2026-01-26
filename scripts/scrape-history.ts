import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Load environment variables manually or rely on shell envs
// Load environment variables manually or rely on shell envs
const CENTER = process.env.CENTER || 'sevilla';
const USERNAME = process.env.WODBUSTER_USER || 'lajunglaworkout';
// Password not needed for manual login

const SUBDOMAINS: Record<string, string> = {
    sevilla: 'jungla',
    jerez: 'lajunglajerez',
    puerto: 'lajunglaelpuerto'
};

const subdomain = SUBDOMAINS[CENTER];
if (!subdomain) {
    console.error(`❌ Error: Invalid center '${CENTER}'. Valid: sevilla, jerez, puerto.`);
    process.exit(1);
}

(async () => {
    console.log(`🚀 Starting Wodbuster Scraper for [${CENTER.toUpperCase()}]...`);

    // Try to find local Chrome to look more "human"
    const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const hasLocalChrome = fs.existsSync(executablePath);

    if (hasLocalChrome) {
        console.log('🖥️ Usando tu Google Chrome instalado (más seguro)...');
    } else {
        console.log('🤖 Usando navegador interno (Chromium)...');
    }

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: hasLocalChrome ? executablePath : undefined,
        defaultViewport: null, // Let browser handle viewport
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled', // Mask automation
            '--start-maximized'
        ]
    });

    const page = await browser.newPage();

    // Hack to hide webdriver property
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });

    try {
        // 1. Login Manual
        console.log('🔑 Opening login page...');
        await page.goto(`https://${subdomain}.wodbuster.com/admin`, { waitUntil: 'networkidle2' });

        console.log('⚠️  ATENCIÓN: Por favor, inicia sesión manualmente en la ventana del navegador.');
        console.log('⏳ Esperando a que entres en el Dashboard...');

        // Wait for URL to change to something indicating we are logged in (not login page)
        // Adjust timeout to give user plenty of time (e.g., 3 minutes)
        await page.waitForFunction(
            () => !window.location.href.includes('Login') && !window.location.href.includes('login'),
            { timeout: 180000 }
        );

        console.log('✅ Login manual detectado! Continuando...');

        // 2. Navigate to Reports (Analysis)
        // Adjust URL based on actual Wodbuster routing
        const reportsUrl = `https://${subdomain}.wodbuster.com/admin/Informes/New/Estadisticas.aspx`;
        console.log(`📊 Navigating to Reports: ${reportsUrl}`);
        await page.goto(reportsUrl, { waitUntil: 'networkidle2' });

        // 3. Extract Data (Mocking extraction logic for now until we see the page structure)
        // Ideally we would select "Last 6 months" and download CSV or scrape the table

        console.log('📸 Taking snapshot for debugging...');
        const debugPath = path.resolve(`./debug-scraper-${CENTER}.png`);
        await page.screenshot({ path: debugPath });
        console.log(`Saved screenshot to ${debugPath}`);

        // Placeholder for data extraction logic
        console.log('⚠️ Data extraction logic needs specific selectors. Please inspect the screenshot.');

    } catch (error) {
        console.error('🔥 Error:', error);
    } finally {
        console.log('👋 Closing browser in 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
        await browser.close();
    }
})();
