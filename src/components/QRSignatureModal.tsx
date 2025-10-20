import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { signatureService } from '../services/signatureService';

interface QRSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  signatureUrl: string;
  signatureId: string;
  signatureType: 'apertura' | 'cierre';
  onSignatureCompleted: (employeeName: string) => void;
}

const QRSignatureModal: React.FC<QRSignatureModalProps> = ({
  isOpen, onClose, signatureUrl, signatureId, signatureType, onSignatureCompleted
}) => {
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [isCompleted, setIsCompleted] = useState(false);

  // Polling para verificar firma
  useEffect(() => {
    if (!isOpen) return;
    const checkInterval = setInterval(async () => {
      const signature = await signatureService.checkSignatureStatus(signatureId);
      if (signature?.status === 'completed') {
        setIsCompleted(true);
        setTimeout(() => {
          onSignatureCompleted(signature.employee_name || 'Empleado');
          onClose();
        }, 2000);
      }
    }, 2000);
    return () => clearInterval(checkInterval);
  }, [isOpen, signatureId]);

  // Timer
  useEffect(() => {
    if (!isOpen || isCompleted) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev <= 1 ? 0 : prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isCompleted]);

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: 'white', borderRadius: '24px', padding: '40px',
        maxWidth: '500px', width: '100%', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'none', border: 'none', cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        {!isCompleted ? (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
              📱 Firma de {signatureType === 'apertura' ? 'Apertura' : 'Cierre'}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <QRCodeSVG value={signatureUrl} size={256} level="H" />
            </div>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Expira en: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 16px' }} />
            <h2>✅ Firma Completada</h2>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default QRSignatureModal;
