import React, { useState } from 'react';
import { Users, Plus, Search, Star, MapPin, Phone, Mail } from 'lucide-react';
import { Supplier, LocationType, ItemCategory } from '../../types/logistics';
import { INVENTORY_CATEGORIES, getCategoryIcon } from '../../config/logistics';

interface Props {
  userLocation: LocationType;
  canEdit: boolean;
}

export const SupplierDirectory: React.FC<Props> = ({ userLocation, canEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');

  const mockSuppliers: Supplier[] = [
    {
      id: 'sup-001',
      name: 'Decathlon Wholesale',
      contactPerson: 'María González',
      email: 'wholesale@decathlon.es',
      phone: '+34 900 123 456',
      address: 'Polígono Industrial Norte, Nave 15',
      city: 'Sevilla',
      postalCode: '41015',
      taxId: 'B12345678',
      paymentTerms: '30 días',
      isLocal: false,
      availableLocations: ['central', 'sevilla', 'jerez', 'puerto'],
      categories: ['material_deportivo', 'vestuario', 'merchandising'],
      isActive: true,
      rating: 4.5,
      notes: 'Proveedor principal de material deportivo',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 'sup-002',
      name: 'Limpieza Profesional SL',
      contactPerson: 'Juan Martín',
      email: 'pedidos@limpiezapro.com',
      phone: '+34 955 987 654',
      address: 'Calle Industrial 23',
      city: 'Sevilla',
      postalCode: '41020',
      taxId: 'B87654321',
      paymentTerms: '15 días',
      isLocal: true,
      availableLocations: ['sevilla'],
      categories: ['consumibles'],
      isActive: true,
      rating: 4.2,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z'
    }
  ];

  const filteredSuppliers = mockSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || supplier.categories.includes(selectedCategory);
    const servesLocation = supplier.availableLocations.includes(userLocation);
    
    return matchesSearch && matchesCategory && servesLocation;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        style={{
          color: i < rating ? '#fbbf24' : '#d1d5db',
          fill: i < rating ? '#fbbf24' : 'none'
        }}
      />
    ));
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.875rem', fontWeight: 'bold' }}>
            Directorio de Proveedores
          </h1>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Gestión de proveedores y contactos comerciales
          </p>
        </div>
        {canEdit && (
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            <Plus size={16} />
            Nuevo Proveedor
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', minWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ItemCategory | 'all')}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Todas las categorías</option>
          {INVENTORY_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de proveedores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
                  {supplier.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {renderStars(supplier.rating || 0)}
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    ({supplier.rating?.toFixed(1)})
                  </span>
                </div>
              </div>
              {supplier.isLocal && (
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  Local
                </span>
              )}
            </div>

            {/* Información de contacto */}
            <div style={{ marginBottom: '1rem' }}>
              {supplier.contactPerson && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Users size={14} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '0.875rem' }}>{supplier.contactPerson}</span>
                </div>
              )}
              {supplier.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Phone size={14} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '0.875rem' }}>{supplier.phone}</span>
                </div>
              )}
              {supplier.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Mail size={14} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '0.875rem' }}>{supplier.email}</span>
                </div>
              )}
              {supplier.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '0.875rem' }}>{supplier.city}</span>
                </div>
              )}
            </div>

            {/* Categorías */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Categorías:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {supplier.categories.map(category => (
                  <span
                    key={category}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      backgroundColor: '#f3f4f6',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem'
                    }}
                  >
                    <span>{getCategoryIcon(category)}</span>
                    {INVENTORY_CATEGORIES.find(cat => cat.id === category)?.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Condiciones de pago */}
            {supplier.paymentTerms && (
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '0.75rem', 
                borderRadius: '4px',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <strong>Condiciones:</strong> {supplier.paymentTerms}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <Users size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>No hay proveedores</h3>
          <p style={{ margin: 0, color: '#9ca3af' }}>
            No se encontraron proveedores que coincidan con los filtros
          </p>
        </div>
      )}
    </div>
  );
};
