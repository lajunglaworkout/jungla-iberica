#!/bin/bash

# Script de Limpieza del Proyecto CRM La Jungla
# Fecha: 29 de Octubre de 2025
# Propósito: Eliminar archivos obsoletos y backups innecesarios

echo "🧹 Iniciando limpieza del proyecto..."
echo ""

# Crear carpeta de archive si no existe
mkdir -p docs/archive
mkdir -p supabase/migrations/archive

# ============================================
# FASE 1: ELIMINAR BACKUPS DE COMPONENTES
# ============================================
echo "📦 Fase 1: Eliminando backups de componentes..."

# Eliminar carpeta completa de backup
if [ -d "src/components_backup_20250930_130731" ]; then
    echo "  ❌ Eliminando src/components_backup_20250930_130731/ (3.3MB)"
    rm -rf src/components_backup_20250930_130731
fi

if [ -d "src/components/accounting_backup_20250930_102259" ]; then
    echo "  ❌ Eliminando src/components/accounting_backup_20250930_102259/"
    rm -rf src/components/accounting_backup_20250930_102259
fi

# Eliminar archivos de backup de LogisticsManagementSystem
echo "  ❌ Eliminando backups de LogisticsManagementSystem..."
rm -f src/components/LogisticsManagementSystem-BACKUP-*.tsx
rm -f src/components/LogisticsManagementSystem-CLEAN.tsx
rm -f src/components/LogisticsManagementSystem-COMPLETO.tsx
rm -f src/components/LogisticsManagementSystem.tsx.backup
rm -f src/components/LogisticsManagementSystem.tsx.mock-backup
rm -f src/components/LogisticsManagementSystem-with-quarterly-reviews.tsx
rm -f src/components/LogisticsManagementSystemFixed.tsx

# Eliminar backups de otros componentes
echo "  ❌ Eliminando otros backups de componentes..."
rm -f src/components/centers/AccountingModule_BACKUP_*.tsx
rm -f src/components/centers/CenterManagement-BACKUP-*.tsx
rm -f src/components/centers/ManagerReviewsPanel-BACKUP-*.tsx
rm -f src/components/logistics/QuarterlyReviewSystemWithSupabase-BACKUP-*.tsx
rm -f src/components/maintenance/MaintenanceInspectionSystem-BACKUP-*.tsx

# Eliminar backups de accounting
echo "  ❌ Eliminando backups de accounting..."
rm -f src/components/accounting/BrandAccountingModule.backup.tsx
rm -f src/components/accounting/BrandAccountingModuleOld.tsx
rm -f src/components/accounting/BrandAccountingModuleTailwind.tsx
rm -f src/components/accounting/BrandIncomeModuleTemplate.tsx

echo "  ✅ Backups de componentes eliminados"
echo ""

# ============================================
# FASE 2: MOVER DOCUMENTACIÓN A ARCHIVE
# ============================================
echo "📚 Fase 2: Organizando documentación..."

# Mover documentos de análisis
mv ANALISIS-*.md docs/archive/ 2>/dev/null
mv BACKUP_*.md docs/archive/ 2>/dev/null
mv RESUMEN-*.md docs/archive/ 2>/dev/null
mv VERIFICACION-*.md docs/archive/ 2>/dev/null
mv INFORME_*.md docs/archive/ 2>/dev/null

# Mover documentos de setup antiguos
mv CONFIGURAR_*.md docs/archive/ 2>/dev/null
mv CREAR_*.md docs/archive/ 2>/dev/null
mv PASOS_*.md docs/archive/ 2>/dev/null
mv SETUP_*.md docs/archive/ 2>/dev/null
mv INSTRUCCIONES_*.md docs/archive/ 2>/dev/null
mv INTEGRACION_*.md docs/archive/ 2>/dev/null

# Mover documentos de fixes y debugging
mv DASHBOARD_*.md docs/archive/ 2>/dev/null
mv SOLUCION_*.md docs/archive/ 2>/dev/null
mv FIX_*.md docs/archive/ 2>/dev/null
mv DEBUG_*.md docs/archive/ 2>/dev/null

# Mover documentos de sistemas específicos
mv SISTEMA_*.md docs/archive/ 2>/dev/null
mv MEETING_*.md docs/archive/ 2>/dev/null
mv TURNOS_*.md docs/archive/ 2>/dev/null
mv RRHH-*.md docs/archive/ 2>/dev/null

# Mover documentos de deployment antiguos
mv DEPLOY_*.md docs/archive/ 2>/dev/null
mv PRODUCTION_*.md docs/archive/ 2>/dev/null
mv VERIFICAR_*.md docs/archive/ 2>/dev/null
mv USAR_*.md docs/archive/ 2>/dev/null

