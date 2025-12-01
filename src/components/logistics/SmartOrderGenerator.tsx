import React, { useState, useEffect } from 'react';
import { ShoppingCart, Copy, Check, AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';

interface SmartOrderGeneratorProps {
    initialCenterId?: number | 'all';
}

const SmartOrderGenerator: React.FC<SmartOrderGeneratorProps> = ({ initialCenterId = 'all' }) => {
    const { inventoryItems, loading, refetch } = useInventory();
    const [selectedCenter, setSelectedCenter] = useState<number | 'all'>(initialCenterId);
    const [generatedText, setGeneratedText] = useState('');
    const [copied, setCopied] = useState(false);

    // Filtrar items que necesitan reposición
    const itemsToOrder = inventoryItems.filter(item => {
        // Filtro por centro
        if (selectedCenter !== 'all') {
            const centerMap: Record<string, number> = { central: 1, sevilla: 9, jerez: 10, puerto: 11 };
            if (centerMap[item.center] !== selectedCenter) return false;
        }

        // Solo items con stock bajo o agotado
        return item.quantity <= item.min_stock;
    }).map(item => ({
        ...item,
        suggestedQuantity: Math.max(0, item.max_stock - item.quantity)
    }));

    const getCenterName = (id: number | 'all') => {
        if (id === 'all') return 'Todos los Centros';
        const map: Record<number, string> = { 1: 'Central', 9: 'Sevilla', 10: 'Jerez', 11: 'Puerto' };
        return map[id] || 'Desconocido';
    };

    const generateOrderText = () => {
        const centerName = getCenterName(selectedCenter);
        const date = new Date().toLocaleDateString('es-ES');

        let text = `📋 SOLICITUD DE PEDIDO - ${centerName.toUpperCase()}\n`;
        text += `📅 Fecha: ${date}\n\n`;
        text += `Hola,\n\nNecesitamos reponer los siguientes artículos que están bajo mínimos:\n\n`;

        if (itemsToOrder.length === 0) {
            text += "(No hay artículos bajo mínimos actualmente)";
        } else {
            // Agrupar por proveedor
            const bySupplier: Record<string, typeof itemsToOrder> = {};

            itemsToOrder.forEach(item => {
                const supplier = item.supplier || 'Sin Proveedor';
                if (!bySupplier[supplier]) bySupplier[supplier] = [];
                bySupplier[supplier].push(item);
            });

            Object.entries(bySupplier).forEach(([supplier, items]) => {
                text += `🏭 PROVEEDOR: ${supplier}\n`;
                items.forEach(item => {
                    text += `- ${item.name} (${item.size || 'Única'}): ${item.suggestedQuantity} uds (Stock actual: ${item.quantity})\n`;
                });
                text += '\n';
            });
        }

        text += `\nQuedo a la espera de confirmación.\n\nSaludos,\nEquipo La Jungla`;
        setGeneratedText(text);
        setCopied(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        generateOrderText();
    }, [itemsToOrder.length, selectedCenter]);

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🤖 Generador de Pedidos Inteligente
                    </h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                        Calcula automáticamente qué necesitas pedir basándose en el stock mínimo y máximo.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        value={selectedCenter}
                        onChange={(e) => setSelectedCenter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    >
                        <option value="all">Todos los centros</option>
                        <option value={1}>Central</option>
                        <option value={9}>Sevilla</option>
                        <option value={10}>Jerez</option>
                        <option value={11}>Puerto</option>
                    </select>

                    <button
                        onClick={() => refetch()}
                        style={{
                            padding: '8px',
                            backgroundColor: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                        title="Recargar inventario"
                    >
                        <RefreshCw size={20} color="#6b7280" />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Columna Izquierda: Lista de Items */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '600px' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>📦 Artículos a Reponer ({itemsToOrder.length})</h3>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Basado en Stock Mínimo</span>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
                        {loading ? (
                            <p style={{ textAlign: 'center', color: '#6b7280' }}>Cargando inventario...</p>
                        ) : itemsToOrder.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#10b981' }}>
                                <Check size={48} style={{ marginBottom: '1rem' }} />
                                <p>¡Todo en orden! No hay artículos bajo mínimos.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {itemsToOrder.map(item => (
                                    <div key={item.id} style={{
                                        padding: '12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: item.quantity === 0 ? '#fee2e2' : 'white'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#374151' }}>{item.name}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {item.supplier} • {item.center.toUpperCase()}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold' }}>
                                                Stock: {item.quantity} / Min: {item.min_stock}
                                            </div>
                                            <div style={{ color: '#059669', fontWeight: '600', fontSize: '14px' }}>
                                                Pedir: {item.suggestedQuantity}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Texto Generado */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={18} /> Texto para Email
                            </h3>
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: copied ? '#10b981' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? '¡Copiado!' : 'Copiar Texto'}
                            </button>
                        </div>

                        <textarea
                            value={generatedText}
                            readOnly
                            style={{
                                width: '100%',
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                resize: 'none',
                                backgroundColor: '#f8fafc',
                                minHeight: '400px'
                            }}
                        />

                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '1rem', textAlign: 'center' }}>
                            💡 Copia este texto y pégalo en tu cliente de correo habitual para enviar los pedidos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartOrderGenerator;
