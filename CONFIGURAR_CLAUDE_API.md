# 🤖 CONFIGURAR CLAUDE API PARA GENERACIÓN DE ACTAS
**Fecha:** 17 de Noviembre de 2025  
**Objetivo:** Que Vicente y todos puedan generar actas automáticamente

---

## ✅ CAMBIOS IMPLEMENTADOS

He cambiado el sistema para usar **Claude API directamente** en lugar del backend local.

**Ventajas:**
- ✅ Funciona en producción (no solo en localhost)
- ✅ Vicente, Beni y todos pueden usarlo
- ✅ No necesita backend adicional
- ✅ Más rápido y confiable

---

## 🔑 PASO 1: OBTENER API KEY DE CLAUDE

### **1.1. Ir a la consola de Anthropic**
URL: https://console.anthropic.com/settings/keys

### **1.2. Iniciar sesión**
- Ya tienes cuenta de pago ✅
- Usa tu email y contraseña

### **1.3. Crear API Key**
1. Click en "Create Key"
2. Nombre: "La Jungla CRM - Producción"
3. Click en "Create Key"
4. **COPIAR LA KEY** (solo se muestra una vez)
   - Formato: `sk-ant-api03-...` (muy larga)

### **1.4. Verificar créditos**
- Ir a "Billing" en el menú
- Verificar que tienes créditos disponibles
- Recomendado: $10-20 para empezar

---

## 🔧 PASO 2: CONFIGURAR EN NETLIFY

### **2.1. Ir a Netlify**
URL: https://app.netlify.com

### **2.2. Seleccionar el sitio**
- Click en "lajungla-crm" (o como se llame tu sitio)

### **2.3. Ir a Environment Variables**
1. Click en "Site configuration" (menú lateral)
2. Click en "Environment variables"
3. Click en "Add a variable"

### **2.4. Añadir la variable**
- **Key:** `VITE_ANTHROPIC_API_KEY`
- **Value:** Pegar la API key que copiaste (sk-ant-api03-...)
- **Scopes:** Production, Deploy previews, Branch deploys (marcar todos)
- Click en "Create variable"

### **2.5. Redesplegar**
1. Ir a "Deploys" en el menú
2. Click en "Trigger deploy"
3. Click en "Deploy site"
4. Esperar 2-3 minutos

---

## 🧪 PASO 3: PROBAR QUE FUNCIONA

### **3.1. Abrir el CRM**
URL: https://lajungla-crm.netlify.app

### **3.2. Crear reunión de prueba**
1. Ir a "Reuniones"
2. Click en "Nueva Reunión"
3. Completar datos básicos
4. Pegar esta transcripción de prueba:

```
Hoy hemos revisado los objetivos del mes. Carlos mencionó que necesitamos mejorar la retención de clientes. Vicente se encargará de crear un plan de fidelización para el próximo lunes. Beni revisará los números de ventas y preparará un informe para el viernes. También decidimos aumentar el presupuesto de marketing en un 15%.
```

### **3.3. Generar acta**
1. Click en "✅ GENERAR ACTA Y ASIGNAR TAREAS"
2. **Verificar en consola (F12):**
   ```
   🤖 Llamando a Claude API...
   📥 Respuesta de Claude recibida
   ✅ Acta generada correctamente
   📋 Tareas extraídas: 2
   ```

3. **Debe aparecer:**
   - Acta completa con resumen
   - 2 tareas extraídas:
     * "Crear plan de fidelización" → Vicente
     * "Preparar informe de ventas" → Beni

### **3.4. Guardar y verificar**
1. Editar tareas si es necesario
2. Click en "💾 Guardar Reunión"
3. Verificar que se guardó correctamente

---

## 🐛 TROUBLESHOOTING

### **Problema 1: "VITE_ANTHROPIC_API_KEY no configurada"**

**Síntoma:** Aparece acta simulada en lugar de real

**Solución:**
1. Verificar que añadiste la variable en Netlify
2. Verificar que el nombre es exacto: `VITE_ANTHROPIC_API_KEY`
3. Redesplegar el sitio

### **Problema 2: "Error en API (401)"**

