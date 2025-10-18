# 🏢 CREAR PERFILES DE CENTRO EN SUPABASE

## 🎯 **Estructura de Roles:**
- **Encargado** = Persona física que gestiona el centro
- **Centro** = Perfil institucional para tablet de fichaje  
- **Franquiciado** = Dueño del centro

## 📧 **Perfiles de Centro a crear (para tablets):**

### 1. Centro Sevilla
- **Email:** lajunglasevillaw@gmail.com
- **Contraseña:** sevilla2024
- **Rol:** `Encargado` (pero será usado como perfil de centro)
- **Nombre:** "Tablet Centro Sevilla"

### 2. Centro Jerez  
- **Email:** lajunglajerez@gmail.com
- **Contraseña:** jerez2024
- **Rol:** `Encargado`
- **Nombre:** "Tablet Centro Jerez"

### 3. Centro Puerto
- **Email:** lajunglaelpuerto@gmail.com
- **Contraseña:** puerto2024
- **Rol:** `Encargado`
- **Nombre:** "Tablet Centro Puerto"

### 4. Almacén Central
- **Email:** pedidoslajungla@gmail.com
- **Contraseña:** almacen2024
- **Rol:** `Encargado`
- **Nombre:** "Tablet Almacén Central"

## 🛠️ Pasos para crear en Supabase:

1. Ir a Supabase Dashboard → Authentication → Users
2. Hacer clic en "Add user"
3. Introducir email y contraseña
4. Confirmar usuario
5. Repetir para todos los centros

## 📋 También crear registros en tabla employees:

**IMPORTANTE:** La columna se llama `name` no `nombre`

```sql
-- Verificar primero qué usuarios ya existen
SELECT email, name, role FROM employees WHERE email IN (
  'lajunglasevillaw@gmail.com',
  'lajunglajerez@gmail.com', 
  'lajunglaelpuerto@gmail.com',
  'pedidoslajungla@gmail.com'
);

-- PRIMERO: Verificar qué roles están disponibles
SELECT unnest(enum_range(NULL::user_role));

-- Usar 'Encargado' para los perfiles de tablet de centro
INSERT INTO employees (email, name, role, center_id, is_active) VALUES
('lajunglasevillaw@gmail.com', 'Tablet Centro Sevilla', 'Encargado', 9, true),
('lajunglajerez@gmail.com', 'Tablet Centro Jerez', 'Encargado', 10, true),
-- ('lajunglaelpuerto@gmail.com', 'Tablet Centro Puerto', 'Encargado', 11, true), -- Ya existe
('pedidoslajungla@gmail.com', 'Tablet Almacén Central', 'Encargado', 1, true);
```

## 🔍 **Si ya existe el usuario Puerto:**

```sql
-- Solo actualizar el rol si es necesario
UPDATE employees 
SET role = 'Encargado', center_id = 11, is_active = true, name = 'Tablet Centro Puerto'
WHERE email = 'lajunglaelpuerto@gmail.com';
```

## 💡 **Propuesta de Estructura Completa:**

### 🏢 **Para cada centro deberías tener:**

1. **Franquiciado** (Dueño)
   - Email personal del dueño
   - Rol: `Franquiciado` (si existe) o `Admin`
   - Acceso completo al centro

2. **Encargado** (Gestor diario)  
   - Email personal del encargado
   - Rol: `Encargado`
   - Gestión operativa del centro

3. **Tablet del Centro** (Sistema de fichaje)
   - Email institucional del centro
   - Rol: `Encargado` (reutilizado)
   - Solo para mostrar QR de fichaje

### 📱 **Empleados**
   - Email personal de cada empleado
   - Rol: `Empleado`
   - Acceso a su perfil y fichaje
