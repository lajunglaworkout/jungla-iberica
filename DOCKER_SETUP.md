# 🐳 Docker Setup - Backend de Reuniones

## Requisitos

- Docker instalado ([descargar](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido en Docker Desktop)

## 🚀 Desarrollo Local

### Opción 1: Con Docker Compose (Recomendado)

```bash
# Clonar variables de entorno
cp backend/.env.example backend/.env

# Editar backend/.env y añadir tu ANTHROPIC_API_KEY

# Iniciar el backend
docker-compose up --build

# El backend estará disponible en http://localhost:3001
```

### Opción 2: Solo Docker (sin Compose)

```bash
# Construir imagen
docker build -t jungla-backend ./backend

# Ejecutar contenedor
docker run -p 3001:3001 \
  -e ANTHROPIC_API_KEY=tu_api_key_aqui \
  jungla-backend
```

## 📋 Comandos Útiles

```bash
# Ver logs
docker-compose logs -f backend

# Detener
docker-compose down

# Reconstruir
docker-compose up --build

# Ejecutar comando en el contenedor
docker-compose exec backend npm list
```

## 🌐 Producción

### En AWS, Google Cloud, Azure, etc.

1. **Construir y subir imagen a Docker Hub:**
```bash
docker build -t tu-usuario/jungla-backend:latest ./backend
docker push tu-usuario/jungla-backend:latest
```

2. **En el servidor, ejecutar:**
```bash
docker run -d \
  -p 3001:3001 \
  -e ANTHROPIC_API_KEY=tu_api_key \
  --restart unless-stopped \
  tu-usuario/jungla-backend:latest
```

### Con Docker Compose en Producción

```bash
# En el servidor
git clone tu-repo
cd tu-repo
docker-compose up -d
```

## ✅ Verificar que funciona

```bash
curl http://localhost:3001/health
# Debería responder: {"status":"ok"}
```

## 🔧 Troubleshooting

### Puerto 3001 ya está en uso
```bash
# Cambiar puerto en docker-compose.yml
# Cambiar: "3001:3001" por "3002:3001"
```

### Error de API Key
```bash
# Verificar que ANTHROPIC_API_KEY está en backend/.env
cat backend/.env | grep ANTHROPIC_API_KEY
```

### Ver logs de error
```bash
docker-compose logs backend
```
