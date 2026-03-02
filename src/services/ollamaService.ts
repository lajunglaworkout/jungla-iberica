/**
 * Ollama Local AI Service
 *
 * Integración con modelos locales instalados:
 *   - qwen2.5:14b          (primario — excelente en español, ideal para actas)
 *   - deepseek-coder-v2    (fallback — orientado a código pero funciona para texto)
 *
 * Ollama corre en http://localhost:11434
 *
 * IMPORTANTE — CORS EN PRODUCCIÓN (Netlify):
 * El navegador del usuario llama a su Ollama local. Para que funcione desde
 * https://jungla-iberica.netlify.app hay que configurar Ollama una vez:
 *
 * Windows (PowerShell como admin):
 *   [System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS','*','Machine')
 *   Restart-Service -Name ollama    # o reiniciar Ollama manualmente
 *
 * O arrancar Ollama con:
 *   $env:OLLAMA_ORIGINS="*"; ollama serve
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';

// Modelos en orden de preferencia — qwen2.5:14b primero (el mejor instalado para actas en español)
const PREFERRED_MODELS = [
  'qwen2.5:14b',            // Instalado — excelente español, 14B parámetros
  'qwen2.5:7b',
  'qwen2.5:3b',
  'qwen:7b',
  'deepseek-coder-v2:latest', // Instalado — fallback (orientado a código)
  'deepseek-r1:14b',
  'deepseek-r1:7b',
  'deepseek-r1:1.5b',
  'llama3.1:8b',
  'mistral:7b',
];

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
}

/**
 * Comprueba si Ollama está corriendo localmente.
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Obtiene los modelos disponibles en Ollama.
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map((m: { name: string }) => m.name);
  } catch {
    return [];
  }
}

/**
 * Selecciona el mejor modelo disponible entre los instalados.
 */
export async function selectBestModel(): Promise<string | null> {
  const available = await getAvailableModels();
  if (available.length === 0) return null;

  for (const preferred of PREFERRED_MODELS) {
    const match = available.find(m => m === preferred || m.startsWith(preferred.split(':')[0]));
    if (match) return match;
  }

  // Si ninguno coincide, usar el primero disponible
  return available[0];
}

/**
 * Llama a Ollama con un prompt de chat.
 * Retorna el texto generado.
 */
export async function ollamaChat(
  messages: OllamaMessage[],
  model?: string,
  timeoutMs = 120000
): Promise<string> {
  const selectedModel = model || await selectBestModel();
  if (!selectedModel) {
    throw new Error('No hay modelos Ollama instalados. Ejecuta: ollama pull deepseek-r1:7b');
  }

  console.log(`🤖 Ollama: usando modelo "${selectedModel}"...`);

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      stream: false,
      options: {
        temperature: 0.3,   // Baja temperatura para respuestas consistentes y estructuradas
        num_ctx: 8192,       // Contexto amplio para transcripciones largas
      },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Ollama error ${res.status}: ${errText || res.statusText}`);
  }

  const data: OllamaChatResponse = await res.json();
  const content = data.message?.content || '';

  if (!content.trim()) {
    throw new Error('Ollama devolvió una respuesta vacía');
  }

  console.log(`✅ Ollama: respuesta recibida (${content.length} chars)`);
  return content.trim();
}

/**
 * Genera el acta de una reunión usando un modelo local.
 * Devuelve { minutes: string, tasks: Array }
 */
export async function generateActaWithOllama(params: {
  transcription: string;
  departmentName: string;
  date: string;
  participants?: string[];
  pendingTasks?: string;
  objectives?: string;
}): Promise<{ minutes: string; tasks: Record<string, unknown>[]; model: string }> {
  const { transcription, departmentName, date, participants = [], pendingTasks, objectives } = params;

  const systemPrompt = `Eres un asistente experto en redactar actas de reuniones empresariales en español.
Tu tarea es analizar la transcripción de una reunión y generar:
1. Un acta estructurada y profesional en formato Markdown
2. Una lista de tareas concretas con responsable y fecha límite

El acta debe tener las secciones: # Acta de Reunión, ## Resumen, ## Puntos Tratados, ## Decisiones Tomadas, ## Seguimiento de Objetivos (solo si hay objetivos), ## Próximos Pasos.
En la sección de Seguimiento de Objetivos, analiza los objetivos conseguidos/no conseguidos e identifica patrones o tendencias relevantes para la dirección.
Sé concreto y accionable. No inventes información que no esté en la transcripción ni en el contexto.`;

  const userPrompt = `Genera el acta de la siguiente reunión.

**Departamento:** ${departmentName}
**Fecha:** ${date}
**Participantes:** ${participants.join(', ') || 'No especificados'}
${objectives ? `**Contexto de objetivos:**\n${objectives}` : ''}
${pendingTasks ? `**Tareas pendientes de reunión anterior:**\n${pendingTasks}` : ''}

**TRANSCRIPCIÓN:**
${transcription}

---

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "minutes": "# Acta de Reunión\\n\\n**[contenido completo del acta en markdown]**",
  "tasks": [
    {
      "title": "Descripción concreta de la tarea",
      "assignedTo": "nombre o email del responsable (si no se menciona, pon 'Por asignar')",
      "deadline": "YYYY-MM-DD (una semana desde hoy si no se especifica)",
      "priority": "alta|media|baja"
    }
  ]
}

Solo extrae tareas que estén explícitamente mencionadas en la transcripción.`;

  const messages: OllamaMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const model = await selectBestModel();
  if (!model) throw new Error('No hay modelos Ollama disponibles');

  const raw = await ollamaChat(messages, model);

  // Extraer JSON de la respuesta (los modelos a veces añaden texto antes/después)
  let jsonStr = raw;

  // Eliminar bloques de pensamiento de deepseek-r1 (<think>...</think>)
  jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Buscar el JSON entre llaves
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Si no hay JSON, tratar la respuesta entera como el acta
    console.warn('⚠️ Ollama no devolvió JSON válido, usando respuesta como acta');
    return {
      minutes: raw,
      tasks: [],
      model,
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      minutes: parsed.minutes || raw,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      model,
    };
  } catch (e) {
    console.warn('⚠️ Error parseando JSON de Ollama, usando respuesta como acta:', e);
    return {
      minutes: raw,
      tasks: [],
      model,
    };
  }
}
