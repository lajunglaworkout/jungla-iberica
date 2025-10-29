# 🔐 PASOS FINALES - CONFIGURAR VARIABLES EN NETLIFY

## 📊 Estado Actual

✅ **Ya Configurado:**
- `NODE_VERSION` = 18

❌ **Falta Configurar:**
- `ANTHROPIC_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🎯 Opción 1: Configurar desde Terminal (Recomendado)

### Paso 1: Obtener tu API Key de Anthropic

1. Ve a https://console.anthropic.com
2. Inicia sesión
3. Ve a "API keys"
4. Copia tu API key (empieza con `sk-ant-`)

### Paso 2: Configurar variables en Netlify

Ejecuta estos comandos en la terminal:

```bash
cd /Users/user/Desktop/jungla-iberica

# Variable 1: ANTHROPIC_API_KEY
npx netlify env:set ANTHROPIC_API_KEY "sk-ant-v0c..." 

# Variable 2: VITE_SUPABASE_URL
npx netlify env:set VITE_SUPABASE_URL "https://gfnjlmfziczimaohgkct.supabase.co"

# Variable 3: VITE_SUPABASE_ANON_KEY
npx netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbmpsbWZ6aWN6aW1hb2hna2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc0NjgsImV4cCI6MjA2OTcxMzQ2OH0.1hn6Tse7FI58VA90kU2YXiweNesa8Ndrl0w9qKixph0"
```

### Paso 3: Verificar que se configuraron

```bash
npx netlify env:list
```

Deberías ver las 3 variables listadas.

---

## 🎯 Opción 2: Configurar desde Netlify Dashboard

Si prefieres hacerlo manualmente:

1. Ve a https://app.netlify.com/sites/lajungla-crm/settings/build
2. Haz clic en "Environment"
3. Haz clic en "Edit variables"
4. Añade las 3 variables (ver valores arriba)
5. Haz clic en "Save"

---

## 🔄 Paso 4: Redeploy

Después de configurar las variables, redeploy:

```bash
npx netlify deploy --prod
```

O desde Netlify Dashboard:
1. Ve a "Deploys"
2. Haz clic en "Trigger deploy"
3. Selecciona "Deploy site"

---

## 🧪 Paso 5: Probar que Funciona

1. Ve a https://lajungla-crm.netlify.app
2. Haz clic en "Reuniones"
3. Haz clic en "Nueva Reunión"
4. Intenta grabar algo
5. Si funciona, ¡está todo bien!

---

## 📝 Valores de Variables

### ANTHROPIC_API_KEY
```
Obtén en: https://console.anthropic.com
Empieza con: sk-ant-
```

### VITE_SUPABASE_URL
```
https://gfnjlmfziczimaohgkct.supabase.co
```

### VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbmpsbWZ6aWN6aW1hb2hna2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc0NjgsImV4cCI6MjA2OTcxMzQ2OH0.1hn6Tse7FI58VA90kU2YXiweNesa8Ndrl0w9qKixph0
```

---

## ✅ Checklist

- [ ] Obtuve mi API Key de Anthropic
- [ ] Configuré ANTHROPIC_API_KEY en Netlify
- [ ] Configuré VITE_SUPABASE_URL en Netlify
- [ ] Configuré VITE_SUPABASE_ANON_KEY en Netlify
- [ ] Verifiqué que las 3 variables están en Netlify
- [ ] Hice redeploy
- [ ] Probé la app en https://lajungla-crm.netlify.app
- [ ] Grabé una reunión de prueba
- [ ] La transcripción funcionó

---

## 🎉 ¡Listo!

Una vez que configures las variables, tu app estará lista para:
- ✅ Grabar reuniones
- ✅ Transcribir automáticamente
- ✅ Generar actas
- ✅ Asignar tareas

¡Éxito! 🚀
