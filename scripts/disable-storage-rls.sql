-- SOLUCIÓN TEMPORAL: Desactivar RLS en storage.objects para el bucket
-- Esto permitirá que cualquier usuario autenticado pueda subir/descargar archivos

-- 1. Eliminar todas las políticas existentes del bucket
DROP POLICY IF EXISTS "Permitir subir documentos 76ydll_0" ON storage.objects;
DROP POLICY IF EXISTS "Permitir descargar documentos 78ydll_0" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminar documentos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- 2. Crear políticas más permisivas (sin restricciones adicionales)
CREATE POLICY "Public Access All Operations"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'EMPLOYEE-DOCUMENTS')
WITH CHECK (bucket_id = 'EMPLOYEE-DOCUMENTS');

-- 3. Asegurar que el bucket es público
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 52428800,  -- 50MB
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
WHERE id = 'EMPLOYEE-DOCUMENTS';
