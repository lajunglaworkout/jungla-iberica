# 🔐 Instrucciones de Backup y Restauración v1.2

**Fecha:** 16 Noviembre 2025  
**Checkpoint:** Módulo de reuniones configurado  
**Tag Git:** `v1.2-meetings-configured`

---

## 📋 Contenido del Backup

### ✅ Módulos Configurados:

1. **Dirección**
   - Incidencias urgentes
   - Contabilidad por centros (Sevilla, Jerez, Puerto)
   - Rendimiento de departamentos

2. **RRHH**
   - Incidencias de personal
   - Checklist incidencias
   - Propuestas, sanciones, cambios

3. **Logística**
   - Pedidos recibidos/enviados
   - Roturas y pérdidas
   - Stock mínimo
   - Envíos pendientes

4. **Mantenimiento**
   - Incidencias abiertas/cerradas
   - Reparaciones pendientes
   - Costes de reparaciones

5. **Contabilidad**
   - Datos de centros activos
   - Pagos pendientes
   - Transferencias por autorizar
   - Gastos extra detectados

6. **Operaciones (Centros Operativos)**
   - Incidencias del checklist
   - Tendencias clientes/facturación
   - Eventos y actividades
   - Sugerencias y peticiones
   - Comunicados franquiciados

---

## 🔄 Restaurar Código desde Git

### Opción 1: Restaurar a este checkpoint

```bash
cd /Users/user/Desktop/jungla-iberica

# Ver el tag
git tag -l v1.2-meetings-configured

# Restaurar a este punto
git checkout v1.2-meetings-configured

# Si quieres crear una nueva rama desde aquí
git checkout -b restore-v1.2
```

### Opción 2: Ver diferencias

```bash
# Ver qué cambió desde el tag anterior
git diff v1.1-pre-cleanup v1.2-meetings-configured

# Ver el log de commits
git log v1.1-pre-cleanup..v1.2-meetings-configured --oneline
```

### Opción 3: Volver a main

```bash
git checkout main
```

---

## 💾 Backup de Base de Datos

### Ejecutar Backup

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Abre el archivo `backup_full_v1.2.sql`
4. Ejecuta el script
5. **Guarda los resultados** en un archivo local

### Exportar Resultados

```bash
# Los resultados se pueden copiar desde Supabase
# y guardar en un archivo local
```

---

## 📊 Estadísticas del Proyecto

### Archivos Modificados en v1.2:
- `src/components/meetings/MeetingModal.tsx` (2989 líneas)
- Commits: 7 commits desde v1.1
- Líneas añadidas: ~1200 líneas
- Nuevos tipos de tareas: 17 tipos especializados

### Características Implementadas:
- ✅ Tareas recurrentes especializadas por módulo
- ✅ UI expandible para centros y departamentos
- ✅ Preparación para carga automática de datos
- ✅ Objetivos manuales flexibles
- ✅ Colores diferenciados por tipo

---

## 🚀 Próximos Pasos

### Pendiente de Desarrollo:
1. **Módulos restantes:**
   - Procedimientos
   - Marketing
   - Ventas

2. **Integración de datos:**
   - Conectar con módulos existentes
   - Implementar carga real desde BD
   - Crear servicios de datos

3. **Testing:**
   - Probar cada módulo
   - Verificar carga de datos
   - Validar flujo completo

---

## ⚠️ Notas Importantes

### Antes de Restaurar:
1. **Haz backup** de cualquier cambio actual
2. **Verifica** que no hay trabajo sin commitear
3. **Documenta** cualquier configuración especial

### Después de Restaurar:
1. **Instala dependencias:** `npm install`
2. **Verifica variables de entorno**
3. **Prueba la aplicación:** `npm run dev`

---

## 📞 Información de Contacto

**Proyecto:** Jungla Ibérica  
**Repositorio:** https://github.com/lajunglaworkout/jungla-iberica  
**Tag:** v1.2-meetings-configured  
**Commit:** 9188d91

---

## 🔍 Verificación del Backup

### Verificar Git Tag:
```bash
git show v1.2-meetings-configured
```

### Verificar Archivos:
```bash
ls -la backup_full_v1.2.sql
ls -la BACKUP_RESTORE_v1.2.md
```

### Verificar Commits:
```bash
git log --oneline -7
```

---

**✅ Backup completado exitosamente**
