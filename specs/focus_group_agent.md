# 🕵️ Agente "Focus Group" (CX Automation)

## Objetivo
Automatizar la obtención de feedback cualitativo de alto valor mediante un sistema de "Trueque": **Incentivo (Mes Gratis) <-> Compromiso (Feedback Diario/Semanal)**.

## Arquitectura

### 1. El Cazador (The Hunter) 🏹
**Función:** Encontrar candidatos ideales.
- **Input:** Criterios de segmentación (ej: "Mujer, 25-35 años, >3 meses antigüedad, asiste 3 veces/semana").
- **Proceso:** 
  - Scrapear lista de atletas (ya tenemos script).
  - Filtrar por criterios.
  - Verificar que NO hayan sido contactados recientemente.
- **Output:** Lista de `TargetCandidates` en Supabase.

### 2. El Negociador (The Negotiator) 🤝
**Función:** Proponer el trato.
- **Trigger:** Cuando el Cazador encuentra nuevos targets.
- **Acción:** Enviar mensaje personalizado por Chat Wodbuster.
  > "Hola [Nombre], te hemos seleccionado para un programa exclusivo..."
- **Gestión:**
  - Si responde "SÍ" -> Marcar como `PARTICIPANT`.
  - Si responde "NO" -> Marcar como `REJECTED`.

### 3. El Encuestador (The Surveyor) 📝
**Función:** Recoger datos en el "Momento de la Verdad".
- **Trigger A (Inicial):** Al aceptar. -> Envía Encuesta Base (Expectativas).
- **Trigger B (Post-Entreno):** 
  - El agente monitoriza la asistencia a clases (API `getBookings` o Scraping).
  - 30 min después de terminar la clase: "¿Qué nota le das al WOD de hoy y al coach?"
- **Trigger C (Final):** A las 2 semanas. -> Encuesta de Cierre.

### 4. El Analista (The Analyst) 🧠
**Función:** Generar Inteligencia de Negocio.
- **Proceso:** 
  - Lee todas las respuestas no estructuradas ("El coach explicó mal", "Me encantó la música").
  - Usa IA (LLM) para extraer: **Sentimiento**, **Temas Clave** (Limpieza, Programación, Trato).
  - Cruza datos entre los 3 Centros.
- **Output:** Informe PDF / Dashboard Semanal.

## Flujo de Datos
`Wodbuster` -> `Agente Hunter` -> `Supabase (Candidates)` -> `Agente Negotiator` -> `Chat Wodbuster` -> `Cliente (Feedback)` -> `Agente Analyst` -> `Dashboard`.

## Requisitos Técnicos
1.  **Lectura de Asistencia**: Necesitamos saber cuándo han ido a entrenar para disparar la pregunta en caliente.
    *   *Solución*: Usar la API oficial de Wodbuster (endpoints de Bookings) que ya tenemos explorada.
2.  **Chat Bidireccional**: Ya lo tenemos (Agente CX Loop).

## Próximos Pasos
1.  Definir los **Criterios del Candidato Ideal** (Avatar).
2.  Redactar los **Scripts de Conversación** (La oferta, las preguntas).
