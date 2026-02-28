/**
 * IncidentCreationModal — Unified incident creation form
 * BUG-08: This replaces SmartIncidentModal everywhere.
 * Uses the SAME form / data model as IncidentManagementSystem
 * (incidents table + incident_categories + incident_types).
 */
import React, { useState, useEffect } from 'react';
import { getIncidentCategories, getIncidentTypes, createIncident, type IncidentCategory, type IncidentType } from '../../services/incidentService';
import { useSession } from '../../contexts/SessionContext';
import { notifyIncident } from '../../services/notificationService';
import { devLog } from '../../utils/devLogger';
import { ui } from '../../utils/ui';


interface IncidentCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    centerName?: string;
    centerId?: string;
    initialDescription?: string;
    onIncidentCreated?: (incident: Record<string, unknown>) => void;
}


const IncidentCreationModal: React.FC<IncidentCreationModalProps> = ({
    isOpen,
    onClose,
    centerName = '',
    centerId = '',
    initialDescription = '',
    onIncidentCreated
}) => {
    const { employee } = useSession();
    const [incidentCategories, setIncidentCategories] = useState<IncidentCategory[]>([]);
    const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [formData, setFormData] = useState({
        category_id: '',
        incident_type_id: '',
        title: '',
        description: initialDescription,
        start_date: '',
        end_date: '',
        priority: 'normal' as string,
        clothing_type: '',
        clothing_size: '',
        quantity: 1
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load categories and types when modal opens
    useEffect(() => {
        if (isOpen) {
            loadCategories();
            loadTypes();
            // Reset form
            setSelectedCategory('');
            setFormData({
                category_id: '',
                incident_type_id: '',
                title: '',
                description: initialDescription,
                start_date: '',
                end_date: '',
                priority: 'normal',
                clothing_type: '',
                clothing_size: '',
                quantity: 1
            });
        }
    }, [isOpen, initialDescription]);

    const loadCategories = async () => {
        try {
            const data = await getIncidentCategories();
            setIncidentCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadTypes = async () => {
        try {
            const data = await getIncidentTypes();
            setIncidentTypes(data);
        } catch (error) {
            console.error('Error loading types:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employee?.id) {
            ui.error('Error: No se pudo identificar el empleado');
            return;
        }
        setIsSubmitting(true);

        try {
            const incidentData = {
                employee_id: employee.id,
                incident_type_id: parseInt(formData.incident_type_id),
                title: formData.title,
                description: formData.description,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                priority: formData.priority,
                clothing_type: formData.clothing_type || null,
                clothing_size: formData.clothing_size || null,
                quantity: formData.quantity || null,
                status: 'pending'
            };

            const result = await createIncident(incidentData as Record<string, unknown>);

            if (!result.success) throw new Error(result.error);

            const data = result.data ?? [];
            if (data[0]) {
                const typeName = incidentTypes.find(t => t.id === incidentData.incident_type_id)?.name || 'Incidencia';
                await notifyIncident({
                    incidentId: data[0].id,
                    centerId: employee.center_id,
                    category: typeName,
                    description: incidentData.description,
                    priority: incidentData.priority,
                    reporterName: `${employee.first_name} ${employee.last_name || ''}`
                });

                devLog('✅ Incidencia creada:', data[0]);
                onIncidentCreated?.(data[0]);
            }

            ui.success('✅ Incidencia creada correctamente');
            onClose();
        } catch (error: unknown) {
            console.error('❌ Error creando incidencia:', error);
            ui.error(error instanceof Error ? error.message : 'Error al crear la incidencia');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 16px',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        fontSize: '14px',
        backgroundColor: 'white',
        transition: 'all 0.2s',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
    };

    const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
        e.target.style.borderColor = '#059669';
        e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
    };

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
        e.target.style.borderColor = '#e5e7eb';
        e.target.style.boxShadow = 'none';
    };

    // Get filtered types for selected category
    const filteredTypes = incidentTypes.filter(type => {
        const selectedCategoryData = incidentCategories.find(cat => cat.id.toString() === selectedCategory);
        if (!selectedCategoryData) return false;
        const categoriesWithSameName = incidentCategories.filter(cat => cat.name === selectedCategoryData.name);
        const categoryIds = categoriesWithSameName.map(cat => cat.id);
        return type.category_id && categoryIds.includes(type.category_id);
    });

    const selectedType = incidentTypes.find(t => t.id.toString() === formData.incident_type_id);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{ padding: '32px' }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px'
                    }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#111827',
                            margin: 0
                        }}>
                            ✨ Nueva Incidencia
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '8px',
                                backgroundColor: '#f3f4f6',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px'
                            }}
                        >
                            ❌
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        {/* Categoría */}
                        <div>
                            <label style={labelStyle}>📋 Categoría *</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setFormData({ ...formData, category_id: e.target.value, incident_type_id: '' });
                                }}
                                required
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            >
                                <option value="">Seleccionar categoría...</option>
                                {incidentCategories
                                    .filter((category, index, self) =>
                                        index === self.findIndex(c => c.name === category.name)
                                    )
                                    .map(category => (
                                        <option key={`category-${category.id}`} value={category.id}>
                                            {category.icon} {category.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Tipo de Incidencia */}
                        {selectedCategory && (
                            <div>
                                <label style={labelStyle}>📝 Tipo de Incidencia *</label>
                                <select
                                    value={formData.incident_type_id}
                                    onChange={(e) => setFormData({ ...formData, incident_type_id: e.target.value })}
                                    required
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                >
                                    <option value="">Seleccionar tipo...</option>
                                    {filteredTypes.map(type => (
                                        <option key={`type-${type.id}`} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Título */}
                        <div>
                            <label style={labelStyle}>✏️ Título *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder="Ej: Solicitud de vacaciones agosto"
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label style={labelStyle}>📝 Descripción *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={4}
                                style={{
                                    ...inputStyle,
                                    resize: 'vertical',
                                    minHeight: '100px'
                                }}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder="Describe los detalles de tu solicitud..."
                            />
                        </div>

                        {/* Fechas */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>📅 Fecha de inicio</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>📅 Fecha de fin</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </div>
                        </div>

                        {/* Prioridad */}
                        <div>
                            <label style={labelStyle}>⚡ Prioridad</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            >
                                <option value="low">📝 Baja</option>
                                <option value="normal">📋 Normal</option>
                                <option value="high">⚡ Alta</option>
                                <option value="urgent">🔥 Urgente</option>
                            </select>
                        </div>

                        {/* Campos de vestuario — condicional */}
                        {selectedType?.requires_clothing_details && (
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '12px',
                                border: '2px solid #dcfce7'
                            }}>
                                <h4 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#059669',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    👕 Detalles del Vestuario
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>👕 Tipo de prenda</label>
                                        <select
                                            value={formData.clothing_type}
                                            onChange={(e) => setFormData({ ...formData, clothing_type: e.target.value })}
                                            style={inputStyle}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        >
                                            <option value="">Seleccionar prenda...</option>
                                            <option value="Polo">👕 Polo</option>
                                            <option value="Camiseta entrenamiento personal">🏃 Camiseta entrenamiento personal</option>
                                            <option value="Pantalón corto">🩳 Pantalón corto</option>
                                            <option value="Chándal completo">👔 Chándal completo</option>
                                            <option value="Sudadera frío">🧥 Sudadera frío</option>
                                            <option value="Chaquetón">🧥 Chaquetón</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>📏 Talla</label>
                                        <select
                                            value={formData.clothing_size}
                                            onChange={(e) => setFormData({ ...formData, clothing_size: e.target.value })}
                                            style={inputStyle}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="XS">XS</option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL</option>
                                            <option value="XXXL">XXXL</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>🔢 Cantidad</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                            style={inputStyle}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botones */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            paddingTop: '24px',
                            borderTop: '1px solid #e5e7eb',
                            marginTop: '24px'
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                ❌ Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: isSubmitting ? '#9ca3af' : '#059669',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isSubmitting ? '⏳ Creando...' : '✨ Crear Incidencia'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IncidentCreationModal;
