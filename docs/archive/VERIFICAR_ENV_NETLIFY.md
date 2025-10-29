# ✅ VERIFICAR VARIABLES DE ENTORNO EN NETLIFY

## 🎯 Acceso Directo

### Opción 1: Link Directo (MÁS RÁPIDO)

Copia y pega esta URL en tu navegador:

```
https://app.netlify.com/sites/lajungla-crm/settings/build
```

Luego:
1. Haz scroll hasta encontrar **"Environment"**
2. Haz clic en **"Edit variables"**

---

### Opción 2: Paso a Paso

1. Ve a https://app.netlify.com
2. Haz clic en **"lajungla-crm"** (tu proyecto)
3. Haz clic en **"Site settings"** (arriba a la derecha)
4. En el menú izquierdo, haz clic en **"Build & deploy"**
5. Haz clic en **"Environment"**

---

## 📋 Variables que Debes Ver

Cuando hagas clic en "Edit variables", deberías ver una tabla como esta:

```
┌──────────────────────────┬─────────────────────────────────────────┐
│ Key                      │ Value                                   │
├──────────────────────────┼─────────────────────────────────────────┤
│ ANTHROPIC_API_KEY        │ sk-ant-v0c... (oculto por seguridad)   │
│ VITE_SUPABASE_URL        │ https://gfnjlmfziczimaohgkct.supabase.co│
│ VITE_SUPABASE_ANON_KEY   │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
└──────────────────────────┴─────────────────────────────────────────┘
```

---

## ✨ Si NO Ves las Variables

### Paso 1: Añadir ANTHROPIC_API_KEY

1. Haz clic en **"Edit variables"**
2. Haz clic en **"Add a variable"** (o el botón +)
3. Rellena:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: Tu API key de Anthropic (obtén en https://console.anthropic.com)
4. Haz clic en **"Save"**

### Paso 2: Añadir VITE_SUPABASE_URL

1. Haz clic en **"Add a variable"**
2. Rellena:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: `https://gfnjlmfziczimaohgkct.supabase.co`
3. Haz clic en **"Save"**

### Paso 3: Añadir VITE_SUPABASE_ANON_KEY

1. Haz clic en **"Add a variable"**
2. Rellena:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbmpsbWZ6aWN6aW1hb2hna2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc0NjgsImV4cCI6MjA2OTcxMzQ2OH0.1hn6Tse7FI58VA90kU2YXiweNesa8Ndrl0w9qKixph0`
3. Haz clic en **"Save"**

---

## 🔄 Después de Guardar

Netlify redesplegará automáticamente. Verás:

1. Un banner azul diciendo **"Deploy in progress"**
2. Después de 1-2 minutos, **"Deploy complete"**
3. Tu app estará actualizada con las nuevas variables

---

## 🧪 Probar que Funciona

### Opción 1: Desde la App

1. Ve a https://lajungla-crm.netlify.app
2. Haz clic en **"Reuniones"**
3. Haz clic en **"Nueva Reunión"**
4. Intenta grabar algo
5. Si funciona, ¡las variables están bien configuradas!

### Opción 2: Ver Logs

1. Ve a https://app.netlify.com/projects/lajungla-crm/logs/functions
2. Haz clic en **"transcribe"** o **"generate-minutes"**
3. Deberías ver logs de las functions ejecutándose
4. Si hay errores, aparecerán aquí

---

## 📊 Checklist Rápido

- [ ] Fui a https://app.netlify.com/sites/lajungla-crm/settings/build
- [ ] Hice clic en "Edit variables"
- [ ] Veo 3 variables configuradas
- [ ] Volví a https://lajungla-crm.netlify.app
- [ ] Probé grabar una reunión
- [ ] La transcripción funcionó

---

## 🆘 Si Algo No Funciona

### Problema: No veo las variables

**Solución:**
1. Recarga la página (Cmd+R en Mac, Ctrl+R en Windows)
2. Verifica que estés en el proyecto correcto (lajungla-crm)
3. Verifica que iniciaste sesión en Netlify

### Problema: La transcripción no funciona

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes de error
4. Copia el error y búscalo en los logs de Netlify

### Problema: Dice "ANTHROPIC_API_KEY is not defined"

**Solución:**
1. Verifica que la variable está en Netlify
2. Verifica que el nombre es exactamente `ANTHROPIC_API_KEY`
3. Verifica que tu API key es válida (no está expirada)
4. Redeploy: Ve a Deploys y haz clic en "Trigger deploy"

---

## 📞 Contacto

Si necesitas ayuda:
1. Revisa los logs en https://app.netlify.com/projects/lajungla-crm/logs/functions
2. Verifica que todas las variables están configuradas
3. Intenta redeploy manualmente

¡Listo! 🚀
