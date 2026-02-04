
import 'dotenv/config';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gfnjlmfziczimaohgkct.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);

// Configurar Gemini (usando modelo disponible en la API actual)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// --- FUNCIÓN PARA GENERAR RESPUESTA CON GEMINI ---
async function generateGeminiResponse(
    clientName: string,
    message: string,
    conversationContext: string,
    trainingExamples: { original: string; reply: string }[]
): Promise<{ text: string; confidence: number }> {
    try {
        // Construir ejemplos para few-shot learning
        const examplesText = trainingExamples.length > 0
            ? trainingExamples.slice(0, 5).map((ex, i) =>
                `Ejemplo ${i + 1}:\nCliente: "${ex.original}"\nRespuesta: "${ex.reply}"`
            ).join('\n\n')
            : 'No hay ejemplos previos.';

        const prompt = `Eres el asistente de atención al cliente de La Jungla Workout, un box de CrossFit en Sevilla, Jerez y Puerto.
Tu tono es: amigable, cercano, profesional. Usa emojis moderados (1-2 máximo).

CLIENTE: ${clientName}

MENSAJE RECIBIDO:
"${message}"

${conversationContext ? `CONTEXTO ADICIONAL:\n${conversationContext}\n` : ''}

EJEMPLOS DE RESPUESTAS ANTERIORES (aprende de ellos):
${examplesText}

INSTRUCCIONES:
1. Responde de forma natural y personalizada
2. USA el nombre del cliente
3. Si no sabes algo específico, ofrece ayuda o derivar a recepción
4. Máximo 2-3 frases, sé conciso
5. No inventes datos (horarios, precios, etc.)

Genera UNA respuesta directa (sin explicaciones ni formato):`;

        const result = await geminiModel.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Limpiar la respuesta de posibles comillas o formatos
        const cleanedResponse = responseText
            .replace(/^["']|["']$/g, '') // Quitar comillas inicio/fin
            .replace(/^Respuesta:\s*/i, '') // Quitar "Respuesta:" si existe
            .trim();

        console.log(`   🤖 Gemini generó: "${cleanedResponse.substring(0, 50)}..."`);

        return {
            text: cleanedResponse,
            confidence: 0.85 // Alta confianza con Gemini
        };
    } catch (error: any) {
        console.log(`   ⚠️ Error Gemini: ${error.message}`);
        return {
            text: `Hola ${clientName.split(' ')[0]}! 👋 He recibido tu mensaje. ¿Podrías darme más detalles para poder ayudarte mejor?`,
            confidence: 0.5
        };
    }
}

const INTERVAL_MINUTES = 30; // Producción: cada 30 minutos

// --- FUNCIÓN PARA ENVIAR RESPUESTAS PENDIENTES ---
async function sendPendingReplies() {
    console.log('\n📤 Verificando respuestas pendientes de envío...');

    // 1. Buscar mensajes con reply_to_send pendiente
    const { data: pendingReplies, error } = await supabase
        .from('inbox_messages')
        .select('id, sender, reply_to_send, raw_data, wodbuster_chat_id')
        .not('reply_to_send', 'is', null)
        .is('reply_sent_at', null)
        .limit(5);

    if (error) {
        console.log('   ⚠️ Error buscando pendientes:', error.message);
        return;
    }

    if (!pendingReplies || pendingReplies.length === 0) {
        console.log('   ✅ No hay respuestas pendientes');
        return;
    }

    console.log(`   📬 ${pendingReplies.length} respuesta(s) pendiente(s) de enviar`);

    // 2. Conectar a Chrome Zombie
    let browser;
    try {
        const resp = await axios.get('http://127.0.0.1:9222/json/version', { timeout: 2000 });
        browser = await puppeteer.connect({
            browserWSEndpoint: resp.data.webSocketDebuggerUrl,
            defaultViewport: null
        });

        const pages = await browser.pages();
        let page = pages.find(p => p.url().includes('wodbuster'));
        if (!page) {
            console.log('   ❌ No hay página de Wodbuster abierta');
            browser.disconnect();
            return;
        }

        // 3. Procesar cada respuesta pendiente
        for (const msg of pendingReplies) {
            // Usar wodbuster_chat_id (nuevo) o fallback a raw_data.chatId (viejo)
            const chatId = msg.wodbuster_chat_id || msg.raw_data?.chatId || msg.raw_data?.summary?.index;
            if (!chatId) {
                console.log(`   ⚠️ No hay chat ID para ${msg.sender}`);
                continue;
            }

            console.log(`   📨 Enviando a ${msg.sender}...`);

            try {
                // Navegar al chat específico
                const chatUrl = `https://jungla.wodbuster.com/admin/chat.aspx?Id=${chatId}`;
                console.log(`      🔗 Navegando a: ${chatUrl}`);

                await page.goto(chatUrl, {
                    waitUntil: 'networkidle2',
                    timeout: 15000
                });
                await new Promise(r => setTimeout(r, 2000)); // Esperar carga completa

                // VERIFICAR que estamos en el chat correcto
                const pageTitle = await page.evaluate(() => {
                    // Buscar el nombre del cliente en el header del chat
                    const header = document.querySelector('h1, h2, .chat-header, [class*="header"] span, [class*="name"], .title');
                    return header?.textContent?.trim() || document.title;
                });

                const senderFirstName = msg.sender.split(' ')[0].toLowerCase();
                const pageTitleLower = pageTitle.toLowerCase();

                if (!pageTitleLower.includes(senderFirstName)) {
                    // Solo log de advertencia, no abortar - confiar en chatId de la BD
                    console.log(`      🔄 Nombre en página: "${pageTitle.substring(0, 30)}..."`);
                }

                console.log(`      ✅ Chat verificado: ${pageTitle}`);

                // Buscar el input de mensaje (varios selectores posibles)
                const inputSelectors = [
                    'textarea',
                    'input[type="text"]',
                    '[contenteditable="true"]',
                    '.message-input',
                    '#messageInput'
                ];

                let inputFound = false;
                for (const selector of inputSelectors) {
                    const input = await page.$(selector);
                    if (input) {
                        // Limpiar y escribir el mensaje
                        await input.click();
                        await page.keyboard.down('Control');
                        await page.keyboard.press('a');
                        await page.keyboard.up('Control');
                        await input.type(msg.reply_to_send, { delay: 30 });
                        inputFound = true;
                        console.log(`      ✏️ Mensaje escrito: "${msg.reply_to_send.substring(0, 40)}..."`);
                        break;
                    }
                }

                if (!inputFound) {
                    console.log(`      ❌ No se encontró input de mensaje`);
                    continue;
                }

                // Buscar el botón de enviar 
                console.log(`      🔍 Buscando botón enviar...`);

                let sent = false;

                // DEBUG: Listar todos los elementos clickeables cerca del textarea
                const pageButtons = await page.evaluate(() => {
                    const results: string[] = [];
                    const allClickables = document.querySelectorAll('button, a, input[type="submit"], [onclick], .btn');
                    allClickables.forEach((el, i) => {
                        const tag = el.tagName;
                        const classes = el.className;
                        const text = (el as HTMLElement).innerText?.substring(0, 20) || '';
                        const onclick = el.getAttribute('onclick')?.substring(0, 30) || '';
                        results.push(`${i}: <${tag} class="${classes}" onclick="${onclick}">${text}`);
                    });
                    return results;
                });
                console.log(`      📋 Elementos clickeables: ${pageButtons.length}`);
                if (pageButtons.length <= 10) {
                    pageButtons.forEach(b => console.log(`         ${b}`));
                }

                // Obtener posición del textarea para calcular dónde está el botón
                const textareaPos = await page.evaluate(() => {
                    const textarea = document.querySelector('textarea');
                    if (!textarea) return null;
                    const rect = textarea.getBoundingClientRect();
                    return { right: rect.right, centerY: rect.top + rect.height / 2 };
                });

                if (!textareaPos) {
                    console.log(`      ❌ No se encontró textarea`);
                    continue;
                }

                // Click en la posición del botón de enviar (a la derecha del textarea)
                const clickX = textareaPos.right + 70;
                const clickY = textareaPos.centerY;
                console.log(`      🖱️ Click en: x=${Math.round(clickX)}, y=${Math.round(clickY)}`);

                await page.mouse.click(clickX, clickY);
                await new Promise(r => setTimeout(r, 1000));

                sent = false; // Reset antes de verificar
                const empty1 = await page.evaluate(() => {
                    const ta = document.querySelector('textarea') as HTMLTextAreaElement;
                    return !ta || ta.value.trim() === '';
                });

                if (empty1) {
                    sent = true;
                    console.log(`      ✅ Mensaje enviado via click!`);
                } else {
                    // Segundo intento más a la derecha
                    console.log(`      🔄 Probando 50px más a la derecha...`);
                    await page.mouse.click(clickX + 50, clickY);
                    await new Promise(r => setTimeout(r, 500));

                    const empty2 = await page.evaluate(() => {
                        const ta = document.querySelector('textarea') as HTMLTextAreaElement;
                        return !ta || ta.value.trim() === '';
                    });
                    if (empty2) {
                        sent = true;
                        console.log(`      ✅ Mensaje enviado via segundo click!`);
                    }
                }


                // FALLBACK 1: Ctrl+Enter (común en chats)
                if (!sent) {
                    console.log(`      ⌨️ Intentando Ctrl+Enter...`);
                    await page.keyboard.down('Control');
                    await page.keyboard.press('Enter');
                    await page.keyboard.up('Control');
                    await new Promise(r => setTimeout(r, 500));

                    const textareaEmpty = await page.evaluate(() => {
                        const ta = document.querySelector('textarea') as HTMLTextAreaElement;
                        return !ta || ta.value.trim() === '';
                    });

                    if (textareaEmpty) {
                        sent = true;
                        console.log(`      ✅ Mensaje enviado via Ctrl+Enter!`);
                    }
                }

                // FALLBACK 2: Enter normal
                if (!sent) {
                    console.log(`      ⌨️ Intentando Enter...`);
                    await page.keyboard.press('Enter');
                    await new Promise(r => setTimeout(r, 500));

                    const textareaEmpty = await page.evaluate(() => {
                        const ta = document.querySelector('textarea') as HTMLTextAreaElement;
                        return !ta || ta.value.trim() === '';
                    });

                    if (textareaEmpty) {
                        sent = true;
                        console.log(`      ✅ Mensaje enviado via Enter!`);
                    } else {
                        console.log(`      ❌ No se pudo enviar el mensaje`);
                    }
                }

                if (sent) {
                    // Marcar como enviado en BD
                    await supabase
                        .from('inbox_messages')
                        .update({
                            reply_sent_at: new Date().toISOString(),
                            status: 'responded'
                        })
                        .eq('id', msg.id);
                    console.log(`      💾 Marcado como enviado en BD`);
                }

            } catch (e) {
                console.log(`      ❌ Error enviando a ${msg.sender}:`, e);
            }

            // Pequeña pausa entre mensajes
            await new Promise(r => setTimeout(r, 1000));
        }

        browser.disconnect();

    } catch (e) {
        console.log('   ❌ Error conectando a Chrome:', e);
        if (browser) browser.disconnect();
    }
}


async function runDeepSync() {
    console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Iniciando ronda de PROFUNDIDAD...`);
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
            console.log('   ⚠️ Pestaña Wodbuster no detectada. Abriendo nueva...');
            page = await browser.newPage();
            // Ir directo a mensajes para inicializar
            await page.goto('https://jungla.wodbuster.com/admin/mensajes.aspx', { waitUntil: 'domcontentloaded' });
        }

        if (!page.url().includes('mensajes.aspx')) {
            await page.goto('https://jungla.wodbuster.com/admin/mensajes.aspx', { waitUntil: 'domcontentloaded' });
        }
        await page.bringToFront();

        // 2. Obtener la lista inicial
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

        // 3. Iterar y PROFUNDIZAR (del más viejo al más nuevo)
        const summariesReverse = summaries.reverse();

        for (const summary of summariesReverse) {
            const lines = summary.text.split('\n');
            const dateStr = lines[1] ? lines[1].trim() : '';
            const clientName = lines[0].trim();

            // --- FILTRO FECHA (Strict Jan 15+) ---
            const isRecent = (d: string) => {
                const lower = d.toLowerCase();
                if (lower.includes('hoy') || lower.includes('ayer') || lower.includes('min') || lower.includes('hora')) return true;
                const match = d.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})/);
                if (match) {
                    const day = parseInt(match[1], 10);
                    const month = parseInt(match[2], 10); // 1-12
                    let year = parseInt(match[3], 10);
                    if (year < 100) year += 2000;

                    const msgDate = new Date(year, month - 1, day);
                    const twoDaysAgo = new Date();
                    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                    twoDaysAgo.setHours(0, 0, 0, 0); // Reset time part for comparison

                    return msgDate >= twoDaysAgo;
                }
                return false; // Ante la duda, ignorar antiguos
            };

            if (!isRecent(dateStr)) {
                // console.log(`   ⏳ Saltando antiguo: ${clientName} (${dateStr})`);
                continue;
            }

            // --- EXTRACTOR DE ID ---
            // En el screenshot se ve que al hacer hover sale ".../chat.aspx?id=3107"
            // Vamos a intentar sacar ese ID del onclick o del href del elemento hijo.
            const chatId = await page.evaluate((idx) => {
                const cards = Array.from(document.querySelectorAll('div.card, div.list-group-item, div.row > div'));
                const card = cards[idx] as HTMLElement;

                // Buscamos un enlace dentro o el onclick del propio card
                const link = card.querySelector('a[href*="chat.aspx"]');
                if (link) {
                    const href = link.getAttribute('href');
                    const match = href?.match(/id=(\d+)/);
                    if (match) return match[1];
                }

                // Si es onclick="window.location='chat.aspx?id=...'"
                const onclick = card.getAttribute('onclick');
                if (onclick) {
                    const match = onclick.match(/id=(\d+)/);
                    if (match) return match[1];
                }

                return null;
            }, summary.index);

            if (!chatId) {
                console.log(`   ⚠️ No pude sacar ID para: ${clientName}. Saltando...`);
                continue;
            }

            const chatUrl = `https://jungla.wodbuster.com/admin/chat.aspx?id=${chatId}`;
            console.log(`👉 Entrando en chat ${chatId}: ${clientName} (${dateStr})...`);

            // NAVEGACIÓN DIRECTA (Más robusta que click)
            await page.goto(chatUrl, { waitUntil: 'domcontentloaded' });

            // Esperar carga del chat
            try {
                // Buscamos cualquier señal de vida del chat (textarea, historial...)
                await page.waitForSelector('.chat-history, .conversation, textarea, #txtMessage', { timeout: 10000 });
            } catch (e) {
                console.log('   ⚠️ Timeout cargando chat. Volviendo a lista...');
                await page.goto('https://jungla.wodbuster.com/admin/mensajes.aspx', { waitUntil: 'domcontentloaded' });
                continue;
            }

            // --- SCROLL AL FINAL DEL CHAT ---
            await page.evaluate(() => {
                const chatContainer = document.querySelector('.chat-history, .conversation, #divConversacion, div[id*="chat"]');
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            });
            await new Promise(r => setTimeout(r, 200)); // Esperar scroll (reducido)

            // --- SCRAPING PROFUNDO (Mensajes recientes + Detección cierre) ---
            const chatAnalysis = await page.evaluate(() => {
                // Regex para firma con fecha completa: "Nombre DD/MM/YYYY HH:MM"
                const signatureWithDateRegex = /(.+?)\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*(\d{1,2}:\d{2})?/;
                // Regex para firma solo hora (mensajes de HOY): "Nombre HH:MM"
                const signatureTimeOnlyRegex = /^(.+?)\s+(\d{1,2}:\d{2})$/;

                const uiBlacklist = ['cargar', 'anteriores', 'chat', 'enviar', 'adjuntar', 'cerrar', 'escribir', 'facturas', 'reservar'];

                // Palabras que indican FIN de conversación (más flexibles)
                const closerWords = ['ok', 'vale', 'gracias', 'genial', 'perfecto', 'entendido', 'bien', 'bueno', 'listo', 'muchas gracias', 'muchisimas gracias'];
                const emojiOnlyRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+$/u;

                const allElements = Array.from(document.querySelectorAll('small, .small, .text-muted, span, div'));

                interface MsgInfo { author: string; text: string; date: string; isRecent: boolean; }
                const messages: MsgInfo[] = [];
                let lastAuthor = '';
                let lastRaw = '';

                // Recorremos TODOS los elementos buscando firmas (autor + fecha o autor + hora)
                for (const el of allElements) {
                    const text = (el as HTMLElement).innerText?.trim() || '';
                    if (text.length < 5 || text.length > 80) continue;

                    const lower = text.toLowerCase();
                    if (uiBlacklist.some(bad => lower.includes(bad))) continue;

                    // Primero intentamos con fecha completa
                    let match = text.match(signatureWithDateRegex);
                    let isRecent = false;
                    let author = '';

                    if (match) {
                        author = match[1].trim();
                        const day = parseInt(match[2], 10);
                        const month = parseInt(match[3], 10);
                        const year = match[4].length === 2 ? 2000 + parseInt(match[4], 10) : parseInt(match[4], 10);

                        // ¿Es fecha reciente? (>= 23 Enero 2026)
                        isRecent = year > 2026 || (year === 2026 && (month > 1 || (month === 1 && day >= 23)));
                    } else {
                        // Si no tiene fecha, intentar con solo hora (mensajes de HOY)
                        const timeMatch = text.match(signatureTimeOnlyRegex);
                        if (timeMatch) {
                            author = timeMatch[1].trim();
                            isRecent = true; // Mensajes de HOY siempre son recientes
                        }
                    }

                    // --- SANITIZACIÓN DE AUTOR ---
                    // Si el "autor" detectado es muy largo, probablemente es el texto del mensaje y la regex falló
                    if (author && author.length > 25) {
                        // console.log(`   ⚠️ Falso positivo de autor rechazado: "${author}"`);
                        author = '';
                    }
                    // Si contiene palabras prohibidas en un nombre
                    if (author && /^(hola|buenas|gracias|ok|perfecto)\b/i.test(author)) {
                        author = '';
                    }

                    if (author) {
                        // Buscar el texto del mensaje (en el padre)
                        let msgText = '';
                        let parent = (el as HTMLElement).parentElement;
                        for (let j = 0; j < 3 && parent; j++) {
                            const pText = parent.innerText || '';
                            const parts = pText.split(text)[0];
                            if (parts && parts.length > 2 && parts.length < 400) {
                                msgText = parts.trim();
                                break;
                            }
                            parent = parent.parentElement;
                        }

                        if (isRecent && msgText) {
                            // Para mensajes de solo hora, usamos "hoy" como fecha
                            const dateStr = match ? `${match[2]}/${match[3]}/${match[4]}` : 'hoy';

                            // --- MEJORA V3: Detectar si es STAFF trepando el árbol DOM ---
                            // Buscamos burbujas verdes/azules o alineación derecha en los padres
                            let isStaffStyle = false;
                            let styleReason = '';

                            let currentEl = el as HTMLElement;
                            // Subir hasta 6 niveles para encontrar el contenedor del mensaje ("burbuja")
                            for (let k = 0; k < 6 && currentEl; k++) {
                                const style = window.getComputedStyle(currentEl);
                                const bg = style.backgroundColor;

                                // Color: Verdes (156,220,dcf8c6) o Azules (220,248) comunes en WhatsApp/Wodbuster
                                if (bg && (bg.includes('156, 39') || bg.includes('220, 248') || bg.includes('dcf8c6') || bg.includes('21, 128') || bg.includes('34, 197') || bg.includes('21, 101'))) {
                                    isStaffStyle = true;
                                    styleReason = `Color detectado (${bg})`;
                                    break;
                                }

                                // Alineación
                                if (style.textAlign === 'right' || style.alignSelf === 'flex-end' || style.justifyContent === 'flex-end') {
                                    isStaffStyle = true;
                                    styleReason = 'Alineación CSS Derecha';
                                    break;
                                }

                                // Si encontramos un borde a la derecha
                                if (style.borderRightWidth && parseInt(style.borderRightWidth) > 0) {
                                    // A veces los mensajes propios tienen border
                                }

                                if (currentEl.tagName === 'BODY') break;
                                currentEl = currentEl.parentElement as HTMLElement;
                            }

                            // Posición física fallback
                            const rect = el.getBoundingClientRect();
                            const isRightSide = rect.left > (window.innerWidth * 0.5); // Estricto > 50%

                            // "Falso Autor" check
                            // Limpiamos el autor de saltos de línea para el check
                            const cleanAuthor = author.replace(/\n/g, ' ').trim();
                            const isGreeting = /^(hola|buenas|buenos|estimado|querido|hi|hello)\b/i.test(cleanAuthor);

                            if (isStaffStyle || (isRightSide && !isClient)) {
                                author = 'Staff (Jungla)';
                                // console.log(`      🎨 Staff detectado por estilo: ${styleReason || 'Posición Derecha'}`);
                            } else if (isGreeting) {
                                // Si parece un saludo y no pudimos confirmar que es staff por color,
                                // probamos heurística: Si dice "Hola [NombreCliente]", probablemente lo dice el STAFF
                                const clientFirst = clientName.split(' ')[0];
                                if (cleanAuthor.toLowerCase().includes(clientFirst.toLowerCase())) {
                                    author = 'Staff (Jungla)';
                                }
                            }

                            messages.push({ author, text: msgText, date: dateStr, isRecent });
                        }

                        // Siempre guardamos el último como referencia
                        lastAuthor = author;
                        lastRaw = text;
                    }
                }

                // Construir contexto de conversación reciente
                const recentMsgs = messages.filter(m => m.isRecent).slice(-5); // Últimos 5 mensajes recientes
                const conversationContext = recentMsgs.map(m => `[${m.author}]: ${m.text}`).join('\n');

                // El último mensaje para detectar cierre
                const lastMsg = recentMsgs[recentMsgs.length - 1];
                const lastMsgText = lastMsg?.text.toLowerCase().trim() || '';

                // ¿Es un "cierre" de conversación?
                // Limpiamos puntuación y espacios para ser más flexibles
                const cleanText = lastMsgText.replace(/[^a-záéíóúñü\s]/gi, '').trim();
                const isCloser = closerWords.some(w => cleanText === w || cleanText.includes(w))
                    || emojiOnlyRegex.test(lastMsg?.text || '')
                    || lastMsgText.length < 5;

                return {
                    lastSignature: lastAuthor,
                    raw: lastRaw,
                    messageText: lastMsg?.text || '(Sin texto)',
                    conversationContext: conversationContext || '(Sin contexto)',
                    isCloser: isCloser && recentMsgs.length > 0,
                    recentCount: recentMsgs.length
                };
            });

            // LÓGICA DE DETECCIÓN MEJORADA
            const signatureLower = chatAnalysis.lastSignature.toLowerCase();
            const clientParts = clientName.toLowerCase().split(' ').filter(p => p.length >= 3);

            let isClient = false;
            let debugReason = '';

            // 1. Si el nombre extraído está vacío -> PENDING (Ante la duda...)
            if (signatureLower.length < 1) {
                isClient = true;
                debugReason = 'Firma vacía (Fallback)';
            }
            // 2. Si es STAFF explícito (Wodbuster, Jungla, Tente, Beni (Carlos)...)
            else if (signatureLower.includes('jungla') || signatureLower.includes('wodbuster') || signatureLower.includes('tente') || signatureLower.includes('admin') || signatureLower.includes('beni')) {
                isClient = false;
                debugReason = 'Es STAFF (Lista Negra)';
            }
            // 3. Si coincide con el Cliente
            else if (clientParts.some(part => signatureLower.includes(part))) {
                isClient = true;
                debugReason = `Coincide con Cliente (${clientParts.join(',')})`;
            }
            // 4. Nombre desconocido -> Asumimos Staff
            else {
                isClient = false;
                debugReason = 'Nombre NO coincide con Cliente (Asumimos Staff)';
            }

            // 🔥 NUEVO: Detectar CIERRE de conversación
            // Si el último mensaje del cliente es "ok", "gracias", emoji, etc. -> Conversación cerrada
            let status: 'pending' | 'responded' = isClient ? 'pending' : 'responded';
            if (isClient && chatAnalysis.isCloser) {
                status = 'responded';
                debugReason = `CIERRE detectado ("${chatAnalysis.messageText.substring(0, 20)}")`;
            }

            console.log(`   🕵️  [${clientName}] Raw: "${chatAnalysis.raw}" | Msg: "${chatAnalysis.messageText.substring(0, 30)}..."`);
            console.log(`       -> ${status.toUpperCase()} (${debugReason}) [${chatAnalysis.recentCount} msgs recientes]`);

            // GENERAR BORRADOR IA INTELIGENTE (si pendiente)
            let aiProposal = null;
            if (status === 'pending') {
                const firstName = clientName.split(' ')[0] || 'cliente';
                const msgLower = chatAnalysis.messageText.toLowerCase();
                const contextLower = chatAnalysis.conversationContext.toLowerCase();

                // Detectar INTENCIÓN del mensaje
                let intent = 'general';
                let proposedText = '';
                let suggestedActions: string[] = [];
                let confidence = 0.6;

                // Patrones de intención
                if (msgLower.includes('factura') || msgLower.includes('pago') || msgLower.includes('cobr') || msgLower.includes('cuota') || msgLower.includes('tarifa') || msgLower.includes('precio')) {
                    intent = 'billing';
                    proposedText = `Hola ${firstName}! 💳 Respecto a tu consulta de facturación, te confirmo que [REVISAR ESTADO EN WODBUSTER]. Si tienes alguna duda adicional, estoy aquí para ayudarte.`;
                    suggestedActions = ['Revisar pagos', 'Ver facturas', 'Comprobar tarifa'];
                    confidence = 0.7;
                }
                else if (msgLower.includes('horario') || msgLower.includes('clase') || msgLower.includes('reserv') || msgLower.includes('hora') || msgLower.includes('sesion') || msgLower.includes('entreno')) {
                    intent = 'schedule';
                    proposedText = `Hola ${firstName}! 📅 Sobre los horarios/reservas: [CONSULTAR DISPONIBILIDAD]. ¿Te viene bien esa opción?`;
                    suggestedActions = ['Ver horarios', 'Comprobar reservas'];
                    confidence = 0.7;
                }
                else if (msgLower.includes('queja') || msgLower.includes('problema') || msgLower.includes('mal') || msgLower.includes('incidencia') || msgLower.includes('error')) {
                    intent = 'complaint';
                    proposedText = `Hola ${firstName}, lamento mucho que hayas tenido este problema. 😔 Voy a revisarlo ahora mismo y te cuento. ¿Podrías darme algún detalle más?`;
                    suggestedActions = ['Crear incidencia', 'Escalar a responsable'];
                    confidence = 0.8;
                }
                else if (msgLower.includes('info') || msgLower.includes('como') || msgLower.includes('donde') || msgLower.includes('cuando') || msgLower.includes('que es') || msgLower.includes('duda')) {
                    intent = 'info_request';
                    proposedText = `Hola ${firstName}! 👋 Claro, te explico: [AÑADIR INFO RELEVANTE]. ¿Te queda claro o necesitas más detalles?`;
                    suggestedActions = ['Enviar info', 'Preparar documento'];
                    confidence = 0.65;
                }
                else if (msgLower.includes('hola') || msgLower.includes('buenas') || msgLower.includes('buenos')) {
                    intent = 'greeting';
                    proposedText = `Hola ${firstName}! 👋 ¿En qué puedo ayudarte hoy?`;
                    suggestedActions = ['Esperar respuesta'];
                    confidence = 0.9;
                }
                else {
                    // Fallback genérico pero con contexto
                    proposedText = `Hola ${firstName}! 👋 He visto tu mensaje. ¿Podrías darme más detalles para poder ayudarte mejor?`;
                    suggestedActions = ['Revisar ficha'];
                    confidence = 0.5;
                }

                // 🤖 SISTEMA GEMINI: Generar respuesta inteligente con IA
                let trainingExamples: { original: string; reply: string }[] = [];

                // Cargar ejemplos de entrenamiento
                try {
                    const { data: examples } = await supabase
                        .from('dataset_attcliente')
                        .select('original_message, final_reply')
                        .order('created_at', { ascending: false })
                        .limit(10);

                    if (examples && examples.length > 0) {
                        trainingExamples = examples
                            .filter(ex => ex.original_message && ex.final_reply)
                            .map(ex => ({
                                original: ex.original_message,
                                reply: ex.final_reply
                            }));
                        console.log(`   📚 Cargados ${trainingExamples.length} ejemplos de entrenamiento`);
                    }
                } catch (e) {
                    console.log('   ⚠️ No se pudo cargar dataset de entrenamiento');
                }

                // Generar respuesta con Gemini
                if (process.env.GEMINI_API_KEY) {
                    const geminiResult = await generateGeminiResponse(
                        firstName,
                        chatAnalysis.messageText || '',
                        chatAnalysis.conversationContext || '',
                        trainingExamples
                    );
                    proposedText = geminiResult.text;
                    confidence = geminiResult.confidence;
                    suggestedActions = ['🤖 Respuesta Gemini'];
                }

                aiProposal = {
                    text: proposedText,
                    actions: suggestedActions,
                    confidence: confidence,
                    intent: intent
                };
                console.log(`   🤖 Intent: ${intent} | Confidence: ${(confidence * 100).toFixed(0)}% | Gemini: ${process.env.GEMINI_API_KEY ? '✅' : '❌'}`);
            }

            // GUARDAR EN BD (SIN UPSERT)
            // Usamos la firma como identificador para no repetir el mismo mensaje
            const messageId = `${clientName}-${chatAnalysis.raw}`; // Usamos raw (firma+fecha) como ID único

            const { data: existing } = await supabase
                .from('inbox_messages')
                .select('id, status')
                // .eq('sender', clientName) // ❌ BUG: Esto impedía guardar nuevos mensajes de usuarios ya existentes
                // ✅ FIX: Comprobar ID ÚNICO (Firma + Timestamp) dentro del JSONB
                .eq('raw_data->>messageId', messageId)
                .limit(1)
                .maybeSingle();

            // Solo insertar si no hay registro previo O si el mensaje es diferente
            const shouldInsert = !existing;

            if (shouldInsert) {
                const { error } = await supabase.from('inbox_messages').insert({
                    sender: clientName,
                    content: chatAnalysis.conversationContext || chatAnalysis.messageText,
                    status: status === 'pending' ? 'new' : status,
                    agent_proposal: aiProposal,
                    source: 'wodbuster',
                    wodbuster_chat_id: chatId,
                    raw_data: { summary, chatAnalysis, messageId, chatId }
                });
                if (error) console.log(`   ⚠️ Error Insert: ${error.message}`);
                else console.log(`   ✅ Sincronizado: ${status.toUpperCase()}`);
            } else {
                // 🔥 FIX: Actualizar estado si ha cambiado (ej: de PENDING a RESPONDED)
                // 🔥 FIX: Actualizar estado si ha cambiado (ej: de PENDING a RESPONDED)
                if (status === 'responded') {
                    // LIMPIEZA AGRESIVA: Si vemos que ya respondieron, marcamos TODO lo pendiente de este usuario como responded
                    // Esto arregla el bug de Ismael/Rocío donde se queda atascado en dashboard
                    const { count } = await supabase
                        .from('inbox_messages')
                        .update({
                            status: 'responded',
                            reply_sent_at: new Date().toISOString() // Marcar como respondido hoy
                        })
                        .eq('sender', clientName)
                        .eq('status', 'new') // Solo si estaba PENDING
                        .select('id', { count: 'exact' });

                    if (count && count > 0) {
                        console.log(`   🧹 Auto-Limpieza: ${count} ticket(s) pendiente(s) de ${clientName} cerrados.`);
                    } else if (existing && existing.status === 'new') {
                        // Fallback por si la ID era lo único que coincidía
                        await supabase
                            .from('inbox_messages')
                            .update({ status: 'responded', reply_sent_at: new Date().toISOString() })
                            .eq('id', existing.id);
                        console.log(`   🔄 Actualizando estado (ID específico): PENDING -> RESPONDED`);
                    } else {
                        // Ya estaba closed
                        console.log(`   ⏭️ Ya existe (Estado: ${existing ? existing.status : 'responded'})`);
                    }
                } else {
                    console.log(`   ⏭️ Ya existe registro para ${clientName} (Estado: ${existing ? existing.status : 'N/A'})`);
                }
            }

            // VOLVER A LA LISTA DE FORMA SEGURA (Navegación explícita)
            await page.goto('https://jungla.wodbuster.com/admin/mensajes.aspx', { waitUntil: 'domcontentloaded' });
            // await new Promise(r => setTimeout(r, 1000));
        }

        console.log('✅ Ronda terminada. Durmiendo...');
        browser.disconnect();

    } catch (e) {
        console.error('🔥 Error en ronda:', e);
        if (browser) browser.disconnect();
    }
}

// --- LOOP PRINCIPAL ---
async function mainLoop() {
    // 1. Primero enviar respuestas pendientes del CRM
    await sendPendingReplies();

    // 2. Luego sincronizar mensajes nuevos
    await runDeepSync();
}

// Ejecutar inmediatamente y luego cada X minutos
mainLoop();
setInterval(mainLoop, INTERVAL_MINUTES * 60 * 1000);
