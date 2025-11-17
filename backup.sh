#!/bin/bash

# Script de Backup Automático - La Jungla Workout CRM
# Uso: ./backup.sh

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   BACKUP - LA JUNGLA WORKOUT CRM          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Obtener fecha y hora actual
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="jungla-iberica-backup-${TIMESTAMP}"

# Directorio de backups
BACKUP_DIR="$HOME/Desktop/backups-jungla"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📦 Creando backup...${NC}"
echo -e "   Nombre: ${BACKUP_NAME}.tar.gz"
echo -e "   Destino: ${BACKUP_DIR}"
echo ""

# Ir al directorio padre
cd "$(dirname "$0")/.."

# Crear backup excluyendo node_modules, dist y .git
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    jungla-iberica/

# Verificar si el backup se creó correctamente
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)
    echo -e "${GREEN}✅ Backup creado exitosamente${NC}"
    echo -e "   Tamaño: ${BACKUP_SIZE}"
    echo -e "   Ubicación: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    echo ""
    
    # Listar backups existentes
    echo -e "${BLUE}📋 Backups disponibles:${NC}"
    ls -lh "${BACKUP_DIR}" | grep "jungla-iberica-backup" | awk '{print "   " $9 " (" $5 ")"}'
    echo ""
    
    # Contar backups
    BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}" | grep "jungla-iberica-backup" | wc -l)
    echo -e "${YELLOW}Total de backups: ${BACKUP_COUNT}${NC}"
    
    # Advertir si hay muchos backups
    if [ $BACKUP_COUNT -gt 10 ]; then
        echo -e "${YELLOW}⚠️  Tienes más de 10 backups. Considera eliminar los antiguos.${NC}"
    fi
else
    echo -e "${RED}❌ Error al crear el backup${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Proceso completado${NC}"
