# 🚀 GUÍA DE DEPLOYMENT - LA JUNGLA WORKOUT CRM
**Fecha:** 17 de Noviembre de 2025  
**Versión:** 1.0

---

## ✅ BACKUP COMPLETADO

### 📦 Backup Creado
- **Archivo:** `jungla-iberica-backup-20251117_082912.tar.gz`
- **Ubicación:** `/Users/user/Desktop/`
- **Contenido:** Código fuente completo (sin node_modules, dist, .git)
- **Tamaño:** ~50MB (estimado)

### 📋 Qué incluye el backup:
- ✅ Todo el código fuente
- ✅ Configuración de Netlify
- ✅ Documentación completa
- ✅ Scripts de base de datos
- ✅ Archivos de configuración

### 🔄 Cómo restaurar el backup:
```bash
cd /Users/user/Desktop
tar -xzf jungla-iberica-backup-20251117_082912.tar.gz
cd jungla-iberica
npm install
```

---

## 🌐 DEPLOYMENT EN NETLIFY

### ✅ BUILD LOCAL COMPLETADO
- **Estado:** ✅ Exitoso
- **Tiempo:** 27.83s
- **Tamaño:** 3.6 MB (JS + CSS)
- **Carpeta:** `dist/`

### ⚠️ ADVERTENCIA
El bundle JS es grande (3.4 MB). Esto es normal para una aplicación completa, pero considera:
- Code splitting en futuras versiones
- Lazy loading de módulos
- Optimización de dependencias

---

## 📝 OPCIONES DE DEPLOYMENT

### **OPCIÓN 1: Deployment Manual (Recomendado para primera vez)**

#### Paso 1: Preparar el proyecto
```bash
cd /Users/user/Desktop/jungla-iberica

# Asegurarse de que todo está commiteado
git add -A
git commit -m "Preparar para deployment en Netlify"
git push origin main
```

#### Paso 2: Crear cuenta en Netlify
1. Ve a https://www.netlify.com/
2. Regístrate con GitHub
3. Click en "Add new site" > "Import an existing project"
4. Selecciona GitHub
5. Busca el repositorio `lajunglaworkout/jungla-iberica`

#### Paso 3: Configurar el build
Netlify detectará automáticamente la configuración de `netlify.toml`:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

#### Paso 4: Configurar variables de entorno
En Netlify Dashboard > Site settings > Environment variables, añadir:

```
VITE_SUPABASE_URL = https://gfnjlmfziczimaohgkct.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbmpsbWZ6aWN6aW1hb2hna2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc0NjgsImV4cCI6MjA2OTcxMzQ2OH0.1hn6Tse7FI58VA90kU2YXiweNesa8Ndrl0w9qKixph0
```

**NOTA:** Estas variables ya están en `netlify.toml`, pero es buena práctica añadirlas también en el dashboard.

#### Paso 5: Deploy
1. Click en "Deploy site"
2. Esperar ~2-3 minutos
3. ¡Listo! Tu sitio estará en `https://[nombre-aleatorio].netlify.app`

---

### **OPCIÓN 2: Deployment con CLI (Avanzado)**

#### Paso 1: Login en Netlify
```bash
npx netlify login
```

#### Paso 2: Inicializar el sitio
```bash
npx netlify init
```
Seleccionar:
- Create & configure a new site
- Team: Tu equipo
- Site name: `lajungla-crm` (o el que prefieras)

#### Paso 3: Deploy
```bash
npx netlify deploy --prod
```

---

### **OPCIÓN 3: Deployment Automático (CI/CD)**

Ya configurado en `netlify.toml`. Cada push a `main` desplegará automáticamente.

Para habilitar:
1. Conectar repositorio en Netlify
2. Activar "Automatic deploys"
3. Cada `git push` desplegará automáticamente

---

## 🔧 CONFIGURACIÓN POST-DEPLOYMENT

### 1. Configurar dominio personalizado (Opcional)
En Netlify Dashboard > Domain settings:
- Añadir dominio personalizado (ej: `crm.lajunglaworkout.com`)
- Configurar DNS según instrucciones
- SSL automático incluido

### 2. Configurar redirects (Ya configurado)
El archivo `netlify.toml` ya incluye:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
Esto permite que React Router funcione correctamente.

### 3. Configurar Supabase
En Supabase Dashboard > Authentication > URL Configuration:
- Añadir la URL de Netlify a "Site URL"
- Añadir a "Redirect URLs"

