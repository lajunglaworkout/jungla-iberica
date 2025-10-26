# 📋 DIRECTORES Y ROLES - JUNGLA IBÉRICA

## 👥 ESTRUCTURA ORGANIZATIVA

### ✅ ASIGNADOS

| Departamento | Director/Responsable | Email | Rol |
|---|---|---|---|
| **Dirección** | Carlos Suárez Parra | carlossuarezparra@gmail.com | CEO (Acceso a TODO) |
| **Dirección** | Vicente Benítez | vicente@jungla.com | Director RRHH, Procedimientos, Academy, Dirección y Eventos |
| **RRHH** | Vicente Benítez | vicente@jungla.com | Director RRHH, Procedimientos, Academy, Dirección y Eventos |
| **Procedimientos** | Vicente Benítez | vicente@jungla.com | Director RRHH, Procedimientos, Academy, Dirección y Eventos |
| **Academy** | Vicente Benítez | vicente@jungla.com | Director RRHH, Procedimientos, Academy, Dirección y Eventos |
| **Eventos** | Antonio Durán + Vicente Benítez | lajunglaweventos@gmail.com / vicente@jungla.com | Director Eventos + Director Procedimientos |
| **Logística** | Benito Morales | beni.jungla@gmail.com | Director Logística, Mantenimiento, Contabilidad y Ventas |
| **Mantenimiento** | Benito Morales | beni.jungla@gmail.com | Director Logística, Mantenimiento, Contabilidad y Ventas |
| **Contabilidad** | Benito Morales | beni.jungla@gmail.com | Director Logística, Mantenimiento, Contabilidad y Ventas |
| **Ventas** | Carlos Suárez + Benito Morales | carlossuarezparra@gmail.com / beni.jungla@gmail.com | CEO + Director |
| **Marketing** | Diego Montilla | diegomontilla.fotografias@gmail.com | Director Marketing |
| **Online** | Jonathan Padilla | lajunglawonline@gmail.com | Director Online |
| **Eventos** | Antonio Durán | lajunglaweventos@gmail.com | Director Eventos |
| **Jungla Tech** | Carlos Suárez Parra | carlossuarezparra@gmail.com | CEO |
| **Centros Operativos** | Vicente Benítez + Benito Morales | vicente@jungla.com / beni.jungla@gmail.com | Directores |
| **Varios** | Carlos Suárez Parra | carlossuarezparra@gmail.com | CEO |

---

## 🔐 PERMISOS POR USUARIO

### 1. **Carlos Suárez Parra** (CEO)
- **Email**: carlossuarezparra@gmail.com
- **Rol**: CEO
- **Acceso**: ✅ TODOS LOS DEPARTAMENTOS
- **Permisos**: Superadmin - Puede ver y gestionar todo

### 2. **Benito Morales** (Director Operaciones)
- **Email**: beni.jungla@gmail.com
- **Rol**: Director Logística, Mantenimiento, Contabilidad y Ventas
- **Acceso**:
  - ✅ Logística
  - ✅ Mantenimiento
  - ✅ Contabilidad
  - ✅ Ventas
  - ✅ Centros Operativos
- **Permisos**: Puede crear/editar reuniones en estos departamentos

### 3. **Vicente Benítez** (Director RRHH, Procedimientos, Academy, Dirección y Eventos)
- **Email**: vicente@jungla.com
- **Rol**: Director RRHH, Procedimientos, Academy, Dirección y Eventos
- **Acceso**:
  - ✅ Dirección
  - ✅ RRHH
  - ✅ Procedimientos
  - ✅ Academy
  - ✅ Eventos
  - ✅ Centros Operativos
- **Permisos**: Puede crear/editar reuniones en estos departamentos y con los encargados de centros

### 4. **Diego Montilla** (Director Marketing)
- **Email**: diegomontilla.fotografias@gmail.com
- **Rol**: Director Marketing
- **Acceso**:
  - ✅ Marketing
- **Permisos**: Puede crear/editar reuniones de Marketing

### 5. **Jonathan Padilla** (Director Online)
- **Email**: lajunglawonline@gmail.com
- **Rol**: Director Online
- **Acceso**:
  - ✅ Online
- **Permisos**: Puede crear/editar reuniones de Online

### 6. **Antonio Durán** (Director Eventos)
- **Email**: lajunglaweventos@gmail.com
- **Rol**: Director Eventos
- **Acceso**:
  - ✅ Eventos
- **Permisos**: Puede crear/editar reuniones de Eventos

---

## ✅ ESTADO FINAL

- ✅ **6 usuarios configurados** (Carlos, Beni, Vicente, Diego, Jonathan, Antonio)
- ✅ **13 departamentos asignados** (100% cobertura)
- ✅ **Sistema completamente operativo**

---

## 🔄 CÓMO ACTUALIZAR

Para añadir un nuevo director:

1. Proporciona el nombre, email y departamentos
2. Se añade a `src/config/departmentPermissions.ts`
3. El usuario verá automáticamente esos departamentos en la app

**Ejemplo:**
```typescript
'director.marketing@jungla.com': {
  email: 'director.marketing@jungla.com',
  name: 'Nombre Director',
  role: 'Director Marketing',
  departments: ['marketing'],
  isAdmin: false
}
```

---

## ✨ ESTADO ACTUAL

- ✅ **3 usuarios configurados** (Carlos, Beni, Vicente)
- ❌ **7 departamentos sin director** (Solo accesibles por CEO)
- 📊 **Sistema listo para expandir**

**¿Quieres proporcionar los datos de los directores faltantes?**
