-- Verificar estructura completa de tablas de revisiones
-- Fecha: 2025-10-23

-- Ver estructura de quarterly_reviews
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quarterly_reviews' 
ORDER BY ordinal_position;

-- Ver estructura de quarterly_review_items
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quarterly_review_items' 
ORDER BY ordinal_position;

-- Ver estructura de review_notifications
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'review_notifications' 
ORDER BY ordinal_position;

-- Ver datos existentes en quarterly_reviews
SELECT * FROM quarterly_reviews ORDER BY id DESC LIMIT 5;

-- Ver datos existentes en quarterly_review_items
SELECT * FROM quarterly_review_items ORDER BY id DESC LIMIT 5;

-- Ver datos existentes en review_notifications
SELECT * FROM review_notifications ORDER BY id DESC LIMIT 5;
