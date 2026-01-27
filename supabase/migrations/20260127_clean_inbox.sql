-- Limpiar mensajes antiguos para reiniciar el scraping con filtro estricto
truncate table public.inbox_messages cascade;
-- (Opcional) Limpiar también el dataset si quieres empezar de cero
truncate table public.dataset_attcliente;
