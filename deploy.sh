#!/bin/bash

# Script de Deployment Rápido - La Jungla Workout CRM
# Uso: ./deploy.sh [mensaje-commit]

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DEPLOYMENT - LA JUNGLA WORKOUT CRM      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Verificar si hay cambios
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  No hay cambios para deployar${NC}"
    echo ""
    read -p "¿Quieres hacer deployment del código actual? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${RED}❌ Deployment cancelado${NC}"
        exit 1
    fi
else
    # Mostrar cambios
    echo -e "${YELLOW}📝 Cambios detectados:${NC}"
    git status -s
    echo ""
fi

# Obtener mensaje de commit
if [ -z "$1" ]; then
    echo -e "${YELLOW}💬 Mensaje de commit:${NC}"
    read -p "   > " COMMIT_MSG
else
    COMMIT_MSG="$1"
fi

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Deploy: $(date +"%Y-%m-%d %H:%M:%S")"
fi

echo ""
echo -e "${BLUE}🔄 Proceso de deployment:${NC}"
echo ""

# Paso 1: Crear backup
echo -e "${YELLOW}1️⃣  Creando backup...${NC}"
./backup.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Backup creado${NC}"
else
    echo -e "${RED}   ❌ Error en backup${NC}"
    exit 1
fi

# Paso 2: Build local
echo -e "${YELLOW}2️⃣  Compilando proyecto...${NC}"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Build exitoso${NC}"
else
    echo -e "${RED}   ❌ Error en build${NC}"
    echo -e "${YELLOW}   Ejecuta 'npm run build' para ver el error${NC}"
    exit 1
fi

# Paso 3: Git add
echo -e "${YELLOW}3️⃣  Preparando cambios...${NC}"
git add -A
echo -e "${GREEN}   ✅ Cambios preparados${NC}"

# Paso 4: Git commit
echo -e "${YELLOW}4️⃣  Creando commit...${NC}"
git commit -m "$COMMIT_MSG" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Commit creado: ${COMMIT_MSG}${NC}"
else
    echo -e "${YELLOW}   ⚠️  Sin cambios para commit${NC}"
fi

# Paso 5: Git push
echo -e "${YELLOW}5️⃣  Subiendo a GitHub...${NC}"
git push origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Push exitoso${NC}"
else
    echo -e "${RED}   ❌ Error en push${NC}"
    echo -e "${YELLOW}   Verifica tu conexión a internet${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🎉 DEPLOYMENT COMPLETADO                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Información:${NC}"
echo -e "   Commit: ${COMMIT_MSG}"
echo -e "   Rama: main"
echo -e "   Fecha: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""
echo -e "${YELLOW}⏳ Netlify desplegará automáticamente en ~2-3 minutos${NC}"
echo -e "${BLUE}🌐 Verifica el deployment en: https://app.netlify.com/${NC}"
echo ""
