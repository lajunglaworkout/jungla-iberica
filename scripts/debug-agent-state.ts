
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno manualmente porque estamos fuera del flujo normal
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
    console.error('❌ Faltan variables de entorno (.env).');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);

async function runDebug() {
    console.log('🦍 --- INICIANDO DIAGNÓSTICO JUNGLE ---');

    // 1. Verificar Estructura
    console.log('\n🔍 1. Inspeccionando estructura de inbox_messages...');
    const { data: messages, error } = await supabase
        .from('inbox_messages')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Error Supabase:', error);
    } else {
        if (messages && messages.length > 0) {
            console.log('   ✅ Estructura detectada (claves):', Object.keys(messages[0]));
            console.log('   📄 Ejemplo:', messages[0]);
        } else {
            console.log('   ⚠️ Tabla vacía.');
        }
    }

    // 2. Verificar API Gemini
    console.log('\n🧠 2. Probando conexión con Gemini...');
    try {
        // Intentar listar modelos (si la API lo permite)
        // Nota: La librería JS no expone listModels fácilmente en todas las versiones, probamos generación directa.
        const modelName = 'gemini-1.5-flash';
        console.log(`   👉 Intentando modelo por defecto: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hola, esto es una prueba. ¿Estás vivo?");
        console.log(`   ✅ GÉMINIS VIVO. Respuesta: ${result.response.text()}`);
    } catch (e: any) {
        console.error(`   ❌ Error Gemini (${e.message})`);

        // Intentar listar modelos manualmente con REST si falla la librería
        console.log('   🕵️  Intentando listar modelos vía REST...');
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
            const data = await response.json();
            console.log('   📜 Modelos Disponibles (API):', JSON.stringify(data, null, 2));
        } catch (restError) {
            console.error('   ❌ Error al listar modelos vía REST:', restError);
        }
    }

    // 3. Verificar Tabla Snapshots
    console.log('\n📊 3. Verificando tabla wodbuster_snapshots...');
    const { error: snapError } = await supabase.from('wodbuster_snapshots').select('count', { count: 'exact', head: true });
    if (snapError) {
        console.error('   ❌ La tabla NO parece existir o no es accesible:', snapError.message);
    } else {
        console.log('   ✅ La tabla existe.');
    }
}

runDebug();
