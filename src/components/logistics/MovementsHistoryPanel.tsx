import React, { useState, useEffect } from 'react';
import { Calendar, Filter, ArrowUpRight, ArrowDownLeft, RefreshCw, Search, User, MapPin } from 'lucide-react';
import inventoryMovementService from '../../services/inventoryMovementService';

interface MovementsHistoryPanelProps {
    initialCenterId?: number | 'all';
}

const MovementsHistoryPanel: React.FC<MovementsHistoryPanelProps> = ({ initialCenterId = 'all' }) => {
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState<number | 'all'>(initialCenterId);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Últimos 30 días
        end: new Date().toISOString().split('T')[0]
    });
    const [searchTerm, setSearchTerm] = useState('');

    const loadMovements = async () => {
        setLoading(true);
        const filters: any = {
            limit: 100
        };

        if (selectedCenter !== 'all') {
            filters.center_id = selectedCenter;
        }

        if (dateRange.start) {
            filters.startDate = new Date(dateRange.start).toISOString();
        }

        if (dateRange.end) {
            // Ajustar al final del día
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            filters.endDate = endDate.toISOString();
        }

        const result = await inventoryMovementService.getMovements(filters);

        if (result.success) {
            setMovements(result.movements || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadMovements();
    }, [selectedCenter, dateRange]);

    const getCenterName = (id: number) => {
        const map: Record<number, string> = { 1: 'Central', 9: 'Sevilla', 10: 'Jerez', 11: 'Puerto' };
        return map[id] || 'Desconocido';
    };

    const getTypeLabel = (type: string) => {
        const map: Record<string, { label: string; color: string; icon: any }> = {
            'adjustment': { label: 'Ajuste Manual', color: '#f59e0b', icon: RefreshCw },
            'purchase': { label: 'Compra', color: '#10b981', icon: ArrowDownLeft },
            'consumption': { label: 'Consumo', color: '#ef4444', icon: ArrowUpRight },
            'return': { label: 'Devolución', color: '#3b82f6', icon: ArrowDownLeft },
            'initial': { label: 'Inventario Inicial', color: '#6b7280', icon: Package }
        };
        return map[type] || { label: type, color: '#6b7280', icon: RefreshCw };
    };

    const filteredMovements = movements.filter(m =>
        m.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📜 Historial de Movimientos
                    </h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                        Registro de auditoría de todos los cambios de inventario
                    </p>
                </div>

                <button
                    onClick={loadMovements}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <RefreshCw size={16} /> Actualizar
                </button>
            </div>

            {/* Filtros */}
            <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'end'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Centro</label>
                    <select
                        value={selectedCenter}
                        onChange={(e) => setSelectedCenter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '150px' }}
                    >
                        <option value="all">Todos los centros</option>
                        <option value={1}>Central</option>
                        <option value={9}>Sevilla</option>
                        <option value={10}>Jerez</option>
                        <option value={11}>Puerto</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Desde</label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Hasta</label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Buscar</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Buscar por producto, usuario o motivo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '8px 12px 8px 36px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                width: '100%'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Fecha / Centro</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Producto</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Tipo</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Cambio</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Usuario / Motivo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    Cargando movimientos...
                                </td>
                            </tr>
                        ) : filteredMovements.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    No se encontraron movimientos en este periodo.
                                </td>
                            </tr>
                        ) : (
                            filteredMovements.map((movement) => {
                                const typeInfo = getTypeLabel(movement.type);
                                const TypeIcon = typeInfo.icon;

                                return (
                                    <tr key={movement.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <Calendar size={14} color="#6b7280" />
                                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                                    {new Date(movement.created_at).toLocaleDateString('es-ES')}
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    {new Date(movement.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MapPin size={12} color="#9ca3af" />
                                                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    {getCenterName(movement.center_id)}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontWeight: '500', color: '#111827' }}>{movement.item_name}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{movement.item_category}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: `${typeInfo.color}15`,
                                                color: typeInfo.color
                                            }}>
                                                <TypeIcon size={14} />
                                                {typeInfo.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <div style={{
                                                fontWeight: '600',
                                                color: movement.quantity_change > 0 ? '#10b981' : '#ef4444',
                                                fontSize: '16px'
                                            }}>
                                                {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                {movement.previous_quantity} ➜ {movement.new_quantity}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                <User size={14} color="#6b7280" />
                                                <span style={{ fontSize: '13px', color: '#374151' }}>
                                                    {movement.user_name || movement.user_id}
                                                </span>
                                            </div>
                                            {movement.reason && (
                                                <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                                                    "{movement.reason}"
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MovementsHistoryPanel;
