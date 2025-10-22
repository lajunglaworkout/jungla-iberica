-- Eliminar políticas existentes si hay problemas
DROP POLICY IF EXISTS "Permitir subir documentos 76ydll_0" ON storage.objects;
DROP POLICY IF EXISTS "Permitir descargar documentos 78ydll_0" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminar documentos" ON storage.objects;

-- Política 1: Permitir a usuarios autenticados SUBIR archivos
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'EMPLOYEE-DOCUMENTS');

-- Política 2: Permitir a usuarios autenticados VER/DESCARGAR archivos
CREATE POLICY "Allow authenticated downloads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'EMPLOYEE-DOCUMENTS');

-- Política 3: Permitir a usuarios autenticados ACTUALIZAR archivos
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'EMPLOYEE-DOCUMENTS')
WITH CHECK (bucket_id = 'EMPLOYEE-DOCUMENTS');

-- Política 4: Permitir a usuarios autenticados ELIMINAR archivos
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'EMPLOYEE-DOCUMENTS');

-- Verificar que el bucket existe y es público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'EMPLOYEE-DOCUMENTS';
