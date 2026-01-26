import { CONFIG } from './config.js';

document.getElementById('btnScrape').addEventListener('click', async () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = "Inectando script...";

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('wodbuster.com')) {
        statusEl.textContent = "❌ Solo funciona en Wodbuster_";
        return;
    }

    // Inject function
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scrapeTableData
    }, async (results) => {
        if (chrome.runtime.lastError) {
            statusEl.textContent = "Error: " + chrome.runtime.lastError.message;
            return;
        }

        const data = results[0].result;
        statusEl.textContent = `¡${data.length} registros extraídos!`;

        // Show data
        const textArea = document.getElementById('jsonOutput');
        const btnCopy = document.getElementById('btnCopy');

        textArea.style.display = 'block';
        textArea.value = JSON.stringify(data, null, 2);
        btnCopy.style.display = 'block';

        btnCopy.onclick = () => {
            textArea.select();
            document.execCommand('copy');
            statusEl.textContent = "✅ Copiado al portapapeles.";
        };
    });
});

// The scraping function runs in the context of the page
function scrapeTableData() {
    // Attempt to find ANY table
    const table = document.querySelector('table');
    if (!table) return null;

    const rows = Array.from(table.querySelectorAll('tr'));
    const headers = Array.from(rows[0].querySelectorAll('th, td')).map(td => td.innerText.trim());

    const data = rows.slice(1).map(row => {
        const cells = row.querySelectorAll('td');
        const obj = {};
        headers.forEach((h, i) => {
            if (cells[i]) obj[h] = cells[i].innerText.trim();
        });
        // Add timestamp
        obj['imported_at'] = new Date().toISOString();
        return obj;
    });

    return data;
}
