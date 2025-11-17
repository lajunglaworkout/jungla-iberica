# 🚀 DEPLOYMENT RÁPIDO - LA JUNGLA WORKOUT CRM

## 📦 BACKUP AUTOMÁTICO

### Crear backup manualmente:
```bash
./backup.sh
```

Los backups se guardan en: `~/Desktop/backups-jungla/`

---

## 🌐 DEPLOYMENT A NETLIFY

### Opción 1: Deployment Automático (Recomendado)
```bash
./deploy.sh "Mensaje del cambio"
```

Este script hace:
1. ✅ Crea backup automático
2. ✅ Compila el proyecto
3. ✅ Hace commit de cambios
4. ✅ Push a GitHub
5. ✅ Netlify despliega automáticamente

### Opción 2: Deployment Manual
```bash
# 1. Crear backup
./backup.sh

# 2. Build
npm run build

# 3. Commit y push
git add -A
git commit -m "Tu mensaje"
git push origin main
```

---

## 🔧 PRIMERA VEZ - CONFIGURAR NETLIFY

### Paso 1: Crear cuenta
1. Ve a https://www.netlify.com/
2. Regístrate con GitHub

### Paso 2: Conectar repositorio
1. Click en "Add new site"
2. "Import an existing project"
3. Selecciona GitHub
4. Busca `lajunglaworkout/jungla-iberica`

### Paso 3: Configurar
Netlify detecta automáticamente la configuración de `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`

### Paso 4: Variables de entorno
En Netlify Dashboard > Site settings > Environment variables:
```
VITE_SUPABASE_URL = https://gfnjlmfziczimaohgkct.supabase.co
VITE_SUPABASE_ANON_KEY = [tu-clave-aquí]
```

### Paso 5: Deploy
Click en "Deploy site" y espera ~2-3 minutos

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

Después del deployment, verifica:
- [ ] El sitio carga correctamente
- [ ] Login funciona
- [ ] Todos los módulos accesibles
- [ ] No hay errores en consola

---

## 🔄 ACTUALIZACIONES FUTURAS

Cada vez que hagas cambios:
```bash
./deploy.sh "Descripción del cambio"
```

Netlify desplegará automáticamente en ~2-3 minutos.

---

## 📞 AYUDA

Ver guía completa: `DEPLOYMENT_GUIDE.md`

**¡Listo para producción!** 🎉
