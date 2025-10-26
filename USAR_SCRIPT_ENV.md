# 🚀 USAR SCRIPT PARA IMPORTAR VARIABLES A NETLIFY

## ⚡ Opción Rápida (Recomendada)

En lugar de configurar manualmente en Netlify Dashboard, usa este script que lo hace todo automáticamente desde la terminal.

---

## 📋 Requisitos

1. ✅ Tener `.env` en la raíz del proyecto con tus variables
2. ✅ Tener `netlify-cli` instalado
3. ✅ Estar autenticado en Netlify

---

## 🔐 Paso 1: Verificar que tienes `.env`

```bash
cat /Users/user/Desktop/jungla-iberica/.env
```

Deberías ver algo como:

```env
ANTHROPIC_API_KEY=sk-ant-v0c...
VITE_SUPABASE_URL=https://gfnjlmfziczimaohgkct.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔑 Paso 2: Verificar que estás autenticado en Netlify

```bash
netlify status
```

Si ves tu sitio, estás autenticado. Si no, ejecuta:

```bash
netlify login
```

---

## ✨ Paso 3: Ejecutar el Script

```bash
cd /Users/user/Desktop/jungla-iberica
node scripts/deploy-env-to-netlify.js
```

---

## 📊 Qué Hace el Script

1. ✅ Lee el archivo `.env`
2. ✅ Verifica que Netlify CLI está instalado
3. ✅ Verifica que estás autenticado
4. ✅ Obtiene tu site ID
5. ✅ Configura cada variable en Netlify
6. ✅ Verifica que se configuraron correctamente
7. ✅ Redeploy automático

---

## 🎯 Salida Esperada

Deberías ver algo como:

```
╔════════════════════════════════════════════════════════════╗
║  🚀 Importar Variables de Entorno a Netlify                ║
╚════════════════════════════════════════════════════════════╝

ℹ️  Leyendo archivo .env desde: /Users/user/Desktop/jungla-iberica/.env

📋 Variables encontradas en .env:

   ANTHROPIC_API_KEY: sk-ant-v0c...
   VITE_SUPABASE_URL: https://gfnjlmfz...
   VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiI...

🔍 Verificando Netlify CLI...
✅ Netlify CLI está instalado

🔐 Verificando autenticación en Netlify...
✅ Autenticado en Netlify

🔎 Buscando site ID...
✅ Site ID encontrado: abc123def456

⚙️  Configurando variables en Netlify...
✅ Variable configurada: ANTHROPIC_API_KEY
✅ Variable configurada: VITE_SUPABASE_URL
✅ Variable configurada: VITE_SUPABASE_ANON_KEY

✅ Verificando variables en Netlify...

📊 Variables configuradas en Netlify:

   ANTHROPIC_API_KEY: sk-ant-v0c...
   VITE_SUPABASE_URL: https://gfnjlmfz...
   VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiI...

🔄 Redesplegando sitio con nuevas variables...

╔════════════════════════════════════════════════════════════╗
║  ✅ PROCESO COMPLETADO                                     ║
╚════════════════════════════════════════════════════════════╝

Variables configuradas: 3

📝 Próximos pasos:
1. Verifica que todas las variables están en Netlify Dashboard
2. Espera a que el deploy se complete
3. Prueba la app en https://lajungla-crm.netlify.app
4. Intenta grabar una reunión para verificar que funciona

🎉 ¡Listo! Las variables de entorno están configuradas en Netlify
```

---

## 🧪 Verificar que Funcionó

### Opción 1: Desde Netlify Dashboard

1. Ve a https://app.netlify.com/sites/lajungla-crm/settings/build
2. Haz clic en "Environment"
3. Deberías ver tus 3 variables configuradas

### Opción 2: Desde la Terminal

```bash
netlify env:list
```

Deberías ver tus variables listadas.

### Opción 3: Probar la App

1. Ve a https://lajungla-crm.netlify.app
2. Haz clic en "Reuniones"
3. Intenta grabar una reunión
4. Si funciona, ¡está todo bien!

---

## 🐛 Troubleshooting

### Error: "No se encontró archivo .env"

**Solución:**
```bash
# Verifica que el archivo existe
ls -la /Users/user/Desktop/jungla-iberica/.env

# Si no existe, créalo con tus variables
cat > /Users/user/Desktop/jungla-iberica/.env << EOF
ANTHROPIC_API_KEY=sk-ant-...
VITE_SUPABASE_URL=https://gfnjlmfziczimaohgkct.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
```

### Error: "Netlify CLI no está instalado"

**Solución:**
```bash
npm install -g netlify-cli
```

### Error: "No estás autenticado en Netlify"

**Solución:**
```bash
netlify login
```

### Error: "No se pudo obtener el site ID"

**Solución:**
1. Verifica que estás en la carpeta correcta
2. Verifica que estás autenticado
3. Intenta: `netlify status`

---

## 📝 Resumen

| Paso | Comando |
|------|---------|
| 1 | `cd /Users/user/Desktop/jungla-iberica` |
| 2 | `netlify login` (si no estás autenticado) |
| 3 | `node scripts/deploy-env-to-netlify.js` |
| 4 | ¡Espera a que termine! |
| 5 | Verifica en https://lajungla-crm.netlify.app |

---

## ✅ Checklist

- [ ] Tengo `.env` en la raíz del proyecto
- [ ] Tengo `netlify-cli` instalado
- [ ] Estoy autenticado en Netlify
- [ ] Ejecuté el script
- [ ] El script completó sin errores
- [ ] Verifiqué que las variables están en Netlify
- [ ] Probé la app y funciona

---

## 🎉 ¡Listo!

Tus variables de entorno están configuradas en Netlify desde la terminal. ¡Mucho más rápido que hacerlo manualmente! 🚀
