#!/bin/bash

# Script para listar todas las tablas en Supabase

SUPABASE_URL="https://gfnjlmfziczimaohgkct.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbmpsbWZ6aWN6aW1hb2hna2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDEzNzQ2OCwiZXhwIjoyMDY5NzEzNDY4fQ._UBAs1jxVzWcgYkYExS2iYPStl9KdQT1oBQby4ThtDQ"

echo "🔍 Listando todas las tablas en Supabase..."
echo ""

# Lista de tablas comunes a verificar
TABLES=(
  "employees"
  "empleados"
  "centros"
  "centers"
  "daily_checklists"
  "checklist_incidents"
  "objetivos"
  "reuniones"
  "tareas"
  "notificaciones"
  "inventory_items"
  "suppliers"
  "supplier_orders"
  "supplier_order_items"
  "product_categories"
  "inventory_movements"
  "stock_alerts"
  "departments"
  "departamentos"
)

echo "📋 Tablas encontradas:"
echo ""

for table in "${TABLES[@]}"; do
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X GET "${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}")
  
  if [ "$response" = "200" ] || [ "$response" = "206" ]; then
    # Obtener el conteo de registros
    count=$(curl -s \
      -X GET "${SUPABASE_URL}/rest/v1/${table}?select=count" \
      -H "apikey: ${SERVICE_KEY}" \
      -H "Authorization: Bearer ${SERVICE_KEY}" \
      -H "Prefer: count=exact" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    
    printf "✅ %-30s (registros: %s)\n" "$table" "${count:-0}"
  fi
done

echo ""
echo "✅ Listado completado"
