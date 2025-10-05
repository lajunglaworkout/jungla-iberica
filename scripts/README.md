# 📊 Scripts de Análisis de Base de Datos - La Jungla CRM

## 🎯 Objetivo
Obtener el contexto completo de la estructura de base de datos para desarrollar mejor el módulo de Gestión de Marca.

## 📝 Instrucciones de Uso

### 1. **Acceder a Supabase**
```
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto de La Jungla
3. Ve a "SQL Editor" en el menú lateral
```

### 2. **Ejecutar Scripts en Orden**

#### **Paso 1: Estructura de Base de Datos**
```sql
-- Copia y pega el contenido de: get_database_schema.sql
-- Este script te dará:
-- ✅ Lista de todas las tablas
-- ✅ Estructura de columnas
-- ✅ Tipos de datos
-- ✅ Claves primarias y foráneas
-- ✅ Constraints e índices
```

#### **Paso 2: Datos de Ejemplo**
```sql
-- Copia y pega el contenido de: get_sample_data.sql
-- Este script te dará:
-- ✅ Datos de usuarios (incluyendo Vicente)
-- ✅ Muestra de datos de cada tabla
-- ✅ Conteo de registros
-- ✅ Políticas de seguridad RLS
```

### 3. **Compartir Resultados**
Una vez ejecutados los scripts, comparte conmigo:
- **Nombres de todas las tablas** encontradas
- **Estructura de tablas** relacionadas con gestión de marca
- **Datos de Vicente** (si los encuentra)
- **Cualquier tabla** que parezca relacionada con ventas, leads, proyectos, etc.

## 🔍 **Qué Buscar Específicamente**

### **Tablas Esperadas:**
- `users` o `auth.users` (usuarios)
- `centers` o `centros` (centros deportivos)
- `financial_data` o similar (datos financieros)
- `leads` o `contacts` (contactos/leads)
- `projects` o `proyectos` (proyectos de apertura)
- `sales_pipeline` o similar (pipeline de ventas)

### **Datos de Vicente:**
- Email registrado
- Rol/permisos
- Metadata del usuario
- Fecha de registro

## 🚀 **Siguiente Paso**
Con esta información podré:
1. **Adaptar el código** a tu estructura real de BD
2. **Crear servicios** específicos para tus tablas
3. **Implementar la integración** real con Supabase
4. **Desarrollar funcionalidades** basadas en datos reales

## 📋 **Formato de Respuesta Ideal**
```
TABLAS ENCONTRADAS:
- tabla1 (descripción)
- tabla2 (descripción)
- ...

DATOS DE VICENTE:
- Email: xxx
- Rol: xxx
- ID: xxx

ESTRUCTURA RELEVANTE:
- Tabla X tiene columnas: a, b, c
- Tabla Y se relaciona con Z por...
```