# Mover documentos varios
mv DIRECTORES_*.md docs/archive/ 2>/dev/null
mv DOCUMENTACION_*.md docs/archive/ 2>/dev/null
mv DOCKER_*.md docs/archive/ 2>/dev/null
mv execute-*.md docs/archive/ 2>/dev/null

echo "  ✅ Documentación organizada en docs/archive/"
echo ""

# ============================================
# FASE 3: CONSOLIDAR SCRIPTS SQL
# ============================================
echo "🗄️  Fase 3: Consolidando scripts SQL..."

# Mover scripts SQL antiguos a archive
mv ADD_*.sql supabase/migrations/archive/ 2>/dev/null
mv AGREGAR_*.sql supabase/migrations/archive/ 2>/dev/null
mv CHECK_*.sql supabase/migrations/archive/ 2>/dev/null
mv DEBUG_*.sql supabase/migrations/archive/ 2>/dev/null
mv FIX_*.sql supabase/migrations/archive/ 2>/dev/null
mv REFRESCAR_*.sql supabase/migrations/archive/ 2>/dev/null
mv VERIFY_*.sql supabase/migrations/archive/ 2>/dev/null

# Mover scripts de setup antiguos
mv create-*.sql supabase/migrations/archive/ 2>/dev/null
mv database-*.sql supabase/migrations/archive/ 2>/dev/null
mv cleanup-*.sql supabase/migrations/archive/ 2>/dev/null
mv complete-*.sql supabase/migrations/archive/ 2>/dev/null
mv fix-*.sql supabase/migrations/archive/ 2>/dev/null
mv reset_*.sql supabase/migrations/archive/ 2>/dev/null
mv list_*.sql supabase/migrations/archive/ 2>/dev/null

echo "  ✅ Scripts SQL consolidados en supabase/migrations/archive/"
echo ""

# ============================================
# FASE 4: LIMPIAR SCRIPTS JS OBSOLETOS
# ============================================
echo "🔧 Fase 4: Limpiando scripts JS obsoletos..."

# Mover scripts de setup antiguos
mkdir -p scripts/archive
mv check-*.js scripts/archive/ 2>/dev/null
mv cleanup-*.js scripts/archive/ 2>/dev/null
mv create-*.js scripts/archive/ 2>/dev/null
mv debug-*.js scripts/archive/ 2>/dev/null
mv delete-*.js scripts/archive/ 2>/dev/null
mv force-*.js scripts/archive/ 2>/dev/null
mv get-*.js scripts/archive/ 2>/dev/null
mv setup-*.js scripts/archive/ 2>/dev/null
mv test-*.js scripts/archive/ 2>/dev/null
mv verify-*.js scripts/archive/ 2>/dev/null

echo "  ✅ Scripts JS obsoletos movidos a scripts/archive/"
echo ""

# ============================================
# FASE 5: LIMPIAR CARPETAS DE BACKUPS
# ============================================
echo "🗂️  Fase 5: Limpiando carpetas de backups..."

if [ -d "backups" ]; then
    echo "  ❌ Eliminando carpeta backups/"
    rm -rf backups
fi

if [ -d "backup_20240929" ]; then
    echo "  ❌ Eliminando carpeta backup_20240929/"
    rm -rf backup_20240929
fi

echo "  ✅ Carpetas de backups eliminadas"
echo ""

# ============================================
# FASE 6: LIMPIAR ARCHIVOS TEMPORALES
# ============================================
echo "🧹 Fase 6: Limpiando archivos temporales..."

# Eliminar archivos .bak
find . -name "*.bak" -type f -delete 2>/dev/null

# Eliminar temp_file.tsx si existe
rm -f temp_file.tsx

# Eliminar App.tsx.bak
rm -f src/App.tsx.bak

echo "  ✅ Archivos temporales eliminados"
echo ""

# ============================================
# RESUMEN
# ============================================
echo "✅ ¡Limpieza completada!"
echo ""
echo "📊 Resumen:"
echo "  • Backups de componentes eliminados"
echo "  • Documentación organizada en docs/archive/"
echo "  • Scripts SQL consolidados en supabase/migrations/archive/"
echo "  • Scripts JS movidos a scripts/archive/"
echo "  • Carpetas de backups eliminadas"
echo "  • Archivos temporales eliminados"
echo ""
echo "💾 Espacio liberado: ~10-15MB"
echo ""
echo "⚠️  IMPORTANTE: Revisa los cambios antes de hacer commit"
echo "   git status"
echo "   git diff"
echo ""
