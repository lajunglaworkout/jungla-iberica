# 🚀 Guía de Despliegue en Producción

## Requisitos del Servidor

- Sistema operativo: Ubuntu 20.04+ o similar
- Acceso SSH al servidor
- Mínimo 2GB RAM, 10GB almacenamiento

## 1️⃣ Instalar Docker en el Servidor

Conectarse al servidor y ejecutar:

```bash
# Actualizar sistema
sudo apt-get update
sudo apt-get upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version

# Permitir usar docker sin sudo (opcional)
sudo usermod -aG docker $USER
newgrp docker
```

## 2️⃣ Clonar el Repositorio

```bash
# Clonar el proyecto
git clone https://github.com/lajunglaworkout/jungla-iberica.git
cd jungla-iberica

# O si ya existe, actualizar
git pull origin main
```

## 3️⃣ Configurar Variables de Entorno

```bash
# Crear archivo .env en la raíz
cat > .env << EOF
ANTHROPIC_API_KEY=tu_api_key_aqui
NODE_ENV=production
EOF

# Crear archivo .env en backend
cat > backend/.env << EOF
ANTHROPIC_API_KEY=tu_api_key_aqui
NODE_ENV=production
PORT=3001
EOF
```

## 4️⃣ Iniciar los Servicios

```bash
# Construir y iniciar
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps
```

## 5️⃣ Configurar Nginx como Reverse Proxy (Opcional pero Recomendado)

```bash
# Instalar Nginx
sudo apt-get install nginx -y

# Crear configuración
sudo tee /etc/nginx/sites-available/jungla << EOF
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/jungla /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6️⃣ Configurar SSL (Recomendado)

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Auto-renovación
sudo systemctl enable certbot.timer
```

## 7️⃣ Monitoreo y Mantenimiento

```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Reiniciar servicios
docker-compose restart

# Actualizar código
git pull origin main
docker-compose up -d --build

# Limpiar recursos no usados
docker system prune -a
```

## 📋 Checklist de Despliegue

- [ ] Docker instalado en servidor
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas
- [ ] Servicios iniciados con `docker-compose up -d`
- [ ] Backend respondiendo en puerto 3001
- [ ] Nginx configurado (opcional)
- [ ] SSL configurado (recomendado)
- [ ] Backups configurados

## 🆘 Troubleshooting

### El backend no inicia
```bash
docker-compose logs backend
```

### Puerto 3001 en uso
```bash
sudo lsof -i :3001
```

### Permisos de Docker
```bash
sudo usermod -aG docker $USER
```

### Reiniciar todo
```bash
docker-compose down
docker-compose up -d --build
```
