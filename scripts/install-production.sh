#!/bin/bash

# Script de instalación automática para producción
# Uso: bash scripts/install-production.sh

set -e

echo "🚀 Iniciando instalación de producción..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar si es root
if [[ $EUID -ne 0 ]]; then
   print_error "Este script debe ejecutarse como root"
   exit 1
fi

# 1. Actualizar sistema
print_status "Actualizando sistema..."
apt-get update
apt-get upgrade -y

# 2. Instalar Docker
print_status "Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# 3. Instalar Docker Compose
print_status "Instalando Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Verificar instalación
print_status "Verificando instalación..."
docker --version
docker-compose --version

# 5. Crear directorio de proyecto
PROJECT_DIR="/opt/jungla-iberica"
if [ ! -d "$PROJECT_DIR" ]; then
    print_status "Creando directorio del proyecto..."
    mkdir -p "$PROJECT_DIR"
fi

# 6. Clonar repositorio
print_status "Clonando repositorio..."
cd "$PROJECT_DIR"
if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/lajunglaworkout/jungla-iberica.git .
fi

# 7. Crear archivo .env
print_warning "Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
ANTHROPIC_API_KEY=
NODE_ENV=production
EOF
    print_warning "⚠️  Edita .env y añade tu ANTHROPIC_API_KEY"
fi

if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
ANTHROPIC_API_KEY=
NODE_ENV=production
PORT=3001
EOF
fi

# 8. Iniciar servicios
print_status "Iniciando servicios con Docker Compose..."
docker-compose up -d --build

# 9. Esperar a que el backend esté listo
print_status "Esperando a que el backend esté listo..."
sleep 10

# 10. Verificar que funciona
if curl -s http://localhost:3001/health > /dev/null; then
    print_status "✅ Backend está corriendo correctamente"
else
    print_error "❌ Backend no responde"
    docker-compose logs backend
    exit 1
fi

# 11. Crear servicio systemd para auto-inicio
print_status "Configurando auto-inicio..."
cat > /etc/systemd/system/jungla-docker.service << EOF
[Unit]
Description=Jungla Iberica Docker Services
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable jungla-docker.service

print_status "✅ Instalación completada!"
print_status "Backend disponible en: http://localhost:3001"
print_warning "⚠️  No olvides editar .env y backend/.env con tu ANTHROPIC_API_KEY"
print_status "Ver logs: docker-compose logs -f"
print_status "Estado: docker-compose ps"
