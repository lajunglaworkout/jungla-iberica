import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { signatureService } from '../services/signatureService';

const SignaturePage: React.FC = () => {
  const { signatureId } = useParams<{ signatureId: string }>();
  const navigate = useNavigate();
  const { employee } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [signatureData, setSignatureData] = useState<any>(null);

  useEffect(() => {
    loadSignatureData();
  }, [signatureId]);

  const loadSignatureData = async () => {
    if (!signatureId) {
      setError('ID de firma inválido');
      setLoading(false);
      return;
    }

    try {
      const signature = await signatureService.getPendingSignature(signatureId);
      
      if (!signature) {
        setError('Firma no encontrada o expirada');
        setLoading(false);
        return;
      }

      setSignatureData(signature);
      setLoading(false);
    } catch (err) {
      console.error('Error cargando firma:', err);
      setError('Error al cargar la firma');
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!employee?.id || !signatureId) {
      setError('Debes iniciar sesión para firmar');
      return;
    }

    setLoading(true);
    try {
      const completed = await signatureService.completeSignature(
        signatureId,
        employee.id,
        employee.name || employee.email
      );

      if (completed) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError('Error al completar la firma');
      }
    } catch (err) {
      console.error('Error firmando:', err);
      setError('Error al procesar la firma');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !signatureData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
        <AlertTriangle size={64} color="#ef4444" />
        <h1 style={{ marginTop: '24px', fontSize: '24px', fontWeight: '700' }}>Error</h1>
        <p style={{ color: '#666', textAlign: 'center' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} style={{
          marginTop: '24px', padding: '12px 24px', backgroundColor: '#3b82f6',
          color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
        }}>
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CheckCircle size={64} color="#22c55e" />
        <h1 style={{ marginTop: '24px', fontSize: '24px', fontWeight: '700' }}>✅ Firma Completada</h1>
        <p style={{ color: '#666' }}>Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
          Firma de {signatureData?.signature_type === 'apertura' ? 'Apertura' : 'Cierre'}
        </h1>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '8px' }}>
          Centro: <strong>{signatureData?.center_name}</strong>
        </p>
        <p style={{ fontSize: '14px', color: '#999', marginBottom: '32px' }}>
          Empleado: {employee?.name || employee?.email}
        </p>
        
        <button
          onClick={handleSign}
          disabled={loading}
          style={{
            width: '100%', padding: '16px', fontSize: '18px', fontWeight: '600',
            backgroundColor: '#22c55e', color: 'white', border: 'none',
            borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Firmando...' : '✍️ Confirmar Firma'}
        </button>
      </div>
    </div>
  );
};

export default SignaturePage;
