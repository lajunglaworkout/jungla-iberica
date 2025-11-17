# 🔑 CONFIGURAR API KEY DE CLAUDE EN NETLIFY
**Tiempo estimado:** 3 minutos

---

## 📋 PASO A PASO

### **1. Copiar API Key de Claude**

Según tus imágenes, tienes varias API keys disponibles. Te recomiendo usar:

**Opción A: "CRM Production"** (recomendada)
- Key: `sk-ant-api03-L2i-...QAA` (la que dice "CRM Production")
- Ya está creada y lista para usar

**Opción B: "CRM pago"**
- Key: `sk-ant-api03-Ubv-...QAA` (la que dice "CRM pago")
- También válida

**Cómo copiar la key:**
1. En la consola de Claude (https://console.anthropic.com/settings/keys)
2. Click en los 3 puntos (...) al lado de "CRM Production"
3. Click en "Copy key" o "View key"
4. Copiar la key completa (empieza con `sk-ant-api03-`)

---

### **2. Añadir en Netlify**

1. **Ir a Netlify:**
   - URL: https://app.netlify.com
   - Login con tu cuenta

2. **Seleccionar tu sitio:**
   - Click en "lajungla-crm" (o como se llame)

3. **Ir a Environment Variables:**
   - Menú lateral → "Site configuration"
   - Click en "Environment variables"

4. **Añadir variable:**
   - Click en "Add a variable"
   - **Key:** `VITE_ANTHROPIC_API_KEY`
   - **Value:** Pegar la key que copiaste
   - **Scopes:** Marcar los 3:
     * ✅ Production
     * ✅ Deploy previews
     * ✅ Branch deploys
   - Click en "Create variable"

---

### **3. Redesplegar el sitio**

1. **Ir a Deploys:**
   - Menú lateral → "Deploys"

2. **Trigger deploy:**
   - Click en "Trigger deploy" (botón arriba a la derecha)
   - Click en "Deploy site"

3. **Esperar:**
   - Tarda 2-3 minutos
   - Verás el progreso en tiempo real

---

### **4. Verificar que funciona**

1. **Abrir el CRM:**
   - URL: https://lajungla-crm.netlify.app

2. **Crear reunión de prueba:**
   - Ir a "Reuniones"
   - Click en "Nueva Reunión"
   - Título: "Prueba API Claude"
   - Pegar esta transcripción:

```
Hoy hemos revisado los objetivos del mes. Carlos mencionó que necesitamos mejorar la retención de clientes. Vicente se encargará de crear un plan de fidelización para el próximo lunes. Beni revisará los números de ventas y preparará un informe para el viernes.
```

3. **Generar acta:**
   - Click en "✅ GENERAR ACTA Y ASIGNAR TAREAS"
   - Abrir consola (F12)
   - Verificar logs:
     ```
     🤖 Llamando a Claude API...
     📥 Respuesta de Claude recibida
     ✅ Acta generada correctamente
     📋 Tareas extraídas: 2
     ```

4. **Resultado esperado:**
   - Acta con:
     * Resumen
     * Puntos Importantes
     * Valoración
   - 2 tareas extraídas:
     * "Crear plan de fidelización" → Vicente
     * "Preparar informe de ventas" → Beni

---

## ✅ CHECKLIST

- [ ] Copiar API key de Claude (CRM Production o CRM pago)
- [ ] Añadir `VITE_ANTHROPIC_API_KEY` en Netlify
- [ ] Redesplegar sitio
- [ ] Probar con reunión de prueba
- [ ] Verificar que genera acta correctamente

---

## 🐛 SI NO FUNCIONA

### **Error: "VITE_ANTHROPIC_API_KEY no configurada"**

**Solución:**
1. Verificar que añadiste la variable en Netlify
2. Verificar que el nombre es exacto: `VITE_ANTHROPIC_API_KEY`
3. Redesplegar el sitio (paso 3)

### **Error: "Error en API (401)"**

**Solución:**
1. Verificar que la API key es correcta
2. Copiar de nuevo la key desde Claude
3. Verificar que no tiene espacios al inicio/final
4. Actualizar la variable en Netlify

### **Error: "Error en API (429)"**

**Solución:**
- Esperar 1 minuto y volver a intentar
- Límite de peticiones alcanzado temporalmente

---

## 💰 CRÉDITOS DISPONIBLES

Según tu imagen, tienes:
- **Balance:** 14,99 US$
- **Auto-reload:** Habilitado (hasta 10 US$ cuando llegue a 5 US$)

**Estimación:**
- Cada acta cuesta ~$0.01
- Con 14,99 US$ puedes generar ~1,500 actas
- Más que suficiente para varios meses

---

## 🎯 ESTRUCTURA DEL ACTA

El prompt ahora genera:

```markdown
# Acta de Reunión

**Nueva Reunión**
**Fecha:** 17/11/2025
**Participantes:** Carlos, Vicente, Beni

## Resumen
[Resumen breve de 2-3 líneas de lo tratado]

## Puntos Importantes
- [Punto 1]
- [Punto 2]
- [Punto 3]

## Valoración
[Evaluación de la productividad y cumplimiento de objetivos]
```

**Tareas extraídas:**
- Título claro
- Responsable
- Fecha límite
- Prioridad

---

## ✅ LISTO

Una vez configurada la API key:
- ✅ Vicente puede generar actas
- ✅ Beni puede generar actas
- ✅ Todos pueden generar actas
- ✅ Funciona en producción
- ✅ Sin errores CORS

**¡Solo tarda 3 minutos configurarlo!** 🚀
