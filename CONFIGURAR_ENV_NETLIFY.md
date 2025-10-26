# 🔐 CONFIGURAR VARIABLES DE ENTORNO EN NETLIFY

## 📋 Paso 1: Acceder a Netlify Dashboard

1. Ve a https://app.netlify.com
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto **lajungla-crm**

---

## ⚙️ Paso 2: Ir a Site Settings

1. Haz clic en **"Site settings"** (arriba a la derecha)
2. O ve a: https://app.netlify.com/sites/lajungla-crm/settings/general

---

## 🔑 Paso 3: Acceder a Variables de Entorno

1. En el menú izquierdo, haz clic en **"Build & deploy"**
2. Luego haz clic en **"Environment"**
3. Verás una sección que dice **"Environment variables"**

---

## ✏️ Paso 4: Añadir Variables

### 4.1 Haz clic en "Edit variables"

Verás un botón para editar las variables.

### 4.2 Añade estas 3 variables:

#### Variable 1: ANTHROPIC_API_KEY

```
Key:   ANTHROPIC_API_KEY
Value: sk-ant-v0c...  (tu API key de Anthropic)
```

**Cómo obtener tu API Key:**
1. Ve a https://console.anthropic.com
2. Inicia sesión
3. Ve a "API keys"
4. Copia tu API key

#### Variable 2: VITE_SUPABASE_URL

```
Key:   VITE_SUPABASE_URL
Value: https://gfnjlmfziczimaohgkct.supabase.co
```

#### Variable 3: VITE_SUPABASE_ANON_KEY

```
Key:   VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbmpsbWZ6aWN6aW1hb2hna2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc0NjgsImV4cCI6MjA2OTcxMzQ2OH0.1hn6Tse7FI58VA90kU2YXiweNesa8Ndrl0w9qKixph0
```

---

## 📸 Interfaz Visual

La pantalla se verá así:

```
┌─────────────────────────────────────────────────────┐
│ Environment variables                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Key                    │ Value                      │
│ ─────────────────────────────────────────────────── │
│ ANTHROPIC_API_KEY      │ sk-ant-v0c...             │
│ VITE_SUPABASE_URL      │ https://gfnjlmfz...       │
│ VITE_SUPABASE_ANON_KEY │ eyJhbGciOiJIUzI1NiIs...   │
│                                                     │
│ [Save]  [Cancel]                                   │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Paso 5: Guardar Cambios

1. Haz clic en **"Save"**
2. Verás un mensaje de confirmación
3. Netlify redesplegará automáticamente con las nuevas variables

---

## 🔍 Paso 6: Verificar que Está Configurado

### 6.1 Ver las variables guardadas

1. Ve a Site settings → Build & deploy → Environment
2. Deberías ver las 3 variables listadas

### 6.2 Verificar que el deploy usó las variables

1. Ve a **"Deploys"**
2. Haz clic en el deploy más reciente
3. Ve a **"Deploy log"**
4. Busca líneas como:
   ```
   Environment variables loaded
   ANTHROPIC_API_KEY: ••••••••
   VITE_SUPABASE_URL: https://gfnjlmfz...
   ```

---

## 🧪 Paso 7: Probar que Funciona

### 7.1 Ir a la app

1. Ve a https://lajungla-crm.netlify.app
2. Haz clic en **"Reuniones"**
3. Intenta grabar una reunión

### 7.2 Verificar que la transcripción funciona

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **"Console"**
3. Deberías ver logs como:
   ```
   📝 Iniciando transcripción via backend...
   ✅ Transcripción completada
   ```

### 7.3 Ver logs de las functions

1. Ve a https://app.netlify.com/projects/lajungla-crm/logs/functions
2. Deberías ver logs de las functions siendo ejecutadas
3. Si hay errores, aparecerán aquí

---

## 🐛 Troubleshooting

### Error: "ANTHROPIC_API_KEY is not defined"

**Solución:**
1. Verifica que la variable está en Site settings → Environment
2. Verifica que el nombre es exactamente `ANTHROPIC_API_KEY` (sin espacios)
3. Redeploy: Ve a Deploys y haz clic en "Trigger deploy"

### Error: "Cannot transcribe"

**Solución:**
1. Verifica que tu API key de Anthropic es válida
2. Ve a https://console.anthropic.com y verifica que tienes créditos
3. Verifica los logs en https://app.netlify.com/projects/lajungla-crm/logs/functions

### Error: "Supabase connection failed"

**Solución:**
1. Verifica que `VITE_SUPABASE_URL` es correcto
2. Verifica que `VITE_SUPABASE_ANON_KEY` es correcto
3. Prueba la conexión en https://lajungla-crm.netlify.app (deberías ver datos cargados)

---

## 📊 Checklist Final

- [ ] Accedí a Netlify Dashboard
- [ ] Fui a Site settings → Build & deploy → Environment
- [ ] Añadí `ANTHROPIC_API_KEY`
- [ ] Añadí `VITE_SUPABASE_URL`
- [ ] Añadí `VITE_SUPABASE_ANON_KEY`
- [ ] Hice clic en "Save"
- [ ] Esperé a que se redesplegara
- [ ] Probé la app en https://lajungla-crm.netlify.app
- [ ] Grabé una reunión de prueba
- [ ] La transcripción funcionó correctamente

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- Nunca compartas tus API keys
- Las variables de entorno en Netlify están encriptadas
- No las commits en Git
- Si alguien ve tu API key, cámbiala inmediatamente

---

## 📞 URLs Útiles

- **Netlify Dashboard**: https://app.netlify.com
- **Tu Proyecto**: https://app.netlify.com/sites/lajungla-crm
- **Environment Settings**: https://app.netlify.com/sites/lajungla-crm/settings/build
- **Function Logs**: https://app.netlify.com/projects/lajungla-crm/logs/functions
- **Anthropic Console**: https://console.anthropic.com
- **Supabase Dashboard**: https://app.supabase.com

---

## ✨ Una vez configurado

Todas las funcionalidades estarán disponibles:

✅ Grabar reuniones
✅ Transcribir audio automáticamente
✅ Generar actas profesionales
✅ Extraer tareas automáticamente
✅ Asignar tareas a empleados
✅ Guardar todo en Supabase

¡Listo! 🚀
