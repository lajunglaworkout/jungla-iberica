-- 1. Eliminar el trigger actual para poder reemplazar su función
DROP TRIGGER IF EXISTS update_inventory_stock_trigger ON public.inventory_movements;

-- 2. Sobrescribir la función con los nombres de columna correctos (cantidad_actual y nombre_item)
CREATE OR REPLACE FUNCTION public.update_inventory_stock()
RETURNS trigger AS $$
BEGIN
    -- Actualizar cantidad en inventory_items
    UPDATE public.inventory_items 
    SET cantidad_actual = NEW.new_quantity,
        updated_at = NOW()
    WHERE id = NEW.inventory_item_id;
    
    -- Verificar alertas de stock
    INSERT INTO public.stock_alerts (inventory_item_id, alert_type, message)
    SELECT 
        ii.id,
        CASE 
            WHEN NEW.new_quantity = 0 THEN 'out_of_stock'
            WHEN NEW.new_quantity <= ii.min_stock THEN 'low_stock'
        END,
        CASE 
            WHEN NEW.new_quantity = 0 THEN 'Producto sin stock: ' || ii.nombre_item
            WHEN NEW.new_quantity <= ii.min_stock THEN 'Stock bajo para: ' || ii.nombre_item || ' (Cantidad: ' || NEW.new_quantity || ', Mínimo: ' || ii.min_stock || ')'
        END
    FROM public.inventory_items ii
    WHERE ii.id = NEW.inventory_item_id
    AND (NEW.new_quantity = 0 OR NEW.new_quantity <= ii.min_stock)
    AND NOT EXISTS (
        SELECT 1 FROM public.stock_alerts sa 
        WHERE sa.inventory_item_id = ii.id 
        AND sa.alert_type IN ('out_of_stock', 'low_stock')
        AND sa.is_resolved = false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Volver a crear el trigger anclado a la nueva función
CREATE TRIGGER update_inventory_stock_trigger
AFTER INSERT ON public.inventory_movements
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_stock();
