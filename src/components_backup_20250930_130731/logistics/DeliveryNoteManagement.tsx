import React, { useState } from 'react';
import { FileText, CheckCircle, Euro } from 'lucide-react';
import { DeliveryNote, PaymentStatus, LocationType } from '../../types/logistics';
import { getLocationName } from '../../config/logistics';

interface Props {
  userLocation: LocationType;
  userRole: 'admin' | 'manager';
}

export const DeliveryNoteManagement: React.FC<Props> = ({ userLocation, userRole }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending');

  const mockNotes: DeliveryNote[] = [
    {
      id: 'dn-001',
      deliveryNumber: 'ALB-2025-001',
      orderId: 'order-001',
      fromLocation: 'central',
      toLocation: 'sevilla',
      deliveredBy: 'logistica@lajungla.com',
      deliveredAt: '2025-01-20T14:30:00Z',
      receivedBy: 'francisco.giraldez@lajungla.com',
      receivedAt: '2025-01-20T16:45:00Z',
      items: [],
      totalAmount: 102.50,
      isReceived: true,
      paymentStatus: 'pendiente'
    }
  ];

  const filteredNotes = mockNotes.filter(note => 
    activeTab === 'pending' ? note.paymentStatus === 'pendiente' : note.paymentStatus === 'pagado'
  );

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1>Albaranes y Facturación</h1>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
        {['pending', 'paid'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === tab ? '2px solid #059669' : '2px solid transparent',
              color: activeTab === tab ? '#059669' : '#6b7280',
              cursor: 'pointer'
            }}
          >
            {tab === 'pending' ? 'Pendientes Pago' : 'Pagados'}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredNotes.map(note => (
          <div key={note.id} style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{note.deliveryNumber}</h3>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {getLocationName(note.fromLocation)} → {getLocationName(note.toLocation)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669' }}>
                  €{note.totalAmount.toFixed(2)}
                </div>
                {note.paymentStatus === 'pendiente' && userRole === 'admin' && (
                  <button style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    Marcar Pagado
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
