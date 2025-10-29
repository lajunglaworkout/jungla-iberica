# 🚀 DEPLOY A NETLIFY - GUÍA COMPLETA

## 📋 Requisitos

- Cuenta en Netlify (https://netlify.com)
- Git configurado
- Repositorio en GitHub/GitLab/Bitbucket

---

## 🔧 Paso 1: Preparar el Repositorio

### 1.1 Verificar que todo está en Git

```bash
git status
git add .
git commit -m "feat: sistema de grabación y transcripción de reuniones"
git push origin main
```

### 1.2 Verificar estructura

```
jungla-iberica/
├── src/
├── dist/
├── netlify/
│   └── functions/
│       ├── transcribe.ts
│       └── generate-minutes.ts
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── netlify.toml
└── package.json
```

---

## 🌐 Paso 2: Conectar Netlify

### 2.1 Ir a Netlify

1. Ve a https://app.netlify.com
2. Haz clic en "Add new site"
3. Selecciona "Import an existing project"
4. Elige tu proveedor de Git (GitHub, GitLab, Bitbucket)
5. Autoriza Netlify

### 2.2 Seleccionar el Repositorio

1. Busca y selecciona `jungla-iberica`
2. Haz clic en "Deploy site"

---

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 En Netlify Dashboard

1. Ve a tu sitio
2. Haz clic en "Site settings"
3. Ve a "Build & deploy" → "Environment"
4. Haz clic en "Edit variables"

### 3.2 Añadir Variables

Añade estas variables:

```
ANTHROPIC_API_KEY = sk-ant-...
VITE_SUPABASE_URL = https://gfnjlmfziczimaohgkct.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ANTHROPIC_API_KEY = sk-ant-...
VITE_GOOGLE_API_KEY = (opcional)
```

---

## 🏗️ Paso 4: Configuración del Build

El `netlify.toml` ya está configurado con:

```toml
[build]
  publish = "dist"
  command = "npm run build"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
```

---

## 🚀 Paso 5: Deploy

### 5.1 Trigger Manual

1. Ve a "Deploys"
2. Haz clic en "Trigger deploy"
3. Selecciona "Deploy site"

### 5.2 Deploy Automático

Cada vez que hagas `git push`, Netlify desplegará automáticamente.

---

## ✅ Verificar Deploy

### 6.1 Ver Logs

1. Ve a "Deploys"
2. Haz clic en el deploy más reciente
3. Ve a "Deploy log"

### 6.2 Probar Endpoints

```bash
# Verificar que las functions están disponibles
curl https://tu-sitio.netlify.app/.netlify/functions/transcribe

# Debería devolver un error 405 (Method Not Allowed) porque es GET
# Eso significa que la function está disponible
```

### 6.3 Probar la App

1. Ve a https://tu-sitio.netlify.app
2. Haz clic en "Reuniones"
3. Intenta grabar una reunión
4. Verifica que la transcripción funciona

---

## 🔧 Troubleshooting

### Error: "Functions not found"

**Solución**: 
1. Verifica que `netlify/functions/` existe
2. Verifica que `netlify.toml` tiene `functions = "netlify/functions"`
3. Redeploy

### Error: "ANTHROPIC_API_KEY is not defined"

**Solución**:
1. Ve a Site settings → Environment
2. Verifica que `ANTHROPIC_API_KEY` está configurado
3. Redeploy

### Error: "Cannot find module @anthropic-ai/sdk"

**Solución**:
1. Asegúrate de que `@anthropic-ai/sdk` está en `package.json`
2. Ejecuta `npm install`
3. Haz `git push`
4. Redeploy

### Error: "CORS policy"

**Solución**: Las Netlify Functions no tienen problemas de CORS, pero verifica que:
1. El endpoint es `/.netlify/functions/transcribe`
2. No hay errores en los logs

---

## 📊 Monitoreo

### 7.1 Ver Logs de Functions

1. Ve a "Functions"
2. Haz clic en la function
3. Ve los logs en tiempo real

### 7.2 Analítica

1. Ve a "Analytics"
2. Monitorea el uso de las functions

---

## 🔄 Actualizar Deploy

### 8.1 Hacer cambios

```bash
# Hacer cambios en el código
git add .
git commit -m "fix: mejorar transcripción"
git push origin main
```

### 8.2 Netlify desplegará automáticamente

Verifica en "Deploys" que el nuevo deploy está en progreso.

---

## 🎉 ¡Listo!

Tu app está en producción con:

- ✅ Frontend en Netlify
- ✅ Netlify Functions para transcripción
- ✅ Supabase para base de datos
- ✅ Anthropic API para IA

**URL**: https://tu-sitio.netlify.app

---

## 📝 Notas Importantes

1. **Costos**: Netlify Functions tienen límites gratuitos. Verifica los precios.
2. **Timeout**: Las functions tienen un timeout de 26 segundos. Para audios largos, considera aumentar el plan.
3. **Almacenamiento**: Las grabaciones se pueden guardar en Supabase Storage.
4. **Seguridad**: Nunca commits las API keys. Usa variables de entorno.

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en Netlify Dashboard
2. Verifica que todas las variables de entorno están configuradas
3. Comprueba que el repositorio está actualizado
4. Contacta con Netlify Support

¡Éxito con tu deploy! 🚀