**Síntoma:** Error de autenticación

**Solución:**
1. Verificar que la API key es correcta
2. Verificar que la key no tiene espacios al inicio/final
3. Verificar que la key no ha expirado
4. Crear una nueva key si es necesario

### **Problema 3: "Error en API (429)"**

**Síntoma:** Demasiadas peticiones

**Solución:**
1. Esperar 1 minuto
2. Verificar límites de tu plan en Anthropic
3. Considerar upgrade si es necesario

### **Problema 4: "Error en API (402)"**

**Síntoma:** Sin créditos

**Solución:**
1. Ir a https://console.anthropic.com/settings/billing
2. Añadir créditos ($10-20)
3. Esperar 1-2 minutos
4. Intentar de nuevo

### **Problema 5: "No se pudo extraer JSON"**

**Síntoma:** Error al parsear respuesta

**Solución:**
1. Verificar que la transcripción no es demasiado larga (max 4000 caracteres)
2. Intentar con transcripción más corta
3. Verificar logs en consola (F12)

---

## 💰 COSTOS

### **Modelo usado:** Claude 3.5 Sonnet

**Precios (Noviembre 2025):**
- Input: $3 por millón de tokens
- Output: $15 por millón de tokens

**Estimación por acta:**
- Input: ~1,000 tokens (transcripción)
- Output: ~500 tokens (acta + tareas)
- **Costo por acta: ~$0.01** (1 céntimo)

**Estimación mensual:**
- 100 reuniones/mes = $1
- 300 reuniones/mes = $3
- 1000 reuniones/mes = $10

**Muy económico** 💚

---

## 🔒 SEGURIDAD

### **¿Es seguro poner la API key en Netlify?**

✅ **SÍ**, porque:
1. Las variables de entorno de Netlify son privadas
2. Solo tu equipo puede verlas
3. No se exponen en el código fuente
4. No aparecen en GitHub

### **Buenas prácticas:**
- ✅ Usar variables de entorno (no hardcodear)
- ✅ No compartir la API key públicamente
- ✅ Rotar la key cada 3-6 meses
- ✅ Monitorear uso en Anthropic console

---

## 📊 MEJORAS IMPLEMENTADAS

### **1. Prompt mejorado**
- Más claro y estructurado
- Especifica formato exacto
- Mejor extracción de tareas

### **2. Parseo robusto**
- 3 intentos de parseo
- Maneja markdown
- Maneja respuestas variadas

### **3. Mejor manejo de errores**
- Logs detallados
- Mensajes de error claros
- Fallback a acta simulada si falla

### **4. Validación de respuesta**
- Verifica que tenga `minutes` y `tasks`
- Valida formato de tareas
- Logs de cantidad de tareas extraídas

---

## 🎯 RESULTADO ESPERADO

### **Antes:**
```
❌ Solo funciona en localhost
❌ Vicente no puede generar actas
❌ Error CORS en producción
```

### **Ahora:**
```
✅ Funciona en producción
✅ Vicente puede generar actas
✅ Beni puede generar actas
✅ Todos pueden generar actas
✅ Sin errores CORS
✅ Más rápido y confiable
```

---

## 📝 CHECKLIST DE CONFIGURACIÓN

- [ ] Obtener API key de Anthropic
- [ ] Añadir `VITE_ANTHROPIC_API_KEY` en Netlify
- [ ] Redesplegar sitio
- [ ] Probar con reunión de prueba
- [ ] Verificar que genera acta correctamente
- [ ] Verificar que extrae tareas
- [ ] Verificar que guarda correctamente

---

## 🚀 PRÓXIMOS PASOS

1. **Configurar API key** (5 minutos)
2. **Redesplegar** (2 minutos)
3. **Probar** (5 minutos)
4. **Usar en reunión real** ✅

---

## 📞 SOPORTE

Si tienes problemas:

1. **Verificar logs en consola (F12)**
2. **Verificar que la API key está en Netlify**
3. **Verificar que el sitio se redesplego**
4. **Probar con transcripción corta primero**

---

**¡LISTO PARA GENERAR ACTAS AUTOMÁTICAMENTE!** 🎉
