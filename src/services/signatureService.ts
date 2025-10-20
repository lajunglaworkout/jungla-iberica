// src/services/signatureService.ts
import { supabase } from '../lib/supabase';

export interface PendingSignature {
  id?: number;
  signature_id: string;
  center_id: string;
  center_name: string;
  signature_type: 'apertura' | 'cierre';
  status: 'pending' | 'completed' | 'expired';
  employee_id?: string;
  employee_name?: string;
  signed_at?: string;
  expires_at: string;
  created_at?: string;
}

class SignatureService {
  /**
   * Crear una solicitud de firma pendiente
   */
  async createPendingSignature(
    signatureId: string,
    centerId: string,
    centerName: string,
    signatureType: 'apertura' | 'cierre'
  ): Promise<PendingSignature | null> {
    try {
      // La firma expira en 10 minutos
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      const pendingSignature = {
        signature_id: signatureId,
        center_id: centerId,
        center_name: centerName,
        signature_type: signatureType,
        status: 'pending' as const,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('pending_signatures')
        .insert([pendingSignature])
        .select()
        .single();

      if (error) {
        console.error('Error creando firma pendiente:', error);
        throw error;
      }

      console.log('✅ Firma pendiente creada:', data);
      return data;
    } catch (error) {
      console.error('Error en createPendingSignature:', error);
      return null;
    }
  }

  /**
   * Obtener firma pendiente por ID
   */
  async getPendingSignature(signatureId: string): Promise<PendingSignature | null> {
    try {
      const { data, error } = await supabase
        .from('pending_signatures')
        .select('*')
        .eq('signature_id', signatureId)
        .eq('status', 'pending')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error obteniendo firma pendiente:', error);
        throw error;
      }

      // Verificar si expiró
      if (data && new Date(data.expires_at) < new Date()) {
        await this.expireSignature(signatureId);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error en getPendingSignature:', error);
      return null;
    }
  }

  /**
   * Completar una firma pendiente
   */
  async completeSignature(
    signatureId: string,
    employeeId: string,
    employeeName: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pending_signatures')
        .update({
          status: 'completed',
          employee_id: employeeId,
          employee_name: employeeName,
          signed_at: new Date().toISOString()
        })
        .eq('signature_id', signatureId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error completando firma:', error);
        throw error;
      }

      console.log('✅ Firma completada:', signatureId);
      return true;
    } catch (error) {
      console.error('Error en completeSignature:', error);
      return false;
    }
  }

  /**
   * Marcar firma como expirada
   */
  async expireSignature(signatureId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pending_signatures')
        .update({ status: 'expired' })
        .eq('signature_id', signatureId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error expirando firma:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error en expireSignature:', error);
      return false;
    }
  }

  /**
   * Verificar estado de firma (polling)
   */
  async checkSignatureStatus(signatureId: string): Promise<PendingSignature | null> {
    try {
      const { data, error } = await supabase
        .from('pending_signatures')
        .select('*')
        .eq('signature_id', signatureId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error verificando estado de firma:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error en checkSignatureStatus:', error);
      return null;
    }
  }

  /**
   * Limpiar firmas expiradas (mantenimiento)
   */
  async cleanupExpiredSignatures(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('pending_signatures')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('expires_at', now)
        .select();

      if (error) {
        console.error('Error limpiando firmas expiradas:', error);
        throw error;
      }

      const count = data?.length || 0;
      console.log(`🧹 ${count} firmas expiradas limpiadas`);
      return count;
    } catch (error) {
      console.error('Error en cleanupExpiredSignatures:', error);
      return 0;
    }
  }
}

export const signatureService = new SignatureService();
export default signatureService;