Ejemplo:
```
Site URL: https://lajungla-crm.netlify.app
Redirect URLs: https://lajungla-crm.netlify.app/**
```

---

## 🧪 TESTING POST-DEPLOYMENT

### Checklist de verificación:
- [ ] El sitio carga correctamente
- [ ] Login funciona
- [ ] Sesión persiste al recargar
- [ ] Todos los módulos son accesibles
- [ ] Imágenes y assets cargan
- [ ] No hay errores en consola
- [ ] Responsive funciona en móvil
- [ ] QR codes funcionan
- [ ] Subida de archivos funciona

---

## 🔒 SEGURIDAD

### Variables de entorno
✅ Las claves de Supabase son públicas (anon key)
✅ La seguridad real está en Row Level Security (RLS) de Supabase
⚠️ NUNCA exponer `SUPABASE_SERVICE_ROLE_KEY` en el frontend

### CORS
Supabase ya está configurado para aceptar requests desde cualquier origen.
Si necesitas restringir, configura en Supabase Dashboard.

---

## 📊 MONITOREO

### Netlify Analytics (Opcional, de pago)
- Visitas
- Rendimiento
- Errores

### Supabase Dashboard
- Queries ejecutadas
- Usuarios activos
- Storage usado
- Errores de autenticación

---

## 🔄 ACTUALIZACIONES FUTURAS

### Deployment automático:
1. Hacer cambios en código
2. `git add -A`
3. `git commit -m "Descripción del cambio"`
4. `git push origin main`
5. Netlify despliega automáticamente en ~2-3 minutos

### Rollback (si algo sale mal):
En Netlify Dashboard > Deploys:
- Ver historial de deployments
- Click en deployment anterior
- "Publish deploy"

---

## 📋 COMANDOS ÚTILES

### Build local
```bash
npm run build
```

### Preview local del build
```bash
npm run preview
```

### Deploy manual a Netlify
```bash
npx netlify deploy --prod
```

### Ver logs de Netlify
```bash
npx netlify logs
```

### Abrir dashboard de Netlify
```bash
npx netlify open
```

---

## 🐛 TROUBLESHOOTING

### Error: "Build failed"
- Verificar que `npm run build` funciona localmente
- Revisar logs en Netlify Dashboard
- Verificar variables de entorno

### Error: "Page not found" en rutas
- Verificar que `netlify.toml` tiene la configuración de redirects
- Limpiar caché de Netlify: Settings > Build & deploy > Clear cache

### Error: "Cannot connect to Supabase"
- Verificar variables de entorno en Netlify
- Verificar que Supabase acepta requests desde la URL de Netlify
- Revisar consola del navegador para errores CORS

### Sitio muy lento
- Considerar code splitting
- Optimizar imágenes
- Usar lazy loading
- Activar Netlify CDN (ya activo por defecto)

---

## 📞 SOPORTE

### Netlify
- Documentación: https://docs.netlify.com/
- Soporte: https://www.netlify.com/support/

### Supabase
- Documentación: https://supabase.com/docs
- Soporte: https://supabase.com/support

---

## ✅ CHECKLIST FINAL

Antes de considerar el deployment completo:

### Pre-deployment
- [x] Backup creado
- [x] Build local exitoso
- [x] Variables de entorno configuradas
- [x] `netlify.toml` configurado
- [ ] Código pusheado a GitHub

### Deployment
- [ ] Sitio creado en Netlify
- [ ] Variables de entorno añadidas
- [ ] Primer deployment exitoso
- [ ] URL de producción obtenida

### Post-deployment
- [ ] Testing completo realizado
- [ ] Supabase configurado con nueva URL
- [ ] Dominio personalizado configurado (opcional)
- [ ] Equipo notificado de nueva URL
- [ ] Documentación actualizada con URL

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **Inmediato:**
   - Hacer deployment a Netlify
   - Testing básico
   - Configurar Supabase con nueva URL

2. **Corto plazo (1-2 días):**
   - Testing completo con Vicente
   - Configurar dominio personalizado
   - Capacitación del equipo

3. **Medio plazo (1 semana):**
   - Monitoreo de errores
   - Optimización de rendimiento
   - Feedback de usuarios

4. **Largo plazo (1 mes):**
   - Analytics y métricas
   - Mejoras basadas en uso real
   - Plan de mantenimiento

---

**Última actualización:** 17 de Noviembre de 2025, 08:30 CET  
**Responsable:** Equipo de Desarrollo  
**Estado:** ✅ Listo para deployment
