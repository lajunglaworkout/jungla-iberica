// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

interface Employee {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  centro_id: string;
  activo: boolean;
  centro?: {
    id: string;
    nombre: string;
    ciudad: string;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  employee: Employee | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | { message: string } | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadEmployeeData(session.user.email!);
      }
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadEmployeeData(session.user.email!);
      } else {
        setEmployee(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadEmployeeData = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          centro:centros(*)
        `)
        .eq('email', email)
        .single();

      if (!error && data) {
        setEmployee(data);
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
    }
  };

  // SEC-08: Rate limiting for login attempts
  const loginAttemptsRef = React.useRef<{ timestamps: number[] }>({ timestamps: [] });
  const MAX_LOGIN_ATTEMPTS = 5;
  const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  const signIn = async (email: string, password: string) => {
    const now = Date.now();
    // Clean old attempts outside the window
    loginAttemptsRef.current.timestamps = loginAttemptsRef.current.timestamps.filter(
      t => now - t < RATE_LIMIT_WINDOW_MS
    );

    if (loginAttemptsRef.current.timestamps.length >= MAX_LOGIN_ATTEMPTS) {
      const oldestAttempt = loginAttemptsRef.current.timestamps[0];
      const minutesLeft = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldestAttempt)) / 60000);
      return { error: { message: `Demasiados intentos de inicio de sesión. Intenta de nuevo en ${minutesLeft} minuto(s).` } };
    }

    loginAttemptsRef.current.timestamps.push(now);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    // BUG-02: Clear all state before signing out to prevent stale data/channels
    setEmployee(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, employee, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};