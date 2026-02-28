import { supabase } from '../lib/supabase';

export interface CXMessage {
  status: string;
  created_at: string;
  reply_sent_at: string | null;
  agent_proposal?: { intent?: string; confidence?: number } | null;
  [key: string]: unknown;
}

export interface CXInboxStats {
  messages: CXMessage[];
  trainingCount: number;
}

export const getCXInboxStats = async (): Promise<CXInboxStats> => {
  try {
    const [messagesResult, trainingResult] = await Promise.all([
      supabase.from('inbox_messages').select('status, created_at, reply_sent_at, agent_proposal'),
      supabase.from('dataset_attcliente').select('*', { count: 'exact', head: true })
    ]);

    return {
      messages: (messagesResult.data ?? []) as CXMessage[],
      trainingCount: trainingResult.count ?? 0
    };
  } catch {
    return { messages: [], trainingCount: 0 };
  }
};

export const getInboxMessages = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('inbox_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const saveTrainingData = async (data: Record<string, unknown>): Promise<void> => {
  try {
    await supabase.from('dataset_attcliente').insert(data);
  } catch (e) {
    console.warn('No se pudo guardar entrenamiento (RLS)', e);
  }
};

export const saveInboxReply = async (id: string, payload: Record<string, unknown>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('inbox_messages').update(payload).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
};
