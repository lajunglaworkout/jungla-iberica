# 🚀 SETUP BACKEND - TRANSCRIPCIÓN DE REUNIONES

## 📋 Requisitos

- Node.js 18+ instalado
- API Key de Anthropic (obtén en https://console.anthropic.com)

---

## 🔧 Instalación

### 1. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` y añade tu API Key de Anthropic:

```env
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
CORS_ORIGIN=http://localhost:5173
```

### 3. Iniciar el backend

```bash
npm start
```

Deberías ver:

```
╔════════════════════════════════════════════════════════════╗
║  🎙️  Backend de Transcripción de Reuniones                ║
║  ✅ Servidor iniciado en puerto 3001                       ║
║  📝 POST /api/transcribe - Transcribir audio              ║
║  📋 POST /api/generate-minutes - Generar acta             ║
║  🏥 GET /health - Verificar estado                        ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🌐 Configurar Frontend

### 1. Actualizar `.env.local`

Añade la URL del backend:

```env
VITE_BACKEND_URL=http://localhost:3001
```

### 2. Verificar que el backend está corriendo

```bash
curl http://localhost:3001/health
```

Deberías obtener:

```json
{"status":"ok","timestamp":"2025-10-26T08:50:00.000Z"}
```

---

## 🎙️ Cómo Funciona

### Flujo de Grabación

1. **Usuario hace clic en "Iniciar Grabación"**
   - Se inicia la captura de audio del micrófono

2. **Usuario hace clic en "Detener Grabación"**
   - Se envía el audio al backend

3. **Backend Transcribe**
   - El backend recibe el audio
   - Llama a la API de Anthropic
   - Devuelve la transcripción

4. **Backend Genera Acta**
   - Usa Claude para generar un acta profesional
   - Extrae tareas automáticamente
   - Devuelve el acta y las tareas

5. **Frontend Muestra Resultados**
   - Muestra la transcripción
   - Muestra el acta
   - Permite asignar tareas

---

## 📊 Endpoints del Backend

### POST /api/transcribe

**Descripción**: Transcribe un archivo de audio

**Request**:
```
Content-Type: multipart/form-data
Body: {
  audio: File (webm, mp3, wav, etc)
}
```

**Response**:
```json
{
  "success": true,
  "transcript": "Transcripción del audio..."
}
```

### POST /api/generate-minutes

**Descripción**: Genera un acta de reunión

**Request**:
```json
{
  "transcript": "Transcripción...",
  "meetingTitle": "Título de la reunión",
  "participants": ["email1@example.com", "email2@example.com"]
}
```

**Response**:
```json
{
  "success": true,
  "minutes": "# ACTA DE REUNIÓN\n...",
  "tasks": [
    {
      "title": "Tarea 1",
      "assignedTo": "email@example.com",
      "deadline": "2025-11-02",
      "priority": "media"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Error: "ANTHROPIC_API_KEY is not defined"

**Solución**: Verifica que el archivo `.env` existe en la carpeta `backend/` y contiene la API Key.

### Error: "Cannot POST /api/transcribe"

**Solución**: Asegúrate de que el backend está corriendo en puerto 3001.

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solución**: El backend debe estar corriendo. Verifica que `CORS_ORIGIN` en `.env` es correcto.

### Error: "Failed to fetch"

**Solución**: 
1. Verifica que el backend está corriendo: `curl http://localhost:3001/health`
2. Verifica que `VITE_BACKEND_URL` en `.env.local` es correcto
3. Verifica que la URL no tiene un slash al final

---

## 📝 Desarrollo

### Modo desarrollo (con auto-reload)

```bash
cd backend
npm run dev
```

### Ver logs del backend

El backend imprime logs detallados:

```
📝 Recibida solicitud de transcripción...
📊 Tamaño del archivo: 245.50 KB
🎵 Tipo MIME: audio/webm
🔄 Llamando a API de Anthropic...
✅ Transcripción completada
```

---

## 🚀 Deployment

### Opción 1: Heroku

```bash
cd backend
heroku create tu-app-name
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
git push heroku main
```

### Opción 2: Railway

```bash
cd backend
railway link
railway up
```

### Opción 3: Vercel (con serverless functions)

Crea `api/transcribe.js`:

```javascript
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Implementar endpoint
}
```

---

## ✅ Checklist

- [ ] Node.js 18+ instalado
- [ ] API Key de Anthropic obtenida
- [ ] `.env` creado en `backend/`
- [ ] `npm install` ejecutado en `backend/`
- [ ] Backend corriendo en puerto 3001
- [ ] `VITE_BACKEND_URL` configurado en `.env.local`
- [ ] Frontend puede conectar al backend

---

## 📞 Soporte

Si tienes problemas:

1. Verifica los logs del backend
2. Comprueba que la API Key es válida
3. Asegúrate de que el puerto 3001 no está en uso
4. Revisa que CORS está habilitado

¡Listo para grabar y transcribir reuniones! 🎉
